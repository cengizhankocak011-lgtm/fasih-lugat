import { useEffect, useState } from 'react';
import { requestEdgeFunction } from '@/lib/edgeFunction';
import type { DictionaryEntry, QuranExample } from '@/types';

export interface WordDetails {
  synonyms: string[];
  examples: QuranExample[];
}

type DetailsStatus = 'loading' | 'ready' | 'error';

interface DetailsState {
  status: DetailsStatus;
  details: WordDetails | null;
}

function isExample(value: unknown): value is QuranExample {
  if (!value || typeof value !== 'object') return false;
  const ex = value as Record<string, unknown>;
  return typeof ex.ayah === 'string' && typeof ex.translation === 'string' && typeof ex.reference === 'string';
}

function isWordDetails(value: unknown): value is WordDetails {
  if (!value || typeof value !== 'object') return false;
  const d = value as Record<string, unknown>;
  return Array.isArray(d.synonyms) && d.synonyms.every((s) => typeof s === 'string') && Array.isArray(d.examples) && d.examples.every(isExample);
}

export function useWordDetails(entry: DictionaryEntry) {
  const needsDetails = entry.examples.length === 0;
  const [state, setState] = useState<DetailsState>({ status: 'loading', details: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!needsDetails) return;
    let cancelled = false;

    requestEdgeFunction<unknown>('word-details', {
      entryId: entry.id,
      word: entry.word,
      wordPlain: entry.wordPlain,
      root: entry.root,
      meanings: entry.meanings,
      pos: entry.pos,
    })
      .then((data) => {
        if (cancelled) return;
        setState(isWordDetails(data) ? { status: 'ready', details: data } : { status: 'error', details: null });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', details: null });
      });

    return () => {
      cancelled = true;
    };
  }, [entry, needsDetails, attempt]);

  const retry = () => {
    setState({ status: 'loading', details: null });
    setAttempt((n) => n + 1);
  };

  return { status: needsDetails ? state.status : 'ready', details: state.details, retry };
}
