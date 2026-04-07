import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';

export const WelcomeScreen: React.FC = () => {
  const { hasSeenWelcome, setHasSeenWelcome } = useAppStore();
  const [isVisible, setIsVisible] = useState(!hasSeenWelcome);

  useEffect(() => {
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setHasSeenWelcome(true), 800); // Wait for fade out
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome, setHasSeenWelcome]);

  if (hasSeenWelcome) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-3xl"
        >
          {/* Subtle glow behind text */}
          <div className="absolute w-[80vw] h-[80vw] bg-primary/20 rounded-full blur-[100px]" />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.05, opacity: 0, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="text-center relative z-10 max-w-[80vw]"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white mb-6 flex justify-center"
            >
              <div className="w-20 h-20 rounded-[1.75rem] bg-black/40 border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] backdrop-blur-xl">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.div>
            
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)'}}>
              Olá, Dami!
            </h1>
            <p className="text-xl text-white/80 font-medium tracking-wide">
              Vamos cuidar do seu<br/>dinheiro hoje.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
