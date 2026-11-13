import { useState } from 'react';
import { Loader2, SearchX, Sparkles } from 'lucide-react';
import { EdgeFunctionError } from '@/lib/edgeFunction';
import { generateWord } from '@/lib/generatedWords';
import type { DictionaryEntry } from '@/types';

interface GenerateWordPromptProps {
  query: string;
  onGenerated: (entry: DictionaryEntry) => void;
}

export default function GenerateWordPrompt({ query, onGenerated }: GenerateWordPromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      onGenerated(await generateWord(query));
    } catch (err) {
      const notAWord = err instanceof EdgeFunctionError && err.status === 422;
      setError(
        notAWord
          ? 'Bu aramada bir kelime bulunamadı. Yazımı kontrol edin.'
          : 'Kart oluşturulamadı. Lütfen tekrar deneyin.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in flex flex-col items-center gap-4 p-6 text-center">
      <SearchX className="h-8 w-8 text-gold-500" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-ink-900 dark:text-ink-50">&ldquo;{query}&rdquo; sözlükte bulunamadı</p>
        <p className="text-sm text-ink-600 dark:text-ink-300">
          Yapay zeka ile bu kelimenin kartını hemen oluşturabilirsiniz.
        </p>
      </div>
      <button type="button" onClick={handleGenerate} disabled={loading} aria-busy={loading} className="btn-gold h-11 w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Kart hazırlanıyor...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Yapay zeka ile kart oluştur
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
