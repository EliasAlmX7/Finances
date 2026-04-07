import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { motion } from 'framer-motion';

export const Transactions: React.FC = () => {
  const { transactions, wallets, selectedDate, setSelectedDate } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [visibleCount, setVisibleCount] = useState(20);

  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long' });
  const yearName = selectedDate.getFullYear();

  const changeMonth = (offset: number) => {
    const newD = new Date(selectedDate);
    newD.setMonth(selectedDate.getMonth() + offset);
    setSelectedDate(newD);
    setVisibleCount(20); // Reset pagination on month change
  };

  const groupedTransactions = useMemo(() => {
    const monthFiltered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });

    const groups: Record<string, typeof transactions> = {};
    
    monthFiltered
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, visibleCount)
      .forEach(tx => {
        const dateKey = new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(tx);
      });

    return { 
      groups: Object.entries(groups), 
      totalInMonth: monthFiltered.length 
    };
  }, [transactions, selectedDate, visibleCount]);

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    return dateStr === today;
  };

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-8 max-w-4xl mx-auto w-full pb-28 font-light select-none">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Extrato</h1>
        
        <div className="flex bg-card rounded-[24px] premium-shadow p-1.5 items-center border border-border">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="flex flex-col items-center px-4 w-28">
            <span className="text-[13px] font-medium text-foreground capitalize tracking-wide">{monthName}</span>
            <span className="text-[10px] text-muted-foreground">{yearName}</span>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => openModal('income')}
          className="bg-success/10 hover:bg-success/20 active:scale-95 transition-all text-success rounded-[24px] p-5 flex items-center justify-between border border-success/20"
        >
          <div className="flex flex-col text-left">
             <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Nova Entrada</span>
             <span className="font-semibold text-lg">Receita</span>
          </div>
          <ArrowUpRight className="w-6 h-6" strokeWidth={2.5} />
        </button>
        
        <button 
          onClick={() => openModal('expense')}
          className="bg-destructive/10 hover:bg-destructive/20 active:scale-95 transition-all text-destructive rounded-[24px] p-5 flex items-center justify-between border border-destructive/10"
        >
          <div className="flex flex-col text-left">
             <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Novo Gasto</span>
             <span className="font-semibold text-lg">Despesa</span>
          </div>
          <ArrowDownRight className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {groupedTransactions.groups.length === 0 ? (
          <div className="p-16 text-center text-xs font-medium text-muted-foreground bg-muted/20 border border-dashed border-border rounded-[32px]">
            Nenhuma transação encontrada para este mês.
          </div>
        ) : (
          groupedTransactions.groups.map(([date, txs]) => (
            <div key={date} className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-1 mb-1">
                <span className={"text-[10px] font-bold uppercase tracking-widest " + (isToday(date) ? "text-primary" : "text-muted-foreground/60")}>
                  {isToday(date) ? "Hoje" : date}
                </span>
                <div className="h-[1px] flex-1 bg-border/20" />
              </div>

              <div className="flex flex-col gap-2">
                {txs.map((tx, idx) => {
                  const isIncome = tx.type === 'income';
                  const walletName = wallets.find(w => w.id === tx.walletId)?.name || 'Carteira';
                  
                  return (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                    >
                        <div className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-[20px] premium-shadow">
                            <div className="flex items-center gap-4">
                                <div className={"w-11 h-11 rounded-[16px] flex items-center justify-center " + (isIncome ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                                    {isIncome ? <ArrowUpRight className="w-5 h-5" strokeWidth={2} /> : <ArrowDownRight className="w-5 h-5" strokeWidth={2} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground text-sm">{tx.description}</span>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                        <span className="font-semibold text-primary/70">{tx.category || 'Outros'}</span>
                                        <span>•</span>
                                        <span className="lowercase">{walletName}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                                <span className={"font-semibold text-base " + (isIncome ? 'text-success' : 'text-foreground')}>
                                {isIncome ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                                </span>
                                <span className="text-[9px] text-muted-foreground/40 font-medium">{new Date(tx.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {groupedTransactions.totalInMonth > visibleCount && (
            <button 
                onClick={() => setVisibleCount(prev => prev + 20)}
                className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all bg-muted/10 hover:bg-muted/30 rounded-[20px] border border-dashed border-border"
            >
                Carregar mais transações ({groupedTransactions.totalInMonth - visibleCount} restantes)
            </button>
        )}
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultType={modalType} />
    </div>
  );
};
