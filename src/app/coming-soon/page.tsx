import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f172a]/95 backdrop-blur-md">
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
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <Sparkles className="w-10 h-10 text-cyan-400" />
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl tracking-wide mb-4">
            COMING SOON
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-lg mb-8">
            We&apos;re working on something exciting. This feature will be available soon.
          </p>

          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-500/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <p className="text-center text-sm text-slate-400/50">
          Stay tuned for updates.
        </p>
      </footer>
    </div>
  );
}
