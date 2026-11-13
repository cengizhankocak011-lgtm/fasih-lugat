import { useState } from 'react';
import { BookOpenCheck } from 'lucide-react';
import ConjugationModal from '@/components/dictionary/ConjugationModal';
import { BAB_NAMES } from '@/lib/conjugation';
import type { VerbConjugationSeed } from '@/types';

interface VerbSectionProps {
  verb: VerbConjugationSeed;
}

export default function VerbSection({ verb }: VerbSectionProps) {
  const [open, setOpen] = useState(false);

  const forms: { label: string; value: string }[] = [
    { label: 'Mazi', value: verb.mazi },
    { label: 'Muzari', value: verb.muzari },
    { label: 'Emir', value: verb.amar },
    { label: 'Masdar', value: verb.masdar },
    { label: 'İsm-i fail', value: verb.ismiFaail },
    { label: 'İsm-i mef\u2019ul', value: verb.ismiMefaul },
    { label: 'Mazi meçhul', value: verb.passiveMazi },
    { label: 'Muzari meçhul', value: verb.passiveMuzari },
  ].filter((f) => f.value);

  return (
    <section className="card space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-title">Fiil bilgisi</h3>
        <span className="chip-gold">Bab {BAB_NAMES[verb.bab]}</span>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {forms.map((f) => (
          <div key={f.label} className="rounded-xl bg-cream-100 p-3 dark:bg-ink-800/60">
            <dt className="text-xs font-medium text-ink-500 dark:text-ink-300">{f.label}</dt>
            <dd dir="rtl" className="mt-1 font-amiri text-xl text-emerald-900 dark:text-emerald-100">{f.value}</dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary h-12 w-full">
        <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
        Tam çekim tablosunu aç
      </button>
      {open && <ConjugationModal verb={verb} onClose={() => setOpen(false)} />}
    </section>
  );
}
