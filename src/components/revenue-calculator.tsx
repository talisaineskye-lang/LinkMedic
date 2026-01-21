"use client";

import { useState, useEffect } from "react";
import { DollarSign, Video, Link as LinkIcon, TrendingUp } from "lucide-react";

export function RevenueCalculator() {
  const [monthlyViews, setMonthlyViews] = useState(100000);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Revenue calculation for affiliate-focused YouTube creators
  //
  // Our target customer: creators who actively use affiliate links
  // (tech reviewers, beauty creators, gear channels, etc.)
  //
  // For these creators:
  // - Most videos have affiliate links in descriptions
  // - Viewers come specifically for product recommendations
  // - CTR on affiliate links is higher than general YouTube
  //
  // Model assumptions (conservative for affiliate-focused creators):
  // - 60% of videos have affiliate links
  // - 4% of views result in affiliate link clicks (higher intent audience)
  // - 3% conversion rate after click
  // - $50 average order value
  // - 4% commission rate
  // - 15% of links are broken/OOS

  const brokenLinkRate = 0.15;        // 15% of links broken/OOS
  const affiliateVideoShare = 0.60;   // 60% of videos have affiliate links
  const affiliateCTR = 0.04;          // 4% click affiliate links
  const conversionRate = 0.03;        // 3% conversion after click
  const avgOrderValue = 50;           // $50 average order
  const commissionRate = 0.04;        // 4% commission

  // Calculate monthly affiliate revenue potential
  const affiliateViews = monthlyViews * affiliateVideoShare;
  const totalClicks = affiliateViews * affiliateCTR;
  const totalConversions = totalClicks * conversionRate;
  const totalMonthlyRevenue = totalConversions * avgOrderValue * commissionRate;

  // Loss from broken links
  const monthlyLoss = Math.round(totalMonthlyRevenue * brokenLinkRate);
  const annualLoss = monthlyLoss * 12;

  // Lost clicks for display
  const lostClicks = Math.round(totalClicks * brokenLinkRate);

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
            {monthlyViews >= 1000000
              ? `${(monthlyViews / 1000000).toFixed(1)}M`
              : `${(monthlyViews / 1000).toFixed(0)}K`} views/month
          </span>
          <span>1M</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-900/50 rounded-xl p-4">
          <Video className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {lostClicks.toLocaleString()}
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
            ${annualLoss.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Est. annual loss</div>
        </div>
      </div>

      {/* Breakdown tooltip */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 text-center">
          Based on 15% broken link rate, 4% affiliate CTR, 3% conversion, $50 AOV, 4% commission
        </p>
      </div>
    </div>
  );
}
