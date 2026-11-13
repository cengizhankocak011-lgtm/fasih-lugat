import type { PartOfSpeech } from '@/types';
import { POS_LABELS } from '@/lib/labels';

export type PosFilterValue = PartOfSpeech | 'all';

const POS_ORDER: PartOfSpeech[] = ['isim', 'fiil', 'sifat', 'zamir', 'harf', 'zarf'];

interface PosFilterProps {
  value: PosFilterValue;
  counts: Record<PartOfSpeech, number>;
  total: number;
  onChange: (value: PosFilterValue) => void;
}

export default function PosFilter({ value, counts, total, onChange }: PosFilterProps) {
  const options: { key: PosFilterValue; label: string; count: number }[] = [
    { key: 'all', label: 'Tümü', count: total },
    ...POS_ORDER.map((pos) => ({ key: pos, label: POS_LABELS[pos], count: counts[pos] })),
  ];

  return (
    <div role="group" aria-label="Kelime türüne göre filtrele" className="flex flex-wrap gap-2">
      {options
        .filter((option) => option.key === 'all' || option.count > 0)
        .map((option) => {
          const active = option.key === value;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-emerald-700 bg-emerald-700 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-ink-900'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-emerald-300 hover:text-emerald-800 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-200 dark:hover:border-emerald-500'
              }`}
            >
              {option.label}
              <span className={`text-xs tabular-nums ${active ? 'opacity-80' : 'text-ink-500 dark:text-ink-400'}`}>{option.count}</span>
            </button>
          );
        })}
    </div>
  );
}
