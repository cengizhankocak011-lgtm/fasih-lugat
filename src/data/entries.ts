import { dictionary as embeddedDictionary } from '@/data/dictionary';
import { quranWords } from '@/data/quranWords';
import type { DictionaryEntry } from '@/types';

export const allEntries: DictionaryEntry[] = [
  ...embeddedDictionary,
  ...quranWords.filter((q) => !embeddedDictionary.some((e) => e.wordPlain === q.wordPlain)),
];
