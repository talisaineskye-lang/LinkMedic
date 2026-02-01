import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact | LinkMedic",
  description:
    "Get in touch with the LinkMedic team for support, billing questions, or partnership inquiries.",
  openGraph: {
    title: "Contact | LinkMedic",
    description: "Get in touch with the LinkMedic team for support, billing questions, or partnership inquiries.",
    type: "website",
    url: "https://link-medic.app/contact",
    images: [{ url: "https://link-medic.app/opengraph-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | LinkMedic",
    description: "Get in touch with the LinkMedic team for support, billing questions, or partnership inquiries.",
    images: ["https://link-medic.app/opengraph-image.jpg"],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#020617]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="LinkMedic"
              width={120}
              height={28}
              className="h-7 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/audit" className="hover:text-white transition">
              Free Audit
            </Link>
            <Link href="/pricing" className="hover:text-white transition">
              Pricing
            </Link>
            <Link href="/resources" className="hover:text-white transition">
              Resources
            </Link>
          </nav>
          <Link href="/audit" className="btn-primary px-4 py-2 text-sm">
            Start Free Audit
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-24">
        {/* Page Header */}
        <div className="text-center mb-12">
          <p className="text-cyan-400 font-mono text-sm mb-4 tracking-wider">
            CONTACT
          </p>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide mb-4">
            GET IN TOUCH
          </h1>
          <p className="text-slate-400 text-lg">
            We typically respond within 24 hours.
          </p>
        </div>

        {/* Contact Form */}
        <ContactForm />
      </div>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="LinkMedic"
              width={120}
              height={28}
              className="h-7 w-auto"
            />
          </div>

          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <Link href="/contact" className="text-white">
              Contact
            </Link>
            <Link href="/intel" className="hover:text-white transition">
              Intel Blog
            </Link>
          </div>

          <div className="text-slate-500 text-sm">&copy; 2026 LinkMedic</div>
        </div>
      </footer>
    </div>
  );
}
