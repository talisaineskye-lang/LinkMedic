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

  // Get user settings for revenue estimation and affiliate tags
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      ctrPercent: true,
      conversionPercent: true,
      avgOrderValue: true,
      tier: true,
      activeChannelId: true,
      affiliateTagUS: true,
      affiliateTagUK: true,
      affiliateTagCA: true,
      affiliateTagDE: true,
    },
  });

  // Check tier for AI suggestions
  const tier = user?.tier ?? UserTier.AUDITOR;
  const canUseAI = TIER_FEATURES[tier].aiSuggestions;

  // Filter by active channel if set (multi-channel support)
  const channelFilter = user?.activeChannelId
    ? { channelId: user.activeChannelId }
    : {};

  const revenueSettings = {
    ctrPercent: user?.ctrPercent ?? DEFAULT_SETTINGS.ctrPercent,
    conversionPercent: user?.conversionPercent ?? DEFAULT_SETTINGS.conversionPercent,
    avgOrderValue: user?.avgOrderValue ?? DEFAULT_SETTINGS.avgOrderValue,
  };

  // Get all broken/problematic links (both fixed and unfixed, excluding dismissed)
  // Filtered by active channel if set
  const allBrokenLinks = await prisma.affiliateLink.findMany({
    where: {
      video: { userId: session.user.id, ...channelFilter },
      status: { in: PROBLEM_STATUSES },
      isDismissed: false, // Exclude dismissed links
    },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      merchant: true,
      amazonRegion: true,
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
      amazonRegion: link.amazonRegion,
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

  // Group unfixed links by unique URL for the grouped view
  const groupedLinksMap = new Map<string, {
    originalUrl: string;
    linkIds: string[];
    videos: { id: string; youtubeVideoId: string; title: string; viewCount: number; thumbnailUrl: string | null }[];
    totalRevenueAtRisk: number;
    suggestedLink: string | null;
    suggestedTitle: string | null;
    suggestedAsin: string | null;
    suggestedPrice: string | null;
    confidenceScore: number | null;
    status: string;
    merchant: string;
    amazonRegion: string | null;
  }>();

  for (const link of needsFixLinks) {
    const existing = groupedLinksMap.get(link.url);
    if (existing) {
      existing.linkIds.push(link.id);
      existing.videos.push({
        id: link.videoId,
        youtubeVideoId: link.youtubeVideoId,
        title: link.videoTitle,
        viewCount: link.videoViewCount,
        thumbnailUrl: link.videoThumbnailUrl,
      });
      existing.totalRevenueAtRisk += link.estimatedLoss;
      // Use the suggestion from any instance that has one
      if (!existing.suggestedLink && link.suggestedLink) {
        existing.suggestedLink = link.suggestedLink;
        existing.suggestedTitle = link.suggestedTitle;
        existing.suggestedAsin = link.suggestedAsin;
        existing.suggestedPrice = link.suggestedPrice;
        existing.confidenceScore = link.confidenceScore;
      }
    } else {
      groupedLinksMap.set(link.url, {
        originalUrl: link.url,
        linkIds: [link.id],
        videos: [{
          id: link.videoId,
          youtubeVideoId: link.youtubeVideoId,
          title: link.videoTitle,
          viewCount: link.videoViewCount,
          thumbnailUrl: link.videoThumbnailUrl,
        }],
        totalRevenueAtRisk: link.estimatedLoss,
        suggestedLink: link.suggestedLink,
        suggestedTitle: link.suggestedTitle,
        suggestedAsin: link.suggestedAsin,
        suggestedPrice: link.suggestedPrice,
        confidenceScore: link.confidenceScore,
        status: link.status,
        merchant: link.merchant,
        amazonRegion: link.amazonRegion,
      });
    }
  }

  const groupedLinks = Array.from(groupedLinksMap.values())
    .sort((a, b) => b.totalRevenueAtRisk - a.totalRevenueAtRisk);

  // Get videos with disclosure issues (missing or weak disclosure with affiliate links)
  // Exclude dismissed disclosure issues, filtered by active channel if set
  const videosWithDisclosureIssues = await prisma.video.findMany({
    where: {
      userId: session.user.id,
      ...channelFilter,
      hasAffiliateLinks: true,
      disclosureStatus: {
        in: [DisclosureStatus.MISSING, DisclosureStatus.WEAK],
      },
      disclosureDismissed: false,
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
  const canViewDisclosureDetails = tier !== UserTier.TRIAL && tier !== UserTier.AUDITOR;

  // Prepare user affiliate tags for FindReplacement component
  const userTags = {
    US: user?.affiliateTagUS ?? null,
    UK: user?.affiliateTagUK ?? null,
    CA: user?.affiliateTagCA ?? null,
    DE: user?.affiliateTagDE ?? null,
  };

  return (
    <FixCenterClient
      needsFixIssues={needsFixLinks}
      fixedIssues={fixedLinks}
      groupedIssues={groupedLinks}
      disclosureIssues={disclosureIssues}
      canUseAI={canUseAI}
      canViewDisclosureDetails={canViewDisclosureDetails}
      tier={tier}
      userTags={userTags}
    />
  );
}
