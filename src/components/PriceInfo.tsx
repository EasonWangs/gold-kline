import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Clock, Wifi, WifiOff, Database, AlertTriangle } from 'lucide-react';
import { GoldPrice } from '../types/gold';
import dayjs from 'dayjs';

interface PriceInfoProps {
  goldPrice: GoldPrice | null;
  loading: boolean;
  currency: 'USD' | 'CNY';
}

const PriceInfo: React.FC<PriceInfoProps> = ({ goldPrice, loading, currency }) => {
  const currencyInfo = {
    USD: { 
      symbol: '$', 
      unit: '美元/盎司',
      formatPrice: (price: number) => `$${price.toLocaleString()}`
    },
    CNY: { 
      symbol: '¥', 
      unit: '人民币/克',
      formatPrice: (price: number) => `¥${price.toFixed(2)}`
    }
  };

  // 检查是否有API密钥配置
  const hasApiKey = import.meta.env.VITE_GOLDAPI_KEY && import.meta.env.VITE_GOLDAPI_KEY !== 'YOUR_API_KEY_HERE';

  if (loading) {
    return (
      <div className="chart-container p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded mb-4"></div>
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="h-4 bg-slate-700 rounded mb-2"></div>
          <div className="h-4 bg-slate-700 rounded mb-2"></div>
          <div className="h-4 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!goldPrice) {
    return (
      <div className="chart-container p-6">
        <div className="text-center text-slate-400">
          <WifiOff className="w-8 h-8 mx-auto mb-3" />
          <div className="text-lg font-medium mb-2">数据不可用</div>
          <div className="text-sm mb-3">无法获取黄金价格数据</div>
          <div className="text-xs text-slate-500">
            请检查网络连接或稍后重试
          </div>
        </div>
      </div>
    );
  }

  const isPositive = goldPrice.change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
  const bgColor = isPositive ? 'bg-green-500/20' : 'bg-red-500/20';
  const currentCurrencyInfo = currencyInfo[currency];

  return (
    <div className="chart-container p-6 space-y-6">
      {/* 数据来源指示器 */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          {hasApiKey ? (
            <>
              <Database className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">GoldAPI.io 真实数据</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400">模拟数据</span>
            </>
          )}
        </div>
      </div>

      {/* API配置提示 */}
      {!hasApiKey && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-blue-300 mb-1">
              💡 获取真实数据
            </div>
            <div className="text-xs text-blue-200">
              配置 GoldAPI.io 密钥以获取真实市场数据
            </div>
            <div className="text-xs text-blue-300 mt-1">
              访问 goldapi.io 获取免费API密钥
            </div>
          </div>
        </div>
      )}

      {/* 当前价格 */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <DollarSign className="w-5 h-5 text-gold-400 mr-1" />
          <span className="text-sm text-slate-400">当前价格 ({currentCurrencyInfo.unit})</span>
        </div>
        <div className="text-3xl font-bold text-white mb-2">
          {currentCurrencyInfo.formatPrice(goldPrice.price)}
        </div>
        <div className={`flex items-center justify-center space-x-2 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="font-medium">
            {isPositive ? '+' : ''}{currentCurrencyInfo.symbol}{Math.abs(goldPrice.change).toFixed(2)}
          </span>
          <span className="text-sm">
            ({isPositive ? '+' : ''}{goldPrice.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* 24小时统计 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
          24小时统计
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">最高</div>
            <div className="text-lg font-semibold text-green-400">
              {currentCurrencyInfo.formatPrice(goldPrice.high24h)}
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">最低</div>
            <div className="text-lg font-semibold text-red-400">
              {currentCurrencyInfo.formatPrice(goldPrice.low24h)}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">成交量</div>
          <div className="text-lg font-semibold text-blue-400">
            {(goldPrice.volume / 1000000).toFixed(2)}M
          </div>
        </div>
      </div>

      {/* 货币信息 */}
      <div className="bg-slate-800/30 p-3 rounded-lg">
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-1">计价单位</div>
          <div className="text-lg font-semibold text-gold-400">
            {currentCurrencyInfo.unit}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {currency === 'USD' ? '国际标准计价' : '国内常用计价'}
          </div>
        </div>
      </div>

      {/* 更新时间 */}
      <div className="pt-4 border-t border-slate-700">
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>
            更新时间: {dayjs(goldPrice.timestamp).format('HH:mm:ss')}
          </span>
        </div>
        <div className="text-center text-xs text-slate-500 mt-1">
          数据来源: {hasApiKey ? 'GoldAPI.io 真实市场数据' : '模拟市场数据'}
        </div>
      </div>

      {/* 市场状态 */}
      <div className={`p-3 rounded-lg ${bgColor} border border-opacity-30 ${isPositive ? 'border-green-500' : 'border-red-500'}`}>
        <div className="text-center">
          <div className="text-sm font-medium text-white mb-1">
            市场趋势
          </div>
          <div className={`text-lg font-bold ${trendColor}`}>
            {isPositive ? '看涨' : '看跌'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {currency === 'USD' ? '国际金价' : '国内金价'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceInfo; 