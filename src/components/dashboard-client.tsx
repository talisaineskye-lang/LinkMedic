"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCw,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Calendar,
  Search,
} from "lucide-react";
import { track, ANALYTICS_EVENTS } from "@/lib/posthog";

interface RevenueAssumptions {
  ctrPercent: number;
  conversionPercent: number;
  avgOrderValue: number;
}

interface AffiliateLink {
  id: string;
  originalUrl: string;
  videoId: string;
  videoTitle: string;
  status: "OK" | "NOT_FOUND" | "OOS" | "REDIRECT" | "UNKNOWN";
  lastCheckedAt: Date | null;
  viewCount: number;
}

// Health severity multipliers (% of potential revenue lost)
const HEALTH_FACTORS: Record<string, number> = {
  OK: 0,
  NOT_FOUND: 1.0, // 100% loss
  OOS: 0.5, // 50% loss (might recover)
  REDIRECT: 0.25, // 25% loss (some traffic still gets there)
  UNKNOWN: 0, // Assume OK if unknown
};

const STATUS_COLORS: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  OK: {
    bg: "bg-emerald-950/30",
    border: "border-emerald-700/50",
    text: "text-emerald-400",
    label: "Healthy",
  },
  NOT_FOUND: {
    bg: "bg-red-950/30",
    border: "border-red-700/50",
    text: "text-red-400",
    label: "Broken",
  },
  OOS: {
    bg: "bg-amber-950/30",
    border: "border-amber-700/50",
    text: "text-amber-400",
    label: "Out of Stock",
  },
  REDIRECT: {
    bg: "bg-orange-950/30",
    border: "border-orange-700/50",
    text: "text-orange-400",
    label: "Redirect",
  },
  UNKNOWN: {
    bg: "bg-slate-700/30",
    border: "border-slate-600/50",
    text: "text-slate-400",
    label: "Unknown",
  },
};

const calculateMonthlyLoss = (
  link: AffiliateLink,
  assumptions: RevenueAssumptions
): number => {
  const healthFactor = HEALTH_FACTORS[link.status] || 0;
  if (healthFactor === 0) return 0;

  // Monthly revenue = (views / 12) × CTR% × Conversion% × AOV × health loss factor
  const monthlyViews = link.viewCount / 12;
  const baseRevenue =
    (monthlyViews / 1000) *
    (assumptions.ctrPercent / 100) *
    (assumptions.conversionPercent / 100) *
    assumptions.avgOrderValue;
  const lossAmount = baseRevenue * healthFactor;

  return Math.round(lossAmount);
};

interface DashboardClientProps {
  links: AffiliateLink[];
  assumptions: RevenueAssumptions;
  lastScanDate: Date | null;
}

export function DashboardClient({
  links,
  assumptions,
  lastScanDate,
}: DashboardClientProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();

  // Track dashboard view on mount
  useEffect(() => {
    track(ANALYTICS_EVENTS.DASHBOARD_VIEWED, {
      totalLinks: links.length,
      problemLinks: links.filter(l => l.status !== "OK" && l.status !== "UNKNOWN").length,
    });
  }, [links]);

  const hasData = links.length > 0;

  // Filter problematic links
  const problemLinks = links.filter(
    (link) => link.status !== "OK" && link.status !== "UNKNOWN"
  );
  const healthyLinks = links.filter((link) => link.status === "OK");

  // Calculate metrics
  const totalMonthlyLoss = problemLinks.reduce(
    (sum, link) => sum + calculateMonthlyLoss(link, assumptions),
    0
  );
  const totalAnnualLoss = totalMonthlyLoss * 12;
  const healthScore =
    links.length > 0 ? Math.round((healthyLinks.length / links.length) * 100) : 100;

  // Sort by revenue impact
  const sortedProblems = [...problemLinks].sort(
    (a, b) =>
      calculateMonthlyLoss(b, assumptions) - calculateMonthlyLoss(a, assumptions)
  );

  const handleSync = async () => {
    setIsSyncing(true);
    track(ANALYTICS_EVENTS.SYNC_VIDEOS_CLICKED);
    try {
      const response = await fetch("/api/videos/sync", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to sync videos");
        return;
      }

      const data = await response.json();
      alert(
        `Synced ${data.synced} videos and extracted ${data.linksExtracted} links`
      );
      router.refresh();
    } catch (error) {
      console.error("Sync error:", error);
      alert("Failed to sync videos");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to scan links");
        return;
      }

      const data = await response.json();
      alert(`Scanned ${data.checked} links. Found ${data.issuesFound} issues.`);
      router.refresh();
    } catch (error) {
      console.error("Scan error:", error);
      alert("Failed to scan links");
    } finally {
      setIsScanning(false);
    }
  };

  // EMPTY STATE
  if (!hasData) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-slate-400">Monitor your affiliate link health</p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 rounded-lg font-semibold transition"
          >
            <RotateCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Videos"}
          </button>
        </div>

        {/* Empty State */}
        <div className="max-w-2xl mx-auto py-24 text-center">
          <div className="mb-8">
            <AlertCircle className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          </div>

          <h2 className="text-3xl font-bold mb-4">No Videos Synced Yet</h2>
          <p className="text-lg text-slate-300 mb-8">
            Connect your YouTube channel to start monitoring your affiliate links
            and discovering hidden revenue losses.
          </p>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-block px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 rounded-lg font-bold text-lg transition"
          >
            {isSyncing ? "Syncing Your Videos..." : "Sync My YouTube Videos"}
          </button>

          <p className="text-sm text-slate-400 mt-6">
            We&apos;ll scan up to 500 videos and extract all affiliate links from
            your descriptions.
          </p>
        </div>
      </div>
    );
  }

  // DATA STATE
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-400">Monitor your affiliate link health</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleScan}
            disabled={isScanning || isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 rounded-lg font-semibold transition"
          >
            <Search className={`w-4 h-4 ${isScanning ? "animate-pulse" : ""}`} />
            {isScanning ? "Scanning..." : "Scan Links"}
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing || isScanning}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-600 rounded-lg font-semibold transition border border-slate-700"
          >
            <RotateCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Resync"}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        {/* Total Links */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
          <p className="text-sm text-slate-400 mb-2">Total Links Scanned</p>
          <p className="text-3xl font-bold">{links.length}</p>
        </div>

        {/* Health Score */}
        <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-lg p-6 backdrop-blur">
          <p className="text-sm text-emerald-400 mb-2">Link Health Score</p>
          <p className="text-3xl font-bold text-emerald-400">{healthScore}%</p>
        </div>

        {/* Monthly Loss */}
        <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-6 backdrop-blur">
          <p className="text-sm text-red-400 mb-2">Monthly Revenue Loss</p>
          <p className="text-3xl font-bold text-red-400">
            ${totalMonthlyLoss.toLocaleString()}
          </p>
        </div>

        {/* Annual Loss */}
        <div className="bg-amber-950/30 border border-amber-700/50 rounded-lg p-6 backdrop-blur">
          <p className="text-sm text-amber-400 mb-2">Annual Revenue Loss</p>
          <p className="text-3xl font-bold text-amber-400">
            ${totalAnnualLoss.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Fix First Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-red-400" />
          Fix First — Ranked by Revenue Impact
        </h2>

        {sortedProblems.length > 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-900/50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Link / Video
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                      Monthly Loss
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-300">
                      Annual Loss
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                      Views
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProblems.slice(0, 10).map((link) => {
                    const monthlyLoss = calculateMonthlyLoss(link, assumptions);
                    const annualLoss = monthlyLoss * 12;
                    const colors = STATUS_COLORS[link.status] || STATUS_COLORS.UNKNOWN;

                    return (
                      <tr
                        key={link.id}
                        className="border-b border-slate-700/30 hover:bg-slate-700/20 transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-sm">
                              {link.videoTitle}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">
                              {link.originalUrl}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded text-xs font-semibold ${colors.bg} ${colors.border} border ${colors.text}`}
                          >
                            {colors.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-bold text-red-400">${monthlyLoss}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-bold text-amber-400">
                            ${annualLoss.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-left">
                          <p className="text-sm text-slate-300">
                            {link.viewCount.toLocaleString()}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/20 border border-emerald-700/50 rounded-lg p-8 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
            <p className="text-lg font-semibold mb-2">All Links Healthy</p>
            <p className="text-slate-300">
              No broken or out-of-stock links detected.
            </p>
          </div>
        )}
      </div>

      {/* Health Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Status Breakdown */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
          <h3 className="font-bold text-lg mb-6">Link Status Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(STATUS_COLORS).map(([status, colors]) => {
              const count = links.filter((l) => l.status === status).length;
              const percentage = links.length > 0 ? (count / links.length) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-300">{colors.label}</span>
                    <span className={`text-sm font-bold ${colors.text}`}>
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        status === "OK"
                          ? "bg-emerald-500"
                          : status === "NOT_FOUND"
                          ? "bg-red-500"
                          : status === "OOS"
                          ? "bg-amber-500"
                          : status === "REDIRECT"
                          ? "bg-orange-500"
                          : "bg-slate-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last Scanned */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
          <h3 className="font-bold text-lg mb-4">Scan Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Last Scanned</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {lastScanDate
                  ? new Date(lastScanDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Not scanned yet"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Next Scheduled Scan</p>
              <p className="text-lg font-semibold">
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
            <p className="text-xs text-slate-400 pt-2">
              Weekly scans keep your data fresh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
