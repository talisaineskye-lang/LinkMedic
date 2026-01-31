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
 *
 * OPTIMIZED: Uses batch DB operations instead of per-video/per-link queries
 */
export async function extractLinksForUser(userId: string): Promise<{ videos: number; links: number; disclosureIssues: number; detectedAffiliateTag: string | null }> {
  const startTime = Date.now();

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

  let disclosureIssues = 0;
  let detectedAffiliateTag: string | null = null;

  // Track detected tags per region
  const detectedTags: Partial<Record<AmazonRegion, string>> = {};

  // PHASE 1: Process all videos in memory, build batch updates
  interface VideoUpdate {
    id: string;
    hasAffiliateLinks: boolean;
    affiliateLinkCount: number;
    disclosureStatus: DisclosureStatus;
    disclosureText: string | null;
    disclosurePosition: number | null;
  }

  interface LinkToCreate {
    videoId: string;
    originalUrl: string;
    merchant: string;
    amazonRegion: string | null;
  }

  const videoUpdates: VideoUpdate[] = [];
  const linksToProcess: LinkToCreate[] = [];

  for (const video of videos) {
    if (!video.description) continue;

    const allLinks = extractLinksFromDescription(video.description);
    const affiliateLinks = filterAffiliateLinks(allLinks);

    // Analyze disclosure for this video
    const disclosureResult = analyzeDisclosure(video.description);

    // Queue video update (will batch later)
    videoUpdates.push({
      id: video.id,
      hasAffiliateLinks: disclosureResult.hasAffiliateLinks,
      affiliateLinkCount: disclosureResult.affiliateLinkCount,
      disclosureStatus: disclosureResult.disclosureStatus as DisclosureStatus,
      disclosureText: disclosureResult.disclosureText,
      disclosurePosition: disclosureResult.disclosurePosition,
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
        if (!detectedTags[amazonRegion]) {
          const tag = extractRegionAffiliateTag(link.url);
          if (tag) {
            detectedTags[amazonRegion] = tag;
            // Tag auto-detected for region
            if (!detectedAffiliateTag) {
              detectedAffiliateTag = tag;
            }
          }
        }
      }

      // Queue link for processing
      linksToProcess.push({
        videoId: video.id,
        originalUrl: link.url,
        merchant: link.merchant,
        amazonRegion: amazonRegion || null,
      });
    }
  }


  // PHASE 2: Batch update all video disclosure data (chunked to avoid 5s timeout)
  if (videoUpdates.length > 0) {
    const updateStart = Date.now();
    const CHUNK_SIZE = 50;

    for (let i = 0; i < videoUpdates.length; i += CHUNK_SIZE) {
      const chunk = videoUpdates.slice(i, i + CHUNK_SIZE);
      await prisma.$transaction(
        chunk.map(update =>
          prisma.video.update({
            where: { id: update.id },
            data: {
              hasAffiliateLinks: update.hasAffiliateLinks,
              affiliateLinkCount: update.affiliateLinkCount,
              disclosureStatus: update.disclosureStatus,
              disclosureText: update.disclosureText,
              disclosurePosition: update.disclosurePosition,
            },
          })
        )
      );
    }
  }

  // PHASE 3: Fetch ALL existing affiliate links for this user's videos in ONE query
  const videoIds = videos.map(v => v.id);
  const existingLinks = await prisma.affiliateLink.findMany({
    where: { videoId: { in: videoIds } },
    select: { id: true, videoId: true, originalUrl: true, amazonRegion: true },
  });

  // Build a lookup map: "videoId:url" -> existingLink
  const existingLinkMap = new Map<string, { id: string; amazonRegion: string | null }>();
  for (const link of existingLinks) {
    existingLinkMap.set(`${link.videoId}:${link.originalUrl}`, {
      id: link.id,
      amazonRegion: link.amazonRegion,
    });
  }

  // PHASE 4: Determine new links vs links needing region update
  const newLinks: LinkToCreate[] = [];
  const regionUpdates: { id: string; amazonRegion: string }[] = [];

  for (const link of linksToProcess) {
    const key = `${link.videoId}:${link.originalUrl}`;
    const existing = existingLinkMap.get(key);

    if (!existing) {
      newLinks.push(link);
    } else if (link.amazonRegion && !existing.amazonRegion) {
      regionUpdates.push({ id: existing.id, amazonRegion: link.amazonRegion });
    }
  }

  // PHASE 5: Batch create new links
  if (newLinks.length > 0) {
    await prisma.affiliateLink.createMany({
      data: newLinks.map(link => ({
        videoId: link.videoId,
        originalUrl: link.originalUrl,
        merchant: link.merchant,
        amazonRegion: link.amazonRegion,
      })),
      skipDuplicates: true, // Safety net for race conditions
    });
  }

  // PHASE 6: Batch update region for existing links (chunked to avoid timeout)
  if (regionUpdates.length > 0) {
    const CHUNK_SIZE = 50;
    for (let i = 0; i < regionUpdates.length; i += CHUNK_SIZE) {
      const chunk = regionUpdates.slice(i, i + CHUNK_SIZE);
      await prisma.$transaction(
        chunk.map(update =>
          prisma.affiliateLink.update({
            where: { id: update.id },
            data: { amazonRegion: update.amazonRegion },
          })
        )
      );
    }
  }

  // PHASE 7: Build tag updates (only update tags that aren't already set)
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
  }

  console.log(`[Sync] Extracted ${newLinks.length} links from ${videos.length} videos in ${Date.now() - startTime}ms`);

  return { videos: videos.length, links: newLinks.length, disclosureIssues, detectedAffiliateTag };
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
  // Skip link audit if SKIP_LINK_AUDIT is set (useful for dev when ScrapingBee has issues)
  if (process.env.SKIP_LINK_AUDIT === "true") {
    console.log("[Audit] Skipping link audit (SKIP_LINK_AUDIT=true)");
    return { checked: 0, issues: 0 };
  }

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

  // Use the new parallel audit engine
  const urls = links.map(l => l.originalUrl);
  const results = await auditLinks({ urls });

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

  console.log(`[Sync] Audited ${links.length} links, found ${issues} issues`);

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
