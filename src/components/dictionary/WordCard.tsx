import { useMemo, useState } from 'react';
import { ArrowLeft, Share2, Star, Sparkles } from 'lucide-react';
import SpeakButton from '@/components/ui/SpeakButton';
import WordReading from '@/components/ui/WordReading';
import VerbSection from '@/components/dictionary/VerbSection';
import { POS_LABELS } from '@/lib/labels';
import { shareWordCard, type ShareOutcome } from '@/lib/shareCard';
import { useWordDetails } from '@/hooks/useWordDetails';
import { isFavorite, toggleFavorite } from '@/lib/storage';
import type { DictionaryEntry } from '@/types';

const FREQUENCY_LABELS: Record<NonNullable<DictionaryEntry['frequency']>, string> = {
  high: 'Sık kullanılan',
  medium: 'Orta sıklıkta',
  low: 'Nadir',
};

const SHARE_MESSAGES: Partial<Record<ShareOutcome, string>> = {
  downloaded: 'Kart görseli indirildi. Paylaşmak için görseli WhatsApp veya Instagram\u2019a yükleyebilirsiniz.',
};

interface WordCardProps {
  entry: DictionaryEntry;
  onBack: () => void;
}

export default function WordCard({ entry, onBack }: WordCardProps) {
  const [favorite, setFavorite] = useState(() => isFavorite(entry.id));
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const rootLetters = useMemo(() => entry.root.split(/\s+/).filter(Boolean), [entry.root]);
  const { status: detailsStatus, details, retry: retryDetails } = useWordDetails(entry);
  const examples = entry.examples.length > 0 ? entry.examples : details?.examples ?? [];
  const synonyms = entry.synonyms?.length ? entry.synonyms : details?.synonyms ?? [];

  const handleFavorite = () => {
    const nowFavorite = toggleFavorite({
      id: entry.id,
      word: entry.word,
      meaning: entry.meanings[0] ?? '',
      pos: entry.pos,
    });
    setFavorite(nowFavorite);
  };

  const handleShare = async () => {
    setSharing(true);
    setShareMessage(null);
    setShareError(null);
    try {
      const outcome = await shareWordCard(entry);
      setShareMessage(SHARE_MESSAGES[outcome] ?? null);
    } catch {
      setShareError('Kart görseli oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <article className="animate-slide-up space-y-5">
      <section className="card-elevated relative overflow-hidden p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-200/50 blur-3xl dark:bg-gold-500/10" aria-hidden="true" />
        <div className="relative space-y-5">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={onBack} className="btn-ghost h-9 px-2 text-sm lg:hidden">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Geri
            </button>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="chip-emerald">{POS_LABELS[entry.pos]}</span>
              {entry.frequency && <span className="chip-gold">{FREQUENCY_LABELS[entry.frequency]}</span>}
              {entry.id.startsWith('ai-') && <span className="chip-ink">Yapay zeka ile oluşturuldu</span>}
            </div>
          </div>

          <h2 dir="rtl" className="text-center font-amiri text-5xl leading-relaxed text-emerald-900 sm:text-6xl dark:text-emerald-100">
            {entry.word}
          </h2>
          <WordReading word={entry.word} className="text-center text-emerald-700 dark:text-emerald-300" />

          <div className="flex flex-wrap items-center justify-center gap-2">
            <SpeakButton text={entry.word} />
            <button
              type="button"
              onClick={handleFavorite}
              aria-pressed={favorite}
              className={`h-10 px-3.5 text-sm ${favorite ? 'btn-gold' : 'btn-outline'}`}
            >
              <Star className={`h-4 w-4 transition-transform duration-300 ${favorite ? 'scale-110 fill-current' : ''}`} aria-hidden="true" />
              {favorite ? 'Favoride' : 'Favorile'}
            </button>
            <button type="button" onClick={handleShare} disabled={sharing} className="btn-outline h-10 px-3.5 text-sm">
              {sharing ? <Sparkles className="h-4 w-4 animate-pulse" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
              {sharing ? 'Hazırlanıyor...' : 'Kartı paylaş'}
            </button>
          </div>
          {shareMessage && <p className="text-center text-sm text-emerald-700 dark:text-emerald-300">{shareMessage}</p>}
          {shareError && <p role="alert" className="text-center text-sm text-red-600 dark:text-red-300">{shareError}</p>}
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h3 className="section-title">Türkçe karşılıklar</h3>
        <div className="flex flex-wrap gap-2">
          {entry.meanings.map((m) => (
            <span key={m} className="chip-emerald text-sm">{m}</span>
          ))}
        </div>
        {synonyms.length > 0 && (
          <div className="space-y-2 border-t border-emerald-100 pt-4 dark:border-ink-800">
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">Eş anlamlılar</p>
            <div className="flex flex-wrap gap-2">
              {synonyms.map((s) => (
                <span key={s} dir="rtl" className="chip-gold font-arabic text-base">{s}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="card space-y-4 p-5 sm:p-6">
          <h3 className="section-title">Kök (جذر)</h3>
          {rootLetters.length > 0 ? (
            <div dir="rtl" className="flex flex-wrap justify-start gap-2">
              {[...rootLetters].reverse().map((letter, i) => (
                <span
                  key={`${letter}-${i}`}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 font-amiri text-2xl text-emerald-800 dark:bg-ink-800 dark:text-emerald-200"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500 dark:text-ink-300">Kök bilgisi bulunmuyor.</p>
          )}
        </div>
        <div className="card space-y-4 p-5 sm:p-6">
          <h3 className="section-title">Çoğul ve tekil</h3>
          {entry.plural ? (
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-300">Cem&apos;i mükesser (جمع التكسير)</p>
              <p dir="rtl" className="mt-1 font-amiri text-3xl text-emerald-900 dark:text-emerald-100">{entry.plural}</p>
            </div>
          ) : (
            <p className="text-sm text-ink-500 dark:text-ink-300">Çoğul bilgisi bulunmuyor.</p>
          )}
          {entry.singular && (
            <div>
              <p className="text-sm text-ink-500 dark:text-ink-300">Tekil</p>
              <p dir="rtl" className="mt-1 font-amiri text-2xl text-emerald-900 dark:text-emerald-100">{entry.singular}</p>
            </div>
          )}
        </div>
      </section>

      {entry.verb && <VerbSection verb={entry.verb} />}

      {entry.particles && entry.particles.length > 0 && (
        <section className="card space-y-4 p-5 sm:p-6">
          <h3 className="section-title">Harf-i cerli kullanımlar</h3>
          <ul className="space-y-3">
            {entry.particles.map((p) => (
              <li key={p.harf} className="flex gap-4 rounded-xl bg-cream-100 p-4 dark:bg-ink-800/60">
                <span dir="rtl" className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-xl bg-gold-300 px-3 font-amiri text-2xl text-ink-900">
                  {p.harf}
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-ink-900 dark:text-ink-50">{p.meaning}</p>
                  {p.example && (
                    <p dir="rtl" className="font-amiri text-lg text-ink-600 dark:text-ink-300">{p.example}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="section-title">Örnek cümleler</h3>
          {!entry.examples.length && detailsStatus === 'ready' && examples.length > 0 && (
            <span className="chip-ink">Yapay zeka ile oluşturuldu</span>
          )}
        </div>
        {detailsStatus === 'loading' ? (
          <p className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-300" role="status">
            <Sparkles className="h-4 w-4 animate-pulse text-gold-500" aria-hidden="true" />
            Örnekler hazırlanıyor...
          </p>
        ) : detailsStatus === 'error' ? (
          <div className="flex flex-wrap items-center gap-3">
            <p role="alert" className="text-sm text-red-600 dark:text-red-300">Örnekler yüklenemedi.</p>
            <button type="button" onClick={retryDetails} className="btn-outline h-9 px-3 text-sm">Tekrar dene</button>
          </div>
        ) : examples.length === 0 ? (
          <p className="text-sm text-ink-500 dark:text-ink-300">Bu kelime için örnek bulunmuyor.</p>
        ) : (
          <ul className="space-y-4">
            {examples.map((ex) => (
              <li key={ex.ayah} className="space-y-3 rounded-2xl border border-emerald-100 p-4 dark:border-ink-800">
                <p dir="rtl" className="font-quran text-2xl leading-loose text-ink-900 dark:text-ink-50">{ex.ayah}</p>
                <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{ex.translation}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {ex.reference && <span className="chip-ink">{ex.reference}</span>}
                  <SpeakButton text={ex.ayah} label="Dinle" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {entry.tags.map((t) => (
            <span key={t} className="chip-ink">#{t}</span>
          ))}
        </div>
      )}
    </article>
  );
}
