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
            YOU&apos;RE{" "}
            <span className="text-[#FF0000] drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]">
              LEAKING REVENUE
            </span>
            <br />
            FROM YOUR OLD VIDEOS.
          </motion.h1>

          <motion.p
            className="text-[#AAAAAA] text-lg md:text-xl max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Broken affiliate links in your back catalog are costing you money every single day. Most creators never notice.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Link
              href="/audit"
              className="inline-block rounded-lg bg-[#00FF00] text-black px-10 py-5 font-bold text-lg hover:brightness-110 transition shadow-[0_0_40px_rgba(0,255,0,0.3)] animate-pulse"
            >
              SCAN MY CHANNEL FOR LEAKS — FREE
            </Link>
            <p className="text-[#AAAAAA]/50 text-sm mt-4">
              No credit card required · Results in under 2 minutes
            </p>
          </motion.div>
        </div>

        {/* Profit Pipe Visual */}
        <ProfitPipe />

      </div>
    </section>
  );
}

function ProfitPipe() {
  return (
    <div className="relative max-w-3xl mx-auto mt-12">
      <div className="flex items-center justify-center gap-4">

        {/* Left: Money flowing in - multiple dollar signs */}
        <div className="flex-1 flex justify-end">
          <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-[#00FF00] font-mono text-sm mr-2">REVENUE IN</span>
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="text-[#00FF00] font-bold text-2xl"
                animate={{ x: [0, 15, 30], opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: "linear"
                }}
              >
                $
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Center: The Leak */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="w-32 h-20 bg-[#272727] rounded-lg border-2 border-[#AAAAAA]/20 relative overflow-hidden">
            {/* Crack */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="60" height="40" viewBox="0 0 60 40" className="text-[#FF0000]">
                <path
                  d="M0 20 L20 20 L25 10 L30 30 L35 15 L40 25 L45 20 L60 20"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>

            {/* Leaking money - dollar signs falling */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 -translate-x-1/2 translate-y-full text-[#FF0000] font-bold text-lg"
                style={{ left: `${40 + i * 10}%` }}
                animate={{ y: [0, 15, 30], opacity: [1, 0.5, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              >
                $
              </motion.div>
            ))}
          </div>

          <p className="text-[#FF0000] text-xs font-mono text-center mt-2 animate-pulse">
            ⚠ LEAK DETECTED
          </p>
        </motion.div>

        {/* Right: Reduced money out - two staggered dollar signs, muted green */}
        <div className="flex-1 flex justify-start">
          <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                className="text-[#00FF00]/40 font-bold text-2xl"
                animate={{ x: [0, 40, 80], opacity: [0.2, 0.5, 0.2] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 1.5
                }}
              >
                $
              </motion.span>
            ))}
            <span className="text-[#AAAAAA]/50 font-mono text-sm ml-4">REVENUE OUT</span>
          </motion.div>
        </div>

      </div>

      {/* Lost revenue indicator */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[#FF0000] font-mono text-sm">-$1,847/year lost</span>
      </motion.div>
    </div>
  );
}
