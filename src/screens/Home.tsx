import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowDownRight, ArrowUpRight, Calendar, History, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { AddTransactionModal } from '../components/AddTransactionModal';

export const Home: React.FC = () => {
  const { transactions, scheduled, wallets, selectedDate, setSelectedDate } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long' });
  const yearName = selectedDate.getFullYear();

  const changeMonth = (offset: number) => {
    const newD = new Date(selectedDate);
    newD.setMonth(selectedDate.getMonth() + offset);
    setSelectedDate(newD);
  };


  // Logic: SALDO REAL = (Saldo Inicial Carteiras + Todas Receitas - Todas Despesas) - Fixos Restantes
  const { balance, income, expense, expensesList, fixosList, fixosTotal } = useMemo(() => {
    let globalInc = 0;
    let globalExp = 0;
    let walletSeed = wallets.reduce((acc, w) => acc + w.initialBalance, 0);

    // Historical totals for actual wallet balance
    transactions.forEach(t => {
      if (t.type === 'income') globalInc += t.amount;
      else globalExp += t.amount;
    });

    const currentWalletBalance = walletSeed + globalInc - globalExp;

    // Monthly view stats (used for the mini stats under the balance)
    let monthInc = 0;
    let monthExp = 0;
    let fixosSum = 0;
    
    const currentMonthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });

    currentMonthTxs.forEach(t => {
      if (t.type === 'income') monthInc += t.amount;
      else monthExp += t.amount;
    });

    const expensesOnly = currentMonthTxs
      .filter(t => t.type === 'expense')
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Fixos: Summing remaining ones for the selected month view
    const activeScheduled = [...scheduled];
    activeScheduled.forEach(s => {
      if (s.type === 'expense') {
        fixosSum += s.amount;
      }
    });

    return { 
      balance: currentWalletBalance, // Mostra o dinheiro que realmente está nas carteiras
      income: monthInc, 
      expense: monthExp,
      expensesList: expensesOnly,
      fixosList: activeScheduled.filter(s => s.type === 'expense').sort((a,b) => a.dayOfMonth - b.dayOfMonth),
      fixosTotal: fixosSum
    };
  }, [transactions, scheduled, wallets, selectedDate]);

  const openAddModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const isDebt = balance < 0;

  // Mágico Insight
  let insightMessage = "Seu planejamento está saudável este mês. Bom trabalho!";
  if (isDebt) {
    insightMessage = "Atenção: Os seus gastos e fixos ultrapassaram as entradas previstas deste mês.";
  } else if ((expense + fixosTotal) / (income || 1) > 0.8) {
    insightMessage = "Cuidado. Você já comprometeu mais de 80% do seu orçamento mensal.";
  }

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-8 max-w-4xl mx-auto w-full pb-8 font-light">
      
      {/* Header Eleganza */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent border-none m-0">Minhas Finanças</h1>

        <div className="flex bg-card rounded-[24px] premium-shadow p-1.5 items-center border border-border w-fit">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="flex flex-col items-center px-4 w-32">
            <span className="text-[14px] font-medium text-foreground capitalize tracking-wide">{monthName}</span>
            <span className="text-[10px] text-muted-foreground">{yearName}</span>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>

      {/* Global Balance Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card className="flex flex-col p-8 gradient-card rounded-[32px] overflow-hidden transition-colors duration-500">
          
          <div className="flex flex-col relative z-10 w-full mb-8">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Wallet className="w-4 h-4 opacity-70" strokeWidth={1.5} />
              <span className="text-xs font-bold tracking-widest uppercase opacity-80">
                Saldo Atual (Carteiras)
              </span>
            </div>
            
            <h1 className={"text-5xl md:text-6xl font-bold tracking-tight mb-4 " + (isDebt ? 'text-[#d11a2a]' : 'text-foreground')}>
              R$ {balance.toFixed(2).replace('.', ',')}
            </h1>

            <div className="flex flex-col gap-1.5 opacity-60">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                Contas do Mês: <span className="text-success font-black">R$ {income.toFixed(2).replace('.', ',')}</span>
              </span>
              {fixosTotal > 0 && (
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                  Falta pagar: <span className="text-primary font-black">R$ {fixosTotal.toFixed(2).replace('.', ',')}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <button 
              onClick={() => openAddModal('expense')}
              className="flex-1 flex items-center justify-center gap-2 bg-[#d11a2a] hover:bg-[#b01321] text-white px-2 rounded-[20px] font-medium shadow-md shadow-[#d11a2a]/10 transition-all active:scale-95 h-14 text-sm"
            >
              <ArrowDownRight className="w-4 h-4" strokeWidth={2} />
              Nova Despesa
            </button>
            <button 
              onClick={() => openAddModal('income')}
              className="flex-1 flex items-center justify-center gap-2 bg-[#34c759] hover:bg-[#2ead4e] text-white px-2 rounded-[20px] font-medium shadow-md shadow-[#34c759]/10 transition-all active:scale-95 h-14 text-sm"
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
              Nova Receita
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Mágico Insight */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-4 p-5 bg-card border border-border rounded-[24px] premium-shadow">
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 shrink-0">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-medium text-foreground text-xs uppercase tracking-wider mb-0.5 opacity-60">Insight Mágico</h3>
            <p className="text-sm font-light leading-relaxed text-muted-foreground">
              {insightMessage}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Scheduled (Fixos) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4 px-1">
            <Calendar className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Custos Fixos</span>
          </div>

          {fixosList.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground bg-muted/40 rounded-[24px]">
              Nenhum fixo agendado.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
               {fixosList.map((tx) => (
                 <div key={tx.id} className="flex items-center justify-between p-4 bg-card rounded-[20px] border border-border premium-shadow">
                   <div className="flex items-center gap-3">
                     <div className="flex flex-col">
                       <span className="font-medium text-foreground text-sm">{tx.description}</span>
                       <span className="text-[10px] text-muted-foreground">Dia {tx.dayOfMonth}</span>
                     </div>
                   </div>
                   <span className="font-medium text-foreground text-sm tracking-tight">
                     - R$ {tx.amount.toFixed(2).replace('.', ',')}
                   </span>
                 </div>
               ))}
            </div>
          )}
        </motion.div>

        {/* Expenses Extras (Variables) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4 px-1">
            <History className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Custos Extras</span>
          </div>

          {expensesList.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground bg-muted/40 rounded-[24px]">
              Nenhum gasto extra neste mês.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
               {expensesList.map((tx) => {
                 const dateObj = new Date(tx.date);
                 return (
                   <div key={tx.id} className="flex items-center justify-between p-4 bg-card rounded-[20px] border border-border premium-shadow">
                     <div className="flex flex-col">
                       <span className="font-medium text-foreground text-sm">{tx.description}</span>
                       <span className="text-[10px] text-muted-foreground">
                         {dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                       </span>
                     </div>
                     <span className="font-medium text-foreground text-sm tracking-tight">
                       - R$ {tx.amount.toFixed(2).replace('.', ',')}
                     </span>
                   </div>
                 );
               })}
            </div>
          )}
        </motion.div>
      </div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultType={modalType} />
    </div>
  );
};
