import { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, ArrowRight, Target, Repeat, BarChart3, Clock, X, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Audit YouTube Affiliate Links (Step-by-Step Guide)",
  description: "Learn how to audit YouTube descriptions for broken affiliate links. Find dead links, prioritize by revenue impact, and recover lost commissions fast.",
  keywords: ["audit youtube descriptions", "youtube affiliate link audit", "check youtube affiliate links", "youtube description audit"],
  openGraph: {
    title: "How to Audit YouTube Affiliate Links (Step-by-Step Guide)",
    description: "Learn how to audit YouTube descriptions for broken affiliate links. Find dead links, prioritize by revenue impact, and recover lost commissions fast.",
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
          <span className="text-slate-400">Audit YouTube Affiliate Links</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
          How to Audit YouTube Affiliate Links in Your Video Descriptions
        </h1>

        <p className="text-lg text-slate-300 mb-4">
          Broken affiliate links cost YouTube creators thousands in lost commissions every year. Most don&apos;t notice because the loss is gradual — a dead Amazon link here, an out-of-stock product there.
        </p>

        <p className="text-lg text-slate-300 mb-12">
          An affiliate link audit fixes that. This guide shows you how to audit your YouTube descriptions the right way, prioritizing the links that cost you the most money.
        </p>

        {/* Why Most Audits Fail */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Why Most YouTube Affiliate Audits Fail</h2>

          <p className="text-slate-300 mb-4">Many creators audit their affiliate links the wrong way:</p>

          <div className="bg-red-900/10 border border-red-700/30 rounded-xl p-6 mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>Random spot-checking instead of systematic review</span>
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
                <span>Missing template links reused across multiple videos</span>
              </div>
            </div>
          </div>

          <p className="text-slate-400">
            This approach wastes time and misses high-impact problems.
          </p>
        </section>

        {/* Step-by-Step Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">How to Audit YouTube Descriptions for Affiliate Links (Step-by-Step)</h2>

          {/* Step 1 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">1</div>
              <h3 className="text-xl font-semibold">Start With Your Highest-Traffic Videos</h3>
            </div>
            <div className="ml-11">
              <p className="text-slate-300 mb-4">Not all videos deserve equal attention. Focus your audit on:</p>
              <ul className="space-y-2 text-slate-300 mb-4">
                <li className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Videos with the highest lifetime views
                </li>
                <li className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Evergreen content that still gets traffic
                </li>
                <li className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Videos containing multiple affiliate links
                </li>
              </ul>
              <p className="text-slate-400 italic">
                A broken link in a video with 100,000 views matters more than one in a video with 100 views.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">2</div>
              <h3 className="text-xl font-semibold">Identify Reused Links Across Videos</h3>
            </div>
            <div className="ml-11">
              <p className="text-slate-300 mb-4">
                Many creators use the same affiliate links in multiple video descriptions. These are single-point failures.
              </p>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Repeat className="w-5 h-5 text-amber-400" />
                  <span className="font-medium text-slate-100">Single-Point Failures</span>
                </div>
                <p className="text-slate-300">
                  One broken link could mean lost revenue across 10, 20, or 50 videos. Finding and fixing these first multiplies your recovery.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">3</div>
              <h3 className="text-xl font-semibold">Check for Common Affiliate Link Problems</h3>
            </div>
            <div className="ml-11">
              <p className="text-slate-300 mb-4">When auditing, look for:</p>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 text-slate-300">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span><span className="font-medium text-white">404 errors</span> — product page no longer exists</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span><span className="font-medium text-white">Out-of-stock products</span> — link works but no commission possible</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300">
                  <span className="text-orange-400 font-bold mt-0.5">•</span>
                  <span><span className="font-medium text-white">Search redirects</span> — Amazon redirected your link to a search page</span>
                </div>
                <div className="flex items-start gap-3 text-slate-300">
                  <span className="text-purple-400 font-bold mt-0.5">•</span>
                  <span><span className="font-medium text-white">Missing affiliate tags</span> — link works but you&apos;re not getting credit</span>
                </div>
              </div>
              <p className="text-slate-400 italic">
                Each of these silently drains your affiliate revenue.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">4</div>
              <h3 className="text-xl font-semibold">Prioritize Fixes by Estimated Revenue Impact</h3>
            </div>
            <div className="ml-11">
              <p className="text-slate-300 mb-4">Not all broken links are equal.</p>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-slate-100">Calculate impact using:</span>
                </div>
                <p className="text-slate-300 font-mono text-sm bg-slate-900/50 rounded-lg px-4 py-2">
                  (monthly views) × (click-through rate) × (conversion rate) × (commission)
                </p>
              </div>
              <p className="text-slate-400">
                Fix the highest-impact links first. This ensures your time spent auditing translates directly to recovered revenue.
              </p>
            </div>
          </div>
        </section>

        {/* Manual vs Automated */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Manual Audits vs. Automated YouTube Affiliate Link Tools</h2>

          <p className="text-slate-300 mb-4">
            You can audit manually by clicking every link in every description. For a small channel, this works.
          </p>

          <p className="text-slate-300 mb-6">
            For creators with 50+ videos, manual audits take days and need repeating every few months as products go out of stock or pages change.
          </p>

          <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-6 mb-6">
            <p className="text-slate-300 mb-4">
              Automated affiliate link auditing tools like <span className="text-emerald-400 font-medium">LinkMedic</span> scan your entire channel in minutes. They:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Flag broken links</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Identify out-of-stock products</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Rank issues by revenue impact</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>Export correction sheets so you can fix everything in one sitting</span>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Frequency */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How Often Should You Audit YouTube Affiliate Links?</h2>

          <p className="text-slate-300 mb-6">
            Affiliate links break constantly. Products get discontinued, Amazon pages change, and stock fluctuates.
          </p>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/50">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-slate-100">Recommended audit frequency:</span>
            </div>
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Channel Size</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-400">Audit Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                <tr>
                  <td className="px-6 py-3 text-slate-300">Under 50 videos</td>
                  <td className="px-6 py-3 text-slate-300">Quarterly</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-slate-300">50–200 videos</td>
                  <td className="px-6 py-3 text-slate-300">Monthly</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-slate-300">200+ videos</td>
                  <td className="px-6 py-3 text-slate-300">Weekly or automated monitoring</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Start Your Free YouTube Affiliate Link Audit</h2>
          <p className="text-slate-300 mb-6">
            Affiliate revenue loss is quiet. A few dead links add up to months of missed commissions you&apos;ll never notice — unless you look.
          </p>
          <p className="text-slate-300 mb-6">
            A free audit shows you exactly what&apos;s broken and how much it&apos;s costing you.
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
