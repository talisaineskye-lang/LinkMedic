'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FoundingSpotsData {
  spotsRemaining: number;
  totalSpots: number;
  spotsTaken: number;
  isClosed: boolean;
}

export function FoundingMemberBanner() {
  const [data, setData] = useState<FoundingSpotsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpots() {
      try {
        const res = await fetch('/api/founding-spots');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error('Failed to fetch founding spots:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSpots();
  }, []);

  // Don't render if loading, no data, or program is closed
  if (loading || !data || data.isClosed) {
    return null;
  }

  return (
    <motion.div
      className="bg-gradient-to-r from-cyan-500/10 via-cyan-500/20 to-cyan-500/10 border-b border-cyan-500/30"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-4 text-center">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-mono text-[10px] sm:text-sm tracking-wider whitespace-nowrap">
            FOUNDING MEMBER OFFER
          </span>
          <span className="hidden sm:inline text-white/30">|</span>
        </div>
        <p className="text-white text-xs sm:text-sm">
          First {data.totalSpots} users get Specialist access free for 6 months.
          <span className="text-slate-400 hidden sm:inline"> No credit card required.</span>
          {" "}
          <Link
            href="/login"
            className="text-cyan-400 font-bold hover:underline underline-offset-2 sm:hidden"
          >
            Claim →
          </Link>
        </p>
        <Link
          href="/login"
          className="hidden sm:inline text-cyan-400 text-sm font-bold hover:underline underline-offset-2 whitespace-nowrap"
        >
          Click here →
        </Link>
      </div>
    </motion.div>
  );
}
