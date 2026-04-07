import React from 'react';
import { motion } from 'framer-motion';
import { Home, Wallet, ListOrdered, CalendarClock, PieChart, Settings as SettingsIcon } from 'lucide-react';
import type { Tab } from '../App';

interface NavigationProps {
  activeTab: Tab;
  onChange: (t: Tab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onChange }) => {
  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <Home className="w-6 h-6 md:w-5 md:h-5" strokeWidth={1.5} />, label: 'Resumo' },
    { id: 'wallets', icon: <Wallet className="w-6 h-6 md:w-5 md:h-5" strokeWidth={1.5} />, label: 'Carteiras' },
    { id: 'transactions', icon: <ListOrdered className="w-6 h-6 md:w-5 md:h-5" strokeWidth={1.5} />, label: 'Extrato' },
    { id: 'scheduled', icon: <CalendarClock className="w-6 h-6 md:w-5 md:h-5" strokeWidth={1.5} />, label: 'Fixos' },
    { id: 'reports', icon: <PieChart className="w-6 h-6 md:w-5 md:h-5" strokeWidth={1.5} />, label: 'Relatórios' },
    { id: 'settings', icon: <SettingsIcon className="w-6 h-6 md:w-5 md:h-5" strokeWidth={1.5} />, label: 'Ajustes' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full bg-card/90 backdrop-blur-2xl border-t border-border px-4 pb-8 pt-4 flex justify-between items-center pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="relative flex flex-col items-center gap-1.5 flex-1"
              >
                <div className={"transition-colors duration-300 " + (isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {tab.icon}
                </div>
                <span className={"text-[9px] font-medium tracking-wide " + (isActive ? 'text-foreground' : 'text-muted-foreground')}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -top-4 w-10 h-1 bg-foreground rounded-b-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex fixed top-0 left-0 w-64 h-full bg-card border-r border-border flex-col p-6 pointer-events-auto">
        <div className="mb-12 mt-6 px-4">
          <h1 className="text-2xl font-bold tracking-tight">Finanças</h1>
        </div>
        
        <nav className="flex flex-col gap-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={"flex items-center gap-4 px-4 py-3 rounded-[16px] transition-all duration-300 font-medium text-sm " + (isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground')}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
