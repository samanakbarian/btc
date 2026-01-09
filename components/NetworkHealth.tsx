import React from 'react';
import { BlockchainStats, MempoolFees, SentimentData } from '../types';
import { Cpu, Box, Layers, Gauge, Fuel, Info } from 'lucide-react';

interface NetworkHealthProps {
  stats: BlockchainStats | null;
  fees: MempoolFees | null;
  sentiment: SentimentData | null;
}

export const NetworkHealth: React.FC<NetworkHealthProps> = ({ stats, fees, sentiment }) => {
  if (!stats || !fees || !sentiment) return <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>;

  const sentimentColor = 
    sentiment.value > 75 ? 'text-emerald-500' :
    sentiment.value > 50 ? 'text-green-500' :
    sentiment.value > 25 ? 'text-orange-500' : 'text-red-500';

  const classificationMap: Record<string, string> = {
    'Extreme Fear': 'Extrem Rädsla',
    'Fear': 'Rädsla',
    'Neutral': 'Neutral',
    'Greed': 'Girighet',
    'Extreme Greed': 'Extrem Girighet'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-4 flex items-center">
          <Cpu className="w-4 h-4 mr-2" /> Nätverkssäkerhet
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
            <span className="text-slate-600 dark:text-slate-300">Hashrate</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{stats.hashrate} EH/s</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
            <span className="text-slate-600 dark:text-slate-300">Svårighetsgrad</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{stats.difficulty} T</span>
          </div>
           <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300">Blockhöjd</span>
            <span className="font-mono font-bold text-bitcoin">#{stats.blockHeight.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-4 flex items-center">
          <Layers className="w-4 h-4 mr-2" /> Avgifter & Kö
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded text-center border border-emerald-100 dark:border-emerald-800">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">Hög</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{fees.fast} <span className="text-xs font-normal text-slate-500">sat/vB</span></div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center border border-blue-100 dark:border-blue-800">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Medel</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{fees.medium} <span className="text-xs font-normal text-slate-500">sat/vB</span></div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded text-center border border-slate-200 dark:border-slate-600">
             <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Låg</div>
            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{fees.slow} <span className="text-xs font-normal text-slate-500">sat/vB</span></div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
           <span className="text-slate-500">Obekräftade transaktioner:</span>
           <span className="font-medium text-slate-800 dark:text-slate-200">{fees.unconfirmedTx.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center relative group">
        {/* Removed overflow-hidden and added rounded-tr-xl to the decoration so it doesn't bleed out too much while allowing tooltip to overflow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-100 dark:to-slate-700/30 rounded-bl-full rounded-tr-xl pointer-events-none"></div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center absolute top-5 left-5">
          <Gauge className="w-4 h-4 mr-2" /> Humör
          <div className="relative ml-1 group/info">
            <Info className="w-3 h-3 text-slate-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-900 text-slate-100 text-[10px] rounded shadow-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-normal leading-relaxed">
              Baseras på <strong>Fear & Greed Index</strong>: Volatilitet (25%), Momentum (25%), Sociala Medier (15%), Dominans (10%), Trender (10%).
            </div>
          </div>
        </h3>
        
        <div className="mt-6 relative">
          <div className="w-32 h-16 bg-slate-200 dark:bg-slate-700 rounded-t-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 origin-bottom transition-transform duration-1000 ease-out"
              style={{ transform: `rotate(${(sentiment.value / 100) * 180 - 180}deg)` }}
            ></div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-800 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
        </div>

        <div className="mt-4">
          <div className={`text-3xl font-bold ${sentimentColor}`}>{sentiment.value}</div>
          <div className={`text-sm font-medium uppercase tracking-wide ${sentimentColor}`}>
            {classificationMap[sentiment.classification] || sentiment.classification}
          </div>
        </div>
      </div>
    </div>
  );
};