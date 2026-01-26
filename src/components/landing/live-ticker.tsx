'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEO_TITLES = [
  "Best Tech 2023",
  "My Morning Routine",
  "Budget Gaming Setup",
  "Honest Review: iPhone 15",
  "Home Office Tour",
  "Top 10 Amazon Finds",
  "What's In My Bag",
  "Desk Setup 2024",
  "Travel Essentials",
  "Kitchen Gadgets Test",
  "Productivity Apps",
  "Studio Tour",
];

const PROBLEMS = [
  { type: "LINK DEAD", color: "text-[#FF0000]" },
  { type: "TAG EXPIRED", color: "text-yellow-400" },
  { type: "OUT OF STOCK", color: "text-orange-400" },
  { type: "REDIRECT BROKEN", color: "text-[#FF0000]" },
];

interface TickerItem {
  video: string;
  problem: { type: string; color: string };
  loss: string;
  id: number;
}

function generateTickerItem(): TickerItem {
  const video = VIDEO_TITLES[Math.floor(Math.random() * VIDEO_TITLES.length)];
  const problem = PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)];
  const loss = (Math.random() * 20 + 1).toFixed(2);
  return { video, problem, loss, id: Date.now() + Math.random() };
}

export function LiveTicker() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<TickerItem[]>([]);

  // Only generate items after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Generate initial item on client only
    setItems([generateTickerItem()]);

    const interval = setInterval(() => {
      setItems(prev => {
        const newItems = [generateTickerItem(), ...prev];
        return newItems.slice(0, 5);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <section className="bg-[#0A0A0A] border-y border-white/10 py-4 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF0000] rounded-full" />
              <span className="text-xs font-mono text-[#AAAAAA] uppercase tracking-wider">Live Scan Feed</span>
            </span>
          </div>
          <div className="font-mono text-sm space-y-2 h-6">
            <span className="text-[#AAAAAA]/50">Initializing scanner...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#0A0A0A] border-y border-white/10 py-4 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">

        <div className="flex items-center gap-4 mb-3">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#FF0000] rounded-full" />
            <span className="text-xs font-mono text-[#AAAAAA] uppercase tracking-wider">Live Scan Feed</span>
          </span>
        </div>

        <div className="font-mono text-sm space-y-2">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 text-[#AAAAAA]"
              >
                <span className="text-[#AAAAAA]/50">CHECKING:</span>
                <span className="text-white">&quot;{item.video}&quot;</span>
                <span className="text-[#AAAAAA]/30">...</span>
                <span className={`font-bold ${item.problem.color}`}>[{item.problem.type}]</span>
                <span className="text-[#AAAAAA]/30">...</span>
                <span className="text-[#FF0000]">LOSS: ${item.loss}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
