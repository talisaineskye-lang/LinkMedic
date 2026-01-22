import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FixCenterClient } from "@/components/fix-center-client";
import { LinkStatus, UserTier, DisclosureStatus } from "@prisma/client";
import { calculateRevenueImpact, DEFAULT_SETTINGS } from "@/lib/revenue-estimator";
import { TIER_FEATURES } from "@/lib/tier-limits";
import { getDisclosureIssueText } from "@/lib/disclosure-detector";

// All statuses that indicate a broken/problematic link
const PROBLEM_STATUSES: LinkStatus[] = [
  LinkStatus.NOT_FOUND,
  LinkStatus.OOS,
  LinkStatus.OOS_THIRD_PARTY,
  LinkStatus.SEARCH_REDIRECT,
  LinkStatus.MISSING_TAG,
];

export default async function FixCenterPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Get user settings for revenue estimation
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      ctrPercent: true,
      conversionPercent: true,
      avgOrderValue: true,
      tier: true,
    },
  });

  // Check tier for AI suggestions
  const tier = user?.tier ?? UserTier.FREE;
  const canUseAI = TIER_FEATURES[tier].aiSuggestions;

  const revenueSettings = {
    ctrPercent: user?.ctrPercent ?? DEFAULT_SETTINGS.ctrPercent,
    conversionPercent: user?.conversionPercent ?? DEFAULT_SETTINGS.conversionPercent,
    avgOrderValue: user?.avgOrderValue ?? DEFAULT_SETTINGS.avgOrderValue,
  };

  // Get all broken/problematic links (both fixed and unfixed)
  const allBrokenLinks = await prisma.affiliateLink.findMany({
    where: {
      video: { userId: session.user.id },
      status: { in: PROBLEM_STATUSES },
    },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      merchant: true,
      suggestedLink: true,
      suggestedTitle: true,
      suggestedAsin: true,
      suggestedPrice: true,
      confidenceScore: true,
      searchQuery: true,
      isFixed: true,
      dateFixed: true,
      video: {
        select: {
          id: true,
          youtubeVideoId: true,
          title: true,
          viewCount: true,
          thumbnailUrl: true,
          publishedAt: true,
        },
      },
    },
    orderBy: [
      { video: { viewCount: "desc" } },
    ],
  });

  // Transform to issues with calculated revenue impact
  const transformLink = (link: typeof allBrokenLinks[0]) => {
    const videoAgeMonths = link.video.publishedAt
      ? Math.max((Date.now() - new Date(link.video.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30), 1)
      : 12;

    return {
      id: link.id,
      videoId: link.video.id,
      youtubeVideoId: link.video.youtubeVideoId,
      videoTitle: link.video.title,
      videoViewCount: link.video.viewCount,
      videoThumbnailUrl: link.video.thumbnailUrl,
      url: link.originalUrl,
      status: link.status,
      merchant: link.merchant,
      estimatedLoss: calculateRevenueImpact(
        link.video.viewCount,
        link.status,
        revenueSettings,
        videoAgeMonths
      ),
      suggestedLink: link.suggestedLink,
      suggestedTitle: link.suggestedTitle,
      suggestedAsin: link.suggestedAsin,
      suggestedPrice: link.suggestedPrice,
      confidenceScore: link.confidenceScore,
      searchQuery: link.searchQuery,
      isFixed: link.isFixed,
      dateFixed: link.dateFixed,
    };
  };

  // Split into needs fix and fixed
  const needsFixLinks = allBrokenLinks
    .filter(l => !l.isFixed)
    .map(transformLink)
    .sort((a, b) => b.estimatedLoss - a.estimatedLoss);

  const fixedLinks = allBrokenLinks
    .filter(l => l.isFixed)
    .map(transformLink)
    .sort((a, b) => {
      // Sort by date fixed, most recent first
      if (a.dateFixed && b.dateFixed) {
        return new Date(b.dateFixed).getTime() - new Date(a.dateFixed).getTime();
      }
      return 0;
    });

  // Get videos with disclosure issues (missing or weak disclosure with affiliate links)
  const videosWithDisclosureIssues = await prisma.video.findMany({
    where: {
      userId: session.user.id,
      hasAffiliateLinks: true,
      disclosureStatus: {
        in: [DisclosureStatus.MISSING, DisclosureStatus.WEAK],
      },
    },
    select: {
      id: true,
      title: true,
      youtubeVideoId: true,
      thumbnailUrl: true,
      viewCount: true,
      description: true,
      affiliateLinkCount: true,
      disclosureStatus: true,
      disclosureText: true,
      disclosurePosition: true,
    },
    orderBy: { viewCount: "desc" },
  });

  // Transform disclosure issues for the client
  const disclosureIssues = videosWithDisclosureIssues.map(video => ({
    id: video.id,
    videoId: video.id,
    youtubeVideoId: video.youtubeVideoId,
    videoTitle: video.title,
    videoThumbnailUrl: video.thumbnailUrl,
    videoViewCount: video.viewCount,
    affiliateLinkCount: video.affiliateLinkCount,
    disclosureStatus: video.disclosureStatus,
    disclosureText: video.disclosureText,
    disclosurePosition: video.disclosurePosition,
    issue: getDisclosureIssueText(video.disclosureStatus, video.disclosurePosition),
    description: video.description,
  }));

  // Check if user can see disclosure details (paid tier only)
  const canViewDisclosureDetails = tier !== UserTier.FREE;

  return (
    <FixCenterClient
      needsFixIssues={needsFixLinks}
      fixedIssues={fixedLinks}
      disclosureIssues={disclosureIssues}
      canUseAI={canUseAI}
      canViewDisclosureDetails={canViewDisclosureDetails}
      tier={tier}
    />
  );
}
