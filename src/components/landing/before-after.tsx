'use client';

import { motion } from 'framer-motion';
import { Frown, Zap, X, Check, Clock, RefreshCw, MousePointer, Bot, Package } from 'lucide-react';

export function BeforeAfter() {
  return (
    <section className="bg-[#0f172a] py-24 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute w-[400px] h-[400px] bg-cyan-500 opacity-[0.06] rounded-full blur-[100px] pointer-events-none"
        style={{ top: '20%', right: '-5%' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">
            The Difference
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mt-3">
            FROM <span className="text-red-500">BROKEN</span> TO{" "}
            <span className="text-cyan-400">EARNING</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Manual (Before) */}
          <motion.div
            className="relative h-full"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-slate-900/60 rounded-2xl p-8 border border-white/5 h-full hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-800 rounded-xl">
                  <Frown className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-white">Manual Checking</h3>
                  <p className="text-slate-500 text-sm">The old way</p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  { icon: Clock, text: 'Hours clicking through each video' },
                  { icon: MousePointer, text: 'Manually testing every link' },
                  { icon: RefreshCw, text: 'No automated monitoring' },
                  { icon: X, text: 'Missing broken links constantly' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-400">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      <item.icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Typical recovery:</span>
                  <span className="font-display text-2xl text-red-400">$0</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* LinkMedic (After) */}
          <motion.div
            className="relative h-full"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="glass-card p-8 h-full hover:-translate-y-1 transition-transform duration-300"
              style={{ boxShadow: '0 20px 60px rgba(6, 182, 212, 0.1)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/15 rounded-xl">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-white">With LinkMedic</h3>
                  <p className="text-slate-500 text-sm">The smart way</p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  { icon: Zap, text: 'Full channel scan in 2 minutes' },
                  { icon: Bot, text: 'AI-powered fix suggestions' },
                  { icon: RefreshCw, text: 'Weekly automated monitoring' },
                  { icon: Check, text: 'Never miss a broken link' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="p-2 bg-cyan-500/15 rounded-lg">
                      <item.icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Revenue recovered:</span>
                  <span className="font-display text-2xl text-cyan-400">$1,247+</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
