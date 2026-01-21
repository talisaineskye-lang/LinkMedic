"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export function FindReplacementsButton() {
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
    setLoading(true);
    try {
      const response = await fetch("/api/links/find-replacements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
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
      disabled={loading || linksNeeding === 0}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white transition"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Finding...
        </>
      ) : (
        <>
          <Search className="w-4 h-4" />
          Find Replacements
          {linksNeeding !== null && linksNeeding > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-emerald-500 rounded-full">
              {linksNeeding}
            </span>
          )}
        </>
      )}
    </button>
  );
}
