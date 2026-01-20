import { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, ArrowRight, Target, Repeat, BarChart3, FileText, X, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Audit YouTube Descriptions for Affiliate Links (The Right Way)",
  description: "Learn the right way to audit YouTube descriptions for affiliate links. Prioritize by revenue impact, identify reused links, and save time with automated audits.",
  keywords: ["audit youtube descriptions", "youtube affiliate link audit", "check youtube affiliate links", "youtube description audit"],
  openGraph: {
    title: "How to Audit YouTube Descriptions for Affiliate Links (The Right Way)",
    description: "Learn the right way to audit YouTube descriptions for affiliate links.",
    type: "article",
  },
};

export default function AuditYouTubeDescriptions() {
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
          <span className="text-slate-400">Audit YouTube Descriptions</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          How to Audit YouTube Descriptions for Affiliate Links (The Right Way)
        </h1>

        <p className="text-lg text-slate-300 mb-6">
          Auditing YouTube descriptions isn&apos;t about perfection — it&apos;s about impact.
        </p>

        <p className="text-xl text-slate-100 font-medium mb-12">
          The goal is to find the links that are costing you the most money.
        </p>

        {/* Wrong way */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">The Wrong Way to Audit Affiliate Links</h2>

          <div className="bg-red-900/10 border border-red-700/30 rounded-xl p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>Random spot checks</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>Clicking links without tracking patterns</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>Fixing low-traffic videos first</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>Ignoring reused template links</span>
              </div>
            </div>
            <p className="text-red-400 mt-4 font-medium">
              This wastes time and misses the real issues.
            </p>
          </div>
        </section>

        {/* Right way */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">The Right Way to Audit YouTube Affiliate Links</h2>

          {/* Step 1 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">1</div>
              <h3 className="text-xl font-semibold">Start with Your Top Videos</h3>
            </div>
            <div className="ml-11">
              <p className="text-slate-300 mb-4">Focus on:</p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Highest lifetime views
                </li>
                <li className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Evergreen content
                </li>
                <li className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Videos with multiple affiliate links
                </li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">2</div>
              <h3 className="text-xl font-semibold">Identify Reused Links</h3>
            </div>
            <div className="ml-11">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Repeat className="w-5 h-5 text-amber-400" />
                  <span className="font-medium text-slate-100">Single-Point Failures</span>
                </div>
                <p className="text-slate-300">
                  Links reused across many videos are single-point failures. Fixing one can recover revenue across your entire catalog.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">3</div>
              <h3 className="text-xl font-semibold">Prioritize by Revenue Impact</h3>
            </div>
            <div className="ml-11">
              <p className="text-slate-300 mb-4">Not all broken links are equal.</p>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-slate-100">Impact Matters</span>
                </div>
                <p className="text-slate-400 text-sm mb-2">A dead link in a 100-view video ≠</p>
                <p className="text-slate-300">A dead link in a 100,000-view video.</p>
              </div>
              <p className="text-slate-400 mt-4 italic">
                This is why prioritization matters more than raw counts.
              </p>
            </div>
          </div>
        </section>

        {/* Automated audits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How Creators Save Time with Automated Audits</h2>

          <p className="text-slate-300 mb-6">
            Modern creators don&apos;t manually audit hundreds of descriptions. They use tools like LinkMedic to:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-slate-300">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Scan descriptions automatically</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Flag broken, out-of-stock, or redirected affiliate links</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Rank issues by estimated revenue impact</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Export corrected descriptions for quick fixes</span>
            </div>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-emerald-400">Multi-Day Task → Minutes of Review</span>
            </div>
            <p className="text-slate-300">
              That turns a multi-day task into a few minutes of review.
            </p>
          </div>
        </section>

        {/* Final thought */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Final Thought</h2>

          <p className="text-slate-300 mb-6">
            Affiliate revenue loss on YouTube is rarely dramatic — it&apos;s gradual, quiet, and easy to miss.
          </p>

          <p className="text-slate-300 mb-6">
            That&apos;s why free audit tools work so well:
          </p>

          <ul className="space-y-2 text-slate-300 mb-6">
            <li className="flex items-center gap-3">
              <span className="text-emerald-500">•</span>
              They surface hidden problems
            </li>
            <li className="flex items-center gap-3">
              <span className="text-emerald-500">•</span>
              They match real search intent
            </li>
            <li className="flex items-center gap-3">
              <span className="text-emerald-500">•</span>
              They give immediate value
            </li>
          </ul>

          <p className="text-slate-100 font-medium text-lg">
            If you&apos;re serious about affiliate income, auditing your links shouldn&apos;t be optional — it should be routine.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Start Your Free Audit Now</h2>
          <p className="text-slate-300 mb-6">
            See which links need attention — prioritized by revenue impact.
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
