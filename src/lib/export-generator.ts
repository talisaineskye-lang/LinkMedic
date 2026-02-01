/**
 * Export Generator v2.0
 *
 * Generates polished export files for LinkMedic:
 * 1. broken-links.csv - Proper CSV for broken links only
 * 2. disclosure-issues.csv - Separate CSV for disclosure problems
 * 3. fix-script.md - Polished Markdown fix script with progress tracking
 * 4. tubebuddy-guide.md - Markdown guide with instructions and data
 */

import { prisma } from "@/lib/db";
import { LinkStatus, DisclosureStatus } from "@prisma/client";
import { calculateRevenueImpact, DEFAULT_SETTINGS, formatCurrency } from "@/lib/revenue-estimator";
import { getDisclosureIssueText } from "@/lib/disclosure-detector";

// ============================================
// TYPES
// ============================================

interface BrokenLinkData {
  videoTitle: string;
  videoId: string;
  youtubeVideoId: string;
  videoUrl: string;
  studioUrl: string;
  views: number;
  brokenLink: string;
  issueType: string;
  status: LinkStatus;
  suggestedFix: string | null;
  productName: string | null;
  confidence: number | null;
  estMonthlyLoss: number;
  publishedAt: Date | null;
}

interface DisclosureIssueData {
  videoTitle: string;
  videoId: string;
  youtubeVideoId: string;
  videoUrl: string;
  studioUrl: string;
  views: number;
  affiliateLinkCount: number;
  disclosureStatus: DisclosureStatus;
  issue: string;
}

interface GroupedLink {
  originalUrl: string;
  suggestedFix: string | null;
  productName: string | null;
  issueType: string;
  status: LinkStatus;
  confidence: number | null;
  totalViews: number;
  estMonthlyLoss: number;
  videos: {
    title: string;
    youtubeVideoId: string;
    studioUrl: string;
    views: number;
  }[];
}

interface ExportStats {
  uniqueBrokenLinks: number;
  totalBrokenInstances: number;
  linksWithSuggestions: number;
  disclosureIssues: number;
  estimatedAnnualRecovery: number;
}

interface ExportData {
  channelName: string;
  affiliateTag: string | null;
  brokenLinks: BrokenLinkData[];
  groupedLinks: GroupedLink[];
  disclosureIssues: DisclosureIssueData[];
  revenueSettings: {
    ctrPercent: number;
    conversionPercent: number;
    avgOrderValue: number;
  };
  stats: ExportStats;
}

// ============================================
// CONSTANTS
// ============================================

const STATUS_LABELS: Record<LinkStatus, string> = {
  OK: "Healthy",
  OOS: "Out of Stock",
  OOS_THIRD_PARTY: "Third-Party Only",
  NOT_FOUND: "Not Found (404)",
  SEARCH_REDIRECT: "Search Redirect",
  MISSING_TAG: "Missing Affiliate Tag",
  REDIRECT: "Redirected",
  UNKNOWN: "Unknown",
};

const SEVERITY_EMOJI: Record<string, string> = {
  NOT_FOUND: "\u{1F534}", // Red circle
  SEARCH_REDIRECT: "\u{1F534}",
  OOS: "\u{1F7E0}", // Orange circle
  OOS_THIRD_PARTY: "\u{1F7E1}", // Yellow circle
  MISSING_TAG: "\u{1F7E1}",
  REDIRECT: "\u{1F7E1}",
  UNKNOWN: "\u{26AA}", // White circle
};

const DISCLOSURE_TEMPLATES = {
  standard:
    "Some of the links below are affiliate links. This means that, at no additional cost to you, I may earn a commission if you click through and make a purchase.",
  short: "This description contains affiliate links. I may earn a commission from purchases.",
};

const PROBLEM_STATUSES: LinkStatus[] = [
  LinkStatus.NOT_FOUND,
  LinkStatus.OOS,
  LinkStatus.OOS_THIRD_PARTY,
  LinkStatus.SEARCH_REDIRECT,
  LinkStatus.MISSING_TAG,
];

// ============================================
// UTILITIES
// ============================================

/**
 * Escape CSV field properly
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Fix common UTF-8 encoding issues
 */
function fixUtf8(text: string): string {
  return text
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, "—")
    .replace(/â€"/g, "–")
    .replace(/â€¦/g, "...");
}

/**
 * Ensure URL has the correct affiliate tag
 */
function ensureAffiliateTag(url: string, userTag: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set("tag", userTag);
    return urlObj.toString();
  } catch {
    if (url.includes("tag=")) {
      return url.replace(/tag=[^&]+/, `tag=${userTag}`);
    }
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}tag=${userTag}`;
  }
}

/**
 * Calculate priority based on views (1 = highest views = fix first)
 */
function calculatePriority(views: number, allViews: number[]): number {
  const sorted = [...allViews].sort((a, b) => b - a);
  const percentile = sorted.indexOf(views) / sorted.length;

  if (percentile < 0.2) return 1; // Top 20%
  if (percentile < 0.4) return 2;
  if (percentile < 0.6) return 3;
  if (percentile < 0.8) return 4;
  return 5;
}

/**
 * Truncate text to max length with ellipsis
 * Used for Progress Tracker to keep checklist clean
 */
function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "...";
}

/**
 * Format date for exports
 */
function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get ISO date string for filenames
 */
function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}

// ============================================
// DATA FETCHING
// ============================================

/**
 * Fetch all export data for a user
 */
export async function fetchExportData(userId: string): Promise<ExportData> {
  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      affiliateTag: true,
      ctrPercent: true,
      conversionPercent: true,
      avgOrderValue: true,
    },
  });

  const revenueSettings = {
    ctrPercent: user?.ctrPercent ?? DEFAULT_SETTINGS.ctrPercent,
    conversionPercent: user?.conversionPercent ?? DEFAULT_SETTINGS.conversionPercent,
    avgOrderValue: user?.avgOrderValue ?? DEFAULT_SETTINGS.avgOrderValue,
  };

  // Fetch broken links
  const links = await prisma.affiliateLink.findMany({
    where: {
      video: { userId },
      status: { in: PROBLEM_STATUSES },
      isFixed: false,
    },
    include: {
      video: {
        select: {
          id: true,
          title: true,
          youtubeVideoId: true,
          viewCount: true,
          publishedAt: true,
        },
      },
    },
    orderBy: { video: { viewCount: "desc" } },
  });

  // Transform to BrokenLinkData
  const brokenLinks: BrokenLinkData[] = links.map((link) => {
    const videoAgeMonths = link.video.publishedAt
      ? Math.max((Date.now() - new Date(link.video.publishedAt).getTime()) / (1000 * 60 * 60 * 24 * 30), 1)
      : 12;

    const estMonthlyLoss = calculateRevenueImpact(
      link.video.viewCount,
      link.status,
      revenueSettings,
      videoAgeMonths
    );

    // Ensure affiliate tag on suggested link
    let suggestedFix = link.suggestedLink;
    if (suggestedFix && user?.affiliateTag) {
      suggestedFix = ensureAffiliateTag(suggestedFix, user.affiliateTag);
    }

    return {
      videoTitle: fixUtf8(link.video.title),
      videoId: link.video.id,
      youtubeVideoId: link.video.youtubeVideoId,
      videoUrl: `https://youtube.com/watch?v=${link.video.youtubeVideoId}`,
      studioUrl: `https://studio.youtube.com/video/${link.video.youtubeVideoId}/edit`,
      views: link.video.viewCount,
      brokenLink: link.originalUrl,
      issueType: STATUS_LABELS[link.status] || link.status,
      status: link.status,
      suggestedFix,
      productName: link.suggestedTitle ? fixUtf8(link.suggestedTitle) : null,
      confidence: link.confidenceScore,
      estMonthlyLoss,
      publishedAt: link.video.publishedAt,
    };
  });

  // Group links by original URL
  const groupedMap = new Map<string, GroupedLink>();

  for (const link of brokenLinks) {
    const key = link.brokenLink;

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        originalUrl: link.brokenLink,
        suggestedFix: link.suggestedFix,
        productName: link.productName,
        issueType: link.issueType,
        status: link.status,
        confidence: link.confidence,
        totalViews: 0,
        estMonthlyLoss: 0,
        videos: [],
      });
    }

    const group = groupedMap.get(key)!;
    group.totalViews += link.views;
    group.estMonthlyLoss += link.estMonthlyLoss;
    group.videos.push({
      title: link.videoTitle,
      youtubeVideoId: link.youtubeVideoId,
      studioUrl: link.studioUrl,
      views: link.views,
    });
  }

  // Sort groups by total views (highest first)
  const groupedLinks = Array.from(groupedMap.values()).sort((a, b) => b.totalViews - a.totalViews);

  // Fetch disclosure issues
  const disclosureVideos = await prisma.video.findMany({
    where: {
      userId,
      hasAffiliateLinks: true,
      disclosureStatus: { in: [DisclosureStatus.MISSING, DisclosureStatus.WEAK] },
    },
    select: {
      id: true,
      title: true,
      youtubeVideoId: true,
      viewCount: true,
      affiliateLinkCount: true,
      disclosureStatus: true,
      disclosurePosition: true,
    },
    orderBy: { viewCount: "desc" },
  });

  const disclosureIssues: DisclosureIssueData[] = disclosureVideos.map((video) => ({
    videoTitle: fixUtf8(video.title),
    videoId: video.id,
    youtubeVideoId: video.youtubeVideoId,
    videoUrl: `https://youtube.com/watch?v=${video.youtubeVideoId}`,
    studioUrl: `https://studio.youtube.com/video/${video.youtubeVideoId}/edit`,
    views: video.viewCount,
    affiliateLinkCount: video.affiliateLinkCount,
    disclosureStatus: video.disclosureStatus,
    issue: getDisclosureIssueText(video.disclosureStatus, video.disclosurePosition),
  }));

  // Calculate stats
  const totalMonthlyLoss = groupedLinks.reduce((sum, g) => sum + g.estMonthlyLoss, 0);
  const stats: ExportStats = {
    uniqueBrokenLinks: groupedLinks.length,
    totalBrokenInstances: brokenLinks.length,
    linksWithSuggestions: groupedLinks.filter((g) => g.suggestedFix).length,
    disclosureIssues: disclosureIssues.length,
    estimatedAnnualRecovery: Math.round(totalMonthlyLoss * 12),
  };

  return {
    channelName: user?.name || "Channel",
    affiliateTag: user?.affiliateTag || null,
    brokenLinks,
    groupedLinks,
    disclosureIssues,
    revenueSettings,
    stats,
  };
}

// ============================================
// CSV GENERATORS
// ============================================

/**
 * Generate broken-links.csv - proper CSV format
 */
export function generateBrokenLinksCSV(data: ExportData): string {
  const allViews = data.brokenLinks.map((l) => l.views);

  const headers = [
    "priority",
    "video_title",
    "video_url",
    "studio_url",
    "views",
    "broken_link",
    "issue_type",
    "suggested_fix",
    "product_name",
    "confidence",
    "est_monthly_loss",
    "status",
  ];

  const rows = data.brokenLinks
    .map((link) => {
      const priority = calculatePriority(link.views, allViews);
      return {
        priority,
        video_title: link.videoTitle,
        video_url: link.videoUrl,
        studio_url: link.studioUrl,
        views: link.views,
        broken_link: link.brokenLink,
        issue_type: link.issueType,
        suggested_fix: link.suggestedFix || "",
        product_name: link.productName || "",
        confidence: link.confidence ? `${link.confidence}%` : "",
        est_monthly_loss: `$${link.estMonthlyLoss.toFixed(2)}`,
        status: "pending",
      };
    })
    .sort((a, b) => a.priority - b.priority || b.views - a.views);

  const csvRows = rows.map((row) =>
    [
      row.priority,
      escapeCSV(row.video_title),
      escapeCSV(row.video_url),
      escapeCSV(row.studio_url),
      row.views,
      escapeCSV(row.broken_link),
      escapeCSV(row.issue_type),
      escapeCSV(row.suggested_fix),
      escapeCSV(row.product_name),
      escapeCSV(row.confidence),
      escapeCSV(row.est_monthly_loss),
      escapeCSV(row.status),
    ].join(",")
  );

  return [headers.join(","), ...csvRows].join("\n");
}

/**
 * Generate disclosure-issues.csv - proper CSV format
 */
export function generateDisclosureCSV(data: ExportData): string {
  const allViews = data.disclosureIssues.map((d) => d.views);

  const headers = [
    "priority",
    "video_title",
    "video_url",
    "studio_url",
    "views",
    "affiliate_link_count",
    "disclosure_status",
    "issue",
    "suggested_disclosure",
  ];

  const rows = data.disclosureIssues
    .map((issue) => {
      const priority = calculatePriority(issue.views, allViews);
      return {
        priority,
        video_title: issue.videoTitle,
        video_url: issue.videoUrl,
        studio_url: issue.studioUrl,
        views: issue.views,
        affiliate_link_count: issue.affiliateLinkCount,
        disclosure_status: issue.disclosureStatus === "MISSING" ? "Missing" : "Weak",
        issue: issue.issue,
        suggested_disclosure: DISCLOSURE_TEMPLATES.standard,
      };
    })
    .sort((a, b) => a.priority - b.priority || b.views - a.views);

  const csvRows = rows.map((row) =>
    [
      row.priority,
      escapeCSV(row.video_title),
      escapeCSV(row.video_url),
      escapeCSV(row.studio_url),
      row.views,
      row.affiliate_link_count,
      escapeCSV(row.disclosure_status),
      escapeCSV(row.issue),
      escapeCSV(row.suggested_disclosure),
    ].join(",")
  );

  return [headers.join(","), ...csvRows].join("\n");
}

// ============================================
// MARKDOWN GENERATORS
// ============================================

/**
 * Generate polished Markdown fix script
 */
export function generateFixScriptMarkdown(data: ExportData): string {
  const date = formatDate();
  const uniqueCount = data.groupedLinks.length;
  const videoCount = data.brokenLinks.length;
  const linksWithFixes = data.groupedLinks.filter((g) => g.suggestedFix).length;

  // Calculate total estimated recovery
  const totalMonthlyLoss = data.groupedLinks.reduce((sum, g) => sum + g.estMonthlyLoss, 0);
  const estimatedRecovery = formatCurrency(Math.round(totalMonthlyLoss * 12));

  let md = `# \u{1FA7A} LinkMedic Fix Script

**Channel:** ${data.channelName}
**Generated:** ${date}
**Broken Links:** ${uniqueCount} unique links across ${videoCount} videos
**Links with Fixes:** ${linksWithFixes} of ${uniqueCount}
**Est. Annual Recovery:** ${estimatedRecovery}

---

## Progress Tracker

`;

  // Progress tracker checkboxes (truncated product names for cleaner checklist)
  data.groupedLinks.forEach((group, i) => {
    const productLabel = truncateText(group.productName || "Unknown Product", 50);
    const videoCountLabel = group.videos.length === 1 ? "1 video" : `${group.videos.length} videos`;
    md += `- [ ] Link ${i + 1}: ${productLabel} (${videoCountLabel})\n`;
  });

  md += `\n---\n\n`;

  // Individual link sections
  data.groupedLinks.forEach((group, i) => {
    const severityEmoji = SEVERITY_EMOJI[group.status] || "\u{26AA}";

    md += `## ${severityEmoji} Link ${i + 1} of ${uniqueCount} \u{2014} ${group.issueType}

`;

    md += `**Find:**
\`\`\`
${group.originalUrl}
\`\`\`

`;

    if (group.suggestedFix) {
      md += `**Replace with:**
\`\`\`
${group.suggestedFix}
\`\`\`
`;
      if (group.productName) {
        md += `*${group.productName}*`;
        if (group.confidence) {
          md += ` (${group.confidence}% match)`;
        }
        md += `\n`;
      }
    } else {
      md += `**Replace with:** *No AI suggestion available - manual search required*\n`;
    }

    md += `\n### Affected Videos (${group.videos.length})\n\n`;

    group.videos.forEach((video) => {
      const viewsFormatted = video.views.toLocaleString();
      md += `- [ ] [${video.title}](${video.studioUrl}) \u{2014} ${viewsFormatted} views\n`;
    });

    md += `\n---\n\n`;
  });

  // Footer
  md += `## Summary

Once you fix these ${uniqueCount} unique links, you'll have repaired ${videoCount} total video descriptions.

**Estimated Annual Recovery:** ${estimatedRecovery}

---

*Generated by [LinkMedic](https://link-medic.app) \u{2022} Questions? support@link-medic.app*
`;

  return md;
}

/**
 * Generate TubeBuddy guide with instructions and data
 */
export function generateTubeBuddyGuide(data: ExportData): string {
  const date = formatDate();
  const linksWithFixes = data.groupedLinks.filter((g) => g.suggestedFix);
  const count = linksWithFixes.length;

  let md = `# \u{1FA7A} LinkMedic \u{00D7} TubeBuddy Bulk Edit Guide

**Channel:** ${data.channelName}
**Generated:** ${date}
**Broken Links to Fix:** ${count}

---

## How to Use This File with TubeBuddy

### Prerequisites

- TubeBuddy browser extension installed ([tubebuddy.com](https://tubebuddy.com))
- TubeBuddy Legend plan or higher (Bulk Processing requires Legend)

### Step-by-Step Instructions

#### Step 1: Open TubeBuddy Bulk Processing

1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click the TubeBuddy icon in your browser toolbar
3. Select **Bulk Processing** \u{2192} **Description Champ**

#### Step 2: Select Your Videos

1. Use the filters to show videos containing broken links
2. Or select **All Videos** to scan everything
3. Check the boxes next to videos you want to update

#### Step 3: Set Up Find & Replace

For each broken link below, create a find/replace rule:

---

`;

  // Individual link sections
  linksWithFixes.forEach((group, i) => {
    const productLabel = truncateText(group.productName || "Product", 50);
    const videoIds = group.videos.map((v) => v.youtubeVideoId).join(",");

    md += `### Link ${i + 1}: ${productLabel}

**Find:**
\`\`\`
${group.originalUrl}
\`\`\`

**Replace:**
\`\`\`
${group.suggestedFix}
\`\`\`

**Video IDs** (for filtering):
\`\`\`
${videoIds}
\`\`\`

---

`;
  });

  md += `#### Step 4: Preview & Apply

1. Click **Preview Changes** to see what will be modified
2. Review each video's before/after description
3. Click **Apply Changes** when ready
4. Wait for TubeBuddy to process all videos

### Tips

- **Process in batches** \u{2014} Do 20-50 videos at a time to avoid timeouts
- **Double-check affiliate tags** \u{2014} Make sure your tag is intact
- **Keep this file** \u{2014} Reference it if you need to undo changes

---

## Raw CSV Data

If you prefer to import directly or use another tool, here's the raw find/replace data:

\`\`\`csv
find,replace
`;

  linksWithFixes.forEach((group) => {
    md += `${escapeCSV(group.originalUrl)},${escapeCSV(group.suggestedFix || "")}\n`;
  });

  md += `\`\`\`

---

*Generated by [LinkMedic](https://link-medic.app) \u{2022} Questions? support@link-medic.app*
`;

  return md;
}

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

export interface ExportResult {
  brokenLinksCSV: string;
  disclosureCSV: string;
  fixScriptMD: string;
  tubeBuddyGuideMD: string;
  channelName: string;
  stats: {
    uniqueBrokenLinks: number;
    totalBrokenInstances: number;
    linksWithSuggestions: number;
    disclosureIssues: number;
    estimatedAnnualRecovery: number;
  };
}

/**
 * Generate all export files for a user
 */
export async function generateAllExports(userId: string): Promise<ExportResult> {
  const data = await fetchExportData(userId);

  const brokenLinksCSV = generateBrokenLinksCSV(data);
  const disclosureCSV = generateDisclosureCSV(data);
  const fixScriptMD = generateFixScriptMarkdown(data);
  const tubeBuddyGuideMD = generateTubeBuddyGuide(data);

  const totalMonthlyLoss = data.groupedLinks.reduce((sum, g) => sum + g.estMonthlyLoss, 0);

  return {
    brokenLinksCSV,
    disclosureCSV,
    fixScriptMD,
    tubeBuddyGuideMD,
    channelName: data.channelName,
    stats: {
      uniqueBrokenLinks: data.groupedLinks.length,
      totalBrokenInstances: data.brokenLinks.length,
      linksWithSuggestions: data.groupedLinks.filter((g) => g.suggestedFix).length,
      disclosureIssues: data.disclosureIssues.length,
      estimatedAnnualRecovery: Math.round(totalMonthlyLoss * 12),
    },
  };
}

/**
 * Get safe filename from channel name
 */
export function getSafeChannelName(channelName: string): string {
  return channelName.replace(/[^a-z0-9]/gi, "_").slice(0, 30);
}

/**
 * Get filename for export type
 */
export function getExportFilename(
  channelName: string,
  type: "broken-links" | "disclosure-issues" | "fix-script" | "tubebuddy-guide"
): string {
  const safe = getSafeChannelName(channelName);
  const date = getDateString();

  switch (type) {
    case "broken-links":
      return `${safe}-broken-links-${date}.csv`;
    case "disclosure-issues":
      return `${safe}-disclosure-issues-${date}.csv`;
    case "fix-script":
      return `${safe}-fix-script-${date}.md`;
    case "tubebuddy-guide":
      return `${safe}-tubebuddy-guide-${date}.md`;
  }
}
