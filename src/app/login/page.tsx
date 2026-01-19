"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0.5 text-xl font-semibold">
            <span className="text-gray-900">Link</span>
            <LinkIcon className="w-5 h-5 text-red-600" />
            <span className="text-red-600">Medic</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-sm w-full">
          {/* Logo */}
          <div className="flex items-center justify-center gap-0.5 text-3xl font-semibold mb-3">
            <span className="text-gray-900">Link</span>
            <LinkIcon className="w-7 h-7 text-red-600" />
            <span className="text-red-600">Medic</span>
          </div>
          <p className="text-gray-600/85 text-center mb-8">Sign in to protect your affiliate revenue</p>

          {error && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              {error === "OAuthSignin" && "Error starting sign in process."}
              {error === "OAuthCallback" && "Error during authentication."}
              {error === "OAuthCreateAccount" && "Error creating account."}
              {error === "Default" && "An error occurred during sign in."}
            </div>
          )}

          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-green-900 text-white px-4 py-3 rounded-md font-medium hover:bg-green-950 transition-colors border border-green-950/20 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <p className="mt-4 text-xs text-gray-500/80 text-center leading-relaxed">
              We&apos;ll access your YouTube channel to scan video descriptions for affiliate links.
            </p>
          </div>

          <p className="mt-4 text-xs text-gray-500/80 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-500/80">
          <div className="flex items-center justify-center gap-0.5 mb-1">
            <span>Link</span>
            <LinkIcon className="w-4 h-4 text-red-600" />
            <span className="text-red-600">Medic</span>
          </div>
          <p>Affiliate link health monitoring for YouTube creators.</p>
        </div>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
