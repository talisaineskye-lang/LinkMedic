"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const POLICY_TABS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/refund", label: "Refund Policy" },
];

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
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
          </nav>
          <Link
            href="/login"
            className="btn-primary px-4 py-2 text-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-xl">
            {POLICY_TABS.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-1 min-w-[120px] px-4 py-2.5 text-sm font-medium text-center rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-black shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-slate-400 mb-12">Last updated: {lastUpdated}</p>

        {/* Content */}
        <div className="space-y-8 text-slate-300 leading-relaxed">
          {children}
        </div>

        {/* CTA Section */}
        <div className="mt-16 glass-card p-8 text-center border-cyan-500/30">
          <h3 className="text-xl font-bold text-white mb-3">
            Ready to Protect Your Affiliate Revenue?
          </h3>
          <p className="text-slate-400 mb-6">
            Scan your YouTube channel for broken links and start recovering lost revenue.
          </p>
          <Link
            href="/audit"
            className="btn-primary inline-block px-6 py-3"
          >
            Run Free Audit
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; 2026 LinkMedic. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
              <Link href="/pricing" className="hover:text-cyan-400 transition">Pricing</Link>
              <Link href="/resources" className="hover:text-cyan-400 transition">Resources</Link>
              <Link href="/login" className="hover:text-cyan-400 transition">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
