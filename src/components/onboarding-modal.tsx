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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            Complete Your Setup
          </h2>

          {/* Description */}
          <p className="text-slate-400 text-center text-sm mb-6">
            To get accurate revenue estimates and AI-powered replacement links, please add your Amazon affiliate tag and revenue settings.
          </p>

          {/* Benefits */}
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3 text-sm">
              <span className="text-emerald-500 mt-0.5">&#10003;</span>
              <span className="text-slate-300">
                <strong className="text-white">Accurate revenue estimates</strong> based on your niche and audience
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="text-emerald-500 mt-0.5">&#10003;</span>
              <span className="text-slate-300">
                <strong className="text-white">AI replacement links</strong> with your affiliate tag already applied
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm">
              <span className="text-emerald-500 mt-0.5">&#10003;</span>
              <span className="text-slate-300">
                <strong className="text-white">Quick niche presets</strong> to auto-fill industry averages
              </span>
            </li>
          </ul>

          {/* CTA */}
          <Link
            href="/settings"
            onClick={handleDismiss}
            className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-medium rounded-lg transition-colors"
          >
            Go to Settings
          </Link>

          {/* Skip */}
          <button
            onClick={handleDismiss}
            className="block w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors text-center"
          >
            I&apos;ll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
