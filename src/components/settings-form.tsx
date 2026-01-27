"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "./tooltip";

interface SettingsFormProps {
  initialValues: {
    ctrPercent: number;
    conversionPercent: number;
    avgOrderValue: number;
    affiliateTag: string;
  };
}

// Industry average presets based on niche
const NICHE_PRESETS: Record<string, { ctr: number; conversion: number; aov: number; label: string }> = {
  tech: { ctr: 2.5, conversion: 3.5, aov: 85, label: "Tech / Electronics" },
  beauty: { ctr: 3.0, conversion: 4.0, aov: 35, label: "Beauty / Skincare" },
  finance: { ctr: 1.5, conversion: 2.0, aov: 120, label: "Finance / Investing" },
  fitness: { ctr: 2.0, conversion: 3.5, aov: 55, label: "Fitness / Health" },
  food: { ctr: 2.5, conversion: 4.5, aov: 40, label: "Food / Kitchen" },
  diy: { ctr: 2.0, conversion: 3.0, aov: 65, label: "DIY / Home Improvement" },
  lifestyle: { ctr: 2.0, conversion: 3.0, aov: 45, label: "Lifestyle / General" },
};

// Tooltip content for each field
const TOOLTIPS = {
  affiliateTag: "Your unique Amazon Associates tracking ID. Find it in your Amazon Associates dashboard under 'Account Settings'. It usually ends with '-20'.",
  ctr: "The percentage of video viewers who click your affiliate links. Industry average is 1-3%. Higher for engaged audiences, lower for casual viewers.",
  conversion: "The percentage of link clicks that result in a purchase within Amazon's 24-hour cookie window. Typically 2-5% depending on product type.",
  aov: "The average total cart value when someone purchases through your link. Includes all items bought in that session, not just the linked product.",
};

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const router = useRouter();

  const handleNicheChange = (nicheKey: string) => {
    setSelectedNiche(nicheKey);
    if (nicheKey && NICHE_PRESETS[nicheKey]) {
      const preset = NICHE_PRESETS[nicheKey];
      setValues({
        ...values,
        ctrPercent: preset.ctr,
        conversionPercent: preset.conversion,
        avgOrderValue: preset.aov,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save settings");
      }

      setMessage("Settings saved successfully!");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="affiliateTag" className="flex items-center text-sm font-medium text-slate-300 mb-1">
          Amazon Affiliate Tag
          <Tooltip content={TOOLTIPS.affiliateTag} />
        </label>
        <input
          type="text"
          id="affiliateTag"
          placeholder="e.g., mychannel-20"
          value={values.affiliateTag}
          onChange={(e) =>
            setValues({ ...values, affiliateTag: e.target.value.trim() })
          }
          className="w-full max-w-xs px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-profit-green focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Your Amazon Associates tag (required for AI replacement links). Find it in your Amazon Associates dashboard.
        </p>
      </div>

      {/* Niche Preset Dropdown */}
      <div className="pt-4 border-t border-slate-700/50">
        <label htmlFor="nichePreset" className="block text-sm font-medium text-slate-300 mb-1">
          Quick Setup: Select Your Niche
        </label>
        <select
          id="nichePreset"
          value={selectedNiche}
          onChange={(e) => handleNicheChange(e.target.value)}
          className="w-full max-w-xs px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-profit-green focus:border-transparent"
        >
          <option value="">Choose a niche to auto-fill averages...</option>
          {Object.entries(NICHE_PRESETS).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.label} (CTR: {preset.ctr}%, Conv: {preset.conversion}%, AOV: ${preset.aov})
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          Select your channel&apos;s niche to auto-fill industry-average values. You can adjust them afterwards.
        </p>
      </div>

      <div>
        <label htmlFor="ctrPercent" className="flex items-center text-sm font-medium text-slate-300 mb-1">
          Click-Through Rate (CTR) %
          <Tooltip content={TOOLTIPS.ctr} />
        </label>
        <input
          type="number"
          id="ctrPercent"
          step="0.1"
          min="0"
          max="100"
          value={values.ctrPercent}
          onChange={(e) =>
            setValues({ ...values, ctrPercent: parseFloat(e.target.value) || 0 })
          }
          className="w-full max-w-xs px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-profit-green focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Typical range: 1-3%. Percentage of viewers who click affiliate links.
        </p>
      </div>

      <div>
        <label htmlFor="conversionPercent" className="flex items-center text-sm font-medium text-slate-300 mb-1">
          Conversion Rate %
          <Tooltip content={TOOLTIPS.conversion} />
        </label>
        <input
          type="number"
          id="conversionPercent"
          step="0.1"
          min="0"
          max="100"
          value={values.conversionPercent}
          onChange={(e) =>
            setValues({ ...values, conversionPercent: parseFloat(e.target.value) || 0 })
          }
          className="w-full max-w-xs px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-profit-green focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Typical range: 2-5%. Percentage of clicks that result in purchases.
        </p>
      </div>

      <div>
        <label htmlFor="avgOrderValue" className="flex items-center text-sm font-medium text-slate-300 mb-1">
          Average Order Value ($)
          <Tooltip content={TOOLTIPS.aov} />
        </label>
        <input
          type="number"
          id="avgOrderValue"
          step="1"
          min="0"
          max="10000"
          value={values.avgOrderValue}
          onChange={(e) =>
            setValues({ ...values, avgOrderValue: parseFloat(e.target.value) || 0 })
          }
          className="w-full max-w-xs px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-profit-green focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Typical range: $30-60. Average purchase amount through your affiliate links.
        </p>
      </div>

      {message && (
        <div
          className={`text-sm ${
            message.includes("success") ? "text-profit-green" : "text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-black bg-profit-green rounded-lg hover:bg-profit-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
        <p className="text-xs text-slate-500 mt-2">
          These values affect your estimated revenue calculations. Don&apos;t worry about being exact &mdash; you can update them anytime as you learn more about your audience.
        </p>
      </div>
    </form>
  );
}
