"use client";

import posthog from "posthog-js";

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export function initPostHog() {
  if (typeof window !== "undefined" && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // We'll handle this manually for SPA
      persistence: "localStorage",
    });
  }
}

// Event names as constants for consistency
export const ANALYTICS_EVENTS = {
  USER_SIGNED_UP: "user_signed_up",
  USER_SIGNED_IN: "user_signed_in",
  SYNC_VIDEOS_CLICKED: "sync_videos_clicked",
  DASHBOARD_VIEWED: "dashboard_viewed",
  COPY_FIXED_LINK_CLICKED: "copy_fixed_link_clicked",
  EXPORT_DESCRIPTION_CLICKED: "export_description_clicked",
  MARK_AS_FIXED_CLICKED: "mark_as_fixed_clicked",
  GENERATE_SUGGESTIONS_CLICKED: "generate_suggestions_clicked",
} as const;

// Track function wrapper for type safety
export function track(
  event: (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS],
  properties?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && POSTHOG_KEY) {
    posthog.capture(event, properties);
  }
}

// Identify user (call after sign in)
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && POSTHOG_KEY) {
    posthog.identify(userId, properties);
  }
}

// Reset user (call on sign out)
export function resetUser() {
  if (typeof window !== "undefined" && POSTHOG_KEY) {
    posthog.reset();
  }
}

export { posthog };
