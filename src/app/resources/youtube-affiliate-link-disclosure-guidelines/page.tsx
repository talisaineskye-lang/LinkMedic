import { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, ArrowRight, CheckCircle, AlertTriangle, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "YouTube Affiliate Link Disclosure Guidelines (FTC 2026)",
  description: "Learn how to properly disclose affiliate links on YouTube to stay FTC compliant in 2026. Clear templates, placement rules, and best practices.",
  keywords: ["youtube affiliate disclosure", "ftc affiliate guidelines", "youtube disclosure requirements", "affiliate link disclaimer", "ftc compliance youtube"],
  openGraph: {
    title: "YouTube Affiliate Link Disclosure Guidelines (FTC 2026)",
    description: "How to properly disclose affiliate links on YouTube to stay FTC compliant.",
    type: "article",
  },
};

export default function YouTubeAffiliateDisclosureGuidelines() {
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
          <span className="text-slate-400">YouTube Affiliate Link Disclosure Guidelines</span>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          YouTube Affiliate Link Disclosure Guidelines (FTC 2026)
        </h1>

        <p className="text-lg text-slate-300 mb-12">
          To stay compliant with the Federal Trade Commission (FTC) in 2026, an affiliate disclaimer must be
          <strong className="text-white"> clear, conspicuous, and unavoidable</strong>. The FTC&apos;s primary goal is to
          ensure viewers understand their financial relationship with a brand before they click a link.
        </p>

        {/* Where to Place the Disclaimer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">1. Where to Place the Disclaimer</h2>

          <p className="text-slate-300 mb-6">
            The legal standard is that the disclosure must be <strong className="text-white">&quot;above the fold.&quot;</strong> In a
            YouTube description, this means it must appear before the &quot;Show More&quot; button.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-emerald-400">Do:</span>
                <span className="text-slate-300 ml-2">Place the disclosure in the first 1-2 lines of the description.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-emerald-400">Do:</span>
                <span className="text-slate-300 ml-2">Place it immediately before or next to the affiliate links themselves.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-red-900/20 border border-red-700/30 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-red-400">Don&apos;t:</span>
                <span className="text-slate-300 ml-2">Bury it at the very bottom of a long description or hide it in a block of hashtags.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Templates */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">2. Recommended Templates</h2>

          <p className="text-slate-300 mb-6">
            The FTC prefers <strong className="text-white">&quot;plain English&quot;</strong> over legal jargon. Using the word
            &quot;affiliate&quot; alone is sometimes considered insufficient because some audiences may not know what it means.
          </p>

          {/* Option A */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3">Option A: Standard (Best for most)</h3>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-300 italic">
                &quot;Disclosure: As an [Affiliate Program Name, e.g., Amazon] Associate, I earn from qualifying purchases.
                If you click on a link and make a purchase, I may receive a small commission at no extra cost to you.&quot;
              </p>
            </div>
          </div>

          {/* Option B */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3">Option B: Short &amp; Direct (Best for limited space)</h3>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-300 italic">
                &quot;Commission Earned: I receive a small commission from sales made through the links below.
                This helps support the channel at no extra cost to you!&quot;
              </p>
            </div>
          </div>

          {/* Option C */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3">Option C: Amazon-Specific (Mandatory for Amazon Associates)</h3>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-300 italic">
                &quot;As an Amazon Associate, I earn from qualifying purchases.&quot;
              </p>
            </div>
          </div>
        </section>

        {/* Mandatory Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">3. Mandatory Best Practices for 2026</h2>

          <p className="text-slate-300 mb-6">
            Legal compliance on YouTube now requires more than just a written line in the description:
          </p>

          <div className="space-y-4 mb-6">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
              <h4 className="font-semibold text-slate-100 mb-2">The &quot;One-Two Punch&quot;</h4>
              <p className="text-slate-300">
                The FTC recommends both a <strong className="text-white">written disclosure in the description</strong> and
                a <strong className="text-white">verbal mention in the video</strong> (e.g., &quot;Just a heads up, the links
                in the description are affiliate links, which help support the channel&quot;).
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
              <h4 className="font-semibold text-slate-100 mb-2">YouTube&apos;s Native Tool</h4>
              <p className="text-slate-300">
                You should check the &quot;My video contains paid promotion&quot; box in the YouTube Studio settings.
                However, the FTC explicitly states that <strong className="text-white">using platform tools alone is not enough</strong> —
                you must still provide your own written disclosure.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
              <h4 className="font-semibold text-slate-100 mb-2">Avoid Vague Tags</h4>
              <p className="text-slate-300">
                Do not rely solely on tags like <span className="text-slate-400">#collab</span>, <span className="text-slate-400">#sp</span>,
                or <span className="text-slate-400">#spon</span>. Use clear terms like <span className="text-emerald-400 font-semibold">#ad</span> or
                <span className="text-emerald-400 font-semibold"> #PaidPromotion</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Summary Checklist */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">4. Summary Checklist</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-200 border border-slate-700/50">Requirement</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-200 border border-slate-700/50">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-sm text-slate-300 border border-slate-700/50 font-medium">Visibility</td>
                  <td className="px-4 py-3 text-sm text-slate-300 border border-slate-700/50">Visible without clicking &quot;Show More.&quot;</td>
                </tr>
                <tr className="bg-slate-800/20">
                  <td className="px-4 py-3 text-sm text-slate-300 border border-slate-700/50 font-medium">Language</td>
                  <td className="px-4 py-3 text-sm text-slate-300 border border-slate-700/50">Plain English (e.g., &quot;I earn a commission&quot;).</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-slate-300 border border-slate-700/50 font-medium">Timing</td>
                  <td className="px-4 py-3 text-sm text-slate-300 border border-slate-700/50">Displayed before the user reaches the links.</td>
                </tr>
                <tr className="bg-slate-800/20">
                  <td className="px-4 py-3 text-sm text-slate-300 border border-slate-700/50 font-medium">Verification</td>
                  <td className="px-4 py-3 text-sm text-slate-300 border border-slate-700/50">Mentioned verbally in the video content.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-amber-900/20 border border-amber-700/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">
                <strong className="text-amber-400">Note:</strong> While these are the standard guidelines for the US (FTC),
                if you are in the <strong className="text-white">UK (ASA)</strong> or <strong className="text-white">Canada (Competition Bureau)</strong>,
                the rules are very similar but may require specific tags like <span className="text-white">AD</span> or
                <span className="text-white"> Advertisement</span> to be even more prominent.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Check Your Disclosure Compliance</h2>
          <p className="text-slate-300 mb-6">
            LinkMedic automatically scans your video descriptions for missing or weak affiliate disclosures —
            so you can fix compliance issues before they become a problem.
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
