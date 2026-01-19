"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ScanButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScan = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to scan links");
        return;
      }

      const data = await response.json();
      alert(`Scanned ${data.checked} links. Found ${data.issuesFound} issues.`);
      router.refresh();
    } catch (error) {
      console.error("Scan error:", error);
      alert("Failed to scan links");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleScan}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Scanning..." : "Scan Links"}
    </button>
  );
}
