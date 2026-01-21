import { extractAsin, getCachedResult, setCachedResult } from "./link-cache";
import pLimit from "p-limit";

export type LinkStatus =
  | "OK"
  | "OOS"
  | "OOS_THIRD_PARTY"  // Available from other sellers (lower trust)
  | "NOT_FOUND"
  | "SEARCH_REDIRECT"  // Product redirected to Amazon search results (soft 404)
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
  // Cache metadata
  fromCache?: boolean;
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
  NOT_FOUND: 1.0,        // Complete loss - dead link
  SEARCH_REDIRECT: 1.0,  // Complete loss - product redirected to search results
  MISSING_TAG: 1.0,      // Complete loss - no commission earned
  OOS: 0.5,              // Partial loss - Amazon shows similar items
  OOS_THIRD_PARTY: 0.3,  // Lower loss - third party sellers available
  REDIRECT: 0.3,         // Partial loss - may still convert
  OK: 0,                 // No loss
  UNKNOWN: 0.2,          // Conservative estimate
};

// ============================================
// AMAZON DETECTION INDICATORS
// ============================================

// Out of stock - HIGH PRECISION indicators
// These are definitive signals that the product is out of stock
const AMAZON_OOS_INDICATORS_PRECISE = [
  'id="outofstock"',           // Explicit OOS element ID
  'id="availability"',         // Availability container (check with unavailable text)
  "currently unavailable",     // Most reliable text indicator
];

// Out of stock - SECONDARY indicators (use if precise ones not found)
const AMAZON_OOS_INDICATORS_SECONDARY = [
  "out of stock",
  "we don't know when or if this item will be back",
  "this item is not available",
  "sign up to be notified when this item becomes available",
  "temporarily out of stock",
  "this item cannot be shipped",
  "not available for purchase",
  "no offers available",
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
// HIGH PRECISION: Only the definitive "dog page" indicator
const AMAZON_DOG_PAGE_INDICATOR = "looking for something?";

// CAPTCHA/Bot detection - separate from broken (temporary state)
const AMAZON_CAPTCHA_INDICATORS = [
  "to discuss automated access",
  "enter the characters you see below",
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

// Search fallback patterns (Soft 404 - product redirected to search or brand page)
// These indicate the original product no longer exists
const SEARCH_FALLBACK_PATTERNS = [
  "/s?k=",      // Search results page
  "/s/ref=",    // Search with referrer
  "/s?i=",      // Search with index
  "/s?rh=",     // Search with refined hash
  "/stores/",   // Brand store page (product redirected to store)
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
 * Uses HIGH PRECISION indicators first, then secondary
 */
function checkAmazonOOS(html: string): boolean {
  const lowerHtml = html.toLowerCase();

  // First check precise indicators (id="outOfStock", id="availability", "currently unavailable")
  const hasPreciseIndicator = AMAZON_OOS_INDICATORS_PRECISE.some(indicator =>
    lowerHtml.includes(indicator.toLowerCase())
  );

  if (hasPreciseIndicator) {
    return true;
  }

  // Then check secondary indicators
  return AMAZON_OOS_INDICATORS_SECONDARY.some(indicator =>
    lowerHtml.includes(indicator.toLowerCase())
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
 * Checks if HTML content indicates Amazon "dog page" (product completely gone)
 * HIGH PRECISION: Only checks for the definitive "looking for something?" text
 */
function checkAmazonDogPage(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return lowerHtml.includes(AMAZON_DOG_PAGE_INDICATOR);
}

/**
 * Checks if HTML content indicates CAPTCHA/bot detection
 */
function checkAmazonCaptcha(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return AMAZON_CAPTCHA_INDICATORS.some(indicator =>
    lowerHtml.includes(indicator.toLowerCase())
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
    // Optimized for speed: no JS rendering, explicit redirect following
    const params = new URLSearchParams({
      api_key: apiKey,
      url: targetUrl,
      premium_proxy: "true",           // Uses residential IPs to bypass Amazon blocks
      country_code: "us",              // Keeps results consistent
      render_js: "false",              // SPEED: Skip JS rendering - we only need HTML
      forward_headers: "true",         // Forward our headers to target
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
  finalUrl: string | null,
  fromCache: boolean = false
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
    fromCache,
  };
}

/**
 * Creates a result and saves it to the ASIN cache (if ASIN can be extracted)
 * This ensures all link check results are cached for future lookups
 */
async function createAndCacheResult(
  originalUrl: string,
  status: LinkStatus,
  reason: string,
  httpStatus: number | null,
  finalUrl: string | null
): Promise<LinkCheckResult> {
  const result = createResult(originalUrl, status, reason, httpStatus, finalUrl, false);

  // Try to extract ASIN from the final URL (more reliable than original for shortlinks)
  const asin = extractAsin(finalUrl || "") || extractAsin(originalUrl);
  if (asin) {
    // Save to cache asynchronously (don't await - fire and forget)
    setCachedResult(asin, status, finalUrl, reason, httpStatus).catch(() => {
      // Ignore cache errors
    });
  }

  return result;
}

/**
 * LinkMedic Bot 2.0 - Enhanced link checker with full detection matrix
 *
 * Detection Priority (order matters!):
 * 1. Unfurling: Follow all redirects to final URL via ScrapingBee
 * 2. Search Fallback: Check finalUrl for /s?k= or /s/ref= (BEFORE status code!)
 * 3. HTTP Status: Check for 4xx/5xx errors
 * 4. Dog Page: Check for Amazon's "looking for something?" page
 * 5. Missing Tag: Check if affiliate tag was stripped
 * 6. OOS Detection: Check for "currently unavailable" indicators
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

  // ============================================
  // PHASE 0: ASIN CACHE CHECK (Saves ScrapingBee credits!)
  // ============================================
  // Try to extract ASIN from URL and check cache first
  // This works for resolved URLs - shortlinks will be resolved first
  const asinFromUrl = extractAsin(url);
  if (asinFromUrl && isAmazon) {
    const cached = await getCachedResult(asinFromUrl);
    if (cached) {
      // Return cached result immediately - no API call needed!
      return createResult(
        originalUrl,
        cached.status,
        cached.reason ? `${cached.reason} (cached)` : "Cached result",
        cached.httpStatus,
        cached.finalUrl,
        true // fromCache = true
      );
    }
  }

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
      // HIGH-PRECISION DETECTION ORDER (DO NOT CHANGE!)
      // 1. SEARCH_REDIRECT - Check URL patterns first
      // 2. OOS - Check HTML for out of stock BEFORE broken
      // 3. NOT_FOUND (Broken) - Only 404 status OR "dog page"
      // 4. MISSING_TAG - Check affiliate tag presence
      // ============================================

      // ============================================
      // PHASE 1: SEARCH/CATALOGUE REDIRECT (Check URL first!)
      // ============================================
      // If finalUrl contains search or store patterns, product was redirected
      if (isSearchFallback(finalUrl)) {
        return createAndCacheResult(
          originalUrl,
          "SEARCH_REDIRECT",
          "Landed on Search/Brand Page - Product no longer available",
          httpStatus,
          finalUrl
        );
      }

      // ============================================
      // PHASE 2: OUT OF STOCK (Check BEFORE broken!)
      // ============================================
      // Look for id="outOfStock", id="availability", or "Currently unavailable"
      if (isAmazon || isAmazonDomain(finalUrl)) {
        if (checkAmazonOOS(html)) {
          return createAndCacheResult(
            originalUrl,
            "OOS",
            "Out of Stock - Product currently unavailable",
            httpStatus,
            finalUrl
          );
        }

        // Check for third-party only availability (lower conversion)
        const hasAddToCart = html.includes('id="add-to-cart-button"') ||
                             html.includes('id="buy-now-button"') ||
                             html.includes('name="submit.add-to-cart"');

        if (checkAmazonThirdParty(html) && !hasAddToCart) {
          return createAndCacheResult(
            originalUrl,
            "OOS_THIRD_PARTY",
            "Third Party Only - Available from other sellers",
            httpStatus,
            finalUrl
          );
        }
      }

      // ============================================
      // PHASE 3: BROKEN (Dog Page or 404 ONLY)
      // ============================================
      // HIGH PRECISION: Only mark as broken if:
      // - HTTP status is 404/410, OR
      // - Body contains "looking for something?" (Amazon dog page)

      // Check for HTTP 404/410
      if (httpStatus === 404 || httpStatus === 410) {
        return createAndCacheResult(
          originalUrl,
          "NOT_FOUND",
          `HTTP ${httpStatus} - Page not found`,
          httpStatus,
          finalUrl
        );
      }

      // Check for Amazon "dog page" (definitive broken indicator)
      if (isAmazon || isAmazonDomain(finalUrl)) {
        if (checkAmazonDogPage(html)) {
          return createAndCacheResult(
            originalUrl,
            "NOT_FOUND",
            "Dog Page - Product no longer exists on Amazon",
            httpStatus,
            finalUrl
          );
        }

        // Check for CAPTCHA/bot detection page (temporary, don't mark as broken)
        if (checkAmazonCaptcha(html)) {
          // Don't cache CAPTCHA results - they're temporary
          return createResult(
            originalUrl,
            "UNKNOWN",
            "Bot detection - CAPTCHA page encountered",
            httpStatus,
            finalUrl
          );
        }
      }

      // ============================================
      // PHASE 4: MISSING AFFILIATE TAG
      // ============================================
      if (isAmazon || isAmazonDomain(finalUrl)) {
        // If original had a tag but final doesn't, it was stripped
        if (originalHadTag && !hasAffiliateTag(finalUrl)) {
          return createAndCacheResult(
            originalUrl,
            "MISSING_TAG",
            "Affiliate tag stripped - No commission will be earned",
            httpStatus,
            finalUrl
          );
        }

        // If we have an expected tag, verify it's present
        if (originalTag && !finalUrl.includes(`tag=${originalTag}`)) {
          return createAndCacheResult(
            originalUrl,
            "MISSING_TAG",
            `Expected tag "${originalTag}" not found in final URL`,
            httpStatus,
            finalUrl
          );
        }
      }

      // ============================================
      // PHASE 5: REDIRECT DETECTION (Other redirects)
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
          // Don't cache shortener failures - they might resolve later
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
          return createAndCacheResult(
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
            return createAndCacheResult(
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
      return createAndCacheResult(
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
 * @deprecated Use checkLinksParallel for better performance
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

// ============================================
// PARALLEL LINK CHECKING (Performance Optimized)
// ============================================

// Default concurrency limit - balance between speed and not overwhelming APIs
const DEFAULT_CONCURRENCY = 5;

/**
 * Callback for progress updates during parallel link checking
 */
export type LinkCheckProgressCallback = (
  completed: number,
  total: number,
  result: LinkCheckResult
) => void;

/**
 * Options for parallel link checking
 */
export interface ParallelCheckOptions {
  concurrency?: number;           // Max concurrent requests (default: 5)
  onProgress?: LinkCheckProgressCallback;  // Callback for streaming results
}

/**
 * Checks multiple links in parallel with concurrency control
 * Uses p-limit to run up to N checks simultaneously while respecting rate limits
 *
 * This is 5-10x faster than sequential checking for larger audits.
 *
 * @param links - Array of link objects with url and isAmazon flag
 * @param options - Concurrency and progress options
 * @returns Map of URL to LinkCheckResult
 */
export async function checkLinksParallel(
  links: Array<{ url: string; isAmazon: boolean }>,
  options: ParallelCheckOptions = {}
): Promise<Map<string, LinkCheckResult>> {
  const { concurrency = DEFAULT_CONCURRENCY, onProgress } = options;
  const results = new Map<string, LinkCheckResult>();
  const limit = pLimit(concurrency);

  let completed = 0;
  const total = links.length;

  console.log(`[LinkChecker] Starting parallel check: ${total} links with concurrency ${concurrency}`);
  const startTime = Date.now();

  // Create array of limited promises
  const promises = links.map(({ url, isAmazon }) =>
    limit(async () => {
      const result = await checkLink(url, isAmazon);
      results.set(url, result);

      completed++;

      // Call progress callback if provided (for UI streaming)
      if (onProgress) {
        onProgress(completed, total, result);
      }

      // Log progress every 5 links
      if (completed % 5 === 0 || completed === total) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[LinkChecker] Progress: ${completed}/${total} (${elapsed}s elapsed)`);
      }

      return result;
    })
  );

  // Wait for all checks to complete
  await Promise.all(promises);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[LinkChecker] Completed ${total} links in ${totalTime}s (${(total / parseFloat(totalTime)).toFixed(1)} links/sec)`);

  return results;
}

/**
 * Export severity map for use in revenue calculations
 */
export { SEVERITY_MAP };
