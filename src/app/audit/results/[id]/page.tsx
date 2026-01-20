import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuditById } from "@/lib/public-audit";
import { formatCurrency } from "@/lib/revenue-estimator";
import { AuditResultsClient } from "@/components/audit-results-client";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    return { title: "Audit Not Found - LinkMedic" };
  }

  const title = `${audit.channelName} Lost ${formatCurrency(audit.estimatedMonthlyLoss)}/month in Affiliate Revenue`;
  const description = `This YouTube channel has ${audit.brokenLinks} broken and ${audit.outOfStockLinks} out-of-stock affiliate links. Use LinkMedic to audit your channel for free.`;

  return {
    title,
    description,
    openGraph: {
      title: `I Audited My YouTube Channel & Found ${formatCurrency(audit.estimatedMonthlyLoss)} in Lost Revenue`,
      description: "Use this free tool to discover how much you're losing to broken affiliate links.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AuditResultsPage({ params }: PageProps) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-white">Link</span>
            <LinkIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </Link>
          <Link
            href="/audit"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            Audit Your Channel →
          </Link>
        </div>
      </header>

      {/* Results */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <AuditResultsClient auditId={id} initialData={audit} />
      </section>

      {/* Footer CTA */}
      <section className="border-t border-slate-800/50 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Want to Check Your Own Channel?
          </h2>
          <p className="text-slate-400 mb-8">
            Run a free audit and see how much revenue you might be losing to broken affiliate links.
          </p>
          <Link
            href="/audit"
            className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-white transition"
          >
            Audit My Channel — Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-0.5 text-lg font-semibold mb-2">
            <span className="text-white">Link</span>
            <LinkIcon className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500">Medic</span>
          </div>
          <p className="text-slate-500 text-sm">
            Affiliate link health monitoring for YouTube creators.
          </p>
        </div>
      </footer>
    </main>
  );
}
