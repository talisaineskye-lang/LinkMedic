import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link as LinkIcon, Check, ArrowRight, Play, Link2, Tag, Package, XCircle, CheckCircle } from "lucide-react";
import { RevenueCalculator } from "@/components/revenue-calculator";
import { DecayVisualization } from "@/components/decay-visualization";

// Noise texture SVG for dark sections
const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-white">Link</span>
            <LinkIcon className="w-5 h-5 text-green-400" />
            <span className="text-green-400">Medic</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <Link href="/audit" className="hover:text-white transition-colors">Free Audit</Link>
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
          </nav>
          <Link
            href="/audit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Scan My Channel
          </Link>
        </div>
      </header>

      {/* Hero Section - Redesigned with decay visualization */}
      <section className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: noiseTexture }}
        />

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
            {/* Left side - Copy */}
            <div>
              <p className="text-green-400 text-sm font-medium tracking-wide mb-4">
                Channel Health &amp; Revenue Recovery
              </p>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
                Links don&apos;t break<br />all at once.
              </h1>

              <p className="text-xl md:text-2xl text-gray-400 font-light mb-8">
                They decay quietly over time.
              </p>

              <p className="text-gray-300 mb-8 max-w-md">
                LinkMedic checks your YouTube affiliate links every week so you don&apos;t have to.
              </p>

              <Link
                href="/audit"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded transition-colors"
              >
                Run a Channel Scan
              </Link>

              <p className="text-sm text-gray-500 mt-4">
                No credit card required &middot; Results in under 2 minutes
              </p>
            </div>

            {/* Right side - Animated decay visualization */}
            <div className="relative">
              <DecayVisualization />
            </div>
          </div>
        </div>
      </section>

      {/* "It's not neglect" Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-100">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            It&apos;s not neglect. It&apos;s just time.
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Even good videos go stale.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">&#128230;</div>
              <h3 className="font-bold text-gray-900 mb-2">Out of Stock Products</h3>
              <p className="text-gray-600 text-sm">Items get discontinued.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">&#128279;</div>
              <h3 className="font-bold text-gray-900 mb-2">Changed Amazon Links</h3>
              <p className="text-gray-600 text-sm">URLs get redirected.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">&#9888;&#65039;</div>
              <h3 className="font-bold text-gray-900 mb-2">Missing Disclosures</h3>
              <p className="text-gray-600 text-sm">Policies keep shifting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Dark cards on light background */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-12">
            We find the problems so you can fix what matters.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                <span className="text-2xl">&#128279;</span>
                <span className="text-4xl font-bold">15%</span>
              </div>
              <p className="text-gray-400">Average link decay rate</p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                <span className="text-2xl">&#9888;</span>
                <span className="text-4xl font-bold">$1,500+</span>
              </div>
              <p className="text-gray-400">Average annual revenue lost*</p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-center gap-2 text-white mb-2">
                <span className="text-4xl font-bold">&lt;2 min</span>
              </div>
              <p className="text-gray-400">To scan your entire channel</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            *Based on channels with 50K+ subscribers
          </p>
        </div>
      </section>

      {/* Problem Section - Stop the Revenue Leaks */}
      <section id="problem" className="py-20 px-6 bg-gray-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: noiseTexture }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
              Is Your Back Catalog Working Against You?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Every day, your old videos generate views. If your links are broken, you&apos;re not
              just losing money&mdash;you&apos;re losing the trust of your audience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                <Link2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Rescue Discontinued Products</h3>
              <p className="text-gray-400">
                Amazon pages vanish and URLs 404. We flag the dead ends so you can
                redirect viewers to active alternatives.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                <Tag className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Protect Your Affiliate Credit</h3>
              <p className="text-gray-400">
                Affiliate tags can expire or break during redirects. We ensure your tags
                are active and correctly attributed to your account.
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Monitor Stock Availability</h3>
              <p className="text-gray-400">
                Don&apos;t send fans to a &ldquo;Currently Unavailable&rdquo; page. Know exactly when your
                top products are out of stock so you can swap them out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="py-20 px-6 bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
              See Your Revenue Recovery Potential
            </h2>
            <p className="text-xl text-gray-400">
              Use the slider to estimate the commissions hiding in your description boxes.
            </p>
          </div>

          <RevenueCalculator />
        </div>
      </section>

      {/* How It Works - The Medic Process */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: noiseTexture }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
              The &ldquo;Medic&rdquo; Process
            </h2>
            <p className="text-xl text-gray-400">
              Three steps to healthier links and recovered revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white">1</div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your Channel</h3>
              <p className="text-gray-400">
                Securely sync your YouTube library with one click. We use the official
                YouTube API &mdash; we never see your password.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white">2</div>
              <h3 className="text-xl font-semibold text-white mb-2">The Quick Scan</h3>
              <p className="text-gray-400">
                Our &ldquo;Medic&rdquo; scans every description for 404s, expired tags, and
                out-of-stock items in under 2 minutes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white">3</div>
              <h3 className="text-xl font-semibold text-white mb-2">Heal Your Links</h3>
              <p className="text-gray-400">
                Get your &ldquo;Prescription&rdquo; &mdash; a prioritized fix list with one-click
                export to TubeBuddy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: noiseTexture }}
        />

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            The Link Medic Challenge
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            We&apos;ve never scanned a channel with 50+ videos that didn&apos;t have
            at least one broken link.
          </p>
          <p className="text-2xl font-semibold text-white mb-8">
            Think your channel is clean? Prove us wrong.
          </p>
          <Link
            href="/audit"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded text-lg transition-colors"
          >
            Scan My Channel
          </Link>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 px-6 bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400">
              Start with a free audit. Upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Tier 1: The Auditor (Free) */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-300 mb-2">The Auditor</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-500 font-medium">Diagnostic</p>
              </div>

              <p className="text-gray-400 mb-6">
                See what&apos;s leaking before you commit.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Scan last 15 videos",
                  "Basic link status (404s)",
                  "One-time report",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400">
                    <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/audit"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white text-center py-4 rounded-xl font-semibold transition-all border border-gray-600/50"
              >
                Scan My Channel
              </Link>
            </div>

            {/* Tier 2: The Specialist ($19/mo) - RECOMMENDED */}
            <div className="bg-gradient-to-br from-red-950/50 to-gray-900/50 backdrop-blur border-2 border-red-500/50 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 bg-red-600 rounded-full text-sm font-semibold text-white">
                  PAYS FOR ITSELF
                </div>
              </div>

              <div className="pt-4 mb-6">
                <h3 className="text-2xl font-bold text-red-400 mb-2">The Specialist</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">$19</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-red-400 font-medium">Recovery &amp; Protection</p>
              </div>

              <p className="text-gray-300 mb-6">
                Full protection for serious creators.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Scan Full Channel History",
                  "Deep AI Detection (OOS, Redirects)",
                  "One-Click AI Fix Suggestions",
                  "24/7 \"Link Guard\" Monitoring",
                  "Weekly Revenue Alerts",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-red-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-4 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20"
              >
                Start Free Trial
              </Link>
              <p className="text-xs text-gray-500 text-center mt-3">No charge today &middot; Cancel anytime</p>
            </div>

            {/* Tier 3: The Portfolio Manager ($49/mo) - Greyed Out */}
            <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur border border-gray-700/30 rounded-2xl p-8 opacity-60">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-400 mb-2">The Portfolio Manager</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-gray-400">$49</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-gray-500 font-medium">Scale</p>
              </div>

              <p className="text-gray-500 mb-6">
                For agencies managing multiple channels.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Manage up to 10 Channels",
                  "Aggregate Dashboard",
                  "Agency PDF Reporting",
                  "Team Access",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-500">
                    <Check className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="block w-full bg-gray-700/50 text-gray-500 text-center py-4 rounded-xl font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-red-400 hover:text-red-300 transition-colors">
              View full pricing details <ArrowRight className="w-4 h-4 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Not Manual Section */}
      <section className="py-20 px-6 bg-gray-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: noiseTexture }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl font-serif font-bold text-center text-white mb-4">
            Why Not Just Check Manually?
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12">
            You could click through every video description yourself. For a channel
            with 200 videos and 10 links each, that&apos;s 2,000 clicks.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Manual Check
              </h3>
              <ul className="space-y-3 text-gray-400">
                <li>&bull; 8+ hours of clicking</li>
                <li>&bull; Easy to miss expired tags</li>
                <li>&bull; No fix suggestions</li>
                <li>&bull; One-time snapshot only</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 border-2 border-green-600 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Link Medic
              </h3>
              <ul className="space-y-3 text-gray-400">
                <li>&bull; Under 2 minutes</li>
                <li>&bull; Catches everything (404s, OOS, tags)</li>
                <li>&bull; AI-powered replacements</li>
                <li>&bull; Weekly monitoring included</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 px-6 bg-gray-800">
        <div className="max-w-3xl mx-auto bg-gray-900/50 border border-red-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-serif font-bold text-white text-center mb-6">The ROI is a No-Brainer</h2>

          <div className="space-y-4 text-gray-300">
            <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
              <span>Average creator revenue loss:</span>
              <span className="text-xl font-bold text-red-400">$1,500/year</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
              <span>LinkMedic cost (annual):</span>
              <span className="text-xl font-bold text-white">$228/year</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold text-white">Your ROI:</span>
              <span className="text-3xl font-bold text-green-400">6.5x</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            If you recover just <strong className="text-white">$20/month</strong> in lost commissions, LinkMedic pays for itself.
          </p>
        </div>
      </section>

      {/* FAQ Section - The Prescription */}
      <section className="py-20 bg-gray-900 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: noiseTexture }}
        />

        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl font-serif font-bold text-center text-white mb-4">
            The Prescription
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12">
            Everything you need to know.
          </p>

          <div className="space-y-4">
            <details className="bg-gray-800 rounded-xl p-6 cursor-pointer group">
              <summary className="font-bold text-lg flex justify-between items-center list-none">
                <span>How does Link Medic access my channel?</span>
                <span className="text-red-400 group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <p className="text-gray-400 mt-4">
                We use the official YouTube API to securely read your video descriptions.
                We never see your password, and we don&apos;t have permission to change anything
                without your direct action. You are always in control.
              </p>
            </details>

            <details className="bg-gray-800 rounded-xl p-6 cursor-pointer group">
              <summary className="font-bold text-lg flex justify-between items-center list-none">
                <span>Will this scan affect my YouTube SEO?</span>
                <span className="text-red-400 group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Not at all. In fact, keeping your links healthy is widely considered a
                best practice. YouTube&apos;s algorithm prefers videos that lead to high-quality
                user experiences, and fixing 404 dead-ends is a major part of that.
              </p>
            </details>

            <details className="bg-gray-800 rounded-xl p-6 cursor-pointer group">
              <summary className="font-bold text-lg flex justify-between items-center list-none">
                <span>I have thousands of videos. Can it handle that?</span>
                <span className="text-red-400 group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <p className="text-gray-400 mt-4">
                Yes. Whether you have 10 videos or 10,000, our engine is built to crawl
                your entire archive in under 2 minutes. We prioritize your most-viewed
                videos first so you can fix the high-impact leaks immediately.
              </p>
            </details>

            <details className="bg-gray-800 rounded-xl p-6 cursor-pointer group">
              <summary className="font-bold text-lg flex justify-between items-center list-none">
                <span>Does this work for links outside of Amazon?</span>
                <span className="text-red-400 group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <p className="text-gray-400 mt-4">
                While we have deep integration with Amazon Associates to check stock levels,
                Link Medic flags 404 errors and broken redirects for any affiliate platform,
                including ShareASale, Impact, and direct brand partnerships.
              </p>
            </details>

            <details className="bg-gray-800 rounded-xl p-6 cursor-pointer group">
              <summary className="font-bold text-lg flex justify-between items-center list-none">
                <span>What happens after the free audit?</span>
                <span className="text-red-400 group-open:rotate-45 transition-transform text-2xl">+</span>
              </summary>
              <p className="text-gray-400 mt-4">
                You&apos;ll get a Health Report showing exactly how many links are broken and
                which videos are losing the most revenue. From there, you can choose to
                fix them manually or upgrade to use our Pro tools to streamline the entire
                recovery process.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center bg-gray-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: noiseTexture }}
        />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Stop losing revenue to dead links.
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Get a free scan of your channel today.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded text-lg transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Your Scan
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required &middot; Results in under 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-0.5 text-lg font-semibold">
              <span className="text-white">Link</span>
              <LinkIcon className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Medic</span>
            </div>
            <p className="text-sm text-gray-500">
              Affiliate link health monitoring for YouTube creators.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/audit" className="hover:text-white transition-colors">Free Audit</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            &copy; 2026 LinkMedic. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
