import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/hero";
import { LiveTicker } from "@/components/landing/live-ticker";
import { DiagnosticReport } from "@/components/landing/diagnostic-report";
import { BeforeAfter } from "@/components/landing/before-after";
import { LeakCalculator } from "@/components/landing/revenue-slider";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#0F0F0F]">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 w-full bg-[#0F0F0F]/90 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#FF0000] text-xl">+</span>
            <span className="font-display text-2xl text-white tracking-wide">LINKMEDIC</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#AAAAAA]">
            <a href="#problem" className="hover:text-white transition">The Problem</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>

          <Link
            href="/audit"
            className="rounded bg-[#00FF00] text-black px-4 py-2 text-sm font-bold hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            SCAN MY CHANNEL
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* Live Ticker */}
      <LiveTicker />

      {/* Diagnostic Report (The Problem) */}
      <DiagnosticReport />

      {/* Before/After */}
      <BeforeAfter />

      {/* Leak Calculator */}
      <LeakCalculator />

      {/* How It Works */}
      <section className="bg-[#0A0A0A] py-24 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-6">

          <div className="text-center mb-16">
            <p className="text-[#00FF00] font-mono text-sm mb-4 tracking-wider">THE PROCESS</p>
            <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">
              PLUG THE LEAKS IN <span className="text-[#00FF00]">3 STEPS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#00FF00] text-black flex items-center justify-center font-display text-3xl mx-auto mb-4 shadow-[0_0_30px_rgba(0,255,0,0.3)]">
                1
              </div>
              <h3 className="font-display text-xl text-white mb-2">CONNECT</h3>
              <p className="text-[#AAAAAA] text-sm">
                One click via YouTube. We never see your password.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#00FF00] text-black flex items-center justify-center font-display text-3xl mx-auto mb-4 shadow-[0_0_30px_rgba(0,255,0,0.3)]">
                2
              </div>
              <h3 className="font-display text-xl text-white mb-2">SCAN</h3>
              <p className="text-[#AAAAAA] text-sm">
                We check every video for dead links, expired tags, and out-of-stock products.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#00FF00] text-black flex items-center justify-center font-display text-3xl mx-auto mb-4 shadow-[0_0_30px_rgba(0,255,0,0.3)]">
                3
              </div>
              <h3 className="font-display text-xl text-white mb-2">FIX</h3>
              <p className="text-[#AAAAAA] text-sm">
                Get a prioritized list. Bulk export. Plug the leaks in minutes.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-[#0F0F0F] py-16 relative overflow-hidden">
        {/* Faded play button background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="text-[20rem]">▶</div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <p className="font-display text-2xl md:text-3xl text-white mb-4">
            TRUSTED BY CREATORS WITH OVER
          </p>
          <p className="font-display text-5xl md:text-7xl text-[#00FF00] drop-shadow-[0_0_30px_rgba(0,255,0,0.3)]">
            500M+ VIEWS
          </p>
          <p className="text-[#AAAAAA] mt-4">
            From tech reviewers to lifestyle vloggers. If you have affiliate links, you have leaks.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#0A0A0A] py-24">
        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-16">
            <p className="text-[#00FF00] font-mono text-sm mb-4 tracking-wider">PRICING</p>
            <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">
              RECOVER YOUR <span className="text-[#00FF00]">LOST REVENUE</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Free */}
            <div className="bg-[#272727]/70 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <h3 className="font-display text-2xl text-white mb-1">FREE SCAN</h3>
              <p className="text-[#AAAAAA] text-sm mb-6">See your leaks</p>
              <p className="font-display text-5xl text-white mb-8">$0</p>
              <ul className="space-y-3 text-sm text-[#AAAAAA] mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> Scan last 15 videos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> Basic link status
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> One-time report
                </li>
              </ul>
              <Link href="/audit" className="block text-center rounded-lg border border-white/20 text-white px-6 py-3 font-bold hover:bg-white/5 transition">
                START FREE
              </Link>
            </div>

            {/* Specialist */}
            <div className="bg-[#272727]/70 backdrop-blur-sm rounded-xl p-8 border-2 border-[#00FF00] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00FF00] text-black text-xs font-bold px-3 py-1 rounded">
                BEST VALUE
              </div>
              <h3 className="font-display text-2xl text-white mb-1">SPECIALIST</h3>
              <p className="text-[#AAAAAA] text-sm mb-6">Full leak protection</p>
              <p className="font-display text-5xl text-white mb-8">$19<span className="text-[#AAAAAA] text-xl">/mo</span></p>
              <ul className="space-y-3 text-sm text-[#AAAAAA] mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> Full channel scan
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> AI fix suggestions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> Weekly monitoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> Bulk export
                </li>
              </ul>
              <Link href="/login" className="block text-center rounded-lg bg-[#00FF00] text-black px-6 py-3 font-bold hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                START FREE TRIAL
              </Link>
            </div>

            {/* Agency */}
            <div className="bg-[#272727]/70 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <h3 className="font-display text-2xl text-white mb-1">AGENCY</h3>
              <p className="text-[#AAAAAA] text-sm mb-6">Multiple channels</p>
              <p className="font-display text-5xl text-white mb-8">$49<span className="text-[#AAAAAA] text-xl">/mo</span></p>
              <ul className="space-y-3 text-sm text-[#AAAAAA] mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> Up to 10 channels
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> Team access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#00FF00]">✓</span> Aggregate reports
                </li>
              </ul>
              <span className="block text-center rounded-lg border border-white/10 text-[#AAAAAA]/50 px-6 py-3 font-bold cursor-not-allowed">
                COMING SOON
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0F0F0F] py-24">
        <div className="max-w-2xl mx-auto px-6">

          <h2 className="font-display text-3xl md:text-4xl text-white text-center mb-12 tracking-wide">
            QUESTIONS?
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "How do you access my channel?",
                a: "Official YouTube API. We read your public descriptions. We never see your password and can't change anything without your action."
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
                q: "How often do you scan?",
                a: "Free users get a one-time scan. Paid users get automatic weekly scans with alerts when something breaks."
              },
            ].map((item, i) => (
              <details key={i} className="group bg-[#272727]/70 backdrop-blur-sm rounded-xl border border-white/10">
                <summary className="flex justify-between items-center cursor-pointer text-white font-display text-sm tracking-wide p-6">
                  {item.q.toUpperCase()}
                  <span className="text-[#00FF00] group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-[#AAAAAA] text-sm px-6 pb-6 -mt-2">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0F0F0F] py-24 relative overflow-hidden">
        {/* Animated background pulse */}
        <div className="absolute inset-0 bg-gradient-radial from-[#FF0000]/10 via-transparent to-transparent animate-pulse" />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-6xl text-white tracking-wide mb-4">
            EVERY DAY YOU WAIT,<br />
            <span className="text-[#FF0000]">MORE REVENUE LEAKS.</span>
          </h2>
          <p className="text-[#AAAAAA] text-lg mb-8">
            A free scan takes less than 2 minutes. See exactly what you&apos;re losing.
          </p>

          <Link
            href="/audit"
            className="inline-block rounded-lg bg-[#00FF00] text-black px-12 py-6 font-bold text-xl hover:brightness-110 transition shadow-[0_0_50px_rgba(0,255,0,0.4)] animate-pulse"
          >
            SCAN MY CHANNEL — FREE
          </Link>

          <p className="text-[#AAAAAA]/50 text-sm mt-6">
            Join 500+ creators who plugged their leaks
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[#FF0000] text-lg">+</span>
            <span className="font-display text-xl text-white tracking-wide">LINKMEDIC</span>
          </div>

          <div className="flex gap-6 text-sm text-[#AAAAAA]">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>

          <div className="text-[#AAAAAA]/50 text-sm">
            © 2026 LinkMedic
          </div>
        </div>
      </footer>
    </main>
  );
}
