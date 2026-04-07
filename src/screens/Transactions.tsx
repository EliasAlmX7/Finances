import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { motion } from 'framer-motion';

export const Transactions: React.FC = () => {
  const { transactions, wallets, selectedDate, setSelectedDate } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long' });
  const yearName = selectedDate.getFullYear();

  const changeMonth = (offset: number) => {
    const newD = new Date(selectedDate);
    newD.setMonth(selectedDate.getMonth() + offset);
    setSelectedDate(newD);
  };

  const groupedTransactions = useMemo(() => {
    const monthFiltered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });

    const groups: Record<string, typeof transactions> = {};
    
    monthFiltered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(tx => {
      const dateKey = new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });

    return Object.entries(groups);
  }, [transactions, selectedDate]);

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    return dateStr === today;
  };

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-8 max-w-4xl mx-auto w-full pb-28">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
           <h1 className="text-2xl font-bold tracking-tight text-foreground">Extrato Mensal</h1>
           <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">Histórico de Atividades</span>
        </div>
        
        <div className="flex bg-card rounded-[24px] premium-shadow p-1.5 items-center border border-border">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="flex flex-col items-center px-4 w-28">
            <span className="text-[13px] font-bold text-foreground capitalize tracking-wide">{monthName}</span>
            <span className="text-[10px] text-muted-foreground font-medium">{yearName}</span>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => openModal('income')}
          className="flex-1 bg-success/10 hover:bg-success/20 active:scale-95 transition-all text-success rounded-[28px] p-5 flex flex-col items-center gap-2 border border-success/20"
        >
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
             <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">Receita</span>
        </button>
        
        <button 
          onClick={() => openModal('expense')}
          className="flex-1 bg-destructive/10 hover:bg-destructive/20 active:scale-95 transition-all text-destructive rounded-[28px] p-5 flex flex-col items-center gap-2 border border-destructive/20"
        >
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
             <ArrowDownRight className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">Despesa</span>
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {groupedTransactions.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-4 text-muted-foreground bg-muted/20 border-2 border-dashed border-border rounded-[40px]">
            <Hash className="w-10 h-10 opacity-20" strokeWidth={1} />
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Nenhum registro encontrado</span>
          </div>
        ) : (
          groupedTransactions.map(([date, txs], groupIdx) => (
            <div key={date} className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-1">
                <span className={"text-[11px] font-black uppercase tracking-[0.2em] " + (isToday(date) ? "text-primary" : "text-muted-foreground opacity-50")}>
                  {isToday(date) ? "Hoje" : date}
                </span>
                <div className="h-[1px] flex-1 bg-border/40" />
              </div>

              <div className="flex flex-col gap-3">
                {txs.map((tx, idx) => {
                  const isIncome = tx.type === 'income';
                  const walletName = wallets.find(w => w.id === tx.walletId)?.name || 'Carteira';
                  
                  return (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (groupIdx * 0.1) + (idx * 0.05) }}
                    >
                        <Card className="p-4 flex items-center justify-between bg-card border border-border/60 rounded-[28px] premium-shadow hover:bg-muted/30 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                            <div className={"w-12 h-12 rounded-[20px] flex items-center justify-center shadow-sm " + (isIncome ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                                {isIncome ? <ArrowUpRight className="w-6 h-6" strokeWidth={2.5} /> : <ArrowDownRight className="w-6 h-6" strokeWidth={2.5} />}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-foreground text-[15px] tracking-tight">{tx.description}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black bg-muted px-2 py-0.5 rounded-full uppercase text-muted-foreground tracking-tighter">{tx.category || 'Outros'}</span>
                                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                                    <span className="text-[10px] font-bold text-muted-foreground lowercase">{walletName}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                            <span className={"font-black text-lg tracking-tight " + (isIncome ? 'text-success' : 'text-foreground')}>
                            {isIncome ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Confirmado</span>
                        </div>
                        </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultType={modalType} />
    </div>
  );
};
