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
      className="bg-gradient-to-r from-[#00FF00]/10 via-[#00FF00]/20 to-[#00FF00]/10 border-b border-[#00FF00]/30"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
        <div className="flex items-center gap-2">
          <span className="text-[#00FF00] font-mono text-xs sm:text-sm tracking-wider">
            FOUNDING MEMBER PROGRAM
          </span>
          <span className="hidden sm:inline text-white/30">|</span>
        </div>
        <p className="text-white text-sm">
          <span className="font-bold text-[#00FF00]">{data.spotsRemaining}</span> of {data.totalSpots} spots left
          <span className="text-white/70"> — Get Specialist tier free for 90 days</span>
        </p>
        <Link
          href="/login"
          className="text-[#00FF00] text-sm font-bold hover:underline underline-offset-2"
        >
          Claim Your Spot →
        </Link>
      </div>
    </motion.div>
  );
}
