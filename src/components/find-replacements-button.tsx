"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Lock } from "lucide-react";

interface FindReplacementsButtonProps {
  canUseAI?: boolean;
}

export function FindReplacementsButton({ canUseAI = true }: FindReplacementsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [linksNeeding, setLinksNeeding] = useState<number | null>(null);
  const router = useRouter();

  // Check how many links need replacements on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch("/api/links/find-replacements");
        if (response.ok) {
          const data = await response.json();
          setLinksNeeding(data.linksNeedingReplacements);
        }
      } catch (error) {
        console.error("Error checking replacement status:", error);
      }
    }
    checkStatus();
  }, []);

  const handleFindReplacements = async () => {
    if (!canUseAI) {
      alert("Upgrade to a paid plan to get AI-powered replacement suggestions");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/links/find-replacements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          alert(data.message || "Upgrade required for this feature");
          return;
        }
        throw new Error(data.error || "Failed to find replacements");
      }

      alert(data.message);
      router.refresh();
    } catch (error) {
      console.error("Error finding replacements:", error);
      alert(
        error instanceof Error ? error.message : "Failed to find replacements"
      );
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if no links need replacements
  if (linksNeeding === 0) {
    return null;
  }

  return (
    <button
      onClick={handleFindReplacements}
      disabled={loading || linksNeeding === 0 || !canUseAI}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition ${
        canUseAI
          ? "bg-cyan-500 hover:bg-cyan-500/90 disabled:bg-slate-600"
          : "bg-slate-700 cursor-not-allowed"
      }`}
      title={!canUseAI ? "Upgrade to use AI suggestions" : undefined}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Finding...
        </>
      ) : !canUseAI ? (
        <>
          <Lock className="w-4 h-4" />
          AI Suggestions
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-600 rounded-full">
            PRO
          </span>
        </>
      ) : (
        <>
          <Search className="w-4 h-4" />
          Find Replacements
          {linksNeeding !== null && linksNeeding > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-cyan-500 rounded-full">
              {linksNeeding}
            </span>
          )}
        </>
      )}
    </button>
  );
}
