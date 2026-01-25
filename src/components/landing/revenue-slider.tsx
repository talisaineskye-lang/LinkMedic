'use client';

import { useState } from 'react';
import Link from 'next/link';

export function RevenueSlider() {
  const [monthlyViews, setMonthlyViews] = useState(100000);

  const lostClicks = Math.round(monthlyViews * 0.02 * 0.15);
  const monthlyLoss = Math.round(lostClicks * 0.03 * 4.5);
  const annualLoss = monthlyLoss * 12;

  return (
    <section id="calculator" className="bg-zinc-950 py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-4">
          How much slips through?
        </h2>
        <p className="text-zinc-500 mb-12">
          Drag to see what broken links might cost you.
        </p>

        <div className="mb-8">
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={monthlyViews}
            onChange={(e) => setMonthlyViews(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
          />
          <div className="flex justify-between text-sm text-zinc-600 mt-3">
            <span>10K views/mo</span>
            <span>1M views/mo</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 rounded-2xl p-8">
          <p className="text-zinc-500 text-sm mb-2">Estimated annual loss</p>
          <p className="text-5xl font-semibold text-zinc-100 mb-2">
            ${annualLoss.toLocaleString()}
          </p>
          <p className="text-zinc-600 text-sm">
            About ${monthlyLoss}/month walking out the door
          </p>
        </div>

        <Link
          href="/audit"
          className="inline-block mt-8 rounded-xl bg-zinc-100 text-zinc-900 px-8 py-4 font-medium hover:bg-zinc-200 transition"
        >
          Find My Broken Links
        </Link>
      </div>
    </section>
  );
}
