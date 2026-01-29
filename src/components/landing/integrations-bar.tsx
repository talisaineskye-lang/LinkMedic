'use client';

import { motion } from 'framer-motion';

const platforms = [
  { name: 'Amazon', subtext: 'Associates', color: '#FF9900' },
  { name: 'Impact', subtext: '', color: '#6366F1' },
  { name: 'CJ', subtext: 'Affiliate', color: '#0EA5E9' },
  { name: 'Rakuten', subtext: 'Advertising', color: '#BF0000' },
  { name: 'ShareASale', subtext: '', color: '#10B981' },
  { name: 'Awin', subtext: '', color: '#0D9488' },
];

export function IntegrationsBar() {
  return (
    <section className="bg-[#020617] py-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <motion.p
          className="text-center text-slate-500 text-sm tracking-wide uppercase mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          We scan links from
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 sm:gap-x-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="group flex items-baseline gap-1 opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              <span
                className="text-lg sm:text-xl font-bold tracking-tight"
                style={{ color: platform.color }}
              >
                {platform.name}
              </span>
              {platform.subtext && (
                <span className="text-xs sm:text-sm text-slate-500 font-medium">
                  {platform.subtext}
                </span>
              )}
            </div>
          ))}
        </motion.div>

        <motion.p
          className="text-center text-slate-600 text-xs mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          + any link that returns a 404, redirect, or error
        </motion.p>
      </div>
    </section>
  );
}
