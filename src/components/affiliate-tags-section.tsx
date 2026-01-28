"use client";

import { useState } from "react";
import { Tag, HelpCircle } from "lucide-react";
import { NETWORK_HELP } from "@/lib/affiliate-networks";

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
    // Multi-network partner IDs
    bhphoto_bi: string | null;
    bhphoto_kbid: string | null;
    impact_sid: string | null;
    cj_pid: string | null;
    rakuten_id: string | null;
    shareasale_id: string | null;
    awin_id: string | null;
  };
}

export function AffiliateTagsSection({ initialTags }: AffiliateTagsSectionProps) {
  // Amazon region tags
  const [tags, setTags] = useState({
    US: initialTags.affiliateTagUS || "",
    UK: initialTags.affiliateTagUK || "",
    CA: initialTags.affiliateTagCA || "",
    DE: initialTags.affiliateTagDE || "",
  });

  // Multi-network partner IDs
  const [partnerIds, setPartnerIds] = useState({
    bhphoto_bi: initialTags.bhphoto_bi || "",
    bhphoto_kbid: initialTags.bhphoto_kbid || "",
    impact_sid: initialTags.impact_sid || "",
    cj_pid: initialTags.cj_pid || "",
    rakuten_id: initialTags.rakuten_id || "",
    shareasale_id: initialTags.shareasale_id || "",
    awin_id: initialTags.awin_id || "",
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
          // Amazon region tags
          affiliateTagUS: tags.US || null,
          affiliateTagUK: tags.UK || null,
          affiliateTagCA: tags.CA || null,
          affiliateTagDE: tags.DE || null,
          // Multi-network partner IDs
          bhphoto_bi: partnerIds.bhphoto_bi || null,
          bhphoto_kbid: partnerIds.bhphoto_kbid || null,
          impact_sid: partnerIds.impact_sid || null,
          cj_pid: partnerIds.cj_pid || null,
          rakuten_id: partnerIds.rakuten_id || null,
          shareasale_id: partnerIds.shareasale_id || null,
          awin_id: partnerIds.awin_id || null,
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
  const hasAnyPartnerId = Object.values(partnerIds).some(t => t.trim() !== "");

  return (
    <div className="bg-white/5/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <Tag className="w-5 h-5" />
        Affiliate Tags
      </h2>
      <p className="text-slate-400 text-sm mb-6">
        Auto-detected from your links. Edit if needed. These tags are used when finding replacement products.
      </p>

      <div className="space-y-4">
        {(Object.keys(AMAZON_REGIONS) as AmazonRegion[]).map((region) => (
          <div key={region} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-full sm:w-40 flex items-center gap-2 text-sm">
              <span className="text-lg">{AMAZON_REGIONS[region].flag}</span>
              <span className="text-white font-medium">{region}</span>
              <span className="text-slate-400/50 text-xs hidden sm:inline">
                ({AMAZON_REGIONS[region].domain})
              </span>
            </div>
            <input
              type="text"
              value={tags[region]}
              onChange={(e) => setTags({ ...tags, [region]: e.target.value })}
              placeholder="your-tag-20"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400/50 focus:outline-none focus:border-white/30 transition"
            />
          </div>
        ))}
      </div>

      {!hasAnyTag && (
        <p className="text-yellow-400/80 text-xs mt-4">
          No affiliate tags saved yet. They will be auto-detected when you scan your channel.
        </p>
      )}

      {/* Other Affiliate Networks */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-sm font-medium text-white mb-2">Other Affiliate Networks</h3>
        <p className="text-xs text-slate-400/70 mb-4">
          Add your partner IDs to enable auto-fix for non-Amazon affiliate links.
        </p>

        {/* B&H Photo - 2 fields in a row */}
        <div className="mb-6">
          <div className="text-sm text-white font-medium mb-2">B&amp;H Photo</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400/70 mb-1.5">BI Parameter</label>
              <input
                type="text"
                value={partnerIds.bhphoto_bi}
                onChange={(e) => setPartnerIds({ ...partnerIds, bhphoto_bi: e.target.value })}
                placeholder="Your BI"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400/50 focus:outline-none focus:border-white/30 transition"
              />
              <p className="text-xs text-slate-400/50 mt-1 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                {NETWORK_HELP.bhphoto_bi}
              </p>
            </div>
            <div>
              <label className="block text-xs text-slate-400/70 mb-1.5">KBID Parameter</label>
              <input
                type="text"
                value={partnerIds.bhphoto_kbid}
                onChange={(e) => setPartnerIds({ ...partnerIds, bhphoto_kbid: e.target.value })}
                placeholder="Your KBID"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400/50 focus:outline-none focus:border-white/30 transition"
              />
            </div>
          </div>
        </div>

        {/* Single-field networks */}
        <div className="space-y-4">
          {/* Impact */}
          <div>
            <label className="block text-xs text-slate-400/70 mb-1.5">Impact Account SID</label>
            <input
              type="text"
              value={partnerIds.impact_sid}
              onChange={(e) => setPartnerIds({ ...partnerIds, impact_sid: e.target.value })}
              placeholder="Your Account SID"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400/50 focus:outline-none focus:border-white/30 transition"
            />
            <p className="text-xs text-slate-400/50 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {NETWORK_HELP.impact_sid}
            </p>
          </div>

          {/* CJ Affiliate */}
          <div>
            <label className="block text-xs text-slate-400/70 mb-1.5">CJ Affiliate Publisher ID</label>
            <input
              type="text"
              value={partnerIds.cj_pid}
              onChange={(e) => setPartnerIds({ ...partnerIds, cj_pid: e.target.value })}
              placeholder="Your Publisher ID"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400/50 focus:outline-none focus:border-white/30 transition"
            />
            <p className="text-xs text-slate-400/50 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {NETWORK_HELP.cj_pid}
            </p>
          </div>

          {/* Rakuten */}
          <div>
            <label className="block text-xs text-slate-400/70 mb-1.5">Rakuten Site ID</label>
            <input
              type="text"
              value={partnerIds.rakuten_id}
              onChange={(e) => setPartnerIds({ ...partnerIds, rakuten_id: e.target.value })}
              placeholder="Your Site ID"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400/50 focus:outline-none focus:border-white/30 transition"
            />
            <p className="text-xs text-slate-400/50 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {NETWORK_HELP.rakuten_id}
            </p>
          </div>

          {/* ShareASale */}
          <div>
            <label className="block text-xs text-slate-400/70 mb-1.5">ShareASale Affiliate ID</label>
            <input
              type="text"
              value={partnerIds.shareasale_id}
              onChange={(e) => setPartnerIds({ ...partnerIds, shareasale_id: e.target.value })}
              placeholder="Your Affiliate ID"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400/50 focus:outline-none focus:border-white/30 transition"
            />
            <p className="text-xs text-slate-400/50 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {NETWORK_HELP.shareasale_id}
            </p>
          </div>

          {/* Awin */}
          <div>
            <label className="block text-xs text-slate-400/70 mb-1.5">Awin Publisher ID</label>
            <input
              type="text"
              value={partnerIds.awin_id}
              onChange={(e) => setPartnerIds({ ...partnerIds, awin_id: e.target.value })}
              placeholder="Your Publisher ID"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-400/50 focus:outline-none focus:border-white/30 transition"
            />
            <p className="text-xs text-slate-400/50 mt-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {NETWORK_HELP.awin_id}
            </p>
          </div>
        </div>

        {!hasAnyPartnerId && (
          <p className="text-slate-400/50 text-xs mt-4">
            No partner IDs saved yet. Add your IDs to enable link repair for these networks.
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-cyan-500 text-black px-6 py-2.5 font-bold text-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Tags"}
        </button>

        {saved && (
          <span className="text-cyan-400 text-sm flex items-center gap-1">
            <span>&#10003;</span> Saved
          </span>
        )}

        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </div>
  );
}
