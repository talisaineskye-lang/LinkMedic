export type LinkStatus = "OK" | "OOS" | "NOT_FOUND" | "REDIRECT" | "UNKNOWN";

export interface LinkCheckResult {
  status: LinkStatus;
  httpStatus: number | null;
  finalUrl: string | null;
  availabilityStatus: string | null;
  notes: string | null;
}

// Amazon out-of-stock indicators
const AMAZON_OOS_INDICATORS = [
  "currently unavailable",
  "out of stock",
  "we don't know when or if this item will be back",
  "this item is not available",
  "we don't know when or if this item will be back in stock",
  "available from these sellers",
  "sign up to be notified when this item becomes available",
  "temporarily out of stock",
  "this item cannot be shipped",
  "not available for purchase",
  "no offers available",
  "see all buying options", // Often shown when main listing unavailable
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

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Sleeps for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if HTML content indicates Amazon out of stock
 */
function checkAmazonOOS(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return AMAZON_OOS_INDICATORS.some(indicator =>
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
 * Fetches a URL with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        ...options.headers,
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Checks a single link's health status
 * @param url - The URL to check
 * @param isAmazon - Whether this is an Amazon link (for OOS detection)
 */
export async function checkLink(
  url: string,
  isAmazon: boolean = false
): Promise<LinkCheckResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential backoff
      await sleep(RETRY_DELAY * Math.pow(2, attempt - 1));
    }

    try {
      // First try HEAD request
      let response: Response;
      try {
        response = await fetchWithTimeout(url, { method: "HEAD" });
      } catch {
        // Fallback to GET if HEAD fails
        response = await fetchWithTimeout(url, { method: "GET" });
      }

      const httpStatus = response.status;
      const finalUrl = response.url;

      // 404 / 410 - Not found
      if (httpStatus === 404 || httpStatus === 410) {
        return {
          status: "NOT_FOUND",
          httpStatus,
          finalUrl,
          availabilityStatus: "broken",
          notes: `HTTP ${httpStatus}`,
        };
      }

      // Other error status codes
      if (httpStatus >= 400) {
        return {
          status: "NOT_FOUND",
          httpStatus,
          finalUrl,
          availabilityStatus: "error",
          notes: `HTTP ${httpStatus}`,
        };
      }

      // For Amazon links, check for out of stock or "dog page" in response body
      if (isAmazon && httpStatus === 200) {
        // Need to do a GET request to check the body
        const getResponse = await fetchWithTimeout(url, { method: "GET" });
        const html = await getResponse.text();

        // Check for Amazon "dog page" (product not found)
        if (checkAmazonNotFound(html)) {
          return {
            status: "NOT_FOUND",
            httpStatus,
            finalUrl: getResponse.url,
            availabilityStatus: "not_found",
            notes: "Product no longer exists on Amazon",
          };
        }

        // Check for generic error page
        if (isErrorPage(html)) {
          return {
            status: "NOT_FOUND",
            httpStatus,
            finalUrl: getResponse.url,
            availabilityStatus: "error_page",
            notes: "Redirected to error page",
          };
        }

        // Check for out of stock / currently unavailable
        if (checkAmazonOOS(html)) {
          return {
            status: "OOS",
            httpStatus,
            finalUrl: getResponse.url,
            availabilityStatus: "out_of_stock",
            notes: "Product is currently unavailable",
          };
        }
      }

      // Check if redirected to an error page (non-Amazon)
      if (httpStatus >= 200 && httpStatus < 300) {
        // Only check body for potential error pages on suspicious URLs
        if (finalUrl !== url) {
          const getResponse = await fetchWithTimeout(url, { method: "GET" });
          const html = await getResponse.text();
          if (isErrorPage(html)) {
            return {
              status: "NOT_FOUND",
              httpStatus,
              finalUrl: getResponse.url,
              availabilityStatus: "error_page",
              notes: "Redirected to error page",
            };
          }
        }

        return {
          status: "OK",
          httpStatus,
          finalUrl,
          availabilityStatus: "available",
          notes: null,
        };
      }

      // Redirect status (3xx) - follow was enabled so this shouldn't happen
      if (httpStatus >= 300 && httpStatus < 400) {
        return {
          status: "REDIRECT",
          httpStatus,
          finalUrl,
          availabilityStatus: "redirect",
          notes: `Redirected to ${finalUrl}`,
        };
      }

      // Success
      return {
        status: "OK",
        httpStatus,
        finalUrl,
        availabilityStatus: "available",
        notes: null,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's the last attempt, return unknown status
      if (attempt === MAX_RETRIES) {
        const isTimeout = lastError.name === "AbortError" || lastError.message.includes("timeout");
        return {
          status: "UNKNOWN",
          httpStatus: null,
          finalUrl: null,
          availabilityStatus: isTimeout ? "timeout" : "error",
          notes: isTimeout ? "Request timed out" : `Error: ${lastError.message}`,
        };
      }
    }
  }

  // Should not reach here, but just in case
  return {
    status: "UNKNOWN",
    httpStatus: null,
    finalUrl: null,
    availabilityStatus: "error",
    notes: lastError?.message || "Unknown error",
  };
}

/**
 * Checks multiple links with rate limiting
 * @param urls - Array of URLs to check
 * @param isAmazonMap - Map of URL to whether it's an Amazon link
 * @param delayMs - Delay between checks in milliseconds
 */
export async function checkLinksWithRateLimit(
  urls: string[],
  isAmazonMap: Map<string, boolean>,
  delayMs: number = 500
): Promise<Map<string, LinkCheckResult>> {
  const results = new Map<string, LinkCheckResult>();

  for (const url of urls) {
    const isAmazon = isAmazonMap.get(url) || false;
    const result = await checkLink(url, isAmazon);
    results.set(url, result);

    // Rate limiting
    if (urls.indexOf(url) < urls.length - 1) {
      await sleep(delayMs);
    }
  }

  return results;
}
