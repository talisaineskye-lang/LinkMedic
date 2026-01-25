'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  const links = [
    { id: 1, text: "amazon.com/dp/B08X4...", status: "OK" },
    { id: 2, text: "amazon.com/dp/B07NQ...", status: "OK" },
    { id: 3, text: "amazon.com/dp/B09L3...", status: "Unavailable" },
  ];

  return (
    <section className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl w-full">

        {/* Left - Copy */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-6">
            Links don&apos;t break<br />all at once.
          </h1>

          <p className="text-xl text-zinc-400 mb-8">
            They slowly stop earning you money.
          </p>

          <p className="text-zinc-500 max-w-md mb-8">
            We quietly watch your YouTube affiliate links every week so you don&apos;t have to.
          </p>

          <Link
            href="/audit"
            className="w-fit rounded-xl bg-zinc-100 text-zinc-900 px-8 py-4 font-medium hover:bg-zinc-200 transition"
          >
            Run a Channel Scan
          </Link>

          <p className="text-zinc-600 text-sm mt-4">
            No credit card required · Results in under 2 minutes
          </p>
        </div>

        {/* Right - Animated decay visualization */}
        <div className="flex items-center justify-center">
          <div className="bg-zinc-900/60 backdrop-blur rounded-2xl p-8 w-full max-w-md">
            <div className="text-sm text-zinc-500 mb-6 flex justify-between items-center">
              <span>Channel scan preview</span>
              <motion.span
                className="text-green-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ●
              </motion.span>
            </div>

            <div className="space-y-4 font-mono text-sm">
              {links.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0.6 }}
                  animate={{
                    opacity: 1,
                    color:
                      index === 0
                        ? ["#22c55e", "#22c55e", "#22c55e", "#22c55e"]
                        : index === 1
                        ? ["#22c55e", "#22c55e", "#eab308", "#eab308"]
                        : ["#22c55e", "#eab308", "#ef4444", "#ef4444"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    delay: index * 0.3,
                    ease: "easeInOut"
                  }}
                  className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0"
                >
                  <span>{link.text}</span>
                  <span className="text-xs text-zinc-600">
                    {index === 2 ? (
                      <motion.span
                        animate={{ opacity: [0, 0, 1, 1] }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="text-red-400"
                      >
                        Unavailable
                      </motion.span>
                    ) : (
                      "OK"
                    )}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.p
              className="mt-8 text-sm text-zinc-600 text-center"
              animate={{ opacity: [0, 0, 0.8, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              Most creators never notice.
            </motion.p>
          </div>
        </div>

      </div>
    </section>
  );
}
