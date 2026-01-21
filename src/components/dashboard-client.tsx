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
} from "lucide-react";
import { track, ANALYTICS_EVENTS } from "@/lib/posthog";

interface DashboardStats {
  totalLinks: number;
  healthyLinks: number;
  brokenLinks: number;
  healthScore: number;
  monthlyLoss: number;
  annualLoss: number;
}

interface DashboardClientProps {
  stats: DashboardStats;
  lastScanDate: Date | null;
}

export function DashboardClient({
  stats,
  lastScanDate,
}: DashboardClientProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();

  // Track dashboard view on mount
  useEffect(() => {
    track(ANALYTICS_EVENTS.DASHBOARD_VIEWED, {
      totalLinks: stats.totalLinks,
      problemLinks: stats.brokenLinks,
    });
  }, [stats]);

  const hasData = stats.totalLinks > 0;

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
            disabled={isSyncing || isScanning}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-600 rounded-lg font-semibold transition border border-slate-700"
          >
            <RotateCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Resync"}
          </button>
        </div>
      </div>

      {/* Key Metrics - 4 stat cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-12">
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
        <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-6 backdrop-blur">
          <p className="text-sm text-red-400 mb-2">Monthly Revenue Loss</p>
          <p className="text-3xl font-bold text-red-400">
            ${stats.monthlyLoss.toLocaleString()}
          </p>
        </div>

        {/* Annual Loss */}
        <div className="bg-amber-950/30 border border-amber-700/50 rounded-lg p-6 backdrop-blur">
          <p className="text-sm text-amber-400 mb-2">Annual Revenue Loss</p>
          <p className="text-3xl font-bold text-amber-400">
            ${stats.annualLoss.toLocaleString()}
          </p>
        </div>
      </div>

      {/* CTA Block - Go to Fix Center */}
      {stats.brokenLinks > 0 ? (
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
