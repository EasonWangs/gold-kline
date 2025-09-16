import React from 'react';
import { TrendingUp, TrendingDown, Clock, WifiOff, Database, Coins, Gem } from 'lucide-react';
import { MetalPrice, MetalType } from '../types/gold';
import dayjs from 'dayjs';

interface PriceInfoProps {
  metalPrice: MetalPrice | null;
  loading: boolean;
  metal: MetalType;
}

const PriceInfo: React.FC<PriceInfoProps> = ({ metalPrice, loading, metal }) => {
  
  const currencyInfo = {
    symbol: '¥',
    unit: '人民币/克',
    formatPrice: (price: number) => `¥${price.toFixed(2)}`
  };


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

  if (!metalPrice) {
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

  const isPositive = metalPrice.change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
  const bgColor = isPositive ? 'bg-green-500/20' : 'bg-red-500/20';
  const currentCurrencyInfo = currencyInfo;
  const MetalIcon = metal === 'gold' ? Coins : Gem;
  const metalName = metal === 'gold' ? '黄金' : '白银';
  const metalColor = metal === 'gold' ? 'text-yellow-400' : 'text-gray-300';

  return (
    <div className="chart-container p-6 space-y-6">
      {/* 数据来源指示器 */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400">AKTools {metalName}真实数据</span>
        </div>
      </div>


      {/* 当前价格 */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <MetalIcon className={`w-5 h-5 mr-1 ${
metalColor
          }`} />
          <span className="text-sm text-slate-400">黄金当前价格 ({currentCurrencyInfo.unit})</span>
        </div>
        <div className="text-3xl font-bold text-white mb-2">
          {currentCurrencyInfo.formatPrice(metalPrice.price)}
        </div>
        <div className={`flex items-center justify-center space-x-2 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="font-medium">
            {isPositive ? '+' : ''}{currentCurrencyInfo.symbol}{Math.abs(metalPrice.change).toFixed(2)}
          </span>
          <span className="text-sm">
            ({isPositive ? '+' : ''}{metalPrice.changePercent.toFixed(2)}%)
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
              {currentCurrencyInfo.formatPrice(metalPrice.high24h)}
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-3 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">最低</div>
            <div className="text-lg font-semibold text-red-400">
              {currentCurrencyInfo.formatPrice(metalPrice.low24h)}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">成交量</div>
          <div className="text-lg font-semibold text-blue-400">
            {(metalPrice.volume / 1000000).toFixed(2)}M
          </div>
        </div>
      </div>

      {/* 金属信息 */}
      <div className="bg-slate-800/30 p-3 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <MetalIcon className={`w-4 h-4 mr-1 ${
  metalColor
            }`} />
            <div className="text-sm text-slate-400">黄金计价单位</div>
          </div>
          <div className={`text-lg font-semibold ${
metalColor
          }`}>
            {currentCurrencyInfo.unit}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            国内常用计价
          </div>
        </div>
      </div>

      {/* 更新时间 */}
      <div className="pt-4 border-t border-slate-700">
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>
            更新时间: {dayjs(metalPrice.timestamp).format('HH:mm:ss')}
          </span>
        </div>
        <div className="text-center text-xs text-slate-500 mt-1">
          数据来源: AKTools {metalName}真实市场数据
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
            国内黄金价
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceInfo; 