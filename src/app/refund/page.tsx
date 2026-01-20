"use client";

import { PolicyLayout } from "@/components/policy-layout";

export default function RefundPolicy() {
  return (
    <PolicyLayout title="Refund Policy" lastUpdated="January 20, 2026">
      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">1. Overview</h2>
        <p>
          At LinkMedic, we want you to be completely satisfied with our service. This Refund Policy outlines
          the terms and conditions for refunds and cancellations. We strive to be fair and transparent.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">2. 14-Day Money-Back Guarantee</h2>
        <p className="mb-4">
          <strong>New subscribers are eligible for a full refund within 14 days of their initial subscription.</strong>
        </p>
        <p className="mb-4">To qualify, you must:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Be a first-time subscriber (not a returning customer)</li>
          <li>Request a refund within 14 days of your initial payment</li>
          <li>Contact us at{" "}
            <a href="mailto:hello@linkmedic.pro" className="text-emerald-400 hover:underline">
              hello@linkmedic.pro
            </a>{" "}
            with your account email and reason for the refund
          </li>
        </ul>
        <p className="mt-4">
          Refunds are processed within 5-10 business days to your original payment method. Your subscription
          will be cancelled immediately upon refund approval.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">3. Cancellation Policy</h2>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">3.1 How to Cancel</h3>
        <p className="mb-2">You can cancel your subscription at any time by:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Visiting your account settings in the LinkMedic dashboard</li>
          <li>Clicking &quot;Cancel Subscription&quot;</li>
          <li>Or emailing us at{" "}
            <a href="mailto:hello@linkmedic.pro" className="text-emerald-400 hover:underline">
              hello@linkmedic.pro
            </a>
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">3.2 When Cancellation Takes Effect</h3>
        <p className="mb-4">
          When you cancel your subscription:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Immediate cancellation:</strong> You will not be charged again</li>
          <li><strong>Access until period end:</strong> You retain access to LinkMedic until the end of your current billing period</li>
          <li><strong>No partial refunds:</strong> Cancelling mid-cycle does not entitle you to a prorated refund (see exceptions below)</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">3.3 Example</h3>
        <div className="bg-slate-800/50 rounded-lg p-4 text-sm">
          <p>If you subscribe on January 1st and cancel on January 15th:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
            <li>You will NOT be charged on February 1st</li>
            <li>You can continue using LinkMedic until January 31st</li>
            <li>Your access ends on January 31st</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">4. Refunds After 14 Days</h2>
        <p className="mb-4">
          After the 14-day money-back guarantee period, refunds are generally <strong>not provided</strong> for:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Mid-cycle cancellations (no prorated refunds)</li>
          <li>Change of mind after 14 days</li>
          <li>Failure to use the Service</li>
          <li>Lack of results or unmet expectations</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">Exceptions</h3>
        <p className="mb-2">We may grant refunds on a case-by-case basis for:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Technical issues:</strong> If LinkMedic is unavailable or broken for an extended period due to our error</li>
          <li><strong>Billing errors:</strong> If you were charged incorrectly or duplicate charges occurred</li>
          <li><strong>Extenuating circumstances:</strong> At our sole discretion, we may consider refunds for exceptional situations</li>
        </ul>
        <p className="mt-4">
          To request an exception, contact us at{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-emerald-400 hover:underline">
            hello@linkmedic.pro
          </a>{" "}
          with details of the issue.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">5. Annual Subscriptions</h2>
        <p className="mb-4">
          Annual subscriptions follow the same 14-day money-back guarantee. After 14 days:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Annual subscriptions are non-refundable</li>
          <li>You may cancel to prevent auto-renewal for the next year</li>
          <li>You retain access until the end of the 12-month period</li>
        </ul>
        <p className="mt-4 italic">
          Example: If you purchase an annual plan on January 1st and cancel on March 1st, you will retain access
          until December 31st (end of your 12-month period), but you will not be charged again on January 1st of the following year.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">6. Free Trials</h2>
        <p className="mb-4">
          If LinkMedic offers free trials:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>You can cancel anytime during the trial without being charged</li>
          <li>If you don&apos;t cancel before the trial ends, you&apos;ll be automatically charged for a subscription</li>
          <li>The 14-day money-back guarantee applies from the date of your first paid charge (not the trial start date)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">7. Chargebacks & Disputes</h2>
        <p className="mb-4">
          <strong>Please contact us BEFORE filing a chargeback with your bank.</strong> Chargebacks are costly
          and time-consuming for small businesses. We&apos;re happy to resolve billing issues directly.
        </p>
        <p className="mb-4">If you file a chargeback:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Your account will be immediately suspended</li>
          <li>We may dispute the chargeback if it&apos;s unjustified</li>
          <li>You may be banned from future use of LinkMedic</li>
        </ul>
        <p className="mt-4">
          Most issues can be resolved quickly by emailing{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-emerald-400 hover:underline">
            hello@linkmedic.pro
          </a>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">8. Account Termination by LinkMedic</h2>
        <p className="mb-4">
          If we terminate your account due to Terms of Service violations (fraud, abuse, etc.):
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>No refund will be provided</li>
          <li>You immediately lose access to the Service</li>
          <li>You remain responsible for any outstanding payments</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">9. Service Changes or Discontinuation</h2>
        <p className="mb-4">
          If LinkMedic significantly changes the Service or discontinues operations:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>We will provide at least 30 days notice</li>
          <li>You may request a prorated refund for unused time on annual plans</li>
          <li>Monthly subscribers can simply cancel before the next billing cycle</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">10. How to Request a Refund</h2>
        <p className="mb-4">To request a refund, email us at{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-emerald-400 hover:underline">
            hello@linkmedic.pro
          </a>{" "}
          with:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Your account email address</li>
          <li>Subscription plan (monthly or annual)</li>
          <li>Reason for the refund request</li>
          <li>Date of purchase</li>
        </ul>
        <p className="mt-4">
          We aim to respond to refund requests within 2 business days. Approved refunds are processed within
          5-10 business days.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">11. Contact Us</h2>
        <p>
          Questions about refunds or cancellations? Contact us at{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-emerald-400 hover:underline">
            hello@linkmedic.pro
          </a>
        </p>
        <p className="mt-4">
          We&apos;re a small team and genuinely care about your experience. If something isn&apos;t working for you,
          let&apos;s talk about it before you cancel or request a refund.
        </p>
      </section>
    </PolicyLayout>
  );
}
