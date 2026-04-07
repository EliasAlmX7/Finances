import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Moon, Sun, BellRing, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store';
import { Card } from '../components/ui/card';

export const Settings: React.FC = () => {
  const { resetData, theme, setTheme, notificationsEnabled, setNotificationsEnabled } = useAppStore();

  const handleReset = () => {
    if (confirm('ATENÇÃO: Você tem certeza que deseja APAGAR TODOS os dados? Esta ação não pode ser desfeita.')) {
      if (confirm('Tem certeza absoluta? Todo o seu saldo e histórico será zerado.')) {
        resetData();
        alert('Todos os dados foram apagados com sucesso.');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (!("Notification" in window)) {
        alert("Este navegador não suporta notificações de desktop");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        new Notification("🚀 Notificações Ativadas!", {
          body: "Você será avisado sobre suas contas fixas e movimentações importantes.",
          icon: "/pwa-192x192.png"
        });
      } else {
        alert("Você precisa permitir as notificações nas configurações do seu navegador.");
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <div className="px-5 md:px-10 pt-10 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-28 font-light">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configurações</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        {/* Theme Switching Card */}
        <Card className="p-6 bg-card border border-border rounded-[32px] premium-shadow flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[20px] bg-muted flex items-center justify-center text-foreground">
                {theme === 'light' ? <Sun className="w-6 h-6" strokeWidth={1.5} /> : <Moon className="w-6 h-6" strokeWidth={1.5} />}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Aparência</span>
                <span className="text-sm text-muted-foreground">Escolha entre Claro ou Escuro</span>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-[16px] text-sm font-medium transition-colors border border-border/50"
            >
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </button>
          </div>
        </Card>

        {/* Real Push Notifications Toggle */}
        <Card className="p-6 bg-card border border-border rounded-[32px] premium-shadow flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={"w-12 h-12 rounded-[20px] flex items-center justify-center transition-colors " + (notificationsEnabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                <BellRing className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Notificações Push</span>
                    {notificationsEnabled && <CheckCircle2 className="w-3 h-3 text-success" />}
                </div>
                <span className="text-sm text-muted-foreground">Alertas de contas vencendo hoje</span>
              </div>
            </div>
            
            <button 
                onClick={toggleNotifications}
                className={"w-14 h-7 rounded-full flex items-center px-1 transition-all duration-500 " + (notificationsEnabled ? 'bg-success' : 'bg-muted border border-border')}
            >
              <motion.div 
                animate={{ x: notificationsEnabled ? 28 : 0 }}
                className="w-5 h-5 bg-white rounded-full shadow-md" 
              />
            </button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-8 bg-card border border-border rounded-[32px] premium-shadow flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-border/50 pb-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Gerenciamento de Dados</span>
              <span className="text-sm text-muted-foreground">Controle de sincronismo local</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Zona de Perigo</h3>
            <div className="p-4 rounded-[20px] bg-destructive/5 border border-destructive/10 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-destructive">Apagar Todos os Dados</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Atenção: Essa ação apagará permanentemente todo o seu histórico, carteiras e agendamentos. 
                  </span>
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="flex items-center justify-center gap-2 bg-destructive hover:bg-[#b01321] text-white px-2 rounded-[20px] font-medium transition-all active:scale-95 h-12 text-sm w-full shadow-sm"
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
