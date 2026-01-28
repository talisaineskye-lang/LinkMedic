import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Audit YouTube Affiliate Links (The Right Way) | LinkMedic",
  description: "Learn the right way to audit YouTube descriptions for broken affiliate links, prioritize fixes by revenue impact, and set up ongoing monitoring.",
  keywords: ["youtube affiliate audit", "audit affiliate links", "broken link audit", "youtube description audit"],
  openGraph: {
    title: "How to Audit YouTube Affiliate Links (The Right Way)",
    description: "Prioritize fixes by revenue impact, not random checks.",
    type: "article",
    url: "https://linkmedic.io/resources/audit-youtube-affiliate-links",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Audit YouTube Affiliate Links",
    description: "Prioritize fixes by revenue impact, not random checks.",
  },
};

export default function AuditYouTubeAffiliateLinks() {
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
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="text-white">Resources</Link>
          </nav>
          <Link
            href="/login"
            className="btn-primary px-4 py-2 text-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 pb-20">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-white mb-6">
          HOW TO AUDIT YOUTUBE AFFILIATE LINKS (THE RIGHT WAY)
        </h1>

        <p className="text-slate-400 text-lg mb-8">
          Auditing affiliate links isn&apos;t about checking every link in every video. It&apos;s about finding the links that are costing you the most money and fixing those first.
        </p>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-slate-400">
            This guide covers the right way to audit YouTube descriptions for broken affiliate links, prioritize fixes, and set up ongoing monitoring.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">WHY MOST AFFILIATE LINK AUDITS FAIL</h2>
          <p className="text-slate-400">Many creators audit their links the wrong way:</p>
          <ul className="text-slate-400 space-y-2 list-disc list-inside mb-6">
            <li>Random spot checks that miss patterns</li>
            <li>Clicking links without tracking which videos they appear in</li>
            <li>Fixing low-traffic videos first</li>
            <li>Ignoring links that appear in multiple video descriptions</li>
          </ul>
          <p className="text-slate-400">This approach wastes time and misses the issues that actually impact revenue.</p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">THE RIGHT WAY TO AUDIT AFFILIATE LINKS</h2>

          <h3 className="font-display text-xl text-white mt-8 mb-3">Step 1: Start With Your Top Videos</h3>
          <p className="text-slate-400">Focus on videos that drive the most potential affiliate revenue:</p>
          <ul className="text-slate-400 space-y-2 list-disc list-inside mb-6">
            <li><strong className="text-white">Highest lifetime views:</strong> These videos send the most traffic to your affiliate links.</li>
            <li><strong className="text-white">Evergreen content:</strong> Tutorials, reviews, and how-to videos continue generating views for years.</li>
            <li><strong className="text-white">Videos with multiple affiliate links:</strong> More links mean more potential points of failure.</li>
          </ul>

          <h3 className="font-display text-xl text-white mt-8 mb-3">Step 2: Identify Reused Links</h3>
          <p className="text-slate-400">
            Links that appear across many videos are single points of failure. If one of these breaks, it affects your entire catalog. Fixing a single reused link can recover revenue across dozens of videos at once.
          </p>
          <p className="text-slate-400">
            Common examples include links to your favorite gear, software recommendations, or products you mention frequently.
          </p>

          <h3 className="font-display text-xl text-white mt-8 mb-3">Step 3: Prioritize by Revenue Impact</h3>
          <p className="text-slate-400">
            Not all broken links are equal. A dead link in a video with 100 views is very different from a dead link in a video with 100,000 views.
          </p>
          <p className="text-slate-400">Prioritize fixes based on:</p>
          <ul className="text-slate-400 space-y-2 list-disc list-inside mb-6">
            <li>Video view count</li>
            <li>Number of videos affected (for reused links)</li>
            <li>Typical commission value of the product</li>
          </ul>
          <p className="text-slate-400">This prioritization ensures you fix high-impact issues first.</p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">WHAT TO CHECK DURING AN AUDIT</h2>
          <p className="text-slate-400">For each link, verify:</p>
          <ul className="text-slate-400 space-y-2 list-disc list-inside mb-6">
            <li><strong className="text-white">Link resolves correctly:</strong> Does it load the intended product page?</li>
            <li><strong className="text-white">Product is available:</strong> Is there an &quot;Add to Cart&quot; button, or just &quot;See all buying options&quot;?</li>
            <li><strong className="text-white">Affiliate tag is present:</strong> Check that your tag appears in the URL after any redirects.</li>
            <li><strong className="text-white">Product matches the video:</strong> Sometimes Amazon reassigns product IDs to different items.</li>
          </ul>
          <p className="text-slate-400">Open links in an incognito window to avoid cached or personalized results.</p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">HOW OFTEN SHOULD YOU AUDIT?</h2>
          <p className="text-slate-400">
            A one-time audit helps, but links continue to decay over time. Product availability changes constantly, especially on Amazon.
          </p>
          <p className="text-slate-400">Recommended audit frequency:</p>
          <ul className="text-slate-400 space-y-2 list-disc list-inside mb-6">
            <li><strong className="text-white">Weekly:</strong> Ideal for channels with high affiliate revenue</li>
            <li><strong className="text-white">Monthly:</strong> Minimum for active channels</li>
            <li><strong className="text-white">After product launches:</strong> Check when new models replace products you&apos;ve linked to</li>
          </ul>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">AUTOMATING YOUR AFFILIATE LINK AUDITS</h2>
          <p className="text-slate-400">
            Checking links across hundreds of videos is time-consuming. For a channel with 200 videos and 10 links each, that&apos;s 2,000 individual link checks.
          </p>
          <p className="text-slate-400">
            Modern creators use automated tools to handle this. LinkMedic, for example, scans your YouTube descriptions automatically, flags broken or out-of-stock affiliate links, ranks issues by estimated revenue impact, and exports a prioritized fix list.
          </p>
          <p className="text-slate-400">This turns a multi-day task into a few minutes of review.</p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">KEY TAKEAWAYS</h2>
          <ul className="text-slate-400 space-y-2 list-disc list-inside mb-6">
            <li>Start with high-traffic videos, not random spot checks.</li>
            <li>Reused links are single points of failure that affect your entire catalog.</li>
            <li>Prioritize fixes by revenue impact, not by raw counts.</li>
            <li>Audit regularly. Links decay continuously.</li>
            <li>Automated scanning saves time and catches issues faster.</li>
          </ul>
          <p className="text-slate-400">
            Affiliate revenue loss on YouTube is rarely dramatic. It&apos;s gradual, quiet, and easy to miss. Regular audits prevent small leaks from becoming major losses.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 glass-card p-8 text-center border-cyan-500/30">
          <h3 className="font-display text-2xl text-white mb-4">READY TO AUDIT YOUR CHANNEL?</h3>
          <p className="text-slate-400 mb-6">
            Run a free scan to see which affiliate links need attention.
          </p>
          <Link
            href="/audit"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            Run Free Audit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>

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
