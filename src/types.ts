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
  autoDebit: boolean;
  recurrenceMonths?: number; // How many months total, undefined = infinite
  monthsProcessed?: number; // Internal counter
  walletId?: string; // Optional if autoDebit is false
}

export interface UserState {
  hasSeenWelcome: boolean;
  theme: Theme;
  wallets: WalletType[];
  transactions: Transaction[];
  scheduled: ScheduledTx[];
  selectedDate: string; // ISO String for persistence
}
