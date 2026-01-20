"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  initialValues: {
    ctrPercent: number;
    conversionPercent: number;
    avgOrderValue: number;
  };
}

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

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
        <label htmlFor="ctrPercent" className="block text-sm font-medium text-slate-300 mb-1">
          Click-Through Rate (CTR) %
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
          className="w-full max-w-xs px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Typical range: 1-3%. Percentage of viewers who click affiliate links.
        </p>
      </div>

      <div>
        <label htmlFor="conversionPercent" className="block text-sm font-medium text-slate-300 mb-1">
          Conversion Rate %
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
          className="w-full max-w-xs px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Typical range: 2-5%. Percentage of clicks that result in purchases.
        </p>
      </div>

      <div>
        <label htmlFor="avgOrderValue" className="block text-sm font-medium text-slate-300 mb-1">
          Average Order Value ($)
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
          className="w-full max-w-xs px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Typical range: $30-60. Average purchase amount through your affiliate links.
        </p>
      </div>

      {message && (
        <div
          className={`text-sm ${
            message.includes("success") ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
