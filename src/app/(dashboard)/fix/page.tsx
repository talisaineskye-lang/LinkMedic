import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/revenue-estimator";
import { FixCenterTable } from "@/components/fix-center-table";
import { FindReplacementsButton } from "@/components/find-replacements-button";
import { LinkStatus } from "@prisma/client";
import { calculateRevenueImpact, DEFAULT_SETTINGS } from "@/lib/revenue-estimator";

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
    },
  });

  const revenueSettings = {
    ctrPercent: user?.ctrPercent ?? DEFAULT_SETTINGS.ctrPercent,
    conversionPercent: user?.conversionPercent ?? DEFAULT_SETTINGS.conversionPercent,
    avgOrderValue: user?.avgOrderValue ?? DEFAULT_SETTINGS.avgOrderValue,
  };

  // Get all broken/problematic links with video data and fix tracking fields
  const links = await prisma.affiliateLink.findMany({
    where: {
      video: { userId: session.user.id },
      status: { in: PROBLEM_STATUSES },
      isFixed: false,
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
      video: {
        select: {
          id: true,
          title: true,
          viewCount: true,
          thumbnailUrl: true,
          publishedAt: true,
        },
      },
    },
    orderBy: [
      { video: { viewCount: "desc" } }, // Highest views first
    ],
  });

  // Transform to issues with calculated revenue impact
  const issues = links.map((link) => {
    const videoAgeMonths = link.video.publishedAt
      ? Math.max((Date.now() - new Date(link.video.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30), 1)
      : 12;

    return {
      id: link.id,
      videoId: link.video.id,
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
    };
  });

  // Sort by estimated loss (highest first)
  issues.sort((a, b) => b.estimatedLoss - a.estimatedLoss);

  // Calculate totals
  const totalEstimatedLoss = issues.reduce((sum, issue) => sum + issue.estimatedLoss, 0);
  const issuesWithReplacements = issues.filter((i) => i.suggestedLink).length;
  const issuesNeedingReplacements = issues.filter((i) => !i.suggestedLink).length;

  // Get count of fixed links for recovered revenue
  const fixedCount = await prisma.affiliateLink.count({
    where: {
      video: { userId: session.user.id },
      isFixed: true,
    },
  });

  const avgLossPerLink = issues.length > 0 ? totalEstimatedLoss / issues.length : 0;
  const recoveredRevenue = fixedCount * avgLossPerLink;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Recovery Center</h1>
          <p className="text-slate-300 mt-1">
            {issues.length} broken links losing{" "}
            <span className="text-red-400 font-semibold">{formatCurrency(totalEstimatedLoss)}</span>/month
          </p>
        </div>
        <div className="flex items-center gap-4">
          {issuesNeedingReplacements > 0 && <FindReplacementsButton />}
          {fixedCount > 0 && (
            <div className="text-right bg-emerald-950/30 border border-emerald-700/30 rounded-lg px-4 py-2">
              <p className="text-xs text-emerald-400/80 uppercase tracking-wide">Recovered</p>
              <p className="text-lg font-bold text-emerald-400">
                {formatCurrency(recoveredRevenue)}
              </p>
              <p className="text-xs text-slate-500">{fixedCount} links fixed</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {issues.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">
              Replacements found: {issuesWithReplacements} of {issues.length}
            </span>
            <span className="text-sm text-emerald-400 font-medium">
              {Math.round((issuesWithReplacements / issues.length) * 100)}% ready to fix
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${(issuesWithReplacements / issues.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Fix Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur overflow-hidden">
        <FixCenterTable issues={issues} />
      </div>
    </div>
  );
}
