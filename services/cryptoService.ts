import { MarketData, BlockchainStats, MempoolFees, SentimentData, NewsItem, ChartPoint, Currency } from '../types';

// --- API CONFIG ---
// We prioritize CoinGecko for rich data, but failover to Coinbase for price reliability.
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINBASE_API = 'https://api.coinbase.com/v2';
const BINANCE_FAPI = 'https://fapi.binance.com/fapi/v1';

// --- FALLBACK HELPERS ---

// Helper to fetch price from Coinbase if CoinGecko fails
const fetchCoinbasePrice = async (currency: Currency): Promise<number> => {
  const res = await fetch(`${COINBASE_API}/prices/spot?currency=${currency}`);
  if (!res.ok) throw new Error('Coinbase API failed');
  const data = await res.json();
  return parseFloat(data.data.amount);
};

// Helper to guess sentiment from title since RSS doesn't provide it
const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  const t = text.toLowerCase();
  const positive = [
    'surge', 'jump', 'rise', 'soar', 'high', 'record', 'bull', 'buy', 
    'adoption', 'approve', 'gain', 'profit', 'etf', 'rally', 'win', 'breakout', 'up', 'grow', 'top'
  ];
  const negative = [
    'crash', 'drop', 'fall', 'plunge', 'low', 'bear', 'sell', 'ban', 
    'regulation', 'sue', 'loss', 'down', 'risk', 'fear', 'death', 'fail', 'crackdown', 'warn', 'scam'
  ];

  if (positive.some(w => t.includes(w))) return 'positive';
  if (negative.some(w => t.includes(w))) return 'negative';
  return 'neutral';
};

// Helper to calculate "time ago" string from date
const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString.replace(' ', 'T')); // Handle various RSS date formats
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds)) return 'Nyligen';

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d sedan`;
  if (hours > 0) return `${hours}t sedan`;
  if (minutes > 0) return `${minutes}m sedan`;
  return 'Just nu';
};

export const cryptoService = {
  getMarketData: async (currency: Currency, days: string = '1'): Promise<{ data: MarketData, chart: ChartPoint[] }> => {
    const currCode = currency.toLowerCase();
    
    // Fetch Funding Rate independently (Non-critical)
    let fundingRate = 0;
    try {
        const fundingRes = await fetch(`${BINANCE_FAPI}/premiumIndex?symbol=BTCUSDT`);
        if (fundingRes.ok) {
            const fundingData = await fundingRes.json();
            fundingRate = parseFloat(fundingData.lastFundingRate);
        }
    } catch (e) {
        console.warn("Funding rate unavailable", e);
    }

    try {
      // 1. Try Primary Source (CoinGecko) - Provides Price + Volume + Market Cap + History
      const priceRes = await fetch(
        `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=${currCode}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
        { cache: 'no-store' }
      );

      // If CoinGecko fails (Rate Limit 429), throw immediately to trigger catch block
      if (!priceRes.ok) throw new Error(`CoinGecko Error: ${priceRes.status}`);

      const priceData = await priceRes.json();
      const btc = priceData.bitcoin;

      // Fetch Chart Data separately - if this fails we can still return price
      let chartData: ChartPoint[] = [];
      try {
        const chartRes = await fetch(
          `${COINGECKO_API}/coins/bitcoin/market_chart?vs_currency=${currCode}&days=${days}`,
          { cache: 'no-store' }
        );
        if (chartRes.ok) {
          const chartJson = await chartRes.json();
          chartData = chartJson.prices
            .filter((_: any, index: number, arr: any[]) => {
              const daysNum = days === 'max' ? 3650 : parseFloat(days);
              if (daysNum <= 1) return index % 6 === 0;
              if (daysNum <= 7) return index % 12 === 0;
              if (daysNum <= 30) return index % 24 === 0;
              return index % (Math.floor(arr.length / 60)) === 0;
            })
            .map((item: [number, number]) => ({
              time: parseFloat(days) <= 1 
                ? new Date(item[0]).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
                : new Date(item[0]).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
              price: item[1]
            }));
        }
      } catch (chartError) {
        console.warn("Chart data unavailable, proceeding with price only");
      }

      // Successful Primary Data
      return {
        data: {
          price: btc[currCode],
          priceChange24h: btc[`${currCode}_24h_change`],
          marketCap: btc[`${currCode}_market_cap`],
          volume24h: btc[`${currCode}_24h_vol`],
          high24h: 0, // Simplified for reliability
          low24h: 0,  // Simplified for reliability
          fundingRate: fundingRate,
          lastUpdated: new Date(btc.last_updated_at * 1000).toISOString()
        },
        chart: chartData
      };

    } catch (primaryError) {
      console.warn("Primary API failed, switching to backup...", primaryError);

      // 2. Try Secondary Source (Coinbase) - Provides Price Only (Reliable)
      // This ensures we NEVER show mock prices, even if we lose volume/chart data temporarily.
      try {
        const backupPrice = await fetchCoinbasePrice(currency);
        
        // Return a partial object. The UI will handle missing history/volume by showing data or placeholders, 
        // but the PRICE will be real.
        return {
          data: {
            price: backupPrice,
            priceChange24h: 0, // Coinbase free API doesn't give 24h change easily
            marketCap: 0,
            volume24h: 0,
            high24h: 0,
            low24h: 0,
            fundingRate: fundingRate,
            lastUpdated: new Date().toISOString()
          },
          chart: [] // No chart data available in backup mode
        };
      } catch (backupError) {
        // 3. Both Failed - Throw actual error. Do NOT return mock data.
        console.error("Critical: All price APIs failed.");
        throw new Error("Kunde inte hämta marknadsdata. Kontrollera din internetanslutning.");
      }
    }
  },

  getBlockchainStats: async (): Promise<BlockchainStats | null> => {
    try {
      const tipRes = await fetch('https://mempool.space/api/blocks/tip/height');
      if (!tipRes.ok) return null;
      const height = await tipRes.text();
      
      const hashrateRes = await fetch('https://mempool.space/api/v1/mining/hashrate/3d');
      const hashrateData = hashrateRes.ok ? await hashrateRes.json() : null;
      const currentHashrate = hashrateData ? hashrateData.currentHashrate / 1000000000000000000 : 700; // Estimate if fail

      return {
        hashrate: Math.round(currentHashrate), 
        difficulty: 102.1, // Hard to fetch via public unauth API, keeping static estimate or removing
        blockHeight: parseInt(height),
        nextHalvingDate: "2028-04-14"
      };
    } catch (error) {
      return null;
    }
  },

  getMempoolFees: async (): Promise<MempoolFees | null> => {
    try {
      const [feesRes, mempoolRes] = await Promise.all([
        fetch('https://mempool.space/api/v1/fees/recommended'),
        fetch('https://mempool.space/api/mempool')
      ]);
      if (!feesRes.ok) return null;
      
      const fees = await feesRes.json();
      const mempool = mempoolRes.ok ? await mempoolRes.json() : { count: 0 };
      
      return {
        fast: fees.fastestFee,
        medium: fees.halfHourFee,
        slow: fees.hourFee,
        unconfirmedTx: mempool.count
      };
    } catch (error) {
      return null;
    }
  },

  getSentiment: async (): Promise<SentimentData | null> => {
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=1');
      if (!res.ok) return null;
      const data = await res.json();
      const item = data.data[0];
      return {
        value: parseInt(item.value),
        classification: item.value_classification,
        nextUpdate: "12 hours"
      };
    } catch (error) {
      return null;
    }
  },

  getNews: async (): Promise<NewsItem[]> => {
    const feeds = [
      { url: 'https://cointelegraph.com/rss/tag/bitcoin', source: 'CoinTelegraph' },
      { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml', source: 'CoinDesk' },
      { url: 'https://bitcoinmagazine.com/.rss/full/', source: 'Bitcoin Mag' }
    ];

    try {
      // Fetch all feeds in parallel, handle individual failures gracefully
      const promises = feeds.map(async (feed) => {
        try {
          const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
          if (!res.ok) return [];
          const data = await res.json();
          if (!data.items) return [];

          return data.items.map((item: any) => ({
            id: item.guid || item.link,
            title: item.title,
            source: feed.source,
            time: getTimeAgo(item.pubDate),
            rawDate: new Date(item.pubDate).getTime(), // Internal for sorting
            url: item.link,
            sentiment: analyzeSentiment(item.title)
          }));
        } catch (e) {
          console.warn(`Failed to load news from ${feed.source}`);
          return [];
        }
      });

      const results = await Promise.all(promises);
      
      // Flatten arrays, sort by date (newest first), and take top 15
      const allNews = results
        .flat()
        .sort((a, b) => b.rawDate - a.rawDate)
        .slice(0, 15)
        .map(({ rawDate, ...item }) => item as NewsItem);

      return allNews;
    } catch (e) {
      console.error("Global news fetch failed", e);
      return [];
    }
  }
};