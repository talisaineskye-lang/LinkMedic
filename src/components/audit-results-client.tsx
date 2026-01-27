"use client";

import { useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  Share2,
  Lock,
  Info,
  Shield,
  Zap,
  FileText,
  Users,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { formatCurrency, calculateAnnualizedImpact } from "@/lib/revenue-estimator";
import Link from "next/link";

interface AuditIssue {
  videoTitle: string;
  videoId: string;
  url: string;
  status: string;
  revenueImpact: number;
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
  verifiedMonthlyLoss: number;
  corruptionRate: number;
  potentialMonthlyImpact: number;
  topIssues: AuditIssue[];
}

interface AuditResultsClientProps {
  auditId: string;
  initialData: AuditResult;
}

export function AuditResultsClient({ auditId, initialData }: AuditResultsClientProps) {
  const [copied, setCopied] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const result = initialData;

  // Calculate key metrics
  const annualLoss = calculateAnnualizedImpact(result.verifiedMonthlyLoss);
  const monthlyLoss = result.verifiedMonthlyLoss;
  const videosWithIssues = result.topIssues.length > 0
    ? Math.min(result.totalVideos, new Set(result.topIssues.map(i => i.videoId)).size)
    : 0;
  const videoCorruptionRate = result.totalVideos > 0
    ? Math.round((videosWithIssues / result.totalVideos) * 100)
    : 0;

  // ROI calculation: Annual Loss / $228 (yearly cost of $19/mo)
  const estimatedROI = annualLoss > 0 ? Math.round((annualLoss / 228) * 10) / 10 : 0;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/audit/results/${auditId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      await fetch(`/api/audit/results/${auditId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "share" }),
      });
    } catch {
      if (navigator.share) {
        await navigator.share({
          title: `${result.channelName} could recover ${formatCurrency(annualLoss)}/year in affiliate revenue`,
          url: shareUrl,
        });
      }
    }
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to email capture API
    setWaitlistSubmitted(true);
    setTimeout(() => setWaitlistSubmitted(false), 3000);
  };

  return (
    <div className="space-y-8">
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
              Scanned last {result.totalVideos} videos · {result.totalLinks} affiliate links found
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
            <span className="text-red-400">{formatCurrency(annualLoss)}</span>
            {" "}in Recoverable Annual Revenue
          </h2>
          <p className="text-lg text-slate-300">
            You are losing approximately <span className="text-red-400 font-semibold">{formatCurrency(monthlyLoss)}</span> every month
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
            {videoCorruptionRate > 0 && (
              <div className="bg-amber-950/50 border border-amber-700/50 rounded-xl px-6 py-4 text-center">
                <p className="text-4xl font-bold text-amber-400">{videoCorruptionRate}%</p>
                <p className="text-sm text-amber-300">Videos With Leaks</p>
              </div>
            )}
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
                      : issue.status === "SEARCH_REDIRECT"
                      ? "bg-orange-950/50 text-orange-400"
                      : issue.status === "MISSING_TAG"
                      ? "bg-purple-950/50 text-purple-400"
                      : issue.status === "REDIRECT"
                      ? "bg-orange-950/50 text-orange-400"
                      : issue.status === "OOS_THIRD_PARTY"
                      ? "bg-yellow-950/50 text-yellow-400"
                      : "bg-amber-950/50 text-amber-400"
                  }`}>
                    {issue.status === "NOT_FOUND" ? "Broken" :
                     issue.status === "SEARCH_REDIRECT" ? "Redirect Error" :
                     issue.status === "MISSING_TAG" ? "No Tag" :
                     issue.status === "REDIRECT" ? "Redirect" :
                     issue.status === "OOS_THIRD_PARTY" ? "3rd Party" :
                     "Out of Stock"}
                  </span>
                  <p className="text-sm text-red-400 mt-1">
                    -{formatCurrency(issue.revenueImpact)}/mo
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
            We just found <span className="text-red-400 font-semibold">{formatCurrency(annualLoss)}</span> in annual leakage.
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
        {estimatedROI > 1 && (
          <div className="mt-6 text-center">
            <p className="text-profit-green font-semibold">
              Estimated ROI for your channel: <span className="text-2xl">{estimatedROI}x</span> per year
            </p>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* THREE-TIER PRICING */}
      {/* ============================================ */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Choose Your Recovery Plan</h3>
          <p className="text-slate-400">From diagnostic to full protection</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tier 1: The Auditor (Free) */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-slate-300">The Auditor</h4>
              <p className="text-3xl font-bold text-white mt-1">$0<span className="text-sm text-slate-500">/mo</span></p>
              <p className="text-sm text-slate-500 mt-1">Diagnostic</p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <Check className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>Scan last 15 videos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <Check className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>Basic link status (404s)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <Check className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>One-time report</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full py-3 bg-slate-700/50 rounded-lg text-slate-500 font-medium cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Tier 2: The Specialist ($19/mo) - RECOMMENDED */}
          <div className="relative bg-gradient-to-b from-profit-green/10/50 to-slate-900 border-2 border-profit-green/50 rounded-xl p-6 shadow-lg shadow-profit-green/20/20">
            {/* Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-profit-green text-white text-xs font-bold px-3 py-1 rounded-full">
                PAYS FOR ITSELF
              </span>
            </div>

            <div className="mb-4 mt-2">
              <h4 className="text-lg font-semibold text-profit-green">The Specialist</h4>
              <p className="text-3xl font-bold text-white mt-1">$19<span className="text-sm text-slate-400">/mo</span></p>
              <p className="text-sm text-profit-green mt-1">Recovery & Protection</p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-profit-green mt-0.5 flex-shrink-0" />
                <span>Scan <strong>Full Channel History</strong></span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-profit-green mt-0.5 flex-shrink-0" />
                <span>Deep AI Detection (OOS, Redirects, Missing Tags)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-profit-green mt-0.5 flex-shrink-0" />
                <span>One-Click AI Fix Suggestions</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-profit-green mt-0.5 flex-shrink-0" />
                <span>Weekly Scans</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-profit-green mt-0.5 flex-shrink-0" />
                <span>Weekly Revenue Alerts</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="block w-full py-3 bg-profit-green hover:bg-profit-green rounded-lg text-white font-semibold text-center transition"
            >
              Start 7-Day Free Trial — Recover My Revenue
            </Link>

            <p className="text-xs text-slate-500 text-center mt-3">
              No charge today · Cancel anytime
            </p>
          </div>

          {/* Tier 3: Operator ($39/mo) - Greyed Out */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-6 opacity-60">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-slate-400">Operator</h4>
              <p className="text-3xl font-bold text-slate-400 mt-1">$39<span className="text-sm text-slate-500">/mo</span></p>
              <p className="text-sm text-slate-500 mt-1">Scale</p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <Users className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                <span>Up to 3 Channels</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <FileText className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                <span>Unified Dashboard</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <FileText className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                <span>Export Fix List</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <Users className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                <span>Priority Support</span>
              </li>
            </ul>

            {/* Waitlist Form */}
            <form onSubmit={handleWaitlistSubmit} className="space-y-2">
              <input
                type="email"
                placeholder="Enter email for waitlist"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-400 font-medium transition"
              >
                {waitlistSubmitted ? "Added to Waitlist!" : "Join the Waitlist"}
              </button>
            </form>
            <p className="text-xs text-slate-600 text-center mt-2">Coming Soon</p>
          </div>
        </div>
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

        <p className="text-center text-xs text-slate-500 mt-4">
          LinkMedic scans Amazon&apos;s catalog to find the best replacement products automatically.
        </p>
      </div>

      {/* Free Audit Limitations */}
      <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-400">
            <p className="font-medium text-slate-300 mb-1">Free Audit Preview</p>
            <p>This scan covers the last {result.totalVideos} videos. Upgrade to The Specialist to scan your full channel history and see the total impact across all your content.</p>
          </div>
        </div>
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
