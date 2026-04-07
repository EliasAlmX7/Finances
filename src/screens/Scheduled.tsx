import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, ChevronDown, Tag } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import type { Category } from '../types';

const CATEGORIES: Category[] = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Assinaturas', 'Salário', 'Outros'];

export const Scheduled: React.FC = () => {
  const { scheduled, wallets, addScheduled, editScheduled, deleteScheduled } = useAppStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeActionsId, setActiveActionsId] = useState<string | null>(null);
  const pressTimer = useRef<any>(null);

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Category>('Outros');
  const [autoDebit, setAutoDebit] = useState(false);
  const [walletId, setWalletId] = useState('');
  const [recurrenceMonths, setRecurrenceMonths] = useState<string>('');

  const startPress = (id: string) => {
    pressTimer.current = setTimeout(() => {
      setActiveActionsId(prev => prev === id ? null : id);
    }, 500);
  };

  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(',', '.'));
    const day = parseInt(dayOfMonth);
    if (!description || isNaN(amount) || isNaN(day)) return;

    const data = {
      description,
      amount,
      dayOfMonth: day,
      type,
      category,
      autoDebit,
      walletId: autoDebit ? walletId : undefined,
      recurrenceMonths: recurrenceMonths ? parseInt(recurrenceMonths) : undefined,
    };

    if (editingId) {
      editScheduled({ ...data, id: editingId });
    } else {
      addScheduled(data);
    }
    
    closeModal();
  };

  const openAddModal = () => {
    setEditingId(null);
    setDescription('');
    setAmountStr('');
    setDayOfMonth('1');
    setType('expense');
    setCategory('Outros');
    setAutoDebit(false);
    setRecurrenceMonths('');
    if (wallets.length > 0) setWalletId(wallets[0].id);
    setIsAdding(true);
  };

  const openEditModal = (s: any) => {
    setEditingId(s.id);
    setDescription(s.description);
    setAmountStr(s.amount.toString());
    setDayOfMonth(s.dayOfMonth.toString());
    setType(s.type);
    setCategory(s.category || 'Outros');
    setAutoDebit(s.autoDebit || false);
    setWalletId(s.walletId || (wallets.length > 0 ? wallets[0].id : ''));
    setRecurrenceMonths(s.recurrenceMonths?.toString() || '');
    setIsAdding(true);
    setActiveActionsId(null);
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-20 font-light select-none">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Custos Fixos</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 p-2 px-4 rounded-[16px] bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Novo Fixo</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {scheduled.map((s, i) => {
          const showActions = activeActionsId === s.id;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onPointerDown={() => startPress(s.id)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              className="relative"
            >
              <Card className="p-5 flex items-center justify-between bg-card border border-border rounded-[24px] premium-shadow cursor-pointer overflow-hidden transition-all active:scale-[0.98] select-none">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground tracking-wide">{s.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Dia {s.dayOfMonth}</span>
                    <span className="text-[9px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-bold">{s.category || 'Outros'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={"text-base font-semibold " + (s.type === 'expense' ? 'text-foreground' : 'text-success')}>
                    {s.type === 'expense' ? '-' : '+'} R$ {s.amount.toFixed(2).replace('.', ',')}
                  </span>
                  {s.autoDebit && <span className="text-[8px] text-success/70 font-bold uppercase tracking-tighter">Débito Automático</span>}
                </div>

                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, x: '100%' }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: '100%' }}
                      className="absolute inset-0 bg-background/95 backdrop-blur-md z-20 flex items-center justify-end px-5 gap-3"
                    >
                      <button onClick={() => openEditModal(s)} className="p-3 text-foreground bg-muted hover:bg-muted/80 rounded-full transition-colors"><Edit2 className="w-5 h-5" /></button>
                      <button 
                        onClick={() => { if(confirm('Excluir este lançamento fixo?')) deleteScheduled(s.id); }}
                        className="p-3 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => setActiveActionsId(null)} className="p-3 text-muted-foreground ml-4"><X className="w-5 h-5" /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isAdding && (
          <React.Fragment>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[70] p-6 bg-card rounded-t-[32px] md:rounded-[32px] premium-shadow md:w-full md:max-w-md border border-border max-h-[90vh] overflow-y-auto no-scrollbar">
              <h2 className="text-xl font-semibold text-foreground mb-6">{editingId ? 'Editar Lançamento' : 'Novo Lançamento Fixo'}</h2>
              
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div className="flex gap-2 p-1.5 bg-muted/40 rounded-[20px]">
                  <button type="button" onClick={() => setType('expense')} className={"flex-1 py-3 h-12 rounded-[16px] text-sm font-semibold transition-all " + (type === 'expense' ? 'bg-[#d11a2a] text-white' : 'text-muted-foreground')}>Despesa</button>
                  <button type="button" onClick={() => setType('income')} className={"flex-1 py-3 h-12 rounded-[16px] text-sm font-semibold transition-all " + (type === 'income' ? 'bg-success text-white' : 'text-muted-foreground')}>Receita</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Valor</label>
                    <Input type="number" step="0.01" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} className="h-14 font-medium" placeholder="0,00" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Dia do Mês</label>
                    <Input type="number" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className="h-14 font-medium" placeholder="Ex: 5" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Categoria</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                      className="w-full h-14 appearance-none rounded-[16px] bg-muted/30 px-10 border border-border text-sm font-medium outline-none"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Nome / Descrição</label>
                  <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="h-14" placeholder="Ex: Aluguel" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Meses Restantes (Opcional)</label>
                  <Input type="number" value={recurrenceMonths} onChange={(e) => setRecurrenceMonths(e.target.value)} className="h-14" placeholder="Ex: 12" />
                </div>

                {type === 'expense' && (
                  <div className="flex flex-col gap-3 p-4 bg-muted/20 rounded-[24px] border border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Débito Automático?</span>
                      <button type="button" onClick={() => setAutoDebit(!autoDebit)} className={"w-12 h-6 rounded-full relative flex items-center px-1 transition-colors " + (autoDebit ? "bg-success" : "bg-border")}>
                        <motion.div animate={{ x: autoDebit ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                    {autoDebit && (
                      <div className="relative">
                        <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full h-14 appearance-none rounded-[16px] bg-card px-4 border border-border text-sm">
                          {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                      </div>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full h-14 rounded-[20px] font-semibold mt-2">{editingId ? 'Salvar Edição' : 'Agendar Lançamento'}</Button>
              </form>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};
