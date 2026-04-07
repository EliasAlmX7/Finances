import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAppStore } from '../store';
import type { TransactionType, Category } from '../types';
import { X, ChevronDown, Tag } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

const CATEGORIES: Category[] = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Assinaturas', 'Outros'];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, defaultType = 'expense' }) => {
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState('');
  const [category, setCategory] = useState<Category>('Outros');
  
  const [type, setType] = useState<TransactionType>(defaultType);
  const { wallets, addTransaction } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      if (wallets.length > 0 && !walletId) {
        setWalletId(wallets[0].id);
      }
    }
  }, [isOpen, defaultType, wallets, walletId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    if (type === 'expense') {
      if (!description) return;
      addTransaction({
        description,
        amount,
        type: 'expense',
        category
      });
    } else {
      if (!walletId) return;
      const targetWallet = wallets.find(w => w.id === walletId);
      addTransaction({
        description: targetWallet ? `Receita de ${targetWallet.name}` : 'Nova Receita',
        amount,
        type: 'income',
        walletId,
        category: 'Salário'
      });
    }
    
    setDescription('');
    setAmountStr('');
    setCategory('Outros');
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
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[70] p-6 bg-card rounded-t-[40px] md:rounded-[32px] shadow-2xl md:w-full md:max-w-md border border-border"
          >
            <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted-foreground/20 rounded-full" />
            
            <div className="flex justify-between items-center mb-6 mt-4 md:mt-0">
              <h2 className="text-xl font-semibold text-foreground tracking-tight">
                {isExpense ? 'Nova Despesa' : 'Nova Receita'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 overflow-y-auto max-h-[80vh] no-scrollbar">
              
              <div className="flex gap-2 p-1.5 bg-muted/30 rounded-[24px] border border-border/50">
                <button
                  type="button"
                  className={"flex-1 py-3 rounded-[18px] text-sm font-semibold transition-all " + (isExpense ? 'bg-destructive text-white shadow-md' : 'text-muted-foreground hover:bg-muted/50')}
                  onClick={() => setType('expense')}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  className={"flex-1 py-3 rounded-[18px] text-sm font-semibold transition-all " + (!isExpense ? 'bg-[#34c759] text-white shadow-md' : 'text-muted-foreground hover:bg-muted/50')}
                  onClick={() => setType('income')}
                >
                  Receita
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Quanto?</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-muted-foreground font-semibold text-lg">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="pl-12 text-2xl font-semibold h-16 w-full bg-muted/20 rounded-[24px] border border-border focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {isExpense && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Onde / Categoria</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full h-16 appearance-none rounded-[24px] bg-muted/20 px-12 py-2 text-base border border-border focus:ring-4 focus:ring-primary/10 text-foreground font-medium outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{isExpense ? 'Descrição' : 'Carteira de Destino'}</label>
                {isExpense ? (
                  <Input
                    type="text"
                    placeholder="Ex: McDonald's, Aluguel..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-16 text-base font-medium w-full bg-muted/20 rounded-[24px] border border-border focus:ring-4 focus:ring-primary/10"
                  />
                ) : (
                  <div className="relative">
                    <select
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      className="w-full h-16 appearance-none rounded-[24px] bg-muted/20 px-4 py-2 text-base border border-border focus:ring-4 focus:ring-primary/10 text-foreground font-medium outline-none"
                    >
                      {wallets.length === 0 && <option value="" disabled>Crie uma carteira primeiro</option>}
                      {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                )}
              </div>

              <div className="pt-2 mb-2">
                <Button type="submit" className="w-full rounded-[24px] h-16 font-bold text-lg shadow-xl shadow-primary/10" size="lg" disabled={!isExpense && wallets.length === 0}>
                  Salvar {isExpense ? 'Gasto' : 'Receita'}
                </Button>
              </div>
            </form>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
