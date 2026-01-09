
import React from 'react';
import { MarketData, Currency } from '../types';
// Import Wallet icon which was missing and causing a ReferenceError
import { TrendingUp, TrendingDown, Activity, DollarSign, Wallet } from 'lucide-react';

interface PriceDisplayProps {
  data: MarketData | null;
  currency: Currency;
  isLoading: boolean;
}

const formatCurrency = (val: number, curr: Currency) => {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const formatCompact = (val: number, curr: Currency) => {
   return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: curr,
    notation: "compact",
    compactDisplay: "short"
  }).format(val);
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({ data, currency, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  const isPositive = data.priceChange24h >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Main Price Card */}
      <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="w-24 h-24 text-slate-900 dark:text-white" />
        </div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Aktuellt Pris</h2>
        <div className="flex items-baseline space-x-3">
          <span className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(data.price, currency)}
          </span>
        </div>
        <div className={`flex items-center mt-3 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
          <span className="text-lg font-bold">{Math.abs(data.priceChange24h).toFixed(2)}%</span>
          <span className="text-sm text-slate-400 ml-2 font-medium"> (24t)</span>
        </div>
      </div>

      {/* Market Cap */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Börsvärde</h3>
          <Activity className="w-4 h-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {formatCompact(data.marketCap, currency)}
        </span>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 mt-3 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>

      {/* Volume */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
         <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">24t Volym</h3>
          <Activity className="w-4 h-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {formatCompact(data.volume24h, currency)}
        </span>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 mt-3 rounded-full overflow-hidden">
          <div className="bg-purple-500 h-full rounded-full" style={{ width: '40%' }}></div>
        </div>
      </div>
    </div>
  );
};
