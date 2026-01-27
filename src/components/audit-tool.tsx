"use client";

import { useState } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Lock,
  Info,
  Shield,
  Zap,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from "lucide-react";
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
  verifiedMonthlyLoss: number;
  corruptionRate: number;
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
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-profit-green/50 focus:ring-2 focus:ring-profit-green/20 transition"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !channelUrl.trim()}
            className="px-8 py-4 bg-profit-green hover:bg-profit-green disabled:bg-slate-600 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2"
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
          <Loader2 className="w-12 h-12 text-profit-green mx-auto mb-4 animate-spin" />
          <p className="text-white font-medium mb-2">Scanning your last 15 videos...</p>
          <p className="text-sm text-slate-400">
            This may take 20-30 seconds while we check your affiliate links.
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Channel Info + Corruption Rate */}
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

          {/* ============================================ */}
          {/* REVENUE RECOVERY HEADLINE - High Impact */}
          {/* ============================================ */}
          <div className="bg-gradient-to-br from-red-950/40 via-slate-900 to-profit-green/10/30 border border-red-700/30 rounded-xl p-8">
            <div className="text-center mb-6">
              <p className="text-sm text-red-400 uppercase tracking-wide mb-3 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Revenue Leak Detected
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                We found{" "}
                <span className="text-red-400">{formatCurrency(calculateAnnualizedImpact(result.verifiedMonthlyLoss))}</span>
                {" "}in Recoverable Annual Revenue
              </h2>
              <p className="text-lg text-slate-300">
                You are losing approximately <span className="text-red-400 font-semibold">{formatCurrency(result.verifiedMonthlyLoss)}</span> every month
                across the {result.totalVideos} videos we scanned.
              </p>
            </div>

            {/* Corruption Rate - Prominent Display */}
            {result.corruptionRate > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
                <div className="bg-red-950/50 border border-red-700/50 rounded-xl px-6 py-4 text-center">
                  <p className="text-4xl font-bold text-red-400">{result.corruptionRate}%</p>
                  <p className="text-sm text-red-300">Link Corruption Rate</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Info className="w-3 h-3" />
              <span>Conservative estimate using 1% CTR, 1.5% conversion, 3% commission</span>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-profit-green/10/30 border border-profit-green/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-profit-green">{result.healthyLinks}</p>
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
                          : issue.status === "MISSING_TAG"
                          ? "bg-purple-950/50 text-purple-400"
                          : issue.status === "REDIRECT"
                          ? "bg-orange-950/50 text-orange-400"
                          : issue.status === "OOS_THIRD_PARTY"
                          ? "bg-yellow-950/50 text-yellow-400"
                          : "bg-amber-950/50 text-amber-400"
                      }`}>
                        {issue.status === "NOT_FOUND" ? "Broken" :
                         issue.status === "MISSING_TAG" ? "No Tag" :
                         issue.status === "REDIRECT" ? "Redirect" :
                         issue.status === "OOS_THIRD_PARTY" ? "3rd Party" :
                         "Out of Stock"}
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

          {/* ============================================ */}
          {/* REVENUE RECOVERY CTA */}
          {/* ============================================ */}
          <div className="bg-gradient-to-br from-profit-green/10/60 to-slate-900 border-2 border-profit-green/50 rounded-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Stop the Leak. Recover Your Revenue Today.
              </h3>
              <p className="text-slate-300 max-w-2xl mx-auto">
                We just found <span className="text-red-400 font-semibold">{formatCurrency(calculateAnnualizedImpact(result.verifiedMonthlyLoss))}</span> in annual leakage.
                Don&apos;t let another day go by with broken links. Start your 7-day trial to fix every link
                in your library and set up automated monitoring to ensure you never lose a commission again.
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-8 py-4 bg-profit-green hover:bg-profit-green rounded-xl font-semibold text-white text-lg transition shadow-lg shadow-profit-green/20/50 hover:shadow-profit-green/30/50"
              >
                <Zap className="w-5 h-5" />
                Fix All My Links & Start 7-Day Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Risk Reversal Micro-copy */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-profit-green" />
                No charge today
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-profit-green" />
                Cancel anytime with one click
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-profit-green" />
                Stripe-verified secure checkout
              </span>
            </div>

            {/* ROI Estimate */}
            {result.verifiedMonthlyLoss > 0 && (
              <div className="mt-6 text-center">
                <p className="text-profit-green font-semibold">
                  Estimated ROI for your channel: <span className="text-2xl">{Math.round((calculateAnnualizedImpact(result.verifiedMonthlyLoss) / 228) * 10) / 10}x</span> per year
                </p>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* AI FIX FEATURE SPOTLIGHT */}
          {/* ============================================ */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-profit-green" />
                Feature Spotlight: AI-Powered Fixes
              </h3>
              <p className="text-sm text-slate-400">See how LinkMedic saves you hours of manual work</p>
            </div>

            {/* Mockup showing broken link to AI fix */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Before: Broken Link */}
              <div className="bg-red-950/20 border border-red-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs font-medium text-red-400 uppercase">Broken Link Detected</span>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-500 mb-1">Original Link:</p>
                  <p className="text-sm text-red-400 font-mono break-all">
                    https://amzn.to/3xK9d2F
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Status: <span className="text-red-400">404 - Product Removed</span></p>
                </div>
              </div>

              {/* After: AI Suggested Fix */}
              <div className="bg-profit-green/10/20 border border-profit-green/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-profit-green" />
                  <span className="text-xs font-medium text-profit-green uppercase">AI Suggested Fix</span>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-500 mb-1">Replacement Product:</p>
                  <p className="text-sm text-profit-green font-mono break-all">
                    https://amazon.com/dp/B0CJ4K...?tag=yourstore-20
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Match: <span className="text-profit-green">98% Similar · In Stock · $49.99</span></p>
                </div>
                <button className="mt-3 w-full py-2 bg-profit-green/20 hover:bg-profit-green/30 border border-profit-green/50 rounded text-profit-green text-sm font-medium transition flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Apply Fix & Copy to Clipboard
                </button>
              </div>
            </div>
          </div>

          {/* Free Audit Limitations */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-400">
                <p className="font-medium text-slate-300 mb-1">Free Audit Preview</p>
                <p>This scan covers the last {result.totalVideos} videos. Upgrade to The Specialist ($19/mo) to scan your full channel history and see the total impact across all your content.</p>
              </div>
            </div>
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
