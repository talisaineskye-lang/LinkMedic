import { Metadata } from "next";
import { AuditTool } from "@/components/audit-tool";
import { XCircle, AlertTriangle, CornerDownRight, BarChart3, Video, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { JsonLd, freeAuditToolSchema } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Free YouTube Affiliate Link Audit Tool – Find Broken Links & Lost Revenue",
  description: "Instantly audit your YouTube channel for broken affiliate links. See exactly how much revenue you're losing from outdated or unavailable products. Free, no signup required.",
  keywords: ["youtube affiliate audit", "broken links", "affiliate revenue", "link checker", "youtube affiliate link checker", "broken affiliate links youtube"],
  openGraph: {
    title: "Free YouTube Affiliate Link Audit – Find Your Lost Revenue",
    description: "Discover how much affiliate revenue you're losing to broken links. Free audit tool for YouTube creators.",
    type: "website",
    url: "https://link-medic.app/audit",
    images: [{ url: "https://link-medic.app/opengraph-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free YouTube Affiliate Link Audit Tool",
    description: "See exactly how much revenue you're losing to broken affiliate links.",
    images: ["https://link-medic.app/opengraph-image.jpg"],
  },
};

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-[#020617]">
      {/* Structured Data */}
      <JsonLd data={freeAuditToolSchema} />

      {/* Header */}
      <header className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="text-white">Free Audit</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
          </nav>
          <Link
            href="/login"
            className="btn-primary px-4 py-2 text-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display text-4xl md:text-5xl tracking-wide text-white mb-6">
          SEE HOW MUCH YOU'RE{" "}
          <span className="text-red-500">LOSING</span>
        </h1>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
          Your YouTube channel's broken affiliate links are costing you money.
          Find out exactly how much—free, in seconds.
        </p>

        {/* Audit Tool */}
        <AuditTool />
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <p className="text-cyan-400 font-mono text-sm mb-4 tracking-wider text-center">THE PROCESS</p>
        <h2 className="font-display text-3xl tracking-wide text-white text-center mb-12">
          HOW IT WORKS
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-black flex items-center justify-center mx-auto mb-3 font-display text-2xl shadow-lg shadow-cyan-500/30">
                {step}
              </div>
              <h3 className="font-display text-sm tracking-wide text-white mb-1">{title.toUpperCase()}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Check */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <p className="text-cyan-400 font-mono text-sm mb-4 tracking-wider text-center">DIAGNOSTICS</p>
        <h2 className="font-display text-3xl tracking-wide text-white text-center mb-12">
          WHAT WE CHECK FOR
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4 p-4 glass-card">
            <div className="flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-display text-sm tracking-wide text-white mb-1">404 / BROKEN LINKS</h3>
              <p className="text-sm text-slate-400">Products that no longer exist on Amazon</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 glass-card">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-display text-sm tracking-wide text-white mb-1">OUT OF STOCK</h3>
              <p className="text-sm text-slate-400">Products discontinued or temporarily unavailable</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 glass-card">
            <div className="flex-shrink-0">
              <CornerDownRight className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-display text-sm tracking-wide text-white mb-1">INCORRECT REDIRECTS</h3>
              <p className="text-sm text-slate-400">Links that don&apos;t go to the right product</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 glass-card">
            <div className="flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-display text-sm tracking-wide text-white mb-1">REVENUE IMPACT</h3>
              <p className="text-sm text-slate-400">Estimated monthly loss per broken link</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 glass-card">
            <div className="flex-shrink-0">
              <Video className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-display text-sm tracking-wide text-white mb-1">HIGH-TRAFFIC VIDEOS</h3>
              <p className="text-sm text-slate-400">Which videos are bleeding the most revenue</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 glass-card">
            <div className="flex-shrink-0">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-display text-sm tracking-wide text-white mb-1">PRIORITY RANKING</h3>
              <p className="text-sm text-slate-400">Links sorted by impact for quick fixes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="font-display text-3xl tracking-wide text-white text-center mb-8">
          WHY THIS MATTERS
        </h2>
        <div className="glass-card p-8 text-center">
          <p className="text-lg text-slate-400 mb-6">
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
          <p className="mt-6 text-slate-400">
            Meanwhile, you have no idea it's happening.
          </p>
          <p className="mt-2 text-cyan-400 font-semibold">
            This audit finds those hidden revenue leaks.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-white/10">
        <div className="glass-card p-8 text-center border-cyan-500/30">
          <h2 className="font-display text-2xl tracking-wide text-white mb-4">
            READY TO PROTECT YOUR REVENUE?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Upgrade to scan your full channel, get AI-powered fix suggestions,
            and keep your links healthy with weekly scans.
          </p>
          <Link
            href="/login"
            className="btn-primary inline-block px-8 py-4 text-lg"
          >
            Start Free Trial
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            7-day free trial · Cancel anytime
          </p>
        </div>
      </section>

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
    </main>
  );
}
