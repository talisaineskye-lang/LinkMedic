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
 * Calculates estimated revenue loss for a broken/OOS link
 *
 * Formula: Video Views × CTR × Conversion Rate × AOV
 *
 * @param viewCount - Number of video views
 * @param settings - User's revenue estimation settings
 * @returns Estimated revenue loss in USD
 */
export function calculateEstimatedLoss(
  viewCount: number,
  settings: RevenueSettings = DEFAULT_SETTINGS
): number {
  const { ctrPercent, conversionPercent, avgOrderValue } = settings;

  // Convert percentages to decimals
  const ctr = ctrPercent / 100;
  const conversionRate = conversionPercent / 100;

  // Calculate estimated loss
  // Views × CTR = estimated clicks
  // Clicks × Conversion Rate = estimated purchases
  // Purchases × AOV = estimated revenue
  const estimatedLoss = viewCount * ctr * conversionRate * avgOrderValue;

  // Round to 2 decimal places
  return Math.round(estimatedLoss * 100) / 100;
}

/**
 * Calculates the total estimated loss across multiple links
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
