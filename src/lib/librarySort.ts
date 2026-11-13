import type { LibraryItem } from '@/lib/libraryIndex';
import { normalizeArabic } from '@/lib/search';

export type LibrarySort = 'arabic' | 'turkish';

const ARABIC_ALPHABET = 'ءابتثجحخدذرزسشصضطظعغفقكلمنهوي';
const ARABIC_RANK = new Map([...ARABIC_ALPHABET].map((ch, i) => [ch, i + 1]));
const UNKNOWN_RANK = 1000;
const turkishCollator = new Intl.Collator('tr', { sensitivity: 'base' });

function arabicKey(wordPlain: string): number[] {
  const folded = normalizeArabic(wordPlain)
    .replace(/\s+/g, '')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A');
  let letters = [...folded];
  if (letters.length > 3 && letters[0] === '\u0627' && letters[1] === '\u0644') letters = letters.slice(2);
  return letters.map((ch) => ARABIC_RANK.get(ch) ?? UNKNOWN_RANK);
}

function compareKeys(a: number[], b: number[]): number {
  const shared = Math.min(a.length, b.length);
  for (let i = 0; i < shared; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

export function sortLibraryItems(items: LibraryItem[], sort: LibrarySort): LibraryItem[] {
  const keyed = items.map((item) => ({ item, key: arabicKey(item.wordPlain) }));
  if (sort === 'arabic') {
    return keyed.sort((a, b) => compareKeys(a.key, b.key)).map(({ item }) => item);
  }
  return keyed
    .sort((a, b) => turkishCollator.compare(a.item.meaning, b.item.meaning) || compareKeys(a.key, b.key))
    .map(({ item }) => item);
}
