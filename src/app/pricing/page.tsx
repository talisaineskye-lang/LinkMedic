'use client';

import { Check, Zap, TrendingUp, Bell, Users, FileText, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/pricing" className="text-white">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
          </nav>
          <Link
            href="/audit"
            className="btn-primary px-4 py-2 text-sm"
          >
            Start Free Audit
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-cyan-400 font-mono text-sm mb-4 tracking-wider">PRICING</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide mb-4">
            RECOVER YOUR <span className="text-cyan-400">LOST REVENUE</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From diagnostic to full protection. Choose the plan that fits your channel.
          </p>
        </div>

        {/* Three-Tier Pricing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

          {/* Free Scan */}
          <div className="glass-card p-8">
            <div className="mb-6">
              <h3 className="font-display text-2xl text-white mb-1">FREE SCAN</h3>
              <p className="text-slate-400 text-sm mb-6">See what&apos;s broken</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-5xl text-white">$0</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Scan last 15 videos</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Basic link status (404s, redirects)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">One-time report</span>
              </li>
            </ul>

            <Link
              href="/audit"
              className="btn-ghost block w-full text-center"
            >
              START FREE
            </Link>

            <p className="text-xs text-slate-500 text-center mt-4">
              No credit card required
            </p>
          </div>

          {/* Specialist - RECOMMENDED */}
          <div className="relative glass-card p-8 border-cyan-500/30" style={{ boxShadow: '0 20px 60px rgba(6, 182, 212, 0.15)' }}>

            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black text-xs font-bold rounded">
                BEST VALUE
              </div>
            </div>

            <div className="mb-6 pt-2">
              <h3 className="font-display text-2xl text-cyan-400 mb-1">SPECIALIST</h3>
              <p className="text-slate-400 text-sm mb-6">Full protection for one channel</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-5xl text-white">$19</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Full channel scan (unlimited videos)</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">AI fix suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Weekly monitoring</span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Export fix list</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-white">Fix in dashboard</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="btn-primary block w-full text-center"
            >
              START FREE TRIAL
            </Link>

            <div className="mt-4 text-xs text-slate-500 text-center">
              7-day free trial · Cancel anytime
            </div>
          </div>

          {/* Operator */}
          <div className="glass-card p-8">
            <div className="mb-6">
              <h3 className="font-display text-2xl text-white mb-1">OPERATOR</h3>
              <p className="text-slate-400 text-sm mb-6">For creators with multiple channels</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-display text-5xl text-white">$39</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Up to 3 channels</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Everything in Specialist</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Unified dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Priority support</span>
              </li>
            </ul>

            <Link
              href="/login"
              className="btn-primary block w-full text-center"
            >
              START FREE TRIAL
            </Link>

            <div className="mt-4 text-xs text-slate-500 text-center">
              7-day free trial · Cancel anytime
            </div>
          </div>

        </div>

        {/* AI Fix Feature Spotlight */}
        <div className="max-w-4xl mx-auto mb-20 glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl tracking-wide mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              AI-POWERED FIXES
            </h2>
            <p className="text-slate-400">See how LinkMedic saves you hours of work</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Before: Broken Link */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-bold text-red-400 uppercase">Broken Link Detected</span>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-2">Original Link:</p>
                <p className="text-sm text-red-400 font-mono break-all mb-3">
                  https://amzn.to/3xK9d2F
                </p>
                <p className="text-xs text-slate-500">Status: <span className="text-red-400">404 - Product Removed</span></p>
              </div>
            </div>

            {/* After: AI Suggested Fix */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-cyan-400 uppercase">AI Suggested Fix</span>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-2">Replacement Product:</p>
                <p className="text-sm text-cyan-400 font-mono break-all mb-3">
                  https://amazon.com/dp/B0CJ4K...?tag=yourstore-20
                </p>
                <p className="text-xs text-slate-500">Match: <span className="text-cyan-400">98% Similar · In Stock · $49.99</span></p>
              </div>
              <button className="mt-4 w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-bold transition flex items-center justify-center gap-2">
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-black flex items-center justify-center font-display text-2xl shadow-lg shadow-cyan-500/30">
                1
              </div>
              <h3 className="font-display text-lg text-white mb-2">CONNECT</h3>
              <p className="text-sm text-slate-400">One click via YouTube. We scan your video descriptions.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-black flex items-center justify-center font-display text-2xl shadow-lg shadow-cyan-500/30">
                2
              </div>
              <h3 className="font-display text-lg text-white mb-2">DETECT</h3>
              <p className="text-sm text-slate-400">Find 404s, expired tags, and out-of-stock products.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-black flex items-center justify-center font-display text-2xl shadow-lg shadow-cyan-500/30">
                3
              </div>
              <h3 className="font-display text-lg text-white mb-2">FIX</h3>
              <p className="text-sm text-slate-400">Get AI suggestions. Fix in dashboard or export for bulk editing.</p>
            </div>

          </div>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-3xl mx-auto mb-20 glass-card p-8 border-cyan-500/30">
          <h2 className="font-display text-2xl tracking-wide text-center mb-6">THE ROI IS A NO-BRAINER</h2>

          <div className="space-y-4 text-slate-400">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span>Average creator revenue loss:</span>
              <span className="text-xl font-bold text-red-400">$1,500/year</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span>LinkMedic Specialist (annual):</span>
              <span className="text-xl font-bold text-white">$228/year</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold text-white">Your ROI:</span>
              <span className="text-3xl font-bold text-cyan-400">6.5x</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            If you recover just <strong className="text-white">$20/month</strong> in lost commissions, LinkMedic pays for itself.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl tracking-wide text-center mb-12">QUESTIONS?</h2>

          <div className="space-y-4">

            <details className="group glass-card">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-base tracking-wide p-6">
                HOW DO I FIX THE BROKEN LINKS?
                <span className="text-cyan-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-slate-300 text-base px-6 pb-6 -mt-2 leading-relaxed">
                You have options. Fix links one-by-one directly in your LinkMedic dashboard — click a link, see the AI suggestion, copy the fix. For larger channels, export your fix list and update descriptions in bulk using YouTube Studio or your preferred tool.
              </p>
            </details>

            <details className="group glass-card">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-base tracking-wide p-6">
                HOW OFTEN DO YOU SCAN?
                <span className="text-cyan-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-slate-300 text-base px-6 pb-6 -mt-2 leading-relaxed">
                Free users get a one-time scan. Paid users get automatic weekly scans — we catch new issues before they start costing you money.
              </p>
            </details>

            <details className="group glass-card">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-base tracking-wide p-6">
                DO I NEED A CREDIT CARD FOR THE FREE AUDIT?
                <span className="text-cyan-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-slate-300 text-base px-6 pb-6 -mt-2 leading-relaxed">
                No! The free audit shows you broken links across your last 15 videos. No credit card required. You only add payment when you&apos;re ready to scan your full history and enable weekly monitoring.
              </p>
            </details>

            <details className="group glass-card">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-base tracking-wide p-6">
                CAN I CANCEL ANYTIME?
                <span className="text-cyan-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-slate-300 text-base px-6 pb-6 -mt-2 leading-relaxed">
                Absolutely. Cancel from your account settings with one click or email us at hello@linkmedic.pro. You&apos;ll retain access until the end of your billing period.
              </p>
            </details>

            <details className="group glass-card">
              <summary className="flex justify-between items-center cursor-pointer text-white font-display text-base tracking-wide p-6">
                DOES THIS WORK FOR NON-AMAZON LINKS?
                <span className="text-cyan-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="text-slate-300 text-base px-6 pb-6 -mt-2 leading-relaxed">
                We flag 404s and broken redirects for any affiliate link. Amazon links get extra checks for stock status and tag validation.
              </p>
            </details>

          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-20 py-12 border-t border-white/10">
          <h2 className="font-display text-3xl md:text-4xl tracking-wide mb-4">
            EVERY DAY YOU WAIT,<br />
            <span className="text-red-500">MORE REVENUE LEAKS.</span>
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            A free scan takes less than 2 minutes. See exactly what you&apos;re losing.
          </p>
          <Link
            href="/audit"
            className="btn-primary inline-flex items-center gap-2 text-xl px-12 py-6"
          >
            <Zap className="w-5 h-5" />
            SCAN MY CHANNEL — FREE
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-slate-500 mt-4">No credit card required · See results instantly</p>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
          </div>

          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <Link href="/intel" className="hover:text-white transition">Intel Blog</Link>
          </div>

          <div className="text-slate-500 text-sm">
            &copy; 2026 LinkMedic
          </div>
        </div>
      </footer>
    </div>
  );
}
