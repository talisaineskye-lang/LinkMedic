import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/revenue-estimator";
import Link from "next/link";
import Image from "next/image";

export default async function VideosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Get all videos with link stats
  const videos = await prisma.video.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      youtubeVideoId: true,
      title: true,
      thumbnailUrl: true,
      viewCount: true,
      publishedAt: true,
      affiliateLinks: {
        select: {
          status: true,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  // Transform to include link stats
  const videosWithStats = videos.map((video) => ({
    ...video,
    linkCount: video.affiliateLinks.length,
    brokenCount: video.affiliateLinks.filter(
      (l) => l.status === "NOT_FOUND" || l.status === "OOS"
    ).length,
    hasIssues: video.affiliateLinks.some(
      (l) => l.status === "NOT_FOUND" || l.status === "OOS"
    ),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Videos</h1>
          <p className="text-gray-600">{videos.length} videos synced</p>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-white rounded-lg border">
        {videosWithStats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">No videos synced yet.</p>
            <p className="text-sm">
              Click &quot;Sync Videos&quot; on the dashboard to import your YouTube videos.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Links
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {videosWithStats.map((video) => (
                <tr key={video.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {video.thumbnailUrl && (
                        <Image
                          src={video.thumbnailUrl}
                          alt={video.title}
                          width={80}
                          height={45}
                          className="rounded object-cover"
                        />
                      )}
                      <div>
                        <Link
                          href={`/videos/${video.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {video.title.length > 60
                            ? video.title.slice(0, 60) + "..."
                            : video.title}
                        </Link>
                        <a
                          href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-gray-500 hover:underline"
                        >
                          View on YouTube
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatNumber(video.viewCount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {video.linkCount}
                    {video.brokenCount > 0 && (
                      <span className="text-red-600 ml-1">
                        ({video.brokenCount} broken)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {video.linkCount === 0 ? (
                      <span className="text-xs text-gray-400">No links</span>
                    ) : video.hasIssues ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                        Has Issues
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
