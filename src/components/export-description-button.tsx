"use client";

import { useState } from "react";
import { FileText, X, Copy, Check, Download } from "lucide-react";
import { track, ANALYTICS_EVENTS } from "@/lib/posthog";

interface ExportDescriptionButtonProps {
  videoId: string;
  videoTitle: string;
}

interface ExportData {
  originalDescription: string;
  correctedDescription: string;
  replacements: { original: string; suggested: string }[];
  hasChanges: boolean;
}

export function ExportDescriptionButton({
  videoId,
  videoTitle,
}: ExportDescriptionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExportData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);
    track(ANALYTICS_EVENTS.EXPORT_DESCRIPTION_CLICKED, { videoId });

    try {
      const response = await fetch(`/api/videos/${videoId}/export-description`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load description");
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load description");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.correctedDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([data.correctedDescription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${videoTitle.replace(/[^a-z0-9]/gi, "_")}_description.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setIsOpen(false);
    setData(null);
    setError(null);
    setCopied(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-emerald-950/50 hover:border-emerald-700/50 hover:text-emerald-400 transition"
      >
        <FileText className="w-4 h-4" />
        Export Fixed Description
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Export Fixed Description
                </h2>
                <p className="text-sm text-slate-400 truncate max-w-md">
                  {videoTitle}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={handleOpen}
                    className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
                  >
                    Try Again
                  </button>
                </div>
              ) : data ? (
                <div className="space-y-6">
                  {/* Replacements Summary */}
                  {data.replacements.length > 0 ? (
                    <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-emerald-400 mb-3">
                        {data.replacements.length} link(s) will be replaced:
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {data.replacements.map((r, i) => (
                          <li key={i} className="flex flex-col gap-1">
                            <span className="text-red-400 line-through truncate">
                              {r.original}
                            </span>
                            <span className="text-emerald-400 truncate">
                              → {r.suggested}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-slate-400">
                        No links to replace. All broken links either have no suggestions
                        or are already marked as fixed.
                      </p>
                    </div>
                  )}

                  {/* Corrected Description Preview */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">
                      {data.hasChanges ? "Corrected Description:" : "Original Description:"}
                    </h3>
                    <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                        {data.correctedDescription}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {data && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 transition"
                >
                  <Download className="w-4 h-4" />
                  Download .txt
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
