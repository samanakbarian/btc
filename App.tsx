import React, { useState, useEffect, useCallback } from 'react';
import { Currency, Theme, MarketData, BlockchainStats, MempoolFees, SentimentData, NewsItem, ChartPoint } from './types';
import { cryptoService } from './services/cryptoService';
import { Header } from './components/Header';
import { PriceDisplay } from './components/PriceDisplay';
import { MarketChart } from './components/MarketChart';
import { NetworkHealth } from './components/NetworkHealth';
import { NewsFeed } from './components/NewsFeed';
import { SwedishBitcoinTools } from './components/SwedishBitcoinTools';
import { BottomNav } from './components/BottomNav';
import { AlertTriangle, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [currency, setCurrency] = useState<Currency>(Currency.SEK);
  const [timeframe, setTimeframe] = useState<string>('1'); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile Navigation State
  const [activeTab, setActiveTab] = useState<string>('market');

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
    setError(null);
    try {
      // 1. Critical Data (Price) - Fail if this fails
      const marketRes = await cryptoService.getMarketData(currency, timeframe);
      setMarketData(marketRes.data);
      setChartData(marketRes.chart);

      // 2. Secondary Data - Don't fail the whole app if these fail
      try {
        const [chainRes, feesRes, sentimentRes, newsRes] = await Promise.all([
          cryptoService.getBlockchainStats(),
          cryptoService.getMempoolFees(),
          cryptoService.getSentiment(),
          cryptoService.getNews()
        ]);
        setBlockchainStats(chainRes);
        setFees(feesRes);
        setSentiment(sentimentRes);
        setNews(newsRes);
      } catch (secondaryError) {
        console.warn("Secondary data fetch failed partially", secondaryError);
      }

    } catch (err: any) {
      console.error("Fatal data fetch error", err);
      // Only set error if we don't have stale data to show
      if (!marketData) {
        setError(err.message || "Kunde inte ansluta till marknadsdata.");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [currency, timeframe]);

  // Initial Fetch
  useEffect(() => {
    fetchAllData();
    // Refresh every 60s
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

      {error ? (
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md border border-slate-200 dark:border-slate-700">
            <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Ingen Data Tillgänglig</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Vi kunde inte hämta aktuella priser. Detta beror oftast på anslutningsproblem eller att API-gränsen är nådd.
            </p>
            <button 
              onClick={fetchAllData}
              className="px-6 py-2 bg-bitcoin text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
            >
              Försök Igen
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          
          {/* Show warning if using backup data */}
          {marketData && chartData.length === 0 && (
            <div className="mb-6 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center text-sm text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Visar förenklad prisdata (Fallback-läge). Historik och volym är tillfälligt otillgänglig.
            </div>
          )}

          {/* --- MOBILE VIEW (Tabs) --- */}
          <div className="md:hidden space-y-6">
            {activeTab === 'market' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <PriceDisplay 
                  data={marketData} 
                  currency={currency} 
                  isLoading={!marketData && !error} 
                />
                <MarketChart 
                  data={chartData} 
                  currency={currency} 
                  theme={theme}
                  isPositive={marketData ? marketData.priceChange24h >= 0 : true}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                />
                <SwedishBitcoinTools currentPrice={marketData?.price || 0} />
              </div>
            )}

            {activeTab === 'network' && (
               <div className="animate-in fade-in duration-300 space-y-6">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 px-1">Nätverk & Marknadshumör</h2>
                  {blockchainStats && fees && sentiment ? (
                    <NetworkHealth 
                      stats={blockchainStats} 
                      fees={fees} 
                      sentiment={sentiment} 
                    />
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-400">
                      Laddar nätverksdata...
                    </div>
                  )}
               </div>
            )}

            {activeTab === 'news' && (
               <div className="animate-in fade-in duration-300 h-[calc(100vh-14rem)]">
                 <NewsFeed news={news} />
               </div>
            )}
          </div>

          {/* --- DESKTOP VIEW (Grid) --- */}
          <div className="hidden md:block">
            <PriceDisplay 
              data={marketData} 
              currency={currency} 
              isLoading={!marketData && !error} 
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
              {blockchainStats && fees && sentiment ? (
                 <NetworkHealth 
                  stats={blockchainStats} 
                  fees={fees} 
                  sentiment={sentiment} 
                />
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-400">
                  Nätverksstatistik laddas eller är otillgänglig
                </div>
              )}
            </div>

            <div className="mb-8">
              <SwedishBitcoinTools currentPrice={marketData?.price || 0} />
            </div>
          </div>
          
        </main>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 mt-auto bg-white dark:bg-slate-900 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Rinse and Repeat Analytics. Data från CoinGecko, Coinbase & Mempool.space.</p>
          <p className="mt-2 text-xs opacity-60">Viktigt: Krypto-tillgångar deklareras som övriga tillgångar hos Skatteverket (30% skatt på vinst). Denna sida är ej finansiell rådgivning.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;