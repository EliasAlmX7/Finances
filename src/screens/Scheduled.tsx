import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Trash2, X, ChevronDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import type { TransactionType } from '../types';

export const Scheduled: React.FC = () => {
  const { scheduled, wallets, addScheduled, deleteScheduled } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState<string>('5');
  const [type, setType] = useState<TransactionType>('expense');
  const [walletId, setWalletId] = useState(wallets.length > 0 ? wallets[0].id : '');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amountStr || !walletId) return;
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;
    const day = parseInt(dayOfMonth, 10);
    if (isNaN(day) || day < 1 || day > 31) return;

    addScheduled({
      description,
      amount,
      type,
      category: type === 'expense' ? 'Assinaturas' : 'Salário',
      dayOfMonth: day,
      walletId
    });
    
    setDescription('');
    setAmountStr('');
    setDayOfMonth('5');
    setIsAdding(false);
  };

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lançamentos Fixos</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 p-2 px-4 rounded-[16px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:block">Novo Fixo</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {scheduled.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-[32px]">
            Nenhum lançamento fixo agendado.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {scheduled.sort((a,b) => a.dayOfMonth - b.dayOfMonth).map((tx, idx) => {
              const isIncome = tx.type === 'income';
              const walletName = wallets.find(w => w.id === tx.walletId)?.name || 'Carteira Desaparecida';
              
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-5 flex items-center justify-between bg-card premium-shadow border border-border rounded-[24px]">
                    <div className="flex items-center gap-4">
                      <div className={"w-12 h-12 rounded-[16px] flex items-center justify-center " + (isIncome ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm tracking-wide">{tx.description}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-semibold uppercase tracking-wider">{walletName}</span>
                          <span>•</span>
                          <span className="font-bold">Dia {tx.dayOfMonth}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={"font-bold text-lg " + (isIncome ? 'text-success' : 'text-foreground')}>
                        {isIncome ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                      </span>
                      <button 
                        onClick={() => {
                          if (confirm('Tem certeza que deseja apagar?')) {
                            deleteScheduled(tx.id);
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
        )}
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
                <h2 className="text-2xl font-bold text-foreground">Agendar Fixo</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="flex flex-col gap-5">
                
                <div className="flex gap-2 p-1.5 bg-muted rounded-[24px]">
                  <button
                    type="button"
                    className={"flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-sm font-bold transition-all " + (type === 'expense' ? 'bg-background text-foreground shadow-sm premium-shadow' : 'text-muted-foreground hover:text-foreground/80')}
                    onClick={() => setType('expense')}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Despesa
                  </button>
                  <button
                    type="button"
                    className={"flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-sm font-bold transition-all " + (type === 'income' ? 'bg-background text-foreground shadow-sm premium-shadow' : 'text-muted-foreground hover:text-foreground/80')}
                    onClick={() => setType('income')}
                  >
                     <ArrowUpRight className="w-4 h-4" /> Receita
                  </button>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Valor</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-muted-foreground font-bold text-lg">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                        className="pl-12 text-lg font-bold h-14 bg-muted/50 rounded-[20px]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-28">
                    <label className="text-sm font-bold text-muted-foreground ml-1">Dia</label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(e.target.value)}
                      className="h-14 font-bold text-lg bg-muted/50 rounded-[20px] text-center"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">Descrição</label>
                  <Input
                    type="text"
                    placeholder="Ex: Aluguel, Netflix, Salário..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-14 text-lg font-semibold bg-muted/50 rounded-[20px]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-muted-foreground ml-1">Carteira</label>
                  <div className="relative">
                    <select
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      className="w-full h-14 appearance-none rounded-[20px] bg-muted/50 px-4 py-2 text-base border border-transparent focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 text-foreground font-bold"
                    >
                      {wallets.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2 rounded-[20px]" size="lg">
                  Salvar Fixo
                </Button>
              </form>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};
