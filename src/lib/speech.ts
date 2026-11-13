import { postEdgeFunction } from '@/lib/edgeFunction';

export type SpeechLang = 'ar-SA' | 'tr-TR';

const arabicAudioUrls = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

function canUseDeviceVoice(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function speakWithDeviceVoice(text: string, lang: SpeechLang): void {
  if (!canUseDeviceVoice()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  const prefix = lang.slice(0, 2).toLowerCase();
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

async function getArabicAudioUrl(text: string): Promise<string> {
  const cached = arabicAudioUrls.get(text);
  if (cached) return cached;
  const res = await postEdgeFunction('speech', { text });
  const blob = await res.blob();
  if (blob.size === 0) throw new Error('Empty audio');
  const url = URL.createObjectURL(blob);
  arabicAudioUrls.set(text, url);
  return url;
}

async function playArabicAudio(text: string): Promise<void> {
  const url = await getArabicAudioUrl(text);
  currentAudio?.pause();
  const audio = new Audio(url);
  currentAudio = audio;
  await audio.play();
}

export async function speak(text: string, lang: SpeechLang = 'ar-SA'): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (lang === 'ar-SA') {
    try {
      await playArabicAudio(trimmed);
      return;
    } catch {
      /* cloud voice unavailable, use the device voice instead */
    }
  }

  speakWithDeviceVoice(trimmed, lang);
}
