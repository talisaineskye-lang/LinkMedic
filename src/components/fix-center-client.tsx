"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Copy, Check, CheckCircle2, ExternalLink, RefreshCw, FileWarning, Lock, Eye, Pencil, ChevronDown, ChevronRight, Layers, List, X, FileDown, Trash2, Undo2, Search } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/revenue-estimator";
import { DISCLOSURE_TEMPLATES } from "@/lib/disclosure-detector";
import { NETWORK_DISPLAY_NAMES, AffiliateMerchant } from "@/lib/affiliate-networks";
import { FindReplacementsButton } from "./find-replacements-button";
import { FindReplacement } from "./find-replacement";
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
  amazonRegion?: string | null;
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
  amazonRegion?: string | null;
}

interface UserTags {
  US: string | null;
  UK: string | null;
  CA: string | null;
  DE: string | null;
}

interface FixCenterClientProps {
  needsFixIssues: Issue[];
  fixedIssues: Issue[];
  groupedIssues: GroupedIssue[];
  disclosureIssues?: DisclosureIssue[];
  canUseAI?: boolean;
  canViewDisclosureDetails?: boolean;
  tier?: string;
  userTags?: UserTags;
}

function ConfidenceBadge({ score }: { score: number | null }) {
  if (score === null) return null;

  const getColor = () => {
    if (score >= 85) return "bg-profit-green/20 border-profit-green/50 text-profit-green";
    if (score >= 60) return "bg-orange-500/20 border-orange-500/50 text-orange-400";
    return "bg-yt-gray border-white/20 text-yt-light";
  };

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded border ${getColor()}`}>
      {score}%
    </span>
  );
}

function IssueTypeBadge({ status }: { status: string }) {
  const getConfig = () => {
    switch (status) {
      case "NOT_FOUND":
        return { label: "404", color: "bg-emergency-red/20 border-emergency-red/50 text-emergency-red" };
      case "OOS":
        return { label: "Out of Stock", color: "bg-orange-500/20 border-orange-500/50 text-orange-400" };
      case "OOS_THIRD_PARTY":
        return { label: "3rd Party Only", color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" };
      case "SEARCH_REDIRECT":
        return { label: "Redirect", color: "bg-orange-500/20 border-orange-500/50 text-orange-400" };
      case "MISSING_TAG":
        return { label: "Missing Tag", color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" };
      default:
        return { label: status, color: "bg-yt-gray border-white/20 text-yt-light" };
    }
  };

  const { label, color } = getConfig();

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded border ${color}`}>
      {label}
    </span>
  );
}

function NetworkBadge({ merchant }: { merchant: string }) {
  const getConfig = () => {
    switch (merchant as AffiliateMerchant) {
      case "amazon":
        return { color: "bg-orange-500/20 border-orange-500/50 text-orange-400" };
      case "bhphoto":
        return { color: "bg-blue-500/20 border-blue-500/50 text-blue-400" };
      case "impact":
        return { color: "bg-purple-500/20 border-purple-500/50 text-purple-400" };
      case "cj":
        return { color: "bg-green-500/20 border-green-500/50 text-green-400" };
      case "rakuten":
        return { color: "bg-red-500/20 border-red-500/50 text-red-400" };
      case "shareasale":
        return { color: "bg-teal-500/20 border-teal-500/50 text-teal-400" };
      case "awin":
        return { color: "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" };
      default:
        return { color: "bg-yt-gray border-white/20 text-yt-light" };
    }
  };

  const displayName = NETWORK_DISPLAY_NAMES[merchant as AffiliateMerchant] || merchant;
  const { color } = getConfig();

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${color}`}>
      {displayName}
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
  tier = "AUDITOR",
  userTags = { US: null, UK: null, CA: null, DE: null },
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
  const [dismissingAllDisclosures, setDismissingAllDisclosures] = useState(false);
  const [dismissingLinkId, setDismissingLinkId] = useState<string | null>(null);
  const [dismissingAllUrl, setDismissingAllUrl] = useState<string | null>(null);
  const [downloadingExport, setDownloadingExport] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [undoingLinkId, setUndoingLinkId] = useState<string | null>(null);
  const [showDisclosureMenu, setShowDisclosureMenu] = useState<string | null>(null);
  const [showReplacementFor, setShowReplacementFor] = useState<string | null>(null);
  const router = useRouter();

  // Group fixed links by date
  const groupedFixedByDate = fixedIssues.reduce((acc, link) => {
    const date = link.dateFixed
      ? new Date(link.dateFixed).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      : 'Unknown Date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(link);
    return acc;
  }, {} as Record<string, Issue[]>);

  // Sort dates descending (newest first)
  const sortedFixedDates = Object.keys(groupedFixedByDate).sort((a, b) => {
    if (a === 'Unknown Date') return 1;
    if (b === 'Unknown Date') return -1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  // Initialize expandedDates with the most recent date on first render
  useEffect(() => {
    if (sortedFixedDates.length > 0 && expandedDates.size === 0) {
      setExpandedDates(new Set([sortedFixedDates[0]]));
    }
  }, [sortedFixedDates.length]);

  const toggleDateExpanded = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const handleUndoFix = async (linkId: string) => {
    setUndoingLinkId(linkId);
    try {
      const response = await fetch("/api/links/undo-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });

      if (!response.ok) {
        throw new Error("Failed to undo fix");
      }

      router.refresh();
    } catch (error) {
      console.error("Error undoing fix:", error);
      alert("Failed to undo fix");
    } finally {
      setUndoingLinkId(null);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showExportMenu && !(e.target as Element).closest('.export-dropdown')) {
        setShowExportMenu(false);
      }
      if (showDisclosureMenu && !(e.target as Element).closest('.disclosure-dropdown')) {
        setShowDisclosureMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu, showDisclosureMenu]);

  const copyDisclosure = async (id: string, template: "standard" | "short" = "standard") => {
    try {
      const text = DISCLOSURE_TEMPLATES[template];
      await navigator.clipboard.writeText(text);
      setCopiedDisclosureId(id);
      setShowDisclosureMenu(null);
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

  const handleDismissAllDisclosures = async () => {
    if (disclosureIssues.length === 0) return;

    if (!confirm(`Dismiss all ${disclosureIssues.length} disclosure issue${disclosureIssues.length !== 1 ? "s" : ""}? This cannot be undone.`)) {
      return;
    }

    setDismissingAllDisclosures(true);
    try {
      const videoIds = disclosureIssues.map((item) => item.id);
      const response = await fetch("/api/videos/dismiss-disclosure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to dismiss disclosure issues");
      }

      router.refresh();
    } catch (error) {
      console.error("Error dismissing all disclosure issues:", error);
      alert("Failed to dismiss disclosure issues");
    } finally {
      setDismissingAllDisclosures(false);
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

  const handleDismissLink = async (id: string) => {
    setDismissingLinkId(id);
    try {
      const response = await fetch("/api/links/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to dismiss link");
      }

      router.refresh();
    } catch (error) {
      console.error("Error dismissing link:", error);
      alert("Failed to dismiss link");
    } finally {
      setDismissingLinkId(null);
    }
  };

  const handleDismissAllLinks = async (originalUrl: string, linkIds: string[]) => {
    setDismissingAllUrl(originalUrl);
    try {
      const response = await fetch("/api/links/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to dismiss links");
      }

      router.refresh();
    } catch (error) {
      console.error("Error dismissing links:", error);
      alert("Failed to dismiss links");
    } finally {
      setDismissingAllUrl(null);
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

  // Download exports in various formats - REQUIRED, DO NOT REMOVE
  const handleDownloadExport = async (format: "tubebuddy" | "csv" | "manual") => {
    setDownloadingExport(true);
    setShowExportMenu(false);
    try {
      // Build URL based on format
      let url: string;
      if (format === "csv") {
        url = "/api/links/export-csv";
      } else if (format === "tubebuddy") {
        url = "/api/export/fix-script?format=tubebuddy";
      } else {
        // "manual" uses the default fix script format (no format parameter)
        url = "/api/export/fix-script";
      }

      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        // Extract filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const date = new Date().toISOString().split("T")[0];
        const defaultFilenames: Record<string, string> = {
          tubebuddy: `LinkMedic_TubeBuddy_${date}.txt`,
          csv: `LinkMedic_Export_${date}.csv`,
          manual: `LinkMedic_FixScript_${date}.txt`,
        };
        a.download = filenameMatch ? filenameMatch[1] : defaultFilenames[format];
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to generate export");
      }
    } catch (error) {
      console.error("Error downloading export:", error);
      alert("Failed to download export");
    } finally {
      setDownloadingExport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-3xl tracking-wide">FIX CENTER</h1>
          <p className="text-yt-light mt-1">
            {needsFixIssues.length} broken link{needsFixIssues.length !== 1 ? "s" : ""}
            {totalLoss > 0 && (
              <> losing <span className="text-emergency-red font-semibold">{formatCurrency(totalLoss)}</span>/month</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export dropdown - paid tier only - REQUIRED, DO NOT REMOVE */}
          {tier !== "TRIAL" && tier !== "AUDITOR" && needsFixIssues.length > 0 && (
            <div className="relative export-dropdown">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={downloadingExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-yt-gray hover:bg-white/5 border border-white/20 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                {downloadingExport ? "Exporting..." : "Export"}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-yt-gray rounded-xl shadow-lg border border-white/10 z-20 overflow-hidden">
                  <button
                    onClick={() => handleDownloadExport("tubebuddy")}
                    disabled={!needsFixIssues.some(i => i.suggestedLink)}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-white flex items-center gap-2">
                      <span>📋</span> TubeBuddy (Bulk Fix)
                    </div>
                    <div className="text-xs text-yt-light mt-0.5">Fix all videos at once with Find & Replace</div>
                  </button>

                  <button
                    onClick={() => handleDownloadExport("csv")}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition border-t border-white/10"
                  >
                    <div className="font-medium text-white flex items-center gap-2">
                      <span>📊</span> CSV Spreadsheet
                    </div>
                    <div className="text-xs text-yt-light mt-0.5">Open in Excel or Google Sheets</div>
                  </button>

                  <button
                    onClick={() => handleDownloadExport("manual")}
                    disabled={!needsFixIssues.some(i => i.suggestedLink)}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition border-t border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-white flex items-center gap-2">
                      <span>📄</span> Fix Script (Manual)
                    </div>
                    <div className="text-xs text-yt-light mt-0.5">Step-by-step with YouTube Studio links</div>
                  </button>
                </div>
              )}
            </div>
          )}
          {issuesNeedingReplacements > 0 && <FindReplacementsButton canUseAI={canUseAI} />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-yt-gray/70 backdrop-blur-sm p-1 rounded-xl w-fit border border-white/10">
        <button
          onClick={() => setActiveTab("needs-fix")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "needs-fix"
              ? "bg-emergency-red/20 text-emergency-red border border-emergency-red/30"
              : "text-yt-light hover:text-white"
          }`}
        >
          Broken Links ({needsFixIssues.length})
        </button>
        <button
          onClick={() => setActiveTab("disclosure")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-1.5 ${
            activeTab === "disclosure"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "text-yt-light hover:text-white"
          }`}
        >
          <FileWarning className="w-3.5 h-3.5" />
          Disclosure Issues ({disclosureIssues.length})
        </button>
        <button
          onClick={() => setActiveTab("fixed")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "fixed"
              ? "bg-profit-green/20 text-profit-green border border-profit-green/30"
              : "text-yt-light hover:text-white"
          }`}
        >
          Fixed ({fixedIssues.length})
        </button>
      </div>

      {/* Disclosure Issues Tab */}
      {activeTab === "disclosure" && (
        <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {disclosureIssues.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-profit-green mb-4" />
              <p className="text-xl font-semibold text-white mb-2">No Disclosure Issues!</p>
              <p className="text-yt-light">
                All your videos with affiliate links have proper disclosures.
              </p>
            </div>
          ) : !canViewDisclosureDetails ? (
            // Free tier: show count but blur details
            <div className="relative">
              <div className="absolute inset-0 bg-yt-dark/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8">
                <Lock className="w-12 h-12 text-yt-light/50 mb-4" />
                <p className="text-lg font-semibold text-white mb-2">
                  {disclosureIssues.length} video{disclosureIssues.length !== 1 ? "s" : ""} with disclosure issues
                </p>
                <p className="text-yt-light text-center mb-4 max-w-md">
                  Upgrade to see which videos are missing FTC-compliant affiliate disclosures.
                </p>
                <Link
                  href="/settings"
                  className="px-6 py-3 bg-profit-green hover:brightness-110 rounded-lg font-bold text-black transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
                >
                  Upgrade to View Details
                </Link>
              </div>
              {/* Blurred preview */}
              <div className="overflow-x-auto opacity-30 pointer-events-none">
                <table className="w-full">
                  <thead className="bg-yt-dark/50 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase">Video</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase">Affiliate Links</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase">Issue</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-4 py-4"><div className="h-4 w-32 bg-yt-gray rounded" /></td>
                        <td className="px-4 py-4 text-center"><div className="h-4 w-8 bg-yt-gray rounded mx-auto" /></td>
                        <td className="px-4 py-4 text-center"><div className="h-6 w-20 bg-yt-gray rounded mx-auto" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-40 bg-yt-gray rounded" /></td>
                        <td className="px-4 py-4 text-center"><div className="h-8 w-24 bg-yt-gray rounded mx-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yt-dark/50 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase tracking-wider">
                      Video
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase tracking-wider">
                      Suggested Disclosure
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <span>Action</span>
                        {disclosureIssues.length > 1 && (
                          <button
                            onClick={handleDismissAllDisclosures}
                            disabled={dismissingAllDisclosures}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-yt-gray hover:bg-emergency-red/20 hover:text-emergency-red text-yt-light transition disabled:opacity-50"
                            title="Dismiss all disclosure issues"
                          >
                            {dismissingAllDisclosures ? (
                              "Dismissing..."
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3" />
                                Dismiss All
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {disclosureIssues.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition">
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
                            <div className="w-16 h-9 bg-yt-gray rounded flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate max-w-[180px]" title={item.videoTitle}>
                              {item.videoTitle.length > 40
                                ? item.videoTitle.slice(0, 40) + "..."
                                : item.videoTitle}
                            </p>
                            <p className="text-xs text-yt-light/50">
                              {formatNumber(item.videoViewCount)} views • {item.affiliateLinkCount} affiliate link{item.affiliateLinkCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Issue Description */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded border ${
                            item.disclosureStatus === "MISSING"
                              ? "bg-emergency-red/20 border-emergency-red/50 text-emergency-red"
                              : "bg-orange-500/20 border-orange-500/50 text-orange-400"
                          }`}>
                            {item.disclosureStatus === "MISSING" ? "Missing" : "Weak"}
                          </span>
                        </div>
                        <p className="text-sm text-yt-light mt-1">{item.issue}</p>
                      </td>

                      {/* Suggested Disclosure */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-yt-light/70 max-w-[280px] line-clamp-2" title={DISCLOSURE_TEMPLATES.standard}>
                          {DISCLOSURE_TEMPLATES.standard}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Copy Disclosure Dropdown */}
                          <div className="relative disclosure-dropdown">
                            {copiedDisclosureId === item.id ? (
                              <button
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-profit-green text-black"
                              >
                                <Check className="w-3 h-3" />
                                Copied!
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => setShowDisclosureMenu(showDisclosureMenu === item.id ? null : item.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-yt-gray hover:bg-white/10 border border-white/20 text-white transition"
                                  title="Copy disclosure text to paste at the TOP of your video description"
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                {showDisclosureMenu === item.id && (
                                  <div className="absolute left-0 mt-1 w-64 bg-yt-gray rounded-xl shadow-lg border border-white/10 z-20 overflow-hidden">
                                    <button
                                      onClick={() => copyDisclosure(item.id, "standard")}
                                      className="w-full px-3 py-2 text-left hover:bg-white/5 transition"
                                    >
                                      <div className="font-medium text-white text-xs">Standard (Recommended)</div>
                                      <div className="text-xs text-yt-light mt-0.5 line-clamp-2">
                                        {DISCLOSURE_TEMPLATES.standard}
                                      </div>
                                    </button>
                                    <button
                                      onClick={() => copyDisclosure(item.id, "short")}
                                      className="w-full px-3 py-2 text-left hover:bg-white/5 transition border-t border-white/10"
                                    >
                                      <div className="font-medium text-white text-xs">Short</div>
                                      <div className="text-xs text-yt-light mt-0.5 line-clamp-2">
                                        {DISCLOSURE_TEMPLATES.short}
                                      </div>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <a
                            href={`https://studio.youtube.com/video/${item.youtubeVideoId}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-yt-gray hover:bg-white/10 border border-white/20 text-white transition"
                            title="Edit in YouTube Studio"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </a>
                          <button
                            onClick={() => setViewingDescriptionId(viewingDescriptionId === item.id ? null : item.id)}
                            className="p-1.5 rounded-lg bg-yt-gray/50 hover:bg-white/10 text-yt-light transition"
                            title="View current description"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDismissDisclosure(item.id)}
                            disabled={dismissingDisclosureId === item.id}
                            className="p-1.5 rounded-lg bg-yt-gray/50 hover:bg-emergency-red/20 text-yt-light hover:text-emergency-red transition disabled:opacity-50"
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
            <div className="border-t border-white/10 p-6 bg-yt-dark/50">
              {(() => {
                const item = disclosureIssues.find(d => d.id === viewingDescriptionId);
                if (!item) return null;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{item.videoTitle}</h3>
                      <button
                        onClick={() => setViewingDescriptionId(null)}
                        className="text-yt-light hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                    <div className="bg-yt-gray rounded-xl p-4 max-h-64 overflow-y-auto border border-white/10">
                      <pre className="text-sm text-yt-light/70 whitespace-pre-wrap font-sans">
                        {item.description ? (
                          item.disclosureText ? (
                            // Highlight disclosure text if found
                            <>
                              {item.description.slice(0, item.disclosurePosition || 0)}
                              <mark className="bg-orange-500/30 text-orange-300 px-1 rounded">
                                {item.disclosureText}
                              </mark>
                              {item.description.slice((item.disclosurePosition || 0) + (item.disclosureText?.length || 0))}
                            </>
                          ) : (
                            item.description
                          )
                        ) : (
                          <span className="text-yt-light/50 italic">No description available</span>
                        )}
                      </pre>
                    </div>
                    {item.disclosureStatus === "WEAK" && item.disclosurePosition && (
                      <p className="mt-3 text-sm text-orange-400">
                        Disclosure found at character {item.disclosurePosition}. FTC recommends placing disclosures in the first 200 characters.
                      </p>
                    )}
                    {item.disclosureStatus === "MISSING" && (
                      <p className="mt-3 text-sm text-emergency-red">
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
        <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {/* View Toggle - only show for needs-fix tab */}
          {activeTab === "needs-fix" && needsFixIssues.length > 0 && (
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-yt-light">View:</span>
                <div className="flex gap-1 bg-yt-dark/50 p-0.5 rounded-lg">
                  <button
                    onClick={() => setViewMode("grouped")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                      viewMode === "grouped"
                        ? "bg-yt-gray text-white"
                        : "text-yt-light hover:text-white"
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    By Unique Link
                  </button>
                  <button
                    onClick={() => setViewMode("by-video")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                      viewMode === "by-video"
                        ? "bg-yt-gray text-white"
                        : "text-yt-light hover:text-white"
                    }`}
                  >
                    <List className="w-3 h-3" />
                    By Video
                  </button>
                </div>
              </div>
              {viewMode === "grouped" && (
                <span className="text-xs text-yt-light/50">
                  {groupedIssues.length} unique link{groupedIssues.length !== 1 ? "s" : ""} across {needsFixIssues.length} video{needsFixIssues.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {issues.length === 0 && activeTab === "fixed" ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-profit-green mb-4" />
              <p className="text-xl font-semibold text-white mb-2">No Fixed Links Yet</p>
              <p className="text-yt-light">Links you mark as fixed will appear here.</p>
            </div>
          ) : needsFixIssues.length === 0 && activeTab === "needs-fix" ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-profit-green mb-4" />
              <p className="text-xl font-semibold text-white mb-2">All Links Fixed!</p>
              <p className="text-yt-light">Great job! All your affiliate links are working properly.</p>
            </div>
          ) : activeTab === "fixed" ? (
            /* Fixed Links Grouped by Date */
            <div className="divide-y divide-white/5">
              {sortedFixedDates.map((date) => {
                const linksForDate = groupedFixedByDate[date];
                const isExpanded = expandedDates.has(date);

                return (
                  <div key={date}>
                    {/* Date Header - Collapsible */}
                    <button
                      onClick={() => toggleDateExpanded(date)}
                      className="w-full px-4 py-3 flex justify-between items-center hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-yt-light" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-yt-light" />
                        )}
                        <span className="font-medium text-white">{date}</span>
                      </div>
                      <span className="text-sm text-yt-light">
                        {linksForDate.length} link{linksForDate.length !== 1 ? "s" : ""} fixed
                      </span>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="bg-yt-dark/30">
                        {linksForDate.map((link) => (
                          <div
                            key={link.id}
                            className="px-4 py-3 flex items-center justify-between border-t border-white/5 hover:bg-white/5 transition"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Video Thumbnail */}
                              {link.videoThumbnailUrl ? (
                                <Image
                                  src={link.videoThumbnailUrl}
                                  alt={link.videoTitle}
                                  width={48}
                                  height={27}
                                  className="rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-7 bg-yt-gray rounded flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-white font-medium truncate" title={link.videoTitle}>
                                  {link.videoTitle.length > 50
                                    ? link.videoTitle.slice(0, 50) + "..."
                                    : link.videoTitle}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-yt-light/50 truncate max-w-[200px]" title={link.url}>
                                    {link.url.length > 40 ? link.url.slice(0, 40) + "..." : link.url}
                                  </span>
                                  {link.suggestedTitle && (
                                    <>
                                      <span className="text-xs text-yt-light/30">→</span>
                                      <span className="text-xs text-profit-green truncate max-w-[200px]" title={link.suggestedTitle}>
                                        {link.suggestedTitle.length > 30
                                          ? link.suggestedTitle.slice(0, 30) + "..."
                                          : link.suggestedTitle}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              <span className="text-sm font-medium text-profit-green">
                                {formatCurrency(link.estimatedLoss)}
                              </span>
                              <button
                                onClick={() => handleUndoFix(link.id)}
                                disabled={undoingLinkId === link.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-yt-gray hover:bg-emergency-red/20 hover:text-emergency-red text-yt-light transition disabled:opacity-50"
                                title="Undo fix (move back to Broken Links)"
                              >
                                {undoingLinkId === link.id ? (
                                  "..."
                                ) : (
                                  <>
                                    <Undo2 className="w-3 h-3" />
                                    Undo
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : activeTab === "needs-fix" && viewMode === "grouped" ? (
            /* Grouped View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yt-dark/50 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase tracking-wider">
                      Broken Link
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase tracking-wider">
                      Issue Type
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase tracking-wider">
                      Videos Affected
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase tracking-wider">
                      AI Suggestion
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-yt-light uppercase tracking-wider">
                      Total Revenue at Risk
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {groupedIssues.map((group) => (
                    <React.Fragment key={group.originalUrl}>
                    <tr className="hover:bg-white/5 transition">
                      {/* Broken Link */}
                      <td className="px-4 py-4">
                        <a
                          href={group.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-emergency-red hover:underline truncate block max-w-[180px]"
                          title={group.originalUrl}
                        >
                          {group.originalUrl.length > 40 ? group.originalUrl.slice(0, 40) + "..." : group.originalUrl}
                        </a>
                      </td>

                      {/* Issue Type + Network */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <IssueTypeBadge status={group.status} />
                          <NetworkBadge merchant={group.merchant} />
                        </div>
                      </td>

                      {/* Videos Affected - Expandable */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleUrlExpanded(group.originalUrl)}
                          className="flex items-center gap-1.5 text-sm text-yt-light/70 hover:text-white transition mx-auto"
                        >
                          {expandedUrls.has(group.originalUrl) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span className="font-medium">{group.videos.length}</span>
                          <span className="text-yt-light/50">video{group.videos.length !== 1 ? "s" : ""}</span>
                        </button>
                        {expandedUrls.has(group.originalUrl) && (
                          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {group.videos.map((video) => (
                              <div key={video.id} className="flex items-center gap-2 text-xs">
                                <a
                                  href={`https://studio.youtube.com/video/${video.youtubeVideoId}/edit`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-yt-light hover:text-profit-green truncate max-w-[150px] flex items-center gap-1"
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
                              className="text-sm text-profit-green font-medium max-w-[200px] truncate"
                              title={group.suggestedTitle}
                            >
                              {group.suggestedTitle.length > 40
                                ? group.suggestedTitle.slice(0, 40) + "..."
                                : group.suggestedTitle}
                            </p>
                            <div className="flex items-center gap-2">
                              {group.suggestedPrice && (
                                <span className="text-xs text-yt-light">{group.suggestedPrice}</span>
                              )}
                              <button
                                onClick={() => copyAndOpenStudio(group.suggestedLink!, group.originalUrl, group.videos[0].youtubeVideoId)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-yt-gray/50 hover:bg-profit-green/20 text-yt-light/70 hover:text-profit-green transition"
                                title="Copy link and open YouTube Studio"
                              >
                                {copiedId === group.originalUrl ? (
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
                              <a
                                href={group.suggestedLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-yt-gray/50 hover:bg-white/10 transition"
                                title="Preview product"
                              >
                                <ExternalLink className="w-3 h-3 text-yt-light" />
                              </a>
                              <button
                                onClick={() => handleFindReplacement(group.linkIds[0])}
                                disabled={findingId === group.linkIds[0]}
                                className="p-1 rounded bg-yt-gray/50 hover:bg-white/10 transition"
                                title="Re-scan for new suggestion"
                              >
                                <RefreshCw className={`w-3 h-3 text-yt-light ${findingId === group.linkIds[0] ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleFindReplacement(group.linkIds[0])}
                            disabled={findingId === group.linkIds[0]}
                            className="text-sm text-yt-light hover:text-profit-green flex items-center gap-1 transition disabled:opacity-50"
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
                          <span className="text-xs text-yt-light/50">-</span>
                        )}
                      </td>

                      {/* Total Revenue at Risk */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-emergency-red">
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
                                      ? "bg-profit-green text-black"
                                      : "bg-yt-gray hover:bg-white/10 border border-white/20 text-white"
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
                                  onClick={() => copyAndOpenStudio(group.suggestedLink!, `action-${group.originalUrl}`, group.videos[0].youtubeVideoId)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                    copiedId === `action-${group.originalUrl}`
                                      ? "bg-profit-green text-black"
                                      : "bg-yt-gray hover:bg-white/10 border border-white/20 text-white"
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
                              )}
                            </div>
                            {/* Mark Fixed button */}
                            <button
                              onClick={() => handleMarkAllFixed(group.originalUrl, group.linkIds)}
                              disabled={markingAllFixedUrl === group.originalUrl}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-profit-green hover:brightness-110 disabled:bg-yt-gray text-black transition shadow-[0_0_15px_rgba(0,255,0,0.15)]"
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
                            {/* Dismiss button */}
                            <button
                              onClick={() => handleDismissAllLinks(group.originalUrl, group.linkIds)}
                              disabled={dismissingAllUrl === group.originalUrl}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-yt-gray hover:bg-emergency-red/20 hover:text-emergency-red text-yt-light transition disabled:opacity-50"
                              title="Dismiss this link (can't be fixed)"
                            >
                              {dismissingAllUrl === group.originalUrl ? (
                                "Dismissing..."
                              ) : (
                                <>
                                  <Trash2 className="w-3 h-3" />
                                  Dismiss
                                </>
                              )}
                            </button>
                            {/* Manual Search Toggle */}
                            <button
                              onClick={() => setShowReplacementFor(
                                showReplacementFor === group.originalUrl ? null : group.originalUrl
                              )}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                showReplacementFor === group.originalUrl
                                  ? "bg-white/10 text-white border border-white/30"
                                  : "bg-yt-gray hover:bg-white/10 border border-white/20 text-yt-light hover:text-white"
                              }`}
                              title="Search Amazon manually for a replacement"
                            >
                              <Search className="w-3 h-3" />
                              {showReplacementFor === group.originalUrl ? "Hide" : "Search"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            {/* Manual Search Toggle Button */}
                            <button
                              onClick={() => setShowReplacementFor(
                                showReplacementFor === group.originalUrl ? null : group.originalUrl
                              )}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                showReplacementFor === group.originalUrl
                                  ? "bg-white/10 text-white border border-white/30"
                                  : "bg-yt-gray hover:bg-white/10 border border-white/20 text-yt-light hover:text-white"
                              }`}
                            >
                              <Search className="w-3 h-3" />
                              {showReplacementFor === group.originalUrl ? "Hide Search" : "Manual Search"}
                            </button>
                            <div className="flex items-center gap-2">
                              {group.videos.length === 1 && (
                                <a
                                  href={`https://studio.youtube.com/video/${group.videos[0].youtubeVideoId}/edit`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-yt-gray hover:bg-white/10 border border-white/20 text-white transition"
                                  title="Edit in YouTube Studio"
                                >
                                  <Pencil className="w-3 h-3" />
                                  Edit in Studio
                                </a>
                              )}
                              {/* Dismiss button for links without suggestions */}
                              <button
                                onClick={() => handleDismissAllLinks(group.originalUrl, group.linkIds)}
                                disabled={dismissingAllUrl === group.originalUrl}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-yt-gray hover:bg-emergency-red/20 hover:text-emergency-red text-yt-light transition disabled:opacity-50"
                                title="Dismiss this link (can't be fixed)"
                              >
                                {dismissingAllUrl === group.originalUrl ? (
                                  "Dismissing..."
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3" />
                                    Dismiss
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Manual Find Replacement Row - Expandable */}
                    {showReplacementFor === group.originalUrl && (
                      <tr>
                        <td colSpan={7} className="px-4 py-0 bg-yt-dark/30">
                          <FindReplacement
                            link={{
                              id: group.linkIds[0],
                              originalUrl: group.originalUrl,
                              amazonRegion: group.amazonRegion,
                            }}
                            videoTitle={group.videos[0]?.title || "Unknown Video"}
                            userTags={userTags}
                            defaultRegion={(group.amazonRegion as "US" | "UK" | "CA" | "DE") || "US"}
                          />
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "needs-fix" && viewMode === "by-video" ? (
          /* By-Video View for Needs Fix */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-yt-dark/50 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase tracking-wider">
                    Broken Link
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase tracking-wider">
                    Issue Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-yt-light uppercase tracking-wider">
                    AI Suggestion
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-yt-light uppercase tracking-wider">
                    Revenue at Risk
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-yt-light uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-white/5 transition">
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
                          <div className="w-16 h-9 bg-yt-gray rounded flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate max-w-[180px]" title={issue.videoTitle}>
                            {issue.videoTitle.length > 40
                              ? issue.videoTitle.slice(0, 40) + "..."
                              : issue.videoTitle}
                          </p>
                          <p className="text-xs text-yt-light/50">
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
                        className="text-sm text-emergency-red hover:underline truncate block max-w-[160px]"
                        title={issue.url}
                      >
                        {issue.url.length > 35 ? issue.url.slice(0, 35) + "..." : issue.url}
                      </a>
                    </td>

                    {/* Issue Type + Network */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <IssueTypeBadge status={issue.status} />
                        <NetworkBadge merchant={issue.merchant} />
                      </div>
                    </td>

                    {/* AI Suggestion */}
                    <td className="px-4 py-4">
                      {issue.suggestedLink && issue.suggestedTitle ? (
                        <div className="space-y-1">
                          <p
                            className="text-sm text-profit-green font-medium max-w-[200px] truncate"
                            title={issue.suggestedTitle}
                          >
                            {issue.suggestedTitle.length > 40
                              ? issue.suggestedTitle.slice(0, 40) + "..."
                              : issue.suggestedTitle}
                          </p>
                          <div className="flex items-center gap-2">
                            {issue.suggestedPrice && (
                              <span className="text-xs text-yt-light">{issue.suggestedPrice}</span>
                            )}
                            <button
                              onClick={() => copyAndOpenStudio(issue.suggestedLink!, issue.id, issue.youtubeVideoId)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-yt-gray/50 hover:bg-profit-green/20 text-yt-light/70 hover:text-profit-green transition"
                              title="Copy link and open YouTube Studio"
                            >
                              {copiedId === issue.id ? (
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
                            <a
                              href={issue.suggestedLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-yt-gray/50 hover:bg-white/10 transition"
                              title="Preview product"
                            >
                              <ExternalLink className="w-3 h-3 text-yt-light" />
                            </a>
                            {activeTab === "needs-fix" && (
                              <button
                                onClick={() => handleFindReplacement(issue.id)}
                                disabled={findingId === issue.id}
                                className="p-1 rounded bg-yt-gray/50 hover:bg-white/10 transition"
                                title="Re-scan for new suggestion"
                              >
                                <RefreshCw className={`w-3 h-3 text-yt-light ${findingId === issue.id ? 'animate-spin' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : activeTab === "needs-fix" ? (
                        <button
                          onClick={() => handleFindReplacement(issue.id)}
                          disabled={findingId === issue.id}
                          className="text-sm text-yt-light hover:text-profit-green flex items-center gap-1 transition disabled:opacity-50"
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
                        <span className="text-xs text-yt-light/50">-</span>
                      )}
                    </td>

                    {/* Confidence Score */}
                    <td className="px-4 py-4 text-center">
                      {issue.suggestedLink ? (
                        <ConfidenceBadge score={issue.confidenceScore} />
                      ) : (
                        <span className="text-xs text-yt-light/50">-</span>
                      )}
                    </td>

                    {/* Revenue at Risk */}
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-emergency-red">
                        {formatCurrency(issue.estimatedLoss)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-center">
                      {issue.suggestedLink ? (
                          <div className="flex flex-col items-center gap-2">
                            {/* Copy & Edit button - copies link AND opens YouTube Studio - REQUIRED, DO NOT REMOVE */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyAndOpenStudio(issue.suggestedLink!, `action-${issue.id}`, issue.youtubeVideoId)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                  copiedId === `action-${issue.id}`
                                    ? "bg-profit-green text-black"
                                    : "bg-yt-gray hover:bg-white/10 border border-white/20 text-white"
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-profit-green hover:brightness-110 disabled:bg-yt-gray text-black transition shadow-[0_0_15px_rgba(0,255,0,0.15)]"
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
                            {/* Dismiss button */}
                            <button
                              onClick={() => handleDismissLink(issue.id)}
                              disabled={dismissingLinkId === issue.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-yt-gray hover:bg-emergency-red/20 hover:text-emergency-red text-yt-light transition disabled:opacity-50"
                              title="Dismiss this link (can't be fixed)"
                            >
                              {dismissingLinkId === issue.id ? (
                                "..."
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-yt-light/50 italic">
                              Find replacement first
                            </span>
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://studio.youtube.com/video/${issue.youtubeVideoId}/edit`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-yt-gray hover:bg-white/10 border border-white/20 text-white transition"
                                title="Edit in YouTube Studio"
                              >
                                <Pencil className="w-3 h-3" />
                                Edit in Studio
                              </a>
                              {/* Dismiss button for links without suggestions */}
                              <button
                                onClick={() => handleDismissLink(issue.id)}
                                disabled={dismissingLinkId === issue.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-yt-gray hover:bg-emergency-red/20 hover:text-emergency-red text-yt-light transition disabled:opacity-50"
                                title="Dismiss this link (can't be fixed)"
                              >
                                {dismissingLinkId === issue.id ? (
                                  "..."
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
      )}

      {/* Copy Toast */}
      {copiedId && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-profit-green text-black rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 z-50">
          <Check className="w-4 h-4" />
          <span className="text-sm font-bold">Copied! Ready to paste into YouTube.</span>
        </div>
      )}
    </div>
  );
}
