import { requestEdgeFunction } from '@/lib/edgeFunction';
import { supabase } from '@/lib/supabase';
import type { DictionaryEntry } from '@/types';

export function isDictionaryEntry(value: unknown): value is DictionaryEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.word === 'string' &&
    typeof e.wordPlain === 'string' &&
    typeof e.pos === 'string' &&
    typeof e.root === 'string' &&
    Array.isArray(e.meanings) &&
    Array.isArray(e.examples)
  );
}

export async function fetchSavedWords(): Promise<DictionaryEntry[]> {
  const { data, error } = await supabase
    .from('generated_words')
    .select('entry')
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.entry).filter(isDictionaryEntry);
}

export async function fetchSavedWord(queryKey: string): Promise<DictionaryEntry> {
  const { data, error } = await supabase
    .from('generated_words')
    .select('entry')
    .eq('query_key', queryKey)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const entry = data?.entry;
  if (!isDictionaryEntry(entry)) throw new Error('Word card not found');
  return entry;
}

export async function generateWord(query: string): Promise<DictionaryEntry> {
  const data = await requestEdgeFunction<unknown>('generate-word', { query });
  if (!isDictionaryEntry(data)) throw new Error('Invalid word card');
  return data;
}
