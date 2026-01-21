import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNumber, formatCurrency, calculateEstimatedLoss } from "@/lib/revenue-estimator";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExportDescriptionButton } from "@/components/export-description-button";
import type { LinkStatus } from "@prisma/client";

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    ctrPercent: user?.ctrPercent ?? 2.0,
    conversionPercent: user?.conversionPercent ?? 3.0,
    avgOrderValue: user?.avgOrderValue ?? 45.0,
  };

  // Get video with links
  const video = await prisma.video.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      youtubeVideoId: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      viewCount: true,
      publishedAt: true,
      affiliateLinks: {
        select: {
          id: true,
          originalUrl: true,
          merchant: true,
          status: true,
          lastCheckedAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!video) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/videos"
        className="text-sm text-slate-400 hover:text-emerald-400 transition"
      >
        ← Back to Videos
      </Link>

      {/* Video Info */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
        <div className="flex gap-6">
          {video.thumbnailUrl && (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              width={320}
              height={180}
              className="rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">
              {video.title}
            </h1>
            <div className="flex gap-4 text-sm text-slate-400 mb-4">
              <span>{formatNumber(video.viewCount)} views</span>
              <span>•</span>
              <span>Published {new Date(video.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <a
                href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline text-sm transition"
              >
                View on YouTube →
              </a>
              <ExportDescriptionButton
                videoId={video.id}
                videoTitle={video.title}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">Affiliate Links</h2>
          <p className="text-sm text-slate-400">
            {video.affiliateLinks.length} links found in this video
          </p>
        </div>

        {video.affiliateLinks.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No affiliate links found in this video.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Est. Loss
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {video.affiliateLinks.map((link) => {
                const isBroken = link.status === "NOT_FOUND" || link.status === "SEARCH_REDIRECT" || link.status === "OOS" || link.status === "MISSING_TAG";
                const estimatedLoss = isBroken
                  ? calculateEstimatedLoss(video.viewCount, revenueSettings)
                  : 0;

                return (
                  <tr key={link.id} className="hover:bg-slate-700/20 transition">
                    <td className="px-6 py-4">
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-400 hover:underline truncate block max-w-md"
                        title={link.originalUrl}
                      >
                        {link.originalUrl.length > 60
                          ? link.originalUrl.slice(0, 60) + "..."
                          : link.originalUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 capitalize">
                      {link.merchant}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                          link.status === "OK"
                            ? "bg-emerald-950/30 border-emerald-700/50 text-emerald-400"
                            : link.status === "NOT_FOUND" || link.status === "MISSING_TAG"
                            ? "bg-red-950/30 border-red-700/50 text-red-400"
                            : link.status === "SEARCH_REDIRECT" || link.status === "REDIRECT"
                            ? "bg-orange-950/30 border-orange-700/50 text-orange-400"
                            : link.status === "OOS" || link.status === "OOS_THIRD_PARTY"
                            ? "bg-amber-950/30 border-amber-700/50 text-amber-400"
                            : "bg-slate-700/30 border-slate-600/50 text-slate-400"
                        }`}
                      >
                        {link.status === "NOT_FOUND"
                          ? "Broken"
                          : link.status === "SEARCH_REDIRECT"
                          ? "Redirect Error"
                          : link.status === "MISSING_TAG"
                          ? "No Tag"
                          : link.status === "OOS"
                          ? "Out of Stock"
                          : link.status === "OOS_THIRD_PARTY"
                          ? "3rd Party"
                          : link.status === "REDIRECT"
                          ? "Redirect"
                          : link.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {link.lastCheckedAt
                        ? new Date(link.lastCheckedAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isBroken ? (
                        <span className="text-sm font-medium text-red-400">
                          {formatCurrency(estimatedLoss)}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
