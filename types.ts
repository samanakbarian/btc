export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  SEK = 'SEK'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface MarketData {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  fundingRate: number; // New field for Futures Funding Rate
  lastUpdated: string;
}

export interface BlockchainStats {
  hashrate: number; // in EH/s
  difficulty: number; // in Trillions
  blockHeight: number;
  nextHalvingDate: string;
}

export interface MempoolFees {
  fast: number;
  medium: number;
  slow: number;
  unconfirmedTx: number;
}

export interface SentimentData {
  value: number; // 0-100
  classification: string; // "Extreme Fear", "Greed", etc.
  nextUpdate: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ChartPoint {
  time: string;
  price: number;
}