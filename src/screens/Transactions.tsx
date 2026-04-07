import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useAppStore } from '../store';
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
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-8 max-w-4xl mx-auto w-full pb-28 select-none">
      {/* Header Section */}
      <div className="flex justify-between items-end pb-2 border-b border-border/40">
        <div className="flex flex-col gap-1">
           <h1 className="text-3xl font-black tracking-tighter text-foreground decoration-primary/20 underline-offset-8">HISTÓRICO</h1>
           <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-50">Sincronismo Global Ativo</span>
        </div>
        
        <div className="flex bg-muted/30 rounded-[28px] p-1.5 items-center border border-border/50">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-card text-muted-foreground transition-all active:scale-75">
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center px-4 w-32">
            <span className="text-[13px] font-black text-foreground capitalize tracking-widest">{monthName}</span>
            <span className="text-[9px] text-muted-foreground font-bold tracking-widest">{yearName}</span>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-card text-muted-foreground transition-all active:scale-75">
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => openModal('income')}
          className="group relative bg-success/5 hover:bg-success/10 active:scale-95 transition-all rounded-[32px] p-6 flex items-center justify-between border border-success/10 overflow-hidden"
        >
          <div className="flex flex-col gap-1 items-start text-left z-10">
             <span className="text-[10px] font-black text-success/60 uppercase tracking-widest">Nova Entrada</span>
             <span className="font-black text-success text-xl tracking-tight">RECEITA</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-success text-white flex items-center justify-center shadow-lg shadow-success/20 group-hover:rotate-12 transition-transform">
             <ArrowUpRight className="w-6 h-6" strokeWidth={3} />
          </div>
        </button>
        
        <button 
          onClick={() => openModal('expense')}
          className="group relative bg-destructive/5 hover:bg-destructive/10 active:scale-95 transition-all rounded-[32px] p-6 flex items-center justify-between border border-destructive/10 overflow-hidden"
        >
          <div className="flex flex-col gap-1 items-start text-left z-10">
             <span className="text-[10px] font-black text-destructive/60 uppercase tracking-widest">Novo Gasto</span>
             <span className="font-black text-destructive text-xl tracking-tight">DESPESA</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-destructive text-white flex items-center justify-center shadow-lg shadow-destructive/20 group-hover:-rotate-12 transition-transform">
             <ArrowDownRight className="w-6 h-6" strokeWidth={3} />
          </div>
        </button>
      </div>

      {/* Transactions Feed */}
      <div className="flex flex-col gap-10">
        {groupedTransactions.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-6 text-muted-foreground bg-muted/20 border-2 border-dashed border-border rounded-[48px]">
            <Layers className="w-12 h-12 opacity-10 animate-bounce" strokeWidth={1} />
            <div className="flex flex-col gap-1">
               <span className="text-sm font-black uppercase tracking-[0.2em] opacity-40 text-foreground">Sem Movimentação</span>
               <span className="text-[10px] font-medium opacity-60">Toque em Receita ou Despesa para começar</span>
            </div>
          </div>
        ) : (
          groupedTransactions.map(([date, txs], groupIdx) => (
            <div key={date} className="flex flex-col gap-6">
              {/* Day Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className={"w-2 h-2 rounded-full " + (isToday(date) ? "bg-primary shadow-[0_0_8px_rgba(209,26,42,0.5)]" : "bg-muted-foreground/30")} />
                    <span className={"text-[12px] font-black uppercase tracking-[0.4em] " + (isToday(date) ? "text-primary" : "text-muted-foreground opacity-70")}>
                    {isToday(date) ? "HOJE" : date}
                    </span>
                </div>
                <span className="text-[10px] font-black text-muted-foreground/40">{txs.length} ITENS</span>
              </div>

              {/* Transactions List within Day */}
              <div className="flex flex-col gap-1.5 px-1">
                {txs.map((tx, idx) => {
                  const isIncome = tx.type === 'income';
                  const walletName = wallets.find(w => w.id === tx.walletId)?.name || 'Carteira';
                  
                  return (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (groupIdx * 0.05) + (idx * 0.02) }}
                        className="relative group"
                    >
                        <div className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-[28px] hover:border-border hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className={"w-14 h-14 rounded-full flex items-center justify-center " + (isIncome ? 'bg-success text-white shadow-xl shadow-success/10' : 'bg-muted border border-border text-foreground')}>
                                    {isIncome ? <ArrowUpRight className="w-6 h-6" strokeWidth={3} /> : <ArrowDownRight className="w-6 h-6" strokeWidth={3} />}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-black text-[15px] tracking-tight text-foreground line-clamp-1">{tx.description}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg">
                                            <div className={"w-1 h-1 rounded-full " + (isIncome ? "bg-success" : "bg-primary")} />
                                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{tx.category || 'Outros'}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground/50 lowercase pl-1">{walletName}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end min-w-[100px]">
                                <span className={"font-black text-lg tracking-tighter " + (isIncome ? 'text-success' : 'text-foreground')}>
                                {isIncome ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                                </span>
                                <div className="flex items-center gap-1 opacity-20">
                                   <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                   <span className="text-[8px] font-black uppercase tracking-widest">{new Date(tx.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
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
