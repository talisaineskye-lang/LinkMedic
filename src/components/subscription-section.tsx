"use client";

import { useState } from "react";
import { CreditCard, Sparkles, Crown } from "lucide-react";

interface SubscriptionSectionProps {
  tier: string;
  hasStripeCustomer: boolean;
}

export function SubscriptionSection({
  tier,
  hasStripeCustomer,
}: SubscriptionSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to open billing portal"
      );
    } finally {
      setLoading(false);
    }
  };

  const isPaid = tier === "SPECIALIST" || tier === "PORTFOLIO";

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Subscription
      </h2>

      <div className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <div>
            <dt className="text-sm text-slate-400">Current Plan</dt>
            <dd className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border ${
                  tier === "PORTFOLIO"
                    ? "bg-purple-950/30 border-purple-700/50 text-purple-400"
                    : tier === "SPECIALIST"
                    ? "bg-emerald-950/30 border-emerald-700/50 text-emerald-400"
                    : "bg-slate-700/30 border-slate-600/50 text-slate-400"
                }`}
              >
                {tier === "PORTFOLIO" && <Crown className="w-3.5 h-3.5" />}
                {tier === "SPECIALIST" && <Sparkles className="w-3.5 h-3.5" />}
                {tier === "FREE" && "Free"}
                {tier === "SPECIALIST" && "Specialist"}
                {tier === "PORTFOLIO" && "Portfolio Manager"}
              </span>
            </dd>
          </div>

          {isPaid && hasStripeCustomer && (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Manage Subscription"}
            </button>
          )}
        </div>

        {/* Feature comparison for FREE users */}
        {tier === "FREE" && (
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <h3 className="text-sm font-medium text-white mb-4">
              Upgrade to Specialist - $19/month
            </h3>
            <ul className="space-y-2 text-sm text-slate-400 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Scan up to 100 videos (vs 15 on Free)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                AI-powered replacement suggestions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Export to CSV & Fix Scripts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Link Guard monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Resync anytime
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Email alerts for broken links
              </li>
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="px-4 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Specialist - $19/mo
                </>
              )}
            </button>
          </div>
        )}

        {/* Current benefits for paid users */}
        {isPaid && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
              You have access to all {tier === "PORTFOLIO" ? "Portfolio Manager" : "Specialist"} features
              including AI suggestions, exports, and Link Guard monitoring.
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
