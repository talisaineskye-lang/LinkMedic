'use client';

import { Check, Zap, TrendingUp, Bell, Users, Shield, Download } from 'lucide-react';
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
            Start with a free audit. See exactly which affiliate links are costing you revenue.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">

          {/* Solo Creator Plan */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-emerald-500/50 rounded-2xl p-8 shadow-2xl relative">

            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1 bg-emerald-500 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>

            {/* Plan Header */}
            <div className="mb-6 pt-4">
              <h3 className="text-2xl font-bold mb-2">Solo Creator</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">$19</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-emerald-400 font-medium">or $190/year (save $38)</p>
            </div>

            {/* Description */}
            <p className="text-slate-300 mb-6">
              Perfect for full-time or serious part-time creators managing one channel.
            </p>

            {/* Channel Limit */}
            <div className="mb-6 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <p className="text-sm text-slate-300">
                <strong className="text-slate-100">1 YouTube Channel</strong>
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Unlimited video scans</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">24/7 Link Guard monitoring</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Instant alerts when links break</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">One-click bulk link replacement</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Amazon out-of-stock detection</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">AI-powered link suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Revenue impact prioritization</span>
              </li>
            </ul>

            {/* CTA Button */}
            <Link
              href="/audit"
              className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-center"
            >
              Start Free Audit
            </Link>

            {/* Fine Print */}
            <p className="text-xs text-slate-400 text-center mt-4">
              See your top broken links free · No credit card required
            </p>
          </div>

          {/* Business/Agency Plan */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-xl">

            {/* Plan Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Business / Agency</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">$49</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-400 font-medium">or $490/year (save $98)</p>
            </div>

            {/* Description */}
            <p className="text-slate-300 mb-6">
              For agencies and creators managing multiple channels or clients.
            </p>

            {/* Channel Limit */}
            <div className="mb-6 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <p className="text-sm text-slate-300">
                <strong className="text-slate-100">Up to 5 YouTube Channels</strong>
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300"><strong>Everything in Solo Creator</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Team access & collaboration</span>
              </li>
              <li className="flex items-start gap-3">
                <Download className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Exportable PDF revenue reports</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">Priority support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">White-label client reports (coming soon)</span>
              </li>
            </ul>

            {/* CTA Button */}
            <Link
              href="/audit"
              className="block w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-lg transition-all border border-slate-600/50 text-center"
            >
              Start Free Audit
            </Link>

            {/* Fine Print */}
            <p className="text-xs text-slate-400 text-center mt-4">
              Perfect for faceless channels & creator managers
            </p>
          </div>

        </div>

        {/* How The Funnel Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">1</span>
              </div>
              <h3 className="font-semibold mb-2">Free Calculator</h3>
              <p className="text-sm text-slate-400">Enter your channel URL to estimate revenue loss</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$0</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">2</span>
              </div>
              <h3 className="font-semibold mb-2">See Your Leak</h3>
              <p className="text-sm text-slate-400">View estimated annual revenue loss</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$0</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">3</span>
              </div>
              <h3 className="font-semibold mb-2">Free Audit</h3>
              <p className="text-sm text-slate-400">Connect with Google to see top 3-5 broken links</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$0 (No CC)</p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">4</span>
              </div>
              <h3 className="font-semibold mb-2">Fix Everything</h3>
              <p className="text-sm text-slate-400">Upgrade to see all links + auto-fix</p>
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
              <span>LinkMedic cost (annual):</span>
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
                No! The free audit shows you the top 3-5 broken links costing you the most money.
                No credit card required. You only add payment when you&apos;re ready to see all broken links
                and enable automatic monitoring.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Why is the Solo plan $19 and not cheaper?</h3>
              <p className="text-slate-400">
                If you&apos;re not losing at least $20/month in affiliate commissions, you&apos;re not our target customer yet.
                LinkMedic is for serious creators with an actual revenue problem to solve. The ROI is 6.5x or better.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-slate-400">
                Absolutely. Cancel from your account settings or email us at hello@linkmedic.pro.
                You&apos;ll retain access until the end of your billing period. We also offer a 14-day
                money-back guarantee for new subscribers.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">What&apos;s the difference between monthly and annual pricing?</h3>
              <p className="text-slate-400">
                Annual plans save you 2 months of subscription costs. Solo: $190/year (vs $228/year monthly).
                Business: $490/year (vs $588/year monthly). Perfect if you&apos;re committed to maintaining link health long-term.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">I manage 3 channels. Do I need the Business plan?</h3>
              <p className="text-slate-400">
                Yes. The Solo plan is limited to 1 channel. Business plan supports up to 5 channels,
                plus you get team access and exportable PDF reports—perfect for showing clients their ROI.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">What happens if I have more than 5 channels?</h3>
              <p className="text-slate-400">
                Contact us at hello@linkmedic.pro for enterprise pricing. We can create a custom plan
                for larger agencies or networks managing 10+ channels.
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
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            Run Free Audit
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
