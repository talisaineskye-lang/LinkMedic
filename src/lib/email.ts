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
