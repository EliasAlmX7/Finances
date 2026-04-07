import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, TrendingDown, TrendingUp, ChevronLeft, ChevronRight, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';

export const Reports: React.FC = () => {
  const { transactions, selectedDate, setSelectedDate } = useAppStore();
  
  // Drill-down state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long' });
  const yearName = selectedDate.getFullYear();

  const changeMonth = (offset: number) => {
    const newD = new Date(selectedDate);
    newD.setMonth(selectedDate.getMonth() + offset);
    setSelectedDate(newD);
    setSelectedCategory(null);
  };

  const { expensesByCategory, totalExpense, incomeTotal, currentMonthTxs } = useMemo(() => {
    const monthFiltered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });

    const categories: Record<string, number> = {};
    let totalE = 0;
    let totalI = 0;

    monthFiltered.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'Outros';
        categories[cat] = (categories[cat] || 0) + t.amount;
        totalE += t.amount;
      } else {
        totalI += t.amount;
      }
    });

    const sortedArray = Object.entries(categories).sort((a, b) => b[1] - a[1]);

    return {
      expensesByCategory: sortedArray,
      totalExpense: totalE,
      incomeTotal: totalI,
      currentMonthTxs: monthFiltered
    };
  }, [transactions, selectedDate]);

  const drillingTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return currentMonthTxs.filter(t => (t.category || 'Outros') === selectedCategory);
  }, [selectedCategory, currentMonthTxs]);

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-8 max-w-4xl mx-auto w-full pb-28 font-light">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Relatórios</h1>

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
        <Card className="p-5 flex flex-col bg-card border-border rounded-[28px] premium-shadow border-l-4 border-l-[#d11a2a]">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <TrendingDown className="w-4 h-4 text-[#d11a2a]" />
            <span className="text-xs uppercase tracking-widest font-bold opacity-60">Saídas</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            R$ {totalExpense.toFixed(2).replace('.', ',')}
          </span>
        </Card>
        <Card className="p-5 flex flex-col bg-card border-border rounded-[28px] premium-shadow border-l-4 border-l-[#34c759]">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-[#34c759]" />
            <span className="text-xs uppercase tracking-widest font-bold opacity-60">Entradas</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            R$ {incomeTotal.toFixed(2).replace('.', ',')}
          </span>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <PieChart className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Onde você gasta mais</span>
        </div>

        {expensesByCategory.length === 0 ? (
          <div className="p-12 text-center text-xs font-medium text-muted-foreground bg-muted/20 border border-dashed border-border rounded-[32px]">
            Nenhum gasto registrado neste mês para análise.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
             {expensesByCategory.map(([cat, val], idx) => {
               const percentage = ((val / (totalExpense || 1)) * 100).toFixed(0);
               return (
                 <motion.div
                   key={cat}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   onClick={() => setSelectedCategory(cat)}
                 >
                   <Card className="p-5 flex items-center justify-between bg-card border border-border rounded-[24px] premium-shadow cursor-pointer hover:bg-muted/30 transition-all active:scale-[0.98]">
                     <div className="flex flex-col gap-1 w-full mr-4">
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-sm font-semibold text-foreground tracking-wide">{cat}</span>
                         <span className="text-xs font-bold text-muted-foreground">{percentage}%</span>
                       </div>
                       <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: percentage + '%' }}
                           className="h-full bg-foreground rounded-full"
                         />
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="text-sm font-bold text-foreground whitespace-nowrap">
                         R$ {val.toFixed(2).replace('.', ',')}
                       </span>
                       <ArrowRight className="w-4 h-4 text-muted-foreground opacity-30" />
                     </div>
                   </Card>
                 </motion.div>
               );
             })}
          </div>
        )}
      </div>

      {/* Drill-down Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <React.Fragment>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCategory(null)} />
            <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[110] bg-card rounded-t-[40px] md:rounded-[32px] p-6 premium-shadow border border-border max-h-[80vh] overflow-hidden flex flex-col md:w-full md:max-w-md">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Detalhamento</span>
                  <h3 className="text-xl font-bold text-foreground">{selectedCategory}</h3>
                </div>
                <button onClick={() => setSelectedCategory(null)} className="p-3 bg-muted rounded-full text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-6">
                {drillingTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                  <div key={t.id} className="flex justify-between items-center p-4 rounded-[20px] bg-muted/20 border border-border">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{t.description}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">{new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">R$ {t.amount.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};
