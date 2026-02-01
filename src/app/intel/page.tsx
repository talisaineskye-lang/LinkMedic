import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Intel Blog | LinkMedic",
  description: "Affiliate marketing strategies, commission optimization guides, and revenue tips to help YouTube creators earn more from every video in their back catalog.",
  keywords: ["affiliate marketing", "youtube affiliate", "commission rates", "affiliate strategy"],
  openGraph: {
    title: "Intel Blog | LinkMedic",
    description: "Affiliate marketing strategies, commission optimization guides, and revenue tips to help YouTube creators earn more from every video in their back catalog.",
    type: "website",
    url: "https://link-medic.app/intel",
    images: [{ url: "https://link-medic.app/opengraph-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intel Blog | LinkMedic",
    description: "Affiliate marketing strategies, commission optimization guides, and revenue tips to help YouTube creators earn more from every video in their back catalog.",
    images: ["https://link-medic.app/opengraph-image.jpg"],
  },
};

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: "2026-youtube-affiliate-strategy-guide",
    title: "The 2026 YouTube Affiliate Strategy Guide",
    description: "Stop leaving money on the table. Learn the three-link tier system and platform tactics that top creators use to earn 2x to 5x more from the same videos.",
    date: "January 2026",
    readTime: "8 min read",
    category: "Strategy",
  },
  {
    slug: "2026-merchant-yield-map",
    title: "The 2026 Merchant Yield Map",
    description: "A side-by-side comparison of affiliate commission rates and cookie windows. Know exactly who pays what before you add links to your next video.",
    date: "January 2026",
    readTime: "6 min read",
    category: "Reference",
  },
];

export default function IntelBlogPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/audit" className="hover:text-white transition">Free Audit</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
            <Link href="/intel" className="text-white">Intel Blog</Link>
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
      <section className="py-16 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-cyan-400 text-sm font-mono tracking-wider mb-4">INTEL BLOG</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide mb-6">
            AFFILIATE INTELLIGENCE
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Strategies, commission guides, and revenue optimization tactics for YouTube creators who take affiliate earnings seriously.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/intel/${post.slug}`}
                className="block glass-card p-8 hover:border-cyan-500/50 transition group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
                <h2 className="font-display text-2xl text-white mb-3 group-hover:text-cyan-400 transition">
                  {post.title.toUpperCase()}
                </h2>
                <p className="text-slate-400 mb-4">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-2 text-cyan-400 text-sm font-medium">
                  Read article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl text-white mb-4">
            PUT THESE STRATEGIES TO WORK
          </h2>
          <p className="text-slate-400 mb-8">
            LinkMedic scans your YouTube channel for broken links, out-of-stock products, and dead redirects across Amazon, Impact, CJ, Rakuten, ShareASale, and Awin.
          </p>
          <Link
            href="/audit"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4"
          >
            Run Free Audit
            <ArrowRight className="w-5 h-5" />
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
