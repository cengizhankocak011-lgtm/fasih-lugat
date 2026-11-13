import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import WordDetailModal from '@/components/library/WordDetailModal';
import { POS_LABELS } from '@/lib/labels';
import { fetchLibraryItems, type LibraryItem } from '@/lib/libraryIndex';
import { sortLibraryItems, type LibrarySort } from '@/lib/librarySort';

const PAGE_SIZE = 24;

const SORT_OPTIONS: { value: LibrarySort; label: string }[] = [
  { value: 'arabic', label: 'Arap alfabesi' },
  { value: 'turkish', label: 'Türkçe anlam' },
];

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: LibraryItem[] };

export default function DictionaryLibrary() {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [sort, setSort] = useState<LibrarySort>('arabic');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<LibraryItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLibraryItems()
      .then((items) => {
        if (!cancelled) setLoad({ status: 'ready', items });
      })
      .catch(() => {
        if (!cancelled) setLoad({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const sorted = useMemo(
    () => (load.status === 'ready' ? sortLibraryItems(load.items, sort) : []),
    [load, sort],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectSort = (next: LibrarySort) => {
    setSort(next);
    setPage(1);
  };

  const retry = () => {
    setLoad({ status: 'loading' });
    setAttempt((n) => n + 1);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-title">Tüm kelimeler</h2>
        {load.status === 'ready' && (
          <span className="text-xs font-medium text-ink-500 dark:text-ink-300" aria-live="polite">
            {sorted.length} kelime
          </span>
        )}
      </div>

      <div role="group" aria-label="Sıralama" className="grid grid-cols-2 gap-1 rounded-2xl bg-cream-200/70 p-1 dark:bg-ink-900">
        {SORT_OPTIONS.map((option) => {
          const active = sort === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => selectSort(option.value)}
              className={`h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-white text-emerald-800 shadow-card dark:bg-ink-800 dark:text-gold-300'
                  : 'text-ink-600 hover:text-emerald-700 dark:text-ink-300'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {load.status === 'loading' && (
        <div className="card flex items-center justify-center gap-2 p-10 text-sm text-ink-600 dark:text-ink-300">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Kelimeler yükleniyor...
        </div>
      )}

      {load.status === 'error' && (
        <div role="alert" className="card flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-ink-600 dark:text-ink-300">Kelimeler yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.</p>
          <button type="button" onClick={retry} className="btn-outline h-10 px-5 text-sm">
            Tekrar dene
          </button>
        </div>
      )}

      {load.status === 'ready' && (
        <>
          <ul className="grid grid-cols-2 gap-3">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="card flex h-full w-full flex-col items-start gap-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg"
                >
                  <span dir="rtl" className="font-amiri text-2xl text-emerald-900 dark:text-emerald-100">{item.word}</span>
                  <span className="line-clamp-1 w-full text-sm text-ink-600 dark:text-ink-300">{item.meaning}</span>
                  <span className="chip-emerald">{POS_LABELS[item.pos]}</span>
                </button>
              </li>
            ))}
          </ul>

          {pageCount > 1 && (
            <nav aria-label="Sayfalar" className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-outline h-10 px-4 text-sm"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Önceki
              </button>
              <span className="text-sm font-medium text-ink-600 dark:text-ink-300">
                Sayfa {currentPage} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="btn-outline h-10 px-4 text-sm"
              >
                Sonraki
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}

      {selected && <WordDetailModal item={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
