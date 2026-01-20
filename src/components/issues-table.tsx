"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check, CheckCircle2, ExternalLink } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/revenue-estimator";

interface Issue {
  id: string;
  videoId: string;
  videoTitle: string;
  videoViewCount: number;
  url: string;
  status: string;
  merchant: string;
  lastCheckedAt: Date | null;
  estimatedLoss: number;
  suggestedLink: string | null;
  isFixed: boolean;
  dateFixed: Date | null;
}

interface IssuesTableProps {
  issues: Issue[];
}

export function IssuesTable({ issues }: IssuesTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [markingFixed, setMarkingFixed] = useState<string | null>(null);
  const router = useRouter();

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const markAsFixed = async (id: string) => {
    setMarkingFixed(id);
    try {
      const response = await fetch("/api/links/mark-fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as fixed");
      }

      router.refresh();
    } catch (error) {
      console.error("Error marking as fixed:", error);
      alert("Failed to mark as fixed");
    } finally {
      setMarkingFixed(null);
    }
  };

  if (issues.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
        <p className="mb-2 text-lg font-semibold text-white">No issues found!</p>
        <p className="text-sm">All your affiliate links are working properly.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-900/50 border-b border-slate-700/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Video
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Broken Link
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Suggested Fix
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              Est. Loss
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {issues.map((issue) => (
            <tr key={issue.id} className="hover:bg-slate-700/20 transition">
              {/* Video */}
              <td className="px-4 py-4">
                <Link
                  href={`/videos/${issue.videoId}`}
                  className="text-sm text-white hover:text-emerald-400 transition block"
                >
                  {issue.videoTitle.length > 35
                    ? issue.videoTitle.slice(0, 35) + "..."
                    : issue.videoTitle}
                </Link>
                <div className="text-xs text-slate-500">
                  {formatNumber(issue.videoViewCount)} views
                </div>
              </td>

              {/* Broken Link */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-400 hover:underline truncate block max-w-[180px]"
                    title={issue.url}
                  >
                    {issue.url.length > 40
                      ? issue.url.slice(0, 40) + "..."
                      : issue.url}
                  </a>
                  <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
                </div>
                <div className="text-xs text-slate-500 capitalize">
                  {issue.merchant}
                </div>
              </td>

              {/* Suggested Fix */}
              <td className="px-4 py-4">
                {issue.suggestedLink ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={issue.suggestedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-400 hover:underline truncate block max-w-[180px]"
                      title={issue.suggestedLink}
                    >
                      {issue.suggestedLink.length > 40
                        ? issue.suggestedLink.slice(0, 40) + "..."
                        : issue.suggestedLink}
                    </a>
                    <button
                      onClick={() => copyToClipboard(issue.suggestedLink!, issue.id)}
                      className="p-1.5 rounded-md bg-emerald-950/50 border border-emerald-700/50 hover:bg-emerald-900/50 transition flex-shrink-0"
                      title="Copy suggested link"
                    >
                      {copiedId === issue.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    No suggestion yet
                  </span>
                )}
              </td>

              {/* Status */}
              <td className="px-4 py-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                    issue.status === "NOT_FOUND"
                      ? "bg-red-950/30 border-red-700/50 text-red-400"
                      : issue.status === "OOS"
                      ? "bg-amber-950/30 border-amber-700/50 text-amber-400"
                      : "bg-slate-700/30 border-slate-600/50 text-slate-400"
                  }`}
                >
                  {issue.status === "NOT_FOUND"
                    ? "Broken"
                    : issue.status === "OOS"
                    ? "Out of Stock"
                    : issue.status}
                </span>
              </td>

              {/* Est. Loss */}
              <td className="px-4 py-4 text-right">
                <span className="text-sm font-medium text-red-400">
                  {formatCurrency(issue.estimatedLoss)}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-4 text-center">
                <button
                  onClick={() => markAsFixed(issue.id)}
                  disabled={markingFixed === issue.id}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-emerald-950/50 hover:border-emerald-700/50 hover:text-emerald-400 disabled:opacity-50 transition"
                >
                  {markingFixed === issue.id ? "Marking..." : "Mark Fixed"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Copy Toast */}
      {copiedId && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-emerald-600 text-white rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Copied! Ready to paste into YouTube.</span>
        </div>
      )}
    </div>
  );
}
