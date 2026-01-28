"use client";

import { useState } from "react";
import { Check, Loader2, Users } from "lucide-react";

interface PortfolioWaitlistProps {
  source?: string;
}

export function PortfolioWaitlist({ source = "pricing" }: PortfolioWaitlistProps) {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          tier: "portfolio",
          source,
          feedback: feedback || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-cyan-500/10/30 border border-cyan-500/50 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">You&apos;re on the list!</h3>
        <p className="text-slate-300 text-sm">
          We&apos;ll email you when Operator tier launches.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold text-white">Operator</h3>
        <span className="px-2 py-0.5 text-xs font-medium bg-amber-600/20 text-amber-400 rounded-full">
          Coming Soon
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-4">
        Manage multiple YouTube channels from one dashboard. Join the waitlist to be notified when it launches.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            Optional: What&apos;s the #1 thing you&apos;d need from multi-channel management?
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g., unified dashboard, team access, bulk editing..."
            rows={2}
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition resize-none text-sm"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Waitlist"
          )}
        </button>
      </form>
    </div>
  );
}
