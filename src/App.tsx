import { useEffect, useState } from 'react';
import { StoreProvider, useAppStore } from './store';
import { Navigation } from './components/Navigation';

// Screens
import { Home } from './screens/Home';
import { Wallets } from './screens/Wallets';
import { Transactions } from './screens/Transactions';
import { Scheduled } from './screens/Scheduled';
import { Settings } from './screens/Settings';
import { Reports } from './screens/Reports';

export type Tab = 'home' | 'wallets' | 'transactions' | 'scheduled' | 'settings' | 'reports';

const AppContent = () => {
  const { theme, loading } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'wallets': return <Wallets />;
      case 'transactions': return <Transactions />;
      case 'scheduled': return <Scheduled />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans transition-colors duration-300 pb-28 md:pb-8">
      {/* Dynamic Loading Overlay if needed, but we keep UI alive */}
      {loading && (
        <div className="fixed top-4 right-4 z-[99] w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow" />
      )}

      <div className="relative z-10 w-full h-full min-h-screen max-w-5xl mx-auto flex flex-col md:flex-row">
        
        {/* Desktop Sidebar / Mobile Bottom Nav */}
        <Navigation activeTab={activeTab} onChange={setActiveTab} />

        {/* Main Content Area */}
        <div className="w-full h-full min-h-screen flex-1 md:ml-64 md:border-l md:border-border">
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
