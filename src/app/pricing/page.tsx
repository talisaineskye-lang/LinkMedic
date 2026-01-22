'use client';

import { useState } from 'react';
import { Check, Zap, TrendingUp, Bell, Users, Shield, FileText, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistFeedback, setWaitlistFeedback] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistError(null);
    setWaitlistLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: waitlistEmail,
          tier: "portfolio",
          source: "pricing",
          feedback: waitlistFeedback || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setWaitlistSubmitted(true);
    } catch (err) {
      setWaitlistError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-white">Link</span>
            <LinkIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/pricing" className="text-white">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
          </nav>
          <Link
            href="/audit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start Free Audit
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Stop Losing Money to Broken Links
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From diagnostic to full protection. Choose the plan that fits your channel.
          </p>
        </div>

        {/* ============================================ */}
        {/* THREE-TIER PRICING */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

          {/* Tier 1: The Auditor (Free) */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2 text-slate-300">The Auditor</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-emerald-400 font-medium">Diagnostic</p>
            </div>

            <p className="text-slate-400 mb-6">
              See exactly where your affiliate links are failing. The first step to recovery.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Scan last 15 videos</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Basic link status (404s)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">One-time report</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Revenue loss estimate</span>
              </li>
            </ul>

            <Link
              href="/audit"
              className="block w-full bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-lg transition-all text-center"
            >
              Run Free Audit
            </Link>

            <p className="text-xs text-slate-500 text-center mt-4">
              No credit card required
            </p>
          </div>

          {/* Tier 2: The Specialist ($19/mo) - RECOMMENDED */}
          <div className="relative bg-gradient-to-br from-emerald-950/50 to-slate-900 backdrop-blur border-2 border-emerald-500/50 rounded-2xl p-8 shadow-2xl shadow-emerald-900/20">

            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1 bg-emerald-500 rounded-full text-sm font-bold text-white">
                PAYS FOR ITSELF
              </div>
            </div>

            <div className="mb-6 pt-2">
              <h3 className="text-2xl font-bold mb-2 text-emerald-400">The Specialist</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-white">$19</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-emerald-400 font-medium">Recovery & Protection</p>
            </div>

            <p className="text-slate-300 mb-6">
              Full channel scanning, AI-powered fixes, and 24/7 monitoring to never miss a commission.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">Scan <strong>Full Channel History</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">Deep AI Detection (OOS, Redirects, Missing Tags)</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">One-Click AI Fix Suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">24/7 &quot;Link Guard&quot; Monitoring</span>
              </li>
              <li className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200">Weekly Revenue Alerts</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="block w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-center"
            >
              Start 7-Day Free Trial — Recover My Revenue
            </Link>

            {/* Risk Reversal Micro-copy */}
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <p className="flex items-center justify-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                No charge today. Cancel anytime with one click.
              </p>
              <p className="flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Stripe-verified secure checkout.
              </p>
            </div>
          </div>

          {/* Tier 3: The Portfolio Manager ($49/mo) - Coming Soon */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-amber-700/30 rounded-2xl p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-slate-300">The Portfolio Manager</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-600/20 text-amber-400 rounded-full">
                  Coming Soon
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-white">$49</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-amber-400 font-medium">Scale</p>
            </div>

            <p className="text-slate-400 mb-6">
              Managing multiple channels means multiple leaks. Get a bird&apos;s-eye view of your entire empire&apos;s link health for less than $10 per channel.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-amber-500/70 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Manage up to 10 Channels</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-amber-500/70 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Aggregate Dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-500/70 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Agency PDF Reporting</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-amber-500/70 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Team Access</span>
              </li>
            </ul>

            {/* Waitlist Form */}
            {waitlistSubmitted ? (
              <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-white font-medium">You&apos;re on the list!</p>
                <p className="text-sm text-slate-400">We&apos;ll email you when Portfolio Manager launches.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
                />
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    Optional: What&apos;s the #1 thing you&apos;d need from multi-channel management?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., unified dashboard, team access..."
                    value={waitlistFeedback}
                    onChange={(e) => setWaitlistFeedback(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition text-sm"
                  />
                </div>
                {waitlistError && (
                  <p className="text-red-400 text-sm">{waitlistError}</p>
                )}
                <button
                  type="submit"
                  disabled={waitlistLoading || !waitlistEmail}
                  className="block w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all text-center flex items-center justify-center gap-2"
                >
                  {waitlistLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join the Waitlist"
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* ============================================ */}
        {/* AI FIX FEATURE SPOTLIGHT */}
        {/* ============================================ */}
        <div className="max-w-4xl mx-auto mb-20 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              Feature Spotlight: AI-Powered Fixes
            </h2>
            <p className="text-slate-400">See how LinkMedic saves you hours of manual work</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before: Broken Link */}
            <div className="bg-red-950/20 border border-red-700/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-red-400 uppercase">Broken Link Detected</span>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-2">Original Link:</p>
                <p className="text-sm text-red-400 font-mono break-all mb-3">
                  https://amzn.to/3xK9d2F
                </p>
                <p className="text-xs text-slate-500">Status: <span className="text-red-400">404 - Product Removed</span></p>
              </div>
            </div>

            {/* After: AI Suggested Fix */}
            <div className="bg-emerald-950/20 border border-emerald-700/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400 uppercase">AI Suggested Fix</span>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-2">Replacement Product:</p>
                <p className="text-sm text-emerald-400 font-mono break-all mb-3">
                  https://amazon.com/dp/B0CJ4K...?tag=yourstore-20
                </p>
                <p className="text-xs text-slate-500">Match: <span className="text-emerald-400">98% Similar · In Stock · $49.99</span></p>
              </div>
              <button className="mt-4 w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/50 rounded-lg text-emerald-400 font-medium transition flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Apply Fix & Copy to Clipboard
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            LinkMedic scans Amazon&apos;s catalog to find the best replacement products automatically.
          </p>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">1</span>
              </div>
              <h3 className="font-semibold mb-2">Free Audit</h3>
              <p className="text-sm text-slate-400">Scan your last 15 videos to see your revenue leak</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$0</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">2</span>
              </div>
              <h3 className="font-semibold mb-2">See Your Loss</h3>
              <p className="text-sm text-slate-400">View estimated annual revenue you&apos;re missing</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$0</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">3</span>
              </div>
              <h3 className="font-semibold mb-2">Start Trial</h3>
              <p className="text-sm text-slate-400">7-day free trial to scan full history & fix links</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$0 (7 days)</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">4</span>
              </div>
              <h3 className="font-semibold mb-2">Stay Protected</h3>
              <p className="text-sm text-slate-400">24/7 monitoring with instant fix alerts</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$19/mo</p>
            </div>

          </div>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-3xl mx-auto mb-20 bg-slate-800/30 border border-emerald-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6">The ROI is a No-Brainer</h2>

          <div className="space-y-4 text-slate-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
              <span>Average creator revenue loss:</span>
              <span className="text-xl font-bold text-red-400">$1,500/year</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
              <span>LinkMedic Specialist (annual):</span>
              <span className="text-xl font-bold">$228/year</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold">Your ROI:</span>
              <span className="text-3xl font-bold text-emerald-400">6.5x</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            If you recover just <strong>$20/month</strong> in lost commissions, LinkMedic pays for itself.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-semibold mb-2">Instant Setup</h4>
            <p className="text-sm text-slate-400">
              Connect your channel and scan in under 60 seconds
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-semibold mb-2">Recover Revenue</h4>
            <p className="text-sm text-slate-400">
              Fix broken links and stop leaving money on the table
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-semibold mb-2">24/7 Monitoring</h4>
            <p className="text-sm text-slate-400">
              Get instant alerts when links break
            </p>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Do I need a credit card for the free audit?</h3>
              <p className="text-slate-400">
                No! The free audit shows you broken links across your last 15 videos.
                No credit card required. You only add payment when you&apos;re ready to scan your full history
                and enable automatic monitoring.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">What&apos;s the difference between The Auditor and The Specialist?</h3>
              <p className="text-slate-400">
                The Auditor (free) gives you a diagnostic scan of your last 15 videos.
                The Specialist ($19/mo) scans your entire channel history, provides AI-powered fix suggestions,
                and monitors your links 24/7 so you never miss a commission again.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-400">
                Absolutely. Cancel from your account settings with one click or email us at hello@linkmedic.pro.
                You&apos;ll retain access until the end of your billing period.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">I manage multiple channels. What plan do I need?</h3>
              <p className="text-slate-400">
                The Portfolio Manager ($49/mo) is perfect for creators or agencies managing up to 10 channels.
                It includes an aggregate dashboard, PDF reporting, and team access. This tier is coming soon—join the waitlist to be notified!
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Why is The Specialist $19 and not cheaper?</h3>
              <p className="text-slate-400">
                If you&apos;re not losing at least $20/month in affiliate commissions, you&apos;re not our target customer yet.
                LinkMedic is for serious creators with an actual revenue problem to solve. The ROI is 6.5x or better.
              </p>
            </div>

          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-20 py-12 border-t border-slate-700/50">
          <h2 className="text-3xl font-bold mb-4">Ready to stop losing money?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Start with a free audit. See your top broken links in 60 seconds.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            <Zap className="w-5 h-5" />
            Run Free Audit
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-slate-400 mt-4">No credit card required · See results instantly</p>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-0.5">
              <span className="text-white">Link</span>
              <LinkIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">Medic</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/" className="hover:text-emerald-400 transition">Home</Link>
              <Link href="/audit" className="hover:text-emerald-400 transition">Free Audit</Link>
              <Link href="/resources" className="hover:text-emerald-400 transition">Resources</Link>
              <Link href="/privacy" className="hover:text-emerald-400 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-emerald-400 transition">Terms</Link>
            </div>
          </div>
          <p className="text-center text-sm text-slate-600 mt-4">
            &copy; 2026 LinkMedic. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
