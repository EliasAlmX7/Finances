import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Trash2, X, ChevronDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import type { TransactionType } from '../types';

export const Scheduled: React.FC = () => {
  const { scheduled, wallets, addScheduled, deleteScheduled } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState<string>('5');
  const [type, setType] = useState<TransactionType>('expense');
  const [walletId, setWalletId] = useState(wallets.length > 0 ? wallets[0].id : '');
  const [autoDebit, setAutoDebit] = useState(false);
  const [recurrenceLength, setRecurrenceLength] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amountStr) return;
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;
    const day = parseInt(dayOfMonth, 10);
    if (isNaN(day) || day < 1 || day > 31) return;

    if (autoDebit && wallets.length === 0) return;

    let recMonths: number | undefined = undefined;
    if (recurrenceLength) {
      recMonths = parseInt(recurrenceLength, 10);
      if (isNaN(recMonths) || recMonths <= 0) recMonths = undefined;
    }

    addScheduled({
      description,
      amount,
      type,
      category: type === 'expense' ? 'Assinaturas' : 'Salário',
      dayOfMonth: day,
      walletId: autoDebit ? walletId : undefined,
      autoDebit,
      recurrenceMonths: recMonths,
      monthsProcessed: 0
    });
    
    setDescription('');
    setAmountStr('');
    setDayOfMonth('5');
    setRecurrenceLength('');
    setAutoDebit(false);
    setIsAdding(false);
  };

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lançamentos Fixos</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 p-2 px-4 rounded-[16px] bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:block font-medium">Novo Fixo</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {scheduled.length === 0 ? (
          <div className="p-8 text-center text-sm font-light text-muted-foreground border border-dashed border-border rounded-[32px] bg-muted/20">
            Nenhum lançamento fixo agendado.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {scheduled.sort((a,b) => a.dayOfMonth - b.dayOfMonth).map((tx, idx) => {
              const isIncome = tx.type === 'income';
              const walletName = autoDebit && tx.walletId ? (wallets.find(w => w.id === tx.walletId)?.name || 'Carteira Apagada') : 'Manual';
              
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-5 flex items-center justify-between bg-card premium-shadow border border-border rounded-[24px]">
                    <div className="flex items-center gap-4">
                      <div className={"w-12 h-12 rounded-[16px] flex items-center justify-center " + (isIncome ? 'bg-success/5 text-success' : 'bg-primary/5 text-primary')}>
                        <Calendar className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground text-sm tracking-wide">{tx.description}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-medium opacity-80 uppercase tracking-widest">{tx.autoDebit ? walletName : 'S/ Débito'}</span>
                          <span>•</span>
                          <span className="font-semibold">Dia {tx.dayOfMonth}</span>
                          {tx.recurrenceMonths && (
                            <React.Fragment>
                              <span>•</span>
                              <span className="font-medium opacity-80">{tx.recurrenceMonths} meses</span>
                            </React.Fragment>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={"font-medium text-base tracking-tight " + (isIncome ? 'text-success' : 'text-foreground')}>
                        {isIncome ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                      </span>
                      <button 
                        onClick={() => {
                          if (confirm('Tem certeza que deseja apagar?')) {
                            deleteScheduled(tx.id);
                          }
                        }}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full transition-colors"
                      >
                       <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[70] p-6 pt-6 bg-card rounded-t-[32px] md:rounded-[32px] premium-shadow border border-border md:w-full md:max-w-md max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
              
              <div className="flex justify-between items-center mb-6 mt-4 md:mt-0">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Agendar Fixo</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="flex flex-col gap-5">
                
                <div className="flex gap-2 p-1.5 bg-muted/40 rounded-[20px] border border-border/50">
                  <button
                    type="button"
                    className={"flex-1 flex justify-center items-center gap-2 py-3 rounded-[16px] text-sm font-medium transition-all " + (type === 'expense' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80')}
                    onClick={() => setType('expense')}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Despesa
                  </button>
                  <button
                    type="button"
                    className={"flex-1 flex justify-center items-center gap-2 py-3 rounded-[16px] text-sm font-medium transition-all " + (type === 'income' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80')}
                    onClick={() => setType('income')}
                  >
                     <ArrowUpRight className="w-4 h-4" /> Receita
                  </button>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wide">Valor</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-muted-foreground font-medium text-lg">R$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                        className="pl-12 text-lg font-medium h-14 bg-muted/30 border-border rounded-[20px]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-28">
                    <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wide">Dia</label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(e.target.value)}
                      className="h-14 font-medium text-lg bg-muted/30 border-border rounded-[20px] text-center"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wide">Descrição</label>
                  <Input
                    type="text"
                    placeholder="Ex: Aluguel, Netflix..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-14 text-base font-light bg-muted/30 border-border rounded-[20px]"
                  />
                </div>

                {/* Recurrence Config */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wide">Recorrência (Opcional)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Quantos meses vai durar? (Em branco = infinito)"
                    value={recurrenceLength}
                    onChange={(e) => setRecurrenceLength(e.target.value)}
                    className="h-14 text-sm font-light bg-muted/30 border-border rounded-[20px]"
                  />
                </div>

                {/* Auto Debit Config */}
                <div className="flex flex-col gap-2 mt-2 bg-muted/20 p-4 rounded-[20px] border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Débito Automático?</span>
                    <button
                      type="button"
                      onClick={() => setAutoDebit(!autoDebit)}
                      className={"w-12 h-6 rounded-full transition-colors relative flex items-center px-1 " + (autoDebit ? "bg-success" : "bg-border")}
                    >
                      <motion.div
                        layout
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                        animate={{ x: autoDebit ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {autoDebit && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-2 overflow-hidden pt-2"
                      >
                        <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase tracking-wide">Descontar de qual carteira?</label>
                        <div className="relative">
                          <select
                            value={walletId}
                            onChange={(e) => setWalletId(e.target.value)}
                            className="w-full h-14 appearance-none rounded-[20px] bg-card px-4 py-2 text-sm border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 text-foreground font-medium"
                          >
                            {wallets.length === 0 && <option value="" disabled>Crie uma carteira primeiro</option>}
                            {wallets.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button type="submit" className="w-full mt-2 rounded-[20px] h-14" size="lg">
                  Salvar Fixo
                </Button>
              </form>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};
