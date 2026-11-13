import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/components/layout/Header';
import SiteFooter from '@/components/layout/SiteFooter';
import BottomNav, { type TabId } from '@/components/layout/BottomNav';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import DictionaryView from '@/components/dictionary/DictionaryView';
import TranslateView from '@/components/translate/TranslateView';
import LibraryView from '@/components/library/LibraryView';
import type { Intent } from '@/types';

export default function App() {
  const [tab, setTab] = useState<TabId>('dictionary');
  const [intent, setIntent] = useState<Intent | null>(null);
  const [theme, toggleTheme] = useTheme();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const navigate = (next: TabId, nextIntent: Intent) => {
    setIntent(nextIntent);
    setTab(next);
  };

  return (
    <div className="min-h-screen">
      <Header isDark={theme === 'dark'} onToggleTheme={toggleTheme} onOpenFeedback={() => setFeedbackOpen(true)} />
      <main className="mx-auto w-full max-w-3xl px-4 pb-nav pt-6 sm:px-6">
        <div hidden={tab !== 'dictionary'}>
          <DictionaryView intent={intent} />
        </div>
        <div hidden={tab !== 'translate'}>
          <TranslateView intent={intent} />
        </div>
        {tab === 'library' && <LibraryView onNavigate={navigate} />}
      </main>
      <SiteFooter />
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
