import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, Trash2, Edit2, X } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export const Wallets: React.FC = () => {
  const { wallets, transactions, addWallet, editWallet, deleteWallet } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');

  // Long press logic
  const [activeActionsWallet, setActiveActionsWallet] = useState<string | null>(null);
  const pressTimer = useRef<any>(null);

  const startPress = (id: string) => {
    pressTimer.current = setTimeout(() => {
      setActiveActionsWallet(prev => prev === id ? null : id);
    }, 500); // 500ms long press
  };

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName) return;

    if (isEditing) {
      editWallet(isEditing, walletName);
    } else {
      const initialBalance = parseFloat(walletBalance.replace(',', '.')) || 0;
      addWallet({ name: walletName, initialBalance });
    }
    
    closeModal();
  };

  const openAddModal = () => {
    setIsEditing(null);
    setWalletName('');
    setWalletBalance('');
    setIsAdding(true);
  };

  const openEditModal = (id: string, name: string) => {
    setIsEditing(id);
    setWalletName(name);
    setIsAdding(true);
    setActiveActionsWallet(null);
  };

  const closeModal = () => {
    setIsAdding(false);
    setIsEditing(null);
  };

  const totalBalance = wallets.reduce((sum, a) => sum + getWalletBalance(a.id), 0);

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20 font-light">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Carteiras</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 p-2 px-4 rounded-[16px] bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:block font-medium">Nova Carteira</span>
        </button>
      </div>

      <Card className="p-8 gradient-card text-foreground rounded-[32px] overflow-hidden">
        <span className="text-foreground/80 font-medium uppercase tracking-wider text-xs mb-2 block relative z-10">Total nas Carteiras</span>
        <h2 className={"text-4xl font-medium tracking-tight relative z-10 " + (totalBalance < 0 ? 'text-[#d11a2a]' : 'text-foreground')}>
          R$ {totalBalance.toFixed(2).replace('.', ',')}
        </h2>
      </Card>

      <div className="flex flex-col gap-3 mt-4 relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm uppercase tracking-widest text-muted-foreground px-1">Minhas Fontes</h3>
          <span className="text-[10px] text-muted-foreground/60">(Segure para editar)</span>
        </div>
        
        {wallets.map((acc, i) => {
          const bal = getWalletBalance(acc.id);
          const showActions = activeActionsWallet === acc.id;

          return (
            <motion.div
              key={acc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card 
                className="relative overflow-hidden bg-card premium-shadow border border-border rounded-[24px] cursor-pointer select-none"
                onPointerDown={() => startPress(acc.id)}
                onPointerUp={cancelPress}
                onPointerLeave={cancelPress}
                onContextMenu={(e) => e.preventDefault()} // prevent context menu on mobile long press
              >
                <div className="p-5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[16px] bg-muted/40 flex items-center justify-center text-foreground border border-border/50">
                      <Wallet className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-sm tracking-wide">{acc.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className={"font-medium text-base tracking-tight " + (bal < 0 ? 'text-destructive' : 'text-foreground')}>
                      R$ {bal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Hidden Action Overlay */}
                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, x: '100%' }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: '100%' }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute inset-0 bg-background/95 backdrop-blur-md z-20 flex items-center justify-end px-5 gap-3"
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(acc.id, acc.name); }}
                        className="p-3 text-foreground hover:bg-muted rounded-full transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('Tem certeza que deseja apagar essa carteira?')) deleteWallet(acc.id);
                        }}
                        className="p-3 text-destructive hover:bg-destructive/5 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveActionsWallet(null); }}
                        className="p-3 text-muted-foreground hover:bg-muted rounded-full transition-colors ml-4"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {isAdding && (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[70] p-6 bg-card rounded-t-[32px] md:rounded-[32px] premium-shadow md:w-full md:max-w-md border border-border"
            >
              <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              
              <div className="flex justify-between items-center mb-6 mt-4 md:mt-0">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">
                  {isEditing ? 'Editar Carteira' : 'Nova Carteira'}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground ml-1">Nome da Carteira</label>
                  <Input
                    type="text"
                    placeholder="Ex: Uber, Cabelo, Banco X"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="h-14 text-sm font-medium bg-muted/40 border-border rounded-[20px]"
                  />
                </div>
                
                {!isEditing && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground ml-1">Saldo Inicial (Opcional)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-muted-foreground font-medium text-base">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={walletBalance}
                        onChange={(e) => setWalletBalance(e.target.value)}
                        className="pl-12 text-base font-medium h-14 w-full bg-muted/40 border-border rounded-[20px]"
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full mt-2 rounded-[20px] h-14" size="lg">
                  {isEditing ? 'Salvar Configurações' : 'Criar Carteira'}
                </Button>
              </form>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};
