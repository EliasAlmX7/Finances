import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingDown, TrendingUp, ChevronLeft, ChevronRight, Activity, Calendar } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';

export const Reports: React.FC = () => {
  const { transactions } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthName = selectedDate.toLocaleDateString('pt-BR', { month: 'long' });
  const yearName = selectedDate.getFullYear();

  const changeMonth = (offset: number) => {
    setSelectedDate(prev => {
      const newD = new Date(prev);
      newD.setMonth(prev.getMonth() + offset);
      return newD;
    });
  };

  const { expensesByCategory, totalExpense, biggestCategory, incomeTotal, dailySpending } = useMemo(() => {
    const currentMonthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });

    const categories: Record<string, number> = {};
    const daily: Record<number, number> = {};
    let totalE = 0;
    let totalI = 0;

    currentMonthTxs.forEach(t => {
      const d = new Date(t.date);
      const day = d.getDate();
      
      if (t.type === 'expense') {
        const cat = t.category || 'Outros';
        categories[cat] = (categories[cat] || 0) + t.amount;
        daily[day] = (daily[day] || 0) + t.amount;
        totalE += t.amount;
      } else {
        totalI += t.amount;
      }
    });

    const sortedArray = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    const maxCat = sortedArray.length > 0 ? sortedArray[0] : null;
    const minCat = sortedArray.length > 0 ? sortedArray[sortedArray.length - 1] : null;

    const dailySorted = Object.entries(daily).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

    return {
      expensesByCategory: sortedArray,
      totalExpense: totalE,
      incomeTotal: totalI,
      biggestCategory: maxCat,
      smallestCategory: minCat,
      dailySpending: dailySorted
    };
  }, [transactions, selectedDate]);

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-8 max-w-4xl mx-auto w-full pb-28 font-light">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:hidden border-none m-0">Relatórios</h1>
        <div className="hidden md:block" />

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
        <Card className="p-5 flex flex-col bg-card border-border rounded-[24px] premium-shadow">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <TrendingDown className="w-4 h-4 text-[#d11a2a]" />
            <span className="text-xs uppercase tracking-widest font-medium">Saídas</span>
          </div>
          <span className="text-2xl font-medium tracking-tight text-foreground">
            R$ {totalExpense.toFixed(2).replace('.', ',')}
          </span>
        </Card>
        <Card className="p-5 flex flex-col bg-card border-border rounded-[24px] premium-shadow">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs uppercase tracking-widest font-medium">Entradas</span>
          </div>
          <span className="text-2xl font-medium tracking-tight text-foreground">
            R$ {incomeTotal.toFixed(2).replace('.', ',')}
          </span>
        </Card>
      </div>

      {expensesByCategory.length === 0 ? (
        <div className="p-10 text-center text-sm font-light text-muted-foreground border border-dashed border-border rounded-[32px] bg-muted/20">
          Você ainda não registrou nenhum gasto neste mês.
        </div>
      ) : (
        <React.Fragment>
          {/* Categories Chart */}
          <Card className="p-6 bg-card border-border rounded-[32px] premium-shadow flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Onde seu dinheiro foi</h3>
            </div>
            
            <div className="flex flex-col gap-5">
              {expensesByCategory.map(([cat, val], idx) => {
                const percentage = ((val / totalExpense) * 100).toFixed(1);
                return (
                  <motion.div 
                    key={cat} 
                    className="flex flex-col gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground">{cat}</span>
                      <span className="text-muted-foreground font-medium">R$ {val.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: percentage + '%' }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                        className="h-full bg-foreground rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground tracking-wider">{percentage}% do gasto total</span>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Daily Breakdown */}
          <Card className="p-6 bg-card border-border rounded-[32px] premium-shadow flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <Calendar className="w-5 h-5" strokeWidth={1.5} />
              <h3 className="text-sm font-medium uppercase tracking-widest">Gastos Dia a Dia</h3>
            </div>
            <div className="flex flex-col gap-3">
              {dailySpending.map(([day, val]) => (
                <div key={day} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                  <span className="text-sm text-foreground">Dia {day}</span>
                  <span className="text-sm font-medium text-destructive">R$ {val.toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Monthly Insights */}
          <Card className="p-6 bg-card border-border rounded-[32px] premium-shadow flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Insights de Consumo</h3>
            </div>
            {biggestCategory && (
              <div className="flex items-start gap-4 p-4 rounded-[20px] bg-muted/30 border border-border/50">
                <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Maior Despesa</span>
                  <span className="text-sm text-foreground leading-relaxed">
                    Você gastou mais em <strong className="font-semibold text-foreground">{biggestCategory[0]}</strong> neste mês (R$ {biggestCategory[1].toFixed(2).replace('.', ',')}). 
                    Representa {((biggestCategory[1] / totalExpense) * 100).toFixed(0)}% de todos os seus gastos.
                  </span>
                </div>
              </div>
            )}
          </Card>
        </React.Fragment>
      )}
    </div>
  );
};
