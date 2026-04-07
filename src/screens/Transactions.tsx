import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { AddTransactionModal } from '../components/AddTransactionModal';

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

  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
  });

  const sortedTransactions = [...currentMonthTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-28">
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

      <div className="flex gap-4">
        <button 
          onClick={() => openModal('income')}
          className="flex-1 bg-[#34c759]/10 hover:bg-[#34c759]/20 active:scale-95 transition-all text-[#34c759] rounded-[24px] p-4 flex justify-center items-center gap-2 font-bold"
        >
          <ArrowUpRight className="w-5 h-5" />
          Receitas
        </button>
        
        <button 
          onClick={() => openModal('expense')}
          className="flex-1 bg-[#da292e]/10 hover:bg-[#da292e]/20 active:scale-95 transition-all text-[#da292e] rounded-[24px] p-4 flex justify-center items-center gap-2 font-bold"
        >
          <ArrowDownRight className="w-5 h-5" />
          Despesas
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {sortedTransactions.length === 0 ? (
          <div className="p-12 text-center text-xs font-medium text-muted-foreground bg-muted/20 border border-dashed border-border rounded-[32px]">
            Nenhuma transação encontrada para este mês.
          </div>
        ) : (
          <Card className="p-2 overflow-hidden bg-card border border-border rounded-[32px] premium-shadow">
            <ul className="flex flex-col">
              {sortedTransactions.map((tx, idx) => {
                const dateObj = new Date(tx.date);
                const isIncome = tx.type === 'income';
                const walletName = wallets.find(w => w.id === tx.walletId)?.name || 'Carteira';
                
                return (
                  <li key={tx.id} className={"flex items-center justify-between p-4 " + (idx !== sortedTransactions.length - 1 ? "border-b border-border text-foreground" : "")}>
                    <div className="flex items-center gap-4">
                      <div className={"w-12 h-12 rounded-[18px] flex items-center justify-center " + (isIncome ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#da292e]/10 text-[#da292e]')}>
                        {isIncome ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm tracking-tight">{tx.description}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-bold bg-muted px-1.5 py-0.5 rounded uppercase tracking-tighter">{tx.category || 'Outros'}</span>
                          <span>•</span>
                          <span className="font-medium">{walletName}</span>
                          <span>•</span>
                          <span className="font-medium">{dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                    <span className={"font-bold text-lg " + (isIncome ? 'text-[#34c759]' : 'text-foreground')}>
                      {isIncome ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultType={modalType} />
    </div>
  );
};
