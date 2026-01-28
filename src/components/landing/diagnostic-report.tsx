'use client';

import { motion } from 'framer-motion';
import { XCircle, Unlink, Tag } from 'lucide-react';

const issues = [
  {
    icon: XCircle,
    title: 'PRODUCT FLATLINED',
    description: 'Amazon products get discontinued. The page goes 404. Your viewers hit a dead end.',
    status: 'CRITICAL',
    statusColor: 'text-red-400',
  },
  {
    icon: Unlink,
    title: 'URL FRACTURE',
    description: 'Amazon changes URLs silently. Redirects break your affiliate tag. You lose credit for sales.',
    status: 'WARNING',
    statusColor: 'text-amber-400',
  },
  {
    icon: Tag,
    title: 'TAG EXPIRED',
    description: 'Affiliate tags expire or get stripped during redirects. You send the click, someone else gets the commission.',
    status: 'AT RISK',
    statusColor: 'text-amber-400',
  },
];

export function DiagnosticReport() {
  return (
    <section id="problem" className="bg-[#020617] py-24 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute w-[500px] h-[500px] bg-red-500 opacity-[0.05] rounded-full blur-[100px] pointer-events-none"
        style={{ top: '50%', left: '-10%', transform: 'translateY(-50%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">
            Diagnostic Report
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mt-3 mb-4">
            WHY YOUR LINKS ARE <span className="text-red-500">DYING</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Your back catalog is bleeding revenue from three critical failure points.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {issues.map((issue, index) => {
            const Icon = issue.icon;
            return (
              <motion.div
                key={issue.title}
                className="glass-card p-6 hover:-translate-y-1 transition-transform duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                {/* Icon */}
                <div className="mb-4 p-3 bg-red-500/10 rounded-xl w-fit">
                  <Icon className="w-8 h-8 text-red-400" />
                </div>

                <h3 className="font-display text-xl text-white mb-2">{issue.title}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {issue.description}
                </p>
                <div className="font-mono text-xs">
                  <span className="text-slate-500">STATUS: </span>
                  <span className={issue.statusColor}>{issue.status}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
