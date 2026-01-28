'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

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
    <section className="bg-[#020617] py-24 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute w-[500px] h-[500px] bg-red-500 opacity-[0.06] rounded-full blur-[100px] pointer-events-none"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 text-sm font-semibold tracking-wide uppercase">
            Leak Calculator
          </span>
        </div>

        <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mb-4">
          HOW MUCH ARE YOU <span className="text-red-500">LOSING?</span>
        </h2>
        <p className="text-slate-400 mb-12">
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
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${sliderPercentage}%, #1e293b ${sliderPercentage}%, #1e293b 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-slate-500 mt-3 font-mono">
            <span>10K views/mo</span>
            <span>1M views/mo</span>
          </div>
        </div>

        {/* The result */}
        <motion.div
          className="glass-card p-10 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-mono">Estimated Annual Loss</p>
          <p className="font-display text-6xl md:text-8xl text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]">
            ${annualLoss.toLocaleString()}
          </p>
          <p className="text-slate-400 mt-4">
            That&apos;s <span className="text-white font-bold">${monthlyLoss.toLocaleString()}/month</span> leaking from your back catalog
          </p>
        </motion.div>

        <Link
          href="/audit"
          className="btn-primary text-lg px-10 py-5 mt-8"
        >
          Plug the Leaks — Free Scan
        </Link>
      </div>
    </section>
  );
}

// Keep the old export name for backwards compatibility
export { LeakCalculator as RevenueSlider };
