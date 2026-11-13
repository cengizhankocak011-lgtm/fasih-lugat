import { allEntries } from '@/data/entries';
import { supabase } from '@/lib/supabase';
import type { DictionaryEntry, PartOfSpeech } from '@/types';

export interface LibraryItem {
  id: string;
  word: string;
  wordPlain: string;
  pos: PartOfSpeech;
  meaning: string;
  queryKey: string | null;
  entry: DictionaryEntry | null;
}

interface SavedRow {
  query_key: string;
  word: string;
  wordPlain: string;
  pos: PartOfSpeech;
  meanings: string[];
}

const POS_VALUES: PartOfSpeech[] = ['fiil', 'isim', 'harf', 'sifat', 'zarf', 'zamir'];
const PAGE_SIZE = 1000;

function isSavedRow(value: unknown): value is SavedRow {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.query_key === 'string' &&
    typeof r.word === 'string' &&
    typeof r.wordPlain === 'string' &&
    typeof r.pos === 'string' &&
    (POS_VALUES as string[]).includes(r.pos) &&
    Array.isArray(r.meanings)
  );
}

async function fetchSavedRows(): Promise<SavedRow[]> {
  const rows: SavedRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('generated_words')
      .select('query_key, word:entry->>word, wordPlain:entry->>wordPlain, pos:entry->>pos, meanings:entry->meanings')
      .order('query_key', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const page = data ?? [];
    rows.push(...page.filter(isSavedRow));
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

export async function fetchLibraryItems(): Promise<LibraryItem[]> {
  const saved = await fetchSavedRows();
  const seen = new Set(allEntries.map((e) => e.wordPlain));

  const builtin: LibraryItem[] = allEntries.map((e) => ({
    id: e.id,
    word: e.word,
    wordPlain: e.wordPlain,
    pos: e.pos,
    meaning: e.meanings[0] ?? '',
    queryKey: null,
    entry: e,
  }));

  const generated: LibraryItem[] = [];
  for (const row of saved) {
    if (seen.has(row.wordPlain)) continue;
    seen.add(row.wordPlain);
    generated.push({
      id: `saved:${row.query_key}`,
      word: row.word,
      wordPlain: row.wordPlain,
      pos: row.pos,
      meaning: row.meanings.find((m) => typeof m === 'string') ?? '',
      queryKey: row.query_key,
      entry: null,
    });
  }

  return [...builtin, ...generated];
}
