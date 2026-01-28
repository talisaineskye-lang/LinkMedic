import { prisma } from "./db";
import { extractLinksFromDescription, filterAffiliateLinks } from "./link-parser";
import { auditLinks, AuditResult, extractAffiliateTag } from "./link-audit-engine";
import { LinkStatus, DisclosureStatus } from "@prisma/client";
import { analyzeDisclosure } from "./disclosure-detector";
import { detectAmazonRegion, extractAffiliateTag as extractRegionAffiliateTag, AmazonRegion } from "./amazon-regions";

/**
 * Extracts and stores affiliate links from a video's description
 */
export async function extractAndStoreLinks(videoId: string): Promise<number> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { description: true },
  });

  if (!video?.description) return 0;

  // Extract links from description
  const allLinks = extractLinksFromDescription(video.description);
  const affiliateLinks = filterAffiliateLinks(allLinks);

  // Store links (upsert to avoid duplicates)
  let stored = 0;
  for (const link of affiliateLinks) {
    await prisma.affiliateLink.upsert({
      where: {
        id: `${videoId}_${link.url.slice(0, 100)}`, // Use composite key approximation
      },
      create: {
        videoId,
        originalUrl: link.url,
        merchant: link.merchant,
      },
      update: {
        merchant: link.merchant,
      },
    });
    stored++;
  }

  return stored;
}

/**
 * Extracts links from all videos for a user and analyzes disclosures
 * Also auto-detects affiliate tags from existing Amazon links (per region)
 */
export async function extractLinksForUser(userId: string): Promise<{ videos: number; links: number; disclosureIssues: number; detectedAffiliateTag: string | null }> {
  // Check if user already has affiliate tags saved
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      affiliateTag: true,
      affiliateTagUS: true,
      affiliateTagUK: true,
      affiliateTagCA: true,
      affiliateTagDE: true,
    },
  });

  const videos = await prisma.video.findMany({
    where: { userId },
    select: { id: true, description: true },
  });

  let totalLinks = 0;
  let disclosureIssues = 0;
  let detectedAffiliateTag: string | null = null;

  // Track detected tags per region
  const detectedTags: Partial<Record<AmazonRegion, string>> = {};

  for (const video of videos) {
    if (!video.description) continue;

    const allLinks = extractLinksFromDescription(video.description);
    const affiliateLinks = filterAffiliateLinks(allLinks);

    // Analyze disclosure for this video
    const disclosureResult = analyzeDisclosure(video.description);

    // Update video with disclosure analysis
    await prisma.video.update({
      where: { id: video.id },
      data: {
        hasAffiliateLinks: disclosureResult.hasAffiliateLinks,
        affiliateLinkCount: disclosureResult.affiliateLinkCount,
        disclosureStatus: disclosureResult.disclosureStatus as DisclosureStatus,
        disclosureText: disclosureResult.disclosureText,
        disclosurePosition: disclosureResult.disclosurePosition,
      },
    });

    // Count disclosure issues (MISSING or WEAK with affiliate links)
    if (
      disclosureResult.hasAffiliateLinks &&
      (disclosureResult.disclosureStatus === "MISSING" || disclosureResult.disclosureStatus === "WEAK")
    ) {
      disclosureIssues++;
    }

    for (const link of affiliateLinks) {
      // Detect Amazon region for this link
      const amazonRegion = link.merchant === "amazon" ? detectAmazonRegion(link.url) : null;

      // Auto-detect affiliate tags per region from Amazon links
      if (link.merchant === "amazon" && amazonRegion) {
        // Only detect if we haven't already detected for this region
        if (!detectedTags[amazonRegion]) {
          const tag = extractRegionAffiliateTag(link.url);
          if (tag) {
            detectedTags[amazonRegion] = tag;
            console.log(`[Scanner] Auto-detected affiliate tag for ${amazonRegion}: ${tag}`);

            // Keep track of first detected tag for backward compatibility
            if (!detectedAffiliateTag) {
              detectedAffiliateTag = tag;
            }
          }
        }
      }

      // Check if link already exists for this video
      const existing = await prisma.affiliateLink.findFirst({
        where: {
          videoId: video.id,
          originalUrl: link.url,
        },
      });

      if (!existing) {
        await prisma.affiliateLink.create({
          data: {
            videoId: video.id,
            originalUrl: link.url,
            merchant: link.merchant,
            amazonRegion: amazonRegion || null,
          },
        });
        totalLinks++;
      } else if (amazonRegion && !existing.amazonRegion) {
        // Update existing link with region if not set
        await prisma.affiliateLink.update({
          where: { id: existing.id },
          data: { amazonRegion },
        });
      }
    }
  }

  // Build tag updates (only update tags that aren't already set)
  const tagUpdates: Record<string, string> = {};

  if (detectedTags.US && !user?.affiliateTagUS) {
    tagUpdates.affiliateTagUS = detectedTags.US;
  }
  if (detectedTags.UK && !user?.affiliateTagUK) {
    tagUpdates.affiliateTagUK = detectedTags.UK;
  }
  if (detectedTags.CA && !user?.affiliateTagCA) {
    tagUpdates.affiliateTagCA = detectedTags.CA;
  }
  if (detectedTags.DE && !user?.affiliateTagDE) {
    tagUpdates.affiliateTagDE = detectedTags.DE;
  }

  // Also update legacy affiliateTag if not set
  if (!user?.affiliateTag && detectedAffiliateTag) {
    tagUpdates.affiliateTag = detectedAffiliateTag;
  }

  // Save detected tags
  if (Object.keys(tagUpdates).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: tagUpdates,
    });
    console.log(`[Scanner] Auto-saved affiliate tags for user ${userId}:`, tagUpdates);
  }

  return { videos: videos.length, links: totalLinks, disclosureIssues, detectedAffiliateTag };
}

/**
 * Checks a single link and stores the result using the new audit engine
 */
export async function checkAndStoreLinkStatus(linkId: string): Promise<AuditResult> {
  const link = await prisma.affiliateLink.findUnique({
    where: { id: linkId },
    select: { originalUrl: true, merchant: true },
  });

  if (!link) {
    throw new Error(`Link not found: ${linkId}`);
  }

  // Use new audit engine (handles caching internally)
  const results = await auditLinks({ urls: [link.originalUrl] });
  const result = results[0];

  // Update link status
  await prisma.affiliateLink.update({
    where: { id: linkId },
    data: {
      status: result.status,
      lastCheckedAt: new Date(),
    },
  });

  // Store scan result
  await prisma.scanResult.create({
    data: {
      affiliateLinkId: linkId,
      httpStatus: result.httpStatus,
      availabilityStatus: result.status === "OK" ? "available" : result.status.toLowerCase(),
      notes: result.reason,
    },
  });

  return result;
}

/**
 * Scans all unchecked or stale links for a user
 * Uses the new high-speed audit engine with:
 * - ASIN-based 24h caching
 * - Parallel processing (5 concurrent)
 * - Cheerio-based HTML parsing
 *
 * @param userId - User ID
 * @param staleThresholdDays - Links older than this many days are considered stale
 */
export async function scanUserLinks(
  userId: string,
  staleThresholdDays: number = 7
): Promise<{ checked: number; issues: number }> {
  const staleDate = new Date();
  staleDate.setDate(staleDate.getDate() - staleThresholdDays);

  // Get links that need checking
  const links = await prisma.affiliateLink.findMany({
    where: {
      video: { userId },
      OR: [
        { lastCheckedAt: null },
        { lastCheckedAt: { lt: staleDate } },
      ],
    },
    select: {
      id: true,
      originalUrl: true,
      merchant: true,
    },
    take: 100, // Limit per scan to avoid timeouts
  });

  if (links.length === 0) {
    return { checked: 0, issues: 0 };
  }

  console.log(`[Scanner] Starting audit of ${links.length} links for user ${userId}`);

  // Use the new parallel audit engine
  const urls = links.map(l => l.originalUrl);
  const results = await auditLinks({
    urls,
    onProgress: (completed, total) => {
      console.log(`[Scanner] Progress: ${completed}/${total}`);
    },
  });

  // Problem statuses that count as issues
  const PROBLEM_STATUSES: LinkStatus[] = [
    "NOT_FOUND",
    "OOS",
    "OOS_THIRD_PARTY",
    "SEARCH_REDIRECT",
    "MISSING_TAG",
  ];

  let issues = 0;

  // Update database with results
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const result = results[i];

    try {
      // Update link status
      await prisma.affiliateLink.update({
        where: { id: link.id },
        data: {
          status: result.status,
          lastCheckedAt: new Date(),
        },
      });

      // Store scan result
      await prisma.scanResult.create({
        data: {
          affiliateLinkId: link.id,
          httpStatus: result.httpStatus,
          availabilityStatus: result.status === "OK" ? "available" : result.status.toLowerCase(),
          notes: result.reason,
        },
      });

      if (PROBLEM_STATUSES.includes(result.status)) {
        issues++;
      }
    } catch (error) {
      console.error(`[Scanner] Error updating link ${link.id}:`, error);
    }
  }

  const cached = results.filter(r => r.fromCache).length;
  console.log(`[Scanner] Completed: ${links.length} links checked, ${issues} issues found (${cached} from cache)`);

  return { checked: links.length, issues };
}

/**
 * Gets scan statistics for a user using efficient database aggregations
 */
export async function getScanStats(userId: string): Promise<{
  totalLinks: number;
  checkedLinks: number;
  okLinks: number;
  brokenLinks: number;
  oosLinks: number;
  unknownLinks: number;
}> {
  // Run all counts in parallel for maximum speed
  const [totalLinks, checkedLinks, okLinks, brokenLinks, oosLinks, unknownLinks] = await Promise.all([
    prisma.affiliateLink.count({
      where: { video: { userId } },
    }),
    prisma.affiliateLink.count({
      where: { video: { userId }, lastCheckedAt: { not: null } },
    }),
    prisma.affiliateLink.count({
      where: { video: { userId }, status: "OK" },
    }),
    prisma.affiliateLink.count({
      where: { video: { userId }, status: "NOT_FOUND" },
    }),
    prisma.affiliateLink.count({
      where: { video: { userId }, status: "OOS" },
    }),
    prisma.affiliateLink.count({
      where: { video: { userId }, status: "UNKNOWN" },
    }),
  ]);

  return { totalLinks, checkedLinks, okLinks, brokenLinks, oosLinks, unknownLinks };
}

/**
 * Full sync and scan for a user
 * 1. Extract links from all video descriptions
 * 2. Check all unchecked/stale links
 */
export async function fullSyncAndScan(userId: string): Promise<{
  extractedLinks: number;
  checkedLinks: number;
  issues: number;
}> {
  // Step 1: Extract links
  const { links: extractedLinks } = await extractLinksForUser(userId);

  // Step 2: Scan links
  const { checked: checkedLinks, issues } = await scanUserLinks(userId);

  return {
    extractedLinks,
    checkedLinks,
    issues,
  };
}
