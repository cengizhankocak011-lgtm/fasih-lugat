import { useMemo, useState } from 'react';
import { POS_LABELS } from '@/lib/labels';
import type { DictionaryEntry, PartOfSpeech } from '@/types';

const POS_FILTERS: PartOfSpeech[] = ['fiil', 'isim', 'sifat', 'zarf', 'harf', 'zamir'];
const PAGE_SIZE = 24;

interface BrowseListProps {
  entries: DictionaryEntry[];
  onPickEntry: (entry: DictionaryEntry) => void;
}

export default function BrowseList({ entries, onPickEntry }: BrowseListProps) {
  const [pos, setPos] = useState<PartOfSpeech | 'all'>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => (pos === 'all' ? entries : entries.filter((e) => e.pos === pos)),
    [entries, pos],
  );
  const visible = filtered.slice(0, limit);
  const remaining = filtered.length - visible.length;

  const selectPos = (next: PartOfSpeech | 'all') => {
    setPos(next);
    setLimit(PAGE_SIZE);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-title">Kelimelere göz atın</h2>
        <span className="text-xs font-medium text-ink-500 dark:text-ink-300">{filtered.length} kelime</span>
      </div>

      <div role="group" aria-label="Sözcük türü" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(['all', ...POS_FILTERS] as const).map((filter) => {
          const active = pos === filter;
          return (
            <button
              key={filter}
              type="button"
              aria-pressed={active}
              onClick={() => selectPos(filter)}
              className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-emerald-800 text-white shadow-card dark:bg-gold-300 dark:text-ink-900'
                  : 'bg-cream-200/70 text-ink-700 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700'
              }`}
            >
              {filter === 'all' ? 'Tümü' : POS_LABELS[filter]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visible.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => onPickEntry(e)}
            className="card flex items-center justify-between gap-3 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg"
          >
            <span dir="rtl" className="font-amiri text-2xl text-emerald-900 dark:text-emerald-100">{e.word}</span>
            <span className="truncate text-xs text-ink-500 dark:text-ink-300">{e.meanings[0]}</span>
          </button>
        ))}
      </div>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + PAGE_SIZE)}
          className="btn-outline w-full text-sm"
        >
          Daha fazla göster ({remaining} kelime)
        </button>
      )}
    </section>
  );
}
