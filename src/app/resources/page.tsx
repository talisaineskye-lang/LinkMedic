import { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, ArrowRight, AlertTriangle, ShoppingCart, FileSearch, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources | LinkMedic - YouTube Affiliate Link Guides",
  description: "Guides and resources for YouTube creators managing affiliate links. Learn how to find and fix broken links, audit descriptions, and protect your revenue.",
  keywords: ["youtube affiliate links", "affiliate link resources", "youtube creator guides", "broken link guides"],
};

const RESOURCES = [
  {
    href: "/audit",
    title: "Free YouTube Affiliate Link Checker",
    description: "Find broken links in your video descriptions in minutes. Free tool for YouTube creators.",
    icon: ExternalLink,
    featured: true,
  },
  {
    href: "/resources/broken-affiliate-links-youtube",
    title: "Broken Affiliate Links on YouTube: Why It Happens",
    description: "Learn why YouTube affiliate links break and how to fix them. Protect your revenue from silent decay.",
    icon: AlertTriangle,
  },
  {
    href: "/resources/amazon-affiliate-links-not-working",
    title: "Amazon Affiliate Links Not Working?",
    description: "Discover why Amazon affiliate links stop converting. Buy Box issues, discontinued products, and more.",
    icon: ShoppingCart,
  },
  {
    href: "/resources/audit-youtube-descriptions-affiliate-links",
    title: "How to Audit YouTube Descriptions (The Right Way)",
    description: "The right approach to auditing affiliate links. Prioritize by revenue impact, not random checks.",
    icon: FileSearch,
  },
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-white">Link</span>
            <LinkIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="text-white">Resources</Link>
          </nav>
          <Link
            href="/login"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Resources</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Guides for YouTube creators managing affiliate links. Learn how to find broken links, audit descriptions, and protect your revenue.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-4">
            {RESOURCES.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className={`block rounded-xl border transition-all hover:border-emerald-600/50 hover:bg-slate-800/30 ${
                    resource.featured
                      ? "bg-emerald-900/10 border-emerald-700/30"
                      : "bg-slate-800/20 border-slate-700/50"
                  }`}
                >
                  <div className="p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      resource.featured ? "bg-emerald-600/20" : "bg-slate-700/50"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        resource.featured ? "text-emerald-400" : "text-slate-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-slate-100">
                          {resource.title}
                        </h2>
                        {resource.featured && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-emerald-600/20 text-emerald-400 rounded">
                            Tool
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {resource.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-slate-800/50 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Find Your Broken Links?</h2>
          <p className="text-slate-400 mb-8">
            Run a free audit and see which affiliate links need attention on your channel.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Run Free Audit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-0.5">
              <span className="text-white">Link</span>
              <LinkIcon className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">Medic</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/" className="hover:text-emerald-400 transition">Home</Link>
              <Link href="/pricing" className="hover:text-emerald-400 transition">Pricing</Link>
              <Link href="/privacy" className="hover:text-emerald-400 transition">Privacy</Link>
              <Link href="/terms" className="hover:text-emerald-400 transition">Terms</Link>
            </div>
          </div>
          <p className="text-center text-sm text-slate-600 mt-4">
            &copy; 2026 LinkMedic. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
