import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowDownRight, ArrowUpRight, Calendar, History, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { AddTransactionModal } from '../components/AddTransactionModal';

export const Home: React.FC = () => {
  const { transactions, scheduled, selectedDate, setSelectedDate, addTransaction } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long' });
  const yearName = selectedDate.getFullYear();

  const changeMonth = (offset: number) => {
    const newD = new Date(selectedDate);
    newD.setMonth(selectedDate.getMonth() + offset);
    setSelectedDate(newD);
  };


  // Logic: Saldo do Mês = Receitas do Mês Selecionado - Despesas do Mês Selecionado
  const { balance, income, expense, expensesList, fixosList, fixosTotal, prevMonthBalance, hasCarriedOver } = useMemo(() => {
    let monthInc = 0;
    let monthExp = 0;
    let fixosSum = 0;

    const prevDate = new Date(selectedDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    let prevInc = 0;
    let prevExp = 0;
    
    let carriedOver = false;

    transactions.forEach(t => {
      const d = new Date(t.date);
      // Current Month
      if (d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear()) {
        if (t.type === 'income') monthInc += t.amount;
        else monthExp += t.amount;

        if (t.description.startsWith('💸 Saldo anterior')) {
           carriedOver = true;
        }
      }
      
      // Previous Month
      if (d.getMonth() === prevDate.getMonth() && d.getFullYear() === prevDate.getFullYear()) {
        if (t.type === 'income') prevInc += t.amount;
        else prevExp += t.amount;
      }
    });

    const expensesOnly = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === selectedDate.getMonth() && new Date(t.date).getFullYear() === selectedDate.getFullYear())
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Fixos: Summing remaining ones for the selected month view
    const activeScheduled = [...scheduled];
    activeScheduled.forEach(s => {
      if (s.type === 'expense') {
        fixosSum += s.amount;
      }
    });

    return { 
      balance: monthInc - monthExp,
      income: monthInc, 
      expense: monthExp,
      expensesList: expensesOnly,
      fixosList: activeScheduled.filter(s => s.type === 'expense').sort((a,b) => a.dayOfMonth - b.dayOfMonth),
      fixosTotal: fixosSum,
      prevMonthBalance: prevInc - prevExp,
      hasCarriedOver: carriedOver
    };
  }, [transactions, scheduled, selectedDate]);

  const openAddModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const isDebt = balance < 0;

  // Novo Mágico Insight mais inteligente
  let insightMessage = "Tudo tranquilo por aqui. Continue registrando seus gastos para uma análise mais precisa!";
  
  const today = new Date();
  const isCurrentMonth = selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear();
  const currentDay = today.getDate();
  const monthProgress = currentDay / 30; // approx

  if (isCurrentMonth) {
    if (expense > income && income > 0) {
      insightMessage = `Alerta vermelho 🚨 Suas despesas (R$ ${expense.toFixed(0)}) já ultrapassaram suas receitas do mês! Segure os gastos extras.`;
    } else if (expense + fixosTotal > income && income > 0) {
      insightMessage = "Atenção: Seus gastos extras somados aos seus custos fixos vão estourar o seu orçamento deste mês.";
    } else if (income > 0) {
      const spentRatio = expense / income;
      if (spentRatio > monthProgress + 0.2) {
        insightMessage = `Você já gastou ${(spentRatio * 100).toFixed(0)}% da sua renda, mas o mês ainda está no dia ${currentDay}. Cuidado com o ritmo!`;
      } else if (spentRatio < monthProgress - 0.1 && currentDay > 15) {
        insightMessage = `Que orgulho! 🌟 Passamos da metade do mês e você gastou apenas ${(spentRatio * 100).toFixed(0)}% do que ganhou.`;
      } else {
        insightMessage = "Seus gastos estão fluindo bem e dentro do planejado para esta época do mês.";
      }
    } else if (income === 0 && expense > 0) {
      insightMessage = "Você começou o mês gastando, mas ainda não registrou nenhuma receita. Lembre-se de adicionar suas entradas!";
    }
  } else {
    if (isDebt) {
      insightMessage = "Neste mês você fechou no vermelho. Use esse histórico para não repetir os mesmos erros.";
    } else if (balance > 0) {
      insightMessage = "Você fechou este mês no positivo! Um ótimo histórico de economia.";
    } else {
      insightMessage = "Mês sem muita movimentação ou o saldo terminou zerado.";
    }
  }

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-8 font-light">
      
      {/* Header Eleganza */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/40 bg-clip-text text-transparent border-none m-0">Olá, Dami!</h1>

        <div className="flex bg-card rounded-[20px] shadow-sm p-1 items-center border border-border w-fit">
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <div className="flex flex-col items-center px-3 w-28">
            <span className="text-[13px] font-semibold text-foreground capitalize tracking-wide">{monthName}</span>
            <span className="text-[10px] text-muted-foreground">{yearName}</span>
          </div>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
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
        <Card className="flex flex-col p-6 md:p-8 bg-card border-border rounded-[32px] overflow-hidden transition-colors duration-500 shadow-sm relative">
          
          <div className="flex flex-col relative z-10 w-full mb-6">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Wallet className="w-4 h-4 opacity-70" strokeWidth={1.5} />
              <span className="text-[11px] font-bold tracking-widest uppercase opacity-80">
                Saldo do Mês
              </span>
            </div>
            
            <h1 className={"font-bold tracking-tight mb-3 break-words " + (isDebt ? 'text-destructive ' : 'text-foreground ') + (balance.toString().length > 8 ? 'text-4xl' : 'text-5xl')}>
              R$ {balance.toFixed(2).replace('.', ',')}
            </h1>

            {prevMonthBalance > 0 && !hasCarriedOver && (
              <button 
                onClick={() => {
                   if (!confirm(`Puxar R$ ${prevMonthBalance.toFixed(2).replace('.', ',')} que sobraram do mês passado?`)) return;
                   const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                   const prevMonthName = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
                   addTransaction({
                      description: `💸 Saldo anterior de ${prevMonthName}`,
                      amount: prevMonthBalance,
                      type: 'income',
                      category: 'Outros',
                      date: firstDay.toISOString(),
                   });
                }}
                className="flex items-center gap-2 text-[11px] font-bold text-[#34c759] hover:text-[#2ead4e] transition-colors bg-[#34c759]/10 px-3 py-1.5 rounded-full w-fit mb-4 active:scale-95"
              >
                <ArrowDownRight className="w-3 h-3" strokeWidth={3} />
                +R$ {prevMonthBalance.toFixed(2).replace('.', ',')} de {new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })}
              </button>
            )}

            <div className="flex items-center gap-4 opacity-70 mt-1">
              <span className="text-[11px] text-muted-foreground font-semibold">
                Entrou: <span className="text-[#34c759]">R$ {income.toFixed(2).replace('.', ',')}</span>
              </span>
              {fixosTotal > 0 && (
                <span className="text-[11px] text-muted-foreground font-semibold">
                  Fixos: <span className="text-primary">R$ {fixosTotal.toFixed(2).replace('.', ',')}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 relative z-10">
            <button 
              onClick={() => openAddModal('expense')}
              className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 px-2 rounded-[20px] font-semibold transition-all active:scale-95 h-12 text-sm"
            >
              <ArrowDownRight className="w-4 h-4" strokeWidth={2.5} />
              Despesa
            </button>
            <button 
              onClick={() => openAddModal('income')}
              className="flex-1 flex items-center justify-center gap-2 bg-[#34c759]/10 text-[#34c759] hover:bg-[#34c759]/20 px-2 rounded-[20px] font-semibold transition-all active:scale-95 h-12 text-sm"
            >
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
              Receita
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Mágico Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-4 p-4 bg-muted/30 border border-border/50 rounded-[24px]">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" strokeWidth={2} />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-foreground text-[10px] uppercase tracking-widest mb-1 opacity-70">Insight Mágico</h3>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
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
                 <div key={tx.id} className="flex items-center justify-between p-4 bg-card rounded-[20px] border border-border/60 gap-4 hover:bg-muted/20 transition-colors">
                   <div className="flex items-center gap-3 flex-1 min-w-0">
                     <div className="flex flex-col flex-1 min-w-0">
                       <span className="font-semibold text-foreground text-sm truncate">{tx.description}</span>
                       <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Dia {tx.dayOfMonth}</span>
                     </div>
                   </div>
                   <span className="font-bold text-foreground text-sm tracking-tight shrink-0">
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
                   <div key={tx.id} className="flex items-center justify-between p-4 bg-card rounded-[20px] border border-border/60 gap-4 hover:bg-muted/20 transition-colors">
                     <div className="flex flex-col flex-1 min-w-0">
                       <span className="font-semibold text-foreground text-sm truncate">{tx.description}</span>
                       <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                         {dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                       </span>
                     </div>
                     <span className="font-bold text-foreground text-sm tracking-tight shrink-0">
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
