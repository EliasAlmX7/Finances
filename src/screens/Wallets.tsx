import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, Trash2, X } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export const Wallets: React.FC = () => {
  const { wallets, transactions, addWallet, deleteWallet } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');

  const getWalletBalance = (walletId: string) => {
    const acc = wallets.find(a => a.id === walletId);
    if (!acc) return 0;
    
    let bal = acc.initialBalance;
    transactions.forEach(t => {
      if (t.walletId === walletId) {
        if (t.type === 'income') bal += t.amount;
        else bal -= t.amount;
      }
    });
    return bal;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName) return;
    const initialBalance = parseFloat(newWalletBalance.replace(',', '.')) || 0;
    addWallet({ name: newWalletName, initialBalance });
    setNewWalletName('');
    setNewWalletBalance('');
    setIsAdding(false);
  };

  const totalBalance = wallets.reduce((sum, a) => sum + getWalletBalance(a.id), 0);

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Carteiras</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 p-2 px-4 rounded-[16px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:block font-medium">Nova Carteira</span>
        </button>
      </div>

      {/* Global Box */}
      <Card className="p-8 gradient-card text-foreground border-none premium-shadow relative overflow-hidden rounded-[32px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <span className="text-foreground/80 font-medium uppercase tracking-wider text-xs mb-2 block relative z-10">Total nas Carteiras</span>
        <h2 className={"text-4xl font-medium tracking-tight relative z-10 " + (totalBalance < 0 ? 'text-[#d11a2a]' : 'text-foreground')}>
          R$ {totalBalance.toFixed(2).replace('.', ',')}
        </h2>
      </Card>

      <div className="flex flex-col gap-4 mt-4">
        <h3 className="font-medium text-sm uppercase tracking-widest text-muted-foreground mt-4">Minhas Fontes</h3>
        
        {wallets.map((acc, i) => {
          const bal = getWalletBalance(acc.id);
          return (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-5 flex items-center justify-between bg-card premium-shadow border border-border rounded-[24px]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-muted/60 flex items-center justify-center text-foreground">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-base tracking-wide">{acc.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right flex flex-col">
                    <span className={"font-bold text-lg " + (bal < 0 ? 'text-destructive' : 'text-foreground')}>
                      R$ {bal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      if(confirm('Tem certeza que deseja apagar essa carteira?')) {
                        deleteWallet(acc.id);
                      }
                    }}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isAdding && (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 p-8 bg-card rounded-t-[32px] md:rounded-[32px] premium-shadow md:w-full md:max-w-md"
            >
              <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              
              <div className="flex justify-between items-center mb-6 mt-2 md:mt-0">
                <h2 className="text-2xl font-bold text-foreground">Nova Carteira</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">Nome da Carteira</label>
                  <Input
                    type="text"
                    placeholder="Ex: Uber, Cabelo, Banco X"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="h-16 text-lg font-semibold bg-muted/50 rounded-[20px]"
                    autoFocus
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">Saldo Atual (Opcional)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-5 text-muted-foreground font-bold text-xl">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={newWalletBalance}
                      onChange={(e) => setNewWalletBalance(e.target.value)}
                      className="pl-14 text-xl font-bold h-16 w-full bg-muted/50 rounded-[20px]"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2 rounded-[20px]" size="lg">
                  Criar Carteira
                </Button>
              </form>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};
