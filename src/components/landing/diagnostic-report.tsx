'use client';

import { motion } from 'framer-motion';

export function DiagnosticReport() {
  return (
    <section id="problem" className="bg-[#0F0F0F] py-24 relative">

      {/* Scanner line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF00]/50 to-transparent"
        initial={{ top: '0%' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-[#00FF00] font-mono text-sm mb-4 tracking-wider">DIAGNOSTIC REPORT</p>
          <h2 className="font-display text-4xl md:text-6xl text-white tracking-wide mb-4">
            WHY YOUR LINKS ARE <span className="text-[#FF0000]">DYING</span>
          </h2>
          <p className="text-[#AAAAAA] max-w-2xl mx-auto">
            Your back catalog is bleeding revenue from three critical failure points.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Card 1: Flatline */}
          <motion.div
            className="bg-[#272727]/70 backdrop-blur-sm rounded-xl p-6 border border-white/10 relative overflow-hidden"
            whileHover={{ scale: 1.02, borderColor: 'rgba(255,0,0,0.3)' }}
            transition={{ duration: 0.2 }}
          >
            {/* Flatline EKG */}
            <div className="mb-4">
              <svg width="100%" height="40" viewBox="0 0 200 40" className="text-[#FF0000]">
                <motion.path
                  d="M0 20 L60 20 L70 5 L80 35 L90 20 L200 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white mb-2">PRODUCT FLATLINED</h3>
            <p className="text-[#AAAAAA] text-sm">
              Amazon products get discontinued. The page goes 404. Your viewers hit a dead end.
            </p>
            <div className="mt-4 font-mono text-xs text-[#FF0000]">
              STATUS: CRITICAL
            </div>
          </motion.div>

          {/* Card 2: Fracture */}
          <motion.div
            className="bg-[#272727]/70 backdrop-blur-sm rounded-xl p-6 border border-white/10 relative overflow-hidden"
            whileHover={{ scale: 1.02, borderColor: 'rgba(255,0,0,0.3)' }}
            transition={{ duration: 0.2 }}
          >
            {/* Static Flatline */}
            <div className="mb-4">
              <svg width="100%" height="40" viewBox="0 0 200 40" className="text-[#FF0000]">
                <path
                  d="M0 20 L200 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white mb-2">URL FRACTURE</h3>
            <p className="text-[#AAAAAA] text-sm">
              Amazon changes URLs silently. Redirects break your affiliate tag. You lose credit for sales.
            </p>
            <div className="mt-4 font-mono text-xs text-[#FF0000]">
              STATUS: WARNING
            </div>
          </motion.div>

          {/* Card 3: Tag Expired */}
          <motion.div
            className="bg-[#272727]/70 backdrop-blur-sm rounded-xl p-6 border border-white/10 relative overflow-hidden"
            whileHover={{ scale: 1.02, borderColor: 'rgba(255,0,0,0.3)' }}
            transition={{ duration: 0.2 }}
          >
            {/* Static Flatline */}
            <div className="mb-4">
              <svg width="100%" height="40" viewBox="0 0 200 40" className="text-[#FF0000]">
                <path
                  d="M0 20 L200 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="font-display text-2xl text-white mb-2">TAG EXPIRED</h3>
            <p className="text-[#AAAAAA] text-sm">
              Affiliate tags expire or get stripped during redirects. You send the click, someone else gets the commission.
            </p>
            <div className="mt-4 font-mono text-xs text-[#FF0000]">
              STATUS: AT RISK
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
