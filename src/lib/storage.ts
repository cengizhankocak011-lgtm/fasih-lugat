import type { AppSettings, FavoriteItem, HistoryItem } from '@/types';

const KEYS = {
  favorites: 'fasihlugat.favorites',
  history: 'fasihlugat.history',
  settings: 'fasihlugat.settings',
} as const;

const DEFAULT_SETTINGS: AppSettings = { theme: 'light' };
const MAX_HISTORY = 60;

function safeGet(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable */
  }
}

function readList<T>(key: string): T[] {
  const value = safeGet(key);
  return Array.isArray(value) ? (value as T[]) : [];
}

export const storage = {
  getFavorites: (): FavoriteItem[] => readList<FavoriteItem>(KEYS.favorites),
  setFavorites: (items: FavoriteItem[]): void => safeSet(KEYS.favorites, items),
  getHistory: (): HistoryItem[] => readList<HistoryItem>(KEYS.history),
  setHistory: (items: HistoryItem[]): void => safeSet(KEYS.history, items),
  getSettings(): AppSettings {
    const stored = safeGet(KEYS.settings);
    return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === 'object' ? stored : {}) };
  },
  setSettings: (settings: AppSettings): void => safeSet(KEYS.settings, settings),
};

export function addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): void {
  const kept = storage
    .getHistory()
    .filter((h) => !(h.type === item.type && h.query === item.query && h.direction === item.direction));
  const next: HistoryItem[] = [
    { ...item, id: crypto.randomUUID(), timestamp: Date.now() },
    ...kept,
  ].slice(0, MAX_HISTORY);
  storage.setHistory(next);
}

export function clearHistory(): void {
  storage.setHistory([]);
}

export function isFavorite(entryId: string): boolean {
  return storage.getFavorites().some((f) => f.entryId === entryId);
}

export function toggleFavorite(entry: {
  id: string;
  word: string;
  meaning: string;
  pos: FavoriteItem['pos'];
}): boolean {
  const items = storage.getFavorites();
  if (items.some((f) => f.entryId === entry.id)) {
    storage.setFavorites(items.filter((f) => f.entryId !== entry.id));
    return false;
  }
  storage.setFavorites([
    {
      id: crypto.randomUUID(),
      entryId: entry.id,
      word: entry.word,
      meaning: entry.meaning,
      pos: entry.pos,
      addedAt: Date.now(),
    },
    ...items,
  ]);
  return true;
}

export function removeFavorite(entryId: string): void {
  storage.setFavorites(storage.getFavorites().filter((f) => f.entryId !== entryId));
}
