import { Metadata } from "next";
import Link from "next/link";
import { Link as LinkIcon, ArrowRight, ExternalLink, FileText, FileSearch, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources | LinkMedic - YouTube Affiliate Link Guides",
  description: "Guides and resources for YouTube creators managing affiliate links. Learn how to find and fix broken links, audit descriptions, and protect your revenue.",
  keywords: ["youtube affiliate links", "affiliate link resources", "youtube creator guides", "broken link guides"],
  openGraph: {
    title: "Resources | LinkMedic - YouTube Affiliate Link Guides",
    description: "Guides and resources for YouTube creators managing affiliate links.",
    type: "website",
    url: "https://linkmedic.io/resources",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources | LinkMedic",
    description: "Guides and resources for YouTube creators managing affiliate links.",
  },
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
    href: "/resources/audit-youtube-affiliate-links",
    title: "How to Audit YouTube Affiliate Links (The Right Way)",
    description: "The right approach to auditing affiliate links. Prioritize by revenue impact, not random checks.",
    icon: FileSearch,
  },
  {
    href: "/resources/why-affiliate-links-break",
    title: "Why Affiliate Links Break on YouTube (And What to Do)",
    description: "Learn why YouTube affiliate links fail silently, common Amazon link issues, and how to fix them.",
    icon: AlertTriangle,
  },
  {
    href: "/resources/youtube-affiliate-link-disclosure-guidelines",
    title: "YouTube Affiliate Link Disclosure Guidelines (FTC 2026)",
    description: "Learn how to properly disclose affiliate links on YouTube to stay FTC compliant. Clear templates, placement rules, and best practices.",
    icon: FileText,
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
            <LinkIcon className="w-5 h-5 text-profit-green" />
            <span className="text-profit-green">Medic</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="text-white">Resources</Link>
          </nav>
          <Link
            href="/login"
            className="bg-profit-green hover:bg-profit-green/90 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                  className={`block rounded-xl border transition-all hover:border-profit-green/50 hover:bg-slate-800/30 ${
                    resource.featured
                      ? "bg-profit-green/10 border-profit-green/30"
                      : "bg-slate-800/20 border-slate-700/50"
                  }`}
                >
                  <div className="p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      resource.featured ? "bg-profit-green/20" : "bg-slate-700/50"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        resource.featured ? "text-profit-green" : "text-slate-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-slate-100">
                          {resource.title}
                        </h2>
                        {resource.featured && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-profit-green/20 text-profit-green rounded">
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
            className="inline-flex items-center gap-2 bg-profit-green hover:bg-profit-green/90 text-black font-semibold px-6 py-3 rounded-xl transition-all"
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
              <LinkIcon className="w-4 h-4 text-profit-green" />
              <span className="text-profit-green">Medic</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/" className="hover:text-profit-green transition">Home</Link>
              <Link href="/pricing" className="hover:text-profit-green transition">Pricing</Link>
              <Link href="/intel" className="hover:text-profit-green transition">Intel Blog</Link>
              <Link href="/privacy" className="hover:text-profit-green transition">Privacy</Link>
              <Link href="/terms" className="hover:text-profit-green transition">Terms</Link>
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
