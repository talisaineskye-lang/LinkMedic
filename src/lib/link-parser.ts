import {
  AffiliateMerchant,
  detectMerchant,
  isAffiliateLink,
} from "./affiliate-networks";

export interface ParsedLink {
  url: string;
  merchant: AffiliateMerchant;
  asin?: string;
}

// URL regex that matches most common URL formats
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;

// Patterns to ignore (timestamps, emails, social handles)
const TIMESTAMP_REGEX = /^\d{1,2}:\d{2}(:\d{2})?$/;
const EMAIL_REGEX = /^mailto:|@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Amazon URL patterns
const AMAZON_DOMAINS = [
  "amazon.com",
  "amazon.co.uk",
  "amazon.ca",
  "amazon.de",
  "amazon.fr",
  "amazon.es",
  "amazon.it",
  "amazon.co.jp",
  "amazon.com.au",
  "amazon.in",
  "amzn.to",
  "amzn.com",
  "a.co",
];

// ASIN regex (Amazon Standard Identification Number)
const ASIN_REGEX = /\/(?:dp|gp\/product|ASIN)\/([A-Z0-9]{10})/i;
const ASIN_FROM_URL_REGEX = /[?&](?:asin|ASIN)=([A-Z0-9]{10})/i;

// Tracking params to remove for normalization
const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
  "ref_",
  "linkCode",
  "linkId",
  "pd_rd_i",
  "pd_rd_r",
  "pd_rd_w",
  "pd_rd_wg",
  "pf_rd_i",
  "pf_rd_m",
  "pf_rd_p",
  "pf_rd_r",
  "pf_rd_s",
  "pf_rd_t",
  "psc",
  "smid",
  "spLa",
  "sr",
  "th",
  "fbclid",
  "gclid",
  "dclid",
];

/**
 * Checks if a URL is from Amazon
 */
export function isAmazonUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return AMAZON_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Extracts ASIN from an Amazon URL
 */
function extractAsin(url: string): string | undefined {
  // Try to extract from path
  const pathMatch = url.match(ASIN_REGEX);
  if (pathMatch) return pathMatch[1];

  // Try to extract from query params
  const queryMatch = url.match(ASIN_FROM_URL_REGEX);
  if (queryMatch) return queryMatch[1];

  return undefined;
}

/**
 * Normalizes a URL by removing tracking parameters
 */
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Remove tracking params
    TRACKING_PARAMS.forEach(param => {
      urlObj.searchParams.delete(param);
    });

    // Clean up hash if it looks like tracking
    if (urlObj.hash && urlObj.hash.includes("ref=")) {
      urlObj.hash = "";
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Checks if a string looks like a timestamp (not a URL)
 */
function isTimestamp(text: string): boolean {
  return TIMESTAMP_REGEX.test(text);
}

/**
 * Checks if a URL should be ignored (email, social handle, etc.)
 */
function shouldIgnore(url: string): boolean {
  return EMAIL_REGEX.test(url);
}

/**
 * Extracts and parses all URLs from a video description
 * @param description - The video description text
 * @returns Array of parsed links with merchant info
 */
export function extractLinksFromDescription(description: string): ParsedLink[] {
  if (!description) return [];

  // Find all URLs
  const matches = description.match(URL_REGEX) || [];

  // Process and deduplicate
  const seenUrls = new Set<string>();
  const links: ParsedLink[] = [];

  for (const rawUrl of matches) {
    // Clean up URL (remove trailing punctuation)
    const url = rawUrl.replace(/[.,;:!?)]+$/, "");

    // Skip timestamps and emails
    if (isTimestamp(url) || shouldIgnore(url)) continue;

    // Normalize the URL
    const normalizedUrl = normalizeUrl(url);

    // Skip duplicates
    if (seenUrls.has(normalizedUrl)) continue;
    seenUrls.add(normalizedUrl);

    // Determine merchant using multi-network detection
    const merchant = detectMerchant(normalizedUrl);
    const asin = merchant === "amazon" ? extractAsin(normalizedUrl) : undefined;

    links.push({
      url: normalizedUrl,
      merchant,
      asin,
    });
  }

  return links;
}

/**
 * Filters links to only include affiliate links from supported networks
 */
export function filterAffiliateLinks(links: ParsedLink[]): ParsedLink[] {
  return links.filter(link => isAffiliateLink(link.url));
}

/**
 * Gets statistics about extracted links
 */
export function getLinkStats(links: ParsedLink[]): {
  total: number;
  amazon: number;
  affiliate: number;
  other: number;
  withAsin: number;
} {
  const affiliateLinks = links.filter(l => l.merchant !== "other");
  return {
    total: links.length,
    amazon: links.filter(l => l.merchant === "amazon").length,
    affiliate: affiliateLinks.length,
    other: links.filter(l => l.merchant === "other").length,
    withAsin: links.filter(l => l.asin).length,
  };
}
