"use client";

import { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "linkmedic-onboarding-dismissed";

interface OnboardingModalProps {
  show: boolean;
}

export function OnboardingModal({ show }: OnboardingModalProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    setMounted(true);
    const wasDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Persist dismissal to localStorage
  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted || !show || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-yt-gray/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 text-yt-light hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-profit-green/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,255,0,0.15)]">
              <Settings className="w-8 h-8 text-profit-green" />
            </div>
          </div>

          {/* Title */}
          <h2 className="font-display text-2xl tracking-wide text-white text-center mb-2">
            COMPLETE YOUR SETUP
          </h2>

          {/* Description */}
          <p className="text-yt-light text-center text-sm mb-6">
            To get accurate revenue estimates and AI-powered replacement links, please add your Amazon affiliate tag and revenue settings.
          </p>

          {/* Benefits */}
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3 text-sm">
              <span className="text-profit-green mt-0.5">&#10003;</span>
              <span className="text-yt-light">
                <strong className="text-white">Accurate revenue estimates</strong> based on your niche and audience
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="text-profit-green mt-0.5">&#10003;</span>
              <span className="text-yt-light">
                <strong className="text-white">AI replacement links</strong> with your affiliate tag already applied
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="text-profit-green mt-0.5">&#10003;</span>
              <span className="text-yt-light">
                <strong className="text-white">Quick niche presets</strong> to auto-fill industry averages
              </span>
            </li>
          </ul>

          {/* CTA */}
          <Link
            href="/settings"
            onClick={handleDismiss}
            className="block w-full py-3 px-4 bg-profit-green hover:brightness-110 text-black text-center font-bold rounded-lg transition shadow-[0_0_20px_rgba(0,255,0,0.2)]"
          >
            GO TO SETTINGS
          </Link>

          {/* Skip */}
          <button
            onClick={handleDismiss}
            className="block w-full mt-3 py-2 text-sm text-yt-light/50 hover:text-yt-light transition-colors text-center"
          >
            I&apos;ll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
