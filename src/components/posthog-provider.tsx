"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { initPostHog, identifyUser, posthog, isPostHogReady } from "@/lib/posthog";
import { hasAnalyticsConsent } from "./cookie-consent";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [ready, setReady] = useState(false);

  // Initialize PostHog only if user has consented
  const tryInitPostHog = useCallback(() => {
    if (hasAnalyticsConsent()) {
      initPostHog();
      setReady(isPostHogReady());
    }
  }, []);

  // Initialize PostHog on mount if consent exists
  useEffect(() => {
    tryInitPostHog();

    // Listen for consent event (user accepts cookies after page load)
    const handleConsentAccepted = () => {
      tryInitPostHog();
    };

    window.addEventListener('cookieConsentAccepted', handleConsentAccepted);
    return () => {
      window.removeEventListener('cookieConsentAccepted', handleConsentAccepted);
    };
  }, [tryInitPostHog]);

  // Track page views
  useEffect(() => {
    if (ready && pathname) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ready]);

  // Identify user when session is available
  useEffect(() => {
    if (ready && status === "authenticated" && session?.user?.id) {
      identifyUser(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
    }
  }, [session, status, ready]);

  return <>{children}</>;
}
