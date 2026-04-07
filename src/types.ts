export type Category = 'Alimentação' | 'Transporte' | 'Moradia' | 'Lazer' | 'Assinaturas' | 'Salário' | 'Outros';
export type TransactionType = 'income' | 'expense';
export type Theme = 'light' | 'dark';

export interface WalletType {
  id: string;
  name: string;
  initialBalance: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category?: Category;
  date: string; // ISO string 
  walletId?: string; // Optional for expenses
}

export interface ScheduledTx {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category?: Category;
  dayOfMonth: number;
  walletId?: string; // Optional for expenses
}

export interface UserState {
  hasSeenWelcome: boolean;
  theme: Theme;
  wallets: WalletType[];
  transactions: Transaction[];
  scheduled: ScheduledTx[];
}
