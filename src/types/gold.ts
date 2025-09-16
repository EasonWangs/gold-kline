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

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
} 