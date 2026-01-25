'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function LeakCalculator() {
  const [monthlyViews, setMonthlyViews] = useState(100000);

  const clickRate = 0.02;
  const brokenRate = 0.15;
  const conversionRate = 0.03;
  const avgCommission = 4.5;

  const monthlyLoss = Math.round(monthlyViews * clickRate * brokenRate * conversionRate * avgCommission);
  const annualLoss = monthlyLoss * 12;

  const sliderPercentage = ((monthlyViews - 10000) / (1000000 - 10000)) * 100;

  return (
    <section className="bg-[#0F0F0F] py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">

        <p className="text-[#FF0000] font-mono text-sm mb-4 tracking-wider">⚠ LEAK CALCULATOR</p>
        <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-4">
          HOW MUCH ARE YOU <span className="text-[#FF0000]">LOSING?</span>
        </h2>
        <p className="text-[#AAAAAA] mb-12">
          Drag to estimate the revenue leaking from your back catalog.
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
            className="w-full h-2 bg-[#272727] rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: '#FF0000',
              background: `linear-gradient(to right, #FF0000 0%, #FF0000 ${sliderPercentage}%, #272727 ${sliderPercentage}%, #272727 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-[#AAAAAA]/50 mt-3 font-mono">
            <span>10K views/mo</span>
            <span>1M views/mo</span>
          </div>
        </div>

        {/* The gut punch */}
        <motion.div
          className="bg-[#272727]/70 backdrop-blur-sm rounded-2xl p-10 border border-[#FF0000]/30 relative overflow-hidden"
          animate={{
            boxShadow: [
              '0 0 20px rgba(255,0,0,0.1)',
              '0 0 40px rgba(255,0,0,0.2)',
              '0 0 20px rgba(255,0,0,0.1)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-[#AAAAAA] text-sm mb-2 uppercase tracking-wider font-mono">Estimated Annual Loss</p>
          <p className="font-display text-6xl md:text-8xl text-[#FF0000] drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">
            ${annualLoss.toLocaleString()}
          </p>
          <p className="text-[#AAAAAA] mt-4">
            That&apos;s <span className="text-white font-bold">${monthlyLoss.toLocaleString()}/month</span> leaking from your back catalog
          </p>
        </motion.div>

        <Link
          href="/audit"
          className="inline-block mt-8 rounded-lg bg-[#00FF00] text-black px-10 py-5 font-bold text-lg hover:brightness-110 transition shadow-[0_0_40px_rgba(0,255,0,0.3)]"
        >
          PLUG THE LEAKS — FREE SCAN
        </Link>

      </div>
    </section>
  );
}

// Keep the old export name for backwards compatibility
export { LeakCalculator as RevenueSlider };
