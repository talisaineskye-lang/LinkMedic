'use client';

import { motion } from "framer-motion";

export function Marquee() {
  const items = [
    "15% LINK DECAY RATE",
    "404 ERRORS",
    "$1,500+ LOST ANNUALLY",
    "EXPIRED TAGS",
    "OUT OF STOCK",
    "BROKEN REDIRECTS",
    "MISSING COMMISSIONS",
  ];

  const doubled = [...items, ...items];

  return (
    <div className="bg-orange-500 py-4 overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-display text-zinc-950 text-sm md:text-base tracking-wide mx-8"
          >
            {item} •
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function MarqueeLight() {
  const items = [
    "WEEKLY SCANS",
    "AI FIX SUGGESTIONS",
    "BULK EXPORT",
    "SIMPLE PRICING",
    "NO DASHBOARDS",
    "JUST WHAT'S BROKEN",
  ];

  const doubled = [...items, ...items];

  return (
    <div className="bg-zinc-100 py-4 overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["-50%", "0%"] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-display text-zinc-950 text-sm md:text-base tracking-wide mx-8"
          >
            {item} •
          </span>
        ))}
      </motion.div>
    </div>
  );
}
