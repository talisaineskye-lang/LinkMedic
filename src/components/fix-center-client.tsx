"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Copy, Check, CheckCircle2, ExternalLink, RefreshCw, FileWarning, Lock, Eye, Pencil, ChevronDown, ChevronRight, Layers, List, X, FileDown, Trash2, Undo2, Search, Info, MoreHorizontal } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/revenue-estimator";
import { DISCLOSURE_TEMPLATES } from "@/lib/disclosure-detector";
import { NETWORK_DISPLAY_NAMES, AffiliateMerchant } from "@/lib/affiliate-networks";
import { FindReplacementsButton } from "./find-replacements-button";
import { FindReplacement } from "./find-replacement";
import { Tooltip } from "./ui/tooltip";
import Link from "next/link";

// Tooltip content constants
const TOOLTIP_CONTENT = {
  confidence: "How closely the suggested replacement matches the original product's category, price point, and ratings.",
  revenueAtRisk: "Estimated lost commission based on video views. Calculated using 1% CTR, 1.5% conversion rate, and 3% average commission.",
  aiSuggestion: "We automatically find in-stock alternatives that match the original product's category and price range.",
  issueOutOfStock: "This product is currently unavailable on the retailer's site. Visitors clicking this link can't buy it.",
  issueBroken: "This link returns a 404 error or no longer exists.",
  issueRedirect: "This link redirects somewhere unexpected, like a homepage or search page instead of a product.",
  issueMissingTag: "This link is missing your affiliate tracking tag, so you won't earn commission from clicks.",
  issueThirdParty: "This product is only available from third-party sellers, which may affect commission rates.",
  copyAndOpen: "Copies the new affiliate link to your clipboard and opens YouTube Studio so you can paste it.",
  progressIndicator: "Tracks how many videos you've updated with the new link.",
  markAsVerified: "Confirms you've updated all videos. Moves this link to the Fixed tab.",
};

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
    if (score >= 85) return "bg-cyan-500/20 border-cyan-500/50 text-cyan-400";
    if (score >= 60) return "bg-orange-500/20 border-orange-500/50 text-orange-400";
    return "bg-white/5 border-white/20 text-slate-400";
  };

  return (
    <Tooltip content={TOOLTIP_CONTENT.confidence} position="top" showIcon>
      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded border cursor-help ${getColor()}`}>
        {score}%
      </span>
    </Tooltip>
  );
}

function IssueTypeBadge({ status }: { status: string }) {
  const getConfig = () => {
    switch (status) {
      case "NOT_FOUND":
        return { label: "404", color: "bg-red-500/20 border-red-500/50 text-red-500", tooltip: TOOLTIP_CONTENT.issueBroken };
      case "OOS":
        return { label: "Out of Stock", color: "bg-orange-500/20 border-orange-500/50 text-orange-400", tooltip: TOOLTIP_CONTENT.issueOutOfStock };
      case "OOS_THIRD_PARTY":
        return { label: "3rd Party Only", color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400", tooltip: TOOLTIP_CONTENT.issueThirdParty };
      case "SEARCH_REDIRECT":
        return { label: "Redirect", color: "bg-orange-500/20 border-orange-500/50 text-orange-400", tooltip: TOOLTIP_CONTENT.issueRedirect };
      case "MISSING_TAG":
        return { label: "Missing Tag", color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400", tooltip: TOOLTIP_CONTENT.issueMissingTag };
      default:
        return { label: status, color: "bg-white/5 border-white/20 text-slate-400", tooltip: "" };
    }
  };

  const { label, color, tooltip } = getConfig();

  if (!tooltip) {
    return (
      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded border ${color}`}>
        {label}
      </span>
    );
  }

  return (
    <Tooltip content={tooltip} position="top" showIcon>
      <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded border cursor-help ${color}`}>
        {label}
      </span>
    </Tooltip>
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
        return { color: "bg-white/5 border-white/20 text-slate-400" };
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

// Verification Modal - shown when all videos in a group are checked
interface VerifyModalProps {
  videoCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function VerifyModal({ videoCount, onConfirm, onCancel }: VerifyModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-xl">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-cyan-400" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-2">
            All {videoCount} video{videoCount !== 1 ? "s" : ""} updated!
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-sm mb-6">
            Mark this link as verified? It will move to your Fixed tab.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
            >
              Not Yet
            </button>
            <Tooltip content={TOOLTIP_CONTENT.markAsVerified} position="top">
              <button
                onClick={onConfirm}
                className="px-6 py-2.5 text-sm font-bold text-black bg-cyan-500 hover:brightness-110 rounded-lg transition"
              >
                Mark as Verified
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
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
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  // Accordion checkbox progress tracking
  const [checkedVideos, setCheckedVideos] = useState<Map<string, Set<string>>>(new Map());
  const [showVerifyModal, setShowVerifyModal] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);
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
      if (showActionMenu && !(e.target as Element).closest('.action-dropdown')) {
        setShowActionMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu, showDisclosureMenu, showActionMenu]);

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

  const handleFindReplacement = async (id: string, refresh: boolean = false) => {
    // Check tier access on frontend (backend will also check)
    if (!canUseAI) {
      // Scroll to pricing or show upgrade modal
      window.location.href = "/#pricing";
      return;
    }

    setFindingId(id);
    try {
      const response = await fetch(`/api/links/${id}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "UPGRADE_REQUIRED") {
          window.location.href = "/#pricing";
          return;
        }
        if (data.requiresTag) {
          alert("Please add your Amazon affiliate tag in Settings first");
          return;
        }
        throw new Error(data.error || "Failed to find replacement");
      }

      router.refresh();
    } catch (error) {
      console.error("Error finding replacement:", error);
      alert(error instanceof Error ? error.message : "Failed to find replacement");
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

  // === Accordion Checkbox Progress Tracking Functions ===

  // Check/uncheck a video for a given URL
  const toggleVideoChecked = (originalUrl: string, videoId: string) => {
    setCheckedVideos(prev => {
      const next = new Map(prev);
      const videoSet = new Set(next.get(originalUrl) || []);

      if (videoSet.has(videoId)) {
        videoSet.delete(videoId);
      } else {
        videoSet.add(videoId);
      }

      next.set(originalUrl, videoSet);
      return next;
    });
  };

  // Check if a video is checked
  const isVideoChecked = (originalUrl: string, videoId: string): boolean => {
    return checkedVideos.get(originalUrl)?.has(videoId) || false;
  };

  // Get count of checked videos for a URL
  const getCheckedCount = (originalUrl: string): number => {
    return checkedVideos.get(originalUrl)?.size || 0;
  };

  // Check if any fixing has started for this URL
  const hasStartedFixing = (originalUrl: string): boolean => {
    return (checkedVideos.get(originalUrl)?.size || 0) > 0;
  };

  // Check if all videos are checked for a URL
  const allVideosChecked = (originalUrl: string, totalVideos: number): boolean => {
    return (checkedVideos.get(originalUrl)?.size || 0) >= totalVideos;
  };

  // Copy & Open action that also checks the video
  const copyOpenAndCheck = async (
    suggestedLink: string,
    copyId: string,
    youtubeVideoId: string,
    originalUrl: string,
    videoId: string,
    totalVideos: number
  ) => {
    try {
      await navigator.clipboard.writeText(suggestedLink);
      setCopiedId(copyId);
      setTimeout(() => setCopiedId(null), 2000);

      // Open YouTube Studio
      window.open(`https://studio.youtube.com/video/${youtubeVideoId}/edit`, '_blank');

      // Auto-check this video
      setCheckedVideos(prev => {
        const next = new Map(prev);
        const videoSet = new Set(next.get(originalUrl) || []);
        videoSet.add(videoId);
        next.set(originalUrl, videoSet);

        // Check if all are now checked - trigger modal
        if (videoSet.size >= totalVideos) {
          setTimeout(() => setShowVerifyModal(originalUrl), 500);
        }

        return next;
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Expand/Collapse all URLs
  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedUrls(new Set());
    } else {
      setExpandedUrls(new Set(groupedIssues.map(g => g.originalUrl)));
    }
    setAllExpanded(!allExpanded);
  };

  // Handle verification confirmation - mark all fixed and clear checked state
  const handleVerifyAllFixed = async (originalUrl: string, linkIds: string[]) => {
    setShowVerifyModal(null);
    await handleMarkAllFixed(originalUrl, linkIds);

    // Clear checked state for this URL after marking fixed
    setCheckedVideos(prev => {
      const next = new Map(prev);
      next.delete(originalUrl);
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
          <p className="text-slate-400 mt-1">
            {needsFixIssues.length} broken link{needsFixIssues.length !== 1 ? "s" : ""}
            {totalLoss > 0 && (
              <> losing <span className="text-red-500 font-semibold">{formatCurrency(totalLoss)}</span>/month</>
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
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/5 border border-white/20 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                {downloadingExport ? "Exporting..." : "Export"}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-xl shadow-xl border border-white/20 z-50 overflow-hidden">
                  <button
                    onClick={() => handleDownloadExport("tubebuddy")}
                    disabled={!needsFixIssues.some(i => i.suggestedLink)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-white flex items-center gap-2">
                      <span>📋</span> TubeBuddy (Bulk Fix)
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Fix all videos at once with Find & Replace</div>
                  </button>

                  <button
                    onClick={() => handleDownloadExport("csv")}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition border-t border-white/10"
                  >
                    <div className="font-medium text-white flex items-center gap-2">
                      <span>📊</span> CSV Spreadsheet
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Open in Excel or Google Sheets</div>
                  </button>

                  <button
                    onClick={() => handleDownloadExport("manual")}
                    disabled={!needsFixIssues.some(i => i.suggestedLink)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition border-t border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-white flex items-center gap-2">
                      <span>📄</span> Fix Script (Manual)
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Step-by-step with YouTube Studio links</div>
                  </button>
                </div>
              )}
            </div>
          )}
          {issuesNeedingReplacements > 0 && canUseAI && (
            <FindReplacementsButton
              canUseAI={canUseAI}
              linksWithoutSuggestions={issuesNeedingReplacements}
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5/70 backdrop-blur-sm p-1 rounded-xl w-fit border border-white/10">
        <button
          onClick={() => setActiveTab("needs-fix")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "needs-fix"
              ? "bg-red-500/20 text-red-500 border border-red-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Broken Links ({needsFixIssues.length})
        </button>
        <button
          onClick={() => setActiveTab("disclosure")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-1.5 ${
            activeTab === "disclosure"
              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileWarning className="w-3.5 h-3.5" />
          Disclosures ({disclosureIssues.length})
          {/* Info tooltip */}
          <span className="relative group/tooltip ml-0.5">
            <Info className="w-3.5 h-3.5 text-slate-400/50 group-hover/tooltip:text-slate-400 transition cursor-help" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[264px] px-3 py-2 text-xs text-slate-400 bg-slate-900 border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-opacity duration-200 z-50 pointer-events-none">
              FYI: This shows whether or not your descriptions include proper affiliate disclosures. You&apos;re responsible for ensuring compliance with FTC guidelines or local regulations.
              {/* Arrow */}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
              <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-900" />
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab("fixed")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
            activeTab === "fixed"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Fixed ({fixedIssues.length})
        </button>
      </div>

      {/* Disclosure Issues Tab */}
      {activeTab === "disclosure" && (
        <div className="bg-white/5/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {disclosureIssues.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
              <p className="text-xl font-semibold text-white mb-2">No Disclosure Issues!</p>
              <p className="text-slate-400">
                All your videos with affiliate links have proper disclosures.
              </p>
            </div>
          ) : !canViewDisclosureDetails ? (
            // Free tier: show count but blur details
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8">
                <Lock className="w-12 h-12 text-slate-400/50 mb-4" />
                <p className="text-lg font-semibold text-white mb-2">
                  {disclosureIssues.length} video{disclosureIssues.length !== 1 ? "s" : ""} with disclosure issues
                </p>
                <p className="text-slate-400 text-center mb-4 max-w-md">
                  Upgrade to see which videos are missing FTC-compliant affiliate disclosures.
                </p>
                <Link
                  href="/settings"
                  className="px-6 py-3 bg-cyan-500 hover:brightness-110 rounded-lg font-bold text-black transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
                >
                  Upgrade to View Details
                </Link>
              </div>
              {/* Blurred preview */}
              <div className="overflow-x-auto opacity-30 pointer-events-none">
                <table className="w-full">
                  <thead className="bg-slate-900/50 border-b border-white/10">
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
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-4 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                        <td className="px-4 py-4 text-center"><div className="h-4 w-8 bg-white/5 rounded mx-auto" /></td>
                        <td className="px-4 py-4 text-center"><div className="h-6 w-20 bg-white/5 rounded mx-auto" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-40 bg-white/5 rounded" /></td>
                        <td className="px-4 py-4 text-center"><div className="h-8 w-24 bg-white/5 rounded mx-auto" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-white/10">
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
                      <div className="flex items-center justify-center gap-2">
                        <span>Action</span>
                        {disclosureIssues.length > 1 && (
                          <button
                            onClick={handleDismissAllDisclosures}
                            disabled={dismissingAllDisclosures}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-slate-400 transition disabled:opacity-50"
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
                            <div className="w-16 h-9 bg-white/5 rounded flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate max-w-[180px]" title={item.videoTitle}>
                              {item.videoTitle.length > 40
                                ? item.videoTitle.slice(0, 40) + "..."
                                : item.videoTitle}
                            </p>
                            <p className="text-xs text-slate-400/50">
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
                              ? "bg-red-500/20 border-red-500/50 text-red-500"
                              : "bg-orange-500/20 border-orange-500/50 text-orange-400"
                          }`}>
                            {item.disclosureStatus === "MISSING" ? "Missing" : "Weak"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{item.issue}</p>
                      </td>

                      {/* Suggested Disclosure */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-400/70 max-w-[280px] line-clamp-2" title={DISCLOSURE_TEMPLATES.standard}>
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
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 text-black"
                              >
                                <Check className="w-3 h-3" />
                                Copied!
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => setShowDisclosureMenu(showDisclosureMenu === item.id ? null : item.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white transition"
                                  title="Copy disclosure text to paste at the TOP of your video description"
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                {showDisclosureMenu === item.id && (
                                  <div className="absolute left-0 top-full mt-1 w-64 bg-slate-800 rounded-xl shadow-xl border border-white/20 z-50 overflow-hidden">
                                    <button
                                      onClick={() => copyDisclosure(item.id, "standard")}
                                      className="w-full px-3 py-2 text-left hover:bg-white/10 transition"
                                    >
                                      <div className="font-medium text-white text-xs">Standard (Recommended)</div>
                                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                        {DISCLOSURE_TEMPLATES.standard}
                                      </div>
                                    </button>
                                    <button
                                      onClick={() => copyDisclosure(item.id, "short")}
                                      className="w-full px-3 py-2 text-left hover:bg-white/10 transition border-t border-white/10"
                                    >
                                      <div className="font-medium text-white text-xs">Short</div>
                                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white transition"
                            title="Edit in YouTube Studio"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </a>
                          <button
                            onClick={() => setViewingDescriptionId(viewingDescriptionId === item.id ? null : item.id)}
                            className="p-1.5 rounded-lg bg-white/5/50 hover:bg-white/10 text-slate-400 transition"
                            title="View current description"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDismissDisclosure(item.id)}
                            disabled={dismissingDisclosureId === item.id}
                            className="p-1.5 rounded-lg bg-white/5/50 hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition disabled:opacity-50"
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
            <div className="border-t border-white/10 p-6 bg-slate-900/50">
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
                    <div className="bg-white/5 rounded-xl p-4 max-h-64 overflow-y-auto border border-white/10">
                      <pre className="text-sm text-slate-400/70 whitespace-pre-wrap font-sans">
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
                          <span className="text-slate-400/50 italic">No description available</span>
                        )}
                      </pre>
                    </div>
                    {item.disclosureStatus === "WEAK" && item.disclosurePosition && (
                      <p className="mt-3 text-sm text-orange-400">
                        Disclosure found at character {item.disclosurePosition}. FTC recommends placing disclosures in the first 200 characters.
                      </p>
                    )}
                    {item.disclosureStatus === "MISSING" && (
                      <p className="mt-3 text-sm text-red-500">
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
        <div className="bg-white/5/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {/* View Toggle - only show for needs-fix tab */}
          {activeTab === "needs-fix" && needsFixIssues.length > 0 && (
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">View:</span>
                <div className="flex gap-1 bg-slate-900/50 p-0.5 rounded-lg">
                  <button
                    onClick={() => setViewMode("grouped")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                      viewMode === "grouped"
                        ? "bg-white/5 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    By Unique Link
                  </button>
                  <button
                    onClick={() => setViewMode("by-video")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                      viewMode === "by-video"
                        ? "bg-white/5 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <List className="w-3 h-3" />
                    By Video
                  </button>
                </div>
              </div>
              {viewMode === "grouped" && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleExpandAll}
                    className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
                  >
                    {allExpanded ? (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Collapse All
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        Expand All
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-400/50">
                    {groupedIssues.length} unique link{groupedIssues.length !== 1 ? "s" : ""} across {needsFixIssues.length} video{needsFixIssues.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          )}

          {issues.length === 0 && activeTab === "fixed" ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
              <p className="text-xl font-semibold text-white mb-2">No Fixed Links Yet</p>
              <p className="text-slate-400">Links you mark as fixed will appear here.</p>
            </div>
          ) : needsFixIssues.length === 0 && activeTab === "needs-fix" ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
              <p className="text-xl font-semibold text-white mb-2">All Links Fixed!</p>
              <p className="text-slate-400">Great job! All your affiliate links are working properly.</p>
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
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="font-medium text-white">{date}</span>
                      </div>
                      <span className="text-sm text-slate-400">
                        {linksForDate.length} link{linksForDate.length !== 1 ? "s" : ""} fixed
                      </span>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="bg-slate-900/30">
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
                                <div className="w-12 h-7 bg-white/5 rounded flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-white font-medium truncate" title={link.videoTitle}>
                                  {link.videoTitle.length > 50
                                    ? link.videoTitle.slice(0, 50) + "..."
                                    : link.videoTitle}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-slate-400/50 truncate max-w-[200px]" title={link.url}>
                                    {link.url.length > 40 ? link.url.slice(0, 40) + "..." : link.url}
                                  </span>
                                  {link.suggestedTitle && (
                                    <>
                                      <span className="text-xs text-slate-400/30">→</span>
                                      <span className="text-xs text-cyan-400 truncate max-w-[200px]" title={link.suggestedTitle}>
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
                              <span className="text-sm font-medium text-cyan-400">
                                {formatCurrency(link.estimatedLoss)}
                              </span>
                              <button
                                onClick={() => handleUndoFix(link.id)}
                                disabled={undoingLinkId === link.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-slate-400 transition disabled:opacity-50"
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
                <thead className="bg-slate-900/50 border-b border-white/10">
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
                      <Tooltip content={TOOLTIP_CONTENT.aiSuggestion} position="top">
                        <span className="cursor-help border-b border-dashed border-slate-500">AI Suggestion</span>
                      </Tooltip>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <Tooltip content={TOOLTIP_CONTENT.confidence} position="top">
                        <span className="cursor-help border-b border-dashed border-slate-500">Confidence</span>
                      </Tooltip>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <Tooltip content={TOOLTIP_CONTENT.revenueAtRisk} position="top">
                        <span className="cursor-help border-b border-dashed border-slate-500">Total Revenue at Risk</span>
                      </Tooltip>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
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
                          className="text-sm text-red-500 hover:underline truncate block max-w-[180px]"
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

                      {/* Videos Affected - Expandable with Progress */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleUrlExpanded(group.originalUrl)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleUrlExpanded(group.originalUrl);
                            }
                          }}
                          className="flex items-center gap-1.5 text-sm text-slate-400/70 hover:text-white transition mx-auto"
                          aria-expanded={expandedUrls.has(group.originalUrl)}
                          aria-controls={`videos-${group.linkIds[0]}`}
                        >
                          {expandedUrls.has(group.originalUrl) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          {hasStartedFixing(group.originalUrl) ? (
                            // Show progress once fixing has started
                            <Tooltip content={TOOLTIP_CONTENT.progressIndicator} position="top">
                              <span className="font-medium cursor-help">
                                <span className="text-cyan-400">
                                  {getCheckedCount(group.originalUrl)}
                                </span>
                                <span className="text-slate-400/50">/{group.videos.length} fixed</span>
                              </span>
                            </Tooltip>
                          ) : (
                            // Show simple count before fixing starts
                            <>
                              <span className="font-medium">{group.videos.length}</span>
                              <span className="text-slate-400/50">
                                video{group.videos.length !== 1 ? "s" : ""}
                              </span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* AI Suggestion */}
                      <td className="px-4 py-4">
                        {group.suggestedLink && group.suggestedTitle ? (
                          <div className="space-y-1">
                            <p
                              className="text-sm text-cyan-400 font-medium max-w-[200px] truncate"
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
                              <a
                                href={group.suggestedLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-white/5/50 hover:bg-white/10 transition"
                                title="Preview product"
                              >
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                              <button
                                onClick={() => handleFindReplacement(group.linkIds[0], true)}
                                disabled={findingId === group.linkIds[0]}
                                className="p-1 rounded bg-white/5/50 hover:bg-white/10 transition"
                                title="Re-scan for new suggestion"
                              >
                                <RefreshCw className={`w-3 h-3 text-slate-400 ${findingId === group.linkIds[0] ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                          </div>
                        ) : !canUseAI ? (
                          <button
                            onClick={() => window.location.href = "/#pricing"}
                            className="text-sm text-slate-500 hover:text-amber-400 flex items-center gap-1.5 transition"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Unlock AI</span>
                            <span className="px-1.5 py-0.5 text-[10px] bg-amber-600/20 text-amber-400 rounded">PRO</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFindReplacement(group.linkIds[0])}
                            disabled={findingId === group.linkIds[0]}
                            className="text-sm text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition disabled:opacity-50"
                          >
                            {findingId === group.linkIds[0] ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Finding...
                              </>
                            ) : (
                              <>
                                <Search className="w-3 h-3" />
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
                          <span className="text-xs text-slate-400/50">-</span>
                        )}
                      </td>

                      {/* Total Revenue at Risk */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-red-500">
                          {formatCurrency(group.totalRevenueAtRisk)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4 text-center">
                        {group.suggestedLink ? (
                          <div className="flex items-center justify-center gap-2">
                            {/* Primary: Mark All Fixed button */}
                            <button
                              onClick={() => handleMarkAllFixed(group.originalUrl, group.linkIds)}
                              disabled={markingAllFixedUrl === group.originalUrl}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:brightness-110 disabled:opacity-50 text-black transition"
                            >
                              {markingAllFixedUrl === group.originalUrl ? (
                                "..."
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Fixed ({group.linkIds.length})
                                </>
                              )}
                            </button>
                            {/* More Actions Dropdown */}
                            <div className="relative action-dropdown">
                              <button
                                onClick={() => setShowActionMenu(showActionMenu === group.originalUrl ? null : group.originalUrl)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-slate-400 hover:text-white transition"
                                title="More actions"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              {showActionMenu === group.originalUrl && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 rounded-lg shadow-xl border border-white/20 z-50 overflow-hidden">
                                  {/* Copy & Edit - REQUIRED, DO NOT REMOVE */}
                                  <button
                                    onClick={() => {
                                      copyAndOpenStudio(group.suggestedLink!, `action-${group.originalUrl}`, group.videos[0].youtubeVideoId);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-white hover:bg-white/10 transition flex items-center gap-2"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Copy & Edit
                                  </button>
                                  {/* Search */}
                                  <button
                                    onClick={() => {
                                      setShowReplacementFor(showReplacementFor === group.originalUrl ? null : group.originalUrl);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
                                  >
                                    <Search className="w-3 h-3" />
                                    {showReplacementFor === group.originalUrl ? "Hide Search" : "Manual Search"}
                                  </button>
                                  {/* Dismiss */}
                                  <button
                                    onClick={() => {
                                      handleDismissAllLinks(group.originalUrl, group.linkIds);
                                      setShowActionMenu(null);
                                    }}
                                    disabled={dismissingAllUrl === group.originalUrl}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Dismiss
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {/* Manual Search Button */}
                            <button
                              onClick={() => setShowReplacementFor(
                                showReplacementFor === group.originalUrl ? null : group.originalUrl
                              )}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                showReplacementFor === group.originalUrl
                                  ? "bg-white/10 text-white border border-white/30"
                                  : "bg-white/5 hover:bg-white/10 border border-white/20 text-slate-400 hover:text-white"
                              }`}
                            >
                              <Search className="w-3 h-3" />
                              Search
                            </button>
                            {/* Dismiss button */}
                            <button
                              onClick={() => handleDismissAllLinks(group.originalUrl, group.linkIds)}
                              disabled={dismissingAllUrl === group.originalUrl}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition disabled:opacity-50"
                              title="Dismiss"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Expanded Accordion Row with Video Checkboxes */}
                    {expandedUrls.has(group.originalUrl) && (
                      <tr>
                        <td colSpan={7} className="p-0 bg-slate-900/30" id={`videos-${group.linkIds[0]}`}>
                          <div className="px-4 py-3">
                            {/* Sub-table header */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                                Videos using this link
                              </span>
                              {group.suggestedLink && group.suggestedTitle && (
                                <span className="text-xs text-slate-400/50">
                                  Replacement: {group.suggestedTitle.length > 40 ? group.suggestedTitle.slice(0, 40) + "..." : group.suggestedTitle}
                                </span>
                              )}
                            </div>

                            {/* Videos sub-table */}
                            <div className="rounded-lg border border-white/10 overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-white/5">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase w-12">
                                      {/* Checkbox column header */}
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                                      Video
                                    </th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase w-32">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {group.videos.map((video) => {
                                    const videoChecked = isVideoChecked(group.originalUrl, video.id);
                                    const isCopied = copiedId === `accordion-${video.id}`;

                                    return (
                                      <tr key={video.id} className="hover:bg-white/5 transition">
                                        {/* Checkbox */}
                                        <td className="px-4 py-3">
                                          <button
                                            onClick={() => {
                                              toggleVideoChecked(group.originalUrl, video.id);
                                              // Check if all will be checked after this toggle
                                              const currentCount = getCheckedCount(group.originalUrl);
                                              const willBeChecked = !videoChecked;
                                              if (willBeChecked && currentCount + 1 >= group.videos.length) {
                                                setTimeout(() => setShowVerifyModal(group.originalUrl), 300);
                                              }
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                toggleVideoChecked(group.originalUrl, video.id);
                                              }
                                            }}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                              videoChecked
                                                ? "bg-cyan-500 border-cyan-500"
                                                : "border-white/30 hover:border-white/50"
                                            }`}
                                            role="checkbox"
                                            aria-checked={videoChecked}
                                            aria-label={videoChecked ? "Mark as not fixed" : "Mark as fixed"}
                                          >
                                            {videoChecked && <Check className="w-3 h-3 text-black" />}
                                          </button>
                                        </td>

                                        {/* Video Title */}
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-3">
                                            {video.thumbnailUrl ? (
                                              <Image
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                width={48}
                                                height={27}
                                                className="rounded object-cover flex-shrink-0"
                                              />
                                            ) : (
                                              <div className="w-12 h-7 bg-white/5 rounded flex-shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                              <p
                                                className={`text-sm font-medium truncate max-w-[300px] ${
                                                  videoChecked ? "text-slate-400 line-through" : "text-white"
                                                }`}
                                                title={video.title}
                                              >
                                                {video.title.length > 50 ? video.title.slice(0, 50) + "..." : video.title}
                                              </p>
                                              <p className="text-xs text-slate-400/50">
                                                {formatNumber(video.viewCount)} views
                                              </p>
                                            </div>
                                          </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            {group.suggestedLink ? (
                                              <Tooltip content={TOOLTIP_CONTENT.copyAndOpen} position="left">
                                                <button
                                                  onClick={() => copyOpenAndCheck(
                                                    group.suggestedLink!,
                                                    `accordion-${video.id}`,
                                                    video.youtubeVideoId,
                                                    group.originalUrl,
                                                    video.id,
                                                    group.videos.length
                                                  )}
                                                  disabled={isCopied}
                                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                                                    isCopied
                                                      ? "bg-cyan-500 text-black"
                                                      : "bg-white/5 hover:bg-white/10 border border-white/20 text-white"
                                                  }`}
                                                >
                                                  {isCopied ? (
                                                    <>
                                                      <Check className="w-3 h-3" />
                                                      Copied!
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Copy className="w-3 h-3" />
                                                      Copy & Open
                                                    </>
                                                  )}
                                                </button>
                                              </Tooltip>
                                            ) : (
                                              <a
                                                href={`https://studio.youtube.com/video/${video.youtubeVideoId}/edit`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white transition"
                                              >
                                                <Pencil className="w-3 h-3" />
                                                Edit
                                              </a>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* Manual Find Replacement Row - Expandable */}
                    {showReplacementFor === group.originalUrl && (
                      <tr>
                        <td colSpan={7} className="px-4 py-0 bg-slate-900/30">
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
              <thead className="bg-slate-900/50 border-b border-white/10">
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
                    <Tooltip content={TOOLTIP_CONTENT.aiSuggestion} position="top">
                      <span className="cursor-help border-b border-dashed border-slate-500">AI Suggestion</span>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <Tooltip content={TOOLTIP_CONTENT.confidence} position="top">
                      <span className="cursor-help border-b border-dashed border-slate-500">Confidence</span>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <Tooltip content={TOOLTIP_CONTENT.revenueAtRisk} position="top">
                      <span className="cursor-help border-b border-dashed border-slate-500">Revenue at Risk</span>
                    </Tooltip>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
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
                          <div className="w-16 h-9 bg-white/5 rounded flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate max-w-[180px]" title={issue.videoTitle}>
                            {issue.videoTitle.length > 40
                              ? issue.videoTitle.slice(0, 40) + "..."
                              : issue.videoTitle}
                          </p>
                          <p className="text-xs text-slate-400/50">
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
                        className="text-sm text-red-500 hover:underline truncate block max-w-[160px]"
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
                            className="text-sm text-cyan-400 font-medium max-w-[200px] truncate"
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
                            <a
                              href={issue.suggestedLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-white/5/50 hover:bg-white/10 transition"
                              title="Preview product"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                            {activeTab === "needs-fix" && (
                              <button
                                onClick={() => handleFindReplacement(issue.id, true)}
                                disabled={findingId === issue.id}
                                className="p-1 rounded bg-white/5/50 hover:bg-white/10 transition"
                                title="Re-scan for new suggestion"
                              >
                                <RefreshCw className={`w-3 h-3 text-slate-400 ${findingId === issue.id ? 'animate-spin' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : activeTab === "needs-fix" ? (
                        !canUseAI ? (
                          <button
                            onClick={() => window.location.href = "/#pricing"}
                            className="text-sm text-slate-500 hover:text-amber-400 flex items-center gap-1.5 transition"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Unlock AI</span>
                            <span className="px-1.5 py-0.5 text-[10px] bg-amber-600/20 text-amber-400 rounded">PRO</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFindReplacement(issue.id)}
                            disabled={findingId === issue.id}
                            className="text-sm text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition disabled:opacity-50"
                          >
                            {findingId === issue.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Finding...
                              </>
                            ) : (
                              <>
                                <Search className="w-3 h-3" />
                                Find Replacement
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400/50">-</span>
                      )}
                    </td>

                    {/* Confidence Score */}
                    <td className="px-4 py-4 text-center">
                      {issue.suggestedLink ? (
                        <ConfidenceBadge score={issue.confidenceScore} />
                      ) : (
                        <span className="text-xs text-slate-400/50">-</span>
                      )}
                    </td>

                    {/* Revenue at Risk */}
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-red-500">
                        {formatCurrency(issue.estimatedLoss)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 text-center">
                      {issue.suggestedLink ? (
                          <div className="flex items-center justify-center gap-2">
                            {/* Primary: Mark Fixed button */}
                            <button
                              onClick={() => handleMarkFixed(issue.id)}
                              disabled={markingFixedId === issue.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:brightness-110 disabled:opacity-50 text-black transition"
                            >
                              {markingFixedId === issue.id ? (
                                "..."
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Fixed
                                </>
                              )}
                            </button>
                            {/* More Actions Dropdown */}
                            <div className="relative action-dropdown">
                              <button
                                onClick={() => setShowActionMenu(showActionMenu === issue.id ? null : issue.id)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-slate-400 hover:text-white transition"
                                title="More actions"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              {showActionMenu === issue.id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 rounded-lg shadow-xl border border-white/20 z-50 overflow-hidden">
                                  {/* Copy & Edit - REQUIRED, DO NOT REMOVE */}
                                  <button
                                    onClick={() => {
                                      copyAndOpenStudio(issue.suggestedLink!, `action-${issue.id}`, issue.youtubeVideoId);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-white hover:bg-white/10 transition flex items-center gap-2"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Copy & Edit
                                  </button>
                                  {/* Dismiss */}
                                  <button
                                    onClick={() => {
                                      handleDismissLink(issue.id);
                                      setShowActionMenu(null);
                                    }}
                                    disabled={dismissingLinkId === issue.id}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Dismiss
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {/* Edit in Studio */}
                            <a
                              href={`https://studio.youtube.com/video/${issue.youtubeVideoId}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white transition"
                              title="Edit in YouTube Studio"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </a>
                            {/* Dismiss button */}
                            <button
                              onClick={() => handleDismissLink(issue.id)}
                              disabled={dismissingLinkId === issue.id}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition disabled:opacity-50"
                              title="Dismiss"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* Verification Modal */}
      {showVerifyModal && (() => {
        const group = groupedIssues.find(g => g.originalUrl === showVerifyModal);
        if (!group) return null;

        return (
          <VerifyModal
            videoCount={group.videos.length}
            onConfirm={() => handleVerifyAllFixed(showVerifyModal, group.linkIds)}
            onCancel={() => setShowVerifyModal(null)}
          />
        );
      })()}

      {/* Copy Toast */}
      {copiedId && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-cyan-500 text-black rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 z-50">
          <Check className="w-4 h-4" />
          <span className="text-sm font-bold">
            {copiedId.startsWith('accordion-')
              ? "Link copied! YouTube Studio opened."
              : "Copied! Ready to paste into YouTube."}
          </span>
        </div>
      )}
    </div>
  );
}
