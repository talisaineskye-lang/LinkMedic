import { PostHog } from "posthog-node";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (!POSTHOG_KEY) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      flushAt: 1, // Send events immediately in serverless
      flushInterval: 0,
    });
  }

  return posthogClient;
}

// Event names - same as client-side for consistency
export const SERVER_ANALYTICS_EVENTS = {
  USER_SIGNED_UP: "user_signed_up",
  USER_SIGNED_IN: "user_signed_in",
} as const;

// Track server-side event
export async function trackServerEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogClient();
  if (client) {
    client.capture({
      distinctId: userId,
      event,
      properties,
    });
    // Flush immediately for serverless
    await client.shutdown();
    // Re-initialize for next request
    posthogClient = null;
  }
}
