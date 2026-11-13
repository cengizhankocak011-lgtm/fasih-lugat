import { useState } from 'react';
import { Languages, Search, Star, Trash2 } from 'lucide-react';
import { POS_LABELS } from '@/lib/labels';
import { clearHistory, removeFavorite, storage } from '@/lib/storage';
import DictionaryLibrary from '@/components/library/DictionaryLibrary';
import type { FavoriteItem, HistoryItem, Intent, TranslateDirection } from '@/types';
import type { TabId } from '@/components/layout/BottomNav';

type Section = 'favorites' | 'history' | 'dictionary';

const timeFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

interface LibraryViewProps {
  onNavigate: (tab: TabId, intent: Intent) => void;
}

export default function LibraryView({ onNavigate }: LibraryViewProps) {
  const [section, setSection] = useState<Section>('favorites');
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => storage.getFavorites());
  const [history, setHistory] = useState<HistoryItem[]>(() => storage.getHistory());

  const handleRemoveFavorite = (entryId: string) => {
    removeFavorite(entryId);
    setFavorites(storage.getFavorites());
  };

  const handleClearHistory = () => {
    if (!window.confirm('Arama geçmişi tamamen silinsin mi?')) return;
    clearHistory();
    setHistory([]);
  };

  const openHistory = (item: HistoryItem) => {
    if (item.type === 'translate') {
      onNavigate('translate', {
        kind: 'translate',
        text: item.query,
        direction: (item.direction ?? 'ar-tr') as TranslateDirection,
      });
    } else {
      onNavigate('dictionary', { kind: 'word', query: item.query });
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Kaydedilenler</h1>
        <p className="text-sm text-ink-600 dark:text-ink-300">Favori kelimeleriniz, son işlemleriniz ve tüm sözlük burada.</p>
      </header>

      <div role="tablist" className="grid grid-cols-3 gap-1 rounded-2xl bg-cream-200/70 p-1 dark:bg-ink-900">
        {(
          [
            { id: 'favorites', label: `Favoriler (${favorites.length})` },
            { id: 'history', label: `Geçmiş (${history.length})` },
            { id: 'dictionary', label: 'Sözlük' },
          ] as { id: Section; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={section === t.id}
            onClick={() => setSection(t.id)}
            className={`h-11 rounded-xl text-sm font-semibold transition-all duration-200 ${
              section === t.id
                ? 'bg-white text-emerald-800 shadow-card dark:bg-ink-800 dark:text-gold-300'
                : 'text-ink-600 hover:text-emerald-700 dark:text-ink-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {section === 'dictionary' ? (
        <DictionaryLibrary />
      ) : section === 'favorites' ? (
        favorites.length === 0 ? (
          <EmptyState text="Henüz favori kelime eklemediniz. Sözlükte bir kelime açıp yıldız simgesine dokunun." />
        ) : (
          <ul className="space-y-3">
            {favorites.map((f) => (
              <li key={f.id} className="card flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={() => onNavigate('dictionary', { kind: 'entry', entryId: f.entryId })}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <p dir="rtl" className="truncate font-amiri text-2xl text-emerald-900 dark:text-emerald-100">{f.word}</p>
                    <p className="truncate text-sm text-ink-600 dark:text-ink-300">{f.meaning}</p>
                  </div>
                  <span className="chip-emerald shrink-0">{POS_LABELS[f.pos]}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveFavorite(f.entryId)}
                  aria-label="Favoriden çıkar"
                  className="btn-ghost h-10 w-10 shrink-0 rounded-full p-0 text-gold-500"
                >
                  <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )
      ) : history.length === 0 ? (
        <EmptyState text="Henüz bir arama ya da çeviri yapmadınız." />
      ) : (
        <div className="space-y-3">
          <ul className="space-y-3">
            {history.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => openHistory(h)}
                  className="card flex w-full items-center gap-3 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-ink-800 dark:text-emerald-300">
                    {h.type === 'translate' ? <Languages className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink-900 dark:text-ink-50" dir="auto">{h.query}</p>
                    {h.result && <p className="truncate text-sm text-ink-600 dark:text-ink-300" dir="auto">{h.result}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-ink-500 dark:text-ink-300">{timeFormatter.format(h.timestamp)}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={handleClearHistory} className="btn-ghost w-full text-sm text-red-600 dark:text-red-300">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Geçmişi temizle
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-sm text-ink-600 dark:text-ink-300">{text}</p>
    </div>
  );
}
