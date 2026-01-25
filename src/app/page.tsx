import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/hero";
import { RevenueSlider } from "@/components/landing/revenue-slider";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="bg-zinc-950 border-b border-zinc-900 py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-zinc-100 font-semibold text-lg">
            LinkMedic
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#problem" className="hover:text-zinc-100 transition">The Problem</a>
            <a href="#pricing" className="hover:text-zinc-100 transition">Pricing</a>
            <Link href="/resources" className="hover:text-zinc-100 transition">Resources</Link>
          </div>

          <Link
            href="/audit"
            className="rounded-lg bg-zinc-100 text-zinc-900 px-4 py-2 text-sm font-medium hover:bg-zinc-200 transition"
          >
            Scan My Channel
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* Quick Scan Input */}
      <section className="bg-zinc-950 py-12 border-t border-zinc-900">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Paste your YouTube channel URL"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
            />
            <Link
              href="/audit"
              className="rounded-xl bg-zinc-100 text-zinc-900 px-8 py-4 font-medium hover:bg-zinc-200 transition whitespace-nowrap"
            >
              Scan now &rarr;
            </Link>
          </div>
          <p className="text-zinc-600 text-sm mt-4">
            We scan public video descriptions — no API access needed.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className="bg-zinc-950 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100 text-center mb-4">
            Your links decay over time.
          </h2>
          <p className="text-zinc-500 text-center mb-16">
            It&apos;s not neglect. It&apos;s just how the internet works.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">&#128230;</div>
              <h3 className="text-zinc-100 font-medium mb-2">Products disappear</h3>
              <p className="text-zinc-500 text-sm">
                Amazon pages go dead. Items get discontinued.
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-4">&#128279;</div>
              <h3 className="text-zinc-100 font-medium mb-2">URLs change silently</h3>
              <p className="text-zinc-500 text-sm">
                Redirects break. Affiliate tags expire.
              </p>
            </div>

            <div className="text-center">
              <div className="text-3xl mb-4">&#128203;</div>
              <h3 className="text-zinc-100 font-medium mb-2">Rules keep shifting</h3>
              <p className="text-zinc-500 text-sm">
                Disclosure requirements update. Policies change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="bg-zinc-900 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100 text-center mb-4">
            A simple list of what&apos;s broken — and what matters.
          </h2>
          <p className="text-zinc-500 text-center mb-16">
            We don&apos;t flood you with dashboards. Just the stuff you need to fix.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <h3 className="text-zinc-100 font-medium mb-2">Weekly quiet scans</h3>
              <p className="text-zinc-500 text-sm">
                We check your links every week so you don&apos;t have to.
              </p>
            </div>

            <div className="bg-zinc-800/50 rounded-xl p-6">
              <h3 className="text-zinc-100 font-medium mb-2">Simple fix list</h3>
              <p className="text-zinc-500 text-sm">
                Export your broken links to TubeBuddy and fix them in minutes.
              </p>
            </div>

            <div className="bg-zinc-800/50 rounded-xl p-6">
              <h3 className="text-zinc-100 font-medium mb-2">Stop wasting clicks</h3>
              <p className="text-zinc-500 text-sm">
                Every broken link is a viewer you sent to a dead end.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Slider */}
      <RevenueSlider />

      {/* Pricing */}
      <section id="pricing" className="bg-zinc-950 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100 text-center mb-4">
            Simple pricing
          </h2>
          <p className="text-zinc-500 text-center mb-16">
            Start free. Upgrade when you&apos;re ready.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free tier */}
            <div className="bg-zinc-900/60 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Free</h3>
              <p className="text-zinc-500 text-sm mb-6">See what&apos;s broken</p>
              <p className="text-3xl font-semibold text-zinc-100 mb-6">$0</p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                <li>• Scan last 15 videos</li>
                <li>• Basic link status</li>
                <li>• One-time report</li>
              </ul>
              <Link href="/audit" className="block text-center rounded-xl border border-zinc-700 text-zinc-300 px-6 py-3 hover:border-zinc-500 transition">
                Start Free
              </Link>
            </div>

            {/* Specialist tier */}
            <div className="bg-zinc-900/60 rounded-2xl p-8 border border-zinc-700">
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Specialist</h3>
              <p className="text-zinc-500 text-sm mb-6">Full protection</p>
              <p className="text-3xl font-semibold text-zinc-100 mb-6">$19<span className="text-lg text-zinc-500">/mo</span></p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                <li>• Full channel scan</li>
                <li>• AI fix suggestions</li>
                <li>• Weekly monitoring</li>
                <li>• TubeBuddy export</li>
              </ul>
              <Link href="/login" className="block text-center rounded-xl bg-zinc-100 text-zinc-900 px-6 py-3 hover:bg-zinc-200 transition">
                Start Free Trial
              </Link>
            </div>

            {/* Agency tier */}
            <div className="bg-zinc-900/60 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Agency</h3>
              <p className="text-zinc-500 text-sm mb-6">Multiple channels</p>
              <p className="text-3xl font-semibold text-zinc-100 mb-6">$49<span className="text-lg text-zinc-500">/mo</span></p>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                <li>• Up to 10 channels</li>
                <li>• Team access</li>
                <li>• Aggregate reports</li>
              </ul>
              <span className="block text-center rounded-xl border border-zinc-800 text-zinc-600 px-6 py-3 cursor-not-allowed">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-900 py-24">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-zinc-100 text-center mb-12">
            Common questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "How do you access my channel?",
                a: "We use the official YouTube API to read your public video descriptions. We never see your password and can't change anything without your action."
              },
              {
                q: "Will this affect my YouTube SEO?",
                a: "Not at all. Fixing broken links actually helps — YouTube prefers videos that lead to good experiences."
              },
              {
                q: "I have thousands of videos. Can it handle that?",
                a: "Yes. We scan your entire archive in under 2 minutes, prioritizing your most-viewed videos first."
              },
              {
                q: "Does this work for non-Amazon links?",
                a: "We flag 404s and broken redirects for any link. Amazon gets extra checks for stock status."
              },
            ].map((item, i) => (
              <details key={i} className="group">
                <summary className="flex justify-between items-center cursor-pointer text-zinc-100 font-medium py-4 border-b border-zinc-800">
                  {item.q}
                  <span className="text-zinc-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-zinc-500 text-sm py-4">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-zinc-950 py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-4">
            Stop sending clicks to dead ends.
          </h2>
          <p className="text-zinc-500 mb-8">
            A free scan takes less than 2 minutes.
          </p>

          <Link
            href="/audit"
            className="inline-block rounded-xl bg-zinc-100 text-zinc-900 px-8 py-4 font-medium hover:bg-zinc-200 transition"
          >
            Scan My Channel
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-zinc-500 text-sm">
            &copy; 2026 LinkMedic
          </div>

          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300 transition">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition">Terms</Link>
            <Link href="/resources" className="hover:text-zinc-300 transition">Resources</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
