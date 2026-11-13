import { MessageSquarePlus } from 'lucide-react';
import FeedbackForm from '@/components/feedback/FeedbackForm';

export default function FeedbackSection() {
  return (
    <section className="card space-y-5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-300 text-ink-900">
          <MessageSquarePlus className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Sitemizi geliştirmemize yardım edin</h2>
          <p className="text-sm text-ink-600 dark:text-ink-300">Önerilerinizi ya da karşılaştığınız sorunları bize yazın.</p>
        </div>
      </div>
      <FeedbackForm />
    </section>
  );
}
