import { prisma } from "./db";
import { extractLinksFromDescription, filterAffiliateLinks } from "./link-parser";
import { auditLinks, AuditResult } from "./link-audit-engine";
import { LinkStatus, DisclosureStatus } from "@prisma/client";
import { analyzeDisclosure } from "./disclosure-detector";

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
 */
export async function extractLinksForUser(userId: string): Promise<{ videos: number; links: number; disclosureIssues: number }> {
  const videos = await prisma.video.findMany({
    where: { userId },
    select: { id: true, description: true },
  });

  let totalLinks = 0;
  let disclosureIssues = 0;

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
          },
        });
        totalLinks++;
      }
    }
  }

  return { videos: videos.length, links: totalLinks, disclosureIssues };
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
 * Gets scan statistics for a user
 */
export async function getScanStats(userId: string): Promise<{
  totalLinks: number;
  checkedLinks: number;
  okLinks: number;
  brokenLinks: number;
  oosLinks: number;
  unknownLinks: number;
}> {
  const links = await prisma.affiliateLink.findMany({
    where: { video: { userId } },
    select: { status: true, lastCheckedAt: true },
  });

  return {
    totalLinks: links.length,
    checkedLinks: links.filter(l => l.lastCheckedAt).length,
    okLinks: links.filter(l => l.status === "OK").length,
    brokenLinks: links.filter(l => l.status === "NOT_FOUND").length,
    oosLinks: links.filter(l => l.status === "OOS").length,
    unknownLinks: links.filter(l => l.status === "UNKNOWN").length,
  };
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
