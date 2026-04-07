import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, UserState, Theme, WalletType, ScheduledTx } from './types';

const initialState: UserState = {
  hasSeenWelcome: true, // Tirar tela de boas vindas
  theme: 'light',
  wallets: [
    { id: '1', name: 'Minha Carteira', initialBalance: 0 }
  ],
  transactions: [],
  scheduled: [],
};

interface StoreContextType extends UserState {
  addTransaction: (t: Omit<Transaction, 'id' | 'date'> & { date?: string }) => void;
  deleteTransaction: (id: string) => void;
  addWallet: (w: Omit<WalletType, 'id'>) => void;
  editWallet: (id: string, name: string) => void;
  deleteWallet: (id: string) => void;
  addScheduled: (s: Omit<ScheduledTx, 'id'>) => void;
  editScheduled: (s: ScheduledTx) => void;
  deleteScheduled: (id: string) => void;
  resetData: () => void;
  setHasSeenWelcome: (val: boolean) => void;
  setTheme: (theme: Theme) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserState>(() => {
    const saved = localStorage.getItem('finances-app-v5-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...initialState, 
        ...parsed,
        transactions: parsed.transactions || [],
        scheduled: parsed.scheduled || [],
        wallets: parsed.wallets || initialState.wallets
      };
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('finances-app-v5-state', JSON.stringify(state));
  }, [state]);

  // Automatic Background Processing for Scheduled Fixos (Auto-Debit)
  useEffect(() => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();

    let discoveredNew = false;
    const additionalTransactions: Transaction[] = [];

    state.scheduled.forEach(s => {
      // Logic: Only process if today IS EXACTLY OR GREATER than the due day
      if (s.autoDebit && s.dayOfMonth <= day) {
        const alreadyDone = state.transactions.find(t => 
          t.description === `[AUTO] ${s.description}` && 
          new Date(t.date).getMonth() === month &&
          new Date(t.date).getFullYear() === year
        );

        if (!alreadyDone) {
          if (s.recurrenceMonths === undefined || (s.monthsProcessed || 0) < s.recurrenceMonths) {
            additionalTransactions.push({
              id: Math.random().toString(36).substring(2, 9),
              description: `[AUTO] ${s.description}`,
              amount: s.amount,
              type: s.type,
              walletId: s.walletId,
              date: new Date().toISOString()
            });
            discoveredNew = true;
          }
        }
      }
    });

    if (discoveredNew) {
      setState(prev => ({ 
        ...prev, 
        transactions: [...additionalTransactions, ...prev.transactions] 
      }));
    }
  }, [state.scheduled]); // Running whenever scheduled items change to detect new ones correctly

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'> & { date?: string }) => {
    const newTx: Transaction = {
      ...t,
      id: Math.random().toString(36).substring(2, 9),
      date: t.date || new Date().toISOString(),
    };
    setState(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(tx => tx.id !== id) }));
  };

  const addWallet = (w: Omit<WalletType, 'id'>) => {
    setState(prev => ({ ...prev, wallets: [...prev.wallets, { ...w, id: Math.random().toString(36).substring(2, 9) }] }));
  };

  const deleteWallet = (id: string) => {
    setState(prev => ({ ...prev, wallets: prev.wallets.filter(w => w.id !== id) }));
  };

  const editWallet = (id: string, name: string) => {
    setState(prev => ({
      ...prev,
      wallets: prev.wallets.map(w => w.id === id ? { ...w, name } : w)
    }));
  };

  const addScheduled = (s: Omit<ScheduledTx, 'id'>) => {
    setState(prev => ({ ...prev, scheduled: [...prev.scheduled, { ...s, id: Math.random().toString(36).substring(2, 9) }] }));
  };

  const editScheduled = (s: ScheduledTx) => {
    setState(prev => ({
      ...prev,
      scheduled: prev.scheduled.map(item => item.id === s.id ? s : item)
    }));
  };

  const deleteScheduled = (id: string) => {
    setState(prev => ({ ...prev, scheduled: prev.scheduled.filter(s => s.id !== id) }));
  };

  const resetData = () => {
    setState({
      ...initialState,
      hasSeenWelcome: state.hasSeenWelcome // preserve welcome status or reset it too? Let's preserve theme/welcome
    });
  };

  const setHasSeenWelcome = (val: boolean) => {
    setState(prev => ({ ...prev, hasSeenWelcome: val }));
  };

  const setTheme = (theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
  };

  return (
    <StoreContext.Provider value={{ 
      ...state, 
      addTransaction, 
      deleteTransaction, 
      addWallet,
      editWallet,
      deleteWallet,
      addScheduled,
      editScheduled,
      deleteScheduled,
      resetData,
      setHasSeenWelcome, 
      setTheme 
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within a StoreProvider');
  }
  return context;
};
