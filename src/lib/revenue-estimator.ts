/**
 * Revenue estimation settings
 */
export interface RevenueSettings {
  ctrPercent: number;      // Click-through rate (default: 2%)
  conversionPercent: number; // Conversion rate (default: 3%)
  avgOrderValue: number;   // Average order value in USD (default: $45)
}

/**
 * Default revenue estimation settings
 */
export const DEFAULT_SETTINGS: RevenueSettings = {
  ctrPercent: 2.0,
  conversionPercent: 3.0,
  avgOrderValue: 45.0,
};

/**
 * Severity factors by link status
 * Reflects the probability of actual revenue loss
 */
export const SEVERITY_FACTORS: Record<string, number> = {
  NOT_FOUND: 1.0,    // Dead / 404 - full impact
  OOS: 0.5,          // No Buy Box / unavailable - partial impact
  REDIRECT: 0.6,     // Redirect / mismatched product
  OK: 0,             // Healthy - no impact
  UNKNOWN: 0.3,      // Unknown status - conservative estimate
};

/**
 * Get exposure multiplier based on number of affected videos
 * More videos with issues = higher overall risk
 */
export function getExposureMultiplier(affectedVideoCount: number): number {
  if (affectedVideoCount >= 20) return 1.6;
  if (affectedVideoCount >= 6) return 1.4;
  if (affectedVideoCount >= 2) return 1.2;
  return 1.0;
}

/**
 * Calculates potential monthly revenue impact for a link
 *
 * Formula: Monthly Views × CTR × Conversion Rate × AOV × Severity Factor
 *
 * @param viewCount - Number of video views (lifetime)
 * @param status - Link status (NOT_FOUND, OOS, REDIRECT, OK, UNKNOWN)
 * @param settings - User's revenue estimation settings
 * @param videoAgeMonths - Age of video in months (for monthly view estimation)
 * @returns Potential monthly revenue impact in USD
 */
export function calculateRevenueImpact(
  viewCount: number,
  status: string,
  settings: RevenueSettings = DEFAULT_SETTINGS,
  videoAgeMonths: number = 12
): number {
  const { ctrPercent, conversionPercent, avgOrderValue } = settings;

  // Convert percentages to decimals
  const ctr = ctrPercent / 100;
  const conversionRate = conversionPercent / 100;

  // Get severity factor for this status
  const severityFactor = SEVERITY_FACTORS[status] ?? 0.3;

  // Estimate monthly views (lifetime views / age, with minimum of 12 months)
  // Using 12-month floor to avoid inflating estimates for recent videos
  const ageInMonths = Math.max(videoAgeMonths, 12);
  const monthlyViews = viewCount / ageInMonths;

  // Calculate potential monthly revenue impact
  // Monthly Views × CTR × Conversion Rate × AOV × Severity Factor
  const impact = monthlyViews * ctr * conversionRate * avgOrderValue * severityFactor;

  // Round to 2 decimal places
  return Math.round(impact * 100) / 100;
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use calculateRevenueImpact instead
 */
export function calculateEstimatedLoss(
  viewCount: number,
  settings: RevenueSettings = DEFAULT_SETTINGS
): number {
  // Use NOT_FOUND severity (1.0) for backwards compatibility
  return calculateRevenueImpact(viewCount, "NOT_FOUND", settings, 12);
}

/**
 * Calculates the total potential monthly revenue impact across multiple links
 * Applies exposure multiplier based on number of affected videos
 */
export function calculateTotalRevenueImpact(
  links: Array<{ viewCount: number; status: string; videoAgeMonths?: number }>,
  settings: RevenueSettings = DEFAULT_SETTINGS
): number {
  // Count unique affected videos (those with non-OK status)
  const affectedLinks = links.filter(l => l.status !== "OK");
  const exposureMultiplier = getExposureMultiplier(affectedLinks.length);

  // Sum individual impacts
  const baseImpact = links.reduce(
    (sum, link) => sum + calculateRevenueImpact(
      link.viewCount,
      link.status,
      settings,
      link.videoAgeMonths ?? 12
    ),
    0
  );

  // Apply exposure multiplier
  const totalImpact = baseImpact * exposureMultiplier;

  return Math.round(totalImpact * 100) / 100;
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use calculateTotalRevenueImpact instead
 */
export function calculateTotalLoss(
  links: Array<{ viewCount: number }>,
  settings: RevenueSettings = DEFAULT_SETTINGS
): number {
  const total = links.reduce(
    (sum, link) => sum + calculateEstimatedLoss(link.viewCount, settings),
    0
  );
  return Math.round(total * 100) / 100;
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
 * Gets risk level based on estimated loss
 */
export function getRiskLevel(estimatedLoss: number): "low" | "medium" | "high" | "critical" {
  if (estimatedLoss >= 1000) return "critical";
  if (estimatedLoss >= 500) return "high";
  if (estimatedLoss >= 100) return "medium";
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

  return {
    valid: errors.length === 0,
    errors,
  };
}
