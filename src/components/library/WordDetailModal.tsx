import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import WordCard from '@/components/dictionary/WordCard';
import { fetchSavedWord } from '@/lib/generatedWords';
import type { LibraryItem } from '@/lib/libraryIndex';
import type { DictionaryEntry } from '@/types';

interface WordDetailModalProps {
  item: LibraryItem;
  onClose: () => void;
}

export default function WordDetailModal({ item, onClose }: WordDetailModalProps) {
  const [entry, setEntry] = useState<DictionaryEntry | null>(item.entry);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (item.entry || !item.queryKey) return;
    let cancelled = false;
    fetchSavedWord(item.queryKey)
      .then((loaded) => {
        if (!cancelled) setEntry(loaded);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [item]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.wordPlain}
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-cream-50 p-4 shadow-card-lg sm:rounded-3xl sm:p-6 dark:bg-ink-950"
      >
        {entry ? (
          <WordCard entry={entry} onBack={onClose} />
        ) : failed ? (
          <p role="alert" className="card p-6 text-center text-sm text-red-600 dark:text-red-300">
            Kart yüklenemedi. Lütfen tekrar deneyin.
          </p>
        ) : (
          <div className="card flex items-center justify-center gap-2 p-10 text-sm text-ink-600 dark:text-ink-300">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Kart yükleniyor...
          </div>
        )}
      </div>
    </div>
  );
}
