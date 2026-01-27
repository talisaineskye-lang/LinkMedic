/**
 * Multi-network affiliate link detection and generation
 *
 * Supports: Amazon, B&H Photo, Impact, CJ Affiliate, Rakuten, ShareASale, Awin
 */

export type AffiliateMerchant =
  | "amazon"
  | "bhphoto"
  | "impact"
  | "cj"
  | "rakuten"
  | "shareasale"
  | "awin"
  | "other";

// Domain patterns for detecting affiliate networks
export const NETWORK_PATTERNS: Record<
  Exclude<AffiliateMerchant, "other">,
  { domains: string[] }
> = {
  amazon: {
    domains: [
      "amazon.com",
      "amazon.co.uk",
      "amazon.ca",
      "amazon.de",
      "amazon.fr",
      "amazon.es",
      "amazon.it",
      "amazon.co.jp",
      "amazon.com.au",
      "amzn.to",
      "amzn.com",
      "a.co",
    ],
  },
  bhphoto: {
    domains: ["bhphotovideo.com", "bhphoto.com"],
  },
  impact: {
    domains: [
      ".sjv.io",
      ".pxf.io",
      ".pjatr.com",
      ".pjtra.com",
      ".pntrs.com",
      ".pntrac.com",
      ".evyy.net",
    ],
  },
  cj: {
    domains: [
      "anrdoezrs.net",
      "dpbolvw.net",
      "jdoqocy.com",
      "kqzyfj.com",
      "tkqlhce.com",
    ],
  },
  rakuten: {
    domains: ["click.linksynergy.com", "linksynergy.com"],
  },
  shareasale: {
    domains: ["shareasale.com"],
  },
  awin: {
    domains: ["awin1.com", "zenaps.com"],
  },
};

// Link generation templates per network
export const LINK_TEMPLATES: Record<
  Exclude<AffiliateMerchant, "other">,
  { template: string; requiredIds: string[] }
> = {
  amazon: {
    template: "https://www.amazon.com/dp/{ASIN}?tag={amazon_tag}",
    requiredIds: ["amazon_tag"],
  },
  bhphoto: {
    template: "{PRODUCT_URL}?BI={bhphoto_bi}&KBID={bhphoto_kbid}",
    requiredIds: ["bhphoto_bi", "bhphoto_kbid"],
  },
  impact: {
    template:
      "https://{TRACKING_DOMAIN}/c/{impact_sid}/{CAMPAIGN_ID}/{AD_ID}?u={ENCODED_URL}",
    requiredIds: ["impact_sid"],
  },
  cj: {
    template:
      "https://www.anrdoezrs.net/click-{cj_pid}-{ADVERTISER_ID}?url={ENCODED_URL}",
    requiredIds: ["cj_pid"],
  },
  rakuten: {
    template:
      "https://click.linksynergy.com/deeplink?id={rakuten_id}&mid={MERCHANT_ID}&murl={ENCODED_URL}",
    requiredIds: ["rakuten_id"],
  },
  shareasale: {
    template:
      "https://www.shareasale.com/r.cfm?b=0&u={shareasale_id}&m={MERCHANT_ID}&urllink={ENCODED_URL}",
    requiredIds: ["shareasale_id"],
  },
  awin: {
    template:
      "https://www.awin1.com/cread.php?awinmid={MERCHANT_ID}&awinaffid={awin_id}&ued={ENCODED_URL}",
    requiredIds: ["awin_id"],
  },
};

// Help text for Settings UI - where to find each ID
export const NETWORK_HELP: Record<string, string> = {
  bhphoto_bi: "Find in your B&H approval email or affiliate dashboard",
  bhphoto_kbid: "Find in your B&H approval email or affiliate dashboard",
  impact_sid: "Impact → Settings → Technical Settings → Account SID",
  cj_pid: "CJ → Account → Web Settings → PID",
  rakuten_id: "Rakuten → Links → Site ID",
  shareasale_id: "ShareASale → My Account → Affiliate ID",
  awin_id: "Awin → Account → Publisher ID",
};

// Display names for networks
export const NETWORK_DISPLAY_NAMES: Record<AffiliateMerchant, string> = {
  amazon: "Amazon",
  bhphoto: "B&H Photo",
  impact: "Impact",
  cj: "CJ Affiliate",
  rakuten: "Rakuten",
  shareasale: "ShareASale",
  awin: "Awin",
  other: "Other",
};

// Type for user's affiliate IDs across all networks
export interface UserAffiliateIds {
  amazon_tag: string | null;
  bhphoto_bi: string | null;
  bhphoto_kbid: string | null;
  impact_sid: string | null;
  cj_pid: string | null;
  rakuten_id: string | null;
  shareasale_id: string | null;
  awin_id: string | null;
}

// Preserved params extracted from original broken link
export interface PreservedParams {
  trackingDomain?: string; // For Impact links
  campaignId?: string; // For Impact links
  adId?: string; // For Impact links
  merchantId?: string; // For Rakuten, ShareASale, Awin
  advertiserId?: string; // For CJ links
  asin?: string; // For Amazon links
  productUrl?: string; // For B&H and deep links
}

/**
 * Detect which affiliate network a URL belongs to
 */
export function detectMerchant(url: string): AffiliateMerchant {
  try {
    const lowerUrl = url.toLowerCase();

    for (const [merchant, config] of Object.entries(NETWORK_PATTERNS)) {
      for (const domain of config.domains) {
        // Check if domain appears in the URL
        // Use includes for partial matches like ".sjv.io"
        if (domain.startsWith(".")) {
          if (lowerUrl.includes(domain)) {
            return merchant as AffiliateMerchant;
          }
        } else {
          // Full domain match
          if (
            lowerUrl.includes(`://${domain}`) ||
            lowerUrl.includes(`.${domain}`) ||
            lowerUrl.includes(`//${domain}`)
          ) {
            return merchant as AffiliateMerchant;
          }
        }
      }
    }

    return "other";
  } catch {
    return "other";
  }
}

/**
 * Check if we can auto-fix links for a given network based on user's IDs
 */
export function canAutoFix(
  merchant: AffiliateMerchant,
  userIds: UserAffiliateIds
): boolean {
  if (merchant === "other") return false;

  const template = LINK_TEMPLATES[merchant];
  if (!template) return false;

  // Check if user has all required IDs for this network
  return template.requiredIds.every((idKey) => {
    const value = userIds[idKey as keyof UserAffiliateIds];
    return value && value.trim().length > 0;
  });
}

/**
 * Extract preserved params from an existing affiliate link
 * These params should be preserved when generating a fixed link
 */
export function extractPreservedParams(
  url: string,
  merchant: AffiliateMerchant
): PreservedParams {
  const preserved: PreservedParams = {};

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    const params = urlObj.searchParams;

    switch (merchant) {
      case "amazon": {
        // Extract ASIN from various Amazon URL formats
        // Format 1: /dp/ASIN
        // Format 2: /gp/product/ASIN
        // Format 3: /gp/aw/d/ASIN
        const dpMatch = pathname.match(/\/dp\/([A-Z0-9]{10})/i);
        const gpMatch = pathname.match(/\/gp\/(?:product|aw\/d)\/([A-Z0-9]{10})/i);
        preserved.asin = dpMatch?.[1] || gpMatch?.[1];
        break;
      }

      case "bhphoto": {
        // Preserve the product URL (everything before our tracking params)
        const cleanUrl = new URL(url);
        cleanUrl.searchParams.delete("BI");
        cleanUrl.searchParams.delete("KBID");
        preserved.productUrl = cleanUrl.toString();
        break;
      }

      case "impact": {
        // Extract tracking domain, campaign ID, ad ID from Impact URL
        // Format: https://TRACKING_DOMAIN/c/ACCOUNT_SID/CAMPAIGN_ID/AD_ID?u=ENCODED_URL
        preserved.trackingDomain = hostname;
        const pathParts = pathname.split("/").filter(Boolean);
        // pathParts: ["c", "ACCOUNT_SID", "CAMPAIGN_ID", "AD_ID"]
        if (pathParts.length >= 4) {
          preserved.campaignId = pathParts[2];
          preserved.adId = pathParts[3];
        }
        // Extract the destination URL
        const destUrl = params.get("u");
        if (destUrl) {
          preserved.productUrl = decodeURIComponent(destUrl);
        }
        break;
      }

      case "cj": {
        // Extract advertiser ID from CJ URL
        // Format: click-PID-ADVERTISER_ID
        const clickMatch = pathname.match(/click-\d+-(\d+)/);
        preserved.advertiserId = clickMatch?.[1];
        // Extract destination URL
        const destUrl = params.get("url");
        if (destUrl) {
          preserved.productUrl = decodeURIComponent(destUrl);
        }
        break;
      }

      case "rakuten": {
        // Extract merchant ID
        preserved.merchantId = params.get("mid") || undefined;
        // Extract destination URL
        const destUrl = params.get("murl");
        if (destUrl) {
          preserved.productUrl = decodeURIComponent(destUrl);
        }
        break;
      }

      case "shareasale": {
        // Extract merchant ID
        preserved.merchantId = params.get("m") || undefined;
        // Extract destination URL
        const destUrl = params.get("urllink");
        if (destUrl) {
          preserved.productUrl = decodeURIComponent(destUrl);
        }
        break;
      }

      case "awin": {
        // Extract merchant ID
        preserved.merchantId = params.get("awinmid") || undefined;
        // Extract destination URL
        const destUrl = params.get("ued");
        if (destUrl) {
          preserved.productUrl = decodeURIComponent(destUrl);
        }
        break;
      }
    }
  } catch {
    // Invalid URL, return empty preserved params
  }

  return preserved;
}

/**
 * Generate a properly formatted affiliate link for a given network
 */
export function generateAffiliateLink(
  merchant: AffiliateMerchant,
  productUrl: string,
  userIds: UserAffiliateIds,
  preserved?: PreservedParams
): string | null {
  if (merchant === "other") return null;

  const templateConfig = LINK_TEMPLATES[merchant];
  if (!templateConfig) return null;

  // Check if user has required IDs
  if (!canAutoFix(merchant, userIds)) return null;

  let result = templateConfig.template;

  switch (merchant) {
    case "amazon": {
      // Use preserved ASIN or try to extract from productUrl
      const asin = preserved?.asin || extractAsinFromUrl(productUrl);
      if (!asin) return null;
      result = result
        .replace("{ASIN}", asin)
        .replace("{amazon_tag}", userIds.amazon_tag!);
      break;
    }

    case "bhphoto": {
      const baseUrl = preserved?.productUrl || productUrl;
      result = result
        .replace("{PRODUCT_URL}", baseUrl.split("?")[0]) // Remove existing params
        .replace("{bhphoto_bi}", userIds.bhphoto_bi!)
        .replace("{bhphoto_kbid}", userIds.bhphoto_kbid!);
      break;
    }

    case "impact": {
      const trackingDomain = preserved?.trackingDomain || "goto.walmart.com"; // Default
      const campaignId = preserved?.campaignId || "";
      const adId = preserved?.adId || "";
      const destUrl = preserved?.productUrl || productUrl;

      if (!campaignId || !adId) {
        // Can't generate without campaign/ad IDs
        return null;
      }

      result = result
        .replace("{TRACKING_DOMAIN}", trackingDomain)
        .replace("{impact_sid}", userIds.impact_sid!)
        .replace("{CAMPAIGN_ID}", campaignId)
        .replace("{AD_ID}", adId)
        .replace("{ENCODED_URL}", encodeURIComponent(destUrl));
      break;
    }

    case "cj": {
      const advertiserId = preserved?.advertiserId || "";
      const destUrl = preserved?.productUrl || productUrl;

      if (!advertiserId) {
        // Can't generate without advertiser ID
        return null;
      }

      result = result
        .replace("{cj_pid}", userIds.cj_pid!)
        .replace("{ADVERTISER_ID}", advertiserId)
        .replace("{ENCODED_URL}", encodeURIComponent(destUrl));
      break;
    }

    case "rakuten": {
      const merchantId = preserved?.merchantId || "";
      const destUrl = preserved?.productUrl || productUrl;

      if (!merchantId) {
        // Can't generate without merchant ID
        return null;
      }

      result = result
        .replace("{rakuten_id}", userIds.rakuten_id!)
        .replace("{MERCHANT_ID}", merchantId)
        .replace("{ENCODED_URL}", encodeURIComponent(destUrl));
      break;
    }

    case "shareasale": {
      const merchantId = preserved?.merchantId || "";
      const destUrl = preserved?.productUrl || productUrl;

      if (!merchantId) {
        // Can't generate without merchant ID
        return null;
      }

      result = result
        .replace("{shareasale_id}", userIds.shareasale_id!)
        .replace("{MERCHANT_ID}", merchantId)
        .replace("{ENCODED_URL}", encodeURIComponent(destUrl));
      break;
    }

    case "awin": {
      const merchantId = preserved?.merchantId || "";
      const destUrl = preserved?.productUrl || productUrl;

      if (!merchantId) {
        // Can't generate without merchant ID
        return null;
      }

      result = result
        .replace("{awin_id}", userIds.awin_id!)
        .replace("{MERCHANT_ID}", merchantId)
        .replace("{ENCODED_URL}", encodeURIComponent(destUrl));
      break;
    }
  }

  return result;
}

/**
 * Helper to extract ASIN from Amazon URL
 */
function extractAsinFromUrl(url: string): string | null {
  try {
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
      /\/ASIN\/([A-Z0-9]{10})/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1].toUpperCase();
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is an affiliate link from any supported network
 */
export function isAffiliateLink(url: string): boolean {
  const merchant = detectMerchant(url);
  return merchant !== "other";
}

/**
 * Get all supported affiliate domains (for filtering)
 */
export function getAllAffiliateDomains(): string[] {
  const domains: string[] = [];
  for (const config of Object.values(NETWORK_PATTERNS)) {
    domains.push(...config.domains);
  }
  return domains;
}
