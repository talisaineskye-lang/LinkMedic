/**
 * Revenue Estimation Engine v2.1
 *
 * Implements a realistic affiliate revenue loss calculation:
 * Monthly Revenue Loss = Monthly Views × CTR × Conversion Rate × AOV × Commission % × Severity
 *
 * Key improvements:
 * - Decay function for older videos (views decline over time)
 * - Commission rate included (creator's actual cut, not GMV)
 * - Niche-based presets for CTR, CR, AOV, and evergreen defaults
 * - Adjusted severity factors based on real affiliate behavior
 * - MISSING_TAG detection for links without affiliate tags
 * - Removed artificial "exposure multiplier" - use annualized display instead
 */

/**
 * Creator niche types for presets
 */
export type CreatorNiche = "tech" | "beauty" | "finance" | "lifestyle" | "gaming" | "education" | "fitness" | "food" | "default";

/**
 * Niche-specific defaults
 * Reflects real-world affiliate marketing patterns:
 * - Tech: High AOV, low CR (expensive items, considered purchases)
 * - Beauty: Low AOV, high CR (impulse buys, frequent purchases)
 * - Education: Evergreen content (tutorials, how-tos)
 */
export interface NicheDefaults {
  ctrPercent: number;         // Click-through rate
  conversionPercent: number;  // Conversion rate after click
  avgOrderValue: number;      // Average order value in USD
  commissionPercent: number;  // Default commission rate
  isEvergreen: boolean;       // Whether content tends to be evergreen
}

export const NICHE_DEFAULTS: Record<CreatorNiche, NicheDefaults> = {
  tech: {
    ctrPercent: 5.0,          // High - viewers want product links
    conversionPercent: 1.0,   // Low - expensive, considered purchases
    avgOrderValue: 350,       // High - cameras, laptops, phones
    commissionPercent: 4.0,   // Amazon Electronics ~4%
    isEvergreen: false,       // Products go obsolete
  },
  gaming: {
    ctrPercent: 4.0,
    conversionPercent: 1.5,
    avgOrderValue: 150,       // Peripherals, games
    commissionPercent: 4.0,
    isEvergreen: false,       // Games/gear go obsolete
  },
  finance: {
    ctrPercent: 4.0,
    conversionPercent: 2.0,   // Medium - tools, courses
    avgOrderValue: 100,       // Books, software, courses
    commissionPercent: 5.0,   // Higher for financial products
    isEvergreen: true,        // "How to budget" stays relevant
  },
  beauty: {
    ctrPercent: 3.0,
    conversionPercent: 6.0,   // High - impulse/repeat purchases
    avgOrderValue: 35,        // Low - cosmetics, skincare
    commissionPercent: 4.0,   // Amazon Beauty ~4%
    isEvergreen: false,       // Trends change
  },
  fitness: {
    ctrPercent: 3.0,
    conversionPercent: 4.0,
    avgOrderValue: 60,        // Supplements, equipment
    commissionPercent: 4.0,
    isEvergreen: true,        // Workout routines stay relevant
  },
  food: {
    ctrPercent: 2.5,
    conversionPercent: 5.0,   // High - recipe ingredients
    avgOrderValue: 40,        // Kitchen tools, ingredients
    commissionPercent: 4.0,
    isEvergreen: true,        // Recipes are timeless
  },
  education: {
    ctrPercent: 2.0,
    conversionPercent: 3.0,
    avgOrderValue: 50,        // Books, courses, tools
    commissionPercent: 4.0,
    isEvergreen: true,        // Tutorials stay relevant
  },
  lifestyle: {
    ctrPercent: 1.5,          // Low - casual viewers
    conversionPercent: 3.0,
    avgOrderValue: 45,
    commissionPercent: 4.0,
    isEvergreen: false,
  },
  default: {
    ctrPercent: 2.0,
    conversionPercent: 3.0,
    avgOrderValue: 45,
    commissionPercent: 4.0,
    isEvergreen: false,
  },
};

/**
 * Revenue estimation settings
 */
export interface RevenueSettings {
  ctrPercent: number;          // Click-through rate (default varies by niche)
  conversionPercent: number;   // Conversion rate after click (default: 3%)
  avgOrderValue: number;       // Average order value in USD (default: $45)
  commissionPercent?: number;  // Affiliate commission rate (default: 4%) - optional for backwards compat
  niche?: CreatorNiche;        // Creator's niche for presets
}

/**
 * Default revenue estimation settings (industry average for paid tool)
 */
export const DEFAULT_SETTINGS: RevenueSettings = {
  ctrPercent: 2.0,
  conversionPercent: 3.0,
  avgOrderValue: 45.0,
  commissionPercent: 4.0,
  niche: "default",
};

/**
 * Conservative settings for free audit tool
 * Uses lower estimates to build trust and avoid "snake oil" accusations
 *
 * Rationale:
 * - CTR: 1.0% (vs 2.5% industry avg) - assumes not all viewers see description
 * - Conversion: 1.5% (vs 3.0% avg) - conservative for cold traffic
 * - Commission: 3.0% (vs 4.0% avg) - assumes mostly Amazon at lower rates
 * - OOS Severity: 0.4 (vs 0.5) - more credit to Amazon's "similar items"
 */
export const CONSERVATIVE_SETTINGS: RevenueSettings = {
  ctrPercent: 1.0,
  conversionPercent: 1.5,
  avgOrderValue: 45.0,
  commissionPercent: 3.0,
  niche: "default",
};

/**
 * Conservative severity factors for free audit
 * More generous assumptions about partial recovery
 */
export const CONSERVATIVE_SEVERITY_FACTORS: Record<string, number> = {
  MISSING_TAG: 1.0,      // Full loss - no commission earned
  NOT_FOUND: 1.0,        // Full loss - dead link / dog page / search fallback
  OOS: 0.4,              // 60% "saved" by Amazon's similar items
  OOS_THIRD_PARTY: 0.2,  // 80% still converts via third party (conservative)
  REDIRECT: 0.2,         // 80% still converts via redirect
  OK: 0,
  UNKNOWN: 0.2,
};

/**
 * Get default settings for a specific niche
 * Returns full settings based on niche-specific benchmarks
 */
export function getSettingsForNiche(niche: CreatorNiche): RevenueSettings {
  const defaults = NICHE_DEFAULTS[niche] || NICHE_DEFAULTS.default;
  return {
    ctrPercent: defaults.ctrPercent,
    conversionPercent: defaults.conversionPercent,
    avgOrderValue: defaults.avgOrderValue,
    commissionPercent: defaults.commissionPercent,
    niche,
  };
}

/**
 * Check if a niche is typically evergreen
 */
export function isNicheEvergreen(niche: CreatorNiche): boolean {
  return NICHE_DEFAULTS[niche]?.isEvergreen ?? false;
}

/**
 * Severity factors by link status
 * Reflects the probability of actual revenue loss
 *
 * Key insights:
 * - MISSING_TAG: Link works but no commission earned (100% loss)
 * - NOT_FOUND: Complete loss, no sale possible (includes soft 404s like search fallback)
 * - OOS: Amazon shows "Similar Items", some halo effect
 * - OOS_THIRD_PARTY: Third party sellers available, lower trust but still converts
 * - REDIRECT: Often goes to newer/better products that still convert
 */
export const SEVERITY_FACTORS: Record<string, number> = {
  MISSING_TAG: 1.0,      // Link works but affiliate tag missing/stripped - full loss
  NOT_FOUND: 1.0,        // Dead / 404 / Dog Page / Search Fallback - complete loss
  OOS: 0.5,              // Out of stock - Amazon shows "Similar Items", some halo effect
  OOS_THIRD_PARTY: 0.3,  // Third party sellers only - lower trust, still converts
  REDIRECT: 0.3,         // Redirect to different product - often still converts
  OK: 0,                 // Healthy - no impact
  UNKNOWN: 0.3,          // Unknown status - conservative estimate
};

/**
 * Calculates estimated current monthly views using a decay function
 *
 * YouTube views follow a power-law decay:
 * - First month: highest views (viral period)
 * - Months 2-6: moderate views (recommendation algorithm)
 * - Months 7-12: declining views
 * - 12+ months: "long tail" - typically 5-10% of average monthly
 *
 * For evergreen/search content, decay is slower
 *
 * @param lifetimeViews - Total views the video has received
 * @param videoAgeMonths - How old the video is
 * @param isEvergreen - True for search-heavy/tutorial content that ages well
 * @param actualMonthlyViews - If available from Analytics API, use this directly
 * @returns Estimated current monthly views
 */
export function estimateCurrentMonthlyViews(
  lifetimeViews: number,
  videoAgeMonths: number,
  isEvergreen: boolean = false,
  actualMonthlyViews?: number
): number {
  // If we have actual analytics data, use it directly (most accurate)
  if (actualMonthlyViews !== undefined && actualMonthlyViews >= 0) {
    return actualMonthlyViews;
  }

  // Calculate naive average
  const ageInMonths = Math.max(videoAgeMonths, 1);
  const naiveMonthlyAverage = lifetimeViews / ageInMonths;

  // For recent videos (< 3 months), use naive average
  // They're still in their "growth" phase
  if (videoAgeMonths < 3) {
    return naiveMonthlyAverage;
  }

  // For videos 3-12 months old, apply mild decay
  if (videoAgeMonths <= 12) {
    const decayFactor = isEvergreen ? 0.7 : 0.5;
    return naiveMonthlyAverage * decayFactor;
  }

  // For videos > 12 months old, apply strong decay
  // Evergreen content retains ~15% of average, regular content ~7%
  const longTailFactor = isEvergreen ? 0.15 : 0.07;
  return naiveMonthlyAverage * longTailFactor;
}

/**
 * Calculates potential monthly revenue impact for a single link
 *
 * Formula: Monthly Views × CTR × Conversion Rate × AOV × Commission % × Severity
 *
 * This represents the creator's ACTUAL lost earnings, not gross merchandise value.
 *
 * @param viewCount - Number of video views (lifetime)
 * @param status - Link status (MISSING_TAG, NOT_FOUND, OOS, REDIRECT, OK, UNKNOWN)
 * @param settings - User's revenue estimation settings
 * @param videoAgeMonths - Age of video in months
 * @param isEvergreen - Whether this is evergreen/search content
 * @param actualMonthlyViews - Actual monthly views from Analytics API (if available)
 * @param useConservativeSeverity - Use conservative severity factors (for free audit)
 * @returns Potential monthly revenue impact in USD (creator's commission)
 */
export function calculateRevenueImpact(
  viewCount: number,
  status: string,
  settings: RevenueSettings = DEFAULT_SETTINGS,
  videoAgeMonths: number = 12,
  isEvergreen: boolean = false,
  actualMonthlyViews?: number,
  useConservativeSeverity: boolean = false
): number {
  const { ctrPercent, conversionPercent, avgOrderValue, commissionPercent = 4.0 } = settings;

  // Convert percentages to decimals
  const ctr = ctrPercent / 100;
  const conversionRate = conversionPercent / 100;
  const commissionRate = commissionPercent / 100;

  // Get severity factor for this status
  const severityFactors = useConservativeSeverity ? CONSERVATIVE_SEVERITY_FACTORS : SEVERITY_FACTORS;
  const severityFactor = severityFactors[status] ?? 0.3;

  // If status is OK, no impact
  if (severityFactor === 0) {
    return 0;
  }

  // Estimate current monthly views (with decay function)
  const monthlyViews = estimateCurrentMonthlyViews(
    viewCount,
    videoAgeMonths,
    isEvergreen,
    actualMonthlyViews
  );

  // Calculate potential monthly revenue impact
  // Monthly Views × CTR × CR × AOV × Commission % × Severity
  const impact = monthlyViews * ctr * conversionRate * avgOrderValue * commissionRate * severityFactor;

  // Round to 2 decimal places
  return Math.round(impact * 100) / 100;
}

/**
 * Extended link data for more accurate calculations
 */
export interface LinkData {
  viewCount: number;
  status: string;
  videoAgeMonths?: number;
  isEvergreen?: boolean;
  actualMonthlyViews?: number;
}

/**
 * Calculates the total potential monthly revenue impact across multiple links
 * No artificial multipliers - just sum of individual impacts
 */
export function calculateTotalRevenueImpact(
  links: LinkData[],
  settings: RevenueSettings = DEFAULT_SETTINGS
): number {
  const total = links.reduce(
    (sum, link) => sum + calculateRevenueImpact(
      link.viewCount,
      link.status,
      settings,
      link.videoAgeMonths ?? 12,
      link.isEvergreen ?? false,
      link.actualMonthlyViews
    ),
    0
  );

  return Math.round(total * 100) / 100;
}

/**
 * Calculates annualized revenue impact
 * Use this for display instead of artificial multipliers
 * "$X/month" feels small, "$Y/year" feels significant
 */
export function calculateAnnualizedImpact(monthlyImpact: number): number {
  return Math.round(monthlyImpact * 12 * 100) / 100;
}

/**
 * Formats a monetary value for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats revenue impact with both monthly and annual
 */
export function formatRevenueImpact(monthlyAmount: number): {
  monthly: string;
  annual: string;
} {
  return {
    monthly: formatCurrency(monthlyAmount),
    annual: formatCurrency(calculateAnnualizedImpact(monthlyAmount)),
  };
}

/**
 * Formats a large number for display (e.g., 1.2K, 1.5M)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Gets risk level based on estimated monthly loss
 * Thresholds adjusted for more realistic commission-based amounts
 */
export function getRiskLevel(estimatedLoss: number): "low" | "medium" | "high" | "critical" {
  if (estimatedLoss >= 100) return "critical";  // $100+/month is significant
  if (estimatedLoss >= 50) return "high";       // $50+/month
  if (estimatedLoss >= 10) return "medium";     // $10+/month
  return "low";
}

/**
 * Validates revenue settings
 */
export function validateSettings(settings: Partial<RevenueSettings>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (settings.ctrPercent !== undefined) {
    if (settings.ctrPercent < 0 || settings.ctrPercent > 100) {
      errors.push("CTR must be between 0 and 100%");
    }
  }

  if (settings.conversionPercent !== undefined) {
    if (settings.conversionPercent < 0 || settings.conversionPercent > 100) {
      errors.push("Conversion rate must be between 0 and 100%");
    }
  }

  if (settings.avgOrderValue !== undefined) {
    if (settings.avgOrderValue < 0) {
      errors.push("Average order value must be positive");
    }
    if (settings.avgOrderValue > 10000) {
      errors.push("Average order value seems too high");
    }
  }

  if (settings.commissionPercent !== undefined) {
    if (settings.commissionPercent < 0 || settings.commissionPercent > 50) {
      errors.push("Commission rate must be between 0 and 50%");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// REVENUE RECOVERY ENGINE - "LEAKAGE" CALCULATION
// ============================================

/**
 * Link scan result for leakage calculation
 */
export interface ScanResult {
  url: string;
  status: string;
  severity: number;
  reason?: string;
}

/**
 * Leakage summary returned by calculateVideoLeakage
 */
export interface LeakageSummary {
  monthly: number;
  annual: number;
  linkCount: number;
  brokenCount: number;
  breakdown: {
    deadLinks: { count: number; annualLoss: number };
    searchRedirects: { count: number; annualLoss: number };
    missingTags: { count: number; annualLoss: number };
    outOfStock: { count: number; annualLoss: number };
    thirdPartyOnly: { count: number; annualLoss: number };
  };
}

/**
 * LinkMedic Revenue Summary Logic
 * Calculates the monthly and annual "Leakage" for a video or channel.
 *
 * This function should be called after the bot finishes scanning links.
 *
 * @param scanResults - Array of link scan results with status and severity
 * @param monthlyViews - Estimated monthly views for the video/channel
 * @param settings - Optional custom revenue settings (defaults to conservative)
 * @returns LeakageSummary with monthly/annual loss and breakdown
 */
export function calculateVideoLeakage(
  scanResults: ScanResult[],
  monthlyViews: number,
  settings: RevenueSettings = CONSERVATIVE_SETTINGS
): LeakageSummary {
  const { ctrPercent, conversionPercent, avgOrderValue, commissionPercent = 4.0 } = settings;

  // Convert percentages to decimals
  const ctr = ctrPercent / 100;
  const cr = conversionPercent / 100;
  const commission = commissionPercent / 100;

  // Revenue per click
  const revenuePerClick = cr * avgOrderValue * commission;

  // Estimate clicks per link (distribute CTR across all links)
  const linksWithIssues = scanResults.filter(l => l.severity > 0);
  const estimatedMonthlyClicks = monthlyViews * ctr;

  // Initialize breakdown counters
  const breakdown = {
    deadLinks: { count: 0, annualLoss: 0 },
    searchRedirects: { count: 0, annualLoss: 0 },
    missingTags: { count: 0, annualLoss: 0 },
    outOfStock: { count: 0, annualLoss: 0 },
    thirdPartyOnly: { count: 0, annualLoss: 0 },
  };

  let totalMonthlyLoss = 0;

  scanResults.forEach(link => {
    if (link.severity === 0) return; // Skip healthy links

    // Calculate loss for this link
    // Assuming clicks are distributed evenly across all links in description
    const linkClicks = estimatedMonthlyClicks / Math.max(scanResults.length, 1);
    const linkLoss = linkClicks * revenuePerClick * link.severity;

    totalMonthlyLoss += linkLoss;

    // Categorize for breakdown
    const annualLinkLoss = linkLoss * 12;

    switch (link.status) {
      case "NOT_FOUND":
        // Check if it's a search redirect
        if (link.reason?.includes("Search Fallback")) {
          breakdown.searchRedirects.count++;
          breakdown.searchRedirects.annualLoss += annualLinkLoss;
        } else {
          breakdown.deadLinks.count++;
          breakdown.deadLinks.annualLoss += annualLinkLoss;
        }
        break;
      case "MISSING_TAG":
        breakdown.missingTags.count++;
        breakdown.missingTags.annualLoss += annualLinkLoss;
        break;
      case "OOS":
        breakdown.outOfStock.count++;
        breakdown.outOfStock.annualLoss += annualLinkLoss;
        break;
      case "OOS_THIRD_PARTY":
        breakdown.thirdPartyOnly.count++;
        breakdown.thirdPartyOnly.annualLoss += annualLinkLoss;
        break;
      case "REDIRECT":
        // Treat non-search redirects as potential issues
        breakdown.deadLinks.count++;
        breakdown.deadLinks.annualLoss += annualLinkLoss;
        break;
    }
  });

  // Round breakdown losses
  breakdown.deadLinks.annualLoss = Math.round(breakdown.deadLinks.annualLoss);
  breakdown.searchRedirects.annualLoss = Math.round(breakdown.searchRedirects.annualLoss);
  breakdown.missingTags.annualLoss = Math.round(breakdown.missingTags.annualLoss);
  breakdown.outOfStock.annualLoss = Math.round(breakdown.outOfStock.annualLoss);
  breakdown.thirdPartyOnly.annualLoss = Math.round(breakdown.thirdPartyOnly.annualLoss);

  return {
    monthly: Math.round(totalMonthlyLoss * 100) / 100,
    annual: Math.round(totalMonthlyLoss * 12),
    linkCount: scanResults.length,
    brokenCount: linksWithIssues.length,
    breakdown,
  };
}

/**
 * Formats leakage summary for display
 * Returns headline and subtitle strings for UI
 */
export function formatLeakageSummary(summary: LeakageSummary): {
  headline: string;
  subtitle: string;
  disclaimer: string;
} {
  return {
    headline: `We found ${formatCurrency(summary.annual)} in Recoverable Annual Revenue.`,
    subtitle: `You are currently losing approximately ${formatCurrency(summary.monthly)} per month due to ${summary.brokenCount} broken or un-tagged links.`,
    disclaimer: "Calculations based on conservative industry benchmarks (1.5% CTR / 3% CR). Your actual loss may be higher depending on your specific niche engagement.",
  };
}

// ============================================
// Legacy functions for backwards compatibility
// ============================================

/**
 * @deprecated Exposure multiplier is removed - no longer used
 * Keeping stub for any code that might reference it
 */
export function getExposureMultiplier(_affectedVideoCount: number): number {
  // Always return 1 - we no longer artificially inflate numbers
  return 1.0;
}

/**
 * @deprecated Use calculateRevenueImpact instead
 */
export function calculateEstimatedLoss(
  viewCount: number,
  settings: RevenueSettings = DEFAULT_SETTINGS
): number {
  return calculateRevenueImpact(viewCount, "NOT_FOUND", settings, 12);
}

/**
 * @deprecated Use calculateTotalRevenueImpact instead
 */
export function calculateTotalLoss(
  links: Array<{ viewCount: number }>,
  settings: RevenueSettings = DEFAULT_SETTINGS
): number {
  const linksWithStatus = links.map(l => ({ ...l, status: "NOT_FOUND" }));
  return calculateTotalRevenueImpact(linksWithStatus, settings);
}

/**
 * Legacy CTR defaults - use NICHE_DEFAULTS instead
 * @deprecated Use NICHE_DEFAULTS[niche].ctrPercent
 */
export const NICHE_CTR_DEFAULTS: Record<CreatorNiche, number> = Object.fromEntries(
  Object.entries(NICHE_DEFAULTS).map(([niche, defaults]) => [niche, defaults.ctrPercent])
) as Record<CreatorNiche, number>;
