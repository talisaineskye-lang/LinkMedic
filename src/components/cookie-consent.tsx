'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

type ConsentChoice = 'accepted' | 'declined' | null;

// Check for existing consent
const getConsent = (): ConsentChoice => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cookie_consent') as ConsentChoice;
};

// Store consent choice
const setConsent = (choice: 'accepted' | 'declined') => {
  localStorage.setItem('cookie_consent', choice);
  localStorage.setItem('cookie_consent_date', Date.now().toString());
};

// Check if consent is expired (12 months)
const isConsentExpired = (): boolean => {
  if (typeof window === 'undefined') return true;
  const consentDate = localStorage.getItem('cookie_consent_date');
  if (!consentDate) return true;
  const twelveMonths = 365 * 24 * 60 * 60 * 1000;
  return Date.now() - parseInt(consentDate) > twelveMonths;
};

// Show banner if no consent or expired
const shouldShowBanner = (): boolean => {
  const consent = getConsent();
  if (!consent) return true;
  if (isConsentExpired()) {
    // Clear expired consent
    localStorage.removeItem('cookie_consent');
    localStorage.removeItem('cookie_consent_date');
    return true;
  }
  return false;
};

// Export for use in analytics loading
export const hasAnalyticsConsent = (): boolean => {
  return getConsent() === 'accepted' && !isConsentExpired();
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Small delay to prevent flash on page load
    const timer = setTimeout(() => {
      setIsVisible(shouldShowBanner());
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setIsClosing(true);
    setConsent('accepted');

    // Trigger analytics loading event
    window.dispatchEvent(new CustomEvent('cookieConsentAccepted'));

    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const handleDecline = () => {
    setIsClosing(true);
    setConsent('declined');

    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: isClosing ? 100 : 0, opacity: isClosing ? 0 : 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
            duration: isClosing ? 0.2 : 0.3
          }}
          className="fixed bottom-0 left-0 right-0 z-[1000] border-t border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-[0_-4px_30px_rgba(0,0,0,0.3)]"
        >
          <div className="max-w-4xl mx-auto px-6 py-5 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Cookie className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-white font-semibold">Cookie Settings</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Essential cookies keep you logged in. Analytics cookies help us understand how creators use LinkMedic.
                  You can decline analytics and still use the app.{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 hover:underline transition"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 sm:flex-shrink-0">
                <button
                  onClick={handleDecline}
                  className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-transparent border border-white/20 hover:border-white/40 rounded-lg transition"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="px-5 py-2.5 text-sm font-bold text-black bg-cyan-500 hover:bg-cyan-400 rounded-lg transition shadow-[0_0_20px_rgba(0,212,170,0.2)]"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
