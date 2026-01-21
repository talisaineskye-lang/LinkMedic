'use client';

import { Check, Zap, TrendingUp, Bell } from 'lucide-react';
import { Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
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
            href="/login"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start recovering lost revenue from broken affiliate links in minutes.
            Cancel anytime.
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">1</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Connect your YouTube channel</h3>
              <p className="text-sm text-slate-400">Quick OAuth authentication</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">2</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2">LinkMedic scans all video descriptions</h3>
              <p className="text-sm text-slate-400">Automated link health checks</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">3</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Review and dead links are flagged</h3>
              <p className="text-sm text-slate-400">See exactly what&apos;s broken</p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">4</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Fix the highest-impact issues first</h3>
              <p className="text-sm text-slate-400">Prioritized by revenue loss</p>
            </div>

          </div>

          {/* Subtitle */}
          <p className="text-center text-slate-400 mt-12 italic max-w-3xl mx-auto">
            &quot;In one test channel, LinkMedic identified dozens of broken affiliate links across older
            videos — representing hundreds in potential monthly revenue.&quot;
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">

            {/* Badge */}
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-sm text-emerald-400 font-medium mb-6">
              7-day free trial
            </div>

            {/* Product Name */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Link<span className="text-emerald-400">Medic</span></h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">$19</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-400 mt-2">$190 / year</p>
            </div>

            {/* Description */}
            <p className="text-slate-300 mb-6">
              Designed for serious creators with growing libraries
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Monitor hundreds of videos</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Weekly automated scans</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Revenue impact prioritization</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Email alerts</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">AI-powered link suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Export reports (CSV)</span>
              </li>
            </ul>

            {/* CTA Button */}
            <Link
              href="/login"
              className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-center"
            >
              Start 7-Day Free Trial
            </Link>

            {/* Fine Print */}
            <p className="text-xs text-slate-400 text-center mt-4">
              Cancel anytime · 14-day money-back guarantee
            </p>
          </div>
        </div>

        {/* Trust Badges / Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-semibold mb-2">Instant Setup</h4>
            <p className="text-sm text-slate-400">
              Connect your channel and start scanning in under 60 seconds
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-semibold mb-2">Recover Lost Revenue</h4>
            <p className="text-sm text-slate-400">
              Fix broken links and stop leaving money on the table
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-semibold mb-2">Stay Informed</h4>
            <p className="text-sm text-slate-400">
              Get notified when links break so you can fix them fast
            </p>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">How does the 7-day free trial work?</h3>
              <p className="text-slate-400">
                Sign up with Google, connect your YouTube channel, and start scanning immediately.
                After 7 days, you&apos;ll be prompted to add payment to continue.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-400">
                Yes! Cancel from your account settings or email us at hello@linkmedic.pro.
                You&apos;ll retain access until the end of your billing period. We also offer a 14-day
                money-back guarantee for new subscribers.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">How many videos can I monitor?</h3>
              <p className="text-slate-400">
                Unlimited! Whether you have 50 videos or 5,000, LinkMedic scans them all.
                We&apos;re designed for creators with growing catalogs.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">What affiliate platforms do you support?</h3>
              <p className="text-slate-400">
                We check all links, but we&apos;re especially good at Amazon Associates, LTK (LikeToKnow.it),
                and other major affiliate programs. If a link is broken, we&apos;ll flag it regardless of platform.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">How accurate are the revenue loss estimates?</h3>
              <p className="text-slate-400">
                We use conservative industry benchmarks (CTR, conversion rates, average order value)
                to estimate potential losses. These are approximations to help you prioritize fixes.
                Your actual impact may vary based on your audience and products.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Is my YouTube data safe?</h3>
              <p className="text-slate-400">
                Absolutely. We only access public video metadata (titles, descriptions, views) via
                YouTube&apos;s official API. We never access private videos, comments, or personal data.
                See our <Link href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link> for details.
              </p>
            </div>

          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-20 py-12 border-t border-slate-700/50">
          <h2 className="text-3xl font-bold mb-4">Ready to stop losing money?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Start your free trial and see which links are costing you revenue.
          </p>
          <Link
            href="/login"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            Start Free Trial
          </Link>
          <p className="text-sm text-slate-400 mt-4">7-day free trial · Cancel anytime</p>
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
