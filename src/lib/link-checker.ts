export type LinkStatus =
  | "OK"
  | "OOS"
  | "OOS_THIRD_PARTY"  // Available from other sellers (lower trust)
  | "NOT_FOUND"
  | "MISSING_TAG"      // Valid page but affiliate tag stripped
  | "REDIRECT"         // Stuck in redirect or non-Amazon destination
  | "UNKNOWN";

export interface LinkCheckResult {
  status: LinkStatus;
  httpStatus: number | null;
  originalUrl: string;
  finalUrl: string | null;
  reason: string;
  severity: number;
  lastChecked: Date;
  // Legacy fields for backwards compatibility
  availabilityStatus: string | null;
  notes: string | null;
}

// ============================================
// USER-AGENT ROTATION (Anti-Bot Layer)
// ============================================
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ============================================
// SEVERITY FACTORS (Revenue Impact)
// ============================================
const SEVERITY_MAP: Record<LinkStatus, number> = {
  NOT_FOUND: 1.0,       // Complete loss - dead link
  MISSING_TAG: 1.0,     // Complete loss - no commission earned
  OOS: 0.5,             // Partial loss - Amazon shows similar items
  OOS_THIRD_PARTY: 0.3, // Lower loss - third party sellers available
  REDIRECT: 0.3,        // Partial loss - may still convert
  OK: 0,                // No loss
  UNKNOWN: 0.2,         // Conservative estimate
};

// ============================================
// AMAZON DETECTION INDICATORS
// ============================================

// Out of stock - main listing unavailable
// These appear in rendered HTML even without JS
const AMAZON_OOS_INDICATORS = [
  "currently unavailable",
  "out of stock",
  "we don't know when or if this item will be back",
  "this item is not available",
  "we don't know when or if this item will be back in stock",
  "sign up to be notified when this item becomes available",
  "temporarily out of stock",
  "this item cannot be shipped",
  "not available for purchase",
  "no offers available",
  // ID-based indicators (from HTML attributes)
  'id="outofstock"',
  'id="availability"', // Check in conjunction with unavailable text
  "availabilityinsidebuybox_feature_div", // OOS buybox div
];

// Third-party sellers available (lower trust, still some conversion)
// Note: Look for these WITHOUT "add-to-cart-button" present
const AMAZON_THIRD_PARTY_INDICATORS = [
  "available from these sellers",
  "see all buying options",
  "other sellers on amazon",
  "new & used",
  "olp-padding-right", // Other sellers panel
  "a]offers-table", // Offers table
  "mbc-offer-row", // Marketplace offer rows
];

// Amazon "dog page" / product not found indicators (product completely gone)
const AMAZON_NOT_FOUND_INDICATORS = [
  "looking for something?", // Dog page specific text
  "sorry, we couldn't find that page",
  "the web address you entered is not a functioning page",
  "sorry! we couldn't find that page",
  "to discuss automated access", // Bot detection page
  "enter the characters you see below", // CAPTCHA page
];

// Error page indicators
const ERROR_PAGE_INDICATORS = [
  "Page not found",
  "404",
  "Product not found",
  "This page doesn't exist",
  "Sorry, we couldn't find that page",
  "The page you requested could not be found",
];

// ============================================
// CONFIGURATION
// ============================================
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second
const MIN_JITTER_DELAY = 1000; // 1 second minimum between checks (ScrapingBee handles rate limiting)
const MAX_JITTER_DELAY = 2000; // 2 seconds maximum between checks

// Amazon affiliate tag regex: tag=something-20 (or similar formats)
const AMAZON_TAG_REGEX = /[?&]tag=[a-zA-Z0-9_-]+-[0-9]{2}/;

// Search fallback patterns (Soft 404 - product redirected to search)
const SEARCH_FALLBACK_PATTERNS = [
  "/s?k=",
  "/s/ref=",
  "/s?i=",
  "/s?rh=",
];

/**
 * Sleeps for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Returns a jittered delay between MIN and MAX for anti-bot protection
 */
export function getJitteredDelay(): number {
  return Math.floor(Math.random() * (MAX_JITTER_DELAY - MIN_JITTER_DELAY + 1)) + MIN_JITTER_DELAY;
}

/**
 * Checks if HTML content indicates Amazon out of stock (primary listing)
 */
function checkAmazonOOS(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return AMAZON_OOS_INDICATORS.some(indicator =>
    lowerHtml.includes(indicator)
  );
}

/**
 * Checks if HTML content indicates third-party sellers only
 */
function checkAmazonThirdParty(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return AMAZON_THIRD_PARTY_INDICATORS.some(indicator =>
    lowerHtml.includes(indicator)
  );
}

/**
 * Checks if HTML content indicates Amazon product not found ("dog page")
 */
function checkAmazonNotFound(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return AMAZON_NOT_FOUND_INDICATORS.some(indicator =>
    lowerHtml.includes(indicator)
  );
}

/**
 * Checks if HTML content indicates an error page
 */
function isErrorPage(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return ERROR_PAGE_INDICATORS.some(indicator =>
    lowerHtml.includes(indicator.toLowerCase())
  );
}

/**
 * Checks if URL is a search results page (Soft 404)
 * Amazon sometimes redirects dead products to search results
 */
function isSearchFallback(url: string): boolean {
  return SEARCH_FALLBACK_PATTERNS.some(pattern => url.includes(pattern));
}

/**
 * Checks if Amazon affiliate tag is present in URL
 */
function hasAffiliateTag(url: string): boolean {
  return AMAZON_TAG_REGEX.test(url);
}

/**
 * Checks if URL is an Amazon domain
 */
function isAmazonDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("amazon.") || urlObj.hostname.includes("amzn.");
  } catch {
    return false;
  }
}

/**
 * Checks if original URL had a product identifier that's now missing
 * E.g., /dp/B00XYZ/ in original but /s?k= in final
 */
function hadProductIntent(originalUrl: string): boolean {
  return originalUrl.includes("/dp/") ||
         originalUrl.includes("/gp/product/") ||
         originalUrl.includes("/exec/obidos/ASIN/");
}

// ============================================
// SCRAPINGBEE INTEGRATION
// ============================================

interface ShieldedDataResult {
  body: string | null;
  status: number;
  finalUrl: string;
}

/**
 * Fetches URL data through ScrapingBee's premium proxy network
 * - Uses residential IPs to bypass Amazon bot detection
 * - Returns the final resolved URL after all redirects (crucial for search fallback detection)
 * - Falls back to direct fetch if ScrapingBee is unavailable
 */
async function getShieldedData(targetUrl: string): Promise<ShieldedDataResult> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  // If no API key, fall back to direct fetch (for development/testing)
  if (!apiKey) {
    console.warn("[LinkChecker] No SCRAPINGBEE_API_KEY found, using direct fetch (may be blocked by Amazon)");
    return getDirectData(targetUrl);
  }

  try {
    // Build ScrapingBee API URL with params
    const params = new URLSearchParams({
      api_key: apiKey,
      url: targetUrl,
      premium_proxy: "true",           // Uses residential IPs to bypass Amazon blocks
      country_code: "us",              // Keeps results consistent
      return_page_source: "true",
      transparent_status_code: "true", // Returns the 404/200 code from Amazon, not ScrapingBee
    });

    const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params.toString()}`, {
      method: "GET",
      headers: {
        "Accept": "text/html",
      },
    });

    // ScrapingBee returns the final URL after redirects in the 'Spb-resolved-url' header
    const finalUrl = response.headers.get("spb-resolved-url") || targetUrl;
    const body = await response.text();

    console.log(`[ScrapingBee] ${targetUrl.substring(0, 50)}... -> ${response.status} | Final: ${finalUrl.substring(0, 60)}...`);

    return {
      body,
      status: response.status,
      finalUrl,
    };
  } catch (error) {
    console.error("[ScrapingBee Error]", error instanceof Error ? error.message : error);
    // Fall back to direct fetch on ScrapingBee error
    return getDirectData(targetUrl);
  }
}

/**
 * Direct fetch fallback when ScrapingBee is unavailable
 * Uses User-Agent rotation but may be blocked by Amazon
 */
async function getDirectData(targetUrl: string): Promise<ShieldedDataResult> {
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": getRandomUserAgent(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const body = await response.text();

    return {
      body,
      status: response.status,
      finalUrl: response.url,
    };
  } catch (error) {
    console.error("[DirectFetch Error]", error instanceof Error ? error.message : error);
    return {
      body: null,
      status: 500,
      finalUrl: targetUrl,
    };
  }
}

/**
 * Helper to create a LinkCheckResult with proper structure
 */
function createResult(
  originalUrl: string,
  status: LinkStatus,
  reason: string,
  httpStatus: number | null,
  finalUrl: string | null
): LinkCheckResult {
  return {
    status,
    httpStatus,
    originalUrl,
    finalUrl,
    reason,
    severity: SEVERITY_MAP[status],
    lastChecked: new Date(),
    // Legacy fields
    availabilityStatus: status === "OK" ? "available" : status.toLowerCase(),
    notes: reason,
  };
}

/**
 * LinkMedic Bot 2.0 - Enhanced link checker with full detection matrix
 *
 * Detection Priority:
 * 1. Unfurling: Follow all redirects to final URL
 * 2. Search Fallback: Check if redirected to search page (Soft 404)
 * 3. Missing Tag: Check if affiliate tag was stripped
 * 4. HTTP Status: Check for 4xx/5xx errors
 * 5. Dog Page: Check for Amazon's "looking for something?" page
 * 6. OOS Detection: Check for out of stock indicators
 * 7. Third Party: Check for "available from these sellers"
 *
 * @param url - The URL to check
 * @param isAmazon - Whether this is an Amazon link (for enhanced detection)
 * @param originalTag - Optional: the original affiliate tag to verify
 */
export async function checkLink(
  url: string,
  isAmazon: boolean = false,
  originalTag?: string
): Promise<LinkCheckResult> {
  let lastError: Error | null = null;
  const originalUrl = url;
  const originalHadTag = hasAffiliateTag(url);
  const originalHadProduct = hadProductIntent(url);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential backoff between retries
      await sleep(RETRY_DELAY * Math.pow(2, attempt - 1));
    }

    try {
      // ============================================
      // PHASE 1: UNFURLING - Follow all redirects via ScrapingBee
      // ============================================
      // ScrapingBee returns the final resolved URL in headers
      const shieldedResult = await getShieldedData(url);
      const httpStatus = shieldedResult.status;
      const finalUrl = shieldedResult.finalUrl;
      const html = shieldedResult.body || "";

      // If ScrapingBee returned no body, treat as error
      if (!shieldedResult.body) {
        throw new Error("Empty response body from proxy");
      }

      // ============================================
      // PHASE 2: HTTP STATUS CHECK
      // ============================================
      // Terminal 404/410 - Not found
      if (httpStatus === 404 || httpStatus === 410) {
        return createResult(
          originalUrl,
          "NOT_FOUND",
          `HTTP ${httpStatus} - Page not found`,
          httpStatus,
          finalUrl
        );
      }

      // Other error status codes (5xx, other 4xx)
      if (httpStatus >= 400) {
        return createResult(
          originalUrl,
          "NOT_FOUND",
          `HTTP ${httpStatus} - Server error`,
          httpStatus,
          finalUrl
        );
      }

      // ============================================
      // PHASE 3: SEARCH FALLBACK DETECTION (Soft 404)
      // ============================================
      // Check if a product link was redirected to search results
      if (isSearchFallback(finalUrl)) {
        // If original URL was a product page but ended up on search, it's a soft 404
        if (originalHadProduct || isAmazon) {
          return createResult(
            originalUrl,
            "NOT_FOUND",
            "Search Fallback - Product redirected to search results",
            httpStatus,
            finalUrl
          );
        }
      }

      // ============================================
      // PHASE 4: AMAZON-SPECIFIC CHECKS
      // ============================================
      if (isAmazon || isAmazonDomain(finalUrl)) {
        // Check for Amazon "dog page" (product completely gone)
        // Look for id="d" or "looking for something?" text
        if (checkAmazonNotFound(html) || html.includes('id="d"')) {
          return createResult(
            originalUrl,
            "NOT_FOUND",
            "Dog Page - Product no longer exists on Amazon",
            httpStatus,
            finalUrl
          );
        }

        // Check for CAPTCHA/bot detection page
        if (html.includes("enter the characters") || html.includes("automated access")) {
          return createResult(
            originalUrl,
            "UNKNOWN",
            "Bot detection - CAPTCHA page encountered",
            httpStatus,
            finalUrl
          );
        }

        // Check for generic error page
        if (isErrorPage(html)) {
          return createResult(
            originalUrl,
            "NOT_FOUND",
            "Error Page - Redirected to error page",
            httpStatus,
            finalUrl
          );
        }

        // ============================================
        // PHASE 5: MISSING AFFILIATE TAG CHECK
        // ============================================
        // If original had a tag but final doesn't, it was stripped
        if (originalHadTag && !hasAffiliateTag(finalUrl)) {
          return createResult(
            originalUrl,
            "MISSING_TAG",
            "Affiliate tag stripped - No commission will be earned",
            httpStatus,
            finalUrl
          );
        }

        // If we have an expected tag, verify it's present
        if (originalTag && !finalUrl.includes(`tag=${originalTag}`)) {
          return createResult(
            originalUrl,
            "MISSING_TAG",
            `Expected tag "${originalTag}" not found in final URL`,
            httpStatus,
            finalUrl
          );
        }

        // ============================================
        // PHASE 6: OUT OF STOCK DETECTION
        // ============================================
        // Check for Add to Cart button presence (Amazon's main buy button)
        const hasAddToCart = html.includes('id="add-to-cart-button"') ||
                             html.includes('id="buy-now-button"') ||
                             html.includes('name="submit.add-to-cart"');

        // Check for primary OOS indicators first
        if (checkAmazonOOS(html)) {
          return createResult(
            originalUrl,
            "OOS",
            "Out of Stock - Product currently unavailable",
            httpStatus,
            finalUrl
          );
        }

        // Check for third-party only availability (lower conversion)
        // This is when the main Amazon listing is gone but other sellers exist
        if (checkAmazonThirdParty(html) && !hasAddToCart) {
          return createResult(
            originalUrl,
            "OOS_THIRD_PARTY",
            "Third Party Only - Available from other sellers",
            httpStatus,
            finalUrl
          );
        }
      }

      // ============================================
      // PHASE 7: REDIRECT DETECTION
      // ============================================
      // Check for various redirect scenarios
      try {
        const originalDomain = new URL(originalUrl).hostname;
        const finalDomain = new URL(finalUrl).hostname;

        // Check if redirected to a completely different domain
        const originalIsAmazon = originalDomain.includes("amazon.") || originalDomain.includes("amzn.");
        const finalIsAmazon = finalDomain.includes("amazon.") || finalDomain.includes("amzn.");

        // Case 1: Link shortener that didn't resolve
        const isShortener = originalDomain.includes("bit.ly") || originalDomain.includes("amzn.to") ||
                           originalDomain.includes("goo.gl") || originalDomain.includes("t.co") ||
                           originalDomain.includes("tinyurl.") || originalDomain.includes("ow.ly");

        if (isShortener && finalDomain === originalDomain) {
          return createResult(
            originalUrl,
            "REDIRECT",
            "Redirect Failed - Link shortener did not resolve",
            httpStatus,
            finalUrl
          );
        }

        // Case 2: Amazon link redirected to non-Amazon (external redirect)
        if (originalIsAmazon && !finalIsAmazon) {
          return createResult(
            originalUrl,
            "REDIRECT",
            "External Redirect - Amazon link redirected off-site",
            httpStatus,
            finalUrl
          );
        }

        // Case 3: Product redirect to different product (ASIN changed)
        if (originalIsAmazon && finalIsAmazon) {
          const originalAsin = originalUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
          const finalAsin = finalUrl.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);

          if (originalAsin && finalAsin && originalAsin[1] !== finalAsin[1]) {
            return createResult(
              originalUrl,
              "REDIRECT",
              `Product Redirect - ASIN changed from ${originalAsin[1]} to ${finalAsin[1]}`,
              httpStatus,
              finalUrl
            );
          }
        }

        // Case 4: Non-Amazon link redirected to error page
        if (!isAmazon && isErrorPage(html)) {
          return createResult(
            originalUrl,
            "NOT_FOUND",
            "Error Page - Redirected to error page",
            httpStatus,
            finalUrl
          );
        }
      } catch {
        // URL parsing failed, continue with checks
      }

      // ============================================
      // PHASE 8: ALL CHECKS PASSED - LINK IS OK
      // ============================================
      return createResult(
        originalUrl,
        "OK",
        "Active and Buyable",
        httpStatus,
        finalUrl
      );

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's the last attempt, return unknown status
      if (attempt === MAX_RETRIES) {
        const isTimeout = lastError.name === "AbortError" || lastError.message.includes("timeout");
        return createResult(
          originalUrl,
          "UNKNOWN",
          isTimeout ? "Request timed out" : `Network error: ${lastError.message}`,
          null,
          null
        );
      }
    }
  }

  // Should not reach here, but just in case
  return createResult(
    originalUrl,
    "UNKNOWN",
    lastError?.message || "Unknown error",
    null,
    null
  );
}

/**
 * Checks multiple links with jittered rate limiting (anti-bot protection)
 * @param urls - Array of URLs to check
 * @param isAmazonMap - Map of URL to whether it's an Amazon link
 * @param useJitter - Use random 2-4 second delays between checks (default: true)
 */
export async function checkLinksWithRateLimit(
  urls: string[],
  isAmazonMap: Map<string, boolean>,
  useJitter: boolean = true
): Promise<Map<string, LinkCheckResult>> {
  const results = new Map<string, LinkCheckResult>();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const isAmazon = isAmazonMap.get(url) || false;
    const result = await checkLink(url, isAmazon);
    results.set(url, result);

    // Jittered rate limiting (anti-bot protection)
    if (i < urls.length - 1) {
      const delay = useJitter ? getJitteredDelay() : 500;
      await sleep(delay);
    }
  }

  return results;
}

/**
 * Export severity map for use in revenue calculations
 */
export { SEVERITY_MAP };
