'use client';

import { motion } from 'framer-motion';

export function VideoDemo() {

  return (
    <section className="relative pt-12 pb-24 overflow-hidden bg-[#020617]">
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
          <div className="aspect-video bg-slate-900/80 rounded-xl relative overflow-hidden">
            <video
              className="w-full h-full"
              controls
              playsInline
              preload="metadata"
              src="/demo.mp4"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
