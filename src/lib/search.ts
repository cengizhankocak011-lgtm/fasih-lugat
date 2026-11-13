import type { DictionaryEntry } from '@/types';

const TASHKEEL_REGEX = /[\u0618-\u061A\u064B-\u0652\u0670\u0640]/g;
const TOKEN_SPLIT_REGEX = /[\s,;.()]+/;

export function stripTashkeel(s: string): string {
  return s.replace(TASHKEEL_REGEX, '');
}

export function normalizeArabic(s: string): string {
  return stripTashkeel(s)
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .trim();
}

export function normalizeTurkish(s: string): string {
  return s
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .trim();
}

export type MatchType = 'exact-word' | 'root' | 'meaning' | 'synonym' | 'plural' | 'particle' | 'fuzzy';

export interface SearchResult {
  entry: DictionaryEntry;
  score: number;
  matchType: MatchType;
  matchedText: string;
}

interface Term {
  raw: string;
  norm: string;
}

interface IndexedEntry {
  entry: DictionaryEntry;
  wordNorm: string;
  rootNorm: string;
  pluralNorm: string;
  synonyms: Term[];
  particles: Term[];
  meanings: Term[];
  meaningTokens: Term[];
  tags: Term[];
}

interface Match {
  score: number;
  matchType: MatchType;
  matchedText: string;
}

const indexCache = new WeakMap<DictionaryEntry[], IndexedEntry[]>();

function toTerm(raw: string, normalize: (s: string) => string): Term {
  return { raw, norm: normalize(raw) };
}

function buildIndex(entries: DictionaryEntry[]): IndexedEntry[] {
  return entries.map((entry) => ({
    entry,
    wordNorm: normalizeArabic(entry.wordPlain),
    rootNorm: normalizeArabic(entry.root.replace(/\s/g, '')),
    pluralNorm: entry.plural ? normalizeArabic(entry.plural) : '',
    synonyms: (entry.synonyms ?? []).map((s) => toTerm(s, normalizeArabic)),
    particles: (entry.particles ?? []).map((p) => toTerm(p.harf, normalizeArabic)),
    meanings: entry.meanings.map((m) => toTerm(m, normalizeTurkish)),
    meaningTokens: entry.meanings
      .flatMap((m) => m.split(TOKEN_SPLIT_REGEX))
      .filter(Boolean)
      .map((t) => toTerm(t, normalizeTurkish)),
    tags: (entry.tags ?? []).map((t) => toTerm(t, normalizeTurkish)),
  }));
}

function getIndex(entries: DictionaryEntry[]): IndexedEntry[] {
  let index = indexCache.get(entries);
  if (!index) {
    index = buildIndex(entries);
    indexCache.set(entries, index);
  }
  return index;
}

function matchArabic(item: IndexedEntry, q: string): Match | null {
  const { entry } = item;
  if (item.wordNorm === q) return { score: 100, matchType: 'exact-word', matchedText: entry.word };
  if (item.wordNorm.startsWith(q)) return { score: 80, matchType: 'exact-word', matchedText: entry.word };
  if (item.wordNorm.includes(q)) return { score: 60, matchType: 'exact-word', matchedText: entry.word };
  if (item.rootNorm === q) return { score: 70, matchType: 'root', matchedText: entry.root };
  if (item.rootNorm.includes(q)) return { score: 40, matchType: 'root', matchedText: entry.root };
  if (item.pluralNorm && item.pluralNorm === q) return { score: 75, matchType: 'plural', matchedText: entry.plural ?? '' };
  const synonym = item.synonyms.find((s) => s.norm === q || s.norm.includes(q));
  if (synonym) return { score: 50, matchType: 'synonym', matchedText: synonym.raw };
  const particle = item.particles.find((p) => p.norm === q);
  if (particle) return { score: 55, matchType: 'particle', matchedText: particle.raw };
  return null;
}

function matchTurkish(item: IndexedEntry, q: string): Match | null {
  const exactMeaning = item.meanings.find((m) => m.norm === q);
  if (exactMeaning) return { score: 90, matchType: 'meaning', matchedText: exactMeaning.raw };
  const partialMeaning = item.meanings.find((m) => m.norm.includes(q));
  if (partialMeaning) return { score: 65, matchType: 'meaning', matchedText: partialMeaning.raw };
  const tag = item.tags.find((t) => t.norm === q);
  if (tag) return { score: 30, matchType: 'meaning', matchedText: tag.raw };
  return null;
}

function maxTypos(q: string): number {
  if (q.length >= 7) return 2;
  if (q.length >= 4) return 1;
  return 0;
}

function editDistance(a: string, b: string, maxDistance: number): number | null {
  if (Math.abs(a.length - b.length) > maxDistance) return null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > maxDistance) return null;
    prev = curr;
  }
  return prev[b.length] <= maxDistance ? prev[b.length] : null;
}

function matchTypo(item: IndexedEntry, q: string, isArabic: boolean): Match | null {
  const maxDistance = maxTypos(q);
  if (maxDistance === 0) return null;
  if (isArabic) {
    const distance = editDistance(item.wordNorm, q, maxDistance);
    return distance === null ? null : { score: 20 - distance, matchType: 'fuzzy', matchedText: item.entry.word };
  }
  let best: Match | null = null;
  for (const token of item.meaningTokens) {
    const distance = editDistance(token.norm, q, maxDistance);
    if (distance !== null && (!best || 20 - distance > best.score)) {
      best = { score: 20 - distance, matchType: 'fuzzy', matchedText: token.raw };
    }
  }
  return best;
}

export function searchDictionary(query: string, entries: DictionaryEntry[], limit = 40): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const qNormAr = normalizeArabic(q);
  const qNormTr = normalizeTurkish(q);
  const isArabic = /[\u0600-\u06FF]/.test(q);
  const index = getIndex(entries);

  const exact: SearchResult[] = [];
  for (const item of index) {
    const match = (isArabic && qNormAr ? matchArabic(item, qNormAr) : null) ?? matchTurkish(item, qNormTr);
    if (match) exact.push({ entry: item.entry, ...match });
  }

  let results = exact;
  if (exact.length === 0) {
    const typoQuery = isArabic ? qNormAr : qNormTr;
    results = [];
    for (const item of index) {
      const match = matchTypo(item, typoQuery, isArabic);
      if (match) results.push({ entry: item.entry, ...match });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
