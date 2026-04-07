import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, UserState, Theme, WalletType, ScheduledTx } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const initialState: UserState = {
  hasSeenWelcome: true, 
  theme: 'light',
  wallets: [
    { id: '1', name: 'Minha Carteira', initialBalance: 0 }
  ],
  transactions: [],
  scheduled: [],
  selectedDate: new Date().toISOString(),
};

interface StoreContextType extends Omit<UserState, 'selectedDate'> {
  user: User | null;
  loading: boolean;
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
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

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

  // Auth Effect - Use Anonymous Auth to avoid Login Screen friction
  useEffect(() => {
    // Safety Timeout: If Firebase takes too long, let the user in anyway with local data
    const timeout = setTimeout(() => {
        if (loading) {
            console.warn("Firebase Auth taking too long. Proceeding with local state.");
            setLoading(false);
            setIsHydrated(true);
        }
    }, 6000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
            await signInAnonymously(auth);
        } else {
            setUser(currentUser);
            const docRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
            const data = docSnap.data() as UserState;
            setState(prev => ({ ...prev, ...data }));
            }
        }
      } catch (err) {
        console.error("Auth/Sync Error:", err);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
        setIsHydrated(true);
      }
    });
    return () => {
        unsubscribe();
        clearTimeout(timeout);
    };
  }, []);

  // Sync state to LocalStorage and Firestore
  useEffect(() => {
    if (!isHydrated) return;
    
    // Convert state to a JSON-safe object to remove undefineds for Firebase
    const sanitizedState = JSON.parse(JSON.stringify(state));
    
    localStorage.setItem('finances-app-v5-state', JSON.stringify(state));
    
    if (user) {
      setDoc(doc(db, 'users', user.uid), sanitizedState, { merge: true });
    }
  }, [state, user, isHydrated]);

  // Scheduled Processing
  useEffect(() => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();

    let discoveredNew = false;
    const additionalTransactions: Transaction[] = [];

    state.scheduled.forEach(s => {
      if (s.autoDebit && s.dayOfMonth <= day) {
        const alreadyDone = state.transactions.find(t => 
          (t.description === `[AUTO] ${s.description}` || t.description === `[FIXO] ${s.description}`) && 
          new Date(t.date).getMonth() === month &&
          new Date(t.date).getFullYear() === year
        );

        if (!alreadyDone) {
          if (s.recurrenceMonths === undefined || (s.monthsProcessed || 0) < s.recurrenceMonths) {
            additionalTransactions.push({
              id: Math.random().toString(36).substring(2, 9),
              description: `[FIXO] ${s.description}`,
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
  }, [state.scheduled]);

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

  const setSelectedDate = (d: Date) => {
    setState(prev => ({ ...prev, selectedDate: d.toISOString() }));
  };

  const deleteScheduled = (id: string) => {
    setState(prev => ({ ...prev, scheduled: prev.scheduled.filter(s => s.id !== id) }));
  };

  const resetData = () => {
    setState({ ...initialState, hasSeenWelcome: state.hasSeenWelcome });
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
      user,
      loading,
      addTransaction, 
      deleteTransaction, 
      addWallet,
      editWallet,
      deleteWallet,
      addScheduled,
      editScheduled,
      deleteScheduled,
      selectedDate: new Date(state.selectedDate),
      setSelectedDate,
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
  if (context === undefined) throw new Error('useAppStore must be used within a StoreProvider');
  return context;
};
