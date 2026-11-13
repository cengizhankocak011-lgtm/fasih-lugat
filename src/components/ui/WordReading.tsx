import { useMemo } from 'react';
import { arabicReading } from '@/lib/transliterate';

interface WordReadingProps {
  word: string;
  className?: string;
}

export default function WordReading({ word, className = '' }: WordReadingProps) {
  const reading = useMemo(() => arabicReading(word), [word]);
  if (!reading) return null;
  return (
    <p dir="ltr" className={`text-sm italic ${className}`}>
      {reading}
    </p>
  );
}
