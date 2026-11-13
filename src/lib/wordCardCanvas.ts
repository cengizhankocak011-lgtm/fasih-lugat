import type { DictionaryEntry } from '@/types';
import { POS_LABELS } from '@/lib/labels';

const WIDTH = 1080;
const HEIGHT = 1350;
const COLORS = {
  green900: '#064e3b',
  green700: '#047857',
  green600: '#059669',
  gold300: '#fcd34d',
  gold400: '#fbbf24',
  cream: '#fdfdf7',
  ink900: '#14201a',
  ink600: '#364539',
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function limitLines(lines: string[], maxLines: number): string[] {
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1]}…`;
  return kept;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  startY: number,
  lineHeight: number,
) {
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineHeight));
}

export async function renderWordCardBlob(entry: DictionaryEntry): Promise<Blob> {
  await Promise.all([
    document.fonts.load('200px Amiri'),
    document.fonts.load('40px Inter'),
  ]).catch(() => undefined);

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Kart görseli oluşturulamadı.');

  const cx = WIDTH / 2;
  const sans = 'Inter, system-ui, sans-serif';

  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const band = ctx.createLinearGradient(0, 0, WIDTH, 280);
  band.addColorStop(0, COLORS.green900);
  band.addColorStop(1, COLORS.green600);
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, WIDTH, 280);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 84px ${sans}`;
  ctx.fillText('FasihLügat', cx, 130);
  ctx.fillStyle = COLORS.gold300;
  ctx.font = `500 40px ${sans}`;
  ctx.fillText('Fasih Arapça Sözlük', cx, 200);

  ctx.direction = 'rtl';
  ctx.fillStyle = COLORS.green900;
  let wordSize = 230;
  ctx.font = `${wordSize}px Amiri, serif`;
  while (ctx.measureText(entry.word).width > 900 && wordSize > 100) {
    wordSize -= 10;
    ctx.font = `${wordSize}px Amiri, serif`;
  }
  ctx.fillText(entry.word, cx, 560);
  ctx.direction = 'ltr';

  const posLabel = `${POS_LABELS[entry.pos].toLocaleUpperCase('tr')}`;
  ctx.font = `700 34px ${sans}`;
  const chipWidth = ctx.measureText(posLabel).width + 56;
  ctx.fillStyle = COLORS.gold400;
  ctx.beginPath();
  ctx.roundRect(cx - chipWidth / 2, 600, chipWidth, 60, 30);
  ctx.fill();
  ctx.fillStyle = COLORS.ink900;
  ctx.fillText(posLabel, cx, 641);

  if (entry.root) {
    ctx.fillStyle = COLORS.green700;
    ctx.font = `600 36px ${sans}`;
    ctx.fillText('KÖK', cx - 150, 745);
    ctx.direction = 'rtl';
    ctx.font = '64px Amiri, serif';
    ctx.fillText(entry.root, cx + 110, 745);
    ctx.direction = 'ltr';
  }

  ctx.fillStyle = COLORS.gold400;
  ctx.fillRect(140, 790, WIDTH - 280, 4);

  ctx.fillStyle = COLORS.green600;
  ctx.font = `700 30px ${sans}`;
  ctx.fillText('ANLAMI', cx, 850);

  ctx.fillStyle = COLORS.ink900;
  ctx.font = `600 56px ${sans}`;
  const meaningLines = limitLines(
    wrapText(ctx, entry.meanings.join(' · '), 880),
    3,
  );
  drawLines(ctx, meaningLines, cx, 915, 70);

  const example = entry.examples[0];
  if (example) {
    ctx.fillStyle = COLORS.green600;
    ctx.font = `700 30px ${sans}`;
    ctx.fillText('ÖRNEK', cx, 1110);

    ctx.direction = 'rtl';
    ctx.fillStyle = COLORS.green900;
    ctx.font = '52px Amiri, serif';
    const ayahLines = limitLines(wrapText(ctx, example.ayah, 900), 2);
    drawLines(ctx, ayahLines, cx, 1180, 74);
    ctx.direction = 'ltr';
  }

  ctx.fillStyle = COLORS.ink600;
  ctx.font = `500 32px ${sans}`;
  ctx.fillText('Kur\u2019an örnekleriyle öğrenin', cx, 1300 - 20);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Kart görseli oluşturulamadı.');
  return blob;
}
