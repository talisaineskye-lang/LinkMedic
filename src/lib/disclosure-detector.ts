/**
 * Affiliate Disclosure Detection Utility
 * Scans video descriptions for FTC-compliant affiliate disclosures
 *
 * A disclosure is "compliant" if:
 * - Contains clear affiliate language (not just "affiliate")
 * - Appears in first 200 characters (above the fold)
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

// COMPLIANT phrases - clear, specific language that meets FTC requirements
const COMPLIANT_PHRASES = [
  "i earn from qualifying purchases",
  "i may receive a commission",
  "i earn a commission",
  "i may earn a commission",
  "commission earned",
  "affiliate links",
  "affiliate link",
  "paid promotion",
  "as an amazon associate",
  "amazon associate",
  "at no extra cost to you",
  "at no additional cost to you",
  "i receive a small commission",
  "earn a small commission",
  "contains affiliate",
  "paid partnership",
];

// WEAK phrases - too vague or insufficient alone
const WEAK_PHRASES = [
  "affiliate",  // Too vague alone without "link" or "commission"
  "#ad",
  "#sponsored",
  "#sp",
  "#spon",
  "#collab",
  "partner",
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
 * Check if text contains a compliant phrase
 */
function findCompliantPhrase(text: string): { phrase: string; position: number } | null {
  const lowerText = text.toLowerCase();

  for (const phrase of COMPLIANT_PHRASES) {
    const index = lowerText.indexOf(phrase);
    if (index !== -1) {
      return { phrase, position: index };
    }
  }

  return null;
}

/**
 * Check if text contains a weak phrase
 */
function findWeakPhrase(text: string): { phrase: string; position: number } | null {
  const lowerText = text.toLowerCase();

  for (const phrase of WEAK_PHRASES) {
    const index = lowerText.indexOf(phrase);
    if (index !== -1) {
      return { phrase, position: index };
    }
  }

  return null;
}

/**
 * Extract context around a found phrase
 */
function extractContext(description: string, position: number, phraseLength: number): string {
  const start = Math.max(0, position - 50);
  const end = Math.min(description.length, position + phraseLength + 50);
  return description.slice(start, end).trim();
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

  const firstFold = description.slice(0, ABOVE_FOLD_THRESHOLD);
  const fullText = description;

  // Step 1: Check for compliant phrase above the fold
  const compliantAboveFold = findCompliantPhrase(firstFold);
  if (compliantAboveFold) {
    return {
      hasAffiliateLinks: true,
      affiliateLinkCount,
      disclosureStatus: "COMPLIANT",
      disclosureText: extractContext(description, compliantAboveFold.position, compliantAboveFold.phrase.length),
      disclosurePosition: compliantAboveFold.position,
      issue: null,
    };
  }

  // Step 2: Check if compliant phrase exists but is buried
  const compliantBuried = findCompliantPhrase(fullText);
  if (compliantBuried) {
    return {
      hasAffiliateLinks: true,
      affiliateLinkCount,
      disclosureStatus: "WEAK",
      disclosureText: extractContext(description, compliantBuried.position, compliantBuried.phrase.length),
      disclosurePosition: compliantBuried.position,
      issue: "Disclosure found but buried below 'Show More'. Move it to the first 2 lines.",
    };
  }

  // Step 3: Check for weak phrases only (anywhere in text)
  const weakPhrase = findWeakPhrase(fullText);
  if (weakPhrase) {
    return {
      hasAffiliateLinks: true,
      affiliateLinkCount,
      disclosureStatus: "WEAK",
      disclosureText: extractContext(description, weakPhrase.position, weakPhrase.phrase.length),
      disclosurePosition: weakPhrase.position,
      issue: "Disclosure language is too vague. Use clearer terms like 'I may earn a commission' or 'affiliate links'.",
    };
  }

  // Step 4: No disclosure found at all
  return {
    hasAffiliateLinks: true,
    affiliateLinkCount,
    disclosureStatus: "MISSING",
    disclosureText: null,
    disclosurePosition: null,
    issue: "No affiliate disclosure found. Add one above the fold.",
  };
}

/**
 * Get human-readable issue description
 */
export function getDisclosureIssueText(
  status: "COMPLIANT" | "WEAK" | "MISSING" | "UNKNOWN" | string,
  position?: number | null
): string {
  switch (status) {
    case "COMPLIANT":
      return "Disclosure properly placed";
    case "WEAK":
      if (position && position > ABOVE_FOLD_THRESHOLD) {
        return "Disclosure found but buried below 'Show More'. Move it to the first 2 lines.";
      }
      return "Disclosure language is too vague. Use clearer terms like 'affiliate links' or 'I may earn a commission'.";
    case "MISSING":
      return "No affiliate disclosure found. Add one above the fold.";
    case "UNKNOWN":
      return "Not yet scanned";
    default:
      return "Unknown status";
  }
}

// Disclosure templates for copying
export const DISCLOSURE_TEMPLATES = {
  standard: `Disclosure: As an Amazon Associate, I earn from qualifying purchases. If you click a link and buy something, I may receive a small commission at no extra cost to you.`,
  short: `Commission Earned: Links below are affiliate links that help support the channel at no extra cost to you.`,
};
