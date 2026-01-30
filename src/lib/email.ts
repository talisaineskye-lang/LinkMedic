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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #0f0f0f;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="color: #22d3ee; font-size: 24px; font-weight: bold;">LinkMedic</span>
            </div>

            <h2 style="color: #f87171; margin-bottom: 16px;">Alert: ${statusText} Link Detected</h2>

            <p>Hi ${alert.userName || "there"},</p>

            <p>We detected a problem with one of your affiliate links:</p>

            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 12px 0; color: #94a3b8;"><strong style="color: #e2e8f0;">Video:</strong> ${alert.videoTitle}</p>
              <p style="margin: 0 0 12px 0; color: #94a3b8;"><strong style="color: #e2e8f0;">Link:</strong> <a href="${alert.brokenUrl}" style="color: #22d3ee;">${alert.brokenUrl}</a></p>
              <p style="margin: 0 0 12px 0; color: #94a3b8;"><strong style="color: #e2e8f0;">Status:</strong> <span style="color: ${alert.status === "NOT_FOUND" ? "#f87171" : "#fb923c"};">${statusText}</span></p>
              <p style="margin: 0; color: #94a3b8;"><strong style="color: #e2e8f0;">Estimated Loss:</strong> <span style="color: #f87171;">${formatCurrency(alert.estimatedLoss)}</span></p>
            </div>

            <p><strong style="color: #22d3ee;">Recommended Action:</strong> Review and update the link in your video description.</p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${APP_URL}/fix-center" style="display: inline-block; background: #22d3ee; color: #0f0f0f; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Fix This Link
              </a>
            </div>

            <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
              — The LinkMedic Team
            </p>

            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">

            <div style="text-align: center; color: #64748b; font-size: 12px;">
              <a href="${APP_URL}" style="color: #64748b;">LinkMedic</a> · Protecting your affiliate revenue
            </div>
          </div>
        </body>
        </html>
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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #0f0f0f;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="color: #22d3ee; font-size: 24px; font-weight: bold;">LinkMedic</span>
            </div>

            <h2 style="color: #e2e8f0; margin-bottom: 16px;">Weekly Scan Complete</h2>

            <p>Hi ${alert.userName || "there"},</p>

            <p>Your weekly link scan has completed. Here's a summary:</p>

            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Links Scanned:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #e2e8f0;">${alert.totalScanned.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Issues Found:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f87171;">${alert.issuesFound}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Revenue at Risk:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f87171;">${formatCurrency(alert.totalEstimatedLoss)}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${APP_URL}/fix-center" style="display: inline-block; background: #22d3ee; color: #0f0f0f; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                View All Issues
              </a>
            </div>

            <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
              — The LinkMedic Team
            </p>

            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">

            <div style="text-align: center; color: #64748b; font-size: 12px;">
              <a href="${APP_URL}" style="color: #64748b;">LinkMedic</a> · Protecting your affiliate revenue
            </div>
          </div>
        </body>
        </html>
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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
        <div style="background: #0f0f0f;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="color: #22d3ee; font-size: 24px; font-weight: bold;">LinkMedic</span>
          </div>

          <h1 style="color: #e2e8f0; margin-bottom: 16px;">Welcome${name ? `, ${name}` : ""}!</h1>

          <p>Thanks for signing up for LinkMedic — you're one step closer to recovering lost affiliate revenue.</p>

          <p style="color: #22d3ee; font-weight: 600;">Here's how to get started:</p>

          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <ol style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 12px; color: #e2e8f0;">Connect your YouTube channel</li>
              <li style="margin-bottom: 12px; color: #e2e8f0;">We'll scan your videos for broken affiliate links</li>
              <li style="color: #e2e8f0;">Fix them with AI-powered suggestions</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/dashboard" style="display: inline-block; background: #22d3ee; color: #0f0f0f; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Go to Your Dashboard
            </a>
          </div>

          <p>Questions? Just reply to this email — we're here to help.</p>

          <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
            — The LinkMedic Team
          </p>

          <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">

          <div style="text-align: center; color: #64748b; font-size: 12px;">
            <a href="${APP_URL}" style="color: #64748b;">LinkMedic</a> · Protecting your affiliate revenue
          </div>
        </div>
      </body>
      </html>
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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
        <div style="background: #0f0f0f;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="color: #22d3ee; font-size: 24px; font-weight: bold;">LinkMedic</span>
          </div>

          <h1 style="color: #e2e8f0; margin-bottom: 16px;">Weekly Link Health Report</h1>

          <p>
            We found <strong style="color: #f87171;">${alertData.brokenLinks} broken links</strong> that may be costing you
            <strong style="color: #f87171;">$${alertData.estimatedLoss.toFixed(2)}/month</strong>.
          </p>

          ${alertData.topIssues.length > 0 ? `
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #22d3ee; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Top Issues to Fix</h3>
            <ul style="margin: 0; padding-left: 20px; color: #e2e8f0;">${issuesList}</ul>
          </div>
          ` : ""}

          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/fix-center" style="display: inline-block; background: #22d3ee; color: #0f0f0f; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Fix Them Now
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
            — The LinkMedic Team
          </p>

          <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">

          <div style="text-align: center; color: #64748b; font-size: 12px;">
            <a href="${APP_URL}" style="color: #64748b;">LinkMedic</a> · Protecting your affiliate revenue
          </div>
        </div>
      </body>
      </html>
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
  tier: "TRIAL" | "AUDITOR" | "SPECIALIST" | "OPERATOR" = "AUDITOR"
): Promise<{ success: boolean; error?: unknown; data?: unknown }> {
  if (!resend) {
    console.warn("[Email] Not configured - skipping scan complete email");
    return { success: false, error: "Email not configured" };
  }

  const showUpgradeButton = tier === "TRIAL" || tier === "AUDITOR";

  const upgradeSection = showUpgradeButton ? `
    <div style="background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%); padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
      <p style="color: #cffafe; font-size: 14px; margin: 0 0 8px 0; letter-spacing: 1px;">UNLOCK YOUR FULL POTENTIAL</p>
      <p style="color: #fff; font-size: 18px; font-weight: bold; margin: 0 0 16px 0;">
        Upgrade to fix all your links with AI-powered suggestions
      </p>
      <a href="${APP_URL}/settings"
         style="display: inline-block; background: #fff; color: #0e7490; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #0f0f0f;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="color: #22d3ee; font-size: 24px; font-weight: bold;">LinkMedic</span>
            </div>

            <p>Hi ${name || "there"},</p>

            <p><strong style="color: #22d3ee;">Good news:</strong> Your channel audit is complete. No waiting rooms involved.</p>

            <p>While you were reading this, LinkMedic scanned your video archives for 404 errors, expired affiliate tags, and out-of-stock products. Here's what we found:</p>

            <div style="background: #1e293b; border: 1px solid #334155; padding: 24px; border-radius: 8px; margin: 24px 0;">
              <div style="text-align: center; font-weight: bold; margin-bottom: 16px; color: #22d3ee; font-size: 14px; letter-spacing: 1px;">
                YOUR CHANNEL HEALTH SNAPSHOT
              </div>
              <table style="width: 100%; color: #e2e8f0;">
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Total Links Scanned:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${data.totalLinks.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Revenue Leaks Detected:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${data.brokenLinks > 0 ? "#f87171" : "#22d3ee"};">${data.brokenLinks}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">Estimated Monthly Recovery:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #22d3ee;">$${data.monthlyRecovery.toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <p><strong style="color: #e2e8f0;">The diagnosis:</strong> Every broken link is a dead end for viewers and a lost commission for you. The good news? These are easy fixes — no surgery required.</p>

            <p><strong style="color: #22d3ee;">YOUR PRESCRIPTION:</strong><br>
            We've prioritized your most-viewed videos so you can fix the highest-impact leaks first. Most creators recover 80% of lost revenue by fixing just their Top 10 videos.</p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${APP_URL}/dashboard"
                 style="display: inline-block; background: #22d3ee; color: #0f0f0f; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                View My Full Report
              </a>
            </div>

            ${upgradeSection}

            <p><strong style="color: #e2e8f0;">Pro tip:</strong> Grab a coffee, fix your top 10 links, and give yourself a raise on work you finished months ago. Not a bad way to spend 15 minutes.</p>

            <p>Stay link-healthy,<br>
            <strong>The LinkMedic Team</strong></p>

            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">

            <p style="color: #64748b; font-size: 14px;">
              <strong style="color: #94a3b8;">P.S.</strong> Worried about SEO? Don't be. Updating your descriptions to fix broken links signals to YouTube that your content is maintained and high-quality for viewers.
            </p>

            <div style="text-align: center; margin-top: 32px; color: #64748b; font-size: 12px;">
              <p>
                <a href="${APP_URL}" style="color: #64748b;">LinkMedic</a> ·
                Detect broken links. Suggest fixes. Scan weekly.
              </p>
            </div>
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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
        <div style="background: #0f0f0f;">
          <div style="text-align: center; margin-bottom: 30px;">
            <span style="color: #22d3ee; font-size: 24px; font-weight: bold;">LinkMedic</span>
          </div>

          <h1 style="color: #fb923c; margin-bottom: 16px;">Payment Issue</h1>

          <p>We couldn't process your payment for LinkMedic.</p>

          <p>Please update your payment method to keep your account active and continue protecting your affiliate revenue:</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${APP_URL}/settings" style="display: inline-block; background: #fb923c; color: #0f0f0f; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Update Payment Method
            </a>
          </div>

          <p>Questions? Just reply to this email — we're here to help.</p>

          <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
            — The LinkMedic Team
          </p>

          <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">

          <div style="text-align: center; color: #64748b; font-size: 12px;">
            <a href="${APP_URL}" style="color: #64748b;">LinkMedic</a> · Protecting your affiliate revenue
          </div>
        </div>
      </body>
      </html>
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f0f0f;">
          <div style="background: #0f0f0f;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="color: #22d3ee; font-size: 24px; font-weight: bold;">LinkMedic</span>
            </div>

            <p>Hi ${name || "there"},</p>

            <p>Here's your weekly link checkup for <strong style="color: #22d3ee;">${channelName}</strong>:</p>

            <div style="background: #1e293b; border: 1px solid #334155; padding: 24px; border-radius: 8px; margin: 24px 0;">
              <div style="text-align: center; font-size: 20px; font-weight: bold; color: ${statusColor}; margin-bottom: 16px;">
                ${statusText}
              </div>

              ${hasIssues ? `
                <table style="width: 100%; color: #e2e8f0;">
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">New broken links:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f87171;">${data.newBrokenLinks}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Links went out of stock:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #fb923c;">${data.newOutOfStock}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94a3b8;">Estimated monthly impact:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #f87171;">-$${data.monthlyImpact.toLocaleString()}</td>
                  </tr>
                </table>
              ` : `
                <p style="text-align: center; color: #94a3b8; margin: 0;">
                  No new issues detected this week. Your links are healthy! 💪
                </p>
              `}
            </div>

            ${hasIssues ? `
              <p>We found some new issues that need your attention. Click below to see the details and get fix suggestions.</p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${APP_URL}/fix-center"
                   style="display: inline-block; background: #22d3ee; color: #0f0f0f; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  View Issues & Fix
                </a>
              </div>
            ` : `
              <p>Keep up the great work! We'll keep monitoring and let you know if anything changes.</p>
            `}

            <p>Stay link-healthy,<br>
            <strong>The LinkMedic Team</strong></p>

            <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">

            <p style="color: #64748b; font-size: 12px; text-align: center;">
              You're receiving this because you have weekly scans enabled.<br>
              <a href="${APP_URL}/settings" style="color: #64748b;">Manage email preferences</a>
            </p>
          </div>
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
