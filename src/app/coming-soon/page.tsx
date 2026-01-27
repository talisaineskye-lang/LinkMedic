import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-yt-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-yt-dark/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="LinkMedic" width={120} height={28} className="h-7 w-auto" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          {/* Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-profit-green/10 border border-profit-green/30">
            <Sparkles className="w-10 h-10 text-profit-green" />
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl tracking-wide mb-4">
            COMING SOON
          </h1>

          {/* Description */}
          <p className="text-yt-light text-lg mb-8">
            We&apos;re working on something exciting. This feature will be available soon.
          </p>

          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-profit-green text-black font-medium rounded-lg hover:bg-profit-green/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <p className="text-center text-sm text-yt-light/50">
          Stay tuned for updates.
        </p>
      </footer>
    </div>
  );
}
