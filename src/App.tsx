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
import { Login } from './screens/Login';

export type Tab = 'home' | 'wallets' | 'transactions' | 'scheduled' | 'settings' | 'reports';

const AppContent = () => {
  const { theme, user, loading } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-foreground/10 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

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
