'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export function VideoDemo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative py-24 overflow-hidden bg-[#020617]">
      {/* Ambient glow */}
      <div className="absolute w-[600px] h-[400px] bg-cyan-500 opacity-10 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">
            See It In Action
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 tracking-tight text-white">
            60-Second Demo
          </h2>
          <p className="text-slate-400 mt-4">
            Watch how fast you can find and fix broken links
          </p>
        </div>

        <motion.div
          className="glass-card p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="aspect-video bg-slate-900/80 rounded-xl relative cursor-pointer group overflow-hidden"
            onClick={() => setIsPlaying(true)}
          >
            {!isPlaying ? (
              <>
                {/* Video thumbnail placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  {/* Decorative grid pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                      }}
                    />
                  </div>

                  {/* Demo preview elements */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>Demo Preview</span>
                  </div>
                </div>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 group-hover:scale-110 transition-transform"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </motion.div>
                </div>

                {/* Coming soon overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <span className="text-slate-400 text-sm bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700">
                    Demo video coming soon
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                {/* Video embed would go here */}
                <p>Video player placeholder</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
