import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNumber, formatCurrency, calculateEstimatedLoss } from "@/lib/revenue-estimator";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

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
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to Videos
      </Link>

      {/* Video Info */}
      <div className="bg-white rounded-lg border p-6">
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {video.title}
            </h1>
            <div className="flex gap-4 text-sm text-gray-500 mb-4">
              <span>{formatNumber(video.viewCount)} views</span>
              <span>•</span>
              <span>Published {new Date(video.publishedAt).toLocaleDateString()}</span>
            </div>
            <a
              href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View on YouTube →
            </a>
          </div>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Affiliate Links</h2>
          <p className="text-sm text-gray-600">
            {video.affiliateLinks.length} links found in this video
          </p>
        </div>

        {video.affiliateLinks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No affiliate links found in this video.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Loss
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {video.affiliateLinks.map((link) => {
                const isBroken = link.status === "NOT_FOUND" || link.status === "OOS";
                const estimatedLoss = isBroken
                  ? calculateEstimatedLoss(video.viewCount, revenueSettings)
                  : 0;

                return (
                  <tr key={link.id}>
                    <td className="px-6 py-4">
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate block max-w-md"
                        title={link.originalUrl}
                      >
                        {link.originalUrl.length > 60
                          ? link.originalUrl.slice(0, 60) + "..."
                          : link.originalUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                      {link.merchant}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          link.status === "OK"
                            ? "bg-green-100 text-green-700"
                            : link.status === "NOT_FOUND"
                            ? "bg-red-100 text-red-700"
                            : link.status === "OOS"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {link.status === "NOT_FOUND"
                          ? "Broken"
                          : link.status === "OOS"
                          ? "Out of Stock"
                          : link.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {link.lastCheckedAt
                        ? new Date(link.lastCheckedAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isBroken ? (
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(estimatedLoss)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
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
