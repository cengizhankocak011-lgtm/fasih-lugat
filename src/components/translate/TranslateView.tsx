import { useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Check, Copy, Keyboard, Languages, X } from 'lucide-react';
import ArabicKeyboard from '@/components/dictionary/ArabicKeyboard';
import SpeakButton from '@/components/ui/SpeakButton';
import { useArabicInput } from '@/hooks/useArabicInput';
import { translateText } from '@/lib/translate';
import { addHistory } from '@/lib/storage';
import type { Intent, TranslateDirection } from '@/types';

const LANG_NAMES: Record<TranslateDirection, { source: string; target: string; sourceLang: 'ar-SA' | 'tr-TR'; targetLang: 'ar-SA' | 'tr-TR' }> = {
  'ar-tr': { source: 'Arapça', target: 'Türkçe', sourceLang: 'ar-SA', targetLang: 'tr-TR' },
  'tr-ar': { source: 'Türkçe', target: 'Arapça', sourceLang: 'tr-TR', targetLang: 'ar-SA' },
};

const SOURCE_LABELS = {
  ai: 'Yapay zeka',
  web: 'Çevrimiçi çeviri',
  offline: 'Hazır kalıp',
} as const;

type Status = 'idle' | 'loading' | 'error';

interface TranslateViewProps {
  intent: Intent | null;
}

export default function TranslateView({ intent }: TranslateViewProps) {
  const [direction, setDirection] = useState<TranslateDirection>('ar-tr');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<keyof typeof SOURCE_LABELS | null>(null);
  const [correction, setCorrection] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const requestRef = useRef(0);
  const { ref: textareaRef, insertText, deleteBackward } = useArabicInput<HTMLTextAreaElement>(input, setInput);

  useEffect(() => {
    if (!intent || intent.kind !== 'translate') return;
    setDirection(intent.direction);
    setInput(intent.text);
  }, [intent]);

  useEffect(() => {
    const text = input.trim();
    setCorrection(null);
    if (!text) {
      requestRef.current += 1;
      setOutput('');
      setStatus('idle');
      setError(null);
      setSource(null);
      return;
    }

    setStatus('loading');
    const timer = window.setTimeout(async () => {
      const requestId = ++requestRef.current;
      try {
        const result = await translateText(text, direction);
        if (requestId !== requestRef.current) return;
        setOutput(result.text);
        setSource(result.source);
        setCorrection(result.correction ?? null);
        setStatus('idle');
        setError(null);
        addHistory({ query: text, type: 'translate', direction, result: result.text });
      } catch (err) {
        if (requestId !== requestRef.current) return;
        setOutput('');
        setSource(null);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Çeviri yapılamadı.');
      }
    }, 700);

    return () => window.clearTimeout(timer);
  }, [input, direction]);

  const names = LANG_NAMES[direction];
  const sourceIsArabic = direction === 'ar-tr';
  const showKeyboard = sourceIsArabic && keyboardOpen;

  const swap = () => {
    if (output) setInput(output);
    setDirection((d) => (d === 'ar-tr' ? 'tr-ar' : 'ar-tr'));
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Metin panoya kopyalanamadı.');
    }
  };

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Çeviri</h1>
        <p className="text-sm text-ink-600 dark:text-ink-300">Arapça ve Türkçe metinleri anında çevirin.</p>
      </header>

      <section className="card space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="chip-emerald">
            <Languages className="h-3.5 w-3.5" aria-hidden="true" />
            {names.source}
          </span>
          <div className="flex items-center gap-1">
            {sourceIsArabic && (
              <button
                type="button"
                onClick={() => setKeyboardOpen((open) => !open)}
                aria-expanded={showKeyboard}
                aria-label="Arapça sanal klavyeyi aç veya kapat"
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  showKeyboard
                    ? 'bg-gold-300 text-ink-900'
                    : 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-ink-800'
                }`}
              >
                <Keyboard className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <SpeakButton text={input} lang={names.sourceLang} label="Dinle" />
            <button
              type="button"
              onClick={() => setInput('')}
              disabled={!input}
              aria-label="Metni temizle"
              className="btn-ghost h-10 w-10 rounded-full p-0"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          dir={sourceIsArabic ? 'rtl' : 'ltr'}
          rows={4}
          maxLength={2000}
          placeholder={sourceIsArabic ? 'Arapça metni buraya yazın...' : 'Türkçe metni buraya yazın...'}
          aria-label={`${names.source} metin`}
          className={`input-field min-h-32 resize-none text-lg leading-relaxed ${sourceIsArabic ? 'font-arabic' : ''}`}
        />
        {correction && status === 'idle' && (
          <div aria-live="polite" className="flex flex-wrap items-center gap-2 rounded-2xl bg-gold-300/20 px-3 py-2 text-sm text-ink-800 dark:text-ink-100">
            <span>Bunu mu kastettiniz:</span>
            <button
              type="button"
              onClick={() => setInput(correction)}
              dir={sourceIsArabic ? 'rtl' : 'ltr'}
              className={`rounded-full bg-white px-3 py-1 font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50 dark:bg-ink-800 dark:text-gold-300 dark:hover:bg-ink-700 ${sourceIsArabic ? 'font-arabic' : ''}`}
            >
              {correction}
            </button>
          </div>
        )}
        {showKeyboard && <ArabicKeyboard onInsert={insertText} onDelete={deleteBackward} />}
      </section>

      <div className="relative flex justify-center">
        <button
          type="button"
          onClick={swap}
          aria-label="Dilleri değiştir"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-300 text-ink-900 shadow-card-lg transition-transform duration-300 hover:rotate-180 active:scale-95"
        >
          <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <section className="card space-y-3 bg-emerald-50/70 p-4 sm:p-5 dark:bg-ink-900">
        <div className="flex items-center justify-between gap-3">
          <span className="chip-gold">{names.target}</span>
          <div className="flex items-center gap-1">
            <SpeakButton text={output} lang={names.targetLang} label="Dinle" />
            <button
              type="button"
              onClick={copyOutput}
              disabled={!output}
              aria-label="Çeviriyi kopyala"
              className="btn-ghost h-10 w-10 rounded-full p-0"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div
          aria-live="polite"
          dir={sourceIsArabic ? 'ltr' : 'rtl'}
          className={`min-h-32 whitespace-pre-wrap text-lg leading-relaxed text-ink-900 dark:text-ink-50 ${sourceIsArabic ? '' : 'font-arabic'}`}
        >
          {status === 'loading' && <span className="text-ink-400">Çevriliyor...</span>}
          {status === 'idle' && output}
          {status === 'error' && <span role="alert" className="text-base text-red-600 dark:text-red-300">{error}</span>}
          {status === 'idle' && !output && !input.trim() && (
            <span className="text-base text-ink-400">Çeviri burada görünecek.</span>
          )}
        </div>
        {source && status === 'idle' && (
          <p className="text-xs text-ink-500 dark:text-ink-300">Kaynak: {SOURCE_LABELS[source]}</p>
        )}
      </section>
    </div>
  );
}
