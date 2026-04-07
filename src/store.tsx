import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, UserState, Theme, WalletType, ScheduledTx } from './types';

const initialState: UserState = {
  hasSeenWelcome: false,
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
  deleteWallet: (id: string) => void;
  addScheduled: (s: Omit<ScheduledTx, 'id'>) => void;
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
      return { ...initialState, ...JSON.parse(saved) };
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('finances-app-v5-state', JSON.stringify(state));
  }, [state]);

  const addTransaction = (t: Omit<Transaction, 'id' | 'date'> & { date?: string }) => {
    const newTx: Transaction = {
      ...t,
      id: crypto.randomUUID(),
      date: t.date || new Date().toISOString(),
    };
    setState(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(tx => tx.id !== id) }));
  };

  const addWallet = (w: Omit<WalletType, 'id'>) => {
    setState(prev => ({ ...prev, wallets: [...prev.wallets, { ...w, id: crypto.randomUUID() }] }));
  };

  const deleteWallet = (id: string) => {
    setState(prev => ({ ...prev, wallets: prev.wallets.filter(w => w.id !== id) }));
  };

  const addScheduled = (s: Omit<ScheduledTx, 'id'>) => {
    setState(prev => ({ ...prev, scheduled: [...prev.scheduled, { ...s, id: crypto.randomUUID() }] }));
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
      deleteWallet,
      addScheduled,
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
