import { prisma } from "./db";
import { extractLinksFromDescription, filterAffiliateLinks } from "./link-parser";
import { checkLink, LinkCheckResult } from "./link-checker";

const RATE_LIMIT_DELAY = 500; // 500ms between checks

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
 * Extracts links from all videos for a user
 */
export async function extractLinksForUser(userId: string): Promise<{ videos: number; links: number }> {
  const videos = await prisma.video.findMany({
    where: { userId },
    select: { id: true, description: true },
  });

  let totalLinks = 0;

  for (const video of videos) {
    if (!video.description) continue;

    const allLinks = extractLinksFromDescription(video.description);
    const affiliateLinks = filterAffiliateLinks(allLinks);

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

  return { videos: videos.length, links: totalLinks };
}

/**
 * Checks a single link and stores the result
 */
export async function checkAndStoreLinkStatus(linkId: string): Promise<LinkCheckResult> {
  const link = await prisma.affiliateLink.findUnique({
    where: { id: linkId },
    select: { originalUrl: true, merchant: true },
  });

  if (!link) {
    throw new Error(`Link not found: ${linkId}`);
  }

  const isAmazon = link.merchant === "amazon";
  const result = await checkLink(link.originalUrl, isAmazon);

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
      availabilityStatus: result.availabilityStatus,
      notes: result.notes,
    },
  });

  return result;
}

/**
 * Scans all unchecked or stale links for a user
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

  let checked = 0;
  let issues = 0;

  for (const link of links) {
    try {
      const isAmazon = link.merchant === "amazon";
      const result = await checkLink(link.originalUrl, isAmazon);

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
          availabilityStatus: result.availabilityStatus,
          notes: result.notes,
        },
      });

      checked++;
      if (result.status === "NOT_FOUND" || result.status === "OOS") {
        issues++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    } catch (error) {
      console.error(`Error checking link ${link.id}:`, error);
    }
  }

  return { checked, issues };
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
