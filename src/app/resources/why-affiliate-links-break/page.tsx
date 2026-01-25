import { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Why Affiliate Links Break on YouTube (And What to Do) | LinkMedic",
  description: "Learn why YouTube affiliate links fail silently, common Amazon link issues, and how to fix broken affiliate links to recover lost revenue.",
  keywords: ["broken affiliate links", "youtube affiliate links", "amazon affiliate problems", "fix broken links"],
};

export default function WhyAffiliateLinksBreak() {
  return (
    <div className="min-h-screen bg-yt-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-yt-dark/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-emergency-red text-xl">+</span>
            <span className="font-display text-xl tracking-wide text-white">LINKMEDIC</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-yt-light">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="text-white">Resources</Link>
          </nav>
          <Link
            href="/login"
            className="bg-profit-green text-black px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-yt-light hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 pb-20">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-white mb-6">
          WHY AFFILIATE LINKS BREAK ON YOUTUBE (AND WHAT TO DO)
        </h1>

        <p className="text-yt-light text-lg mb-8">
          Broken affiliate links on YouTube are more common than most creators realize. The problem is that they rarely break all at once. Instead, revenue leaks out slowly over weeks and months.
        </p>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-yt-light">
            This guide explains why affiliate links fail, how to identify the problem, and what to do about it.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">WHAT COUNTS AS A BROKEN AFFILIATE LINK?</h2>
          <p className="text-yt-light">
            A link doesn&apos;t need to return a 404 error to be broken. Many affiliate links fail while the page still loads normally.
          </p>
          <p className="text-yt-light">Common failure states include:</p>
          <ul className="text-yt-light space-y-2 list-disc list-inside mb-6">
            <li><strong className="text-white">Product unavailable:</strong> The page shows &quot;Currently unavailable&quot; or redirects to a search results page.</li>
            <li><strong className="text-white">No Buy Box on Amazon:</strong> When Amazon removes the featured offer, clicks often don&apos;t credit your affiliate tag.</li>
            <li><strong className="text-white">Redirect drops your tag:</strong> The URL redirects to a new product page, but your affiliate tracking is lost in the redirect.</li>
            <li><strong className="text-white">Short links that stopped working:</strong> Services like amzn.to can stop resolving or redirect incorrectly.</li>
            <li><strong className="text-white">Wrong product:</strong> Amazon reassigned the product ID to a completely different item.</li>
          </ul>
          <p className="text-yt-light">All of these reduce or eliminate commissions, even though the link appears to work.</p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">WHY YOUTUBE MAKES THIS PROBLEM WORSE</h2>
          <p className="text-yt-light">
            YouTube content is evergreen. A video uploaded three years ago can still generate thousands of views per month. But affiliate links are not evergreen.
          </p>
          <p className="text-yt-light">Over time:</p>
          <ul className="text-yt-light space-y-2 list-disc list-inside mb-6">
            <li>Products get discontinued</li>
            <li>Sellers disappear from Amazon</li>
            <li>Inventory runs out permanently</li>
            <li>URLs get deprecated or reassigned</li>
          </ul>
          <p className="text-yt-light">
            This mismatch between evergreen content and decaying links is the root cause of lost affiliate revenue on YouTube.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">AMAZON-SPECIFIC ISSUES THAT BREAK LINKS</h2>
          <p className="text-yt-light">
            Amazon affiliate links have unique failure modes that creators should understand.
          </p>

          <h3 className="font-display text-xl text-white mt-8 mb-3">The Buy Box Problem</h3>
          <p className="text-yt-light">
            When Amazon removes the Buy Box (the &quot;Add to Cart&quot; button), your link still loads. But users are pushed to &quot;See all buying options,&quot; where many sellers don&apos;t carry your affiliate tag. Result: clicks generate little or no commission.
          </p>

          <h3 className="font-display text-xl text-white mt-8 mb-3">Discontinued and Suppressed Listings</h3>
          <p className="text-yt-light">
            Amazon regularly removes or suppresses product listings, especially for white-label products, seasonal items, and low-inventory sellers. Your link may redirect to Amazon search results or show unrelated alternatives.
          </p>

          <h3 className="font-display text-xl text-white mt-8 mb-3">Regional Availability</h3>
          <p className="text-yt-light">
            A product might be in stock in the US but unavailable in Canada, the UK, or EU countries. If you have international viewers, regional availability issues can significantly reduce conversions.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">HOW TO FIX BROKEN AFFILIATE LINKS</h2>

          <h3 className="font-display text-xl text-white mt-8 mb-3">Step 1: Identify Which Links Matter Most</h3>
          <p className="text-yt-light">Don&apos;t start with random videos. Focus your effort on:</p>
          <ul className="text-yt-light space-y-2 list-disc list-inside mb-6">
            <li>Videos with the highest lifetime views</li>
            <li>Videos with multiple affiliate links</li>
            <li>Links that appear across many videos (single point of failure)</li>
          </ul>

          <h3 className="font-display text-xl text-white mt-8 mb-3">Step 2: Replace, Don&apos;t Remove</h3>
          <p className="text-yt-light">
            A broken link should almost always be replaced, not deleted. Good replacement options include:
          </p>
          <ul className="text-yt-light space-y-2 list-disc list-inside mb-6">
            <li>The same product (if it becomes available again)</li>
            <li>A newer model of the same product</li>
            <li>A close alternative from the same brand</li>
          </ul>
          <p className="text-yt-light">Removing links entirely usually reduces revenue further.</p>

          <h3 className="font-display text-xl text-white mt-8 mb-3">Step 3: Prevent Future Link Decay</h3>
          <p className="text-yt-light">
            One-time fixes help, but they don&apos;t prevent future decay. The only reliable long-term solution is recurring scans that catch problems early, before they cost significant revenue.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">HOW CREATORS AUTOMATE LINK MONITORING</h2>
          <p className="text-yt-light">
            Checking links across hundreds of videos is time-consuming. Modern creators use automated tools to scan YouTube descriptions, detect broken or out-of-stock affiliate links, and prioritize fixes by estimated revenue impact.
          </p>
          <p className="text-yt-light">
            LinkMedic, for example, scans your entire channel weekly and flags links that are no longer converting correctly. Instead of wondering if links are broken, you know which ones to fix first.
          </p>
          <p className="text-yt-light">
            That&apos;s the difference between reactive cleanup and proactive revenue protection.
          </p>

          <h2 className="font-display text-2xl text-white mt-12 mb-4">KEY TAKEAWAYS</h2>
          <ul className="text-yt-light space-y-2 list-disc list-inside mb-6">
            <li>Broken links don&apos;t always show 404 errors. Many fail silently while the page still loads.</li>
            <li>YouTube&apos;s evergreen content creates a mismatch with decaying affiliate links.</li>
            <li>Amazon links fail in unique ways: Buy Box removal, discontinued products, and regional issues.</li>
            <li>Replace broken links instead of removing them.</li>
            <li>Regular automated scanning prevents future revenue loss.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-yt-gray/70 backdrop-blur-sm border border-profit-green/30 rounded-xl text-center">
          <h3 className="font-display text-2xl text-white mb-4">FIND YOUR BROKEN LINKS</h3>
          <p className="text-yt-light mb-6">
            Run a free scan to see which affiliate links are costing you money.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-profit-green text-black font-bold rounded-lg hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            Run Free Audit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-yt-dark">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-emergency-red text-lg">+</span>
            <span className="font-display text-xl tracking-wide text-white">LINKMEDIC</span>
          </div>
          <p className="text-yt-light/50 text-sm mb-4">
            Detect broken links. Suggest fixes. Scan weekly.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-yt-light">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
