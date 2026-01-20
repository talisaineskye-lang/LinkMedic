import { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, ArrowRight, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Broken Affiliate Links on YouTube: Why It Happens & How to Fix It",
  description: "Learn why YouTube affiliate links break, what counts as a broken link, and how to fix them. Protect your affiliate revenue from silent decay.",
  keywords: ["broken affiliate links youtube", "fix youtube affiliate links", "youtube affiliate link problems", "amazon affiliate links broken"],
  openGraph: {
    title: "Broken Affiliate Links on YouTube: Why It Happens & How to Fix It",
    description: "Learn why YouTube affiliate links break and how to fix them.",
    type: "article",
  },
};

export default function BrokenAffiliateLinksYouTube() {
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
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/#how-it-works" className="hover:text-white transition">How It Works</Link>
            <Link href="/#pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
          </nav>
          <Link
            href="/login"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/resources" className="hover:text-emerald-400 transition">Resources</Link>
          <span>/</span>
          <span className="text-slate-400">Broken Affiliate Links on YouTube</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          Broken Affiliate Links on YouTube: Why It Happens (And How to Fix It)
        </h1>

        <p className="text-lg text-slate-300 mb-12">
          Broken affiliate links on YouTube are far more common than most creators think — and they rarely break all at once.
          Instead, revenue leaks out slowly.
        </p>

        {/* What counts as broken */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What Counts as a &quot;Broken&quot; Affiliate Link?</h2>

          <p className="text-slate-300 mb-6">
            A link doesn&apos;t need to return a 404 to be broken. Common failure states include:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">&quot;Currently unavailable&quot; product pages</span>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">No Buy Box / no featured offer on Amazon</span>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Redirects that drop your affiliate tag</span>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Links pointing to the wrong product</span>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Short links that no longer resolve</span>
            </div>
          </div>

          <p className="text-slate-400 italic">
            All of these reduce or eliminate commissions — even though the page still loads.
          </p>
        </section>

        {/* Why YouTube makes this worse */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Why YouTube Makes This Worse</h2>

          <p className="text-slate-300 mb-6">
            YouTube is evergreen by nature. A video you uploaded three years ago can still get thousands of views per month.
          </p>

          <p className="text-slate-300 mb-6 font-medium">
            But affiliate links aren&apos;t evergreen.
          </p>

          <ul className="space-y-2 text-slate-300 mb-6">
            <li className="flex items-center gap-3">
              <span className="text-emerald-500">•</span>
              Products change
            </li>
            <li className="flex items-center gap-3">
              <span className="text-emerald-500">•</span>
              Sellers disappear
            </li>
            <li className="flex items-center gap-3">
              <span className="text-emerald-500">•</span>
              Inventory runs out
            </li>
            <li className="flex items-center gap-3">
              <span className="text-emerald-500">•</span>
              URLs get deprecated
            </li>
          </ul>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <p className="text-slate-300">
              <strong className="text-slate-100">That mismatch is the root problem.</strong> Your content stays relevant, but your monetization decays.
            </p>
          </div>
        </section>

        {/* How to fix */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">How to Fix Broken YouTube Affiliate Links</h2>

          {/* Step 1 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-emerald-400 mb-4">Step 1: Identify Which Links Matter Most</h3>
            <p className="text-slate-300 mb-4">Don&apos;t start with random videos. Focus on:</p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                High-view videos
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Videos with multiple affiliate links
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Links reused across many descriptions
              </li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-emerald-400 mb-4">Step 2: Replace, Don&apos;t Remove</h3>
            <p className="text-slate-300 mb-4">
              A broken link should almost always be replaced with:
            </p>
            <ul className="space-y-2 text-slate-300 mb-4">
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">•</span>
                The same product (if available)
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">•</span>
                A newer model
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-500">•</span>
                A close alternative from the same brand
              </li>
            </ul>
            <p className="text-slate-400 italic">
              Removing links entirely usually reduces revenue further.
            </p>
          </div>

          {/* Step 3 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-emerald-400 mb-4">Step 3: Prevent Future Link Rot</h3>
            <p className="text-slate-300 mb-4">
              Manual fixes help — but they don&apos;t prevent future decay.
            </p>
            <p className="text-slate-300 font-medium">
              The only reliable long-term solution is recurring scans that catch problems early.
            </p>
          </div>
        </section>

        {/* How creators automate */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How Creators Automate This Today</h2>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-slate-100">Recurring Monitoring</span>
            </div>
            <p className="text-slate-300 mb-4">
              Tools like LinkMedic monitor YouTube descriptions weekly, flag broken or out-of-stock affiliate links,
              and prioritize fixes by estimated revenue impact.
            </p>
            <p className="text-slate-300">
              Instead of wondering if links are broken, you know which ones to fix first.
            </p>
          </div>

          <p className="text-slate-400 italic">
            That&apos;s the difference between reactive cleanup and proactive revenue protection.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Find Out Which Links Are Broken Right Now</h2>
          <p className="text-slate-300 mb-6">
            Run a free audit and see exactly which affiliate links need attention on your channel.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Run Free Audit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </article>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-0.5">
              <span className="text-white">Link</span>
              <LinkIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">Medic</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/privacy" className="hover:text-emerald-400 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-emerald-400 transition">Terms</Link>
              <Link href="/cookies" className="hover:text-emerald-400 transition">Cookies</Link>
              <Link href="/refund" className="hover:text-emerald-400 transition">Refund</Link>
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
