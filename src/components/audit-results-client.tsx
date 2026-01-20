"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check, Share2 } from "lucide-react";
import { formatCurrency } from "@/lib/revenue-estimator";
import Link from "next/link";

interface AuditIssue {
  videoTitle: string;
  videoId: string;
  url: string;
  status: string;
  estimatedLoss: number;
}

interface AuditResult {
  channelId: string;
  channelName: string;
  channelThumbnail: string | null;
  totalVideos: number;
  totalLinks: number;
  brokenLinks: number;
  outOfStockLinks: number;
  redirectLinks: number;
  healthyLinks: number;
  estimatedMonthlyLoss: number;
  topIssues: AuditIssue[];
}

interface AuditResultsClientProps {
  auditId: string;
  initialData: AuditResult;
}

export function AuditResultsClient({ auditId, initialData }: AuditResultsClientProps) {
  const [copied, setCopied] = useState(false);
  const result = initialData;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/audit/results/${auditId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track share
      await fetch(`/api/audit/results/${auditId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share" }),
      });
    } catch {
      if (navigator.share) {
        await navigator.share({
          title: `${result.channelName} lost ${formatCurrency(result.estimatedMonthlyLoss)}/month in affiliate revenue`,
          url: shareUrl,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Big Revenue Number */}
      <div className="bg-gradient-to-br from-red-950/50 to-slate-900 border border-red-700/50 rounded-xl p-8 text-center">
        <p className="text-sm text-red-400 uppercase tracking-wide mb-2">
          Revenue Leakage Found
        </p>
        <p className="text-5xl md:text-6xl font-bold text-red-400 mb-2">
          {formatCurrency(result.estimatedMonthlyLoss)}
          <span className="text-2xl text-red-400/70">/month</span>
        </p>
        <p className="text-slate-400">
          Estimated lost affiliate revenue from broken links
        </p>
      </div>

      {/* Channel Info */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-4">
          {result.channelThumbnail && (
            <img
              src={result.channelThumbnail}
              alt={result.channelName}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-white">{result.channelName}</h3>
            <p className="text-sm text-slate-400">
              Scanned {result.totalVideos} videos • {result.totalLinks} affiliate links found
            </p>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm text-slate-300 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{result.healthyLinks}</p>
          <p className="text-sm text-slate-400">Healthy</p>
        </div>
        <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{result.brokenLinks}</p>
          <p className="text-sm text-slate-400">Broken</p>
        </div>
        <div className="bg-amber-950/30 border border-amber-700/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{result.outOfStockLinks}</p>
          <p className="text-sm text-slate-400">Out of Stock</p>
        </div>
        <div className="bg-orange-950/30 border border-orange-700/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{result.redirectLinks}</p>
          <p className="text-sm text-slate-400">Redirects</p>
        </div>
      </div>

      {/* Top Issues */}
      {result.topIssues.length > 0 && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h3 className="font-semibold text-white">Issues Found</h3>
            <p className="text-sm text-slate-400">Ranked by revenue impact</p>
          </div>
          <div className="divide-y divide-slate-700/30">
            {result.topIssues.map((issue, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{issue.videoTitle}</p>
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-400 hover:underline truncate block"
                  >
                    {issue.url.length > 50 ? issue.url.slice(0, 50) + "..." : issue.url}
                    <ExternalLink className="w-3 h-3 inline ml-1" />
                  </a>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    issue.status === "NOT_FOUND"
                      ? "bg-red-950/50 text-red-400"
                      : "bg-amber-950/50 text-amber-400"
                  }`}>
                    {issue.status === "NOT_FOUND" ? "Broken" : "Out of Stock"}
                  </span>
                  <p className="text-sm text-red-400 mt-1">
                    -{formatCurrency(issue.estimatedLoss)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-700/50 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Want to Fix These & Start Monitoring?
        </h3>
        <p className="text-slate-400 mb-6">
          Sign up free to see all broken links, get AI-powered fix suggestions,
          and monitor your channel weekly.
        </p>
        <Link
          href="/login"
          className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-white transition"
        >
          Sign Up Free — 7-Day Trial
        </Link>
        <p className="text-xs text-slate-500 mt-4">
          No credit card required to start
        </p>
      </div>

      {/* Share Section */}
      <div className="text-center">
        <p className="text-slate-400 mb-3">
          Know another creator who should see this?
        </p>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 transition"
        >
          <Copy className="w-4 h-4" />
          Copy Share Link
        </button>
      </div>
    </div>
  );
}
