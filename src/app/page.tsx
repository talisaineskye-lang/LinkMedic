import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/hero";
import { Marquee, MarqueeLight } from "@/components/landing/marquee";
import { RevenueSlider } from "@/components/landing/revenue-slider";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 w-full bg-zinc-950/90 backdrop-blur border-b border-zinc-900 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-display text-xl text-zinc-100 tracking-tight">
            LINKMEDIC
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#problem" className="hover:text-zinc-100 transition">Why</a>
            <a href="#pricing" className="hover:text-zinc-100 transition">Pricing</a>
          </div>

          <Link
            href="/audit"
            className="rounded-lg bg-orange-500 text-zinc-950 px-4 py-2 text-sm font-semibold hover:bg-orange-400 transition"
          >
            Scan My Channel
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* Orange Marquee */}
      <Marquee />

      {/* The Problem */}
      <section id="problem" className="bg-zinc-950 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-5xl text-zinc-100 text-center mb-4 tracking-tight">
            YOUR LINKS <span className="text-red-400">DECAY</span> OVER TIME.
          </h2>
          <p className="text-zinc-500 text-center mb-16 text-lg">
            It&apos;s not neglect. It&apos;s just how the internet works.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="font-display text-zinc-100 text-lg mb-2">PRODUCTS DISAPPEAR</h3>
              <p className="text-zinc-500 text-sm">
                Items get discontinued. Pages go dead. Your links lead nowhere.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="font-display text-zinc-100 text-lg mb-2">URLS CHANGE SILENTLY</h3>
              <p className="text-zinc-500 text-sm">
                Redirects break. Affiliate tags expire. You lose credit for sales.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="font-display text-zinc-100 text-lg mb-2">RULES KEEP SHIFTING</h3>
              <p className="text-zinc-500 text-sm">
                Disclosure requirements change. Stay compliant without the headache.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Slider */}
      <RevenueSlider />

      {/* How It Works */}
      <section className="bg-zinc-950 py-24 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-5xl text-zinc-100 text-center mb-16 tracking-tight">
            HOW IT <span className="text-green-400">WORKS</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-orange-500 text-zinc-950 flex items-center justify-center font-display text-2xl mx-auto mb-4">1</div>
              <h3 className="font-display text-zinc-100 text-lg mb-2">CONNECT</h3>
              <p className="text-zinc-500 text-sm">
                One click via YouTube. We never see your password.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-orange-500 text-zinc-950 flex items-center justify-center font-display text-2xl mx-auto mb-4">2</div>
              <h3 className="font-display text-zinc-100 text-lg mb-2">SCAN</h3>
              <p className="text-zinc-500 text-sm">
                We check every description for 404s, expired tags, and out-of-stock items.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-orange-500 text-zinc-950 flex items-center justify-center font-display text-2xl mx-auto mb-4">3</div>
              <h3 className="font-display text-zinc-100 text-lg mb-2">FIX</h3>
              <p className="text-zinc-500 text-sm">
                Get a prioritized list. Bulk export. Fix in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Light Marquee */}
      <MarqueeLight />

      {/* Pricing */}
      <section id="pricing" className="bg-zinc-950 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-5xl text-zinc-100 text-center mb-4 tracking-tight">
            SIMPLE <span className="text-orange-500">PRICING</span>
          </h2>
          <p className="text-zinc-500 text-center mb-16">
            Start free. Upgrade when you&apos;re ready.
          </p>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Free */}
            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
              <h3 className="font-display text-2xl text-zinc-100 mb-1">FREE</h3>
              <p className="text-zinc-500 text-sm mb-6">See what&apos;s broken</p>
              <p className="font-display text-4xl text-zinc-100 mb-8">$0</p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                <li>• Scan last 15 videos</li>
                <li>• Basic link status</li>
                <li>• One-time report</li>
              </ul>
              <Link href="/audit" className="block text-center rounded-xl border border-zinc-700 text-zinc-300 px-6 py-3 font-semibold hover:border-zinc-500 transition">
                SCAN FREE
              </Link>
            </div>

            {/* Specialist */}
            <div className="bg-zinc-900 rounded-2xl p-8 border-2 border-orange-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="font-display text-2xl text-zinc-100 mb-1">SPECIALIST</h3>
              <p className="text-zinc-500 text-sm mb-6">Full protection</p>
              <p className="font-display text-4xl text-zinc-100 mb-8">$19<span className="text-zinc-500 text-lg">/mo</span></p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                <li>• Full channel scan</li>
                <li>• AI fix suggestions</li>
                <li>• Weekly monitoring</li>
                <li>• Bulk export</li>
              </ul>
              <Link href="/login" className="block text-center rounded-xl bg-orange-500 text-zinc-950 px-6 py-3 font-bold hover:bg-orange-400 transition">
                START FREE TRIAL
              </Link>
            </div>

            {/* Agency */}
            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
              <h3 className="font-display text-2xl text-zinc-100 mb-1">AGENCY</h3>
              <p className="text-zinc-500 text-sm mb-6">Multiple channels</p>
              <p className="font-display text-4xl text-zinc-100 mb-8">$49<span className="text-zinc-500 text-lg">/mo</span></p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                <li>• Up to 10 channels</li>
                <li>• Team access</li>
                <li>• Aggregate reports</li>
              </ul>
              <span className="block text-center rounded-xl border border-zinc-800 text-zinc-600 px-6 py-3 font-semibold">
                COMING SOON
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-900 py-24">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl text-zinc-100 text-center mb-12 tracking-tight">
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
                a: "No. Fixing broken links actually helps — YouTube prefers videos that lead to good experiences."
              },
              {
                q: "Can it handle thousands of videos?",
                a: "Yes. We scan your entire archive in under 2 minutes, prioritizing your most-viewed videos first."
              },
              {
                q: "How often do you scan?",
                a: "Free users get a one-time scan. Paid users get automatic weekly scans with alerts when something breaks."
              },
            ].map((item, i) => (
              <details key={i} className="group bg-zinc-950 rounded-xl border border-zinc-800">
                <summary className="flex justify-between items-center cursor-pointer text-zinc-100 font-display text-sm tracking-wide p-6">
                  {item.q.toUpperCase()}
                  <span className="text-orange-500 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-zinc-400 text-sm px-6 pb-6 -mt-2">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-orange-500 py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-6xl text-zinc-950 mb-4 tracking-tight">
            STOP SENDING CLICKS<br />TO DEAD ENDS.
          </h2>
          <p className="text-zinc-800 mb-8 text-lg">
            A free scan takes less than 2 minutes.
          </p>

          <Link
            href="/audit"
            className="inline-block rounded-xl bg-zinc-950 text-zinc-100 px-8 py-4 font-bold hover:bg-zinc-800 transition"
          >
            SCAN MY CHANNEL FREE →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-display text-zinc-500 text-sm tracking-wide">
            © 2026 LINKMEDIC
          </div>

          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300 transition">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
