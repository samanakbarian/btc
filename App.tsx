import React, { useState, useEffect, useCallback } from 'react';
import { Currency, Theme, MarketData, BlockchainStats, MempoolFees, SentimentData, NewsItem, ChartPoint } from './types';
import { cryptoService } from './services/cryptoService';
import { Header } from './components/Header';
import { PriceDisplay } from './components/PriceDisplay';
import { MarketChart } from './components/MarketChart';
import { NetworkHealth } from './components/NetworkHealth';
import { NewsFeed } from './components/NewsFeed';
import { SwedishBitcoinTools } from './components/SwedishBitcoinTools';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [currency, setCurrency] = useState<Currency>(Currency.SEK);
  const [timeframe, setTimeframe] = useState<string>('1'); // '1' represents 24h for CoinGecko
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data State
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [blockchainStats, setBlockchainStats] = useState<BlockchainStats | null>(null);
  const [fees, setFees] = useState<MempoolFees | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);

  // --- Theme Management ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(Theme.LIGHT, Theme.DARK);
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  // --- Data Fetching ---
  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [marketRes, chainRes, feesRes, sentimentRes, newsRes] = await Promise.all([
        cryptoService.getMarketData(currency, timeframe),
        cryptoService.getBlockchainStats(),
        cryptoService.getMempoolFees(),
        cryptoService.getSentiment(),
        cryptoService.getNews()
      ]);

      setMarketData(marketRes.data);
      setChartData(marketRes.chart);
      setBlockchainStats(chainRes);
      setFees(feesRes);
      setSentiment(sentimentRes);
      setNews(newsRes);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [currency, timeframe]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000); 
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        currency={currency} 
        setCurrency={setCurrency}
        isRefreshing={isRefreshing}
        onRefresh={fetchAllData}
      />

      <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        <PriceDisplay 
          data={marketData} 
          currency={currency} 
          isLoading={!marketData} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
             <MarketChart 
                data={chartData} 
                currency={currency} 
                theme={theme}
                isPositive={marketData ? marketData.priceChange24h >= 0 : true}
                timeframe={timeframe}
                setTimeframe={setTimeframe}
             />
          </div>

          <div className="lg:col-span-1 h-[350px]">
            <NewsFeed news={news} />
          </div>
        </div>

        <div className="mb-8">
           <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Nätverk & Marknadshumör</h2>
           <NetworkHealth 
            stats={blockchainStats} 
            fees={fees} 
            sentiment={sentiment} 
          />
        </div>

        <div className="mb-8">
          <SwedishBitcoinTools currentPrice={marketData?.price || 0} />
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 mt-auto bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} SatoshiStation. Data från CoinGecko & Mempool.space.</p>
          <p className="mt-2 text-xs opacity-60">Viktigt: Krypto-tillgångar deklareras som övriga tillgångar hos Skatteverket (30% skatt på vinst). Denna sida är ej finansiell rådgivning.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;