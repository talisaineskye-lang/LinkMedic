"use client";

import { PolicyLayout } from "@/components/policy-layout";

export default function CookiePolicy() {
  return (
    <PolicyLayout title="Cookie Policy" lastUpdated="January 20, 2026">
      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">1. Introduction</h2>
        <p>
          This Cookie Policy explains how LinkMedic uses cookies and similar tracking technologies.
          Unlike most websites, LinkMedic uses VERY FEW cookies and no third-party advertising or tracking cookies.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">2. What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device (computer, tablet, or phone) when you visit a website.
          They help websites remember your preferences, keep you logged in, and understand how you use the site.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">3. Cookies We Use</h2>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">3.1 Essential Cookies (Required)</h3>
        <p className="mb-4">These cookies are necessary for the Service to function and cannot be disabled:</p>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <p className="font-semibold text-slate-100 mb-2">NextAuth Session Cookie</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
            <li><strong>Name:</strong> next-auth.session-token (or __Secure-next-auth.session-token in production)</li>
            <li><strong>Purpose:</strong> Keeps you logged in and authenticates your account</li>
            <li><strong>Type:</strong> HTTP-only session cookie (cannot be accessed by JavaScript, preventing XSS attacks)</li>
            <li><strong>Duration:</strong> 30 days (or until you log out)</li>
            <li><strong>Provider:</strong> NextAuth.js (authentication library)</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">3.2 Analytics (Optional - Uses localStorage)</h3>
        <p className="mb-4">
          We use PostHog for product analytics to understand how users interact with LinkMedic.
          <strong> PostHog does NOT use cookies—it uses localStorage instead.</strong>
        </p>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <p className="font-semibold text-slate-100 mb-2">PostHog Analytics</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
            <li><strong>Storage Method:</strong> localStorage (not cookies)</li>
            <li><strong>Purpose:</strong> Track page views, feature usage, and user interactions</li>
            <li><strong>Data Collected:</strong> Anonymous usage patterns (only identified users are tracked)</li>
            <li><strong>Location:</strong> US-based servers (us.i.posthog.com)</li>
            <li><strong>Privacy:</strong> person_profiles set to &quot;identified_only&quot; (no anonymous tracking)</li>
          </ul>
        </div>

        <p className="mt-4 text-sm italic">
          You can request to opt out of PostHog analytics by contacting us at{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-emerald-400 hover:underline">
            hello@linkmedic.pro
          </a>.
        </p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">3.3 What We DON&apos;T Use</h3>
        <p className="mb-2">LinkMedic does NOT use:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Third-party advertising cookies</li>
          <li>Google Analytics</li>
          <li>Facebook Pixel or social media tracking</li>
          <li>Marketing or retargeting cookies</li>
          <li>Cross-site tracking cookies</li>
          <li>Fingerprinting or device tracking beyond standard analytics</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">4. Third-Party Cookies</h2>
        <p className="mb-4">
          While LinkMedic itself uses minimal cookies, the following third-party services may set their own cookies
          when you use our Service:
        </p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">4.1 Google OAuth</h3>
        <p>
          When you sign in with Google, Google may set cookies for authentication purposes.
          See{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            Google&apos;s Privacy Policy
          </a>.
        </p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">4.2 Stripe (Payment Processing)</h3>
        <p>
          Stripe may use cookies for fraud detection and payment processing.
          See{" "}
          <a href="https://stripe.com/cookies-policy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            Stripe&apos;s Cookie Policy
          </a>.
        </p>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">4.3 YouTube Embedded Content</h3>
        <p>
          If we embed YouTube videos on our site (for tutorials, etc.), YouTube may set cookies.
          See{" "}
          <a href="https://www.youtube.com/t/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            YouTube&apos;s Privacy Policy
          </a>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">5. Managing Cookies</h2>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">5.1 Browser Settings</h3>
        <p className="mb-2">You can control cookies through your browser settings:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
          <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
          <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
          <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
        </ul>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">5.2 Important Note</h3>
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 text-sm">
          <p>If you block or delete the NextAuth session cookie, you will be logged out and unable to use LinkMedic.
            This cookie is essential for the Service to function.</p>
        </div>

        <h3 className="text-xl font-semibold text-slate-100 mb-3 mt-6">5.3 Opting Out of Analytics</h3>
        <p>
          To opt out of PostHog analytics (which uses localStorage, not cookies), contact us at{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-emerald-400 hover:underline">
            hello@linkmedic.pro
          </a>{" "}
          and we&apos;ll exclude your account from tracking.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">6. Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated
          &quot;Last updated&quot; date. Your continued use of LinkMedic after changes constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-50 mb-4">7. Contact Us</h2>
        <p>
          Questions about our use of cookies? Contact us at{" "}
          <a href="mailto:hello@linkmedic.pro" className="text-emerald-400 hover:underline">
            hello@linkmedic.pro
          </a>
        </p>
      </section>
    </PolicyLayout>
  );
}
