"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, ExternalLink, Copy, Check, Share2, Lock, Info } from "lucide-react";
import { formatCurrency, calculateAnnualizedImpact } from "@/lib/revenue-estimator";
import { track, ANALYTICS_EVENTS } from "@/lib/posthog";
import Link from "next/link";

interface AuditIssue {
  videoTitle: string;
  videoId: string;
  url: string;
  status: string;
  revenueImpact: number;
}

interface AuditResult {
  auditId: string;
  channelId: string;
  channelName: string;
  channelThumbnail: string | null;
  totalVideos: number;
  totalLinks: number;
  brokenLinks: number;
  outOfStockLinks: number;
  redirectLinks: number;
  healthyLinks: number;
  potentialMonthlyImpact: number;
  topIssues: AuditIssue[];
}

export function AuditTool() {
  const [channelUrl, setChannelUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Track audit started
    track(ANALYTICS_EVENTS.DASHBOARD_VIEWED, { type: "public_audit" });

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl: channelUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to run audit");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const shareUrl = `${window.location.origin}/audit/results/${result.auditId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track share
      await fetch(`/api/audit/results/${result.auditId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share" }),
      });
    } catch {
      // Fallback to native share if available
      if (navigator.share) {
        await navigator.share({
          title: `I could recover ${formatCurrency(calculateAnnualizedImpact(result.potentialMonthlyImpact))}/year in affiliate revenue`,
          text: `Use this free tool to check your affiliate links: ${shareUrl}`,
          url: shareUrl,
        });
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="Paste YouTube channel URL or @handle"
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !channelUrl.trim()}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              "Audit My Channel"
            )}
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-3">
          Examples: youtube.com/c/YourChannel, youtube.com/@handle, or UC...
        </p>
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-red-950/30 border border-red-700/50 rounded-xl p-6 text-center mb-8">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium">{error}</p>
          <p className="text-sm text-slate-400 mt-2">
            Make sure you're using a valid YouTube channel URL or handle.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
          <p className="text-white font-medium mb-2">Scanning your last 15 videos...</p>
          <p className="text-sm text-slate-400">
            This may take 20-30 seconds while we check your affiliate links.
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Big Revenue Number - Show both monthly and annual */}
          <div className="bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-700/50 rounded-xl p-8 text-center">
            <p className="text-sm text-emerald-400 uppercase tracking-wide mb-2">
              Recoverable Annual Revenue
            </p>
            <p className="text-5xl md:text-6xl font-bold text-emerald-400 mb-2">
              {formatCurrency(calculateAnnualizedImpact(result.potentialMonthlyImpact))}
              <span className="text-2xl text-emerald-400/70">/year</span>
            </p>
            <p className="text-slate-400">
              {formatCurrency(result.potentialMonthlyImpact)}/month in affiliate commissions you could recover
            </p>
            {/* Tooltip about conservative estimate */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Info className="w-3 h-3" />
              <span>Conservative estimate — doesn&apos;t include &quot;halo&quot; commissions from other items viewers buy</span>
            </div>
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
                  Scanned last {result.totalVideos} videos • {result.totalLinks} affiliate links found
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

          {/* Free Audit Limitations Notice */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-400">
                <p className="font-medium text-slate-300 mb-1">Free Audit Preview</p>
                <p>This one-time scan covers your last 15 videos. Sign up to scan your full channel history, get AI fix suggestions, copy links, export descriptions, and enable weekly monitoring.</p>
              </div>
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
                <h3 className="font-semibold text-white">Top Issues to Fix First</h3>
                <p className="text-sm text-slate-400">Ranked by revenue impact</p>
              </div>
              <div className="divide-y divide-slate-700/30">
                {result.topIssues.slice(0, 5).map((issue, i) => (
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
                          : issue.status === "REDIRECT"
                          ? "bg-orange-950/50 text-orange-400"
                          : "bg-amber-950/50 text-amber-400"
                      }`}>
                        {issue.status === "NOT_FOUND" ? "Broken" : issue.status === "REDIRECT" ? "Redirect" : "Out of Stock"}
                      </span>
                      <p className="text-sm text-red-400 mt-1">
                        -{formatCurrency(issue.revenueImpact)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-700/50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-4">
              Ready to Fix These & Start Monitoring?
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-300 mb-6 max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Full channel history</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>AI fix suggestions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>One-click copy</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Export descriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Weekly monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Mark as fixed</span>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-white transition"
            >
              Sign Up Free — 7-Day Trial
            </Link>
            <p className="text-xs text-slate-500 mt-4">
              7-day free trial · Cancel anytime
            </p>
          </div>

          {/* Share Prompt */}
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
      )}
    </div>
  );
}
