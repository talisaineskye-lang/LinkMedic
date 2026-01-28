"use client";

import { PolicyLayout } from "@/components/policy-layout";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="January 28, 2026">
      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">1. Introduction</h2>
        <p>
          LinkMedic (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains
          how we collect, use, disclose, and safeguard your information when you use our service. LinkMedic is
          operated as a sole proprietorship in Alberta, Canada.
        </p>
        <p className="mt-4">
          By using LinkMedic, you agree to the collection and use of information in accordance with this policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">2. Google API Disclosure</h2>
        <p>
          LinkMedic&apos;s use and transfer to any other app of information received from Google APIs will adhere to{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">3. Information We Collect</h2>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">2.1 Account Information</h3>
        <p className="mb-2">When you create an account using Google OAuth, we collect:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Your name</li>
          <li>Email address</li>
          <li>Google account ID</li>
          <li>Profile picture (if provided by Google)</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">2.2 YouTube Data</h3>
        <p className="mb-2">With your explicit authorization via YouTube API, we access and store:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Your YouTube channel information (name, ID, subscriber count)</li>
          <li>Video metadata (titles, descriptions, view counts, publish dates)</li>
          <li>Video descriptions containing affiliate links</li>
          <li>Public video statistics</li>
        </ul>
        <p className="mt-4">
          <strong>Important:</strong> Video titles and descriptions are stored in our database solely to provide
          the affiliate link scanning service. <strong>We do NOT sell this data</strong>, and you may request
          deletion of all your YouTube data at any time by contacting us or deleting your account.
        </p>
        <p className="mt-4 italic">
          We do NOT access: private videos, comments, watch history, or any data beyond what&apos;s necessary to
          analyze affiliate links in your public video descriptions.
        </p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">2.3 Usage Data</h3>
        <p className="mb-2">We automatically collect usage information via PostHog analytics:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Pages viewed and features used</li>
          <li>Actions taken (syncing videos, copying links, exporting data, marking links as fixed)</li>
          <li>Device information (browser type, operating system)</li>
          <li>IP address (for analytics and security purposes)</li>
          <li>Session duration and interaction patterns</li>
        </ul>
        <p className="mt-4">
          Analytics data is stored in PostHog&apos;s US-based servers (us.i.posthog.com) and uses localStorage
          (not cookies) for persistence.
        </p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">2.4 Payment Information</h3>
        <p className="mb-2">
          Payment processing is handled by Stripe. We do NOT store your credit card information. Stripe collects:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Payment card details</li>
          <li>Billing address</li>
          <li>Transaction history</li>
        </ul>
        <p className="mt-4">
          See{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            Stripe&apos;s Privacy Policy
          </a>
          {" "}for details on how they handle your payment data.
        </p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">2.5 Affiliate Link Data</h3>
        <p className="mb-2">We collect and store:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Affiliate links extracted from your video descriptions</li>
          <li>Link health status (working, broken, out of stock, etc.)</li>
          <li>Product information associated with links</li>
          <li>Historical link status changes</li>
          <li>Your preferences for link monitoring and notifications</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">4. How We Use Your Information</h2>
        <p className="mb-4">We use the collected information to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Provide the Service:</strong> Scan videos, check link health, generate reports, and suggest replacements</li>
          <li><strong>Authenticate you:</strong> Verify your identity and manage your account</li>
          <li><strong>Process payments:</strong> Handle subscriptions and billing (via Stripe)</li>
          <li><strong>Improve the Service:</strong> Analyze usage patterns to enhance features and user experience</li>
          <li><strong>Communicate with you:</strong> Send service updates, security alerts, and support responses</li>
          <li><strong>Ensure security:</strong> Detect fraud, abuse, and technical issues</li>
          <li><strong>Comply with legal obligations:</strong> Respond to legal requests and enforce our Terms</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">5. Data Storage & Security</h2>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">4.1 Where We Store Data</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Database:</strong> PostgreSQL hosted by Supabase (running on AWS infrastructure)</li>
          <li><strong>Analytics:</strong> PostHog (US-based servers: us.i.posthog.com)</li>
          <li><strong>Payments:</strong> Stripe (global infrastructure with data centers in multiple regions)</li>
        </ul>
        <p className="mt-4">
          Your Supabase database region depends on your project configuration. Data is stored on AWS infrastructure
          in the region selected during Supabase setup (e.g., us-east-1, eu-west-1, etc.).
        </p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">4.2 Security Measures</h3>
        <p className="mb-2">We implement industry-standard security practices:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>HTTPS encryption for all data transmission</li>
          <li>Secure authentication via Google OAuth</li>
          <li>HTTP-only session cookies to prevent XSS attacks</li>
          <li>Regular security updates and monitoring</li>
          <li>Access controls and permission-based data access</li>
        </ul>
        <p className="mt-4">
          However, no method of transmission over the Internet is 100% secure. While we strive to protect your
          information, we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">6. Data Sharing & Disclosure</h2>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-4">
          <p className="font-semibold text-cyan-400">
            We do NOT sell, rent, or trade your personal information, including your YouTube video titles,
            descriptions, or any other data we collect. Your data is used solely to provide the LinkMedic service.
          </p>
        </div>
        <p className="mb-4">We may share data with the following service providers:</p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">5.1 Service Providers</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Google:</strong> For authentication and YouTube API access</li>
          <li><strong>Supabase:</strong> For database hosting and infrastructure</li>
          <li><strong>PostHog:</strong> For product analytics</li>
          <li><strong>Stripe:</strong> For payment processing</li>
        </ul>
        <p className="mt-4">
          These providers are bound by their own privacy policies and data processing agreements.
        </p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">5.2 Legal Requirements</h3>
        <p>We may disclose your information if required by law, court order, or government request, or to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
          <li>Comply with legal obligations</li>
          <li>Protect our rights, property, or safety</li>
          <li>Prevent fraud or abuse</li>
          <li>Enforce our Terms of Service</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">5.3 Business Transfers</h3>
        <p>
          If LinkMedic is acquired, merged, or undergoes a business transition, your information may be transferred
          to the new entity. We will notify you via email of any such change.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">7. Your Rights & Choices</h2>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-4">
          <p className="font-semibold text-cyan-400">
            You may request deletion of all your data at any time. This includes your account information,
            YouTube video data (titles, descriptions), affiliate link records, and all associated data.
          </p>
        </div>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Access your data:</strong> Request a copy of the personal information we hold about you</li>
          <li><strong>Correct your data:</strong> Update inaccurate or incomplete information</li>
          <li><strong>Delete your data:</strong> Request deletion of your account and all associated data at any time—no questions asked</li>
          <li><strong>Revoke YouTube access:</strong> Disconnect LinkMedic from your YouTube account at any time via Google Account settings</li>
          <li><strong>Opt-out of analytics:</strong> Request to be excluded from PostHog tracking</li>
          <li><strong>Export your data:</strong> Download your affiliate link data and reports</li>
        </ul>
        <p className="mt-4">
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-cyan-400 hover:underline">
            hello@linkmedic.pro
          </a>
          . We will process your request within 30 days.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">8. Data Retention</h2>
        <p className="mb-4">We retain your data for as long as:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Your account remains active</li>
          <li>It&apos;s necessary to provide the Service</li>
          <li>Required by law or for legitimate business purposes</li>
        </ul>
        <p className="mt-4">
          When you delete your account, we will delete or anonymize your personal information within 30 days,
          except where retention is required by law.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">9. Cookies & Tracking Technologies</h2>
        <p className="mb-4">
          LinkMedic uses minimal cookies and tracking:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>NextAuth session cookies:</strong> HTTP-only cookies for authentication (required for the service to function)</li>
          <li><strong>PostHog localStorage:</strong> Stores analytics identifiers locally in your browser (not cookies)</li>
          <li><strong>No third-party advertising or tracking cookies</strong></li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">10. Children&apos;s Privacy</h2>
        <p>
          LinkMedic is not intended for users under 18 years old. We do not knowingly collect personal information
          from children. If we become aware that a child has provided us with personal data, we will delete it
          immediately. If you believe a child has provided us with information, contact us at{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-cyan-400 hover:underline">
            hello@linkmedic.pro
          </a>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">11. International Users</h2>
        <p>
          LinkMedic is operated from Canada. If you access the Service from outside Canada, your information may
          be transferred to, stored, and processed in Canada or other countries where our service providers operate.
          By using LinkMedic, you consent to this transfer.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">12. Third-Party Links</h2>
        <p>
          Our Service may contain links to third-party websites (YouTube, Amazon, etc.). We are not responsible
          for the privacy practices of these external sites. We encourage you to review their privacy policies
          before providing any personal information.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">13. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material changes via email
          or a prominent notice in the Service at least 30 days before the changes take effect. Your continued
          use of LinkMedic after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">14. Contact Us</h2>
        <p>
          For questions about this Privacy Policy or our data practices, please contact us at{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-cyan-400 hover:underline">
            hello@linkmedic.pro
          </a>
        </p>
      </section>
    </PolicyLayout>
  );
}
