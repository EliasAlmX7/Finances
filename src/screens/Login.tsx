import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Wallet, ShieldCheck, Zap, Globe } from 'lucide-react';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError('Falha ao autenticar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-[#34c759]/10 rounded-full blur-[140px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full"
      >
        <div className="w-20 h-20 bg-foreground text-background rounded-[24px] flex items-center justify-center shadow-2xl">
          <Wallet className="w-10 h-10" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Premium Finances</h1>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed px-4 text-balance">
            Sua vida financeira na nuvem. Segura, rápida e sincronizada em todos os seus dispositivos.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full mt-4">
          <Button
            onClick={handleLogin}
            disabled={loading}
            size="lg"
            className="w-full h-16 rounded-[24px] bg-foreground text-background hover:bg-foreground/90 font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <React.Fragment>
                <Globe className="w-5 h-5" />
                Entrar com Google
              </React.Fragment>
            )}
          </Button>

          {error && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-destructive font-semibold"
            >
              {error}
            </motion.span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-8">
          <div className="flex flex-col items-center gap-2 p-4 rounded-[20px] bg-muted/30 border border-border/50">
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Segurança Biométrica</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-[20px] bg-muted/30 border border-border/50">
            <Zap className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sincronismo Tempo Real</span>
          </div>
        </div>
      </motion.div>

      <footer className="absolute bottom-8 text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-40">
        Powered by Apple inspired design
      </footer>
    </div>
  );
};
