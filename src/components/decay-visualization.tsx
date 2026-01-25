'use client';

import { useState, useEffect } from 'react';

export function DecayVisualization() {
  const [stage, setStage] = useState(0);

  // Cycle through stages: 0 (all good) → 1 (one warning) → 2 (warning + error) → 3 (decay complete)
  useEffect(() => {
    const timer = setInterval(() => {
      setStage(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const links = [
    {
      url: 'amazon.com/dp/B08X4...',
      status: 'ok' as const, // Always OK
    },
    {
      url: 'amazon.com/dp/B07NQ...',
      status: (stage >= 1 ? 'warning' : 'ok') as 'ok' | 'warning' | 'error',
    },
    {
      url: 'amazon.com/dp/B09L3...',
      status: (stage >= 2 ? 'error' : stage >= 1 ? 'warning' : 'ok') as 'ok' | 'warning' | 'error',
    },
  ];

  const getStatusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok': return <span className="text-green-400">&#10003;</span>;
      case 'warning': return <span className="text-yellow-400">&#9888;</span>;
      case 'error': return <span className="text-red-400">&#10005;</span>;
    }
  };

  const getStatusClass = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok': return 'border-green-400/30 bg-green-400/5';
      case 'warning': return 'border-yellow-400/30 bg-yellow-400/5';
      case 'error': return 'border-red-400/30 bg-red-400/5';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700">
      {/* Time indicator */}
      <div className="text-right text-gray-500 text-sm italic mb-4">
        {stage === 0 && 'Today...'}
        {stage === 1 && '6 months later...'}
        {stage === 2 && '1 year later...'}
        {stage === 3 && '2 years later...'}
      </div>

      {/* Links */}
      <div className="space-y-3">
        {links.map((link, i) => (
          <div
            key={i}
            className={`
              flex items-center justify-between p-3 rounded border transition-all duration-500
              ${getStatusClass(link.status)}
            `}
          >
            <span className="text-gray-300 font-mono text-sm">{link.url}</span>
            <span className="text-lg transition-all duration-300">
              {getStatusIcon(link.status)}
            </span>
          </div>
        ))}
      </div>

      {/* Product unavailable message - appears at stage 2+ */}
      <div
        className={`
          mt-4 text-gray-500 text-sm italic transition-opacity duration-500
          ${stage >= 2 ? 'opacity-100' : 'opacity-0'}
        `}
      >
        Product Unavailable...
      </div>
    </div>
  );
}
