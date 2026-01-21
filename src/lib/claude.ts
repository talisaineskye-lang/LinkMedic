import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client lazily to ensure env vars are loaded
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log(`[claude] Initializing Anthropic client, API key ${apiKey ? `present (${apiKey.slice(0, 8)}...)` : 'MISSING!'}`);
    anthropicClient = new Anthropic({
      apiKey: apiKey,
    });
  }
  return anthropicClient;
}

interface ProductSuggestion {
  productName: string;
  asin: string | null;
  reason: string;
}

/**
 * Extracts product information from an Amazon URL
 */
export function extractProductInfoFromUrl(url: string): {
  asin: string | null;
  domain: string | null;
} {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Try to extract ASIN from various Amazon URL patterns
    // /dp/ASIN, /gp/product/ASIN, /product/ASIN
    const asinPatterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/product\/([A-Z0-9]{10})/i,
      /\/ASIN\/([A-Z0-9]{10})/i,
    ];

    for (const pattern of asinPatterns) {
      const match = url.match(pattern);
      if (match) {
        return { asin: match[1], domain };
      }
    }

    return { asin: null, domain };
  } catch {
    return { asin: null, domain: null };
  }
}

/**
 * Extracts the user's affiliate tag from an Amazon URL
 */
export function extractAffiliateTag(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("tag");
  } catch {
    return null;
  }
}

/**
 * Uses Claude to suggest a replacement product for a broken Amazon link
 */
export async function suggestReplacementProduct(
  originalUrl: string,
  videoTitle: string,
  videoDescription?: string
): Promise<ProductSuggestion | null> {
  console.log(`[claude] suggestReplacementProduct called`);

  // Check if API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[claude] ANTHROPIC_API_KEY is not set!");
    return null;
  }

  try {
    const { asin } = extractProductInfoFromUrl(originalUrl);
    console.log(`[claude] Extracted ASIN: ${asin || 'none'}`);

    // Build context for Claude
    const context = `
Video Title: ${videoTitle}
${videoDescription ? `Video Description snippet: ${videoDescription.slice(0, 500)}...` : ""}
Original broken Amazon URL: ${originalUrl}
${asin ? `Original ASIN: ${asin}` : ""}
    `.trim();

    console.log(`[claude] Calling Anthropic API...`);
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `You are helping a YouTube content creator fix broken Amazon affiliate links in their video descriptions.

${context}

The Amazon product at this URL is no longer available (broken link, discontinued, or out of stock).

Your task:
1. Analyze the URL and video context to understand what product category was originally linked
2. Suggest a good SEARCH QUERY that will find similar/replacement products on Amazon

IMPORTANT:
- Provide a concise, effective Amazon search query (2-6 words)
- Focus on the product TYPE and key features, not specific brand/model
- Example: "wireless gaming headset" or "mechanical keyboard RGB"
- Even if uncertain, provide your best guess based on the video context

Respond in this exact JSON format only (no markdown, no explanation):
{
  "originalProduct": "what you think the original product was",
  "suggestedSearch": "concise Amazon search query to find similar products",
  "reason": "brief explanation"
}

Only return suggestedSearch as null if absolutely no product context can be determined.`,
        },
      ],
    });

    console.log(`[claude] API call successful, parsing response...`);

    // Parse the response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    console.log(`[claude] Raw response: ${responseText}`);

    // Try to parse as JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[claude] Could not parse Claude response as JSON:", responseText);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`[claude] Parsed response:`, JSON.stringify(parsed, null, 2));

    // Support both old format (suggestedProduct) and new format (suggestedSearch)
    const searchQuery = parsed.suggestedSearch || parsed.suggestedProduct;

    if (!searchQuery) {
      console.log(`[claude] No search query in response - Claude returned null suggestion`);
      console.log(`[claude] Original product guess: ${parsed.originalProduct}`);
      console.log(`[claude] Reason: ${parsed.reason}`);
      return null;
    }

    return {
      productName: searchQuery,
      asin: null, // Never use ASIN - always use search links
      reason: parsed.reason || "",
    };
  } catch (error) {
    console.error("[claude] Error getting suggestion from Claude:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("[claude] Error name:", error.name);
      console.error("[claude] Error message:", error.message);
      console.error("[claude] Error stack:", error.stack);
    }
    return null;
  }
}

/**
 * Builds an Amazon affiliate link from an ASIN and optional tag
 */
export function buildAmazonAffiliateLink(
  asin: string,
  affiliateTag?: string | null
): string {
  const baseUrl = `https://www.amazon.com/dp/${asin}`;
  return affiliateTag ? `${baseUrl}?tag=${affiliateTag}` : baseUrl;
}

/**
 * Searches for a product on Amazon and returns a potential ASIN
 * This is a simplified approach - in production you'd use Amazon Product Advertising API
 */
export function buildAmazonSearchLink(
  productName: string,
  affiliateTag?: string | null
): string {
  const searchQuery = encodeURIComponent(productName);
  const baseUrl = `https://www.amazon.com/s?k=${searchQuery}`;
  return affiliateTag ? `${baseUrl}&tag=${affiliateTag}` : baseUrl;
}

/**
 * Generates a suggested replacement link for a broken Amazon affiliate link
 */
export async function generateSuggestedLink(
  originalUrl: string,
  videoTitle: string,
  videoDescription?: string,
  fallbackAffiliateTag?: string
): Promise<string | null> {
  console.log(`[claude] generateSuggestedLink called for: ${originalUrl.slice(0, 80)}...`);

  // Extract the affiliate tag from the original URL
  const affiliateTag = extractAffiliateTag(originalUrl) || fallbackAffiliateTag;

  // If no affiliate tag, we'll generate a link without one (user can add their own)
  // This is better than returning null and not helping at all
  if (!affiliateTag) {
    console.log("[claude] No affiliate tag found - will generate link without tag (user can add their own)");
  } else {
    console.log(`[claude] Found affiliate tag: ${affiliateTag}`);
  }

  // Get suggestion from Claude
  const suggestion = await suggestReplacementProduct(
    originalUrl,
    videoTitle,
    videoDescription
  );

  if (!suggestion) {
    console.log("[claude] No suggestion returned from Claude");
    return null;
  }

  console.log(`[claude] Got suggestion: ${suggestion.productName}`);

  // Always use search links - they're more reliable than guessed ASINs
  // Search links will show relevant products and always work
  const searchLink = buildAmazonSearchLink(suggestion.productName, affiliateTag);
  console.log(`[claude] Built search link: ${searchLink}`);
  return searchLink;
}

/**
 * Placeholder tag to indicate user needs to add their own
 * Used when no affiliate tag can be found
 */
export const PLACEHOLDER_TAG = "YOUR-TAG-HERE";

/**
 * Uses Claude to extract the product name/type from a broken link and video context
 * Returns a search query that can be used to find replacement products
 */
export async function extractProductSearchQuery(
  originalUrl: string,
  videoTitle: string,
  videoDescription?: string
): Promise<string | null> {
  console.log(`[claude] extractProductSearchQuery called`);

  // Check if API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[claude] ANTHROPIC_API_KEY is not set!");
    return null;
  }

  try {
    const { asin } = extractProductInfoFromUrl(originalUrl);

    // Build context for Claude
    const context = `
Video Title: ${videoTitle}
${videoDescription ? `Video Description snippet: ${videoDescription.slice(0, 500)}...` : ""}
Original broken Amazon URL: ${originalUrl}
${asin ? `Original ASIN: ${asin}` : ""}
    `.trim();

    console.log(`[claude] Extracting product search query...`);
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `Analyze this broken Amazon affiliate link and video context. Extract a SHORT search query (2-5 words) that would find similar products on Amazon.

${context}

Rules:
- Output ONLY the search query, nothing else
- Use generic product terms, not specific brand names
- Example outputs: "wireless gaming headset", "usb c hub", "led ring light"
- If the context gives no clues, respond with "unknown"

Search query:`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const searchQuery = responseText.trim().toLowerCase();

    console.log(`[claude] Extracted search query: "${searchQuery}"`);

    if (!searchQuery || searchQuery === "unknown" || searchQuery.length < 3) {
      return null;
    }

    return searchQuery;
  } catch (error) {
    console.error("[claude] Error extracting product search query:", error);
    return null;
  }
}
