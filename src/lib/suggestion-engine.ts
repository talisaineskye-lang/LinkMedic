/**
 * Suggestion Engine v2.0
 *
 * "Extract, Don't Hallucinate" approach:
 * 1. Extract keywords from original product context
 * 2. Search Amazon for real products
 * 3. Parse organic results (skip ads)
 * 4. Semantic verification to prevent category mismatches
 */

import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import { extractAsin, appendAffiliateTag } from "./link-audit-engine";

// ============================================
// CONFIGURATION
// ============================================

const MAX_SEARCH_RESULTS = 5;

// ============================================
// REGION DETECTION
// ============================================

interface AmazonRegion {
  domain: string;
  searchDomain: string;
  region: string;
  countryCode: string;
}

/**
 * Detect Amazon region from URL
 * Returns the appropriate domain and country code for search
 */
function getAmazonRegion(url: string): AmazonRegion {
  if (url.includes("amazon.co.uk")) return { domain: "amazon.co.uk", searchDomain: "amazon.co.uk", region: "UK", countryCode: "gb" };
  if (url.includes("amazon.ca")) return { domain: "amazon.ca", searchDomain: "amazon.ca", region: "CA", countryCode: "ca" };
  if (url.includes("amazon.de")) return { domain: "amazon.de", searchDomain: "amazon.de", region: "DE", countryCode: "de" };
  if (url.includes("amazon.fr")) return { domain: "amazon.fr", searchDomain: "amazon.fr", region: "FR", countryCode: "fr" };
  if (url.includes("amazon.es")) return { domain: "amazon.es", searchDomain: "amazon.es", region: "ES", countryCode: "es" };
  if (url.includes("amazon.it")) return { domain: "amazon.it", searchDomain: "amazon.it", region: "IT", countryCode: "it" };
  if (url.includes("amazon.com.au")) return { domain: "amazon.com.au", searchDomain: "amazon.com.au", region: "AU", countryCode: "au" };
  if (url.includes("amazon.co.jp")) return { domain: "amazon.co.jp", searchDomain: "amazon.co.jp", region: "JP", countryCode: "jp" };
  if (url.includes("amazon.in")) return { domain: "amazon.in", searchDomain: "amazon.in", region: "IN", countryCode: "in" };
  if (url.includes("amazon.com.mx")) return { domain: "amazon.com.mx", searchDomain: "amazon.com.mx", region: "MX", countryCode: "mx" };
  if (url.includes("amazon.com.br")) return { domain: "amazon.com.br", searchDomain: "amazon.com.br", region: "BR", countryCode: "br" };
  if (url.includes("amazon.nl")) return { domain: "amazon.nl", searchDomain: "amazon.nl", region: "NL", countryCode: "nl" };
  if (url.includes("amazon.se")) return { domain: "amazon.se", searchDomain: "amazon.se", region: "SE", countryCode: "se" };
  if (url.includes("amazon.pl")) return { domain: "amazon.pl", searchDomain: "amazon.pl", region: "PL", countryCode: "pl" };
  // Default to US
  return { domain: "amazon.com", searchDomain: "amazon.com", region: "US", countryCode: "us" };
}

// Initialize Anthropic client lazily
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

// ============================================
// URL RESOLUTION (for shortened links)
// ============================================

/**
 * Resolve shortened Amazon URLs to full product URLs
 * Works for amzn.to, a.co, and other Amazon shorteners
 */
async function resolveAmazonUrl(url: string): Promise<{ resolved: string; asin: string | null }> {
  const shortDomains = ['amzn.to', 'a.co', 'amzn.com'];
  const isShortened = shortDomains.some(domain => url.includes(domain));

  if (!isShortened) {
    return { resolved: url, asin: extractAsin(url) };
  }

  console.log(`[Suggestion] Resolving shortened URL: ${url}`);

  try {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) {
      console.error("[Suggestion] No SCRAPINGBEE_API_KEY for URL resolution");
      return { resolved: url, asin: null };
    }

    // Use ScrapingBee to follow redirect
    const params = new URLSearchParams({
      api_key: apiKey,
      url: url,
      premium_proxy: 'true',
      country_code: 'us',
      render_js: 'false',
    });

    const response = await fetch(
      `https://app.scrapingbee.com/api/v1/?${params.toString()}`,
      { method: 'GET', redirect: 'follow' }
    );

    if (!response.ok) {
      console.error(`[Suggestion] URL resolution failed: ${response.status}`);
      return { resolved: url, asin: null };
    }

    // Get the final URL after redirects from Spb-Resolved-Url header
    const finalUrl = response.headers.get('Spb-Resolved-Url') || url;
    const html = await response.text();

    // Try to extract ASIN from final URL or page content
    let asin = extractAsin(finalUrl);

    // Fallback: look for ASIN in page HTML
    if (!asin) {
      const asinMatch = html.match(/\/dp\/([A-Z0-9]{10})/i);
      asin = asinMatch ? asinMatch[1] : null;
    }

    console.log(`[Suggestion] Resolved ${url} → ${finalUrl} (ASIN: ${asin})`);

    return { resolved: finalUrl, asin };
  } catch (error) {
    console.error('[Suggestion] URL resolution failed:', error);
    return { resolved: url, asin: null };
  }
}

interface ProductInfo {
  title: string | undefined;
  price: string | undefined;
}

/**
 * Fetch product title and price from a product page
 * Used to get original product info for better keyword extraction and price comparison
 */
async function fetchProductInfo(productUrl: string, region: AmazonRegion): Promise<ProductInfo> {
  try {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) return { title: undefined, price: undefined };

    console.log(`[Suggestion] Fetching product info from: ${productUrl}`);

    const params = new URLSearchParams({
      api_key: apiKey,
      url: productUrl,
      premium_proxy: 'true',
      country_code: region.countryCode,
      render_js: 'false',
    });

    const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params.toString()}`);

    if (!response.ok) {
      console.error(`[Suggestion] Product fetch failed: ${response.status}`);
      return { title: undefined, price: undefined };
    }

    const html = await response.text();

    // Extract title and price from product page
    const $ = cheerio.load(html);

    // Try multiple selectors for product title
    const title =
      $('#productTitle').text().trim() ||
      $('h1.product-title-word-break').text().trim() ||
      $('span.product-title-word-break').text().trim() ||
      undefined;

    // Try multiple selectors for price
    const price =
      $(".a-price .a-offscreen").first().text().trim() ||
      $("#priceblock_ourprice").text().trim() ||
      $("#priceblock_dealprice").text().trim() ||
      $(".a-price-whole").first().text().trim() ||
      undefined;

    if (title) {
      console.log(`[Suggestion] Found product title: "${title.slice(0, 60)}..."`);
    }
    if (price) {
      console.log(`[Suggestion] Found original price: ${price}`);
    }

    return { title, price };
  } catch (error) {
    console.error('[Suggestion] Product info fetch error:', error);
    return { title: undefined, price: undefined };
  }
}


// ============================================
// TYPES
// ============================================

export interface ProductMatch {
  title: string;
  asin: string;
  url: string;
  price: string | null;
  imageUrl: string | null;
  rating: string | null;
  reviewCount: string | null;
  isSponsored: boolean;
}

export interface SemanticMatch {
  product: ProductMatch;
  confidenceScore: number;
  matchReason: string;
  categoryMatch: boolean;
  brandMatch: boolean;
}

export interface SuggestionResult {
  success: boolean;
  originalProductName: string | null;
  searchQuery: string | null;
  bestMatch: SemanticMatch | null;
  alternativeMatches: SemanticMatch[];
  error?: string;
}

// ============================================
// STEP 1: KEYWORD EXTRACTION (LLM)
// ============================================

interface ExtractedKeywords {
  productName: string;
  brand: string | null;
  category: string;
  searchQuery: string;
}

/**
 * Extract search keywords from an actual Amazon product title
 * This is the ONLY reliable source - video context is not useful
 */
async function extractKeywordsFromProductTitle(
  productTitle: string
): Promise<ExtractedKeywords | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Extract search info from this Amazon product title:

"${productTitle}"

Return JSON only:
{
  "productName": "cleaned product name",
  "brand": "brand or null",
  "category": "Webcam/Headset/Mouse/Keyboard/Monitor/Microphone/Mouse Pad/etc",
  "searchQuery": "3-5 word Amazon search to find similar products"
}

Example:
Input: "Logitech G440 Hard Gaming Mouse Pad, Optimized for Gaming Sensors..."
Output: {"productName": "Logitech G440 Mouse Pad", "brand": "Logitech", "category": "Mouse Pad", "searchQuery": "logitech gaming mouse pad"}`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    console.log(`[Suggestion] Extracted keywords:`, parsed);

    return {
      productName: parsed.productName || productTitle,
      brand: parsed.brand || null,
      category: parsed.category || "Unknown",
      searchQuery: parsed.searchQuery || productTitle.slice(0, 50),
    };
  } catch (error) {
    console.error("[Suggestion] Keyword extraction error:", error);
    return null;
  }
}

// ============================================
// STEP 2: AMAZON SEARCH (ORGANIC ONLY)
// ============================================

/**
 * Fetch Amazon search results via ScrapingBee
 */
async function fetchAmazonSearch(query: string, region: AmazonRegion): Promise<string | null> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    console.error("[Suggestion] No SCRAPINGBEE_API_KEY configured");
    return null;
  }

  const searchUrl = `https://www.${region.searchDomain}/s?k=${encodeURIComponent(query)}`;
  console.log(`[Suggestion] Searching ${region.region} Amazon: ${searchUrl}`);

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      url: searchUrl,
      premium_proxy: "true",
      country_code: region.countryCode,
      render_js: "false",
    });

    const response = await fetch(
      `https://app.scrapingbee.com/api/v1/?${params.toString()}`,
      {
        method: "GET",
        headers: { Accept: "text/html" },
      }
    );

    if (!response.ok) {
      console.error(`[Suggestion] ScrapingBee error: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error("[Suggestion] Search fetch error:", error);
    return null;
  }
}

/**
 * Parse organic search results using Cheerio
 * Skips sponsored/ad products, unavailable products, and products without prices
 */
function parseSearchResults(html: string, affiliateTag: string, region: AmazonRegion): ProductMatch[] {
  const $ = cheerio.load(html);
  const results: ProductMatch[] = [];

  // Select search result items, excluding ads
  // The key selector: data-component-type="s-search-result" WITHOUT ad classes
  const searchResults = $('[data-component-type="s-search-result"]');

  // Determine currency symbol based on region
  const currencySymbol = getCurrencySymbol(region.region);

  searchResults.each((index, element) => {
    if (results.length >= MAX_SEARCH_RESULTS) return false;

    const $item = $(element);

    // Skip sponsored/ad items
    const isSponsored =
      $item.find('[data-component-type="sp-sponsored-result"]').length > 0 ||
      $item.find(".s-label-popover-default").text().toLowerCase().includes("sponsored") ||
      $item.hasClass("AdHolder") ||
      ($item.find('[data-component-type="s-impression-logger"]').attr("data-component-props")?.includes('"adId"') ?? false);

    // Get ASIN from data attribute
    const asin = $item.attr("data-asin");
    if (!asin || asin.length !== 10) return; // Skip invalid ASINs

    // Extract product title
    const titleElement = $item.find("h2 a span, .a-size-medium.a-color-base.a-text-normal, .a-size-base-plus.a-color-base.a-text-normal");
    const title = titleElement.first().text().trim();
    if (!title || title.length < 5) return;

    // === Check for unavailable products ===
    const itemText = $item.text().toLowerCase();
    const isUnavailable =
      itemText.includes("currently unavailable") ||
      itemText.includes("out of stock") ||
      $item.find('.a-color-price').text().toLowerCase().includes("unavailable");

    if (isUnavailable) {
      console.log(`[Suggestion] Skipping unavailable: "${title.slice(0, 40)}..."`);
      return; // Skip this product
    }

    // Extract price
    const priceWhole = $item.find(".a-price-whole").first().text().replace(",", "").replace(".", "");
    const priceFraction = $item.find(".a-price-fraction").first().text();
    const price = priceWhole ? `${currencySymbol}${priceWhole}${priceFraction ? `.${priceFraction}` : ""}` : null;

    // === Skip products without price (likely unavailable) ===
    if (!price) {
      console.log(`[Suggestion] Skipping no-price product: "${title.slice(0, 40)}..."`);
      return;
    }

    // Extract image URL
    const imageUrl = $item.find(".s-image").attr("src") || null;

    // Extract rating
    const ratingText = $item.find('[aria-label*="out of 5 stars"], [aria-label*="sur 5"], [aria-label*="von 5"]').attr("aria-label") || null;
    const rating = ratingText ? ratingText.match(/(\d+[.,]?\d*)/)?.[1]?.replace(",", ".") || null : null;

    // Extract review count
    const reviewCountText = $item.find('[aria-label*="ratings"], [aria-label*="évaluations"], [aria-label*="Bewertungen"], .a-size-small .a-link-normal').last().text();
    const reviewCount = reviewCountText.match(/[\d.,]+/)?.[0]?.replace(".", "") || null;

    // Build product URL with affiliate tag for the correct region
    const productUrl = appendAffiliateTag(`https://www.${region.domain}/dp/${asin}`, affiliateTag);

    results.push({
      title: cleanTitle(title),
      asin,
      url: productUrl,
      price,
      imageUrl,
      rating,
      reviewCount,
      isSponsored,
    });
  });

  // Filter to only organic results first, then include sponsored if needed
  const organic = results.filter((r) => !r.isSponsored);
  const sponsored = results.filter((r) => r.isSponsored);

  // Prioritize organic results
  return [...organic, ...sponsored].slice(0, MAX_SEARCH_RESULTS);
}

/**
 * Get currency symbol for a region
 */
function getCurrencySymbol(region: string): string {
  const symbols: Record<string, string> = {
    US: "$",
    UK: "£",
    CA: "CA$",
    DE: "€",
    FR: "€",
    ES: "€",
    IT: "€",
    NL: "€",
    AU: "A$",
    JP: "¥",
    IN: "₹",
    MX: "MX$",
    BR: "R$",
    SE: "kr",
    PL: "zł",
  };
  return symbols[region] || "$";
}

/**
 * Clean up product title
 */
function cleanTitle(title: string): string {
  return title
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse price string to number
 * Handles various currency formats: $49.99, £39.99, €45,99, CA$59.99, etc.
 */
function parsePrice(priceStr: string | null | undefined): number | null {
  if (!priceStr) return null;

  // Remove currency symbols and letters, keep digits, dots, and commas
  const cleaned = priceStr.replace(/[^0-9.,]/g, "");

  if (!cleaned) return null;

  // Handle European format (45,99) vs US format (45.99)
  // If there's a comma and no dot, or comma is after the dot, treat comma as decimal
  let normalized = cleaned;
  if (cleaned.includes(",") && !cleaned.includes(".")) {
    // European format: 45,99 -> 45.99
    normalized = cleaned.replace(",", ".");
  } else if (cleaned.includes(",") && cleaned.includes(".")) {
    // Mixed format: 1,234.56 or 1.234,56
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    if (lastComma > lastDot) {
      // European: 1.234,56 -> 1234.56
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // US: 1,234.56 -> 1234.56
      normalized = cleaned.replace(/,/g, "");
    }
  }

  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Filter candidates by price range
 * Keeps products within $50 of original price (or equivalent in other currencies)
 */
function filterByPriceRange(
  candidates: ProductMatch[],
  originalPrice: string | null | undefined,
  maxAbove: number = 50
): ProductMatch[] {
  const originalPriceNum = parsePrice(originalPrice);

  if (!originalPriceNum) {
    console.log(`[Suggestion] No original price - skipping price filter`);
    return candidates;
  }

  const maxPrice = originalPriceNum + maxAbove;
  const minPrice = originalPriceNum * 0.3; // Still filter suspiciously cheap items

  console.log(`[Suggestion] Price filter: $${minPrice.toFixed(0)} - $${maxPrice.toFixed(0)} (original: $${originalPriceNum.toFixed(0)}, max +$${maxAbove})`);

  const filtered = candidates.filter(c => {
    const candidatePrice = parsePrice(c.price);

    if (!candidatePrice) return true; // Keep items without price (let LLM decide)

    if (candidatePrice > maxPrice) {
      console.log(`[Suggestion] Filtered out (too expensive): "${c.title.slice(0, 30)}..." - ${c.price}`);
      return false;
    }

    if (candidatePrice < minPrice) {
      console.log(`[Suggestion] Filtered out (too cheap): "${c.title.slice(0, 30)}..." - ${c.price}`);
      return false;
    }

    return true;
  });

  console.log(`[Suggestion] Price filter: ${candidates.length} → ${filtered.length} candidates`);
  return filtered;
}

// ============================================
// STEP 3: LLM VERIFICATION (COMPARE ALL AT ONCE)
// ============================================

/**
 * Use LLM to pick the best matching product from all candidates
 * Compares all options at once for better accuracy
 * Includes price comparison when original price is available
 */
async function verifyBestMatch(
  original: ExtractedKeywords,
  candidates: ProductMatch[],
  originalPrice?: string | null
): Promise<{
  bestIndex: number | null;
  confidenceScore: number;
  matchReason: string;
  categoryMatch: boolean;
}> {
  if (!process.env.ANTHROPIC_API_KEY || candidates.length === 0) {
    return { bestIndex: null, confidenceScore: 0, matchReason: "No candidates", categoryMatch: false };
  }

  try {
    const candidateList = candidates
      .map((c, i) => `${i + 1}. "${c.title}" - ${c.price || 'Price unknown'}${c.isSponsored ? ' [SPONSORED]' : ''}`)
      .join('\n');

    // Add price guidance if original price is available
    let priceGuidance = "";
    if (originalPrice) {
      priceGuidance = `\nORIGINAL PRICE: ${originalPrice}
- Prefer replacements within 50% of original price
- If replacement is 2x+ more expensive, reduce confidence by 20 points`;
    }

    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are validating Amazon product replacements. Be STRICT about category matching.

ORIGINAL PRODUCT:
- Name: ${original.productName}
- Category: ${original.category}
- Brand: ${original.brand || "Unknown"}
- Search terms: ${original.searchQuery}${priceGuidance}

CANDIDATE REPLACEMENTS:
${candidateList}

TASK: Which candidate (if any) is a valid replacement?

STRICT RULES:
1. SAME CATEGORY REQUIRED:
   - Webcam → only Webcam ✓
   - Webcam → Headphones ✗
   - Webcam → Mouse pad ✗
   - Headphones → only Headphones ✓
   - Monitor → only Monitor ✓

2. SAME PRODUCT TYPE:
   - Gaming headset → Gaming headset ✓
   - Gaming headset → Earbuds ✗ (different form factor)
   - Wired mouse → Wired mouse ✓
   - Wired mouse → Wireless mouse ✓ (same type)

3. PRICE CONSIDERATION:
   - Prefer similar price range (within 50% of original)
   - If candidate is 2x+ more expensive, lower confidence

4. REJECT ALL IF:
   - No candidates match the category
   - All candidates are accessories instead of main product
   - Category is ambiguous and risky

5. When in doubt, REJECT. It's better to return nothing than a wrong product.

Respond with ONLY this JSON:
{
  "bestMatch": <number 1-${candidates.length} or null if none valid>,
  "confidence": <0-100>,
  "reason": "<brief explanation including price note if relevant>",
  "categoryMatch": <true/false>
}`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error("[Suggestion] Could not parse verification response");
      return { bestIndex: null, confidenceScore: 0, matchReason: "Parse error", categoryMatch: false };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const result = {
      bestIndex: parsed.bestMatch !== null ? parsed.bestMatch - 1 : null,
      confidenceScore: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      matchReason: parsed.reason || "No reason",
      categoryMatch: parsed.categoryMatch === true,
    };

    console.log(`[Suggestion] LLM verification: ${result.bestIndex !== null ? `#${result.bestIndex + 1}` : 'REJECTED'} (${result.confidenceScore}%) - ${result.matchReason}`);

    return result;
  } catch (error) {
    console.error("[Suggestion] Verification error:", error);
    return { bestIndex: null, confidenceScore: 0, matchReason: "Error", categoryMatch: false };
  }
}

// ============================================
// MAIN SUGGESTION FUNCTION
// ============================================

/**
 * Find replacement product for a broken link
 * AMAZON-ONLY approach: Video context is not used because it's unreliable
 * (e.g., a Fortnite video contains links to webcams, mice, headsets - unrelated to video topic)
 */
export async function findReplacementProduct(
  originalUrl: string,
  _videoTitle: string,  // Ignored - not reliable for product identification
  _videoDescription?: string,  // Ignored - not reliable for product identification
  originalProductTitle?: string,
  affiliateTag?: string  // User's affiliate tag - REQUIRED for correct commission attribution
): Promise<SuggestionResult> {
  if (!affiliateTag) {
    return {
      success: false,
      originalProductName: null,
      searchQuery: null,
      bestMatch: null,
      alternativeMatches: [],
      error: "Affiliate tag is required. Please set your Amazon affiliate tag in Settings.",
    };
  }

  const tag = affiliateTag;

  console.log(`[Suggestion] Starting replacement search for: ${originalUrl.slice(0, 60)}...`);

  // Step 0: Resolve shortened URL and get ASIN
  const { resolved: resolvedUrl, asin: originalAsin } = await resolveAmazonUrl(originalUrl);

  let region = getAmazonRegion(resolvedUrl);

  // Construct clean product URL if we have ASIN
  let effectiveUrl = resolvedUrl;
  if (originalAsin && (resolvedUrl === originalUrl || !resolvedUrl.includes('/dp/'))) {
    effectiveUrl = `https://www.${region.domain}/dp/${originalAsin}`;
    console.log(`[Suggestion] Constructed URL from ASIN: ${effectiveUrl}`);
  }

  console.log(`[Suggestion] Region: ${region.region}, ASIN: ${originalAsin || 'not found'}`);

  // Step 1: Get product title and price from AMAZON (not video context)
  let productTitle = originalProductTitle;
  let originalPrice: string | undefined;

  if (originalAsin) {
    const productPageUrl = `https://www.${region.domain}/dp/${originalAsin}`;
    console.log(`[Suggestion] Fetching product info from Amazon: ${productPageUrl}`);

    const productInfo = await fetchProductInfo(productPageUrl, region);

    // Use fetched title if we don't have one
    if (!productTitle && productInfo.title) {
      productTitle = productInfo.title;
      console.log(`[Suggestion] Amazon product title: "${productTitle.slice(0, 60)}..."`);
    }

    // Store original price for comparison
    originalPrice = productInfo.price;
    if (originalPrice) {
      console.log(`[Suggestion] Original price: ${originalPrice}`);
    }
  }

  // Step 2: If we couldn't get title from Amazon, we can't proceed reliably
  if (!productTitle) {
    return {
      success: false,
      originalProductName: null,
      searchQuery: null,
      bestMatch: null,
      alternativeMatches: [],
      error: "Could not fetch product info from Amazon",
    };
  }

  // Step 3: Extract search keywords from the ACTUAL product title
  const keywords = await extractKeywordsFromProductTitle(productTitle);

  if (!keywords) {
    return {
      success: false,
      originalProductName: productTitle,
      searchQuery: null,
      bestMatch: null,
      alternativeMatches: [],
      error: "Could not extract search keywords",
    };
  }

  console.log(`[Suggestion] Search query: "${keywords.searchQuery}" (Category: ${keywords.category})`);

  // Step 2: Search Amazon (in the same region as the original link)
  const searchHtml = await fetchAmazonSearch(keywords.searchQuery, region);
  if (!searchHtml) {
    return {
      success: false,
      originalProductName: keywords.productName,
      searchQuery: keywords.searchQuery,
      bestMatch: null,
      alternativeMatches: [],
      error: "Failed to fetch Amazon search results",
    };
  }

  // Step 3: Parse results (skip ads, use correct region domain)
  const products = parseSearchResults(searchHtml, tag, region);
  if (products.length === 0) {
    return {
      success: false,
      originalProductName: keywords.productName,
      searchQuery: keywords.searchQuery,
      bestMatch: null,
      alternativeMatches: [],
      error: "No search results found",
    };
  }

  console.log(`[Suggestion] Found ${products.length} products from search`);

  // Step 4: Filter by price range (max $50 above original)
  const filteredProducts = filterByPriceRange(products, originalPrice, 50);

  if (filteredProducts.length === 0) {
    console.log(`[Suggestion] All products filtered out by price`);
    return {
      success: false,
      originalProductName: keywords.productName,
      searchQuery: keywords.searchQuery,
      bestMatch: null,
      alternativeMatches: [],
      error: "No products within price range",
    };
  }

  // Log candidates for debugging
  filteredProducts.forEach((p, i) => {
    console.log(`[Suggestion]   ${i + 1}. "${p.title.slice(0, 50)}..." - ${p.price}${p.isSponsored ? " [AD]" : ""}`);
  });

  // Step 5: LLM picks the best match from filtered candidates
  const verification = await verifyBestMatch(keywords, filteredProducts, originalPrice);

  // Must have category match AND reasonable confidence
  if (verification.bestIndex === null || !verification.categoryMatch || verification.confidenceScore < 65) {
    console.log(`[Suggestion] REJECTED: ${verification.matchReason}`);
    return {
      success: false,
      originalProductName: keywords.productName,
      searchQuery: keywords.searchQuery,
      bestMatch: null,
      alternativeMatches: [],
      error: `No valid match: ${verification.matchReason}`,
    };
  }

  const bestProduct = filteredProducts[verification.bestIndex];

  const bestMatch: SemanticMatch = {
    product: bestProduct,
    confidenceScore: verification.confidenceScore,
    matchReason: verification.matchReason,
    categoryMatch: verification.categoryMatch,
    brandMatch: keywords.brand
      ? bestProduct.title.toLowerCase().includes(keywords.brand.toLowerCase())
      : false,
  };

  console.log(`[Suggestion] ACCEPTED: "${bestProduct.title.slice(0, 40)}..." (${verification.confidenceScore}%)`);

  return {
    success: true,
    originalProductName: keywords.productName,
    searchQuery: keywords.searchQuery,
    bestMatch,
    alternativeMatches: [],
  };
}

// ============================================
// CONFIDENCE LABEL
// ============================================

export type ConfidenceLevel = "high" | "medium" | "low" | "none";

export function getConfidenceLevel(score: number | null): ConfidenceLevel {
  if (score === null) return "none";
  if (score >= 85) return "high";
  if (score >= 70) return "medium";
  if (score >= 60) return "low";
  return "none";
}

export function getConfidenceLabel(score: number | null): string {
  if (score === null) return "No match";
  if (score >= 85) return `${score}% Match`;
  if (score >= 70) return `${score}% Match`;
  if (score >= 60) return `${score}% Match`;
  return "Low confidence";
}
