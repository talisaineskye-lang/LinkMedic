/**
 * Link Audit Engine v2.0
 *
 * High-speed link auditing with:
 * - ASIN-based 24h caching
 * - Parallel processing (5 concurrent)
 * - Strict redirect detection
 * - No hallucinated URLs
 */

import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { prisma } from "@/lib/db";
import { LinkStatus } from "@prisma/client";

// ============================================
// CONFIGURATION
// ============================================

const CONCURRENCY_LIMIT = 5;
const CACHE_TTL_HOURS = 24;
const SCRAPINGBEE_TIMEOUT = 10000; // Reduced from 30s for faster failure detection
const MAX_CONSECUTIVE_FAILURES = 5; // Bail out if ScrapingBee fails this many times in a row

// Track consecutive failures for early bail-out
let consecutiveFailures = 0;
let scrapingBeeDisabled = false;

// Severity scores for revenue impact calculation
export const SEVERITY_MAP: Record<LinkStatus, number> = {
  NOT_FOUND: 1.0,        // Complete loss - product gone
  SEARCH_REDIRECT: 1.0,  // Complete loss - redirected to search
  MISSING_TAG: 1.0,      // Complete loss - no affiliate credit
  OOS: 0.5,              // Partial loss - may come back
  OOS_THIRD_PARTY: 0.3,  // Lower loss - third party available
  REDIRECT: 0.3,         // Partial loss - may convert
  OK: 0,                 // No loss
  UNKNOWN: 0.2,          // Conservative estimate
};

// ============================================
// ASIN EXTRACTION
// ============================================

/**
 * Extract ASIN from any Amazon URL format
 * Handles: /dp/, /gp/product/, /ASIN/, amzn.to resolved URLs
 */
export function extractAsin(url: string): string | null {
  if (!url) return null;

  // Standard patterns
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/ASIN\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
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
 * Check if URL is an Amazon domain
 */
export function isAmazonDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return (
      hostname.includes("amazon.") ||
      hostname.includes("amzn.") ||
      hostname === "a.co"
    );
  } catch {
    return false;
  }
}

/**
 * Check if URL is a search results page (soft 404)
 */
function isSearchRedirect(url: string): boolean {
  return (
    url.includes("/s?k=") ||
    url.includes("/s?") && url.includes("keywords=") ||
    url.includes("/stores/") ||
    url.includes("/b/") && url.includes("node=")
  );
}

/**
 * Get the appropriate country code for ScrapingBee proxy based on Amazon domain
 */
function getCountryCode(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("amazon.ca")) return "ca";
  if (lowerUrl.includes("amazon.co.uk")) return "gb";
  if (lowerUrl.includes("amazon.de")) return "de";
  if (lowerUrl.includes("amazon.fr")) return "fr";
  if (lowerUrl.includes("amazon.es")) return "es";
  if (lowerUrl.includes("amazon.it")) return "it";
  if (lowerUrl.includes("amazon.com.au")) return "au";
  if (lowerUrl.includes("amazon.co.jp")) return "jp";
  if (lowerUrl.includes("amazon.in")) return "in";
  if (lowerUrl.includes("amazon.com.mx")) return "mx";
  if (lowerUrl.includes("amazon.com.br")) return "br";
  if (lowerUrl.includes("amazon.nl")) return "nl";
  if (lowerUrl.includes("amazon.se")) return "se";
  if (lowerUrl.includes("amazon.pl")) return "pl";
  if (lowerUrl.includes("amazon.sg")) return "sg";
  return "us"; // default for amazon.com and others
}

// ============================================
// CACHE OPERATIONS
// ============================================

interface CachedResult {
  status: LinkStatus;
  finalUrl: string | null;
  reason: string | null;
  httpStatus: number | null;
}

/**
 * Check cache for ASIN (24h TTL)
 */
async function checkCache(asin: string): Promise<CachedResult | null> {
  const cached = await prisma.linkCache.findUnique({
    where: { asin },
  });

  if (!cached) return null;

  // Check if cache is still valid (24h)
  const cacheAge = Date.now() - cached.lastChecked.getTime();
  const maxAge = CACHE_TTL_HOURS * 60 * 60 * 1000;

  if (cacheAge > maxAge) {
    return null;
  }

  // Increment hit count
  await prisma.linkCache.update({
    where: { asin },
    data: { hitCount: { increment: 1 } },
  });
  return {
    status: cached.status,
    finalUrl: cached.finalUrl,
    reason: cached.reason,
    httpStatus: cached.httpStatus,
  };
}

/**
 * Save result to cache
 */
async function saveToCache(
  asin: string,
  status: LinkStatus,
  finalUrl: string | null,
  reason: string | null,
  httpStatus: number | null
): Promise<void> {
  await prisma.linkCache.upsert({
    where: { asin },
    create: {
      asin,
      status,
      finalUrl,
      reason,
      httpStatus,
      lastChecked: new Date(),
    },
    update: {
      status,
      finalUrl,
      reason,
      httpStatus,
      lastChecked: new Date(),
    },
  });
}

// ============================================
// SCRAPINGBEE FETCH
// ============================================

interface FetchResult {
  html: string | null;
  httpStatus: number;
  finalUrl: string;
  error?: string;
}

/**
 * Fetch URL via ScrapingBee with redirect tracking
 * Includes early bail-out if ScrapingBee is consistently failing
 */
async function fetchWithScrapingBee(url: string): Promise<FetchResult> {
  // Check if we've already disabled ScrapingBee due to failures
  if (scrapingBeeDisabled) {
    return { html: null, httpStatus: 500, finalUrl: url, error: "ScrapingBee disabled due to failures" };
  }

  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!apiKey) {
    console.error("[Audit] No SCRAPINGBEE_API_KEY configured - skipping link audits");
    scrapingBeeDisabled = true;
    return { html: null, httpStatus: 500, finalUrl: url, error: "No API key" };
  }

  try {
    const countryCode = getCountryCode(url);

    const params = new URLSearchParams({
      api_key: apiKey,
      url: url,
      premium_proxy: "true",
      country_code: countryCode,
      render_js: "false",
      transparent_status_code: "true",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SCRAPINGBEE_TIMEOUT);

    const response = await fetch(
      `https://app.scrapingbee.com/api/v1/?${params.toString()}`,
      {
        method: "GET",
        headers: { Accept: "text/html" },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const finalUrl = response.headers.get("spb-resolved-url") || url;
    const html = await response.text();

    // Success! Reset failure counter
    consecutiveFailures = 0;

    return {
      html,
      httpStatus: response.status,
      finalUrl,
    };
  } catch (error) {
    // Track consecutive failures
    consecutiveFailures++;

    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.error(`[Audit] ScrapingBee failed ${consecutiveFailures} times in a row - disabling for this sync`);
      scrapingBeeDisabled = true;
    }

    return {
      html: null,
      httpStatus: 500,
      finalUrl: url,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// PAGE ANALYSIS (using Cheerio)
// ============================================

interface PageAnalysis {
  status: LinkStatus;
  reason: string;
  productTitle?: string;
}

/**
 * Analyze Amazon page HTML to determine product status
 */
function analyzeAmazonPage(html: string, finalUrl: string): PageAnalysis {
  const $ = cheerio.load(html);

  // 1. Check for CAPTCHA
  if (
    $("#captchacharacters").length > 0 ||
    $('form[action*="validateCaptcha"]').length > 0 ||
    html.toLowerCase().includes("enter the characters you see below")
  ) {
    return { status: "UNKNOWN", reason: "CAPTCHA detected - retry needed" };
  }

  // 2. Check for Dog Page (404)
  const pageTitle = $("title").text().toLowerCase();
  if (
    pageTitle.includes("page not found") ||
    html.toLowerCase().includes("looking for something?") ||
    $("#d").length > 0 // Dog page container
  ) {
    return { status: "NOT_FOUND", reason: "Product page not found (dog page)" };
  }

  // 3. Check if redirected to search results
  if (isSearchRedirect(finalUrl)) {
    return { status: "SEARCH_REDIRECT", reason: "Redirected to search results" };
  }

  // 4. Extract product title for verification
  const productTitle =
    $("#productTitle").text().trim() ||
    $('span[data-hook="product-title"]').text().trim() ||
    $("h1.a-size-large").text().trim() ||
    $("h1#title").text().trim() ||
    "";

  // 5. Check for DEFINITE Out of Stock indicators FIRST
  const availabilityText = $("#availability").text().toLowerCase();
  const availabilityDiv = $("#availability").html()?.toLowerCase() || "";

  const isDefinitelyOOS =
    availabilityText.includes("currently unavailable") ||
    availabilityText.includes("out of stock") ||
    html.toLowerCase().includes("we don't know when or if this item will be back in stock") ||
    availabilityDiv.includes("unavailable");

  if (isDefinitelyOOS) {
    return {
      status: "OOS",
      reason: "Currently unavailable",
      productTitle,
    };
  }

  // 6. Check for Add to Cart / Buy button (expanded selectors for all regions)
  const hasBuyButton =
    $("#add-to-cart-button").length > 0 ||
    $("#buy-now-button").length > 0 ||
    $('input[name="submit.add-to-cart"]').length > 0 ||
    $('[data-action="add-to-cart"]').length > 0 ||
    $("#addToCart").length > 0 ||
    $('input[id*="add-to-cart"]').length > 0 ||
    $('button[id*="add-to-cart"]').length > 0 ||
    $('span[id*="submit.add-to-cart"]').length > 0 ||
    // Regional variations
    $('input[name="submit.addToCart"]').length > 0 ||
    $("#add-to-cart-button-ubb").length > 0 ||
    $(".a-button-input[name*='add-to-cart']").length > 0;

  if (hasBuyButton) {
    return {
      status: "OK",
      reason: "Product available - Add to Cart present",
      productTitle,
    };
  }

  // 7. Check for price as availability signal (if price shown, likely available)
  const hasPrice =
    $(".a-price .a-offscreen").length > 0 ||
    $("#priceblock_ourprice").length > 0 ||
    $("#priceblock_dealprice").length > 0 ||
    $(".a-price-whole").length > 0 ||
    $("#corePrice_feature_div").length > 0 ||
    $('span[data-a-color="price"]').length > 0;

  // 8. Check for "In Stock" or availability indicators
  const hasStockIndicator =
    availabilityText.includes("in stock") ||
    availabilityText.includes("available") ||
    availabilityText.includes("left in stock") ||
    availabilityText.includes("ships from");

  // 9. If we have price AND stock indicator, it's likely OK
  if (hasPrice && hasStockIndicator) {
    return {
      status: "OK",
      reason: "Product available - price and stock indicator present",
      productTitle,
    };
  }

  // 10. If we have price but no definite OOS signal, assume OK
  // (Better to show as OK than false positive OOS)
  if (hasPrice && productTitle) {
    return {
      status: "OK",
      reason: "Product available - price displayed",
      productTitle,
    };
  }

  // 11. Check for Third Party Only
  const buyboxText = $("#buybox-see-all-buying-choices-announce").text().toLowerCase();
  if (
    buyboxText.includes("see all buying options") ||
    $("#olp-upd-new").length > 0 ||
    $("#mbc").length > 0 ||
    availabilityText.includes("available from these sellers")
  ) {
    return {
      status: "OOS_THIRD_PARTY",
      reason: "Only available from third-party sellers",
      productTitle,
    };
  }

  // 12. If we have a product title but couldn't determine status, mark UNKNOWN not OOS
  // This prevents false positives
  if (productTitle) {
    return {
      status: "UNKNOWN",
      reason: "Could not verify availability - manual check recommended",
      productTitle,
    };
  }

  // 13. Unknown state
  return { status: "UNKNOWN", reason: "Could not determine product status" };
}

// ============================================
// SINGLE LINK AUDIT
// ============================================

export interface AuditResult {
  originalUrl: string;
  asin: string | null;
  status: LinkStatus;
  reason: string;
  httpStatus: number | null;
  finalUrl: string | null;
  productTitle: string | null;
  severity: number;
  fromCache: boolean;
}

/**
 * Audit a single link
 */
async function auditSingleLink(url: string): Promise<AuditResult> {
  const baseResult = {
    originalUrl: url,
    asin: null as string | null,
    productTitle: null as string | null,
    fromCache: false,
  };

  // Check if it's an Amazon URL
  if (!isAmazonDomain(url)) {
    return {
      ...baseResult,
      status: "UNKNOWN",
      reason: "Not an Amazon URL",
      httpStatus: null,
      finalUrl: null,
      severity: SEVERITY_MAP.UNKNOWN,
    };
  }

  // Fetch the page to get the resolved URL and extract ASIN
  const fetchResult = await fetchWithScrapingBee(url);

  // Handle dead link status codes (407, 410, 451) - mark as NOT_FOUND
  if (DEAD_LINK_STATUS_CODES.includes(fetchResult.httpStatus)) {
    return {
      ...baseResult,
      status: "NOT_FOUND",
      reason: `Dead link (HTTP ${fetchResult.httpStatus})`,
      httpStatus: fetchResult.httpStatus,
      finalUrl: fetchResult.finalUrl,
      severity: SEVERITY_MAP.NOT_FOUND,
    };
  }

  if (fetchResult.error || !fetchResult.html) {
    return {
      ...baseResult,
      status: "UNKNOWN",
      reason: fetchResult.error || "Failed to fetch page",
      httpStatus: fetchResult.httpStatus,
      finalUrl: fetchResult.finalUrl,
      severity: SEVERITY_MAP.UNKNOWN,
    };
  }

  // Try to extract ASIN from final URL
  const asin = extractAsin(fetchResult.finalUrl) || extractAsin(url);
  baseResult.asin = asin;

  // Check cache if we have an ASIN
  if (asin) {
    const cached = await checkCache(asin);
    if (cached) {
      return {
        ...baseResult,
        status: cached.status,
        reason: cached.reason || "Cached result",
        httpStatus: cached.httpStatus,
        finalUrl: cached.finalUrl,
        severity: SEVERITY_MAP[cached.status],
        fromCache: true,
      };
    }
  }

  // Analyze the page
  const analysis = analyzeAmazonPage(fetchResult.html, fetchResult.finalUrl);

  // Save to cache if we have an ASIN
  if (asin) {
    await saveToCache(
      asin,
      analysis.status,
      fetchResult.finalUrl,
      analysis.reason,
      fetchResult.httpStatus
    );
  }

  return {
    ...baseResult,
    status: analysis.status,
    reason: analysis.reason,
    httpStatus: fetchResult.httpStatus,
    finalUrl: fetchResult.finalUrl,
    productTitle: analysis.productTitle || null,
    severity: SEVERITY_MAP[analysis.status],
    fromCache: false,
  };
}

// ============================================
// BATCH AUDIT WITH PARALLELISM & DEDUPLICATION
// ============================================

export interface BatchAuditOptions {
  urls: string[];
  onProgress?: (completed: number, total: number) => void;
}

// HTTP status codes that indicate permanently dead links (don't re-check)
const DEAD_LINK_STATUS_CODES = [407, 410, 451];
const DEAD_LINK_CACHE_DAYS = 7; // Cache dead links for 7 days

/**
 * Normalize URL for deduplication (remove tracking params, lowercase)
 */
function normalizeUrlForDedup(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common tracking parameters but keep affiliate tag
    const paramsToRemove = ['ref', 'ref_', 'psc', 'pd_rd_i', 'pd_rd_r', 'pd_rd_w', 'pd_rd_wg', 'pf_rd_i', 'pf_rd_m', 'pf_rd_p', 'pf_rd_r', 'pf_rd_s', 'pf_rd_t', 'smid', 'spIA', 'linkCode', 'linkId'];
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
    return urlObj.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Check URL-based cache for recently checked links
 * This catches shortened URLs (amzn.to) that don't have ASINs
 */
async function checkUrlCache(url: string): Promise<CachedResult | null> {
  // Check if this exact URL was recently audited via the AffiliateLink table
  const recentLink = await prisma.affiliateLink.findFirst({
    where: {
      originalUrl: url,
      lastCheckedAt: { not: null },
    },
    select: {
      status: true,
      lastCheckedAt: true,
    },
    orderBy: { lastCheckedAt: 'desc' },
  });

  if (!recentLink?.lastCheckedAt) return null;

  const cacheAge = Date.now() - recentLink.lastCheckedAt.getTime();
  const maxAge = CACHE_TTL_HOURS * 60 * 60 * 1000;

  // For dead links (NOT_FOUND, SEARCH_REDIRECT), use longer cache
  const isDeadLink = recentLink.status === 'NOT_FOUND' || recentLink.status === 'SEARCH_REDIRECT';
  const deadLinkMaxAge = DEAD_LINK_CACHE_DAYS * 24 * 60 * 60 * 1000;

  if (isDeadLink && cacheAge < deadLinkMaxAge) {
    return {
      status: recentLink.status,
      finalUrl: null,
      reason: "Dead link (cached)",
      httpStatus: null,
    };
  }

  if (cacheAge < maxAge) {
    return {
      status: recentLink.status,
      finalUrl: null,
      reason: "Recently checked",
      httpStatus: null,
    };
  }

  return null;
}

/**
 * Audit multiple links in parallel with p-limit
 *
 * OPTIMIZATIONS:
 * - Deduplicates URLs: same URL checked only once, result mapped to all occurrences
 * - URL-based cache: skips recently checked URLs
 * - Dead link cache: 407/410 responses cached for 7 days
 * - Early bail-out: stops if ScrapingBee fails 5+ times in a row
 */
export async function auditLinks(options: BatchAuditOptions): Promise<AuditResult[]> {
  const { urls, onProgress } = options;
  const limit = pLimit(CONCURRENCY_LIMIT);

  // Reset failure tracking for each new audit batch
  consecutiveFailures = 0;
  scrapingBeeDisabled = false;

  // STEP 1: Deduplicate URLs
  const normalizedToOriginal = new Map<string, string>(); // normalized -> first original URL
  const originalToNormalized = new Map<string, string>(); // original -> normalized
  const uniqueUrls: string[] = [];

  for (const url of urls) {
    const normalized = normalizeUrlForDedup(url);
    originalToNormalized.set(url, normalized);

    if (!normalizedToOriginal.has(normalized)) {
      normalizedToOriginal.set(normalized, url);
      uniqueUrls.push(url);
    }
  }

  const duplicatesSkipped = urls.length - uniqueUrls.length;
  if (duplicatesSkipped > 0) {
    console.log(`[Audit] Deduplicated: ${urls.length} URLs → ${uniqueUrls.length} unique (${duplicatesSkipped} duplicates skipped)`);
  }

  // STEP 2: Check URL cache for recently checked links
  const urlsToAudit: string[] = [];
  const cachedResults = new Map<string, AuditResult>();

  for (const url of uniqueUrls) {
    const cached = await checkUrlCache(url);
    if (cached) {
      cachedResults.set(normalizeUrlForDedup(url), {
        originalUrl: url,
        asin: null,
        status: cached.status,
        reason: cached.reason || "Cached",
        httpStatus: cached.httpStatus,
        finalUrl: cached.finalUrl,
        productTitle: null,
        severity: SEVERITY_MAP[cached.status],
        fromCache: true,
      });
    } else {
      urlsToAudit.push(url);
    }
  }

  if (cachedResults.size > 0) {
    console.log(`[Audit] Cache hits: ${cachedResults.size}, URLs to audit: ${urlsToAudit.length}`);
  }

  // STEP 3: Audit remaining URLs with concurrency limit
  let completed = 0;
  const total = urls.length;
  const auditedResults = new Map<string, AuditResult>();

  if (urlsToAudit.length > 0) {
    const results = await Promise.all(
      urlsToAudit.map((url) =>
        limit(async () => {
          const result = await auditSingleLink(url);
          completed++;
          onProgress?.(completed + cachedResults.size, total);
          return { url, result };
        })
      )
    );

    for (const { url, result } of results) {
      auditedResults.set(normalizeUrlForDedup(url), result);
    }
  }

  // STEP 4: Map results back to ALL original URLs (including duplicates)
  const finalResults: AuditResult[] = urls.map((url) => {
    const normalized = originalToNormalized.get(url)!;

    // Check audited results first, then cached results
    const result = auditedResults.get(normalized) || cachedResults.get(normalized);

    if (result) {
      // Return a copy with the original URL preserved
      return {
        ...result,
        originalUrl: url,
      };
    }

    // Fallback (shouldn't happen)
    return {
      originalUrl: url,
      asin: null,
      status: "UNKNOWN" as LinkStatus,
      reason: "No result available",
      httpStatus: null,
      finalUrl: null,
      productTitle: null,
      severity: SEVERITY_MAP.UNKNOWN,
      fromCache: false,
    };
  });

  return finalResults;
}

// ============================================
// AFFILIATE TAG HANDLING
// ============================================

const DEFAULT_AFFILIATE_TAG = "projectfarmyo-20";

/**
 * Extract affiliate tag from URL
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
 * Append affiliate tag to Amazon URL
 */
export function appendAffiliateTag(url: string, tag?: string): string {
  const affiliateTag = tag || DEFAULT_AFFILIATE_TAG;
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set("tag", affiliateTag);
    return urlObj.toString();
  } catch {
    // If URL parsing fails, try simple append
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}tag=${affiliateTag}`;
  }
}
