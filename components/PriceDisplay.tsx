import React from 'react';
import { MarketData, Currency } from '../types';
import { TrendingUp, TrendingDown, Activity, Wallet, Percent, Info } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
        <div className="col-span-1 md:col-span-2 h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  const isPositive = data.priceChange24h >= 0;
  const isFundingPositive = data.fundingRate >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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

      {/* Funding Rate */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-center relative group/card">
         <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Terminsränta
            <div className="relative group/info">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-slate-600 dark:hover:text-slate-200" />
              {/* Tooltip */}
              <div className="absolute right-0 top-6 w-60 p-3 bg-slate-900 text-slate-100 text-[11px] rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50 border border-slate-700 font-normal leading-relaxed">
                <p className="mb-2"><strong>Funding Rate</strong> balanserar priset på terminskontrakt mot spotpriset.</p>
                <ul className="list-disc pl-3 space-y-1">
                  <li><span className="text-emerald-400 font-bold">Positiv:</span> Longs betalar Shorts. Signalerar optimism (Bullish).</li>
                  <li><span className="text-rose-400 font-bold">Negativ:</span> Shorts betalar Longs. Signalerar pessimism (Bearish).</li>
                </ul>
              </div>
            </div>
          </h3>
          <Percent className="w-4 h-4 text-orange-500" />
        </div>
        <span className={`text-2xl font-bold ${isFundingPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {(data.fundingRate * 100).toFixed(4)}%
        </span>
        <div className="flex items-center justify-between mt-3">
           <span className="text-xs text-slate-400 font-medium">8t period</span>
           <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isFundingPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
             {isFundingPositive ? 'Bullish' : 'Bearish'}
           </span>
        </div>
      </div>
    </div>
  );
};