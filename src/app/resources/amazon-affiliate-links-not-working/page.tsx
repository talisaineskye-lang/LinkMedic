import { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, ArrowRight, AlertTriangle, ShoppingCart, Globe, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Amazon Affiliate Links Not Working? Here's Why & What to Do",
  description: "Discover why Amazon affiliate links stop converting on YouTube. Learn about Buy Box issues, discontinued products, and regional availability problems.",
  keywords: ["amazon affiliate links not working", "amazon buy box affiliate", "amazon affiliate link problems", "youtube amazon affiliate"],
  openGraph: {
    title: "Amazon Affiliate Links Not Working? Here's Why & What to Do",
    description: "Discover why Amazon affiliate links stop converting on YouTube.",
    type: "article",
  },
};

export default function AmazonAffiliateLinksNotWorking() {
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
          <span className="text-slate-400">Amazon Affiliate Links Not Working</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          Amazon Affiliate Links Not Working? Here&apos;s Why (And What to Do)
        </h1>

        <p className="text-lg text-slate-300 mb-12">
          If you&apos;re using Amazon affiliate links on YouTube and your earnings dropped, the issue often isn&apos;t traffic — it&apos;s link integrity.
          Amazon links fail in subtle ways.
        </p>

        {/* Common reasons */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">The Most Common Reasons Amazon Affiliate Links Stop Converting</h2>

          {/* Reason 1 */}
          <div className="mb-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-semibold">1. No Buy Box / &quot;See all buying options&quot;</h3>
            </div>
            <p className="text-slate-300 mb-4">When Amazon removes the Buy Box:</p>
            <ul className="space-y-2 text-slate-300 mb-4">
              <li className="flex items-center gap-3">
                <span className="text-slate-500">•</span>
                Your link still loads
              </li>
              <li className="flex items-center gap-3">
                <span className="text-slate-500">•</span>
                But users are pushed to other sellers
              </li>
              <li className="flex items-center gap-3">
                <span className="text-slate-500">•</span>
                Many of those don&apos;t carry your affiliate tag
              </li>
            </ul>
            <p className="text-red-400 font-medium">
              Result: clicks with little or no commission.
            </p>
          </div>

          {/* Reason 2 */}
          <div className="mb-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-xl font-semibold">2. Product Discontinued or Suppressed</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Amazon regularly removes or suppresses listings, especially:
            </p>
            <ul className="space-y-2 text-slate-300 mb-4">
              <li className="flex items-center gap-3">
                <span className="text-slate-500">•</span>
                White-label products
              </li>
              <li className="flex items-center gap-3">
                <span className="text-slate-500">•</span>
                Seasonal items
              </li>
              <li className="flex items-center gap-3">
                <span className="text-slate-500">•</span>
                Low-inventory sellers
              </li>
            </ul>
            <p className="text-slate-400 italic">
              Your link may redirect or show alternatives instead.
            </p>
          </div>

          {/* Reason 3 */}
          <div className="mb-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-semibold">3. Regional Availability Issues</h3>
            </div>
            <p className="text-slate-300 mb-4">
              A product might be in stock in the US but unavailable in:
            </p>
            <ul className="space-y-2 text-slate-300 mb-4">
              <li className="flex items-center gap-3">
                <span className="text-slate-500">•</span>
                Canada
              </li>
              <li className="flex items-center gap-3">
                <span className="text-slate-500">•</span>
                UK
              </li>
              <li className="flex items-center gap-3">
                <span className="text-slate-500">•</span>
                EU
              </li>
            </ul>
            <p className="text-slate-400">
              If you have international viewers, this can cut conversions dramatically.
            </p>
          </div>
        </section>

        {/* How to check */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How to Check if Your Amazon Affiliate Links Are Working</h2>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-slate-300">
              <Search className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Open links in an incognito window</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Search className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Look for a Buy Box</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Search className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Check availability in multiple regions</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Search className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Confirm your affiliate tag is present</span>
            </div>
          </div>

          <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-6">
            <p className="text-slate-300">
              Now repeat that across 100+ videos — and you&apos;ll see the problem.
            </p>
          </div>
        </section>

        {/* Better approach */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">A Better Approach: Automated Amazon Affiliate Link Checks</h2>

          <p className="text-slate-300 mb-6">
            Instead of manual testing, creators increasingly use tools that:
          </p>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-emerald-500">✓</span>
              Detect unavailable products
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-emerald-500">✓</span>
              Flag Buy Box issues
            </li>
            <li className="flex items-center gap-3 text-slate-300">
              <span className="text-emerald-500">✓</span>
              Identify broken Amazon affiliate links at scale
            </li>
          </ul>

          <p className="text-slate-300 mb-4">
            LinkMedic, for example, scans YouTube descriptions and highlights Amazon links that are no longer monetizing correctly — even if the page technically &quot;works.&quot;
          </p>

          <p className="text-slate-400 italic">
            This is especially important for older, high-traffic videos.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Check Your Amazon Links for Free</h2>
          <p className="text-slate-300 mb-6">
            Run a free audit and see which Amazon affiliate links need attention.
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
