import { requestEdgeFunction } from '@/lib/edgeFunction';
import { normalizeArabic, normalizeTurkish } from '@/lib/search';
import type { TranslateDirection } from '@/types';

export interface TranslateResult {
  text: string;
  source: 'ai' | 'web' | 'offline';
  correction?: string;
}

const OFFLINE_PHRASES: [arabic: string, turkish: string][] = [
  ['السلام عليكم', 'Selamün aleyküm'],
  ['وعليكم السلام', 've aleyküm selam'],
  ['مرحبا', 'merhaba'],
  ['أهلا وسهلا', 'hoş geldiniz'],
  ['شكرا', 'teşekkür ederim'],
  ['شكرا جزيلا', 'çok teşekkür ederim'],
  ['عفوا', 'rica ederim'],
  ['صباح الخير', 'günaydın'],
  ['مساء الخير', 'iyi akşamlar'],
  ['تصبح على خير', 'iyi geceler'],
  ['كيف حالك', 'nasılsın'],
  ['الحمد لله', 'elhamdülillah'],
  ['إن شاء الله', 'inşallah'],
  ['ما شاء الله', 'maşallah'],
  ['بسم الله الرحمن الرحيم', 'rahman ve rahim allahın adıyla'],
  ['لا أعرف', 'bilmiyorum'],
  ['ما اسمك', 'adın ne'],
  ['أين المسجد', 'cami nerede'],
  ['كم الساعة', 'saat kaç'],
  ['أنا أحب اللغة العربية', 'arapça dilini seviyorum'],
];

function normTr(s: string): string {
  return normalizeTurkish(s).replace(/[.!?,;:،؟]/g, '').replace(/\s+/g, ' ').trim();
}

function matchOffline(text: string, direction: TranslateDirection): string | null {
  const match = OFFLINE_PHRASES.find(([ar, tr]) =>
    direction === 'ar-tr'
      ? normalizeArabic(ar) === normalizeArabic(text).replace(/[؟?!.،]/g, '').trim()
      : normTr(tr) === normTr(text),
  );
  if (!match) return null;
  return direction === 'ar-tr' ? match[1] : match[0];
}

async function translateWithWeb(text: string, direction: TranslateDirection): Promise<string | null> {
  if (text.length > 500) return null;
  const langpair = direction === 'ar-tr' ? 'ar|tr' : 'tr|ar';
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { responseData?: { translatedText?: unknown } };
  const out = data.responseData?.translatedText;
  if (typeof out !== 'string' || !out.trim() || /MYMEMORY WARNING/i.test(out)) return null;
  return out.trim();
}

export async function translateText(text: string, direction: TranslateDirection): Promise<TranslateResult> {
  const trimmed = text.trim();

  try {
    const data = await requestEdgeFunction<{ translation?: unknown; correction?: unknown }>('gemini', { mode: 'translate', text: trimmed, direction });
    if (typeof data.translation === 'string' && data.translation.trim()) {
      const correction = typeof data.correction === 'string' ? data.correction.trim() : '';
      return {
        text: data.translation.trim(),
        source: 'ai',
        correction: correction && correction !== trimmed ? correction : undefined,
      };
    }
  } catch {
    /* AI service unavailable, try the next provider */
  }

  try {
    const web = await translateWithWeb(trimmed, direction);
    if (web) return { text: web, source: 'web' };
  } catch {
    /* network unavailable, try offline phrases */
  }

  const offline = matchOffline(trimmed, direction);
  if (offline) return { text: offline, source: 'offline' };

  throw new Error('Çeviri yapılamadı. İnternet bağlantınızı kontrol edin.');
}
