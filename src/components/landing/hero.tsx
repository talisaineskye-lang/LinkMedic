'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6 pt-24 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl w-full">

        {/* Left - Copy */}
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight mb-6">
            LINKS DON&apos;T BREAK<br />
            <span className="text-orange-500">ALL AT ONCE.</span>
          </h1>

          <p className="text-xl text-zinc-400 mb-6 max-w-md">
            They slowly stop earning you money. And nobody tells you.
          </p>

          <p className="text-zinc-500 max-w-md mb-8">
            We check your YouTube affiliate links every week so you don&apos;t have to.
          </p>

          <Link
            href="/audit"
            className="w-fit rounded-xl bg-orange-500 text-zinc-950 px-8 py-4 font-bold hover:bg-orange-400 transition shadow-[0_0_30px_rgba(249,115,22,0.3)]"
          >
            RUN A CHANNEL SCAN →
          </Link>

          <p className="text-zinc-600 text-sm mt-4">
            No credit card required · Under 2 minutes
          </p>
        </div>

        {/* Right - Animated decay */}
        <div className="flex items-center justify-center">
          <DecayAnimation />
        </div>

      </div>
    </section>
  );
}

function DecayAnimation() {
  const links = [
    { text: "amazon.com/dp/B08X4..." },
    { text: "amazon.com/dp/B07NQ..." },
    { text: "amazon.com/dp/B09L3..." },
  ];

  return (
    <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-md border border-zinc-800">
      <div className="flex justify-between items-center mb-6">
        <span className="font-display text-sm text-zinc-400 tracking-wide">CHANNEL SCAN</span>
        <motion.span
          className="text-green-400 text-xs"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ● LIVE
        </motion.span>
      </div>

      <div className="space-y-3 font-mono text-sm">
        {links.map((link, index) => (
          <motion.div
            key={index}
            animate={{
              color:
                index === 0
                  ? ["#22c55e", "#22c55e", "#22c55e", "#22c55e"]
                  : index === 1
                  ? ["#22c55e", "#22c55e", "#eab308", "#eab308"]
                  : ["#22c55e", "#eab308", "#ef4444", "#ef4444"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut"
            }}
            className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
          >
            <span>{link.text}</span>
            <span className="text-xs">
              {index === 2 ? (
                <motion.span
                  animate={{ opacity: [0, 0, 1, 1] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="text-red-400 font-bold"
                >
                  DEAD
                </motion.span>
              ) : (
                <span className="text-zinc-600">OK</span>
              )}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="mt-6 text-sm text-zinc-500 text-center"
        animate={{ opacity: [0, 0, 0.8, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        Most creators never notice.
      </motion.p>
    </div>
  );
}
