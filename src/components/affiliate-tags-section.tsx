"use client";

import { useState } from "react";
import { Tag } from "lucide-react";

const AMAZON_REGIONS = {
  US: { domain: "amazon.com", flag: "\ud83c\uddfa\ud83c\uddf8", name: "United States" },
  UK: { domain: "amazon.co.uk", flag: "\ud83c\uddec\ud83c\udde7", name: "United Kingdom" },
  CA: { domain: "amazon.ca", flag: "\ud83c\udde8\ud83c\udde6", name: "Canada" },
  DE: { domain: "amazon.de", flag: "\ud83c\udde9\ud83c\uddea", name: "Germany" },
} as const;

type AmazonRegion = keyof typeof AMAZON_REGIONS;

interface AffiliateTagsSectionProps {
  initialTags: {
    affiliateTagUS: string | null;
    affiliateTagUK: string | null;
    affiliateTagCA: string | null;
    affiliateTagDE: string | null;
  };
}

export function AffiliateTagsSection({ initialTags }: AffiliateTagsSectionProps) {
  const [tags, setTags] = useState({
    US: initialTags.affiliateTagUS || "",
    UK: initialTags.affiliateTagUK || "",
    CA: initialTags.affiliateTagCA || "",
    DE: initialTags.affiliateTagDE || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    setError(null);

    try {
      const response = await fetch("/api/user/affiliate-tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateTagUS: tags.US || null,
          affiliateTagUK: tags.UK || null,
          affiliateTagCA: tags.CA || null,
          affiliateTagDE: tags.DE || null,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save");
      }
    } catch (err) {
      console.error("Failed to save tags:", err);
      setError("Failed to save tags");
    } finally {
      setIsSaving(false);
    }
  }

  const hasAnyTag = Object.values(tags).some(t => t.trim() !== "");

  return (
    <div className="bg-yt-gray/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <Tag className="w-5 h-5" />
        Affiliate Tags
      </h2>
      <p className="text-yt-light text-sm mb-6">
        Auto-detected from your links. Edit if needed. These tags are used when finding replacement products.
      </p>

      <div className="space-y-4">
        {(Object.keys(AMAZON_REGIONS) as AmazonRegion[]).map((region) => (
          <div key={region} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-full sm:w-40 flex items-center gap-2 text-sm">
              <span className="text-lg">{AMAZON_REGIONS[region].flag}</span>
              <span className="text-white font-medium">{region}</span>
              <span className="text-yt-light/50 text-xs hidden sm:inline">
                ({AMAZON_REGIONS[region].domain})
              </span>
            </div>
            <input
              type="text"
              value={tags[region]}
              onChange={(e) => setTags({ ...tags, [region]: e.target.value })}
              placeholder="your-tag-20"
              className="flex-1 bg-yt-gray border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-yt-light/50 focus:outline-none focus:border-white/30 transition"
            />
          </div>
        ))}
      </div>

      {!hasAnyTag && (
        <p className="text-yellow-400/80 text-xs mt-4">
          No affiliate tags saved yet. They will be auto-detected when you scan your channel.
        </p>
      )}

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-profit-green text-black px-6 py-2.5 font-bold text-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Tags"}
        </button>

        {saved && (
          <span className="text-profit-green text-sm flex items-center gap-1">
            <span>&#10003;</span> Saved
          </span>
        )}

        {error && <span className="text-emergency-red text-sm">{error}</span>}
      </div>
    </div>
  );
}
