/**
 * Amazon Search via ScrapingBee
 *
 * This module searches Amazon for products and extracts the first result.
 * Used to find real replacement products for broken affiliate links.
 */

export interface AmazonSearchResult {
  title: string;
  url: string;
  asin: string | null;
  price: string | null;
  imageUrl: string | null;
  confidenceScore: number; // 0-100 based on search relevance
}

export interface SearchResponse {
  success: boolean;
  result: AmazonSearchResult | null;
  error?: string;
}

/**
 * Searches Amazon for a product and returns the first result
 * Uses ScrapingBee to bypass bot detection
 */
export async function searchAmazon(
  searchQuery: string,
  affiliateTag?: string | null
): Promise<SearchResponse> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!apiKey) {
    console.error("[AmazonSearch] No SCRAPINGBEE_API_KEY found");
    return {
      success: false,
      result: null,
      error: "ScrapingBee API key not configured",
    };
  }

  try {
    // Build Amazon search URL
    const encodedQuery = encodeURIComponent(searchQuery);
    const amazonSearchUrl = `https://www.amazon.com/s?k=${encodedQuery}`;

    console.log(`[AmazonSearch] Searching: "${searchQuery}"`);

    // Fetch search results via ScrapingBee
    const params = new URLSearchParams({
      api_key: apiKey,
      url: amazonSearchUrl,
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
      console.error(`[AmazonSearch] ScrapingBee error: ${response.status}`);
      return {
        success: false,
        result: null,
        error: `ScrapingBee returned ${response.status}`,
      };
    }

    const html = await response.text();

    // Parse the first search result
    const result = parseFirstSearchResult(html, affiliateTag, searchQuery);

    if (result) {
      console.log(`[AmazonSearch] Found: "${result.title.slice(0, 50)}..." (${result.asin}) - ${result.confidenceScore}% confidence`);
      return { success: true, result };
    } else {
      console.log(`[AmazonSearch] No results found for: "${searchQuery}"`);
      return {
        success: false,
        result: null,
        error: "No search results found",
      };
    }
  } catch (error) {
    console.error("[AmazonSearch] Error:", error);
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Parses the first product result from Amazon search HTML
 *
 * Amazon search results use data-asin attributes on result containers.
 * We extract the ASIN, title, and build a proper product URL.
 */
function parseFirstSearchResult(
  html: string,
  affiliateTag?: string | null,
  searchQuery?: string
): AmazonSearchResult | null {
  try {
    // Find products with data-asin attribute (sponsored products have different structure)
    // Look for search result items with real ASINs (10 char alphanumeric)

    // Pattern 1: data-asin="B0XXXXXXXXX" with product link nearby
    const asinMatches = html.matchAll(/data-asin="([A-Z0-9]{10})"/gi);

    for (const match of asinMatches) {
      const asin = match[1];

      // Skip sponsored placeholder ASINs or empty
      if (!asin || asin === "0" || asin.startsWith("0000")) {
        continue;
      }

      // Try to find the product title near this ASIN
      // Look for the result container and extract title
      const asinIndex = match.index || 0;
      const contextWindow = html.slice(asinIndex, asinIndex + 3000);

      // Extract title from various patterns Amazon uses
      const title = extractTitle(contextWindow);

      if (!title || title.length < 5) {
        continue; // Skip if we can't find a valid title
      }

      // Extract price if available
      const price = extractPrice(contextWindow);

      // Extract image URL if available
      const imageUrl = extractImageUrl(contextWindow);

      // Build the product URL with affiliate tag
      const baseUrl = `https://www.amazon.com/dp/${asin}`;
      const url = affiliateTag ? `${baseUrl}?tag=${affiliateTag}` : baseUrl;

      const cleanedTitle = cleanTitle(title);
      const confidenceScore = calculateConfidenceScore(cleanedTitle, searchQuery);

      return {
        title: cleanedTitle,
        url,
        asin,
        price,
        imageUrl,
        confidenceScore,
      };
    }

    // Fallback: Try to find any product link with /dp/ pattern
    const dpMatch = html.match(/href="\/dp\/([A-Z0-9]{10})[^"]*"[^>]*>([^<]+)/i);
    if (dpMatch) {
      const asin = dpMatch[1];
      const title = dpMatch[2];

      if (title && title.length > 5) {
        const baseUrl = `https://www.amazon.com/dp/${asin}`;
        const url = affiliateTag ? `${baseUrl}?tag=${affiliateTag}` : baseUrl;
        const cleanedTitle = cleanTitle(title);
        const confidenceScore = calculateConfidenceScore(cleanedTitle, searchQuery);

        return {
          title: cleanedTitle,
          url,
          asin,
          price: null,
          imageUrl: null,
          confidenceScore,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("[AmazonSearch] Parse error:", error);
    return null;
  }
}

/**
 * Extract product title from search result HTML context
 */
function extractTitle(html: string): string | null {
  // Pattern 1: span with a-size-medium or a-size-base-plus classes (main title)
  const titlePatterns = [
    // Most common: title in a span with specific classes
    /class="[^"]*a-size-(?:medium|base-plus)[^"]*a-text-normal[^"]*"[^>]*>([^<]+)</i,
    /class="[^"]*a-text-normal[^"]*"[^>]*>([^<]+)</i,
    // Alt: aria-label on product link
    /aria-label="([^"]+)"/i,
    // Alt: title attribute on link
    /<a[^>]*title="([^"]+)"[^>]*href="[^"]*\/dp\//i,
    // Alt: h2 with product title
    /<h2[^>]*class="[^"]*a-size-mini[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)</i,
  ];

  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match && match[1] && match[1].trim().length > 5) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extract price from search result HTML context
 */
function extractPrice(html: string): string | null {
  // Look for price patterns
  const pricePatterns = [
    /class="[^"]*a-price[^"]*"[^>]*>[\s\S]*?<span[^>]*class="[^"]*a-offscreen[^"]*"[^>]*>\$?([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.?\d{2})/,
  ];

  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return `$${match[1]}`;
    }
  }

  return null;
}

/**
 * Extract image URL from search result HTML context
 */
function extractImageUrl(html: string): string | null {
  // Look for product image
  const imgMatch = html.match(/src="(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/i);
  if (imgMatch) {
    return imgMatch[1];
  }
  return null;
}

/**
 * Clean up extracted title
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
 * Calculate confidence score (0-100) based on how well the product title matches the search query
 *
 * Scoring factors:
 * - Base score: 70 (we found a result in top position)
 * - +15 if all search words appear in title
 * - +10 if exact phrase match
 * - +5 bonus for being first result
 */
function calculateConfidenceScore(productTitle: string, searchQuery?: string): number {
  if (!searchQuery) {
    return 75; // Default confidence when no query to compare
  }

  const titleLower = productTitle.toLowerCase();
  const queryLower = searchQuery.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  let score = 70; // Base score for finding a top result

  // Check if all significant words from query appear in title
  const matchingWords = queryWords.filter(word => titleLower.includes(word));
  const wordMatchRatio = queryWords.length > 0 ? matchingWords.length / queryWords.length : 0;

  if (wordMatchRatio === 1) {
    score += 15; // All words match
  } else if (wordMatchRatio >= 0.5) {
    score += Math.round(wordMatchRatio * 10); // Partial match
  }

  // Check for exact phrase match
  if (titleLower.includes(queryLower)) {
    score += 10;
  }

  // First result bonus (already implied since we take first result)
  score += 5;

  // Cap at 100
  return Math.min(score, 100);
}
