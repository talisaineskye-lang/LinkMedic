'use client';

import { useState } from 'react';
import { X, MessageSquare, Bug, Lightbulb, Send, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          page: window.location.pathname,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setMessage('');
          setType('general');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Send Feedback</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-lg font-medium text-white">Thanks for your feedback!</p>
            <p className="text-slate-400 text-sm mt-1">We&apos;ll review it soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What&apos;s this about?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value as typeof type)}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all
                      ${type === option.value
                        ? option.color
                        : 'border-white/10 text-slate-400 hover:border-white/20'
                      }
                    `}
                  >
                    <option.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tell us more
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? "What happened? What did you expect to happen?"
                    : type === 'feature'
                    ? "What would you like to see added?"
                    : "What's on your mind?"
                }
                rows={4}
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
