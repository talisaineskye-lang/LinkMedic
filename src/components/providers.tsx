"use client";

import { Suspense, Component, ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { PostHogProvider } from "./posthog-provider";

// Error boundary to catch client-side errors
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-yt-black flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl text-white mb-2">Something went wrong</h1>
            <p className="text-yt-light mb-4">Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-profit-green text-black font-semibold rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider refetchOnWindowFocus={false}>
        <Suspense fallback={null}>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </SessionProvider>
    </ErrorBoundary>
  );
}
