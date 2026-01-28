"use client";

import { useState } from "react";
import {
  LifeBuoy,
  CreditCard,
  Handshake,
  Mail,
  Send,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

type Category = "support" | "billing" | "partnerships" | "general" | null;

const categories = [
  {
    id: "support" as const,
    label: "Support",
    description: "Bugs, technical issues, how-to questions",
    icon: LifeBuoy,
    color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30 hover:border-cyan-400/50",
    subjectPlaceholder: "Help with...",
  },
  {
    id: "billing" as const,
    label: "Billing",
    description: "Payments, subscriptions, refunds, invoices",
    icon: CreditCard,
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 hover:border-emerald-400/50",
    subjectPlaceholder: "Question about my subscription...",
  },
  {
    id: "partnerships" as const,
    label: "Partnerships",
    description: "Integrations, affiliates, collaborations",
    icon: Handshake,
    color: "text-amber-400 bg-amber-400/10 border-amber-400/30 hover:border-amber-400/50",
    subjectPlaceholder: "Partnership opportunity...",
  },
  {
    id: "general" as const,
    label: "General",
    description: "Feedback, press, everything else",
    icon: Mail,
    color: "text-slate-400 bg-slate-400/10 border-slate-400/30 hover:border-slate-400/50",
    subjectPlaceholder: "I wanted to reach out about...",
  },
];

export function ContactForm() {
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !email || !subject || !message) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          category: selectedCategory,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setEmail("");
    setSubject("");
    setMessage("");
    setSubmitted(false);
    setError(null);
  };

  // Success state
  if (submitted) {
    return (
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
        <p className="text-slate-400 mb-8">
          We&apos;ll get back to you at{" "}
          <span className="text-white">{email}</span> within 24 hours.
        </p>
        <button
          onClick={resetForm}
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  // Category selection
  if (!selectedCategory) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`
              flex flex-col items-center text-center p-6 rounded-xl border transition-all
              bg-slate-900/50 hover:bg-slate-900
              ${category.color}
            `}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${category.color
                .split(" ")
                .slice(1, 3)
                .join(" ")}`}
            >
              <category.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white mb-1">{category.label}</h3>
            <p className="text-sm text-slate-400">{category.description}</p>
          </button>
        ))}
      </div>
    );
  }

  // Contact form
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 sm:p-8">
      {/* Back button */}
      <button
        onClick={() => setSelectedCategory(null)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to categories</span>
      </button>

      {/* Selected category indicator */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 ${selectedCategoryData?.color
          .split(" ")
          .slice(0, 3)
          .join(" ")}`}
      >
        {selectedCategoryData && (
          <selectedCategoryData.icon className="w-4 h-4" />
        )}
        {selectedCategoryData?.label}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Your Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Subject */}
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={selectedCategoryData?.subjectPlaceholder}
            required
            maxLength={200}
            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more..."
            required
            rows={6}
            maxLength={5000}
            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          />
          <p className="text-xs text-slate-500 mt-1 text-right">
            {message.length}/5000
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !email || !subject || !message}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
