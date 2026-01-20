"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link as LinkIcon } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-white">Link</span>
            <LinkIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-slate-800/50 rounded-xl">
            {POLICY_TABS.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-1 min-w-[120px] px-4 py-2.5 text-sm font-medium text-center rounded-lg transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
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

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-700/50 text-sm text-slate-400">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; 2026 LinkMedic. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-emerald-400 transition">Home</Link>
              <Link href="/audit" className="hover:text-emerald-400 transition">Free Audit</Link>
              <Link href="/login" className="hover:text-emerald-400 transition">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
