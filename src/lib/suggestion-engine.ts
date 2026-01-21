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
async function fetchAmazonSearch(query: string): Promise<string | null> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    console.error("[Suggestion] No SCRAPINGBEE_API_KEY configured");
    return null;
  }

  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      url: searchUrl,
      premium_proxy: "true",
      country_code: "us",
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
function parseSearchResults(html: string, affiliateTag: string): ProductMatch[] {
  const $ = cheerio.load(html);
  const results: ProductMatch[] = [];

  // Select search result items, excluding ads
  // The key selector: data-component-type="s-search-result" WITHOUT ad classes
  const searchResults = $('[data-component-type="s-search-result"]');

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
    const priceWhole = $item.find(".a-price-whole").first().text().replace(",", "");
    const priceFraction = $item.find(".a-price-fraction").first().text();
    const price = priceWhole ? `$${priceWhole}${priceFraction ? `.${priceFraction}` : ""}` : null;

    // Extract rating
    const ratingText = $item.find('[aria-label*="out of 5 stars"]').attr("aria-label") || null;
    const rating = ratingText ? ratingText.match(/(\d+\.?\d*) out of/)?.[1] || null : null;

    // Extract review count
    const reviewCountText = $item.find('[aria-label*="ratings"], .a-size-small .a-link-normal').last().text();
    const reviewCount = reviewCountText.match(/[\d,]+/)?.[0] || null;

    // Build product URL with affiliate tag
    const productUrl = appendAffiliateTag(`https://www.amazon.com/dp/${asin}`, affiliateTag);

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
// STEP 3: SEMANTIC VERIFICATION
// ============================================

/**
 * Calculate semantic match between original product and found product
 * Prevents category mismatches (e.g., Xbox controller for Camera)
 */
async function calculateSemanticMatch(
  original: ExtractedKeywords,
  candidate: ProductMatch
): Promise<SemanticMatch> {
  const originalLower = original.productName.toLowerCase();
  const originalCategory = original.category.toLowerCase();
  const originalBrand = original.brand?.toLowerCase() || "";
  const candidateLower = candidate.title.toLowerCase();

  let score = 50; // Base score for being in search results
  let matchReason = "Found in search results";
  let categoryMatch = false;
  let brandMatch = false;

  // Split into words for comparison
  const originalWords = original.searchQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const candidateWords = candidateLower.split(/\s+/);

  // Check word overlap
  const matchingWords = originalWords.filter((word) =>
    candidateWords.some((cw) => cw.includes(word) || word.includes(cw))
  );
  const wordMatchRatio = originalWords.length > 0 ? matchingWords.length / originalWords.length : 0;

  if (wordMatchRatio >= 0.8) {
    score += 30;
    matchReason = "High keyword match";
  } else if (wordMatchRatio >= 0.5) {
    score += 20;
    matchReason = "Moderate keyword match";
  } else if (wordMatchRatio >= 0.3) {
    score += 10;
    matchReason = "Some keyword match";
  }

  // Category verification - check for MISMATCHES
  const categoryKeywords: Record<string, string[]> = {
    camera: ["camera", "lens", "dslr", "mirrorless", "webcam", "camcorder", "tripod"],
    audio: ["headphone", "speaker", "microphone", "earbuds", "audio", "sound"],
    gaming: ["controller", "gamepad", "console", "gaming", "playstation", "xbox", "nintendo"],
    computer: ["laptop", "keyboard", "mouse", "monitor", "computer", "pc", "desktop"],
    phone: ["phone", "iphone", "android", "case", "charger", "cable"],
    lighting: ["light", "led", "ring light", "lamp", "studio"],
  };

  // Find original category
  let originalCategoryType = "";
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => originalCategory.includes(kw) || originalLower.includes(kw))) {
      originalCategoryType = cat;
      break;
    }
  }

  // Find candidate category
  let candidateCategoryType = "";
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => candidateLower.includes(kw))) {
      candidateCategoryType = cat;
      break;
    }
  }

  // Check for category match/mismatch
  if (originalCategoryType && candidateCategoryType) {
    if (originalCategoryType === candidateCategoryType) {
      categoryMatch = true;
      score += 15;
      matchReason += " | Category match";
    } else {
      // CATEGORY MISMATCH - big penalty
      score -= 40;
      matchReason = `CATEGORY MISMATCH: Expected ${originalCategoryType}, got ${candidateCategoryType}`;
    }
  }

  // Brand matching
  if (originalBrand) {
    if (candidateLower.includes(originalBrand)) {
      brandMatch = true;
      score += 10;
      matchReason += " | Brand match";
    }
  }

  // Bonus for not being sponsored
  if (!candidate.isSponsored) {
    score += 5;
  }

  // Bonus for having good reviews
  if (candidate.rating && parseFloat(candidate.rating) >= 4.0) {
    score += 5;
  }

  // Cap score
  score = Math.max(0, Math.min(100, score));

  return {
    product: candidate,
    confidenceScore: score,
    matchReason,
    categoryMatch,
    brandMatch,
  };
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

  console.log(`[Suggestion] Finding replacement for: ${originalUrl.slice(0, 60)}...`);

  // Step 1: Extract keywords
  const keywords = await extractProductKeywords(
    originalUrl,
    videoTitle,
    videoDescription,
    originalProductTitle
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

  // Step 2: Search Amazon
  const searchHtml = await fetchAmazonSearch(keywords.searchQuery);
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

  // Step 3: Parse results (skip ads)
  const products = parseSearchResults(searchHtml, tag);
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

  // Step 4: Semantic verification
  const matches: SemanticMatch[] = [];
  for (const product of products) {
    const match = await calculateSemanticMatch(keywords, product);
    matches.push(match);
  }

  // Sort by confidence score
  matches.sort((a, b) => b.confidenceScore - a.confidenceScore);

  // Get best match (must have score >= 60)
  const bestMatch = matches[0]?.confidenceScore >= 60 ? matches[0] : null;
  const alternativeMatches = matches.slice(1).filter((m) => m.confidenceScore >= 50);

  if (!bestMatch) {
    console.log(`[Suggestion] No reliable match found (best score: ${matches[0]?.confidenceScore})`);
    return {
      success: false,
      originalProductName: keywords.productName,
      searchQuery: keywords.searchQuery,
      bestMatch: null,
      alternativeMatches,
      error: "No reliable match found - category or brand mismatch",
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
