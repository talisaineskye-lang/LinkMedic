import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, FileText, FileSearch, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Resources | LinkMedic - YouTube Affiliate Link Guides",
  description: "Guides and resources for YouTube creators managing affiliate links. Learn how to find and fix broken links, audit descriptions, and protect your revenue.",
  keywords: ["youtube affiliate links", "affiliate link resources", "youtube creator guides", "broken link guides"],
  openGraph: {
    title: "Resources | LinkMedic - YouTube Affiliate Link Guides",
    description: "Guides and resources for YouTube creators managing affiliate links.",
    type: "website",
    url: "https://link-medic.app/resources",
    images: [{ url: "https://link-medic.app/opengraph-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources | LinkMedic",
    description: "Guides and resources for YouTube creators managing affiliate links.",
    images: ["https://link-medic.app/opengraph-image.jpg"],
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
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={140} height={32} className="h-8 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="text-white">Resources</Link>
          </nav>
          <Link
            href="/login"
            className="btn-primary px-4 py-2 text-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">
            Knowledge Base
          </span>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mt-3 mb-4">RESOURCES</h1>
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
                  className={`block glass-card transition-all hover:border-cyan-500/50 ${
                    resource.featured
                      ? "border-cyan-500/30"
                      : ""
                  }`}
                >
                  <div className="p-6 flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      resource.featured ? "bg-cyan-500/20" : "bg-white/5"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        resource.featured ? "text-cyan-400" : "text-slate-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-white">
                          {resource.title}
                        </h2>
                        {resource.featured && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded">
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
      <section className="py-16 border-t border-white/10 bg-[#0f172a]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-2xl tracking-wide mb-4">READY TO FIND YOUR BROKEN LINKS?</h2>
          <p className="text-slate-400 mb-8">
            Run a free audit and see which affiliate links need attention on your channel.
          </p>
          <Link
            href="/audit"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            Run Free Audit
            <ArrowRight className="w-4 h-4" />
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
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <Link href="/intel" className="hover:text-white transition">Intel Blog</Link>
          </div>

          <div className="text-slate-500 text-sm">
            &copy; 2026 LinkMedic
          </div>
        </div>
      </footer>
    </div>
  );
}
