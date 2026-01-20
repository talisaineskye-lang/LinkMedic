import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard-client";

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

  const assumptions = {
    ctrPercent: user?.ctrPercent ?? 2.0,
    conversionPercent: user?.conversionPercent ?? 3.0,
    avgOrderValue: user?.avgOrderValue ?? 45.0,
  };

  // Get all links with video data
  const rawLinks = await prisma.affiliateLink.findMany({
    where: { video: { userId: session.user.id } },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      lastCheckedAt: true,
      video: {
        select: {
          id: true,
          title: true,
          viewCount: true,
        },
      },
    },
  });

  // Transform to the format expected by the client component
  const links = rawLinks.map((link) => ({
    id: link.id,
    originalUrl: link.originalUrl,
    videoId: link.video.id,
    videoTitle: link.video.title,
    status: link.status as "OK" | "NOT_FOUND" | "OOS" | "REDIRECT" | "UNKNOWN",
    lastCheckedAt: link.lastCheckedAt,
    viewCount: link.video.viewCount,
  }));

  // Get the most recent scan date
  const lastScanDate = rawLinks.reduce<Date | null>((latest, link) => {
    if (!link.lastCheckedAt) return latest;
    if (!latest) return link.lastCheckedAt;
    return link.lastCheckedAt > latest ? link.lastCheckedAt : latest;
  }, null);

  return (
    <DashboardClient
      links={links}
      assumptions={assumptions}
      lastScanDate={lastScanDate}
    />
  );
}
