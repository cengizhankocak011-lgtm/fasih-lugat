import type { DictionaryEntry } from '@/types';

function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getWordOfTheDay(pool: DictionaryEntry[], date: Date): DictionaryEntry | null {
  if (pool.length === 0) return null;
  return pool[hashString(localDayKey(date)) % pool.length];
}
