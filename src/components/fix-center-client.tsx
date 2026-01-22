"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Copy, Check, CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/revenue-estimator";
import { FindReplacementsButton } from "./find-replacements-button";

interface Issue {
  id: string;
  videoId: string;
  videoTitle: string;
  videoViewCount: number;
  videoThumbnailUrl: string | null;
  url: string;
  status: string;
  merchant: string;
  estimatedLoss: number;
  suggestedLink: string | null;
  suggestedTitle: string | null;
  suggestedAsin: string | null;
  suggestedPrice: string | null;
  confidenceScore: number | null;
  searchQuery: string | null;
  isFixed: boolean;
  dateFixed: Date | null;
}

interface FixCenterClientProps {
  needsFixIssues: Issue[];
  fixedIssues: Issue[];
  canUseAI?: boolean;
}

function ConfidenceBadge({ score }: { score: number | null }) {
  if (score === null) return null;

  const getColor = () => {
    if (score >= 85) return "bg-emerald-950/50 border-emerald-600/50 text-emerald-400";
    if (score >= 60) return "bg-amber-950/30 border-amber-700/50 text-amber-400";
    return "bg-slate-700/30 border-slate-600/50 text-slate-400";
  };

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${getColor()}`}>
      {score}%
    </span>
  );
}

export function FixCenterClient({ needsFixIssues, fixedIssues, canUseAI = true }: FixCenterClientProps) {
  const [activeTab, setActiveTab] = useState<"needs-fix" | "fixed">("needs-fix");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [markingFixedId, setMarkingFixedId] = useState<string | null>(null);
  const [findingId, setFindingId] = useState<string | null>(null);
  const router = useRouter();

  const issues = activeTab === "needs-fix" ? needsFixIssues : fixedIssues;
  const totalLoss = needsFixIssues.reduce((sum, i) => sum + i.estimatedLoss, 0);
  const issuesNeedingReplacements = needsFixIssues.filter(i => !i.suggestedLink).length;

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleMarkFixed = async (id: string) => {
    setMarkingFixedId(id);
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
      console.error("Error marking link as fixed:", error);
      alert("Failed to mark link as fixed");
    } finally {
      setMarkingFixedId(null);
    }
  };

  const handleFindReplacement = async (id: string) => {
    setFindingId(id);
    try {
      const response = await fetch("/api/links/find-replacements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkIds: [id] }),
      });

      if (!response.ok) {
        throw new Error("Failed to find replacement");
      }

      router.refresh();
    } catch (error) {
      console.error("Error finding replacement:", error);
      alert("Failed to find replacement");
    } finally {
      setFindingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Fix Center</h1>
          <p className="text-slate-400 mt-1">
            {needsFixIssues.length} broken link{needsFixIssues.length !== 1 ? "s" : ""}
            {totalLoss > 0 && (
              <> losing <span className="text-red-400 font-semibold">{formatCurrency(totalLoss)}</span>/month</>
            )}
          </p>
        </div>
        {issuesNeedingReplacements > 0 && <FindReplacementsButton canUseAI={canUseAI} />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/40 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("needs-fix")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            activeTab === "needs-fix"
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Needs Fix ({needsFixIssues.length})
        </button>
        <button
          onClick={() => setActiveTab("fixed")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition ${
            activeTab === "fixed"
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Fixed ({fixedIssues.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur overflow-hidden">
        {issues.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
            <p className="text-xl font-semibold text-white mb-2">
              {activeTab === "needs-fix" ? "All Links Fixed!" : "No Fixed Links Yet"}
            </p>
            <p className="text-slate-400">
              {activeTab === "needs-fix"
                ? "Great job! All your affiliate links are working properly."
                : "Links you mark as fixed will appear here."}
            </p>
          </div>
        ) : (
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
                    AI Suggestion
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Revenue at Risk
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-700/20 transition">
                    {/* Video with Thumbnail */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {issue.videoThumbnailUrl ? (
                          <Image
                            src={issue.videoThumbnailUrl}
                            alt={issue.videoTitle}
                            width={64}
                            height={36}
                            className="rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-9 bg-slate-700 rounded flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate max-w-[180px]" title={issue.videoTitle}>
                            {issue.videoTitle.length > 40
                              ? issue.videoTitle.slice(0, 40) + "..."
                              : issue.videoTitle}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatNumber(issue.videoViewCount)} views
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Broken Link */}
                    <td className="px-4 py-4">
                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-red-400 hover:underline truncate block max-w-[160px]"
                        title={issue.url}
                      >
                        {issue.url.length > 35 ? issue.url.slice(0, 35) + "..." : issue.url}
                      </a>
                    </td>

                    {/* AI Suggestion */}
                    <td className="px-4 py-4">
                      {issue.suggestedLink && issue.suggestedTitle ? (
                        <div className="space-y-1">
                          <p
                            className="text-sm text-emerald-400 font-medium max-w-[200px] truncate"
                            title={issue.suggestedTitle}
                          >
                            {issue.suggestedTitle.length > 40
                              ? issue.suggestedTitle.slice(0, 40) + "..."
                              : issue.suggestedTitle}
                          </p>
                          <div className="flex items-center gap-2">
                            {issue.suggestedPrice && (
                              <span className="text-xs text-slate-400">{issue.suggestedPrice}</span>
                            )}
                            <button
                              onClick={() => copyToClipboard(issue.suggestedLink!, issue.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-slate-700/50 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-400 transition"
                            >
                              {copiedId === issue.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy Link
                                </>
                              )}
                            </button>
                            <a
                              href={issue.suggestedLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-slate-700/50 hover:bg-slate-600/50 transition"
                              title="Preview product"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          </div>
                        </div>
                      ) : activeTab === "needs-fix" ? (
                        <button
                          onClick={() => handleFindReplacement(issue.id)}
                          disabled={findingId === issue.id}
                          className="text-sm text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition disabled:opacity-50"
                        >
                          {findingId === issue.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Finding...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              Find Replacement
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>

                    {/* Confidence Score */}
                    <td className="px-4 py-4 text-center">
                      {issue.suggestedLink ? (
                        <ConfidenceBadge score={issue.confidenceScore} />
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>

                    {/* Revenue at Risk */}
                    <td className="px-4 py-4 text-right">
                      <span className={`text-sm font-semibold ${activeTab === "fixed" ? "text-emerald-400" : "text-red-400"}`}>
                        {formatCurrency(issue.estimatedLoss)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-center">
                      {activeTab === "needs-fix" ? (
                        issue.suggestedLink ? (
                          <button
                            onClick={() => handleMarkFixed(issue.id)}
                            disabled={markingFixedId === issue.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white transition"
                          >
                            {markingFixedId === issue.id ? (
                              "Marking..."
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                Mark Fixed
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            Find replacement first
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-emerald-400">
                          {issue.dateFixed
                            ? new Date(issue.dateFixed).toLocaleDateString()
                            : "Fixed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Copy Toast */}
      {copiedId && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-emerald-600 text-white rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 z-50">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Copied! Ready to paste into YouTube.</span>
        </div>
      )}
    </div>
  );
}
