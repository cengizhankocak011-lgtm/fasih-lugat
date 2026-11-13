import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { submitFeedback, type FeedbackKind } from '@/lib/feedback';

const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;
const MAX_CONTACT = 120;

const KIND_OPTIONS: { value: FeedbackKind; label: string; hint: string }[] = [
  { value: 'oneri', label: 'Öneri', hint: 'Yeni bir özellik ya da iyileştirme fikriniz var mı?' },
  { value: 'destek', label: 'Destek', hint: 'Bir sorunla mı karşılaştınız? Ayrıntıları yazın.' },
];

export default function FeedbackForm() {
  const [kind, setKind] = useState<FeedbackKind>('oneri');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const trimmedLength = message.trim().length;
  const canSubmit = trimmedLength >= MIN_LENGTH && status !== 'sending';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('sending');
    setError(null);
    try {
      await submitFeedback({ kind, message, contact });
      setStatus('sent');
      setMessage('');
      setContact('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Mesajınız gönderilemedi.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden="true" />
        <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Teşekkür ederiz!</p>
        <p className="text-sm text-ink-600 dark:text-ink-300">Mesajınız bize ulaştı. Değerlendireceğiz.</p>
        <button type="button" onClick={() => setStatus('idle')} className="btn-outline mt-2 h-10 px-5 text-sm">
          Yeni mesaj gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div role="radiogroup" aria-label="Mesaj türü" className="grid grid-cols-2 gap-2 rounded-2xl bg-cream-200/70 p-1 dark:bg-ink-800">
        {KIND_OPTIONS.map((option) => {
          const active = option.value === kind;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setKind(option.value)}
              className={`h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-emerald-800 text-white shadow-card dark:bg-gold-300 dark:text-ink-900'
                  : 'text-ink-700 hover:text-emerald-800 dark:text-ink-200'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-ink-500 dark:text-ink-300">{KIND_OPTIONS.find((o) => o.value === kind)?.hint}</p>

      <div className="space-y-2">
        <label htmlFor="feedback-message" className="text-sm font-semibold text-ink-800 dark:text-ink-100">
          Mesajınız
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={5}
          placeholder="En az 10 karakter yazın..."
          className="input-field min-h-32 resize-none leading-relaxed"
        />
        <div className="flex justify-between text-xs text-ink-500 dark:text-ink-300">
          <span>{trimmedLength < MIN_LENGTH ? `En az ${MIN_LENGTH} karakter gerekli` : ''}</span>
          <span>
            {message.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="feedback-contact" className="text-sm font-semibold text-ink-800 dark:text-ink-100">
          İletişim <span className="font-normal text-ink-500 dark:text-ink-300">(isteğe bağlı)</span>
        </label>
        <input
          id="feedback-contact"
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={MAX_CONTACT}
          placeholder="E-posta adresiniz"
          autoComplete="email"
          className="input-field h-12"
        />
      </div>

      {status === 'error' && error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={!canSubmit} className="btn-primary h-12 w-full text-base">
        {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {status === 'sending' ? 'Gönderiliyor...' : 'Gönder'}
      </button>
    </form>
  );
}
