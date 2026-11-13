import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { BAB_NAMES, conjugate, PERSONS, type ConjugationTable, type PersonKey } from '@/lib/conjugation';
import type { VerbConjugationSeed } from '@/types';

type TenseKey = keyof ConjugationTable['tense'];

const TENSES: { key: TenseKey; label: string }[] = [
  { key: 'mazi', label: 'Mazi' },
  { key: 'muzari', label: 'Muzari' },
  { key: 'maziPassive', label: 'Mazi meçhul' },
  { key: 'muzariPassive', label: 'Muzari meçhul' },
  { key: 'imperative', label: 'Emir' },
];

interface ConjugationModalProps {
  verb: VerbConjugationSeed;
  onClose: () => void;
}

export default function ConjugationModal({ verb, onClose }: ConjugationModalProps) {
  const table = useMemo(() => conjugate(verb), [verb]);
  const [tense, setTense] = useState<TenseKey>('mazi');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const forms: Partial<Record<PersonKey, string>> = table.tense[tense];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tam fiil çekimi"
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-card-lg sm:rounded-3xl dark:bg-ink-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-emerald-100 px-5 py-4 dark:border-ink-800">
          <div className="space-y-1">
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Tam fiil çekimi</p>
            <p className="text-sm text-ink-500 dark:text-ink-300">{BAB_NAMES[verb.bab]}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="btn-ghost h-9 w-9 shrink-0 rounded-full p-0">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div role="tablist" aria-label="Zaman seçimi" className="no-scrollbar flex gap-2 overflow-x-auto border-b border-emerald-100 px-4 py-3 dark:border-ink-800">
          {TENSES.map((t) => {
            const active = t.key === tense;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTense(t.key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gold-300 text-ink-900 shadow-sm'
                    : 'bg-cream-100 text-ink-700 hover:bg-emerald-50 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 bg-cream-100 text-xs uppercase tracking-wider text-ink-500 dark:bg-ink-800 dark:text-ink-300">
              <tr>
                <th className="px-5 py-3 font-semibold">Zamir</th>
                <th className="px-5 py-3 font-semibold">Kişi</th>
                <th className="px-5 py-3 text-right font-semibold">Çekim</th>
              </tr>
            </thead>
            <tbody>
              {PERSONS.map((p) => {
                const form = forms[p.key];
                return (
                  <tr key={p.key} className="border-t border-emerald-50 transition-colors hover:bg-emerald-50/60 dark:border-ink-800 dark:hover:bg-ink-800/60">
                    <td dir="rtl" className="px-5 py-3 font-amiri text-lg text-ink-700 dark:text-ink-200">{p.arabic}</td>
                    <td className="px-5 py-3 text-sm text-ink-700 dark:text-ink-200">{p.label}</td>
                    <td dir="rtl" className="px-5 py-3 text-right font-quran text-2xl text-emerald-900 dark:text-emerald-100">
                      {form ?? <span className="text-ink-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
