import { useState } from 'react';
import { Keyboard, Search, X } from 'lucide-react';
import ArabicKeyboard from '@/components/dictionary/ArabicKeyboard';
import { useArabicInput } from '@/hooks/useArabicInput';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBox({ value, onChange }: SearchBoxProps) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const { ref: inputRef, insertText, deleteBackward } = useArabicInput<HTMLInputElement>(value, onChange);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          dir="auto"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Arapça veya Türkçe ara (كتاب, kitap)"
          aria-label="Sözlükte ara"
          className="input-field h-14 pl-12 pr-24 text-lg shadow-card"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Aramayı temizle"
            className="absolute right-14 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setKeyboardOpen((open) => !open)}
          aria-expanded={keyboardOpen}
          aria-label="Arapça sanal klavyeyi aç veya kapat"
          className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl transition-colors ${
            keyboardOpen
              ? 'bg-gold-300 text-ink-900'
              : 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-ink-800'
          }`}
        >
          <Keyboard className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {keyboardOpen && <ArabicKeyboard onInsert={insertText} onDelete={deleteBackward} />}
    </div>
  );
}
