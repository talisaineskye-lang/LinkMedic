'use client';

import { useState } from 'react';
import Link from 'next/link';

export function RevenueSlider() {
  const [monthlyViews, setMonthlyViews] = useState(100000);

  const clickRate = 0.02;
  const brokenRate = 0.15;
  const conversionRate = 0.03;
  const avgCommission = 4.5;

  const monthlyLoss = Math.round(monthlyViews * clickRate * brokenRate * conversionRate * avgCommission);
  const annualLoss = monthlyLoss * 12;

  return (
    <section className="bg-zinc-900 py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-5xl text-zinc-100 mb-4 tracking-tight">
          HOW MUCH IS <span className="text-red-400">SLIPPING THROUGH?</span>
        </h2>
        <p className="text-zinc-500 mb-12">
          Drag to see what broken links might cost you.
        </p>

        {/* Slider */}
        <div className="mb-10">
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={monthlyViews}
            onChange={(e) => setMonthlyViews(Number(e.target.value))}
            className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#f97316' }}
          />
          <div className="flex justify-between text-sm text-zinc-600 mt-3">
            <span>10K views/mo</span>
            <span>1M views/mo</span>
          </div>
        </div>

        {/* THE GUT PUNCH */}
        <div className="bg-zinc-950 rounded-2xl p-10 mb-8 border border-zinc-800">
          <p className="text-zinc-500 text-sm mb-3 uppercase tracking-wide">Estimated Annual Loss</p>
          <p className="font-display text-6xl md:text-8xl text-red-400 mb-3">
            ${annualLoss.toLocaleString()}
          </p>
          <p className="text-zinc-400">
            That&apos;s <span className="text-zinc-100 font-semibold">${monthlyLoss.toLocaleString()}/month</span> you&apos;re not earning
          </p>
        </div>

        <Link
          href="/audit"
          className="inline-block rounded-xl bg-orange-500 text-zinc-950 px-8 py-4 font-bold hover:bg-orange-400 transition shadow-[0_0_30px_rgba(249,115,22,0.3)]"
        >
          FIND MY BROKEN LINKS →
        </Link>
      </div>
    </section>
  );
}
