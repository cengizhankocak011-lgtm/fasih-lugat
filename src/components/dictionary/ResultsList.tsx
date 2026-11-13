import WordReading from '@/components/ui/WordReading';
import type { SearchResult } from '@/lib/search';
import { POS_LABELS } from '@/lib/labels';
import type { DictionaryEntry } from '@/types';

const MATCH_LABELS: Record<SearchResult['matchType'], string> = {
  'exact-word': 'Kelime',
  root: 'Kök',
  meaning: 'Anlam',
  synonym: 'Eş anlamlı',
  plural: 'Çoğul',
  particle: 'Harf-i cer',
  fuzzy: 'Benzer yazım',
};

const SHOW_MATCHED_TEXT: SearchResult['matchType'][] = ['root', 'synonym', 'plural', 'particle', 'fuzzy'];

interface ResultsListProps {
  results: SearchResult[];
  selectedId: string | null;
  onSelect: (entry: DictionaryEntry) => void;
}

export default function ResultsList({ results, selectedId, onSelect }: ResultsListProps) {
  return (
    <ul className="space-y-3">
      {results.map(({ entry, matchType, matchedText }) => {
        const active = entry.id === selectedId;
        return (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onSelect(entry)}
              aria-current={active ? 'true' : undefined}
              className={`card group flex w-full items-center gap-4 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg ${
                active ? 'ring-2 ring-gold-400' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <p dir="rtl" className="truncate font-amiri text-2xl text-emerald-900 dark:text-emerald-100">
                  {entry.word}
                </p>
                <WordReading word={entry.word} className="truncate text-emerald-700 dark:text-emerald-300" />
                <p className="mt-1 truncate text-sm text-ink-600 dark:text-ink-300">
                  {entry.meanings.slice(0, 3).join(', ')}
                </p>
                {SHOW_MATCHED_TEXT.includes(matchType) && matchedText && (
                  <p className="mt-1 truncate text-xs text-emerald-700 dark:text-emerald-300">
                    {MATCH_LABELS[matchType]}: <span dir="auto" className="font-medium">{matchedText}</span>
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="chip-emerald">{POS_LABELS[entry.pos]}</span>
                <span className="chip-ink">{MATCH_LABELS[matchType]}</span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
