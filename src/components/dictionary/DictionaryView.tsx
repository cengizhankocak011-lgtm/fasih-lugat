import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import SearchBox from '@/components/dictionary/SearchBox';
import BrowseList from '@/components/dictionary/BrowseList';
import FeedbackSection from '@/components/feedback/FeedbackSection';
import GenerateWordPrompt from '@/components/dictionary/GenerateWordPrompt';
import ResultsList from '@/components/dictionary/ResultsList';
import WordCard from '@/components/dictionary/WordCard';
import WordOfTheDay from '@/components/dictionary/WordOfTheDay';
import { allEntries as dictionary } from '@/data/entries';
import { fetchSavedWords } from '@/lib/generatedWords';
import { addHistory, storage } from '@/lib/storage';
import PosFilter, { type PosFilterValue } from '@/components/dictionary/PosFilter';
import { searchDictionary } from '@/lib/search';
import { getWordOfTheDay } from '@/lib/wordOfTheDay';
import type { DictionaryEntry, HistoryItem, Intent, PartOfSpeech } from '@/types';

interface DictionaryViewProps {
  intent: Intent | null;
}

export default function DictionaryView({ intent }: DictionaryViewProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recent] = useState<HistoryItem[]>(() =>
    storage.getHistory().filter((h) => h.type === 'dictionary').slice(0, 6),
  );
  const [savedWords, setSavedWords] = useState<DictionaryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchSavedWords()
      .then((words) => {
        if (!cancelled) setSavedWords(words);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const words = useMemo(() => {
    const seen = new Set(dictionary.map((e) => e.wordPlain));
    const extra = savedWords.filter((e) => {
      if (seen.has(e.wordPlain)) return false;
      seen.add(e.wordPlain);
      return true;
    });
    return [...dictionary, ...extra];
  }, [savedWords]);

  useEffect(() => {
    if (!intent || intent.kind === 'translate') return;
    if (intent.kind === 'word') {
      setQuery(intent.query);
      setSelectedId(null);
      return;
    }
    const entry = dictionary.find((e) => e.id === intent.entryId);
    if (entry) {
      setQuery(entry.wordPlain);
      setSelectedId(entry.id);
    }
  }, [intent]);

  const [posFilter, setPosFilter] = useState<PosFilterValue>('all');
  const trimmed = query.trim();
  const deferredTrimmed = useDeferredValue(trimmed);
  const results = useMemo(() => searchDictionary(deferredTrimmed, words), [deferredTrimmed, words]);
  const posCounts = useMemo(() => {
    const counts: Record<PartOfSpeech, number> = { isim: 0, fiil: 0, sifat: 0, harf: 0, zarf: 0, zamir: 0 };
    for (const { entry } of results) counts[entry.pos] += 1;
    return counts;
  }, [results]);
  const filteredResults = useMemo(
    () => (posFilter === 'all' ? results : results.filter(({ entry }) => entry.pos === posFilter)),
    [results, posFilter],
  );
  const commonWords = useMemo(() => dictionary.filter((e) => e.frequency === 'high'), []);
  const popular = useMemo(() => commonWords.slice(0, 8), [commonWords]);
  const [wordOfTheDay] = useState(() => getWordOfTheDay(commonWords, new Date()));
  const selected = words.find((e) => e.id === selectedId) ?? null;

  const fuzzyOnly = results.length > 0 && results.every((r) => r.matchType === 'fuzzy');

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedId(null);
  };

  const handleSelect = (entry: DictionaryEntry) => {
    setSelectedId(entry.id);
    if (trimmed) addHistory({ query: trimmed, type: 'dictionary', result: entry.word });
  };

  const handleGenerated = (entry: DictionaryEntry) => {
    const existing = words.find((e) => e.wordPlain === entry.wordPlain);
    if (!existing) setSavedWords((prev) => [...prev, entry]);
    const target = existing ?? entry;
    setQuery(target.wordPlain);
    setSelectedId(target.id);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Sözlük</h1>
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Kök, çoğul, fiil çekimi ve Kur&apos;an örnekleriyle Arapça kelimeleri keşfedin.
        </p>
      </header>

      <SearchBox value={query} onChange={handleQueryChange} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <div className={`${selected ? 'hidden lg:block' : 'block'} min-w-0`}>
          {trimmed ? (
            results.length > 0 ? (
              <div className="space-y-4">
                {fuzzyOnly && (
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-gold-300/20 px-4 py-3 text-sm text-ink-800 dark:text-ink-100">
                    <span>Bunu mu aradınız:</span>
                    <button
                      type="button"
                      onClick={() => handleQueryChange(results[0].matchedText)}
                      dir="auto"
                      className="rounded-full bg-white px-3 py-1 font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50 dark:bg-ink-800 dark:text-gold-300 dark:hover:bg-ink-700"
                    >
                      {results[0].matchedText}
                    </button>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <PosFilter value={posFilter} counts={posCounts} total={results.length} onChange={setPosFilter} />
                  <p className="text-sm text-ink-600 dark:text-ink-300" aria-live="polite">
                    {fuzzyOnly
                      ? 'Tam eşleşme yok, benzer yazımlar gösteriliyor'
                      : `${filteredResults.length} sonuç bulundu`}
                  </p>
                </div>
                {filteredResults.length > 0 ? (
                  <div className="space-y-4">
                    <ResultsList results={filteredResults} selectedId={selectedId} onSelect={handleSelect} />
                    {fuzzyOnly && <GenerateWordPrompt query={trimmed} onGenerated={handleGenerated} />}
                  </div>
                ) : (
                  <div className="card flex flex-col items-center gap-3 p-8 text-center">
                    <p className="text-sm text-ink-600 dark:text-ink-300">Bu türde sonuç yok.</p>
                    <button type="button" onClick={() => setPosFilter('all')} className="chip-emerald transition-colors hover:bg-emerald-100 dark:hover:bg-ink-700">
                      Tümünü göster
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <GenerateWordPrompt query={trimmed} onGenerated={handleGenerated} />
            )
          ) : (
            <Suggestions
              recent={recent}
              wordOfTheDay={wordOfTheDay}
              popular={popular}
              entries={dictionary}
              onPickQuery={handleQueryChange}
              onPickEntry={(entry) => {
                setQuery(entry.wordPlain);
                handleSelect(entry);
              }}
            />
          )}
        </div>

        <div className={`${selected ? 'block' : 'hidden lg:flex'} min-w-0`}>
          {selected ? (
            <WordCard key={selected.id} entry={selected} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="card flex w-full flex-col items-center justify-center gap-3 p-10 text-center">
              <BookOpen className="h-10 w-10 text-gold-500" aria-hidden="true" />
              <p className="text-sm text-ink-600 dark:text-ink-300">Detaylarını görmek için soldaki listeden bir kelime seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SuggestionsProps {
  recent: HistoryItem[];
  wordOfTheDay: DictionaryEntry | null;
  popular: DictionaryEntry[];
  entries: DictionaryEntry[];
  onPickQuery: (query: string) => void;
  onPickEntry: (entry: DictionaryEntry) => void;
}

function Suggestions({ recent, wordOfTheDay, popular, entries, onPickQuery, onPickEntry }: SuggestionsProps) {
  return (
    <div className="space-y-6">
      {wordOfTheDay && <WordOfTheDay entry={wordOfTheDay} onOpen={onPickEntry} />}
      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-title flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Son aramalar
          </h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((h) => (
              <button key={h.id} type="button" onClick={() => onPickQuery(h.query)} className="chip-ink transition-colors hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-ink-700">
                {h.query}
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="space-y-3">
        <h2 className="section-title">Sık kullanılan kelimeler</h2>
        <div className="grid grid-cols-2 gap-3">
          {popular.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onPickEntry(e)}
              className="card flex items-center justify-between gap-3 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg"
            >
              <span dir="rtl" className="font-amiri text-2xl text-emerald-900 dark:text-emerald-100">{e.word}</span>
              <span className="truncate text-xs text-ink-500 dark:text-ink-300">{e.meanings[0]}</span>
            </button>
          ))}
        </div>
      </section>
      <BrowseList entries={entries} onPickEntry={onPickEntry} />
      <FeedbackSection />
    </div>
  );
}
