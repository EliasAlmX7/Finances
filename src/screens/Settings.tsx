import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Trash2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';

export const Settings: React.FC = () => {
  const { resetData } = useAppStore();

  const handleReset = () => {
    if (confirm('ATENÇÃO: Você tem certeza que deseja APAGAR TODOS os dados? Esta ação não pode ser desfeita.')) {
      if (confirm('Tem certeza absoluta? Todo o seu saldo e histórico será zerado.')) {
        resetData();
        alert('Todos os dados foram apagados com sucesso.');
      }
    }
  };

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-8 font-light">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configurações</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-card border border-border rounded-[32px] premium-shadow flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-border/50 pb-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Sistema em Testes</span>
              <span className="text-sm text-muted-foreground">Ajustes e gerenciamento de dados</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-1">Zona de Perigo</h3>
            <div className="p-4 rounded-[20px] bg-destructive/5 border border-destructive/10 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-destructive">Apagar Todos os Dados</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Você está testando o aplicativo e deseja limpar todo o histórico? 
                    Esta ação apagará todas as despesas, receitas, carteiras e lançamentos fixos criados.
                  </span>
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="flex items-center justify-center gap-2 bg-destructive hover:bg-[#b01321] text-white px-2 rounded-[16px] font-medium transition-all active:scale-95 h-12 text-sm w-full shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Zerar Sistema Agora
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
