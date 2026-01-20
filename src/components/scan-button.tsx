"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

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
      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 rounded-lg font-semibold transition"
    >
      <Search className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
      {loading ? "Scanning..." : "Scan Links"}
    </button>
  );
}
