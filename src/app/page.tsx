import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link as LinkIcon, Search, AlertTriangle, TrendingUp, Check, ArrowRight, LinkIcon as Link2, Play } from "lucide-react";
import { RevenueCalculator } from "@/components/revenue-calculator";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-white">Link</span>
            <LinkIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link href="/audit" className="hover:text-white transition-colors">Free Audit</Link>
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
          </nav>
          <Link
            href="/login"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-sm font-medium">Protect Your YouTube Revenue</span>
          </div>

          {/* Logo Large */}
          <div className="flex items-center justify-center gap-1 text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Link</span>
            <LinkIcon className="w-12 h-12 md:w-14 md:h-14 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            Stop Losing Affiliate Revenue From{" "}
            <span className="text-amber-500">Broken Links</span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your old YouTube videos are still getting views — but are their affiliate links still working?
            LinkMedic automatically scans your entire channel and finds the broken links costing you money.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            >
              <Play className="w-5 h-5" />
              Scan My Channel Free
            </Link>
            <a
              href="#how-it-works"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              See How It Works
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm text-slate-500">
            7-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-slate-800/50 bg-slate-900/50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">15%</div>
              <div className="text-sm text-slate-500">Average broken link rate</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-amber-500 mb-1">$847</div>
              <div className="text-sm text-slate-500">Avg. monthly revenue lost</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-500 mb-1">2 min</div>
              <div className="text-sm text-slate-500">To scan your channel</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              The Hidden Problem Costing You Money
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every day, your old videos generate views. But the affiliate links in those descriptions?
              Many are silently failing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Products Discontinued</h3>
              <p className="text-sm text-slate-400">
                Amazon removes products, pages go 404. Your link sends viewers to a dead end.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                <Link2 className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Affiliate Tags Expire</h3>
              <p className="text-sm text-slate-400">
                Short links get recycled. Your old affiliate tag might be earning someone else money.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Out of Stock</h3>
              <p className="text-sm text-slate-400">
                Product exists but shows &ldquo;currently unavailable.&rdquo; Viewers click, see nothing to buy, leave.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              How Much Are Broken Links Costing You?
            </h2>
            <p className="text-slate-400">
              Drag the slider to see the potential revenue you&apos;re losing each month.
            </p>
          </div>

          <RevenueCalculator />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              How LinkMedic Works
            </h2>
            <p className="text-slate-400">
              Connect once, get protected forever. Here&apos;s the simple process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-emerald-500 font-semibold mb-2">Step 1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect YouTube</h3>
              <p className="text-sm text-slate-400">
                One-click Google sign-in. We only need read access to your video descriptions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-emerald-500 font-semibold mb-2">Step 2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Automatic Scan</h3>
              <p className="text-sm text-slate-400">
                We check every affiliate link across all your videos. Takes about 2 minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-emerald-500 font-semibold mb-2">Step 3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Alerts</h3>
              <p className="text-sm text-slate-400">
                See exactly which links are broken, and which videos to fix first by revenue impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400">
              One plan. Everything included. Cancel anytime.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            {/* Logo in pricing */}
            <div className="flex items-center justify-center gap-0.5 text-2xl font-semibold mb-4">
              <span className="text-white">Link</span>
              <LinkIcon className="w-6 h-6 text-emerald-500" />
              <span className="text-emerald-500">Medic</span>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-white">$19</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-slate-500 text-sm mt-1">or $190/year (save $38)</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Monitor up to 500 videos",
                "Track 2,000+ affiliate links",
                "Weekly automated scans",
                "Revenue impact prioritization",
                "Email alerts for broken links",
                "1 connected YouTube channel",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02]"
            >
              Start 7-Day Free Trial
            </Link>

            <p className="text-center text-sm text-slate-500 mt-4">
              No credit card required to start
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Your Old Videos Are Still Working For You.
            <br />
            <span className="text-emerald-500">Make Sure Their Links Are Too.</span>
          </h2>
          <p className="text-slate-400 mb-8">
            Join creators who&apos;ve recovered thousands in lost affiliate revenue.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
          >
            <Play className="w-5 h-5" />
            Scan My Channel Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-0.5 text-lg font-semibold">
              <span className="text-white">Link</span>
              <LinkIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">Medic</span>
            </div>
            <p className="text-sm text-slate-500">
              Affiliate link health monitoring for YouTube creators.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/audit" className="hover:text-white transition-colors">Free Audit</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
