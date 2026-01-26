/**
 * Amazon Region Utilities
 *
 * Handles region detection, affiliate tag extraction, and building
 * region-specific Amazon URLs for the "Find Replacement" feature.
 */

export const AMAZON_REGIONS = {
  US: { domain: "amazon.com", flag: "\ud83c\uddfa\ud83c\uddf8", name: "United States", currency: "$" },
  UK: { domain: "amazon.co.uk", flag: "\ud83c\uddec\ud83c\udde7", name: "United Kingdom", currency: "\u00a3" },
  CA: { domain: "amazon.ca", flag: "\ud83c\udde8\ud83c\udde6", name: "Canada", currency: "CA$" },
  DE: { domain: "amazon.de", flag: "\ud83c\udde9\ud83c\uddea", name: "Germany", currency: "\u20ac" },
} as const;

export type AmazonRegion = keyof typeof AMAZON_REGIONS;

/**
 * Detect Amazon region from URL
 * Checks the domain to determine which Amazon marketplace the link points to
 */
export function detectAmazonRegion(url: string): AmazonRegion | null {
  const urlLower = url.toLowerCase();

  // Check in specific order (co.uk before .com to avoid false matches)
  if (urlLower.includes("amazon.co.uk")) return "UK";
  if (urlLower.includes("amazon.ca")) return "CA";
  if (urlLower.includes("amazon.de")) return "DE";
  if (urlLower.includes("amazon.com") || urlLower.includes("amzn.to") || urlLower.includes("amzn.com")) return "US";

  return null;
}

/**
 * Check if a URL is an Amazon link
 */
export function isAmazonLink(url: string): boolean {
  const urlLower = url.toLowerCase();
  return (
    urlLower.includes("amazon.") ||
    urlLower.includes("amzn.to") ||
    urlLower.includes("amzn.com")
  );
}

/**
 * Extract affiliate tag from Amazon URL
 * Looks for the "tag" parameter in various URL formats
 */
export function extractAffiliateTag(url: string): string | null {
  try {
    // Handle amzn.to short links - they don't have tags in URL params
    if (url.includes("amzn.to")) {
      return null;
    }

    const urlObj = new URL(url);

    // Check common tag parameter names
    const tag =
      urlObj.searchParams.get("tag") ||
      urlObj.searchParams.get("linkId") ||
      null;

    if (tag) return tag;

    // Fallback: check for tag in URL path/query string (some malformed URLs)
    const tagMatch = url.match(/[?&]tag=([^&]+)/i);
    if (tagMatch) return tagMatch[1];

    return null;
  } catch {
    // URL parsing failed, try regex fallback
    const tagMatch = url.match(/[?&]tag=([^&]+)/i);
    return tagMatch ? tagMatch[1] : null;
  }
}

/**
 * Build Amazon search URL with affiliate tag
 * Creates a search URL for the specified region with the user's affiliate tag
 */
export function buildAmazonSearchUrl(
  query: string,
  region: AmazonRegion,
  affiliateTag?: string | null
): string {
  const domain = AMAZON_REGIONS[region].domain;
  const searchUrl = new URL(`https://www.${domain}/s`);

  searchUrl.searchParams.set("k", query);

  if (affiliateTag) {
    searchUrl.searchParams.set("tag", affiliateTag);
  }

  return searchUrl.toString();
}

/**
 * Build Amazon product URL with affiliate tag
 * Creates a direct product link for the specified region
 */
export function buildAmazonProductUrl(
  asin: string,
  region: AmazonRegion,
  affiliateTag?: string | null
): string {
  const domain = AMAZON_REGIONS[region].domain;
  const baseUrl = `https://www.${domain}/dp/${asin}`;

  if (affiliateTag) {
    return `${baseUrl}?tag=${affiliateTag}`;
  }

  return baseUrl;
}

/**
 * Extract ASIN from Amazon URL
 * ASIN is the 10-character alphanumeric product identifier
 */
export function extractAsin(url: string): string | null {
  // Pattern for /dp/ASIN or /gp/product/ASIN
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /asin=([A-Z0-9]{10})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Get the user's affiliate tag for a specific region
 */
export function getTagForRegion(
  region: AmazonRegion,
  userTags: {
    affiliateTagUS?: string | null;
    affiliateTagUK?: string | null;
    affiliateTagCA?: string | null;
    affiliateTagDE?: string | null;
    affiliateTag?: string | null; // Legacy fallback
  }
): string | null {
  switch (region) {
    case "US":
      return userTags.affiliateTagUS || userTags.affiliateTag || null;
    case "UK":
      return userTags.affiliateTagUK || null;
    case "CA":
      return userTags.affiliateTagCA || null;
    case "DE":
      return userTags.affiliateTagDE || null;
    default:
      return userTags.affiliateTag || null;
  }
}
