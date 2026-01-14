import React, { useState } from 'react';
import { Calculator, TrendingUp, Landmark, Info, Wallet, PieChart, ArrowRightLeft, Coins, FileText } from 'lucide-react';

interface SwedishBitcoinToolsProps {
  currentPrice: number;
}

type Tab = 'dca' | 'isk' | 'converter' | 'whitepaper';

export const SwedishBitcoinTools: React.FC<SwedishBitcoinToolsProps> = ({ currentPrice }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dca');

  // --- DCA State ---
  const [monthlyAmount, setMonthlyAmount] = useState<number>(1000);
  const [years, setYears] = useState<number>(5);
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);

  // --- ISK State ---
  const [iskStartAmount, setIskStartAmount] = useState<number>(50000);
  const [iskMonthly, setIskMonthly] = useState<number>(1000);
  const [iskGrowth, setIskGrowth] = useState<number>(10); // Conservative 10%
  const [iskYears, setIskYears] = useState<number>(10);

  // --- Converter State ---
  const [convMode, setConvMode] = useState<'sek' | 'btc' | 'sats'>('sek');
  const [convValue, setConvValue] = useState<string>('100');

  // --- DCA Logic ---
  const annualGrowth = 0.15;
  const totalInvestedDCA = monthlyAmount * 12 * years;
  const projectedValueDCA = monthlyAmount * ((Math.pow(1 + annualGrowth / 12, 12 * years) - 1) / (annualGrowth / 12));
  const profitTax = Math.max(0, sellPrice - buyPrice);
  const taxAmount = profitTax * 0.30;

  // --- ISK Logic ---
  // ISK Tax 2024 approx: (Statslåneränta + 1%) * 30%. Let's assume ~1.086% annual tax drag.
  const iskTaxRate = 0.01086;
  const capitalGainsTax = 0.30;

  const calculateComparison = () => {
    let walletValue = iskStartAmount;
    let iskValue = iskStartAmount;
    let totalInvested = iskStartAmount;

    for (let i = 0; i < iskYears; i++) {
        // Add yearly contribution (simplified)
        const yearlyContribution = iskMonthly * 12;
        totalInvested += yearlyContribution;
        
        // Wallet Growth
        walletValue = (walletValue + yearlyContribution) * (1 + iskGrowth / 100);
        
        // ISK Growth (Growth - Tax Drag)
        // Note: Tax is withdrawn quarterly, but annual approximation works for estimation
        iskValue = (iskValue + yearlyContribution) * (1 + iskGrowth / 100);
        iskValue = iskValue * (1 - iskTaxRate); 
    }

    const walletNet = walletValue - ((walletValue - totalInvested) * capitalGainsTax);
    
    return {
        walletGross: walletValue,
        walletNet: walletNet,
        iskNet: iskValue, // ISK is already taxed annually
        totalInvested
    };
  };

  const comparison = calculateComparison();

  // --- Converter Logic ---
  const getConvertedValues = () => {
    const val = parseFloat(convValue) || 0;
    if (convMode === 'sek') {
        return {
            sek: val,
            btc: val / currentPrice,
            sats: (val / currentPrice) * 100000000
        };
    } else if (convMode === 'btc') {
        return {
            sek: val * currentPrice,
            btc: val,
            sats: val * 100000000
        };
    } else {
        return {
            sek: (val / 100000000) * currentPrice,
            btc: val / 100000000,
            sats: val
        };
    }
  };
  const converted = getConvertedValues();


  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
        <button 
            onClick={() => setActiveTab('dca')}
            className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors min-w-[120px] whitespace-nowrap ${activeTab === 'dca' ? 'bg-slate-50 dark:bg-slate-700/50 text-bitcoin border-b-2 border-bitcoin' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
            <Calculator className="w-4 h-4" />
            <span>Kalkylatorer</span>
        </button>
        <button 
            onClick={() => setActiveTab('isk')}
            className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors min-w-[120px] whitespace-nowrap ${activeTab === 'isk' ? 'bg-slate-50 dark:bg-slate-700/50 text-bitcoin border-b-2 border-bitcoin' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
            <PieChart className="w-4 h-4" />
            <span>ISK vs Plånbok</span>
        </button>
        <button 
            onClick={() => setActiveTab('converter')}
            className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors min-w-[120px] whitespace-nowrap ${activeTab === 'converter' ? 'bg-slate-50 dark:bg-slate-700/50 text-bitcoin border-b-2 border-bitcoin' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Omvandlare</span>
        </button>
        <button 
            onClick={() => setActiveTab('whitepaper')}
            className={`flex-1 py-4 px-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors min-w-[120px] whitespace-nowrap ${activeTab === 'whitepaper' ? 'bg-slate-50 dark:bg-slate-700/50 text-bitcoin border-b-2 border-bitcoin' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
            <FileText className="w-4 h-4" />
            <span>Whitepaper</span>
        </button>
      </div>

      <div className="p-6">
        
        {/* --- TAB 1: DCA & Tax --- */}
        {activeTab === 'dca' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                {/* Månadssparande */}
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <TrendingUp className="text-bitcoin w-5 h-5" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Månadssparande</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Månadsbelopp (SEK)</label>
                            <input type="number" value={monthlyAmount} onChange={(e) => setMonthlyAmount(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-bitcoin"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Tidshorisont: <span className="text-slate-800 dark:text-white">{years} år</span></label>
                            <input type="range" min="1" max="20" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-bitcoin"/>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-500">Total investering:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200">{totalInvestedDCA.toLocaleString()} kr</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Uppskattat värde (15%):</span>
                                <span className="font-bold text-emerald-500 text-lg">{Math.round(projectedValueDCA).toLocaleString()} kr</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skatt */}
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <Landmark className="text-blue-500 w-5 h-5" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Skattekalkylator (K4)</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Köp (SEK)</label>
                                <input type="number" onChange={(e) => setBuyPrice(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Sälj (SEK)</label>
                                <input type="number" onChange={(e) => setSellPrice(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-blue-700 dark:text-blue-300">Vinst:</span>
                                <span className="font-bold text-blue-800 dark:text-blue-100">{profitTax.toLocaleString()} kr</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-rose-600 dark:text-rose-400 font-medium">Skatt (30%):</span>
                                <span className="font-bold text-rose-600 dark:text-rose-400 text-lg">{taxAmount.toLocaleString()} kr</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 2: ISK Comparison --- */}
        {activeTab === 'isk' && (
            <div className="animate-in fade-in duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inputs */}
                    <div className="lg:col-span-1 space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Startbelopp (SEK)</label>
                            <input type="number" value={iskStartAmount} onChange={(e) => setIskStartAmount(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-bitcoin"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Månadssparande (SEK)</label>
                            <input type="number" value={iskMonthly} onChange={(e) => setIskMonthly(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-bitcoin"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Årlig avkastning (%)</label>
                            <input type="number" value={iskGrowth} onChange={(e) => setIskGrowth(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-bitcoin"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Tidshorisont: {iskYears} år</label>
                            <input type="range" min="1" max="30" step="1" value={iskYears} onChange={(e) => setIskYears(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-bitcoin"/>
                        </div>
                    </div>

                    {/* Results Visuals */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Wallet Card */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-600 relative overflow-hidden">
                                <Wallet className="w-12 h-12 text-slate-200 dark:text-slate-600 absolute -bottom-2 -right-2" />
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2 z-10 relative">Vanlig Plånbok (30% Skatt)</h3>
                                <div className="space-y-1 z-10 relative">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Brutto:</span>
                                        <span className="font-mono">{Math.round(comparison.walletGross).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-rose-500">
                                        <span>Skatt (exit):</span>
                                        <span>-{Math.round(comparison.walletGross - comparison.walletNet).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-600 flex justify-between font-bold text-lg">
                                        <span>Netto:</span>
                                        <span className="text-bitcoin">{Math.round(comparison.walletNet).toLocaleString()} kr</span>
                                    </div>
                                </div>
                            </div>

                             {/* ISK Card */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-800 relative overflow-hidden">
                                <Landmark className="w-12 h-12 text-blue-100 dark:text-blue-900 absolute -bottom-2 -right-2" />
                                <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2 z-10 relative">ISK (Certifikat/ETF)</h3>
                                <div className="space-y-1 z-10 relative">
                                    <div className="flex justify-between text-sm text-blue-800 dark:text-blue-300">
                                        <span className="opacity-70">Löpande skatt:</span>
                                        <span className="font-mono">~1% årligen</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                                        <span>Skatt (exit):</span>
                                        <span>0 kr</span>
                                    </div>
                                    <div className="pt-2 mt-1 border-t border-blue-200 dark:border-blue-700 flex justify-between font-bold text-lg text-blue-900 dark:text-white">
                                        <span>Netto:</span>
                                        <span className="text-blue-600 dark:text-blue-400">{Math.round(comparison.iskNet).toLocaleString()} kr</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800 text-xs text-yellow-800 dark:text-yellow-200 flex items-start">
                             <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                             <p>
                                <strong>Analys:</strong> Vid {iskGrowth}% årlig tillväxt över {iskYears} år är {comparison.iskNet > comparison.walletNet ? 'ISK' : 'Plånbok'} mer lönsamt.
                                <br/>Notera: ISK innebär att du inte äger dina nycklar (motpartsrisk). Egen plånbok ger fullt ägande men högre skatt på vinst.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 3: Converter --- */}
        {activeTab === 'converter' && (
             <div className="max-w-2xl mx-auto animate-in fade-in duration-300 py-4">
                <div className="flex flex-col items-center space-y-6">
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                        <button onClick={() => setConvMode('sek')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${convMode === 'sek' ? 'bg-white dark:bg-slate-600 shadow text-bitcoin' : 'text-slate-500'}`}>SEK Basis</button>
                        <button onClick={() => setConvMode('btc')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${convMode === 'btc' ? 'bg-white dark:bg-slate-600 shadow text-bitcoin' : 'text-slate-500'}`}>BTC Basis</button>
                        <button onClick={() => setConvMode('sats')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${convMode === 'sats' ? 'bg-white dark:bg-slate-600 shadow text-bitcoin' : 'text-slate-500'}`}>Sats Basis</button>
                    </div>

                    <div className="w-full relative">
                         <input 
                            type="number" 
                            value={convValue}
                            onChange={(e) => setConvValue(e.target.value)}
                            className="w-full text-center text-4xl font-bold bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-300"
                            placeholder="0"
                            autoFocus
                        />
                        <div className="text-center text-sm font-bold text-slate-400 uppercase mt-2">
                            {convMode}
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${convMode === 'sek' ? 'bg-bitcoin/10 border-bitcoin/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Svenska Kronor</span>
                            <span className="text-lg font-mono font-bold text-slate-700 dark:text-slate-200">{converted.sek.toLocaleString(undefined, { maximumFractionDigits: 2 })} kr</span>
                         </div>
                          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${convMode === 'btc' ? 'bg-bitcoin/10 border-bitcoin/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                            <span className="text-xs font-bold text-slate-400 uppercase mb-1">Bitcoin</span>
                            <span className="text-lg font-mono font-bold text-slate-700 dark:text-slate-200">{converted.btc.toLocaleString(undefined, { maximumFractionDigits: 8 })}</span>
                         </div>
                          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${convMode === 'sats' ? 'bg-bitcoin/10 border-bitcoin/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                            <span className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center"><Coins className="w-3 h-3 mr-1"/> Satoshis</span>
                            <span className="text-lg font-mono font-bold text-slate-700 dark:text-slate-200">{Math.round(converted.sats).toLocaleString()}</span>
                         </div>
                    </div>
                </div>
             </div>
        )}

        {/* --- TAB 4: Whitepaper --- */}
        {activeTab === 'whitepaper' && (
             <div className="animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                        <div>
                             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Bitcoin: A Peer-to-Peer Electronic Cash System</h2>
                             <p className="text-slate-500 dark:text-slate-400 font-medium">Publicerad av Satoshi Nakamoto, 31 Oktober 2008</p>
                        </div>
                        
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Detta dokument på nio sidor lade grunden för världens första decentraliserade kryptovaluta. Det beskriver hur man löser problemet med "double-spending" utan att behöva lita på en central auktoritet (som en bank eller stat).
                        </p>

                         <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Nyckelkoncept:</h3>
                            <ul className="space-y-2">
                                <li className="flex items-start">
                                    <div className="bg-bitcoin/10 p-1 rounded mt-0.5 mr-2">
                                        <Coins className="w-3 h-3 text-bitcoin" />
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Knappt utbud:</strong> Endast 21 miljoner bitcoins kommer någonsin att existera.</span>
                                </li>
                                <li className="flex items-start">
                                     <div className="bg-bitcoin/10 p-1 rounded mt-0.5 mr-2">
                                        <TrendingUp className="w-3 h-3 text-bitcoin" />
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-300"><strong>Proof-of-Work:</strong> Använder energi för att säkra nätverket och göra historiken oändringsbar.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-2">
                            <a 
                                href="https://bitcoin.org/bitcoin.pdf" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-bitcoin hover:bg-orange-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-orange-500/20"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Läs Originalet (PDF)
                            </a>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 flex justify-center">
                        <div className="relative group cursor-pointer" onClick={() => window.open('https://bitcoin.org/bitcoin.pdf', '_blank')}>
                            <div className="absolute inset-0 bg-bitcoin blur-xl opacity-20 group-hover:opacity-30 transition-opacity rounded-xl"></div>
                            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-xl transform group-hover:-translate-y-1 transition-transform duration-300">
                                <div className="aspect-[1/1.4] w-48 bg-slate-50 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700/50">
                                     <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-2" />
                                     <span className="text-[10px] font-mono text-slate-400">bitcoin.pdf</span>
                                     <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600 mt-1">184 KB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};