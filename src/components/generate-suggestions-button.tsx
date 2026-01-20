"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export function GenerateSuggestionsButton() {
  const [loading, setLoading] = useState(false);
  const [linksNeeding, setLinksNeeding] = useState<number | null>(null);
  const router = useRouter();

  // Check how many links need suggestions on mount
  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch("/api/links/generate-suggestions");
        if (response.ok) {
          const data = await response.json();
          setLinksNeeding(data.linksNeedingSuggestions);
        }
      } catch (error) {
        console.error("Error checking suggestion status:", error);
      }
    }
    checkStatus();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/links/generate-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate suggestions");
      }

      alert(data.message);
      router.refresh();
    } catch (error) {
      console.error("Error generating suggestions:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate suggestions"
      );
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if no links need suggestions
  if (linksNeeding === 0) {
    return null;
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading || linksNeeding === 0}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white transition"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Generate Suggestions
          {linksNeeding !== null && linksNeeding > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-500 rounded-full">
              {linksNeeding}
            </span>
          )}
        </>
      )}
    </button>
  );
}
