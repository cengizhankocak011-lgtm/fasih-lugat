import type { MouseEvent } from 'react';

const LETTERS = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع',
  'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ء', 'أ', 'إ', 'آ', 'ؤ', 'ئ', 'ة', 'ى',
];

const HARAKAT: { value: string; name: string }[] = [
  { value: '\u064E', name: 'Fetha' },
  { value: '\u064F', name: 'Damme' },
  { value: '\u0650', name: 'Kesre' },
  { value: '\u0651', name: 'Şedde' },
  { value: '\u0652', name: 'Sükûn' },
  { value: '\u064B', name: 'Tenvin fetha' },
  { value: '\u064C', name: 'Tenvin damme' },
  { value: '\u064D', name: 'Tenvin kesre' },
];

const KEY_BASE =
  'flex h-11 items-center justify-center rounded-xl border border-emerald-100 bg-white text-lg text-ink-900 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 active:scale-95 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50 dark:hover:bg-ink-800';

interface ArabicKeyboardProps {
  onInsert: (text: string) => void;
  onDelete: () => void;
}

export default function ArabicKeyboard({ onInsert, onDelete }: ArabicKeyboardProps) {
  const keepFocus = (e: MouseEvent) => e.preventDefault();

  return (
    <div
      role="group"
      aria-label="Arapça sanal klavye"
      className="card animate-slide-up space-y-3 p-3 sm:p-4"
    >
      <div className="grid grid-cols-9 gap-1.5 sm:grid-cols-12">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            onMouseDown={keepFocus}
            onClick={() => onInsert(letter)}
            className={`${KEY_BASE} font-arabic`}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-1.5 border-t border-emerald-100 pt-3 dark:border-ink-800">
        {HARAKAT.map((h) => (
          <button
            key={h.value}
            type="button"
            title={h.name}
            aria-label={h.name}
            onMouseDown={keepFocus}
            onClick={() => onInsert(h.value)}
            className={`${KEY_BASE} bg-gold-50 text-emerald-800 dark:bg-ink-800 dark:text-gold-300`}
          >
            <span className="font-arabic">{`\u0640${h.value}`}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={() => onInsert(' ')}
          className="btn-outline col-span-3 h-11 text-sm"
        >
          Boşluk
        </button>
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={onDelete}
          className="btn-ghost h-11 text-sm text-red-600 dark:text-red-300"
        >
          Sil
        </button>
      </div>
    </div>
  );
}
