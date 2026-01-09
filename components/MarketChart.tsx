import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartPoint, Currency, Theme } from '../types';

interface MarketChartProps {
  data: ChartPoint[];
  currency: Currency;
  theme: Theme;
  isPositive: boolean;
  timeframe: string;
  setTimeframe: (t: string) => void;
}

const timeframes = [
  { label: '1t', value: '0.041' }, // ~1 hour
  { label: '24t', value: '1' },
  { label: '7d', value: '7' },
  { label: '30d', value: '30' },
  { label: '1å', value: '365' },
  { label: 'Allt', value: 'max' }
];

export const MarketChart: React.FC<MarketChartProps> = ({ 
  data, 
  currency, 
  theme, 
  isPositive, 
  timeframe, 
  setTimeframe 
}) => {
  const chartColor = isPositive ? '#10b981' : '#f43f5e';
  const gradientId = "colorPrice";
  const timeframeLabel = timeframes.find(t => t.value === timeframe)?.label || '24t';

  return (
    <div className="w-full h-[350px] bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col relative">
      {/* Header & Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 gap-3 z-10 relative">
        <div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Prisutveckling ({timeframeLabel})</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            Realtidsdata
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
           {/* Timeframe Selector */}
           <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                  timeframe === tf.value 
                    ? 'bg-white dark:bg-slate-800 text-bitcoin shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="flex-grow min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === Theme.DARK ? "#334155" : "#e2e8f0"} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: theme === Theme.DARK ? '#94a3b8' : '#64748b', fontSize: 10 }} 
              minTickGap={40}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: theme === Theme.DARK ? '#94a3b8' : '#64748b', fontSize: 10 }}
              tickFormatter={(val) => new Intl.NumberFormat('sv-SE', { notation: "compact", maximumFractionDigits: 1 }).format(val)}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === Theme.DARK ? '#1e293b' : '#ffffff', 
                borderColor: theme === Theme.DARK ? '#475569' : '#e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                color: theme === Theme.DARK ? '#f1f5f9' : '#0f172a'
              }}
              itemStyle={{ color: chartColor, fontWeight: 'bold' }}
              formatter={(value: number) => [
                new Intl.NumberFormat('sv-SE', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(value), 
                'Pris'
              ]}
              labelStyle={{ marginBottom: '4px', color: '#94a3b8' }}
            />
            
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={chartColor} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill={`url(#${gradientId})`} 
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};