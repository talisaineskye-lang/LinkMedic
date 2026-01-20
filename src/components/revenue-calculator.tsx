"use client";

import { useState, useEffect } from "react";
import { DollarSign, Video, Link as LinkIcon } from "lucide-react";

export function RevenueCalculator() {
  const [monthlyViews, setMonthlyViews] = useState(100000);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate estimated loss (assuming 15% broken links, 2% CTR, 3% conversion, $45 avg order, 4% commission)
  const brokenLinkRate = 0.15;
  const ctr = 0.02;
  const conversionRate = 0.03;
  const avgOrderValue = 45;
  const commissionRate = 0.04;

  const potentialClicks = monthlyViews * ctr;
  const lostClicks = potentialClicks * brokenLinkRate;
  const lostConversions = lostClicks * conversionRate;
  const monthlyLoss = Math.round(lostConversions * avgOrderValue * commissionRate);

  if (!mounted) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
        <div className="h-[200px] flex items-center justify-center">
          <div className="text-slate-500">Loading calculator...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
      <div className="mb-8">
        <label className="block text-sm text-slate-400 mb-3">
          Your Monthly Video Views
        </label>
        <input
          type="range"
          min="10000"
          max="1000000"
          step="10000"
          value={monthlyViews}
          onChange={(e) => setMonthlyViews(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-sm text-slate-500 mt-2">
          <span>10K</span>
          <span className="text-xl font-bold text-white">
            {(monthlyViews / 1000).toFixed(0)}K views/month
          </span>
          <span>1M</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-900/50 rounded-xl p-4">
          <Video className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {Math.round(lostClicks).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Lost clicks/month</div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4">
          <LinkIcon className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-amber-500">15%</div>
          <div className="text-xs text-slate-500">Avg broken links</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <DollarSign className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-500">
            ${monthlyLoss.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Est. monthly loss</div>
        </div>
      </div>
    </div>
  );
}
