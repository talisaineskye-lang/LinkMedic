"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowRight,
  Wrench,
  Download,
  Lock,
  TrendingUp,
  History,
  Crown,
  Info,
  FileWarning,
} from "lucide-react";
import { track, ANALYTICS_EVENTS } from "@/lib/posthog";

interface DashboardStats {
  totalLinks: number;
  healthyLinks: number;
  brokenLinks: number;
  healthScore: number;
  monthlyLoss: number;
  annualLoss: number;
  disclosureIssues: number;
}

interface TierInfo {
  tier: string;
  videoCount: number;
  videoLimit: number;
  canResync: boolean;
  canExportCSV: boolean;
  canUseAI: boolean;
}

interface RecoveryStats {
  linksFixed: number;
  monthlyRecovered: number;
  annualRecovered: number;
}

interface DashboardClientProps {
  stats: DashboardStats;
  lastScanDate: Date | null;
  tierInfo: TierInfo;
  recoveryStats: RecoveryStats;
  isInactiveChannel: boolean;
}

export function DashboardClient({
  stats,
  lastScanDate,
  tierInfo,
  recoveryStats,
  isInactiveChannel,
}: DashboardClientProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const isFreeUser = tierInfo.tier === "FREE";

  // Track dashboard view on mount
  useEffect(() => {
    track(ANALYTICS_EVENTS.DASHBOARD_VIEWED, {
      totalLinks: stats.totalLinks,
      problemLinks: stats.brokenLinks,
    });
  }, [stats]);

  const hasData = stats.totalLinks > 0;

  const handleSync = async () => {
    if (!tierInfo.canResync) {
      alert("Upgrade to a paid plan to resync your videos");
      return;
    }
    setIsSyncing(true);
    track(ANALYTICS_EVENTS.SYNC_VIDEOS_CLICKED);
    try {
      const response = await fetch("/api/videos/sync", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.upgradeRequired) {
          alert(error.message || "Upgrade required for this feature");
          return;
        }
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

  const handleExportCSV = async () => {
    if (!tierInfo.canExportCSV) {
      alert("Upgrade to a paid plan to export your correction sheet");
      return;
    }
    setIsExporting(true);
    try {
      const response = await fetch("/api/links/export-csv");

      if (!response.ok) {
        const error = await response.json();
        if (error.upgradeRequired) {
          alert(error.message || "Upgrade required for this feature");
          return;
        }
        alert(error.error || "Failed to export CSV");
        return;
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linkmedic-correction-sheet-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export CSV");
    } finally {
      setIsExporting(false);
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
      {/* Tier indicator for free users */}
      {isFreeUser && (
        <div className="mb-6 bg-gradient-to-r from-amber-950/40 to-orange-950/30 border border-amber-700/40 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-white">
                Free Plan: {tierInfo.videoCount}/{tierInfo.videoLimit} videos scanned
              </p>
              <p className="text-xs text-slate-400">
                Upgrade to unlock AI suggestions, CSV export, and monitoring
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-semibold transition"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-slate-400">
            Last scanned:{" "}
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
            disabled={isSyncing || isScanning || !tierInfo.canResync}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition border ${
              tierInfo.canResync
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700"
                : "bg-slate-800/50 border-slate-700/50 cursor-not-allowed"
            }`}
            title={!tierInfo.canResync ? "Upgrade to resync videos" : undefined}
          >
            {!tierInfo.canResync ? (
              <Lock className="w-4 h-4 text-slate-500" />
            ) : (
              <RotateCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            )}
            {isSyncing ? "Syncing..." : "Resync"}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting || !tierInfo.canExportCSV}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition border ${
              tierInfo.canExportCSV
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700"
                : "bg-slate-800/50 border-slate-700/50 cursor-not-allowed"
            }`}
            title={!tierInfo.canExportCSV ? "Upgrade to export CSV" : undefined}
          >
            {!tierInfo.canExportCSV ? (
              <Lock className="w-4 h-4 text-slate-500" />
            ) : (
              <Download className={`w-4 h-4 ${isExporting ? "animate-pulse" : ""}`} />
            )}
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Inactive Channel Notice */}
      {isInactiveChannel && stats.brokenLinks > 0 && (
        <div className="mb-6 bg-slate-800/60 border border-slate-600/50 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-300">Low channel activity detected</p>
            <p className="text-sm text-slate-400 mt-1">
              Revenue estimates may be understated due to limited recent traffic. Broken affiliate links still block future earnings.
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics - 5 stat cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-12">
        {/* Total Links */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
          <p className="text-sm text-slate-400 mb-2">Total Links Scanned</p>
          <p className="text-3xl font-bold">{stats.totalLinks}</p>
        </div>

        {/* Health Score */}
        <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-lg p-6 backdrop-blur">
          <p className="text-sm text-emerald-400 mb-2">Link Health Score</p>
          <p className="text-3xl font-bold text-emerald-400">{stats.healthScore}%</p>
        </div>

        {/* Monthly Loss */}
        <div
          className="bg-red-950/30 border border-red-700/50 rounded-lg p-6 backdrop-blur group relative"
          title="Based on detected broken affiliate links and typical conversion rates. Actual revenue depends on traffic."
        >
          <p className="text-sm text-red-400 mb-2 flex items-center gap-1.5">
            Monthly Revenue at Risk
            <Info className="w-3.5 h-3.5 text-red-400/60" />
          </p>
          <p className="text-3xl font-bold text-red-400">
            ${stats.monthlyLoss.toLocaleString()}
          </p>
        </div>

        {/* Annual Loss */}
        <div
          className="bg-amber-950/30 border border-amber-700/50 rounded-lg p-6 backdrop-blur group relative"
          title="Based on detected broken affiliate links and typical conversion rates. Actual revenue depends on traffic."
        >
          <p className="text-sm text-amber-400 mb-2 flex items-center gap-1.5">
            Annual Revenue at Risk
            <Info className="w-3.5 h-3.5 text-amber-400/60" />
          </p>
          <p className="text-3xl font-bold text-amber-400">
            ${stats.annualLoss.toLocaleString()}
          </p>
        </div>

        {/* Disclosure Issues */}
        <Link
          href="/fix-center?tab=disclosure"
          className={`rounded-lg p-6 backdrop-blur transition-all ${
            stats.disclosureIssues > 0
              ? "bg-orange-950/30 border border-orange-700/50 hover:border-orange-600/70"
              : "bg-slate-800/40 border border-slate-700/50"
          }`}
          title="Videos with affiliate links missing proper FTC disclosure"
        >
          <p className={`text-sm mb-2 flex items-center gap-1.5 ${
            stats.disclosureIssues > 0 ? "text-orange-400" : "text-slate-400"
          }`}>
            <FileWarning className="w-3.5 h-3.5" />
            Disclosure Issues
          </p>
          <p className={`text-3xl font-bold ${
            stats.disclosureIssues > 0 ? "text-orange-400" : "text-slate-300"
          }`}>
            {stats.disclosureIssues}
          </p>
        </Link>
      </div>

      {/* Revenue Recovery Section */}
      {recoveryStats.linksFixed > 0 && (
        <div className="mb-8 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-700/40 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-600/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Revenue Recovered
                </h3>
                <p className="text-sm text-slate-400">
                  {recoveryStats.linksFixed} link{recoveryStats.linksFixed !== 1 ? "s" : ""} fixed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-400 mb-1">Est. Monthly Recovery</p>
              <p className="text-3xl font-bold text-emerald-400">
                ${recoveryStats.monthlyRecovered.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">
                ${recoveryStats.annualRecovered.toLocaleString()}/year
              </p>
            </div>
            <Link
              href="/history"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 rounded-lg text-emerald-400 text-sm font-medium transition"
            >
              <History className="w-4 h-4" />
              View History
            </Link>
          </div>
        </div>
      )}

      {/* CTA Block - Go to Fix Center */}
      {stats.brokenLinks > 0 ? (
        <>
          <div className="bg-gradient-to-r from-red-950/40 to-amber-950/30 border border-red-700/40 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Wrench className="w-8 h-8 text-red-400" />
              <h2 className="text-2xl font-bold text-white">
                {stats.brokenLinks} Broken Link{stats.brokenLinks !== 1 ? "s" : ""} Need Attention
              </h2>
            </div>
            <p className="text-slate-300 mb-6 max-w-lg mx-auto">
              You&apos;re losing approximately <span className="text-red-400 font-semibold">${stats.monthlyLoss.toLocaleString()}/month</span> in affiliate revenue.
              Fix these links to recover your earnings.
            </p>
            <Link
              href="/fix-center"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-lg transition"
            >
              Go to Fix Center
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Revenue Narrative Block */}
          <div className="mt-6 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">What&apos;s happening</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">•</span>
                <span>
                  <span className="font-medium text-white">{stats.brokenLinks} broken affiliate link{stats.brokenLinks !== 1 ? "s" : ""}</span> detected across your videos
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400 mt-1">•</span>
                <span>
                  Estimated <span className="font-medium text-white">~${stats.monthlyLoss.toLocaleString()}/month</span> in missed commissions
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">•</span>
                <span>
                  Fixing these links could recover <span className="font-medium text-emerald-400">~${stats.annualLoss.toLocaleString()}/year</span>
                </span>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-700/50 rounded-xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">All Links Healthy!</h2>
          <p className="text-slate-300 max-w-md mx-auto">
            No broken or out-of-stock links detected. Your affiliate links are working properly.
          </p>
        </div>
      )}
    </div>
  );
}
