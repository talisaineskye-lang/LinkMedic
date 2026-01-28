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

interface ScanEligibility {
  isFirstScan: boolean;
  quickScanAvailable: boolean;
  fullScanAvailable: boolean;
  quickScanCooldownEnds: string | null;
  fullScanCooldownEnds: string | null;
  lastQuickScan: string | null;
  lastFullScan: string | null;
}

interface DashboardClientProps {
  stats: DashboardStats;
  lastScanDate: Date | null;
  tierInfo: TierInfo;
  recoveryStats: RecoveryStats;
  isInactiveChannel: boolean;
  scanEligibility: ScanEligibility;
}

export function DashboardClient({
  stats,
  lastScanDate,
  tierInfo,
  recoveryStats,
  isInactiveChannel,
  scanEligibility,
}: DashboardClientProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeScanType, setActiveScanType] = useState<"quick" | "full" | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const isFreeUser = tierInfo.tier === "TRIAL" || tierInfo.tier === "AUDITOR";

  // Helper to format cooldown time remaining
  const formatCooldown = (isoString: string | null): string => {
    if (!isoString) return "";
    const ends = new Date(isoString);
    const now = new Date();
    const diff = ends.getTime() - now.getTime();

    if (diff <= 0) return "Available now";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m`;
    }
    return `${Math.floor(diff / (1000 * 60))}m`;
  };

  // Track dashboard view on mount
  useEffect(() => {
    track(ANALYTICS_EVENTS.DASHBOARD_VIEWED, {
      totalLinks: stats.totalLinks,
      problemLinks: stats.brokenLinks,
    });
  }, [stats]);

  const hasData = stats.totalLinks > 0;

  const handleSync = async (scanType: "quick" | "full" = "full") => {
    if (!tierInfo.canResync && !scanEligibility.isFirstScan) {
      alert("Upgrade to a paid plan to resync your videos");
      return;
    }

    // Check cooldown eligibility
    if (!scanEligibility.isFirstScan) {
      if (scanType === "quick" && !scanEligibility.quickScanAvailable) {
        alert(`Quick scan is on cooldown. Available in ${formatCooldown(scanEligibility.quickScanCooldownEnds)}`);
        return;
      }
      if (scanType === "full" && !scanEligibility.fullScanAvailable) {
        alert(`Full scan is on cooldown. Available in ${formatCooldown(scanEligibility.fullScanCooldownEnds)}`);
        return;
      }
    }

    setIsSyncing(true);
    setActiveScanType(scanType);
    track(ANALYTICS_EVENTS.SYNC_VIDEOS_CLICKED, { scanType });

    try {
      const response = await fetch("/api/videos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanType }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.upgradeRequired) {
          alert(error.message || "Upgrade required for this feature");
          return;
        }
        if (response.status === 429) {
          alert(error.message || "Scan is on cooldown");
          return;
        }
        alert(error.error || "Failed to sync videos");
        return;
      }

      const data = await response.json();
      const scanLabel = scanType === "quick" ? "Quick scan" : "Full scan";
      alert(
        `${scanLabel} complete! Synced ${data.synced} videos and extracted ${data.linksExtracted} links`
      );
      router.refresh();
    } catch (error) {
      console.error("Sync error:", error);
      alert("Failed to sync videos");
    } finally {
      setIsSyncing(false);
      setActiveScanType(null);
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
            <p className="text-slate-400">Monitor your affiliate link health</p>
          </div>
          <button
            onClick={() => handleSync("full")}
            disabled={isSyncing}
            className="btn-primary flex items-center gap-2 px-6 py-3"
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

          <h2 className="font-display text-3xl tracking-wide mb-4">NO VIDEOS SYNCED YET</h2>
          <p className="text-lg text-slate-400 mb-8">
            Connect your YouTube channel to start monitoring your affiliate links
            and discovering hidden revenue losses.
          </p>

          <button
            onClick={() => handleSync("full")}
            disabled={isSyncing}
            className="btn-primary text-lg px-10 py-4"
          >
            {isSyncing ? "Syncing Your Videos..." : "Sync My YouTube Videos"}
          </button>

          <p className="text-sm text-slate-500 mt-6">
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
        <div className="mb-6 glass-card p-4 flex items-center justify-between border-amber-500/30">
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
            className="btn-primary px-4 py-2 text-sm"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-wide mb-1">DASHBOARD</h1>
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
            className="btn-primary flex items-center gap-2 px-6 py-3"
          >
            <Search className={`w-4 h-4 ${isScanning ? "animate-pulse" : ""}`} />
            {isScanning ? "Scanning..." : "Scan Links"}
          </button>

          {/* Quick Scan Button */}
          <button
            onClick={() => handleSync("quick")}
            disabled={isSyncing || isScanning || !tierInfo.canResync || !scanEligibility.quickScanAvailable}
            className={`flex flex-col items-center px-4 py-2 rounded-lg font-semibold transition border ${
              tierInfo.canResync && scanEligibility.quickScanAvailable
                ? "bg-slate-800 hover:bg-slate-700 border-white/20 text-white"
                : "bg-slate-800/50 border-white/10 cursor-not-allowed text-slate-500"
            }`}
            title={
              !tierInfo.canResync
                ? "Upgrade to resync videos"
                : !scanEligibility.quickScanAvailable
                ? `Available in ${formatCooldown(scanEligibility.quickScanCooldownEnds)}`
                : "Sync videos from last 30 days + top 20 by views"
            }
          >
            <div className="flex items-center gap-2">
              {!tierInfo.canResync ? (
                <Lock className="w-4 h-4 text-slate-500" />
              ) : (
                <RotateCw className={`w-4 h-4 ${isSyncing && activeScanType === "quick" ? "animate-spin" : ""}`} />
              )}
              <span className="text-sm">
                {isSyncing && activeScanType === "quick" ? "Quick..." : "Quick Scan"}
              </span>
            </div>
            {!scanEligibility.quickScanAvailable && tierInfo.canResync && (
              <span className="text-[10px] text-slate-500 mt-0.5">
                {formatCooldown(scanEligibility.quickScanCooldownEnds)}
              </span>
            )}
          </button>

          {/* Full Scan Button */}
          <button
            onClick={() => handleSync("full")}
            disabled={isSyncing || isScanning || !tierInfo.canResync || !scanEligibility.fullScanAvailable}
            className={`flex flex-col items-center px-4 py-2 rounded-lg font-semibold transition border ${
              tierInfo.canResync && scanEligibility.fullScanAvailable
                ? "bg-slate-800 hover:bg-slate-700 border-white/20 text-white"
                : "bg-slate-800/50 border-white/10 cursor-not-allowed text-slate-500"
            }`}
            title={
              !tierInfo.canResync
                ? "Upgrade to resync videos"
                : !scanEligibility.fullScanAvailable
                ? `Available in ${formatCooldown(scanEligibility.fullScanCooldownEnds)}`
                : "Full sync of all videos (up to 500)"
            }
          >
            <div className="flex items-center gap-2">
              {!tierInfo.canResync ? (
                <Lock className="w-4 h-4 text-slate-500" />
              ) : (
                <RotateCw className={`w-4 h-4 ${isSyncing && activeScanType === "full" ? "animate-spin" : ""}`} />
              )}
              <span className="text-sm">
                {isSyncing && activeScanType === "full" ? "Full..." : "Full Scan"}
              </span>
            </div>
            {!scanEligibility.fullScanAvailable && tierInfo.canResync && (
              <span className="text-[10px] text-slate-500 mt-0.5">
                {formatCooldown(scanEligibility.fullScanCooldownEnds)}
              </span>
            )}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting || !tierInfo.canExportCSV}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition border ${
              tierInfo.canExportCSV
                ? "bg-slate-800 hover:bg-slate-700 border-white/20 text-white"
                : "bg-slate-800/50 border-white/10 cursor-not-allowed text-slate-500"
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
        <div className="mb-6 glass-card p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">Low channel activity detected</p>
            <p className="text-sm text-slate-400 mt-1">
              Revenue estimates may be understated due to limited recent traffic. Broken affiliate links still block future earnings.
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics - 5 stat cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-12">
        {/* Total Links */}
        <div className="glass-card p-6">
          <p className="text-xs font-mono text-slate-400 tracking-wider mb-2">TOTAL LINKS</p>
          <p className="font-display text-3xl text-white">{stats.totalLinks}</p>
        </div>

        {/* Health Score */}
        <div className="glass-card p-6 border-cyan-500/30">
          <p className="text-xs font-mono text-cyan-400 tracking-wider mb-2">HEALTH SCORE</p>
          <p className="font-display text-3xl text-cyan-400">{stats.healthScore}%</p>
        </div>

        {/* Monthly Loss */}
        <div
          className="glass-card p-6 border-red-500/30"
          title="Based on detected broken affiliate links and typical conversion rates. Actual revenue depends on traffic."
        >
          <p className="text-xs font-mono text-red-400 tracking-wider mb-2 flex items-center gap-1.5">
            MONTHLY AT RISK
            <Info className="w-3 h-3 text-red-400/60" />
          </p>
          <p className="font-display text-3xl text-red-400">
            ${stats.monthlyLoss.toLocaleString()}
          </p>
        </div>

        {/* Annual Loss */}
        <div
          className="glass-card p-6 border-amber-500/30"
          title="Based on detected broken affiliate links and typical conversion rates. Actual revenue depends on traffic."
        >
          <p className="text-xs font-mono text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
            ANNUAL AT RISK
            <Info className="w-3 h-3 text-amber-400/60" />
          </p>
          <p className="font-display text-3xl text-amber-400">
            ${stats.annualLoss.toLocaleString()}
          </p>
        </div>

        {/* Disclosure Issues */}
        <Link
          href="/fix-center?tab=disclosure"
          className={`glass-card p-6 transition-all ${
            stats.disclosureIssues > 0
              ? "border-yellow-500/30 hover:border-yellow-500/50"
              : ""
          }`}
          title="Videos with affiliate links missing proper FTC disclosure"
        >
          <p className={`text-xs font-mono tracking-wider mb-2 flex items-center gap-1.5 ${
            stats.disclosureIssues > 0 ? "text-yellow-400" : "text-slate-400"
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
        <div className="mb-8 glass-card p-6 border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-display text-lg tracking-wide text-white">
                  REVENUE RECOVERED
                </h3>
                <p className="text-sm text-slate-400">
                  {recoveryStats.linksFixed} link{recoveryStats.linksFixed !== 1 ? "s" : ""} fixed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-cyan-400 tracking-wider mb-1">EST. MONTHLY RECOVERY</p>
              <p className="font-display text-3xl text-cyan-400">
                ${recoveryStats.monthlyRecovered.toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">
                ${recoveryStats.annualRecovered.toLocaleString()}/year
              </p>
            </div>
            <Link
              href="/history"
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-cyan-400 text-sm font-medium transition"
            >
              <History className="w-4 h-4" />
              View History
            </Link>
          </div>
        </div>
      )}

      {/* CTA Block - Go to Fix Center */}
      {stats.brokenLinks > 0 ? (
        <div className="glass-card p-8 text-center border-red-500/30">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wrench className="w-8 h-8 text-red-400" />
            <h2 className="font-display text-2xl tracking-wide text-white">
              {stats.brokenLinks} BROKEN LINK{stats.brokenLinks !== 1 ? "S" : ""} NEED ATTENTION
            </h2>
          </div>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            You&apos;re losing approximately <span className="text-red-400 font-semibold">${stats.monthlyLoss.toLocaleString()}/month</span> in affiliate revenue.
            Fix these links to recover your earnings.
          </p>
          <Link
            href="/fix-center"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg"
          >
            Go to Fix Center
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="glass-card p-8 text-center border-cyan-500/30">
          <CheckCircle2 className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
          <h2 className="font-display text-2xl tracking-wide mb-2 text-white">ALL LINKS HEALTHY!</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            No broken or out-of-stock links detected. Your affiliate links are working properly.
          </p>
        </div>
      )}
    </div>
  );
}
