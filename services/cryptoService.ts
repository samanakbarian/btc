import { MarketData, BlockchainStats, MempoolFees, SentimentData, NewsItem, ChartPoint, Currency } from '../types';

// --- MOCK DATA GENERATORS (FALLBACKS) ---
const generateMockHistory = (points: number, currentPrice: number, days: string): ChartPoint[] => {
  const data: ChartPoint[] = [];
  let price = currentPrice;
  const now = new Date();
  const timeframeDays = days === 'max' ? 3650 : parseFloat(days);
  const intervalMs = timeframeDays * 24 * 60 * 60 * 1000 / points;
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMs);
    const change = (Math.random() - 0.5) * (currentPrice * 0.02);
    price += change;
    data.push({
      time: timeframeDays <= 1 
        ? time.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) 
        : time.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
      price: price
    });
  }
  return data;
};

const MOCK_MARKET_DATA: MarketData = {
  price: 64231.50,
  priceChange24h: 2.45,
  marketCap: 1250000000000,
  volume24h: 34000000000,
  high24h: 65100.20,
  low24h: 62800.10,
  lastUpdated: new Date().toISOString()
};

const MOCK_BLOCKCHAIN_STATS: BlockchainStats = {
  hashrate: 650,
  difficulty: 86.4,
  blockHeight: 840123,
  nextHalvingDate: "2028-04-14"
};

const MOCK_FEES: MempoolFees = {
  fast: 45,
  medium: 32,
  slow: 18,
  unconfirmedTx: 12500
};

const MOCK_SENTIMENT: SentimentData = {
  value: 72,
  classification: "Greed",
  nextUpdate: "8 hours"
};

const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: "Bitcoin Surges Past Key Resistance Level as ETFs See Inflow", source: "CryptoDaily", time: "2h ago", url: "#", sentiment: 'positive' },
  { id: '2', title: "Mining Difficulty Reaches New All-Time High", source: "BlockchainNews", time: "4h ago", url: "#", sentiment: 'neutral' },
  { id: '3', title: "Regulatory Uncertainty Continues in Global Markets", source: "FinanceToday", time: "6h ago", url: "#", sentiment: 'negative' },
];

export const cryptoService = {
  getMarketData: async (currency: Currency, days: string = '1'): Promise<{ data: MarketData, chart: ChartPoint[] }> => {
    try {
      const currCode = currency.toLowerCase();
      
      // Fetch current price stats
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currCode}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
      );
      
      // Fetch historical chart data
      const chartRes = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currCode}&days=${days}`
      );

      if (!priceRes.ok || !chartRes.ok) throw new Error('CoinGecko API limit or error');

      const priceData = await priceRes.json();
      const chartDataRaw = await chartRes.json();
      
      const btc = priceData.bitcoin;
      const prices = chartDataRaw.prices;

      // Crucial: Use the latest price from the simple price API for the ticker to ensure real-time accuracy
      const currentMarketPrice = btc[currCode];

      const realData: MarketData = {
        price: currentMarketPrice,
        priceChange24h: btc[`${currCode}_24h_change`],
        marketCap: btc[`${currCode}_market_cap`],
        volume24h: btc[`${currCode}_24h_vol`],
        high24h: Math.max(...prices.map((p: any) => p[1])),
        low24h: Math.min(...prices.map((p: any) => p[1])),
        lastUpdated: new Date(btc.last_updated_at * 1000).toISOString()
      };

      const realChart: ChartPoint[] = prices
        .filter((_: any, index: number, arr: any[]) => {
          // Downsample for performance and readability based on timeframe
          const daysNum = days === 'max' ? 3650 : parseFloat(days);
          if (daysNum <= 1) return index % 6 === 0; // Every 30 mins
          if (daysNum <= 7) return index % 12 === 0; // Every hour
          if (daysNum <= 30) return index % 24 === 0; // Every 2 hours
          return index % (Math.floor(arr.length / 60)) === 0; // ~60 points for long ranges
        })
        .map((item: [number, number]) => ({
          time: parseFloat(days) <= 1 
            ? new Date(item[0]).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
            : new Date(item[0]).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' }),
          price: item[1]
        }));

      // Ensure the very last point on the chart matches the current price exactly
      if (realChart.length > 0) {
        realChart[realChart.length - 1].price = currentMarketPrice;
      }

      return { data: realData, chart: realChart };

    } catch (error) {
      console.warn("Using Mock Market Data", error);
      const multiplier = currency === Currency.EUR ? 0.92 : currency === Currency.SEK ? 10.8 : 1;
      const baseData = { ...MOCK_MARKET_DATA };
      const adjustedData = {
        ...baseData,
        price: baseData.price * multiplier,
        marketCap: baseData.marketCap * multiplier,
        volume24h: baseData.volume24h * multiplier,
        high24h: baseData.high24h * multiplier,
        low24h: baseData.low24h * multiplier,
      };
      return { data: adjustedData, chart: generateMockHistory(40, adjustedData.price, days) };
    }
  },

  getBlockchainStats: async (): Promise<BlockchainStats> => {
    try {
      const tipRes = await fetch('https://mempool.space/api/blocks/tip/height');
      const height = await tipRes.text();
      return {
        hashrate: 712, 
        difficulty: 92.1,
        blockHeight: parseInt(height),
        nextHalvingDate: "2028-04-14"
      };
    } catch (error) {
      return MOCK_BLOCKCHAIN_STATS;
    }
  },

  getMempoolFees: async (): Promise<MempoolFees> => {
    try {
      const [feesRes, mempoolRes] = await Promise.all([
        fetch('https://mempool.space/api/v1/fees/recommended'),
        fetch('https://mempool.space/api/mempool')
      ]);
      const fees = await feesRes.json();
      const mempool = await mempoolRes.json();
      return {
        fast: fees.fastestFee,
        medium: fees.halfHourFee,
        slow: fees.hourFee,
        unconfirmedTx: mempool.count
      };
    } catch (error) {
      return MOCK_FEES;
    }
  },

  getSentiment: async (): Promise<SentimentData> => {
    try {
      const res = await fetch('https://api.alternative.me/fng/?limit=1');
      const data = await res.json();
      const item = data.data[0];
      return {
        value: parseInt(item.value),
        classification: item.value_classification,
        nextUpdate: "12 hours"
      };
    } catch (error) {
      return MOCK_SENTIMENT;
    }
  },

  getNews: async (): Promise<NewsItem[]> => {
    try {
      const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss/tag/bitcoin');
      const data = await res.json();
      return data.items.map((item: any, idx: number) => ({
        id: `news-${idx}`,
        title: item.title,
        source: 'CoinTelegraph',
        time: 'Senaste',
        url: item.link,
        sentiment: 'neutral'
      })).slice(0, 10);
    } catch (e) {
      return MOCK_NEWS;
    }
  }
};