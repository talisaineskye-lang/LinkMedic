"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track, ANALYTICS_EVENTS } from "@/lib/posthog";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    track(ANALYTICS_EVENTS.SYNC_VIDEOS_CLICKED);
    try {
      const response = await fetch("/api/videos/sync", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to sync videos");
        return;
      }

      const data = await response.json();
      alert(`Synced ${data.synced} videos and extracted ${data.linksExtracted} links`);
      router.refresh();
    } catch (error) {
      console.error("Sync error:", error);
      alert("Failed to sync videos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Syncing..." : "Sync Videos"}
    </button>
  );
}
