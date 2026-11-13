import type { DictionaryEntry } from '@/types';
import { renderWordCardBlob } from '@/lib/wordCardCanvas';

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled';

export async function shareWordCard(entry: DictionaryEntry): Promise<ShareOutcome> {
  const blob = await renderWordCardBlob(entry);
  const file = new File([blob], `fasihlugat-${entry.wordPlain}.png`, { type: 'image/png' });
  const shareText = `${entry.word} - ${entry.meanings.slice(0, 3).join(', ')}`;

  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'FasihLügat', text: shareText });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
