import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Moon, Sun, ChevronLeft, ChevronRight, ArrowDownCircle, ArrowUpCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from './ui/card';
import { AddTransactionModal } from './AddTransactionModal';

export const Home: React.FC = () => {
  const { transactions, theme, setTheme } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  
  // Month Navigation State
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentMonthStr = useMemo(() => {
    return selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [selectedDate]);

  const changeMonth = (offset: number) => {
    setSelectedDate(prev => {
      const newD = new Date(prev);
      newD.setMonth(prev.getMonth() + offset);
      return newD;
    });
  };

  const { balance, income, expense, recentTransactions } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    
    // Filter transactions by selected month
    const currentMonthTxs = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === selectedDate.getMonth() && 
             txDate.getFullYear() === selectedDate.getFullYear();
    });

    currentMonthTxs.forEach(t => {
      if (t.type === 'income') {
        inc += t.amount;
      } else {
        exp += t.amount;
      }
    });

    // Recent 5
    const recent = [...currentMonthTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return { balance: inc - exp, income: inc, expense: exp, recentTransactions: recent };
  }, [transactions, selectedDate]);

  // Insights Logic
  const expensePercentage = income > 0 ? (expense / income) * 100 : 0;
  let insightMessage = "Suas finanças estão saudáveis. Você está economizando bem este mês!";
  let insightType: 'normal' | 'warning' | 'danger' = 'normal';

  if (expense > income && income > 0) {
    insightMessage = "Atenção: Seu saldo pode acabar antes do fim do mês.";
    insightType = 'danger';
  } else if (expensePercentage > 75) {
    insightMessage = "Você gastou mais do que o normal. " + Math.round(expensePercentage) + "% da receita já foi.";
    insightType = 'warning';
  } else if (expense === 0 && income === 0) {
    insightMessage = "Nenhuma movimentação neste mês ainda. Comece a registrar!";
    insightType = 'normal';
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="pb-28 px-5 pt-10 flex flex-col gap-8">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
            D
          </div>
          <div>
            <h2 className="text-sm text-muted-foreground font-medium">Olá, Dami</h2>
            <p className="font-semibold text-foreground tracking-tight">Suas finanças</p>
          </div>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors premium-shadow"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </motion.div>

      {/* Month Navigator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between bg-card premium-shadow border border-border rounded-full p-1"
      >
        <button onClick={() => changeMonth(-1)} className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium text-sm text-foreground capitalize tracking-wide">{currentMonthStr}</span>
        <button onClick={() => changeMonth(1)} className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Extreme Focus Balance */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex flex-col items-center text-center mt-2"
      >
        <span className="text-muted-foreground font-medium tracking-wide text-sm mb-2">Saldo em Contas</span>
        <h1 className="text-[3.5rem] leading-none font-bold tracking-tighter text-foreground mb-6">
          <span className="text-2xl mr-1 opacity-50 font-semibold align-top inline-block mt-2">R$</span>
          {balance.toFixed(2).replace('.', ',')}
        </h1>
        
        <div className="flex gap-4 w-full">
          <button 
            onClick={() => openModal('income')}
            className="flex-1 bg-card hover:bg-muted active:scale-95 transition-all border border-border premium-shadow rounded-[20px] p-4 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-success" strokeWidth={2.5}/>
            </div>
            <span className="text-sm font-semibold text-foreground">Receber</span>
          </button>
          
          <button 
            onClick={() => openModal('expense')}
            className="flex-1 bg-card hover:bg-muted active:scale-95 transition-all border border-border premium-shadow rounded-[20px] p-4 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-destructive" strokeWidth={2.5}/>
            </div>
            <span className="text-sm font-semibold text-foreground">Gastar</span>
          </button>
        </div>
      </motion.div>

      {/* Month Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
      >
        <Card className="p-1 flex divide-x divide-border">
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Entradas</span>
            <span className="text-lg font-bold text-success">R$ {income.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Saídas</span>
            <span className="text-lg font-bold text-foreground">R$ {expense.toFixed(2).replace('.', ',')}</span>
          </div>
        </Card>
      </motion.div>

      {/* Smart Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
      >
        <Card className={"p-5 flex items-start gap-4 transition-all duration-300 relative overflow-hidden " + (insightType === 'danger' ? 'bg-destructive/5 border-destructive/20' : insightType === 'warning' ? 'bg-amber-400/5 border-amber-400/20' : 'bg-primary/5 border-primary/20')}>
          <div className={"mt-0.5 " + (insightType === 'danger' ? 'text-destructive' : insightType === 'warning' ? 'text-amber-500' : 'text-primary')}>
            {insightType === 'normal' ? <Sparkles className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm mb-1">Insight Financeiro</h3>
            <p className={"text-sm leading-relaxed " + (theme === 'dark' ? 'text-muted-foreground' : 'text-foreground/80')}>
              {insightMessage}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
        className="flex flex-col gap-4"
      >
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-semibold text-foreground">Últimas Transações</h3>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-[24px]">
            Nenhum registro este mês.
          </div>
        ) : (
          <Card className="p-2 overflow-hidden">
            <ul className="flex flex-col">
              {recentTransactions.map((tx, idx) => (
                <li key={tx.id} className={"flex items-center justify-between p-4 " + (idx !== recentTransactions.length -1 ? "border-b border-border" : "")}>
                  <div className="flex items-center gap-4">
                    <div className={"w-12 h-12 rounded-[16px] flex items-center justify-center font-bold text-lg " + (tx.type === 'income' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                      {tx.type === 'income' ? '+' : (tx.category ? tx.category.charAt(0) : '-')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{tx.description}</span>
                      <span className="text-xs text-muted-foreground font-medium">{tx.type === 'income' ? 'Receita' : (tx.category || 'Despesa')}</span>
                    </div>
                  </div>
                  <span className={"font-bold " + (tx.type === 'income' ? 'text-success' : 'text-foreground')}>
                    {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </motion.div>

      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} defaultType={modalType} />
    </div>
  );
};
