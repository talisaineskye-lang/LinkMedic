import { Resend } from "resend";
import { formatCurrency } from "./revenue-estimator";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "LinkMedic <alerts@linkmedic.app>";

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
            <a href="https://linkmedic.app/issues" style="color: #2563eb;">View all issues →</a>
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
