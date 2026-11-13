import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import type { ThemeMode } from '@/types';

export function useTheme(): [ThemeMode, () => void] {
  const [theme, setTheme] = useState<ThemeMode>(() => storage.getSettings().theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.setSettings({ theme });
  }, [theme]);

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}
