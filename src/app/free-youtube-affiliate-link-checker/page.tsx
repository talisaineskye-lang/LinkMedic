import { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, CheckCircle, AlertTriangle, ExternalLink, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Free YouTube Affiliate Link Checker | Find Broken Links in Minutes",
  description: "Scan your YouTube video descriptions for broken affiliate links, out-of-stock products, and dead URLs. Free audit for YouTube creators.",
  keywords: ["youtube affiliate link checker", "broken link checker", "youtube affiliate audit", "amazon affiliate links youtube"],
  openGraph: {
    title: "Free YouTube Affiliate Link Checker | LinkMedic",
    description: "Find broken affiliate links in your YouTube videos. Free scan for creators.",
    type: "website",
  },
};

export default function FreeYouTubeAffiliateLinkChecker() {
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

      {/* Hero - Tool First */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Free YouTube Affiliate Link Checker
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Find broken links in your video descriptions in minutes.
            See which affiliate links are costing you money.
          </p>

          {/* Primary CTA */}
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-emerald-900/30"
          >
            Run Free Audit
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="mt-4 text-sm text-slate-500">
            No credit card required. Connect your YouTube channel and scan in seconds.
          </p>
        </div>
      </section>

      {/* What the audit checks */}
      <section className="py-16 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">What the Free Audit Checks</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-lg">Broken & Dead Links</h3>
              </div>
              <p className="text-slate-400 text-sm">
                404 errors, expired redirects, and URLs that no longer resolve.
              </p>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-lg">Out-of-Stock Products</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Amazon products without a Buy Box or marked as unavailable.
              </p>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold text-lg">Discontinued Items</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Products that have been removed or replaced with newer models.
              </p>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <ExternalLink className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-lg">Reused Problem Links</h3>
              </div>
              <p className="text-slate-400 text-sm">
                One broken link used across multiple videos multiplies your losses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why links break */}
      <section className="py-16 border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Why YouTube Affiliate Links Break So Often</h2>

          <div className="prose prose-invert prose-slate max-w-none">
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Affiliate links decay faster than most creators realize. Common reasons include:
            </p>

            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Products going out of stock or discontinued</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Amazon removing the Buy Box (&quot;no featured offers&quot;)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Redirects and short links expiring</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Old models being replaced by newer versions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Regional storefront differences (US vs UK vs CA)</span>
              </li>
            </ul>

            <p className="text-slate-400 mt-6 italic">
              The video still gets views. The description still looks fine. But the monetization? Gone.
            </p>
          </div>
        </div>
      </section>

      {/* Manual vs Automated */}
      <section className="py-16 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">How to Check YouTube Affiliate Links Manually</h2>

          <div className="text-slate-300 space-y-4 mb-8">
            <p>You can audit links manually by:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Opening each video description</li>
              <li>Clicking every affiliate link</li>
              <li>Checking for 404s, unavailable products, or redirects</li>
            </ol>
            <p className="text-slate-400">
              This works for a handful of videos — but not if you have 50, 100, or 500+ uploads.
            </p>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-3 text-emerald-400">A Faster Way</h3>
            <p className="text-slate-300 mb-4">
              A free YouTube affiliate link checker scans your video descriptions and flags broken links,
              out-of-stock products, and monetization-blocking pages — across all your videos at once.
            </p>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              Run your free audit now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What you see in results */}
      <section className="py-16 border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">What You&apos;ll See in Your Audit Results</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>How many links are broken across your channel</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Which specific videos are affected</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Which issues matter most (prioritized by video views)</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Links reused across multiple videos (one fix, many recoveries)</span>
            </div>
          </div>

          <p className="text-slate-400 mt-6">
            No guessing. No spreadsheets. Just clear data on what&apos;s costing you money.
          </p>
        </div>
      </section>

      {/* Why creators are surprised */}
      <section className="py-16 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">Why Creators Are Surprised by the Results</h2>

          <blockquote className="border-l-4 border-slate-600 pl-6 py-2 mb-6">
            <p className="text-slate-400 italic text-lg">
              &quot;If views are steady, my links must be fine.&quot;
            </p>
          </blockquote>

          <p className="text-slate-300 mb-6">
            In reality, older videos are often the biggest source of silent revenue loss — especially
            if you reused the same links across many descriptions.
          </p>

          <p className="text-slate-300 font-medium">
            A free audit shows you what&apos;s actually happening.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            If you rely on affiliate income, checking link health isn&apos;t optional anymore.
          </h2>
          <p className="text-slate-400 mb-8">
            Run a free audit and see exactly which links need attention.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-emerald-900/30"
          >
            Run Free Audit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

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
