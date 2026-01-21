/**
 * ASIN-Based Link Cache
 *
 * Optimizes ScrapingBee API usage by caching results based on Amazon ASIN.
 * The same product across different videos will use the cached result,
 * dramatically reducing API calls and speeding up audits.
 */

import { prisma } from "./db";
import type { LinkStatus } from "./link-checker";

// Cache validity period (24 hours in milliseconds)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// ASIN regex patterns - matches 10-character alphanumeric Amazon product IDs
// Examples:
// - https://amazon.com/dp/B0CJ4K9XYZ/...
// - https://amazon.com/gp/product/B0CJ4K9XYZ/...
// - https://amzn.to/3xK9d2F (shortlinks need to be resolved first)
const ASIN_PATTERNS = [
  /\/dp\/([A-Z0-9]{10})(?:\/|$|\?)/i,
  /\/gp\/product\/([A-Z0-9]{10})(?:\/|$|\?)/i,
  /\/gp\/aw\/d\/([A-Z0-9]{10})(?:\/|$|\?)/i,
  /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})(?:\/|$|\?)/i,
  /\/o\/ASIN\/([A-Z0-9]{10})(?:\/|$|\?)/i,
  /\/product\/([A-Z0-9]{10})(?:\/|$|\?)/i,
];

export interface CachedLinkResult {
  asin: string;
  status: LinkStatus;
  finalUrl: string | null;
  reason: string | null;
  httpStatus: number | null;
  lastChecked: Date;
  fromCache: boolean;
}

/**
 * Extracts the 10-character Amazon ASIN from a URL
 * Works with various Amazon URL formats including resolved shortlinks
 *
 * @param url - The Amazon URL to extract ASIN from
 * @returns The ASIN if found, null otherwise
 */
export function extractAsin(url: string): string | null {
  if (!url) return null;

  for (const pattern of ASIN_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Checks if a cached result exists and is still valid (within TTL)
 *
 * @param asin - The ASIN to look up
 * @returns The cached result if valid, null if expired or not found
 */
export async function getCachedResult(asin: string): Promise<CachedLinkResult | null> {
  try {
    const cached = await prisma.linkCache.findUnique({
      where: { asin },
    });

    if (!cached) {
      return null;
    }

    // Check if cache is still valid (within TTL)
    const age = Date.now() - cached.lastChecked.getTime();
    if (age > CACHE_TTL_MS) {
      console.log(`[LinkCache] EXPIRED: ${asin} (age: ${Math.round(age / 1000 / 60)}min)`);
      return null;
    }

    // Increment hit count (fire and forget)
    prisma.linkCache.update({
      where: { asin },
      data: { hitCount: { increment: 1 } },
    }).catch(() => {/* ignore errors */});

    console.log(`[LinkCache] HIT: ${asin} -> ${cached.status} (age: ${Math.round(age / 1000 / 60)}min)`);

    return {
      asin: cached.asin,
      status: cached.status as LinkStatus,
      finalUrl: cached.finalUrl,
      reason: cached.reason,
      httpStatus: cached.httpStatus,
      lastChecked: cached.lastChecked,
      fromCache: true,
    };
  } catch (error) {
    console.error("[LinkCache] Error reading cache:", error);
    return null;
  }
}

/**
 * Saves or updates a link check result in the cache
 *
 * @param asin - The ASIN to cache
 * @param status - The link status
 * @param finalUrl - The final resolved URL
 * @param reason - The detection reason
 * @param httpStatus - The HTTP status code
 */
export async function setCachedResult(
  asin: string,
  status: LinkStatus,
  finalUrl: string | null,
  reason: string | null,
  httpStatus: number | null
): Promise<void> {
  try {
    await prisma.linkCache.upsert({
      where: { asin },
      update: {
        status,
        finalUrl,
        reason,
        httpStatus,
        lastChecked: new Date(),
      },
      create: {
        asin,
        status,
        finalUrl,
        reason,
        httpStatus,
        lastChecked: new Date(),
        hitCount: 0,
      },
    });

    console.log(`[LinkCache] SAVED: ${asin} -> ${status}`);
  } catch (error) {
    console.error("[LinkCache] Error saving to cache:", error);
    // Don't throw - caching failures shouldn't break the main flow
  }
}

/**
 * Gets cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  totalHits: number;
}> {
  try {
    const cutoff = new Date(Date.now() - CACHE_TTL_MS);

    const [total, valid, hits] = await Promise.all([
      prisma.linkCache.count(),
      prisma.linkCache.count({
        where: { lastChecked: { gte: cutoff } },
      }),
      prisma.linkCache.aggregate({
        _sum: { hitCount: true },
      }),
    ]);

    return {
      totalEntries: total,
      validEntries: valid,
      expiredEntries: total - valid,
      totalHits: hits._sum.hitCount || 0,
    };
  } catch (error) {
    console.error("[LinkCache] Error getting stats:", error);
    return {
      totalEntries: 0,
      validEntries: 0,
      expiredEntries: 0,
      totalHits: 0,
    };
  }
}

/**
 * Cleans up expired cache entries (older than TTL)
 * Run this periodically to keep the database clean
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - CACHE_TTL_MS);

    const result = await prisma.linkCache.deleteMany({
      where: { lastChecked: { lt: cutoff } },
    });

    console.log(`[LinkCache] Cleaned up ${result.count} expired entries`);
    return result.count;
  } catch (error) {
    console.error("[LinkCache] Error cleaning up cache:", error);
    return 0;
  }
}
