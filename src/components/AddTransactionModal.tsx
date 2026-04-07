import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAppStore } from '../store';
import type { TransactionType } from '../types';
import { X, ChevronDown } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, defaultType = 'expense' }) => {
  const [amountStr, setAmountStr] = useState('');
  // Expense fields
  const [description, setDescription] = useState('');
  // Income fields
  const [walletId, setWalletId] = useState('');
  
  const [type, setType] = useState<TransactionType>(defaultType);
  const { wallets, addTransaction } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      if (wallets.length > 0 && !walletId) {
        setWalletId(wallets[0].id);
      }
    }
  }, [isOpen, defaultType, wallets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    if (type === 'expense') {
      if (!description) return;
      addTransaction({
        description,
        amount,
        type: 'expense'
      });
    } else {
      if (!walletId) return;
      const targetWallet = wallets.find(w => w.id === walletId);
      addTransaction({
        description: targetWallet ? `Receita de ${targetWallet.name}` : 'Nova Receita',
        amount,
        type: 'income',
        walletId
      });
    }
    
    setDescription('');
    setAmountStr('');
    onClose();
  };

  const isExpense = type === 'expense';

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[70] p-6 bg-card rounded-t-[32px] md:rounded-[32px] shadow-2xl md:w-full md:max-w-md border border-border"
          >
            <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
            
            <div className="flex justify-between items-center mb-6 mt-4 md:mt-0">
              <h2 className="text-xl font-medium text-foreground tracking-tight">
                {isExpense ? 'Nova Despesa' : 'Nova Receita'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div className="flex gap-2 p-1.5 bg-muted/30 rounded-[20px] border border-border/50">
                <button
                  type="button"
                  className={"flex-1 py-3 rounded-[16px] text-sm font-semibold transition-all " + (isExpense ? 'bg-destructive text-white shadow-md' : 'text-muted-foreground hover:bg-muted/50')}
                  onClick={() => setType('expense')}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  className={"flex-1 py-3 rounded-[16px] text-sm font-semibold transition-all " + (!isExpense ? 'bg-success text-white shadow-md' : 'text-muted-foreground hover:bg-muted/50')}
                  onClick={() => setType('income')}
                >
                  Receita
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">Valor</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-muted-foreground font-medium text-lg">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="pl-12 text-2xl font-medium h-16 w-full bg-card rounded-[20px] border border-border focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>
              </div>

              {isExpense ? (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground ml-1">Descrição</label>
                  <Input
                    type="text"
                    placeholder="Com o que você gastou?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-16 text-base font-light w-full bg-card rounded-[20px] border border-border focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground ml-1">Fonte / Carteira</label>
                  <div className="relative">
                    <select
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      className="w-full h-16 appearance-none rounded-[20px] bg-card px-4 py-2 text-base border border-border focus:ring-2 focus:ring-primary/20 text-foreground font-semibold"
                    >
                      {wallets.length === 0 && <option value="" disabled>Crie uma carteira primeiro</option>}
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" className="w-full rounded-[20px] h-14 font-semibold text-lg" size="lg" disabled={!isExpense && wallets.length === 0}>
                  Registrar
                </Button>
              </div>
            </form>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
