import { useMemo } from 'react';
import { CalendarDays, Languages } from 'lucide-react';
import SpeakButton from '@/components/ui/SpeakButton';
import WordReading from '@/components/ui/WordReading';
import { POS_LABELS } from '@/lib/labels';
import type { DictionaryEntry } from '@/types';

interface WordOfTheDayProps {
  entry: DictionaryEntry;
  onOpen: (entry: DictionaryEntry) => void;
}

export default function WordOfTheDay({ entry, onOpen }: WordOfTheDayProps) {
  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()),
    [],
  );
  const example = entry.examples[0];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 p-6 text-cream-50 shadow-card-lg sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-300/10 blur-2xl" />

      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-200">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Günün kelimesi
          </span>
          <span className="text-xs font-medium text-emerald-100/80">{dateLabel}</span>
        </div>

        <div className="space-y-3 text-center">
          <p dir="rtl" className="font-amiri text-5xl leading-relaxed text-white sm:text-6xl">
            {entry.word}
          </p>
          <WordReading word={entry.word} className="text-center text-emerald-100/90" />
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-full bg-gold-300/20 px-3 py-1 font-semibold text-gold-200">{POS_LABELS[entry.pos]}</span>
            {entry.root && (
              <span dir="rtl" className="font-amiri rounded-full bg-white/10 px-3 py-1 text-sm text-emerald-50">
                {entry.root}
              </span>
            )}
          </div>
          <p className="text-lg font-semibold text-white">{entry.meanings.slice(0, 3).join(', ')}</p>
        </div>

        {example && (
          <blockquote className="rounded-2xl bg-black/15 p-4 text-center">
            <p dir="rtl" className="font-amiri text-xl leading-loose text-emerald-50">
              {example.ayah}
            </p>
            <footer className="mt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-100/80">
              <Languages className="h-3.5 w-3.5" aria-hidden="true" />
              {example.reference}
            </footer>
          </blockquote>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <SpeakButton text={entry.word} label="Dinle" />
          <button type="button" onClick={() => onOpen(entry)} className="btn-gold h-10 px-4 text-sm">
            Sözlükte aç
          </button>
        </div>
      </div>
    </section>
  );
}
