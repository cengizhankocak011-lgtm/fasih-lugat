import { BookOpen, Languages, Library } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TabId = 'dictionary' | 'translate' | 'library';

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'dictionary', label: 'Sözlük', icon: BookOpen },
  { id: 'translate', label: 'Çeviri', icon: Languages },
  { id: 'library', label: 'Kaydedilenler', icon: Library },
];

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Ana menü"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-emerald-100/80 bg-white/95 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/95"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-1 px-3 py-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex flex-col items-center gap-1 rounded-2xl py-1.5 text-xs font-semibold transition-colors duration-200 ${
                isActive
                  ? 'text-emerald-800 dark:text-gold-300'
                  : 'text-ink-500 hover:text-emerald-700 dark:text-ink-300 dark:hover:text-emerald-300'
              }`}
            >
              <span
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? 'scale-100 bg-gold-300 text-ink-900 shadow-sm'
                    : 'scale-95 bg-transparent group-hover:bg-emerald-50 dark:group-hover:bg-ink-800'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
