import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link as LinkIcon, Play, Search, AlertCircle, Wrench, FileQuestion, AlertTriangle, ShieldCheck, Check } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-gray-900">Link</span>
            <LinkIcon className="w-5 h-5 text-red-600" />
            <span className="text-red-600">Medic</span>
          </div>
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Centered Logo */}
        <div className="flex items-center justify-center gap-0.5 text-4xl font-semibold mb-6">
          <span className="text-gray-900">Link</span>
          <LinkIcon className="w-9 h-9 text-red-600" />
          <span className="text-red-600">Medic</span>
        </div>

        <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight">
          Stop Losing Affiliate Revenue<br />From <span className="text-amber-600">Broken</span> YouTube Links
        </h1>
        <p className="text-lg text-gray-600/85 mb-8 max-w-2xl mx-auto leading-relaxed">
          LinkMedic automatically scans your video descriptions, detects broken or outdated affiliate links, and shows you exactly what to fix — before commissions disappear.
        </p>
        <div className="flex items-center justify-center gap-4 mb-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-green-900 text-white px-6 py-3 rounded-md font-medium hover:bg-green-950 transition-colors border border-green-950/20 shadow-sm"
          >
            Scan My Channel
          </Link>
          <a
            href="#how-it-works"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            See How It Works
          </a>
        </div>
        <p className="text-sm text-gray-500/80">
          7-day free trial · Cancel anytime
        </p>
      </section>

      {/* Subtle Divider */}
      <div className="bg-gray-50 h-px" />

      {/* Problem → Solution */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <FileQuestion className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Problem</p>
              <p className="text-gray-900">Old videos. Old links.</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Consequence</p>
              <p className="text-gray-900">Broken links quietly cost you commissions.</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Solution</p>
              <p className="text-gray-900">LinkMedic audits every video automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12 tracking-tight">How It Works</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-green-700 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-semibold text-green-700">1</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Play className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-sm text-gray-600/85">Connect your YouTube channel</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-green-700 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-semibold text-green-700">2</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-sm text-gray-600/85">LinkMedic scans all video descriptions</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-amber-600 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-semibold text-amber-600">3</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-gray-600/85">Broken and dead links are flagged</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-green-700 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-semibold text-green-700">4</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-sm text-gray-600/85">Fix the highest-impact issues first</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-gray-600/85 italic leading-relaxed">
            &ldquo;In one test channel, LinkMedic identified dozens of <span className="text-amber-600 not-italic font-medium">broken</span> affiliate links across older videos — representing hundreds in potential monthly revenue.&rdquo;
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-md mx-auto px-6">
          <div className="border border-gray-200 rounded-lg p-8 text-center">
            <div className="flex items-center justify-center gap-0.5 text-xl font-semibold mb-2">
              <span className="text-gray-900">Link</span>
              <LinkIcon className="w-5 h-5 text-red-600" />
              <span className="text-red-600">Medic</span>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-semibold text-gray-900">$19</span>
              <span className="text-gray-500"> / month</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              $190 / year
            </p>
            <p className="text-sm text-gray-600/85 mb-6">
              Designed for serious creators with growing libraries.
            </p>
            <ul className="text-sm text-gray-600/85 text-left space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-700" />
                Monitor hundreds of videos
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-700" />
                Weekly automated scans
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-700" />
                Revenue-impact prioritization
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-700" />
                Email alerts
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-700" />
                1 connected YouTube channel
              </li>
            </ul>
            <Link
              href="/login"
              className="block w-full bg-green-900 text-white py-3 rounded-md font-medium hover:bg-green-950 transition-colors border border-green-950/20 shadow-sm mb-3"
            >
              Start 7-Day Trial
            </Link>
            <p className="text-xs text-gray-500/80">
              Up to 500 videos and 2,000 affiliate links per channel.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-500/80">
          <div className="flex items-center justify-center gap-0.5 mb-2">
            <span>Link</span>
            <LinkIcon className="w-4 h-4 text-red-600" />
            <span className="text-red-600">Medic</span>
          </div>
          <p>Affiliate link health monitoring for YouTube creators.</p>
        </div>
      </footer>
    </main>
  );
}
