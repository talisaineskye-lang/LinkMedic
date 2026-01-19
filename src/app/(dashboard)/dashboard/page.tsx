import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFixFirst, getIssueStats, RawLinkData } from "@/lib/prioritizer";
import { formatCurrency, formatNumber } from "@/lib/revenue-estimator";
import { SyncButton } from "@/components/sync-button";
import { ScanButton } from "@/components/scan-button";
import Link from "next/link";

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
    ctrPercent: user?.ctrPercent ?? 2.0,
    conversionPercent: user?.conversionPercent ?? 3.0,
    avgOrderValue: user?.avgOrderValue ?? 45.0,
  };

  // Get all links with video data
  const links = await prisma.affiliateLink.findMany({
    where: { video: { userId: session.user.id } },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      merchant: true,
      lastCheckedAt: true,
      video: {
        select: {
          id: true,
          title: true,
          viewCount: true,
        },
      },
    },
  }) as RawLinkData[];

  // Get video count
  const videoCount = await prisma.video.count({
    where: { userId: session.user.id },
  });

  // Calculate stats
  const fixFirstList = getFixFirst(links, revenueSettings, 5);
  const stats = getIssueStats(fixFirstList.length > 0 ? fixFirstList : []);
  const totalIssues = links.filter(l => l.status === "NOT_FOUND" || l.status === "OOS").length;

  // Calculate total estimated loss from all issues
  const allIssues = links.filter(l => l.status === "NOT_FOUND" || l.status === "OOS");
  const totalEstimatedLoss = allIssues.reduce((sum: number, link: RawLinkData) => {
    const loss = link.video.viewCount * (revenueSettings.ctrPercent / 100) * (revenueSettings.conversionPercent / 100) * revenueSettings.avgOrderValue;
    return sum + loss;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your affiliate link health</p>
        </div>
        <div className="flex gap-3">
          <SyncButton />
          <ScanButton />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-600 mb-1">Videos</div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(videoCount)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-600 mb-1">Links Scanned</div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(links.length)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-600 mb-1">Issues Found</div>
          <div className="text-2xl font-bold text-red-600">{totalIssues}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-600 mb-1">Est. Revenue at Risk</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalEstimatedLoss)}</div>
        </div>
      </div>

      {/* Fix First Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Fix First</h2>
          <p className="text-sm text-gray-600">Top 5 issues by estimated revenue impact</p>
        </div>

        {fixFirstList.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {links.length === 0 ? (
              <>
                <p className="mb-2">No links found yet.</p>
                <p className="text-sm">Click &quot;Sync Videos&quot; to import your YouTube videos.</p>
              </>
            ) : (
              <p>No issues found. All your links are healthy!</p>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Loss
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fixFirstList.map((issue) => (
                <tr key={issue.id}>
                  <td className="px-6 py-4">
                    <Link
                      href={`/videos/${issue.videoId}`}
                      className="text-sm text-gray-900 hover:text-blue-600"
                    >
                      {issue.videoTitle.length > 50
                        ? issue.videoTitle.slice(0, 50) + "..."
                        : issue.videoTitle}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {formatNumber(issue.videoViewCount)} views
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate block max-w-xs"
                    >
                      {issue.url.length > 40
                        ? issue.url.slice(0, 40) + "..."
                        : issue.url}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        issue.status === "NOT_FOUND"
                          ? "bg-red-100 text-red-700"
                          : issue.status === "OOS"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {issue.status === "NOT_FOUND" ? "Broken" : issue.status === "OOS" ? "Out of Stock" : issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-red-600">
                      {formatCurrency(issue.estimatedLoss)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {fixFirstList.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <Link
              href="/issues"
              className="text-sm text-blue-600 hover:underline"
            >
              View all issues →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
