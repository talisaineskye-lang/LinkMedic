"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Copy, Check, CheckCircle2, ExternalLink, RefreshCw, FileWarning, Lock, Eye, Pencil, ChevronDown, ChevronRight, Layers, List, X, FileDown } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/revenue-estimator";

// Default FTC-compliant disclosure text
const DEFAULT_DISCLOSURE_TEXT = "DISCLOSURE: Some of the links above are affiliate links, meaning I may earn a commission if you make a purchase at no additional cost to you.";
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

interface GroupedIssue {
  originalUrl: string;
  linkIds: string[];
  videos: {
    id: string;
    youtubeVideoId: string;
    title: string;
    viewCount: number;
    thumbnailUrl: string | null;
  }[];
  totalRevenueAtRisk: number;
  suggestedLink: string | null;
  suggestedTitle: string | null;
  suggestedAsin: string | null;
  suggestedPrice: string | null;
  confidenceScore: number | null;
  status: string;
  merchant: string;
}

interface FixCenterClientProps {
  needsFixIssues: Issue[];
  fixedIssues: Issue[];
  groupedIssues: GroupedIssue[];
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

function IssueTypeBadge({ status }: { status: string }) {
  const getConfig = () => {
    switch (status) {
      case "NOT_FOUND":
        return { label: "404", color: "bg-red-950/50 border-red-600/50 text-red-400" };
      case "OOS":
        return { label: "Out of Stock", color: "bg-amber-950/50 border-amber-600/50 text-amber-400" };
      case "OOS_THIRD_PARTY":
        return { label: "3rd Party Only", color: "bg-orange-950/50 border-orange-600/50 text-orange-400" };
      case "SEARCH_REDIRECT":
        return { label: "Redirect", color: "bg-purple-950/50 border-purple-600/50 text-purple-400" };
      case "MISSING_TAG":
        return { label: "Missing Tag", color: "bg-blue-950/50 border-blue-600/50 text-blue-400" };
      default:
        return { label: status, color: "bg-slate-700/50 border-slate-600/50 text-slate-400" };
    }
  };

  const { label, color } = getConfig();

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${color}`}>
      {label}
    </span>
  );
}

export function FixCenterClient({
  needsFixIssues,
  fixedIssues,
  groupedIssues,
  disclosureIssues = [],
  canUseAI = true,
  canViewDisclosureDetails = false,
  tier = "FREE",
}: FixCenterClientProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "disclosure" ? "disclosure" : "needs-fix";
  const [activeTab, setActiveTab] = useState<"needs-fix" | "fixed" | "disclosure">(initialTab);
  const [viewMode, setViewMode] = useState<"grouped" | "by-video">("grouped");
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [markingFixedId, setMarkingFixedId] = useState<string | null>(null);
  const [markingAllFixedUrl, setMarkingAllFixedUrl] = useState<string | null>(null);
  const [findingId, setFindingId] = useState<string | null>(null);
  const [viewingDescriptionId, setViewingDescriptionId] = useState<string | null>(null);
  const [copiedDisclosureId, setCopiedDisclosureId] = useState<string | null>(null);
  const [dismissingDisclosureId, setDismissingDisclosureId] = useState<string | null>(null);
  const [downloadingFixScript, setDownloadingFixScript] = useState(false);
  const router = useRouter();

  const copyDisclosure = async (id: string) => {
    try {
      await navigator.clipboard.writeText(DEFAULT_DISCLOSURE_TEXT);
      setCopiedDisclosureId(id);
      setTimeout(() => setCopiedDisclosureId(null), 2000);
    } catch (err) {
      console.error("Failed to copy disclosure:", err);
    }
  };

  const handleDismissDisclosure = async (videoId: string) => {
    setDismissingDisclosureId(videoId);
    try {
      const response = await fetch("/api/videos/dismiss-disclosure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        throw new Error("Failed to dismiss disclosure issue");
      }

      router.refresh();
    } catch (error) {
      console.error("Error dismissing disclosure issue:", error);
      alert("Failed to dismiss disclosure issue");
    } finally {
      setDismissingDisclosureId(null);
    }
  };

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

  // Copy link AND open YouTube Studio in one action - REQUIRED, DO NOT REMOVE
  const copyAndOpenStudio = async (text: string, id: string, youtubeVideoId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      // Open YouTube Studio in new tab
      window.open(`https://studio.youtube.com/video/${youtubeVideoId}/edit`, '_blank');
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

  const handleMarkAllFixed = async (originalUrl: string, linkIds: string[]) => {
    setMarkingAllFixedUrl(originalUrl);
    try {
      const response = await fetch("/api/links/mark-fixed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark links as fixed");
      }

      router.refresh();
    } catch (error) {
      console.error("Error marking links as fixed:", error);
      alert("Failed to mark links as fixed");
    } finally {
      setMarkingAllFixedUrl(null);
    }
  };

  const toggleUrlExpanded = (url: string) => {
    setExpandedUrls(prev => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  // Download Fix Script for bulk fixing - REQUIRED, DO NOT REMOVE
  const handleDownloadFixScript = async (format?: "tubebuddy") => {
    setDownloadingFixScript(true);
    try {
      const url = format === "tubebuddy" ? "/api/export/fix-script?format=tubebuddy" : "/api/export/fix-script";
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        // Extract filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const defaultFilename = format === "tubebuddy"
          ? `LinkMedic_TubeBuddy_FixScript_${new Date().toISOString().split("T")[0]}.txt`
          : `LinkMedic_FixScript_${new Date().toISOString().split("T")[0]}.txt`;
        a.download = filenameMatch ? filenameMatch[1] : defaultFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to generate Fix Script");
      }
    } catch (error) {
      console.error("Error downloading fix script:", error);
      alert("Failed to download Fix Script");
    } finally {
      setDownloadingFixScript(false);
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
        <div className="flex items-center gap-3">
          {/* Download Fix Script buttons - paid tier only - REQUIRED, DO NOT REMOVE */}
          {tier !== "FREE" && needsFixIssues.length > 0 && (
            <>
              <button
                onClick={() => handleDownloadFixScript()}
                disabled={downloadingFixScript || !needsFixIssues.some(i => i.suggestedLink)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={needsFixIssues.some(i => i.suggestedLink) ? "Download standard fix script with YouTube Studio links" : "Run 'Find Replacements' first to generate suggestions"}
              >
                <FileDown className="w-4 h-4" />
                {downloadingFixScript ? "Generating..." : "Fix Script"}
              </button>
              <button
                onClick={() => handleDownloadFixScript("tubebuddy")}
                disabled={downloadingFixScript || !needsFixIssues.some(i => i.suggestedLink)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title={needsFixIssues.some(i => i.suggestedLink) ? "Download TubeBuddy-optimized fix script with video IDs" : "Run 'Find Replacements' first to generate suggestions"}
              >
                <FileDown className="w-4 h-4" />
                {downloadingFixScript ? "Generating..." : "TubeBuddy Script"}
              </button>
            </>
          )}
          {issuesNeedingReplacements > 0 && <FindReplacementsButton canUseAI={canUseAI} />}
        </div>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Suggested Disclosure
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
                              {formatNumber(item.videoViewCount)} views • {item.affiliateLinkCount} affiliate link{item.affiliateLinkCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Issue Description */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            item.disclosureStatus === "MISSING"
                              ? "bg-red-950/50 border border-red-600/50 text-red-400"
                              : "bg-amber-950/50 border border-amber-600/50 text-amber-400"
                          }`}>
                            {item.disclosureStatus === "MISSING" ? "Missing" : "Weak"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{item.issue}</p>
                      </td>

                      {/* Suggested Disclosure */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-300 max-w-[280px] line-clamp-2" title={DEFAULT_DISCLOSURE_TEXT}>
                          {DEFAULT_DISCLOSURE_TEXT}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => copyDisclosure(item.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                              copiedDisclosureId === item.id
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-700 hover:bg-slate-600 text-white"
                            }`}
                            title="Copy disclosure text to paste at the TOP of your video description"
                          >
                            {copiedDisclosureId === item.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                          <a
                            href={`https://studio.youtube.com/video/${item.youtubeVideoId}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
                            title="Edit in YouTube Studio"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </a>
                          <button
                            onClick={() => setViewingDescriptionId(viewingDescriptionId === item.id ? null : item.id)}
                            className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 transition"
                            title="View current description"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDismissDisclosure(item.id)}
                            disabled={dismissingDisclosureId === item.id}
                            className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-red-950/50 text-slate-400 hover:text-red-400 transition disabled:opacity-50"
                            title="Dismiss this issue"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
          {/* View Toggle - only show for needs-fix tab */}
          {activeTab === "needs-fix" && needsFixIssues.length > 0 && (
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">View:</span>
                <div className="flex gap-1 bg-slate-900/50 p-0.5 rounded-md">
                  <button
                    onClick={() => setViewMode("grouped")}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition flex items-center gap-1.5 ${
                      viewMode === "grouped"
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    By Unique Link
                  </button>
                  <button
                    onClick={() => setViewMode("by-video")}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition flex items-center gap-1.5 ${
                      viewMode === "by-video"
                        ? "bg-slate-700 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <List className="w-3 h-3" />
                    By Video
                  </button>
                </div>
              </div>
              {viewMode === "grouped" && (
                <span className="text-xs text-slate-500">
                  {groupedIssues.length} unique link{groupedIssues.length !== 1 ? "s" : ""} across {needsFixIssues.length} video{needsFixIssues.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {issues.length === 0 && activeTab === "fixed" ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
              <p className="text-xl font-semibold text-white mb-2">No Fixed Links Yet</p>
              <p className="text-slate-400">Links you mark as fixed will appear here.</p>
            </div>
          ) : needsFixIssues.length === 0 && activeTab === "needs-fix" ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
              <p className="text-xl font-semibold text-white mb-2">All Links Fixed!</p>
              <p className="text-slate-400">Great job! All your affiliate links are working properly.</p>
            </div>
          ) : activeTab === "needs-fix" && viewMode === "grouped" ? (
            /* Grouped View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Broken Link
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Issue Type
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Videos Affected
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      AI Suggestion
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Total Revenue at Risk
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {groupedIssues.map((group) => (
                    <tr key={group.originalUrl} className="hover:bg-slate-700/20 transition">
                      {/* Broken Link */}
                      <td className="px-4 py-4">
                        <a
                          href={group.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-red-400 hover:underline truncate block max-w-[180px]"
                          title={group.originalUrl}
                        >
                          {group.originalUrl.length > 40 ? group.originalUrl.slice(0, 40) + "..." : group.originalUrl}
                        </a>
                      </td>

                      {/* Issue Type */}
                      <td className="px-4 py-4 text-center">
                        <IssueTypeBadge status={group.status} />
                      </td>

                      {/* Videos Affected - Expandable */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleUrlExpanded(group.originalUrl)}
                          className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition mx-auto"
                        >
                          {expandedUrls.has(group.originalUrl) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span className="font-medium">{group.videos.length}</span>
                          <span className="text-slate-500">video{group.videos.length !== 1 ? "s" : ""}</span>
                        </button>
                        {expandedUrls.has(group.originalUrl) && (
                          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {group.videos.map((video) => (
                              <div key={video.id} className="flex items-center gap-2 text-xs">
                                <a
                                  href={`https://studio.youtube.com/video/${video.youtubeVideoId}/edit`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-emerald-400 truncate max-w-[150px] flex items-center gap-1"
                                  title={video.title}
                                >
                                  <Pencil className="w-3 h-3 flex-shrink-0" />
                                  {video.title.length > 25 ? video.title.slice(0, 25) + "..." : video.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* AI Suggestion */}
                      <td className="px-4 py-4">
                        {group.suggestedLink && group.suggestedTitle ? (
                          <div className="space-y-1">
                            <p
                              className="text-sm text-emerald-400 font-medium max-w-[200px] truncate"
                              title={group.suggestedTitle}
                            >
                              {group.suggestedTitle.length > 40
                                ? group.suggestedTitle.slice(0, 40) + "..."
                                : group.suggestedTitle}
                            </p>
                            <div className="flex items-center gap-2">
                              {group.suggestedPrice && (
                                <span className="text-xs text-slate-400">{group.suggestedPrice}</span>
                              )}
                              <button
                                onClick={() => copyToClipboard(group.suggestedLink!, group.originalUrl)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-slate-700/50 hover:bg-emerald-950/50 text-slate-300 hover:text-emerald-400 transition"
                              >
                                {copiedId === group.originalUrl ? (
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
                                href={group.suggestedLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-slate-700/50 hover:bg-slate-600/50 transition"
                                title="Preview product"
                              >
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                              <button
                                onClick={() => handleFindReplacement(group.linkIds[0])}
                                disabled={findingId === group.linkIds[0]}
                                className="p-1 rounded bg-slate-700/50 hover:bg-slate-600/50 transition"
                                title="Re-scan for new suggestion"
                              >
                                <RefreshCw className={`w-3 h-3 text-slate-400 ${findingId === group.linkIds[0] ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleFindReplacement(group.linkIds[0])}
                            disabled={findingId === group.linkIds[0]}
                            className="text-sm text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition disabled:opacity-50"
                          >
                            {findingId === group.linkIds[0] ? (
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
                        )}
                      </td>

                      {/* Confidence Score */}
                      <td className="px-4 py-4 text-center">
                        {group.suggestedLink ? (
                          <ConfidenceBadge score={group.confidenceScore} />
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </td>

                      {/* Total Revenue at Risk */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-red-400">
                          {formatCurrency(group.totalRevenueAtRisk)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4 text-center">
                        {group.suggestedLink ? (
                          <div className="flex flex-col items-center gap-2">
                            {/* Copy & Edit button - copies link AND opens YouTube Studio - REQUIRED, DO NOT REMOVE */}
                            <div className="flex items-center gap-2">
                              {group.videos.length === 1 ? (
                                <button
                                  onClick={() => copyAndOpenStudio(group.suggestedLink!, `action-${group.originalUrl}`, group.videos[0].youtubeVideoId)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                    copiedId === `action-${group.originalUrl}`
                                      ? "bg-emerald-600 text-white"
                                      : "bg-slate-700 hover:bg-slate-600 text-white"
                                  }`}
                                  title="Copy replacement link and open YouTube Studio (use Ctrl+F to find broken link)"
                                >
                                  {copiedId === `action-${group.originalUrl}` ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      Copy & Edit
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => copyToClipboard(group.suggestedLink!, `action-${group.originalUrl}`)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                    copiedId === `action-${group.originalUrl}`
                                      ? "bg-emerald-600 text-white"
                                      : "bg-slate-700 hover:bg-slate-600 text-white"
                                  }`}
                                  title="Copy replacement link to clipboard"
                                >
                                  {copiedId === `action-${group.originalUrl}` ? (
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
                              )}
                            </div>
                            {/* Mark Fixed button */}
                            <button
                              onClick={() => handleMarkAllFixed(group.originalUrl, group.linkIds)}
                              disabled={markingAllFixedUrl === group.originalUrl}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white transition"
                            >
                              {markingAllFixedUrl === group.originalUrl ? (
                                "Marking..."
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Mark All Fixed ({group.linkIds.length})
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-slate-500 italic">
                              Find replacement first
                            </span>
                            {group.videos.length === 1 && (
                              <a
                                href={`https://studio.youtube.com/video/${group.videos[0].youtubeVideoId}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
                                title="Edit in YouTube Studio"
                              >
                                <Pencil className="w-3 h-3" />
                                Edit in Studio
                              </a>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
          /* By-Video View (original table) */
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
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Issue Type
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

                    {/* Issue Type */}
                    <td className="px-4 py-4 text-center">
                      <IssueTypeBadge status={issue.status} />
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
                            {activeTab === "needs-fix" && (
                              <button
                                onClick={() => handleFindReplacement(issue.id)}
                                disabled={findingId === issue.id}
                                className="p-1 rounded bg-slate-700/50 hover:bg-slate-600/50 transition"
                                title="Re-scan for new suggestion"
                              >
                                <RefreshCw className={`w-3 h-3 text-slate-400 ${findingId === issue.id ? 'animate-spin' : ''}`} />
                              </button>
                            )}
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
                          <div className="flex flex-col items-center gap-2">
                            {/* Copy & Edit button - copies link AND opens YouTube Studio - REQUIRED, DO NOT REMOVE */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyAndOpenStudio(issue.suggestedLink!, `action-${issue.id}`, issue.youtubeVideoId)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                  copiedId === `action-${issue.id}`
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-700 hover:bg-slate-600 text-white"
                                }`}
                                title="Copy replacement link and open YouTube Studio (use Ctrl+F to find broken link)"
                              >
                                {copiedId === `action-${issue.id}` ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Copy & Edit
                                  </>
                                )}
                              </button>
                            </div>
                            {/* Mark Fixed button */}
                            <button
                              onClick={() => handleMarkFixed(issue.id)}
                              disabled={markingFixedId === issue.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white transition"
                            >
                              {markingFixedId === issue.id ? (
                                "Marking..."
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Mark Fixed
                                </>
                              )}
                            </button>
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
                              title="Edit in YouTube Studio"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit in Studio
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
