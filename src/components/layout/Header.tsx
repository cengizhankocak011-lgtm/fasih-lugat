import { BookOpen, MessageSquarePlus, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenFeedback: () => void;
}

export default function Header({ isDark, onToggleTheme, onOpenFeedback }: HeaderProps) {
  return (
    <header className="safe-top sticky top-0 z-30 border-b border-emerald-100/70 bg-white/90 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/90">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-gold-300 shadow-card">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-bold leading-none text-emerald-900 dark:text-emerald-100">FasihLügat</p>
            <p className="mt-1 text-xs text-ink-500 dark:text-ink-300">Fasih Arapça Sözlük</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenFeedback}
            aria-label="Öneri ve destek"
            className="btn-ghost h-10 w-10 rounded-full p-0"
          >
            <MessageSquarePlus className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
            className="btn-ghost h-10 w-10 rounded-full p-0 transition-transform hover:rotate-12"
          >
            {isDark ? <Sun className="h-5 w-5 text-gold-300" /> : <Moon className="h-5 w-5 text-emerald-700" />}
          </button>
        </div>
      </div>
    </header>
  );
}
