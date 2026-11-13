import { useEffect } from 'react';
import { X } from 'lucide-react';
import FeedbackForm from '@/components/feedback/FeedbackForm';

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Öneri ve destek"
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-card-lg sm:rounded-3xl dark:bg-ink-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-emerald-100 px-5 py-4 dark:border-ink-800">
          <div className="space-y-1">
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Öneri ve destek</p>
            <p className="text-sm text-ink-500 dark:text-ink-300">Görüşleriniz uygulamayı birlikte geliştirmemize yardımcı olur.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="btn-ghost h-9 w-9 shrink-0 rounded-full p-0">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}
