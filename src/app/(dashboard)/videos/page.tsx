import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/revenue-estimator";
import Link from "next/link";
import Image from "next/image";

type Video = {
  id: string;
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string | null;
  viewCount: number;
  publishedAt: Date | null;
  affiliateLinks: { status: string }[];
};

type VideoWithStats = Video & {
  linkCount: number;
  brokenCount: number;
  hasIssues: boolean;
};

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
  const videosWithStats = videos.map((video: Video) => ({
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
          <h1 className="text-2xl font-bold text-white">Videos</h1>
          <p className="text-slate-300">{videos.length} videos synced</p>
        </div>
      </div>

      {/* Videos Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur">
        {videosWithStats.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="mb-2">No videos synced yet.</p>
            <p className="text-sm">
              Click &quot;Sync Videos&quot; on the dashboard to import your YouTube videos.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Links
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {videosWithStats.map((video: VideoWithStats) => (
                <tr key={video.id} className="hover:bg-slate-700/20 transition">
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
                          className="text-sm font-medium text-white hover:text-emerald-400 transition"
                        >
                          {video.title.length > 60
                            ? video.title.slice(0, 60) + "..."
                            : video.title}
                        </Link>
                        <a
                          href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-slate-400 hover:text-emerald-400 hover:underline transition"
                        >
                          View on YouTube
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {formatNumber(video.viewCount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {video.linkCount}
                    {video.brokenCount > 0 && (
                      <span className="text-red-400 ml-1">
                        ({video.brokenCount} broken)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {video.linkCount === 0 ? (
                      <span className="text-xs text-slate-500">No links</span>
                    ) : video.hasIssues ? (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full border bg-red-950/30 border-red-700/50 text-red-400">
                        Has Issues
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full border bg-emerald-950/30 border-emerald-700/50 text-emerald-400">
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
