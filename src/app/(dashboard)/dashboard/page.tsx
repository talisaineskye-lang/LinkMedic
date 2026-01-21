import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard-client";
import { calculateRevenueImpact, DEFAULT_SETTINGS } from "@/lib/revenue-estimator";
import { LinkStatus } from "@prisma/client";

// All statuses that indicate a broken/problematic link
const PROBLEM_STATUSES: LinkStatus[] = [
  LinkStatus.NOT_FOUND,
  LinkStatus.OOS,
  LinkStatus.OOS_THIRD_PARTY,
  LinkStatus.SEARCH_REDIRECT,
  LinkStatus.MISSING_TAG,
];

export default async function DashboardPage() {
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

  // Get all links with video data
  const rawLinks = await prisma.affiliateLink.findMany({
    where: { video: { userId: session.user.id } },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      lastCheckedAt: true,
      isFixed: true,
      video: {
        select: {
          id: true,
          title: true,
          viewCount: true,
          publishedAt: true,
        },
      },
    },
  });

  // Calculate stats
  const totalLinks = rawLinks.length;
  const healthyLinks = rawLinks.filter(l => l.status === "OK").length;

  // Get broken links (unfixed only)
  const brokenLinks = rawLinks.filter(
    l => PROBLEM_STATUSES.includes(l.status) && !l.isFixed
  );
  const brokenCount = brokenLinks.length;

  // Calculate monthly loss from broken links
  const monthlyLoss = Math.round(brokenLinks.reduce((sum, link) => {
    const videoAgeMonths = link.video.publishedAt
      ? Math.max((Date.now() - new Date(link.video.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30), 1)
      : 12;
    return sum + calculateRevenueImpact(
      link.video.viewCount,
      link.status,
      revenueSettings,
      videoAgeMonths
    );
  }, 0));

  const healthScore = totalLinks > 0
    ? Math.round((healthyLinks / totalLinks) * 100)
    : 100;

  // Get the most recent scan date
  const lastScanDate = rawLinks.reduce<Date | null>((latest, link) => {
    if (!link.lastCheckedAt) return latest;
    if (!latest) return link.lastCheckedAt;
    return link.lastCheckedAt > latest ? link.lastCheckedAt : latest;
  }, null);

  const stats = {
    totalLinks,
    healthyLinks,
    brokenLinks: brokenCount,
    healthScore,
    monthlyLoss,
    annualLoss: monthlyLoss * 12,
  };

  return (
    <DashboardClient
      stats={stats}
      lastScanDate={lastScanDate}
    />
  );
}
