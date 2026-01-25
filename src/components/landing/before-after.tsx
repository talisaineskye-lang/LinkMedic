'use client';

import { motion } from 'framer-motion';

export function BeforeAfter() {
  return (
    <section className="bg-[#0A0A0A] py-24">
      <div className="max-w-5xl mx-auto px-6">

        <div className="text-center mb-16">
          <p className="text-[#00FF00] font-mono text-sm mb-4 tracking-wider">THE FIX</p>
          <h2 className="font-display text-4xl md:text-6xl text-white tracking-wide">
            FROM <span className="text-[#FF0000]">BROKEN</span> TO{" "}
            <span className="text-[#00FF00]">EARNING</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">

          {/* Before: Sick Link */}
          <motion.div
            className="relative h-full"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute -top-3 left-4 bg-[#FF0000] text-white text-xs font-bold px-3 py-1 rounded z-10">
              BEFORE
            </div>
            <div className="bg-[#272727] rounded-xl p-6 border-2 border-[#FF0000]/50 relative overflow-hidden h-full flex flex-col">
              {/* Blur/static effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/5 to-transparent" />

              {/* Fake 404 page */}
              <div className="relative flex-1 flex flex-col">
                <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-[#FF0000]" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="h-2 w-3/4 bg-[#333] rounded mb-2" />
                  <div className="h-2 w-1/2 bg-[#333] rounded" />
                </div>

                <div className="text-center py-4 opacity-50 flex-1 flex flex-col justify-center">
                  <p className="font-display text-4xl text-[#FF0000] mb-2">404</p>
                  <p className="text-[#AAAAAA] text-sm">Product no longer available</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                  <span className="text-[#AAAAAA] text-sm">Revenue:</span>
                  <span className="font-display text-2xl text-[#FF0000]">$0.00</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* After: Healthy Link */}
          <motion.div
            className="relative h-full"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute -top-3 left-4 bg-[#00FF00] text-black text-xs font-bold px-3 py-1 rounded z-10">
              AFTER
            </div>
            <div className="bg-[#272727] rounded-xl p-6 border-2 border-[#00FF00]/50 relative overflow-hidden h-full flex flex-col">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00FF00]/5 to-transparent" />

              {/* Fake product page */}
              <div className="relative flex-1 flex flex-col">
                <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-[#FF0000]" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-[#00FF00]" />
                  </div>
                  <div className="h-2 w-full bg-[#00FF00]/30 rounded mb-2" />
                  <div className="h-2 w-2/3 bg-[#00FF00]/20 rounded" />
                </div>

                <div className="flex items-center gap-4 py-4 flex-1">
                  <div className="w-16 h-16 bg-[#333] rounded-lg flex items-center justify-center text-2xl">
                    📦
                  </div>
                  <div>
                    <p className="text-white font-medium">Product Name</p>
                    <p className="text-[#00FF00] text-sm flex items-center gap-1">
                      ✓ In Stock · Tag Verified
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                  <span className="text-[#AAAAAA] text-sm">Revenue:</span>
                  <span className="font-display text-2xl text-[#00FF00]">$1,247.00</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
