'use client';

import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackModal } from './feedback-modal';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-slate-800 border border-white/10 rounded-full shadow-lg hover:bg-slate-700 transition-colors group z-40"
        title="Send Feedback"
      >
        <MessageSquarePlus className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
