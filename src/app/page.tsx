import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link as LinkIcon, AlertTriangle, TrendingUp, Check, ArrowRight, LinkIcon as Link2, Play, Zap, Bell } from "lucide-react";
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
            href="/audit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start Free Audit
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
            Stop Losing Money to{" "}
            <span className="text-amber-500">Broken Links</span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your old YouTube videos are still getting views — but are their affiliate links still working?
            Start with a free audit to see exactly which links are costing you money.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link
              href="/audit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            >
              <Play className="w-5 h-5" />
              Run Free Audit
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
            No credit card required · See results in 60 seconds
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
              <div className="text-2xl md:text-3xl font-bold text-amber-500 mb-1">$1,500</div>
              <div className="text-sm text-slate-500">Avg. annual revenue lost</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-500 mb-1">60 sec</div>
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
              Drag the slider to see the potential revenue you&apos;re losing each year.
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
              How It Works
            </h2>
            <p className="text-slate-400">
              Start free. See your biggest leaks. Fix them and start recovering revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">1</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Free Calculator</h3>
              <p className="text-sm text-slate-400">Enter your channel URL to estimate revenue loss</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$0</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">2</span>
              </div>
              <h3 className="font-semibold text-white mb-2">See Your Leak</h3>
              <p className="text-sm text-slate-400">View estimated annual revenue loss</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$0</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">3</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Free Audit</h3>
              <p className="text-sm text-slate-400">Connect with Google to see top 3-5 broken links</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$0 (No CC)</p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">4</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Fix Everything</h3>
              <p className="text-sm text-slate-400">Upgrade to see all links + auto-fix</p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">$19/mo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400">
              Start with a free audit. Upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Solo Creator */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-emerald-500/50 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 bg-emerald-500 rounded-full text-sm font-semibold text-white">
                  Most Popular
                </div>
              </div>

              <div className="pt-4 mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Solo Creator</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">$19</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-emerald-400 font-medium">or $190/year (save $38)</p>
              </div>

              <p className="text-slate-300 mb-6">
                Perfect for creators managing one channel.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "1 YouTube Channel",
                  "Unlimited video scans",
                  "24/7 Link Guard monitoring",
                  "AI-powered link suggestions",
                  "Revenue impact prioritization",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/audit"
                className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white text-center py-4 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
              >
                Start Free Audit
              </Link>
            </div>

            {/* Business/Agency */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Business / Agency</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">$49</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-slate-400 font-medium">or $490/year (save $98)</p>
              </div>

              <p className="text-slate-300 mb-6">
                For agencies managing multiple channels.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Up to 5 YouTube Channels",
                  "Everything in Solo Creator",
                  "Team access & collaboration",
                  "Exportable PDF reports",
                  "Priority support",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/audit"
                className="block w-full bg-slate-700 hover:bg-slate-600 text-white text-center py-4 rounded-xl font-semibold transition-all border border-slate-600/50"
              >
                Start Free Audit
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              View full pricing details <ArrowRight className="w-4 h-4 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto bg-slate-800/30 border border-emerald-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">The ROI is a No-Brainer</h2>

          <div className="space-y-4 text-slate-300">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
              <span>Average creator revenue loss:</span>
              <span className="text-xl font-bold text-red-400">$1,500/year</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
              <span>LinkMedic cost (annual):</span>
              <span className="text-xl font-bold text-white">$228/year</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold text-white">Your ROI:</span>
              <span className="text-3xl font-bold text-emerald-400">6.5x</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            If you recover just <strong className="text-white">$20/month</strong> in lost commissions, LinkMedic pays for itself.
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Instant Setup</h4>
              <p className="text-sm text-slate-400">
                Connect your channel and scan in under 60 seconds
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Recover Revenue</h4>
              <p className="text-sm text-slate-400">
                Fix broken links and stop leaving money on the table
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">24/7 Monitoring</h4>
              <p className="text-sm text-slate-400">
                Get instant alerts when links break
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Stop Losing Money?
          </h2>
          <p className="text-slate-400 mb-8">
            Start with a free audit. See your top broken links in 60 seconds.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
          >
            <Play className="w-5 h-5" />
            Run Free Audit
          </Link>
          <p className="text-sm text-slate-500 mt-4">No credit card required · See results instantly</p>
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
          <p className="text-center text-sm text-slate-600 mt-4">
            &copy; 2026 LinkMedic. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
