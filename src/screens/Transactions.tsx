import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { AddTransactionModal } from '../components/AddTransactionModal';

export const Transactions: React.FC = () => {
  const { transactions, wallets } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Acompanhar</h1>
        <div className="flex gap-2">
          <button className="p-2.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
            <Filter className="w-5 h-5" />
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

      <div className="flex flex-col gap-4 mt-4">
        {sortedTransactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-[32px]">
            Nenhuma movimentação registrada.
          </div>
        ) : (
          <Card className="p-2 overflow-hidden bg-card border-border rounded-[32px] premium-shadow">
            <ul className="flex flex-col">
              {sortedTransactions.map((tx, idx) => {
                const dateObj = new Date(tx.date);
                const isIncome = tx.type === 'income';
                const walletName = wallets.find(w => w.id === tx.walletId)?.name || 'Carteira Desconectada';
                
                return (
                  <li key={tx.id} className={"flex items-center justify-between p-4 " + (idx !== sortedTransactions.length - 1 ? "border-b border-border text-foreground" : "")}>
                    <div className="flex items-center gap-4">
                      <div className={"w-12 h-12 rounded-[16px] flex items-center justify-center " + (isIncome ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#da292e]/10 text-[#da292e]')}>
                        {isIncome ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm">{tx.description}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-semibold">{tx.category || 'Outros'}</span>
                          <span>•</span>
                          <span className="font-semibold">{walletName}</span>
                          <span>•</span>
                          <span>{dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
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
