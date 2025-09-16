export type MetalType = 'gold' | 'silver';

export interface MetalPrice {
  price: number;
  currency: string;
  timestamp: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  metal: MetalType;
}

// 保持向后兼容性
export interface GoldPrice extends Omit<MetalPrice, 'metal'> {}

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface GoldApiResponse {
  price: number;
  currency: string;
  timestamp: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
}

export interface HistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
} 