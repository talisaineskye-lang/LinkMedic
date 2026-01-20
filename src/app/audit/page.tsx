import { Metadata } from "next";
import { AuditTool } from "@/components/audit-tool";
import { Link as LinkIcon, XCircle, AlertTriangle, CornerDownRight, BarChart3, Video, Zap } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free YouTube Affiliate Link Audit Tool – Find Broken Links & Lost Revenue",
  description: "Instantly audit your YouTube channel for broken affiliate links. See exactly how much revenue you're losing from outdated or unavailable products. Free, no signup required.",
  keywords: "YouTube affiliate audit, broken links, affiliate revenue, link checker, YouTube affiliate link checker, broken affiliate links YouTube",
  openGraph: {
    title: "Free YouTube Affiliate Link Audit – Find Your Lost Revenue",
    description: "Discover how much affiliate revenue you're losing to broken links. Free audit tool for YouTube creators.",
    type: "website",
    url: "https://link-medic.vercel.app/audit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free YouTube Affiliate Link Audit Tool",
    description: "See exactly how much revenue you're losing to broken affiliate links.",
  },
};

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-white">Link</span>
            <LinkIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-emerald-400 transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          See How Much You're Losing in{" "}
          <span className="text-emerald-400">Affiliate Revenue</span>
        </h1>
        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
          Your YouTube channel's broken affiliate links are costing you money.
          Find out exactly how much—free, in seconds.
        </p>

        {/* Audit Tool */}
        <AuditTool />
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-slate-800/50">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { step: "1", title: "Enter Your Channel", desc: "Paste your YouTube URL or channel ID" },
            { step: "2", title: "We Scan Videos", desc: "Analyze your last 15 video descriptions" },
            { step: "3", title: "Find Broken Links", desc: "Detect 404s, out-of-stock, and redirects" },
            { step: "4", title: "Calculate Impact", desc: "Show estimated monthly revenue loss" },
            { step: "5", title: "Get Fixes", desc: "See exactly which links need attention" },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto mb-3 font-bold">
                {step}
              </div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Check */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-slate-800/50">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          What We Check For
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">404 / Broken Links</h3>
              <p className="text-sm text-slate-400">Products that no longer exist on Amazon</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Out of Stock</h3>
              <p className="text-sm text-slate-400">Products discontinued or temporarily unavailable</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex-shrink-0">
              <CornerDownRight className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Incorrect Redirects</h3>
              <p className="text-sm text-slate-400">Links that don&apos;t go to the right product</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Revenue Impact</h3>
              <p className="text-sm text-slate-400">Estimated monthly loss per broken link</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex-shrink-0">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">High-Traffic Videos</h3>
              <p className="text-sm text-slate-400">Which videos are bleeding the most revenue</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex-shrink-0">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Priority Ranking</h3>
              <p className="text-sm text-slate-400">Links sorted by impact for quick fixes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-slate-800/50">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Why This Matters
        </h2>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
          <p className="text-lg text-slate-300 mb-6">
            Broken links don't generate errors.<br />
            <span className="text-white font-semibold">They silently kill conversions.</span>
          </p>
          <div className="text-slate-400 space-y-2 max-w-lg mx-auto">
            <p>A viewer clicks your affiliate link →</p>
            <p>Page loads with "product not found" →</p>
            <p>No way to buy →</p>
            <p>Sale lost →</p>
            <p className="text-red-400 font-semibold">Zero commission.</p>
          </div>
          <p className="mt-6 text-slate-300">
            Meanwhile, you have no idea it's happening.
          </p>
          <p className="mt-2 text-emerald-400 font-semibold">
            This audit finds those hidden revenue leaks.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-0.5 text-xl font-semibold mb-4">
            <span className="text-white">Link</span>
            <LinkIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Affiliate link health monitoring for YouTube creators.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-emerald-400 transition">Home</Link>
            <Link href="/login" className="hover:text-emerald-400 transition">Sign In</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition">Privacy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
