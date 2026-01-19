import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAllIssues, RawLinkData } from "@/lib/prioritizer";
import { formatCurrency, formatNumber } from "@/lib/revenue-estimator";
import Link from "next/link";

export default async function IssuesPage() {
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

  // Get all issues sorted by priority
  const issues = getAllIssues(links, revenueSettings);

  // Calculate total estimated loss
  const totalEstimatedLoss = issues.reduce((sum, issue) => sum + issue.estimatedLoss, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
          <p className="text-gray-600">
            {issues.length} broken or out-of-stock links • {formatCurrency(totalEstimatedLoss)} estimated loss
          </p>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-lg border">
        {issues.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">No issues found!</p>
            <p className="text-sm">All your affiliate links are working properly.</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Loss
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td className="px-6 py-4">
                    <Link
                      href={`/videos/${issue.videoId}`}
                      className="text-sm text-gray-900 hover:text-blue-600"
                    >
                      {issue.videoTitle.length > 40
                        ? issue.videoTitle.slice(0, 40) + "..."
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
                      title={issue.url}
                    >
                      {issue.url.length > 50
                        ? issue.url.slice(0, 50) + "..."
                        : issue.url}
                    </a>
                    <div className="text-xs text-gray-500">
                      {issue.merchant}
                    </div>
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {issue.lastCheckedAt
                      ? new Date(issue.lastCheckedAt).toLocaleDateString()
                      : "Never"}
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
      </div>
    </div>
  );
}
