"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Sparkles } from "lucide-react";

interface FindReplacementsButtonProps {
  canUseAI?: boolean;
  linksWithoutSuggestions?: number;
}

export function FindReplacementsButton({
  canUseAI = true,
  linksWithoutSuggestions: initialCount
}: FindReplacementsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [linksNeeding, setLinksNeeding] = useState<number | null>(initialCount ?? null);
  const router = useRouter();

  // Check how many links need replacements on mount (if not provided)
  useEffect(() => {
    if (initialCount !== undefined) return;

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
  }, [initialCount]);

  const handleFindNext10 = async () => {
    if (!canUseAI) {
      window.location.href = "/#pricing";
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: Math.min(linksNeeding || 5, 5) });

    try {
      // The endpoint already limits to 5 at a time
      const response = await fetch("/api/links/find-replacements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          window.location.href = "/#pricing";
          return;
        }
        if (data.requiresTag) {
          alert("Please add your Amazon affiliate tag in Settings first");
          return;
        }
        throw new Error(data.error || "Failed to find replacements");
      }

      // Update the count
      if (linksNeeding !== null) {
        setLinksNeeding(Math.max(0, linksNeeding - data.processed));
      }

      router.refresh();
    } catch (error) {
      console.error("Error finding replacements:", error);
      alert(
        error instanceof Error ? error.message : "Failed to find replacements"
      );
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  // Don't show button for free users or if no links need replacements
  if (!canUseAI || linksNeeding === 0) {
    return null;
  }

  return (
    <button
      onClick={handleFindNext10}
      disabled={loading || linksNeeding === 0}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black transition disabled:opacity-50"
      title="Find AI suggestions for the next 5 links"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {progress ? `Finding ${progress.total}...` : "Finding..."}
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Find Next 5
          {linksNeeding !== null && linksNeeding > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-black/20 rounded-full">
              {linksNeeding} left
            </span>
          )}
        </>
      )}
    </button>
  );
}
