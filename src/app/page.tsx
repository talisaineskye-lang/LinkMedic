import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/hero";
import { VideoDemo } from "@/components/landing/video-demo";
import { DiagnosticReport } from "@/components/landing/diagnostic-report";
import { BeforeAfter } from "@/components/landing/before-after";
import { LeakCalculator } from "@/components/landing/revenue-slider";
import { FoundingMemberBanner } from "@/components/landing/founding-member-banner";
import { Check, Link2, Search, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "LinkMedic – Find & Fix Broken YouTube Affiliate Links",
  description: "Scan your YouTube channel for broken affiliate links. Detect 404s, out-of-stock products, and dead redirects across Amazon, Impact, CJ, Rakuten, ShareASale, and Awin.",
  keywords: ["youtube affiliate links", "broken link checker", "affiliate revenue", "amazon affiliate", "youtube creator tools"],
  openGraph: {
    title: "LinkMedic – Find & Fix Broken YouTube Affiliate Links",
    description: "Scan your YouTube channel for broken affiliate links. Detect 404s, out-of-stock products, and dead redirects.",
    type: "website",
    url: "https://linkmedic.io",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkMedic – Find & Fix Broken YouTube Affiliate Links",
    description: "Scan your YouTube channel for broken affiliate links. Detect 404s, out-of-stock products, and dead redirects.",
  },
};

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#020617]">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 w-full bg-[#020617]/90 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={140} height={32} className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#problem" className="hover:text-white transition">The Problem</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Sign In
            </Link>
            <span className="px-3 py-1 text-xs font-bold tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-full">
              BETA
            </span>
          </div>
        </div>
      </nav>

      {/* Founding Member Banner */}
      <div className="fixed top-[65px] w-full z-40">
        <FoundingMemberBanner />
      </div>

      {/* Hero */}
      <Hero />

      {/* Video Demo */}
      <VideoDemo />

      {/* Diagnostic Report (The Problem) */}
      <DiagnosticReport />

      {/* Before/After */}
      <BeforeAfter />

      {/* Leak Calculator */}
      <LeakCalculator />

      {/* How It Works */}
      <section className="bg-[#0f172a] py-24 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute w-[500px] h-[500px] bg-cyan-500 opacity-[0.06] rounded-full blur-[100px] pointer-events-none"
          style={{ top: '50%', right: '-10%', transform: 'translateY(-50%)' }}
        />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">
              The Process
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mt-3">
              PLUG THE LEAKS IN <span className="text-cyan-400">3 STEPS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: Link2,
                title: 'CONNECT',
                description: 'One click via YouTube. We scan your video descriptions for broken links.',
              },
              {
                step: 2,
                icon: Search,
                title: 'DETECT',
                description: 'We find 404s, expired tags, and out-of-stock products across your entire channel.',
              },
              {
                step: 3,
                icon: Wrench,
                title: 'FIX',
                description: 'Get AI-powered suggestions. Fix in the dashboard or export for bulk editing.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-black flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display text-xl text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#020617] py-24 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute w-[600px] h-[600px] bg-cyan-500 opacity-[0.06] rounded-full blur-[120px] pointer-events-none"
          style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }}
        />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">
              Pricing
            </span>
            <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mt-3">
              RECOVER YOUR <span className="text-cyan-400">LOST REVENUE</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="glass-card p-8">
              <h3 className="font-display text-2xl text-white mb-1">FREE SCAN</h3>
              <p className="text-slate-400 text-sm mb-6">See what&apos;s broken</p>
              <p className="font-display text-5xl text-white mb-8">$0</p>
              <ul className="space-y-3 text-sm text-slate-400 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Scan last 15 videos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Basic link status
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> One-time report
                </li>
              </ul>
              <Link href="/audit" className="btn-ghost block text-center w-full">
                START FREE
              </Link>
            </div>

            {/* Specialist */}
            <div
              className="glass-card p-8 relative"
              style={{ boxShadow: '0 20px 60px rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)' }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black text-xs font-bold px-3 py-1 rounded">
                BEST VALUE
              </div>
              <h3 className="font-display text-2xl text-white mb-1">SPECIALIST</h3>
              <p className="text-slate-400 text-sm mb-6">Full protection for one channel</p>
              <p className="font-display text-5xl text-white mb-8">$19<span className="text-slate-400 text-xl">/mo</span></p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Full channel scan
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> AI fix suggestions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Weekly monitoring
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Export fix list
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Fix in dashboard
                </li>
              </ul>
              <Link href="/login" className="btn-primary block text-center w-full">
                START FREE TRIAL
              </Link>
            </div>

            {/* Operator */}
            <div className="glass-card p-8">
              <h3 className="font-display text-2xl text-white mb-1">OPERATOR</h3>
              <p className="text-slate-400 text-sm mb-6">For creators with multiple channels</p>
              <p className="font-display text-5xl text-white mb-8">$39<span className="text-slate-400 text-xl">/mo</span></p>
              <ul className="space-y-3 text-sm text-slate-400 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Up to 3 channels
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Everything in Specialist
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Unified dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cyan-400" /> Priority support
                </li>
              </ul>
              <Link href="/login" className="btn-primary block text-center w-full">
                START FREE TRIAL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0f172a] py-24">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">
              FAQ
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-white tracking-tight mt-3">
              QUESTIONS?
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How do I fix the broken links?",
                a: "You have options. Fix links one-by-one directly in your LinkMedic dashboard — click a link, see the AI suggestion, copy the fix. For larger channels, export your fix list and update descriptions in bulk using YouTube Studio or your preferred tool."
              },
              {
                q: "How often do you scan?",
                a: "Free users get a one-time scan. Paid users get automatic weekly scans — we catch new issues before they start costing you money."
              },
              {
                q: "How do you access my channel?",
                a: "We use the official YouTube API to read your public video descriptions. We never see your password and can't change anything without your action."
              },
              {
                q: "Will this affect my YouTube SEO?",
                a: "No — fixing broken links actually helps. YouTube prefers videos that lead to good experiences, not dead ends."
              },
              {
                q: "Can it handle thousands of videos?",
                a: "Yes. We scan your entire back catalog in under 2 minutes, prioritizing your most-viewed videos first."
              },
              {
                q: "Does this work for non-Amazon links?",
                a: "We flag 404s and broken redirects for any affiliate link. Amazon links get extra checks for stock status and tag validation."
              },
            ].map((item, i) => (
              <details key={i} className="group glass-card">
                <summary className="flex justify-between items-center cursor-pointer text-white font-display text-base tracking-wide p-6">
                  {item.q.toUpperCase()}
                  <span className="text-cyan-400 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-slate-300 text-base px-6 pb-6 -mt-2 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#020617] py-24 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute w-[600px] h-[600px] bg-cyan-500 opacity-[0.08] rounded-full blur-[120px] pointer-events-none"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mb-4">
            EVERY DAY YOU WAIT,<br />
            <span className="text-red-500">MORE REVENUE LEAKS.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            A free scan takes less than 2 minutes. See exactly what you&apos;re losing.
          </p>

          <Link
            href="/audit"
            className="btn-primary text-xl px-12 py-6"
          >
            Scan My Channel — Free
          </Link>
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
            <Link href="/intel" className="hover:text-white transition">Intel Blog</Link>
          </div>

          <div className="text-slate-500 text-sm">
            © 2026 LinkMedic
          </div>
        </div>
      </footer>
    </main>
  );
}
