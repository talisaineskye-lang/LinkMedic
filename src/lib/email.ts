import { Resend } from "resend";
import { formatCurrency } from "./revenue-estimator";

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_your")
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Update this once domain is verified
const FROM_EMAIL = "LinkMedic <hello@link-medic.app>";
const APP_URL = "https://link-medic.app";

export interface BrokenLinkAlert {
  userEmail: string;
  userName: string;
  videoTitle: string;
  brokenUrl: string;
  status: "NOT_FOUND" | "OOS";
  estimatedLoss: number;
}

/**
 * Sends an email alert for a broken or out-of-stock link
 */
export async function sendBrokenLinkAlert(alert: BrokenLinkAlert): Promise<boolean> {
  if (!resend) {
    console.warn("Email not configured - skipping broken link alert");
    return false;
  }

  const statusText = alert.status === "NOT_FOUND" ? "Broken (404)" : "Out of Stock";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: alert.userEmail,
      subject: `[LinkMedic] ${statusText} Link Detected`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Alert: ${statusText} Link Detected</h2>

          <p style="color: #4b5563;">Hi ${alert.userName || "there"},</p>

          <p style="color: #4b5563;">
            We detected a problem with one of your affiliate links:
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Video:</strong> ${alert.videoTitle}</p>
            <p style="margin: 0 0 8px 0;"><strong>Link:</strong> <a href="${alert.brokenUrl}" style="color: #2563eb;">${alert.brokenUrl}</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="color: ${alert.status === "NOT_FOUND" ? "#dc2626" : "#d97706"};">${statusText}</span></p>
            <p style="margin: 0;"><strong>Estimated Loss:</strong> <span style="color: #dc2626;">${formatCurrency(alert.estimatedLoss)}</span></p>
          </div>

          <p style="color: #4b5563;">
            <strong>Recommended Action:</strong> Review and update the link in your video description.
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            — The LinkMedic Team
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email alert:", error);
    return false;
  }
}

export interface ScanSummaryAlert {
  userEmail: string;
  userName: string;
  totalScanned: number;
  issuesFound: number;
  totalEstimatedLoss: number;
}

/**
 * Sends a summary email after a scan completes
 */
export async function sendScanSummaryAlert(alert: ScanSummaryAlert): Promise<boolean> {
  if (!resend) {
    console.warn("Email not configured - skipping scan summary alert");
    return false;
  }

  if (alert.issuesFound === 0) {
    return true; // Don't send email if no issues
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: alert.userEmail,
      subject: `[LinkMedic] Scan Complete: ${alert.issuesFound} Issues Found`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Weekly Scan Complete</h2>

          <p style="color: #4b5563;">Hi ${alert.userName || "there"},</p>

          <p style="color: #4b5563;">
            Your weekly link scan has completed. Here's a summary:
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Links Scanned:</strong> ${alert.totalScanned}</p>
            <p style="margin: 0 0 8px 0;"><strong>Issues Found:</strong> <span style="color: #dc2626;">${alert.issuesFound}</span></p>
            <p style="margin: 0;"><strong>Estimated Revenue at Risk:</strong> <span style="color: #dc2626;">${formatCurrency(alert.totalEstimatedLoss)}</span></p>
          </div>

          <p style="color: #4b5563;">
            <a href="${APP_URL}/fix-center" style="color: #2563eb;">View all issues →</a>
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            — The LinkMedic Team
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send scan summary email:", error);
    return false;
  }
}

/**
 * Sends a welcome email to new users
 */
export async function sendWelcomeEmail(to: string, name?: string): Promise<{ success: boolean; error?: unknown; data?: unknown }> {
  if (!resend) {
    console.warn("[Email] Not configured - skipping welcome email");
    return { success: false, error: "Email not configured" };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to LinkMedic!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Welcome${name ? `, ${name}` : ""}!</h1>
        <p style="color: #4b5563;">Thanks for signing up for LinkMedic.</p>
        <p style="color: #4b5563;">Here's how to get started:</p>
        <ol style="color: #4b5563;">
          <li>Connect your YouTube channel</li>
          <li>We'll scan your videos for broken affiliate links</li>
          <li>Fix them with one click</li>
        </ol>
        <p style="margin-top: 24px;">
          <a href="${APP_URL}/dashboard" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to your dashboard →</a>
        </p>
        <p style="color: #4b5563; margin-top: 24px;">Questions? Just reply to this email.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          — The LinkMedic Team
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[Email] Welcome email error:", error);
    return { success: false, error };
  }

  console.log(`[Email] Welcome email sent to ${to}`, data);
  return { success: true, data };
}

export interface WeeklyAlertData {
  brokenLinks: number;
  estimatedLoss: number;
  topIssues: { videoTitle: string; link: string }[];
}

/**
 * Sends a weekly alert email with broken links summary
 */
export async function sendWeeklyAlert(
  to: string,
  alertData: WeeklyAlertData
): Promise<{ success: boolean; error?: unknown; data?: unknown }> {
  if (!resend) {
    console.warn("[Email] Not configured - skipping weekly alert");
    return { success: false, error: "Email not configured" };
  }

  const issuesList = alertData.topIssues
    .map((i) => `<li style="margin-bottom: 8px;">${i.videoTitle}</li>`)
    .join("");

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `LinkMedic Alert: ${alertData.brokenLinks} broken links found`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Weekly Link Health Report</h1>
        <p style="color: #4b5563;">
          We found <strong style="color: #dc2626;">${alertData.brokenLinks} broken links</strong> that may be costing you
          <strong style="color: #dc2626;">$${alertData.estimatedLoss.toFixed(2)}/month</strong>.
        </p>

        ${alertData.topIssues.length > 0 ? `
        <h3 style="color: #1f2937; margin-top: 24px;">Top issues to fix:</h3>
        <ul style="color: #4b5563;">${issuesList}</ul>
        ` : ""}

        <p style="margin-top: 24px;">
          <a href="${APP_URL}/fix-center" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Fix them now →</a>
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          — LinkMedic
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[Email] Weekly alert error:", error);
    return { success: false, error };
  }

  console.log(`[Email] Weekly alert sent to ${to}`, data);
  return { success: true, data };
}

/**
 * Sends a payment failed notification email
 */
/**
 * Sends an email after a user's first channel scan completes
 */
export async function sendScanCompleteEmail(
  to: string,
  name: string,
  data: {
    totalLinks: number;
    brokenLinks: number;
    monthlyRecovery: number;
  },
  tier: "FREE" | "SPECIALIST" | "PORTFOLIO" = "FREE"
): Promise<{ success: boolean; error?: unknown; data?: unknown }> {
  if (!resend) {
    console.warn("[Email] Not configured - skipping scan complete email");
    return { success: false, error: "Email not configured" };
  }

  const showUpgradeButton = tier === "FREE";

  const upgradeSection = showUpgradeButton ? `
    <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
      <p style="color: #d1fae5; font-size: 14px; margin: 0 0 8px 0;">UNLOCK YOUR FULL POTENTIAL</p>
      <p style="color: #fff; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">
        Upgrade to fix all your links with AI-powered suggestions
      </p>
      <a href="${APP_URL}/settings"
         style="display: inline-block; background: #fff; color: #065f46; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
        Upgrade to Specialist - $19/mo
      </a>
    </div>
  ` : "";

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your Channel's Lab Results Are In 🩺",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

          <div style="text-align: center; margin-bottom: 30px;">
            <span style="color: #10b981; font-size: 24px; font-weight: bold;">Link Medic</span>
          </div>

          <p>Hi ${name || "there"},</p>

          <p><strong>Good news:</strong> Your channel audit is complete. No waiting rooms involved.</p>

          <p>While you were reading this, Link Medic scanned your video archives for 404 errors, expired affiliate tags, and out-of-stock products. Here's what we found:</p>

          <div style="background: #1a1a2e; color: #fff; padding: 24px; border-radius: 8px; margin: 24px 0; font-family: monospace;">
            <div style="text-align: center; font-weight: bold; margin-bottom: 16px; color: #10b981; font-size: 14px; letter-spacing: 1px;">
              YOUR CHANNEL HEALTH SNAPSHOT
            </div>
            <table style="width: 100%; color: #fff;">
              <tr>
                <td style="padding: 8px 0; color: #9ca3af;">Total Links Scanned:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.totalLinks.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #9ca3af;">Revenue Leaks Detected:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${data.brokenLinks > 0 ? "#f87171" : "#10b981"};">${data.brokenLinks}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #9ca3af;">Estimated Monthly Recovery:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #10b981;">$${data.monthlyRecovery.toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <p><strong>The diagnosis:</strong> Every broken link is a dead end for viewers and a lost commission for you. The good news? These are easy fixes — no surgery required.</p>

          <p><strong>YOUR PRESCRIPTION:</strong><br>
          We've prioritized your most-viewed videos so you can fix the highest-impact leaks first. Most creators recover 80% of lost revenue by fixing just their Top 10 videos.</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard"
               style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View My Full Report
            </a>
          </div>

          ${upgradeSection}

          <p><strong>Pro tip:</strong> Grab a coffee, fix your top 10 links, and give yourself a raise on work you finished months ago. Not a bad way to spend 15 minutes.</p>

          <p>Stay link-healthy,<br>
          <strong>The Link Medic Team</strong></p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #6b7280; font-size: 14px;">
            <strong>P.S.</strong> Worried about SEO? Don't be. Updating your descriptions to fix broken links signals to YouTube that your content is maintained and high-quality for viewers.
          </p>

          <div style="text-align: center; margin-top: 32px; color: #9ca3af; font-size: 12px;">
            <p>
              <a href="${APP_URL}" style="color: #9ca3af;">Link Medic</a> ·
              Detect broken links. Suggest fixes. Scan weekly.
            </p>
          </div>

        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Email] Scan complete email error:", error);
      return { success: false, error };
    }

    console.log("[Email] Scan complete email sent:", result?.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("[Email] Failed to send scan complete email:", error);
    return { success: false, error };
  }
}

export async function sendPaymentFailedEmail(to: string): Promise<{ success: boolean; error?: unknown; data?: unknown }> {
  if (!resend) {
    console.warn("[Email] Not configured - skipping payment failed email");
    return { success: false, error: "Email not configured" };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "LinkMedic: Payment failed",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1f2937;">Payment Issue</h1>
        <p style="color: #4b5563;">We couldn't process your payment for LinkMedic.</p>
        <p style="color: #4b5563;">Please update your payment method to keep your account active:</p>
        <p style="margin-top: 24px;">
          <a href="${APP_URL}/settings" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Update payment method →</a>
        </p>
        <p style="color: #4b5563; margin-top: 24px;">Questions? Just reply to this email.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          — LinkMedic
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[Email] Payment failed email error:", error);
    return { success: false, error };
  }

  console.log(`[Email] Payment failed email sent to ${to}`, data);
  return { success: true, data };
}

/**
 * Sends a weekly digest email to paid users with weekly scans enabled
 */
export async function sendWeeklyDigestEmail(
  to: string,
  name: string,
  channelName: string,
  data: {
    newBrokenLinks: number;
    newOutOfStock: number;
    totalIssues: number;
    monthlyImpact: number;
  }
): Promise<{ success: boolean; error?: unknown; data?: unknown }> {
  if (!resend) {
    console.warn("[Email] Not configured - skipping weekly digest email");
    return { success: false, error: "Email not configured" };
  }

  const hasIssues = data.totalIssues > 0;
  const statusText = hasIssues
    ? `⚠️ ${data.totalIssues} Issue${data.totalIssues > 1 ? "s" : ""} Found`
    : "✓ All Clear";
  const statusColor = hasIssues ? "#f87171" : "#10b981";

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: hasIssues
        ? `⚠️ ${data.totalIssues} new link issue${data.totalIssues > 1 ? "s" : ""} found on ${channelName}`
        : `✓ ${channelName} weekly checkup — all clear`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

          <div style="text-align: center; margin-bottom: 30px;">
            <span style="color: #10b981; font-size: 24px; font-weight: bold;">Link Medic</span>
          </div>

          <p>Hi ${name || "there"},</p>

          <p>Here's your weekly link checkup for <strong>${channelName}</strong>:</p>

          <div style="background: #1a1a2e; color: #fff; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <div style="text-align: center; font-size: 20px; font-weight: bold; color: ${statusColor}; margin-bottom: 16px;">
              ${statusText}
            </div>

            ${hasIssues ? `
              <table style="width: 100%; color: #fff;">
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af;">New broken links:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f87171;">${data.newBrokenLinks}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af;">Links went out of stock:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #fb923c;">${data.newOutOfStock}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #9ca3af;">Estimated monthly impact:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f87171;">-$${data.monthlyImpact.toLocaleString()}</td>
                </tr>
              </table>
            ` : `
              <p style="text-align: center; color: #9ca3af; margin: 0;">
                No new issues detected this week. Your links are healthy! 💪
              </p>
            `}
          </div>

          ${hasIssues ? `
            <p>We found some new issues that need your attention. Click below to see the details and get fix suggestions.</p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${APP_URL}/dashboard"
                 style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                View Issues & Fix
              </a>
            </div>
          ` : `
            <p>Keep up the great work! We'll keep monitoring and let you know if anything changes.</p>
          `}

          <p>Stay link-healthy,<br>
          <strong>The Link Medic Team</strong></p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            You're receiving this because you have weekly scans enabled.<br>
            <a href="${APP_URL}/settings" style="color: #6b7280;">Manage email preferences</a>
          </p>

        </body>
        </html>
      `,
    });

    if (error) {
      console.error("[Email] Weekly digest email error:", error);
      return { success: false, error };
    }

    console.log("[Email] Weekly digest email sent:", result?.id);
    return { success: true, data: result };
  } catch (error) {
    console.error("[Email] Failed to send weekly digest email:", error);
    return { success: false, error };
  }
}
