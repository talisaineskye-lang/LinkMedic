'use client';

import { Check, Zap, TrendingUp, Bell, Users, FileText, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-yt-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-yt-dark/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-yt-light">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/pricing" className="text-white">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
          </nav>
          <Link
            href="/audit"
            className="bg-profit-green text-black px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            Start Free Audit
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-profit-green font-mono text-sm mb-4 tracking-wider">PRICING</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide mb-4">
            RECOVER YOUR <span className="text-profit-green">LOST REVENUE</span>
          </h1>
          <p className="text-xl text-yt-light max-w-2xl mx-auto">
            From diagnostic to full protection. Choose the plan that fits your channel.
          </p>
        </div>

        {/* Three-Tier Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

          {/* Free Scan */}
          <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="mb-6">
              <h3 className="font-display text-2xl text-white mb-1">FREE SCAN</h3>
              <p className="text-yt-light text-sm mb-6">See what&apos;s broken</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-5xl text-white">$0</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-yt-light">Scan last 15 videos</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-yt-light">Basic link status (404s, redirects)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-yt-light">One-time report</span>
              </li>
            </ul>

            <Link
              href="/audit"
              className="block w-full text-center border border-white/20 text-white font-bold py-4 px-6 rounded-lg hover:bg-white/5 transition"
            >
              START FREE
            </Link>

            <p className="text-xs text-yt-light/50 text-center mt-4">
              No credit card required
            </p>
          </div>

          {/* Specialist - RECOMMENDED */}
          <div className="relative bg-yt-gray/70 backdrop-blur-sm border-2 border-profit-green rounded-xl p-8 shadow-[0_0_40px_rgba(0,255,0,0.1)]">

            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1 bg-profit-green text-black text-xs font-bold rounded">
                BEST VALUE
              </div>
            </div>

            <div className="mb-6 pt-2">
              <h3 className="font-display text-2xl text-profit-green mb-1">SPECIALIST</h3>
              <p className="text-yt-light text-sm mb-6">Full protection for one channel</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-5xl text-white">$19</span>
                <span className="text-yt-light">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-white">Full channel scan (unlimited videos)</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-white">AI fix suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-white">Weekly monitoring</span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-white">Export fix list</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-white">Fix in dashboard</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="block w-full text-center bg-profit-green text-black font-bold py-4 px-6 rounded-lg hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,0,0.3)]"
            >
              START FREE TRIAL
            </Link>

            <div className="mt-4 text-xs text-yt-light/50 text-center">
              7-day free trial · Cancel anytime
            </div>
          </div>

          {/* Operator */}
          <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="mb-6">
              <h3 className="font-display text-2xl text-white mb-1">OPERATOR</h3>
              <p className="text-yt-light text-sm mb-6">For creators with multiple channels</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-5xl text-white">$29</span>
                <span className="text-yt-light">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-yt-light">Up to 5 channels</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-yt-light">Everything in Specialist</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-yt-light">Unified dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-profit-green flex-shrink-0 mt-0.5" />
                <span className="text-yt-light">Priority support</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="block w-full text-center bg-profit-green text-black font-bold py-4 px-6 rounded-lg hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
            >
              START FREE TRIAL
            </Link>

            <div className="mt-4 text-xs text-yt-light/50 text-center">
              7-day free trial · Cancel anytime
            </div>
          </div>

        </div>

        {/* AI Fix Feature Spotlight */}
        <div className="max-w-4xl mx-auto mb-20 bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl tracking-wide mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-profit-green" />
              AI-POWERED FIXES
            </h2>
            <p className="text-yt-light">See how LinkMedic saves you hours of work</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before: Broken Link */}
            <div className="bg-emergency-red/10 border border-emergency-red/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-emergency-red"></div>
                <span className="text-sm font-bold text-emergency-red uppercase">Broken Link Detected</span>
              </div>
              <div className="bg-yt-dark/50 rounded-lg p-4">
                <p className="text-xs text-yt-light/50 mb-2">Original Link:</p>
                <p className="text-sm text-emergency-red font-mono break-all mb-3">
                  https://amzn.to/3xK9d2F
                </p>
                <p className="text-xs text-yt-light/50">Status: <span className="text-emergency-red">404 - Product Removed</span></p>
              </div>
            </div>

            {/* After: AI Suggested Fix */}
            <div className="bg-profit-green/10 border border-profit-green/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-profit-green" />
                <span className="text-sm font-bold text-profit-green uppercase">AI Suggested Fix</span>
              </div>
              <div className="bg-yt-dark/50 rounded-lg p-4">
                <p className="text-xs text-yt-light/50 mb-2">Replacement Product:</p>
                <p className="text-sm text-profit-green font-mono break-all mb-3">
                  https://amazon.com/dp/B0CJ4K...?tag=yourstore-20
                </p>
                <p className="text-xs text-yt-light/50">Match: <span className="text-profit-green">98% Similar · In Stock · $49.99</span></p>
              </div>
              <button className="mt-4 w-full py-3 bg-profit-green/20 hover:bg-profit-green/30 border border-profit-green/50 rounded-lg text-profit-green font-bold transition flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Copy Replacement
              </button>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="font-display text-3xl tracking-wide text-center mb-12">HOW IT WORKS</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-profit-green text-black flex items-center justify-center font-display text-2xl shadow-[0_0_30px_rgba(0,255,0,0.3)]">
                1
              </div>
              <h3 className="font-display text-lg text-white mb-2">CONNECT</h3>
              <p className="text-sm text-yt-light">One click via YouTube. We scan your video descriptions.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-profit-green text-black flex items-center justify-center font-display text-2xl shadow-[0_0_30px_rgba(0,255,0,0.3)]">
                2
              </div>
              <h3 className="font-display text-lg text-white mb-2">DETECT</h3>
              <p className="text-sm text-yt-light">Find 404s, expired tags, and out-of-stock products.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-profit-green text-black flex items-center justify-center font-display text-2xl shadow-[0_0_30px_rgba(0,255,0,0.3)]">
                3
              </div>
              <h3 className="font-display text-lg text-white mb-2">FIX</h3>
              <p className="text-sm text-yt-light">Get AI suggestions. Fix in dashboard or export for bulk editing.</p>
            </div>

          </div>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-3xl mx-auto mb-20 bg-yt-gray/70 backdrop-blur-sm border border-profit-green/30 rounded-xl p-8">
          <h2 className="font-display text-2xl tracking-wide text-center mb-6">THE ROI IS A NO-BRAINER</h2>

          <div className="space-y-4 text-yt-light">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span>Average creator revenue loss:</span>
              <span className="text-xl font-bold text-emergency-red">$1,500/year</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span>LinkMedic Specialist (annual):</span>
              <span className="text-xl font-bold text-white">$228/year</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold text-white">Your ROI:</span>
              <span className="text-3xl font-bold text-profit-green">6.5x</span>
            </div>
          </div>

          <p className="text-center text-sm text-yt-light/50 mt-6">
            If you recover just <strong className="text-white">$20/month</strong> in lost commissions, LinkMedic pays for itself.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl tracking-wide text-center mb-12">QUESTIONS?</h2>

          <div className="space-y-4">

            <details className="group bg-yt-gray/70 backdrop-blur-sm rounded-xl border border-white/10">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-sm tracking-wide p-6">
                HOW DO I FIX THE BROKEN LINKS?
                <span className="text-profit-green group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-yt-light text-sm px-6 pb-6 -mt-2">
                You have options. Fix links one-by-one directly in your LinkMedic dashboard — click a link, see the AI suggestion, copy the fix. For larger channels, export your fix list and update descriptions in bulk using YouTube Studio or your preferred tool.
              </p>
            </details>

            <details className="group bg-yt-gray/70 backdrop-blur-sm rounded-xl border border-white/10">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-sm tracking-wide p-6">
                HOW OFTEN DO YOU SCAN?
                <span className="text-profit-green group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-yt-light text-sm px-6 pb-6 -mt-2">
                Free users get a one-time scan. Paid users get automatic weekly scans — we catch new issues before they start costing you money.
              </p>
            </details>

            <details className="group bg-yt-gray/70 backdrop-blur-sm rounded-xl border border-white/10">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-sm tracking-wide p-6">
                DO I NEED A CREDIT CARD FOR THE FREE AUDIT?
                <span className="text-profit-green group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-yt-light text-sm px-6 pb-6 -mt-2">
                No! The free audit shows you broken links across your last 15 videos. No credit card required. You only add payment when you&apos;re ready to scan your full history and enable weekly monitoring.
              </p>
            </details>

            <details className="group bg-yt-gray/70 backdrop-blur-sm rounded-xl border border-white/10">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-sm tracking-wide p-6">
                CAN I CANCEL ANYTIME?
                <span className="text-profit-green group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-yt-light text-sm px-6 pb-6 -mt-2">
                Absolutely. Cancel from your account settings with one click or email us at hello@linkmedic.pro. You&apos;ll retain access until the end of your billing period.
              </p>
            </details>

            <details className="group bg-yt-gray/70 backdrop-blur-sm rounded-xl border border-white/10">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-sm tracking-wide p-6">
                DOES THIS WORK FOR NON-AMAZON LINKS?
                <span className="text-profit-green group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-yt-light text-sm px-6 pb-6 -mt-2">
                We flag 404s and broken redirects for any affiliate link. Amazon links get extra checks for stock status and tag validation.
              </p>
            </details>

          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-20 py-12 border-t border-white/10">
          <h2 className="font-display text-3xl md:text-4xl tracking-wide mb-4">
            EVERY DAY YOU WAIT,<br />
            <span className="text-emergency-red">MORE REVENUE LEAKS.</span>
          </h2>
          <p className="text-xl text-yt-light mb-8">
            A free scan takes less than 2 minutes. See exactly what you&apos;re losing.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-profit-green text-black font-bold py-4 px-8 rounded-lg hover:brightness-110 transition shadow-[0_0_30px_rgba(0,255,0,0.3)]"
          >
            <Zap className="w-5 h-5" />
            SCAN MY CHANNEL — FREE
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-yt-light/50 mt-4">No credit card required · See results instantly</p>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-yt-dark">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
            </div>
            <div className="flex items-center gap-6 text-sm text-yt-light">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
              <Link href="/resources" className="hover:text-white transition">Resources</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
            </div>
          </div>
          <p className="text-center text-sm text-yt-light/50 mt-4">
            &copy; 2026 LinkMedic. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
