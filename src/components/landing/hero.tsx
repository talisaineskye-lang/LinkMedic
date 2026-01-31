'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-[#020617] text-white px-6 pt-44 sm:pt-36 pb-8 overflow-hidden">
      {/* Ambient glow effects */}
      <div
        className="absolute w-[600px] h-[600px] bg-cyan-500 opacity-[0.08] rounded-full blur-[120px] pointer-events-none"
        style={{ top: '-200px', right: '-100px' }}
      />
      <div
        className="absolute w-[400px] h-[400px] bg-red-500 opacity-[0.04] rounded-full blur-[100px] pointer-events-none"
        style={{ bottom: '0', left: '5%' }}
      />

      <div className="max-w-6xl w-full mx-auto relative z-10">
        {/* Main headline */}
        <div className="text-center mb-12">
          <motion.h1
            className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            YOUR VIDEOS ARE QUIETLY{" "}
            <br />
            <span className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
              LOSING REVENUE.
            </span>
          </motion.h1>

          <motion.p
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Broken affiliate links in your <span className="text-red-500">YouTube</span> back catalog are costing you commission every day.
            We detect them, suggest fixes, and keep scanning so it doesn&apos;t happen again.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Link
              href="/audit"
              className="btn-primary text-lg px-8 py-4"
            >
              Scan My Channel - Free
            </Link>
            <Link
              href="#pricing"
              className="btn-ghost text-lg px-8 py-4"
            >
              See Pricing
            </Link>
          </motion.div>

          <motion.p
            className="text-cyan-400 text-sm mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            Currently supporting YouTube creators
          </motion.p>

          <motion.p
            className="text-slate-500 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            No credit card required · Results in under 2 minutes
          </motion.p>
        </div>

        {/* Demo Video */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10">
            {/* Browser-style header */}
            <div className="bg-slate-800/80 px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-slate-400 text-xs">LinkMedic Demo</span>
              </div>
            </div>
            {/* Video */}
            <video
              className="w-full"
              autoPlay
              muted
              loop
              playsInline
              controls
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
