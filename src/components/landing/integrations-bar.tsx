'use client';

import { motion } from 'framer-motion';

const platforms = [
  { name: 'Amazon', subtext: 'Associates', color: '#FF9900' },
  { name: 'Impact', subtext: '', color: '#00B4D8' },
  { name: 'CJ', subtext: 'Affiliate', color: '#00C853' },
  { name: 'Rakuten', subtext: 'Advertising', color: '#BF0000' },
  { name: 'ShareASale', subtext: '', color: '#38B449' },
  { name: 'Awin', subtext: '', color: '#0099CC' },
];

export function IntegrationsBar() {
  return (
    <section className="bg-[#020617] py-16 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.p
          className="text-center text-slate-500 text-xs tracking-widest uppercase mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          We Scan Links From
        </motion.p>

        {/* Networks Row */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {platforms.map((platform) => (
            <motion.div
              key={platform.name}
              className="flex items-baseline gap-1.5 cursor-default"
              style={{ opacity: 0.85 }}
              whileHover={{
                opacity: 1,
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <span
                className="text-lg sm:text-xl font-semibold tracking-tight"
                style={{ color: platform.color }}
              >
                {platform.name}
              </span>
              {platform.subtext && (
                <span className="text-sm text-slate-500 font-normal">
                  {platform.subtext}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Subtext */}
        <motion.p
          className="text-center text-slate-400 text-sm mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Protecting <span className="text-cyan-400">YouTube creator</span> revenue across 6 major networks
        </motion.p>

        {/* Bottom Line */}
        <motion.p
          className="text-center text-slate-500 text-sm mt-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          + <span className="text-cyan-400 font-medium">any link</span> that returns a 404, redirect, or error
        </motion.p>
      </div>
    </section>
  );
}
