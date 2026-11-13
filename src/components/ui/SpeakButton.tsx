import { useState } from 'react';
import { Loader2, Volume2 } from 'lucide-react';
import { speak, type SpeechLang } from '@/lib/speech';

interface SpeakButtonProps {
  text: string;
  lang?: SpeechLang;
  label?: string;
}

export default function SpeakButton({ text, lang = 'ar-SA', label = 'Dinle' }: SpeakButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await speak(text, lang);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={label}
      aria-busy={loading}
      className="btn-outline h-10 px-3.5 text-sm"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
      {loading ? 'Hazırlanıyor...' : label}
    </button>
  );
}
