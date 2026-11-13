import { useRef, type RefObject } from 'react';

type TextField = HTMLInputElement | HTMLTextAreaElement;

interface ArabicInput<T extends TextField> {
  ref: RefObject<T>;
  insertText: (text: string) => void;
  deleteBackward: () => void;
}

export function useArabicInput<T extends TextField>(value: string, onChange: (value: string) => void): ArabicInput<T> {
  const ref = useRef<T>(null);

  const insertText = (text: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? start;
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const deleteBackward = () => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? start;
    if (start === end && start === 0) return;
    const from = start === end ? start - 1 : start;
    onChange(value.slice(0, from) + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(from, from);
    });
  };

  return { ref, insertText, deleteBackward };
}
