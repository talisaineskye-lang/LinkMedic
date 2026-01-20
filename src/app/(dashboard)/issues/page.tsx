import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAllIssues, RawLinkData } from "@/lib/prioritizer";
import { formatCurrency } from "@/lib/revenue-estimator";
import { IssuesTable } from "@/components/issues-table";
import { GenerateSuggestionsButton } from "@/components/generate-suggestions-button";

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

  // Get all links with video data (including new fix tracking fields)
  const links = await prisma.affiliateLink.findMany({
    where: { video: { userId: session.user.id } },
    select: {
      id: true,
      originalUrl: true,
      status: true,
      merchant: true,
      lastCheckedAt: true,
      suggestedLink: true,
      isFixed: true,
      dateFixed: true,
      video: {
        select: {
          id: true,
          title: true,
          viewCount: true,
        },
      },
    },
  }) as RawLinkData[];

  // Get all issues sorted by priority (excludes fixed issues)
  const issues = getAllIssues(links, revenueSettings);

  // Calculate total estimated loss
  const totalEstimatedLoss = issues.reduce(
    (sum: number, issue: { estimatedLoss: number }) => sum + issue.estimatedLoss,
    0
  );

  // Calculate recovered revenue (from fixed issues)
  const fixedLinks = links.filter((l) => l.isFixed);
  const recoveredRevenue =
    fixedLinks.length > 0
      ? fixedLinks.length * (totalEstimatedLoss / Math.max(issues.length, 1))
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Issues</h1>
          <p className="text-slate-300">
            {issues.length} broken or out-of-stock links •{" "}
            <span className="text-red-400">{formatCurrency(totalEstimatedLoss)}</span>{" "}
            estimated loss
          </p>
        </div>
        <div className="flex items-start gap-4">
          <GenerateSuggestionsButton />
          {fixedLinks.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-slate-400">Revenue Recovered</p>
              <p className="text-lg font-bold text-emerald-400">
                {formatCurrency(recoveredRevenue)}
              </p>
              <p className="text-xs text-slate-500">{fixedLinks.length} links fixed</p>
            </div>
          )}
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur">
        <IssuesTable issues={issues} />
      </div>
    </div>
  );
}
