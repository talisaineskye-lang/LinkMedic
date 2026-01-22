/**
 * Affiliate Disclosure Detection Utility
 * Scans video descriptions for FTC-compliant affiliate disclosures
 */

// Affiliate link patterns to detect
const AFFILIATE_LINK_PATTERNS = [
  // Amazon
  /amzn\.to\//i,
  /amazon\.[a-z.]+.*[?&]tag=/i,
  /amazon\.[a-z.]+\/.*\/dp\//i,

  // Link shorteners commonly used for affiliate
  /bit\.ly\//i,
  /geni\.us\//i,
  /howl\.me\//i,
  /rstyle\.me\//i,
  /shrsl\.com\//i,
  /linktr\.ee\//i,

  // Generic affiliate tracking params
  /[?&]ref=/i,
  /[?&]aff=/i,
  /[?&]affiliate=/i,
  /[?&]partner=/i,
  /[?&]tracking=/i,

  // E-commerce platforms with tracking
  /shopify\.[a-z.]+.*[?&]ref=/i,
  /gumroad\.com.*[?&]ref=/i,

  // Other affiliate networks
  /shareasale\.com/i,
  /awin1\.com/i,
  /commission-junction|cj\.com/i,
  /impact\.com/i,
  /rakuten\.com.*affiliate/i,
];

// Disclosure keywords (case-insensitive)
const DISCLOSURE_KEYWORDS = [
  "affiliate",
  "commission",
  "paid link",
  "sponsored",
  "#ad",
  "partner link",
  "i may earn",
  "at no extra cost to you",
  "i earn from qualifying purchases",
  "amazon associate",
  "affiliate link",
  "affiliate program",
  "paid partnership",
  "contains affiliate",
  "earn a commission",
  "small commission",
];

// Common disclosure phrases (for better matching)
const DISCLOSURE_PHRASES = [
  /affiliate\s+link/i,
  /affiliate\s+disclosure/i,
  /paid\s+partner/i,
  /sponsored\s+link/i,
  /earn\s+(a\s+)?commission/i,
  /may\s+earn\s+(a\s+)?(small\s+)?commission/i,
  /at\s+no\s+(extra|additional)\s+cost\s+to\s+you/i,
  /amazon\s+associate/i,
  /qualifying\s+purchases/i,
  /#ad\b/i,
  /\bad\b/i, // standalone "ad" word
];

// Position threshold for "above the fold" (first 200 characters)
const ABOVE_FOLD_THRESHOLD = 200;

export interface DisclosureResult {
  hasAffiliateLinks: boolean;
  affiliateLinkCount: number;
  disclosureStatus: "COMPLIANT" | "WEAK" | "MISSING" | "UNKNOWN";
  disclosureText: string | null;
  disclosurePosition: number | null;
  issue: string | null;
}

/**
 * Count affiliate links in description
 */
function countAffiliateLinks(description: string): number {
  let count = 0;

  // Extract all URLs from description
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const urls = description.match(urlRegex) || [];

  for (const url of urls) {
    for (const pattern of AFFILIATE_LINK_PATTERNS) {
      if (pattern.test(url)) {
        count++;
        break; // Don't double-count same URL
      }
    }
  }

  return count;
}

/**
 * Find disclosure in description
 * Returns the position and text of the first disclosure found
 */
function findDisclosure(description: string): { position: number; text: string } | null {
  const lowerDesc = description.toLowerCase();

  // First check for phrase patterns (more accurate)
  for (const pattern of DISCLOSURE_PHRASES) {
    const match = description.match(pattern);
    if (match && match.index !== undefined) {
      // Extract surrounding context (up to 100 chars before and after)
      const start = Math.max(0, match.index - 50);
      const end = Math.min(description.length, match.index + match[0].length + 50);
      const context = description.slice(start, end).trim();

      return {
        position: match.index,
        text: context,
      };
    }
  }

  // Fall back to keyword search
  for (const keyword of DISCLOSURE_KEYWORDS) {
    const index = lowerDesc.indexOf(keyword.toLowerCase());
    if (index !== -1) {
      // Extract surrounding context
      const start = Math.max(0, index - 50);
      const end = Math.min(description.length, index + keyword.length + 50);
      const context = description.slice(start, end).trim();

      return {
        position: index,
        text: context,
      };
    }
  }

  return null;
}

/**
 * Analyze a video description for affiliate disclosure compliance
 */
export function analyzeDisclosure(description: string | null | undefined): DisclosureResult {
  // Handle empty/null descriptions
  if (!description || description.trim().length === 0) {
    return {
      hasAffiliateLinks: false,
      affiliateLinkCount: 0,
      disclosureStatus: "UNKNOWN",
      disclosureText: null,
      disclosurePosition: null,
      issue: null,
    };
  }

  // Count affiliate links
  const affiliateLinkCount = countAffiliateLinks(description);
  const hasAffiliateLinks = affiliateLinkCount > 0;

  // If no affiliate links, no disclosure needed
  if (!hasAffiliateLinks) {
    return {
      hasAffiliateLinks: false,
      affiliateLinkCount: 0,
      disclosureStatus: "COMPLIANT", // No disclosure needed
      disclosureText: null,
      disclosurePosition: null,
      issue: null,
    };
  }

  // Find disclosure
  const disclosure = findDisclosure(description);

  if (!disclosure) {
    return {
      hasAffiliateLinks: true,
      affiliateLinkCount,
      disclosureStatus: "MISSING",
      disclosureText: null,
      disclosurePosition: null,
      issue: "No affiliate disclosure found",
    };
  }

  // Check if disclosure is "above the fold"
  if (disclosure.position <= ABOVE_FOLD_THRESHOLD) {
    return {
      hasAffiliateLinks: true,
      affiliateLinkCount,
      disclosureStatus: "COMPLIANT",
      disclosureText: disclosure.text,
      disclosurePosition: disclosure.position,
      issue: null,
    };
  }

  // Disclosure exists but is buried
  return {
    hasAffiliateLinks: true,
    affiliateLinkCount,
    disclosureStatus: "WEAK",
    disclosureText: disclosure.text,
    disclosurePosition: disclosure.position,
    issue: `Disclosure buried at position ${disclosure.position} (should be in first ${ABOVE_FOLD_THRESHOLD} characters)`,
  };
}

/**
 * Get human-readable issue description
 */
export function getDisclosureIssueText(
  status: "COMPLIANT" | "WEAK" | "MISSING" | "UNKNOWN",
  position?: number | null
): string {
  switch (status) {
    case "COMPLIANT":
      return "Disclosure properly placed";
    case "WEAK":
      return position
        ? `Disclosure buried at character ${position}`
        : "Disclosure buried below the fold";
    case "MISSING":
      return "No disclosure found";
    case "UNKNOWN":
      return "Not yet scanned";
    default:
      return "Unknown status";
  }
}
