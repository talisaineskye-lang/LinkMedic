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

const DEFAULT_AFFILIATE_TAG = "projectfarmyo-20";
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

/**
 * Fetch product title from a product page
 * Used to get original product info for better keyword extraction
 */
async function fetchProductTitle(productUrl: string, region: AmazonRegion): Promise<string | undefined> {
  try {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) return undefined;

    console.log(`[Suggestion] Fetching product title from: ${productUrl}`);

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
      return undefined;
    }

    const html = await response.text();

    // Extract title from product page
    const $ = cheerio.load(html);

    // Try multiple selectors for product title
    const title =
      $('#productTitle').text().trim() ||
      $('h1.product-title-word-break').text().trim() ||
      $('span.product-title-word-break').text().trim();

    if (title) {
      console.log(`[Suggestion] Found product title: "${title.slice(0, 60)}..."`);
      return title;
    }

    return undefined;
  } catch (error) {
    console.error('[Suggestion] Product title fetch error:', error);
    return undefined;
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
 * Extract clean product keywords from context
 * NO hallucination - only extracts what's in the data
 */
export async function extractProductKeywords(
  originalUrl: string,
  videoTitle: string,
  videoDescription?: string,
  originalProductTitle?: string
): Promise<ExtractedKeywords | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[Suggestion] No ANTHROPIC_API_KEY configured");
    return null;
  }

  try {
    // Build context from available data
    const context = `
URL: ${originalUrl}
${originalProductTitle ? `Original Product Title: ${originalProductTitle}` : ""}
Video Title: ${videoTitle}
${videoDescription ? `Video Description (first 500 chars): ${videoDescription.slice(0, 500)}` : ""}
    `.trim();

    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Analyze this broken Amazon affiliate link context and extract the ACTUAL product information.

${context}

IMPORTANT RULES:
- ONLY extract information that is EXPLICITLY present in the context
- Do NOT guess or hallucinate product names
- If brand is not clear, set to null
- Category should be a broad Amazon category (Electronics, Camera, Audio, Gaming, etc.)
- Search query should be 2-5 words that would find this exact product type

Respond in this exact JSON format only:
{
  "productName": "the actual product name if known, or 'Unknown Product' if not clear",
  "brand": "brand name if explicitly mentioned, or null",
  "category": "broad product category",
  "searchQuery": "2-5 word Amazon search query"
}

Only output the JSON, no explanation.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[Suggestion] Could not parse LLM response:", responseText);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`[Suggestion] Extracted keywords:`, parsed);

    return {
      productName: parsed.productName || "Unknown Product",
      brand: parsed.brand || null,
      category: parsed.category || "Unknown",
      searchQuery: parsed.searchQuery || parsed.productName,
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
 * Skips sponsored/ad products using strict selectors
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

    // Extract image URL
    const imageUrl = $item.find(".s-image").attr("src") || null;

    // Extract price
    const priceWhole = $item.find(".a-price-whole").first().text().replace(",", "").replace(".", "");
    const priceFraction = $item.find(".a-price-fraction").first().text();
    const price = priceWhole ? `${currencySymbol}${priceWhole}${priceFraction ? `.${priceFraction}` : ""}` : null;

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

// ============================================
// STEP 3: LLM VERIFICATION
// ============================================

interface LLMVerificationResult {
  isMatch: boolean;
  confidenceScore: number;
  matchReason: string;
  categoryMatch: boolean;
  brandMatch: boolean;
}

/**
 * Use LLM to verify if a candidate product matches the original product
 * This prevents category mismatches (e.g., Xbox controller suggested for webcam)
 */
async function verifyMatchWithLLM(
  original: ExtractedKeywords,
  candidate: ProductMatch
): Promise<LLMVerificationResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[Suggestion] No ANTHROPIC_API_KEY for verification");
    return {
      isMatch: false,
      confidenceScore: 0,
      matchReason: "API key not configured",
      categoryMatch: false,
      brandMatch: false,
    };
  }

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Compare these two products and determine if the CANDIDATE is a suitable replacement for the ORIGINAL.

ORIGINAL PRODUCT:
- Name: ${original.productName}
- Category: ${original.category}
- Brand: ${original.brand || "Unknown"}
- Search Query: ${original.searchQuery}

CANDIDATE PRODUCT:
- Title: ${candidate.title}
- Price: ${candidate.price || "Unknown"}

RULES:
1. Products MUST be in the same category (e.g., don't match a webcam with a game controller)
2. Products should serve the same purpose
3. Brand match is a bonus but not required
4. Price range should be similar (within 2x)

Respond ONLY with this JSON:
{
  "isMatch": true/false,
  "confidence": 0-100,
  "reason": "brief explanation",
  "categoryMatch": true/false,
  "brandMatch": true/false
}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[Suggestion] Could not parse LLM verification response:", responseText);
      return {
        isMatch: false,
        confidenceScore: 0,
        matchReason: "Failed to parse verification response",
        categoryMatch: false,
        brandMatch: false,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`[Suggestion] LLM verification: ${parsed.isMatch ? "MATCH" : "NO MATCH"} (${parsed.confidence}%) - ${parsed.reason}`);

    return {
      isMatch: parsed.isMatch === true,
      confidenceScore: parsed.confidence || 0,
      matchReason: parsed.reason || "No reason provided",
      categoryMatch: parsed.categoryMatch === true,
      brandMatch: parsed.brandMatch === true,
    };
  } catch (error) {
    console.error("[Suggestion] LLM verification error:", error);
    return {
      isMatch: false,
      confidenceScore: 0,
      matchReason: "Verification error",
      categoryMatch: false,
      brandMatch: false,
    };
  }
}

// ============================================
// MAIN SUGGESTION FUNCTION
// ============================================

/**
 * Find replacement product for a broken link
 * Returns null if no reliable match is found
 */
export async function findReplacementProduct(
  originalUrl: string,
  videoTitle: string,
  videoDescription?: string,
  originalProductTitle?: string,
  affiliateTag?: string
): Promise<SuggestionResult> {
  const tag = affiliateTag || DEFAULT_AFFILIATE_TAG;

  // Step 0: Resolve shortened URLs (amzn.to, a.co, etc.)
  const { resolved: resolvedUrl, asin: originalAsin } = await resolveAmazonUrl(originalUrl);
  console.log(`[Suggestion] Original: ${originalUrl.slice(0, 50)}, Resolved: ${resolvedUrl.slice(0, 50)}, ASIN: ${originalAsin}`);

  // Detect region from resolved URL (more reliable than shortened URL)
  const region = getAmazonRegion(resolvedUrl);
  console.log(`[Suggestion] Finding replacement for: ${resolvedUrl.slice(0, 60)}... (Region: ${region.region})`);

  // If we resolved a shortened URL, try to fetch the original product title
  let productTitleFromPage = originalProductTitle;
  if (!productTitleFromPage && resolvedUrl !== originalUrl && originalAsin) {
    productTitleFromPage = await fetchProductTitle(resolvedUrl, region);
  }

  // Step 1: Extract keywords
  const keywords = await extractProductKeywords(
    resolvedUrl,  // Use resolved URL for better context
    videoTitle,
    videoDescription,
    productTitleFromPage  // May have fetched from the resolved page
  );

  if (!keywords || keywords.productName === "Unknown Product") {
    return {
      success: false,
      originalProductName: null,
      searchQuery: null,
      bestMatch: null,
      alternativeMatches: [],
      error: "Could not extract product keywords from context",
    };
  }

  console.log(`[Suggestion] Search query: "${keywords.searchQuery}"`);

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

  console.log(`[Suggestion] Found ${products.length} products`);

  // Step 4: LLM verification (check each product until we find a match)
  const matches: SemanticMatch[] = [];
  let bestMatch: SemanticMatch | null = null;

  for (const product of products) {
    // Skip sponsored products for primary matching
    if (product.isSponsored && matches.length > 0) {
      continue;
    }

    const verification = await verifyMatchWithLLM(keywords, product);

    const semanticMatch: SemanticMatch = {
      product,
      confidenceScore: verification.confidenceScore,
      matchReason: verification.matchReason,
      categoryMatch: verification.categoryMatch,
      brandMatch: verification.brandMatch,
    };

    if (verification.isMatch && verification.confidenceScore >= 60) {
      // Found a good match!
      if (!bestMatch || verification.confidenceScore > bestMatch.confidenceScore) {
        bestMatch = semanticMatch;
      } else {
        matches.push(semanticMatch);
      }

      // If we found a high-confidence match, stop searching
      if (verification.confidenceScore >= 80) {
        console.log(`[Suggestion] High confidence match found, stopping search`);
        break;
      }
    } else if (verification.confidenceScore >= 50) {
      // Partial match - keep as alternative
      matches.push(semanticMatch);
    } else {
      console.log(`[Suggestion] Rejected: "${product.title.slice(0, 40)}..." - ${verification.matchReason}`);
    }
  }

  // Sort alternatives by confidence
  const alternativeMatches = matches
    .filter((m) => m !== bestMatch)
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  if (!bestMatch) {
    console.log(`[Suggestion] No reliable match found after LLM verification`);
    return {
      success: false,
      originalProductName: keywords.productName,
      searchQuery: keywords.searchQuery,
      bestMatch: null,
      alternativeMatches,
      error: "No reliable match found - LLM verification failed for all candidates",
    };
  }

  console.log(`[Suggestion] Best match: "${bestMatch.product.title.slice(0, 40)}..." (${bestMatch.confidenceScore}%)`);

  return {
    success: true,
    originalProductName: keywords.productName,
    searchQuery: keywords.searchQuery,
    bestMatch,
    alternativeMatches,
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
