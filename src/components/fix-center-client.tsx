"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Copy, Check, CheckCircle2, ExternalLink, RefreshCw, FileWarning, Lock, Eye, Pencil } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/revenue-estimator";
import { FindReplacementsButton } from "./find-replacements-button";
import Link from "next/link";

interface Issue {
  id: string;
  videoId: string;
  youtubeVideoId: string;
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

interface DisclosureIssue {
  id: string;
  videoId: string;
  youtubeVideoId: string;
  videoTitle: string;
  videoThumbnailUrl: string | null;
  videoViewCount: number;
  affiliateLinkCount: number;
  disclosureStatus: string;
  disclosureText: string | null;
  disclosurePosition: number | null;
  issue: string;
  description: string | null;
}

interface FixCenterClientProps {
  needsFixIssues: Issue[];
  fixedIssues: Issue[];
  disclosureIssues?: DisclosureIssue[];
  canUseAI?: boolean;
  canViewDisclosureDetails?: boolean;
  tier?: string;
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

export function FixCenterClient({
  needsFixIssues,
  fixedIssues,
  disclosureIssues = [],
  canUseAI = true,
  canViewDisclosureDetails = false,
  tier = "FREE",
}: FixCenterClientProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "disclosure" ? "disclosure" : "needs-fix";
  const [activeTab, setActiveTab] = useState<"needs-fix" | "fixed" | "disclosure">(initialTab);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [markingFixedId, setMarkingFixedId] = useState<string | null>(null);
  const [findingId, setFindingId] = useState<string | null>(null);
  const [viewingDescriptionId, setViewingDescriptionId] = useState<string | null>(null);
  const router = useRouter();

  // Handle tab changes from URL params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "disclosure") {
      setActiveTab("disclosure");
    }
  }, [searchParams]);

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
          Broken Links ({needsFixIssues.length})
        </button>
        <button
          onClick={() => setActiveTab("disclosure")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-1.5 ${
            activeTab === "disclosure"
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileWarning className="w-3.5 h-3.5" />
          Disclosure Issues ({disclosureIssues.length})
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

      {/* Disclosure Issues Tab */}
      {activeTab === "disclosure" && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur overflow-hidden">
          {disclosureIssues.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
              <p className="text-xl font-semibold text-white mb-2">No Disclosure Issues!</p>
              <p className="text-slate-400">
                All your videos with affiliate links have proper disclosures.
              </p>
            </div>
          ) : !canViewDisclosureDetails ? (
            // Free tier: show count but blur details
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8">
                <Lock className="w-12 h-12 text-slate-500 mb-4" />
                <p className="text-lg font-semibold text-white mb-2">
                  {disclosureIssues.length} video{disclosureIssues.length !== 1 ? "s" : ""} with disclosure issues
                </p>
                <p className="text-slate-400 text-center mb-4 max-w-md">
                  Upgrade to see which videos are missing FTC-compliant affiliate disclosures.
                </p>
                <Link
                  href="/settings"
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold text-white transition"
                >
                  Upgrade to View Details
                </Link>
              </div>
              {/* Blurred preview */}
              <div className="overflow-x-auto opacity-30 pointer-events-none">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Video</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Affiliate Links</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Issue</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-slate-700/30">
                        <td className="px-4 py-4"><div className="h-4 w-32 bg-slate-700 rounded" /></td>
                        <td className="px-4 py-4 text-center"><div className="h-4 w-8 bg-slate-700 rounded mx-auto" /></td>
                        <td className="px-4 py-4 text-center"><div className="h-6 w-20 bg-slate-700 rounded mx-auto" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-40 bg-slate-700 rounded" /></td>
                        <td className="px-4 py-4 text-center"><div className="h-8 w-24 bg-slate-700 rounded mx-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Video
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Affiliate Links
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Disclosure Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {disclosureIssues.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-700/20 transition">
                      {/* Video */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {item.videoThumbnailUrl ? (
                            <Image
                              src={item.videoThumbnailUrl}
                              alt={item.videoTitle}
                              width={64}
                              height={36}
                              className="rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-9 bg-slate-700 rounded flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate max-w-[180px]" title={item.videoTitle}>
                              {item.videoTitle.length > 40
                                ? item.videoTitle.slice(0, 40) + "..."
                                : item.videoTitle}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatNumber(item.videoViewCount)} views
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Affiliate Links Count */}
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-white font-medium">{item.affiliateLinkCount}</span>
                      </td>

                      {/* Disclosure Status Badge */}
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          item.disclosureStatus === "MISSING"
                            ? "bg-red-950/50 border border-red-600/50 text-red-400"
                            : item.disclosureStatus === "WEAK"
                            ? "bg-amber-950/50 border border-amber-600/50 text-amber-400"
                            : "bg-emerald-950/50 border border-emerald-600/50 text-emerald-400"
                        }`}>
                          {item.disclosureStatus === "MISSING" ? "Missing" :
                           item.disclosureStatus === "WEAK" ? "Weak" : "Compliant"}
                        </span>
                      </td>

                      {/* Issue Description */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-300">{item.issue}</p>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setViewingDescriptionId(viewingDescriptionId === item.id ? null : item.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
                        >
                          <Eye className="w-3 h-3" />
                          {viewingDescriptionId === item.id ? "Hide" : "View"} Description
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Description Modal/Expanded View */}
          {viewingDescriptionId && (
            <div className="border-t border-slate-700/50 p-6 bg-slate-900/50">
              {(() => {
                const item = disclosureIssues.find(d => d.id === viewingDescriptionId);
                if (!item) return null;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{item.videoTitle}</h3>
                      <button
                        onClick={() => setViewingDescriptionId(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                        {item.description ? (
                          item.disclosureText ? (
                            // Highlight disclosure text if found
                            <>
                              {item.description.slice(0, item.disclosurePosition || 0)}
                              <mark className="bg-amber-500/30 text-amber-300 px-1 rounded">
                                {item.disclosureText}
                              </mark>
                              {item.description.slice((item.disclosurePosition || 0) + (item.disclosureText?.length || 0))}
                            </>
                          ) : (
                            item.description
                          )
                        ) : (
                          <span className="text-slate-500 italic">No description available</span>
                        )}
                      </pre>
                    </div>
                    {item.disclosureStatus === "WEAK" && item.disclosurePosition && (
                      <p className="mt-3 text-sm text-amber-400">
                        Disclosure found at character {item.disclosurePosition}. FTC recommends placing disclosures in the first 200 characters.
                      </p>
                    )}
                    {item.disclosureStatus === "MISSING" && (
                      <p className="mt-3 text-sm text-red-400">
                        No affiliate disclosure found. Consider adding language like &quot;This description contains affiliate links&quot; near the top.
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Broken Links / Fixed Table */}
      {activeTab !== "disclosure" && (
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
                          <div className="flex items-center justify-center gap-2">
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
                            <a
                              href={`https://studio.youtube.com/video/${issue.youtubeVideoId}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
                              title="Edit in YouTube Studio (Tip: Use Ctrl+F to find the broken link)"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-300" />
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-slate-500 italic">
                              Find replacement first
                            </span>
                            <a
                              href={`https://studio.youtube.com/video/${issue.youtubeVideoId}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
                              title="Edit in YouTube Studio"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-300" />
                            </a>
                          </div>
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
      )}

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
