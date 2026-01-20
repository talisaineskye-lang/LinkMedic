"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { PostHogProvider } from "./posthog-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <PostHogProvider>{children}</PostHogProvider>
      </Suspense>
    </SessionProvider>
  );
}
