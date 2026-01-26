"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { initPostHog, identifyUser, posthog, POSTHOG_KEY } from "@/lib/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Initialize PostHog on mount
  useEffect(() => {
    try {
      initPostHog();
    } catch (error) {
      console.warn("[PostHog] Failed to initialize:", error);
    }
  }, []);

  // Track page views
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !pathname || !POSTHOG_KEY) {
        return;
      }
      let url = window.origin + pathname;
      const searchString = searchParams?.toString?.();
      if (searchString) {
        url = url + `?${searchString}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    } catch (error) {
      console.warn("[PostHog] Failed to track pageview:", error);
    }
  }, [pathname, searchParams]);

  // Identify user when session is available
  useEffect(() => {
    try {
      if (status === "authenticated" && session?.user?.id) {
        identifyUser(session.user.id, {
          email: session.user.email,
          name: session.user.name,
        });
      }
    } catch (error) {
      console.warn("[PostHog] Failed to identify user:", error);
    }
  }, [session, status]);

  return <>{children}</>;
}
