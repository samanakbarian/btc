import React from 'react';
import { Currency, Theme } from '../types';
import { Bitcoin, Moon, Sun, RefreshCw, Settings } from 'lucide-react';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  theme, 
  toggleTheme, 
  currency, 
  setCurrency,
  isRefreshing,
  onRefresh
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Area */}
        <div className="flex items-center space-x-3">
          <div className="bg-bitcoin p-2 rounded-full shadow-lg shadow-orange-500/20">
            <Bitcoin className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Satoshi<span className="text-bitcoin">Station</span>
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          
          <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            aria-label="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <div className="relative group">
             <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-1.5 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bitcoin cursor-pointer"
            >
              {Object.values(Currency).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Settings className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600 transition-all"
            aria-label="Toggle Theme"
          >
            {theme === Theme.DARK ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};