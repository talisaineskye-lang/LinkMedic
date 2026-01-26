"use client";

import { useState } from "react";
import { CreditCard, Sparkles, Crown, AlertTriangle } from "lucide-react";

interface SubscriptionSectionProps {
  tier: string;
  hasStripeCustomer: boolean;
  subscriptionCancelAt?: string | null; // ISO string from API
}

export function SubscriptionSection({
  tier,
  hasStripeCustomer,
  subscriptionCancelAt,
}: SubscriptionSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaid = tier === "SPECIALIST" || tier === "OPERATOR";
  const isCanceling = isPaid && subscriptionCancelAt;

  const handleUpgrade = async () => {
    console.log("[Upgrade] Starting checkout...");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await response.json();
      console.log("[Upgrade] Response:", { ok: response.ok, data });

      if (!response.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      if (!data.url) {
        throw new Error("No checkout URL returned");
      }

      // Redirect to Stripe Checkout
      console.log("[Upgrade] Redirecting to:", data.url);
      window.location.href = data.url;
    } catch (err) {
      console.error("[Upgrade] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to start checkout");
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

  // Format cancel date for display
  const formatCancelDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Subscription
      </h2>

      <div className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <div>
            <dt className="text-sm text-yt-light">Current Plan</dt>
            <dd className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-bold rounded border ${
                  tier === "OPERATOR"
                    ? "bg-profit-green/20 border-profit-green/50 text-profit-green"
                    : tier === "SPECIALIST"
                    ? "bg-profit-green/20 border-profit-green/50 text-profit-green"
                    : "bg-yt-gray border-white/20 text-yt-light"
                }`}
              >
                {tier === "OPERATOR" && <Crown className="w-3.5 h-3.5" />}
                {tier === "SPECIALIST" && <Sparkles className="w-3.5 h-3.5" />}
                {(tier === "TRIAL" || tier === "AUDITOR") && "Free"}
                {tier === "SPECIALIST" && "Specialist"}
                {tier === "OPERATOR" && "Operator"}
              </span>
            </dd>
          </div>

          {isPaid && hasStripeCustomer && !isCanceling && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-yt-gray hover:bg-white/10 border border-white/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Manage Subscription"}
              </button>
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-emergency-red hover:bg-emergency-red/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Cancellation Warning */}
        {isCanceling && subscriptionCancelAt && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Subscription Ending</p>
                <p className="text-yellow-400/80 text-sm mt-1">
                  Your subscription will end on{" "}
                  <span className="font-semibold">
                    {formatCancelDate(subscriptionCancelAt)}
                  </span>
                  . You&apos;ll keep full access until then.
                </p>
                <button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="mt-3 text-sm text-yellow-400 hover:text-yellow-300 underline disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Reactivate subscription →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature comparison for free tier users */}
        {(tier === "TRIAL" || tier === "AUDITOR") && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-white mb-4">
              Upgrade to Specialist - $19/month
            </h3>
            <ul className="space-y-2 text-sm text-yt-light mb-6">
              <li className="flex items-center gap-2">
                <span className="text-profit-green">✓</span>
                Full channel scan (unlimited videos)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-profit-green">✓</span>
                AI fix suggestions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-profit-green">✓</span>
                Weekly monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-profit-green">✓</span>
                Export fix list
              </li>
              <li className="flex items-center gap-2">
                <span className="text-profit-green">✓</span>
                Fix in dashboard
              </li>
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="px-4 py-3 text-sm font-bold text-black bg-profit-green hover:brightness-110 rounded-lg transition shadow-[0_0_20px_rgba(0,255,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-yt-light">
              You have access to all {tier === "OPERATOR" ? "Operator" : "Specialist"} features
              including AI suggestions, exports, and weekly monitoring.
            </p>
            {hasStripeCustomer && (
              <p className="text-xs text-yt-light/50 mt-3">
                Manage your payment method, view invoices, or cancel your subscription through Stripe&apos;s secure portal.
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-emergency-red mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
