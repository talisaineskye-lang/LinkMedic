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

  const isFreeUser = tierInfo.tier === "TRIAL" || tierInfo.tier === "AUDITOR";

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
            <h1 className="font-display text-4xl tracking-wide mb-2">DASHBOARD</h1>
            <p className="text-yt-light">Monitor your affiliate link health</p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-profit-green text-black hover:brightness-110 disabled:bg-yt-gray disabled:text-yt-light rounded-lg font-bold transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            <RotateCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Videos"}
          </button>
        </div>

        {/* Empty State */}
        <div className="max-w-2xl mx-auto py-24 text-center">
          <div className="mb-8">
            <AlertCircle className="w-16 h-16 mx-auto text-yt-gray mb-4" />
          </div>

          <h2 className="font-display text-3xl tracking-wide mb-4">NO VIDEOS SYNCED YET</h2>
          <p className="text-lg text-yt-light mb-8">
            Connect your YouTube channel to start monitoring your affiliate links
            and discovering hidden revenue losses.
          </p>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-block px-10 py-4 bg-profit-green text-black hover:brightness-110 disabled:bg-yt-gray disabled:text-yt-light rounded-lg font-bold text-lg transition shadow-[0_0_30px_rgba(0,255,0,0.3)]"
          >
            {isSyncing ? "Syncing Your Videos..." : "Sync My YouTube Videos"}
          </button>

          <p className="text-sm text-yt-light/50 mt-6">
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
        <div className="mb-6 bg-yt-gray/70 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm font-medium text-white">
                Free Plan: {tierInfo.videoCount}/{tierInfo.videoLimit} videos scanned
              </p>
              <p className="text-xs text-yt-light">
                Upgrade to unlock AI suggestions, CSV export, and monitoring
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="px-4 py-2 bg-profit-green text-black hover:brightness-110 rounded-lg text-sm font-bold transition"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-wide mb-1">DASHBOARD</h1>
          <p className="text-yt-light">
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
            className="flex items-center gap-2 px-6 py-3 bg-profit-green text-black hover:brightness-110 disabled:bg-yt-gray disabled:text-yt-light rounded-lg font-bold transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            <Search className={`w-4 h-4 ${isScanning ? "animate-pulse" : ""}`} />
            {isScanning ? "Scanning..." : "Scan Links"}
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing || isScanning || !tierInfo.canResync}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition border ${
              tierInfo.canResync
                ? "bg-yt-gray hover:bg-white/5 border-white/20"
                : "bg-yt-gray/50 border-white/10 cursor-not-allowed"
            }`}
            title={!tierInfo.canResync ? "Upgrade to resync videos" : undefined}
          >
            {!tierInfo.canResync ? (
              <Lock className="w-4 h-4 text-yt-light/50" />
            ) : (
              <RotateCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            )}
            {isSyncing ? "Syncing..." : tierInfo.videoCount === 0 ? "Sync" : "Resync"}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting || !tierInfo.canExportCSV}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition border ${
              tierInfo.canExportCSV
                ? "bg-yt-gray hover:bg-white/5 border-white/20"
                : "bg-yt-gray/50 border-white/10 cursor-not-allowed"
            }`}
            title={!tierInfo.canExportCSV ? "Upgrade to export CSV" : undefined}
          >
            {!tierInfo.canExportCSV ? (
              <Lock className="w-4 h-4 text-yt-light/50" />
            ) : (
              <Download className={`w-4 h-4 ${isExporting ? "animate-pulse" : ""}`} />
            )}
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Inactive Channel Notice */}
      {isInactiveChannel && stats.brokenLinks > 0 && (
        <div className="mb-6 bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-yt-light mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">Low channel activity detected</p>
            <p className="text-sm text-yt-light mt-1">
              Revenue estimates may be understated due to limited recent traffic. Broken affiliate links still block future earnings.
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics - 5 stat cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-12">
        {/* Total Links */}
        <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <p className="text-xs font-mono text-yt-light tracking-wider mb-2">TOTAL LINKS</p>
          <p className="font-display text-3xl">{stats.totalLinks}</p>
        </div>

        {/* Health Score */}
        <div className="bg-yt-gray/70 backdrop-blur-sm border border-profit-green/30 rounded-xl p-6">
          <p className="text-xs font-mono text-profit-green tracking-wider mb-2">HEALTH SCORE</p>
          <p className="font-display text-3xl text-profit-green">{stats.healthScore}%</p>
        </div>

        {/* Monthly Loss */}
        <div
          className="bg-yt-gray/70 backdrop-blur-sm border border-emergency-red/30 rounded-xl p-6"
          title="Based on detected broken affiliate links and typical conversion rates. Actual revenue depends on traffic."
        >
          <p className="text-xs font-mono text-emergency-red tracking-wider mb-2 flex items-center gap-1.5">
            MONTHLY AT RISK
            <Info className="w-3 h-3 text-emergency-red/60" />
          </p>
          <p className="font-display text-3xl text-emergency-red">
            ${stats.monthlyLoss.toLocaleString()}
          </p>
        </div>

        {/* Annual Loss */}
        <div
          className="bg-yt-gray/70 backdrop-blur-sm border border-orange-500/30 rounded-xl p-6"
          title="Based on detected broken affiliate links and typical conversion rates. Actual revenue depends on traffic."
        >
          <p className="text-xs font-mono text-orange-400 tracking-wider mb-2 flex items-center gap-1.5">
            ANNUAL AT RISK
            <Info className="w-3 h-3 text-orange-400/60" />
          </p>
          <p className="font-display text-3xl text-orange-400">
            ${stats.annualLoss.toLocaleString()}
          </p>
        </div>

        {/* Disclosure Issues */}
        <Link
          href="/fix-center?tab=disclosure"
          className={`rounded-xl p-6 backdrop-blur-sm transition-all ${
            stats.disclosureIssues > 0
              ? "bg-yt-gray/70 border border-yellow-500/30 hover:border-yellow-500/50"
              : "bg-yt-gray/70 border border-white/10"
          }`}
          title="Videos with affiliate links missing proper FTC disclosure"
        >
          <p className={`text-xs font-mono tracking-wider mb-2 flex items-center gap-1.5 ${
            stats.disclosureIssues > 0 ? "text-yellow-400" : "text-yt-light"
          }`}>
            <FileWarning className="w-3 h-3" />
            DISCLOSURES
          </p>
          <p className={`font-display text-3xl ${
            stats.disclosureIssues > 0 ? "text-yellow-400" : "text-white"
          }`}>
            {stats.disclosureIssues}
          </p>
        </Link>
      </div>

      {/* Revenue Recovery Section */}
      {recoveryStats.linksFixed > 0 && (
        <div className="mb-8 bg-yt-gray/70 backdrop-blur-sm border border-profit-green/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-profit-green/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-profit-green" />
              </div>
              <div>
                <h3 className="font-display text-lg tracking-wide text-white">
                  REVENUE RECOVERED
                </h3>
                <p className="text-sm text-yt-light">
                  {recoveryStats.linksFixed} link{recoveryStats.linksFixed !== 1 ? "s" : ""} fixed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-profit-green tracking-wider mb-1">EST. MONTHLY RECOVERY</p>
              <p className="font-display text-3xl text-profit-green">
                ${recoveryStats.monthlyRecovered.toLocaleString()}
              </p>
              <p className="text-sm text-yt-light">
                ${recoveryStats.annualRecovered.toLocaleString()}/year
              </p>
            </div>
            <Link
              href="/history"
              className="flex items-center gap-2 px-4 py-2 bg-profit-green/20 hover:bg-profit-green/30 border border-profit-green/40 rounded-lg text-profit-green text-sm font-medium transition"
            >
              <History className="w-4 h-4" />
              View History
            </Link>
          </div>
        </div>
      )}

      {/* CTA Block - Go to Fix Center */}
      {stats.brokenLinks > 0 ? (
        <div className="bg-yt-gray/70 backdrop-blur-sm border border-emergency-red/30 rounded-xl p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wrench className="w-8 h-8 text-emergency-red" />
            <h2 className="font-display text-2xl tracking-wide text-white">
              {stats.brokenLinks} BROKEN LINK{stats.brokenLinks !== 1 ? "S" : ""} NEED ATTENTION
            </h2>
          </div>
          <p className="text-yt-light mb-6 max-w-lg mx-auto">
            You&apos;re losing approximately <span className="text-emergency-red font-semibold">${stats.monthlyLoss.toLocaleString()}/month</span> in affiliate revenue.
            Fix these links to recover your earnings.
          </p>
          <Link
            href="/fix-center"
            className="inline-flex items-center gap-2 px-8 py-4 bg-profit-green text-black hover:brightness-110 rounded-lg font-bold text-lg transition shadow-[0_0_30px_rgba(0,255,0,0.3)]"
          >
            Go to Fix Center
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="bg-yt-gray/70 backdrop-blur-sm border border-profit-green/30 rounded-xl p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-profit-green mb-4" />
          <h2 className="font-display text-2xl tracking-wide mb-2">ALL LINKS HEALTHY!</h2>
          <p className="text-yt-light max-w-md mx-auto">
            No broken or out-of-stock links detected. Your affiliate links are working properly.
          </p>
        </div>
      )}
    </div>
  );
}
