import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
  try {
    const { asin } = extractProductInfoFromUrl(originalUrl);

    // Build context for Claude
    const context = `
Video Title: ${videoTitle}
${videoDescription ? `Video Description snippet: ${videoDescription.slice(0, 500)}...` : ""}
Original broken Amazon URL: ${originalUrl}
${asin ? `Original ASIN: ${asin}` : ""}
    `.trim();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `You are helping a YouTube content creator fix broken Amazon affiliate links in their video descriptions.

${context}

The Amazon product at this URL is no longer available (broken link, discontinued, or out of stock).

Based on the video context and URL, identify:
1. What the original product likely was
2. A current equivalent product available on Amazon in 2025/2026

Respond in this exact JSON format only (no markdown, no explanation):
{
  "originalProduct": "what you think the original product was",
  "suggestedProduct": "name of the current equivalent product",
  "suggestedAsin": "the ASIN (10-character code) if you know it, otherwise null",
  "reason": "brief explanation of why this is a good replacement"
}

If you cannot determine a suitable replacement, respond with:
{
  "originalProduct": "unknown",
  "suggestedProduct": null,
  "suggestedAsin": null,
  "reason": "explanation of why no suggestion could be made"
}`,
        },
      ],
    });

    // Parse the response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Try to parse as JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse Claude response as JSON:", responseText);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.suggestedProduct) {
      return null;
    }

    return {
      productName: parsed.suggestedProduct,
      asin: parsed.suggestedAsin || null,
      reason: parsed.reason || "",
    };
  } catch (error) {
    console.error("Error getting suggestion from Claude:", error);
    return null;
  }
}

/**
 * Builds an Amazon affiliate link from an ASIN and tag
 */
export function buildAmazonAffiliateLink(
  asin: string,
  affiliateTag: string
): string {
  return `https://www.amazon.com/dp/${asin}?tag=${affiliateTag}`;
}

/**
 * Searches for a product on Amazon and returns a potential ASIN
 * This is a simplified approach - in production you'd use Amazon Product Advertising API
 */
export function buildAmazonSearchLink(
  productName: string,
  affiliateTag: string
): string {
  const searchQuery = encodeURIComponent(productName);
  return `https://www.amazon.com/s?k=${searchQuery}&tag=${affiliateTag}`;
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
  // Extract the affiliate tag from the original URL
  const affiliateTag = extractAffiliateTag(originalUrl) || fallbackAffiliateTag;

  if (!affiliateTag) {
    console.error("No affiliate tag found in URL and no fallback provided");
    return null;
  }

  // Get suggestion from Claude
  const suggestion = await suggestReplacementProduct(
    originalUrl,
    videoTitle,
    videoDescription
  );

  if (!suggestion) {
    return null;
  }

  // If Claude provided an ASIN, use it directly
  if (suggestion.asin) {
    return buildAmazonAffiliateLink(suggestion.asin, affiliateTag);
  }

  // Otherwise, build a search link with the suggested product name
  return buildAmazonSearchLink(suggestion.productName, affiliateTag);
}
