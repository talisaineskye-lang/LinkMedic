'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center px-6 pt-24 pb-12 relative overflow-hidden">

      {/* Subtle scan lines effect */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.1) 2px,
            rgba(255,255,255,0.1) 4px
          )`,
        }}
      />

      <div className="max-w-6xl w-full mx-auto">

        {/* Main headline */}
        <div className="text-center mb-12">
          <motion.h1
            className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-wide mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            YOUR VIDEOS ARE QUIETLY{" "}
            <br />
            <span className="text-[#FF0000] drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">
              LOSING REVENUE.
            </span>
          </motion.h1>

          <motion.p
            className="text-[#AAAAAA] text-lg md:text-xl max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Broken affiliate links in your YouTube back catalog are costing you commission every day.
            We detect them, suggest fixes, and keep scanning so it doesn&apos;t happen again.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Link
              href="/audit"
              className="inline-block rounded-lg bg-[#00FF00] text-black px-8 py-4 font-bold text-lg hover:brightness-110 transition shadow-[0_0_40px_rgba(0,255,0,0.3)]"
            >
              Scan My Channel - Free
            </Link>
            <p className="text-[#AAAAAA]/50 text-sm mt-3">
              No credit card required · Results in under 2 minutes
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
