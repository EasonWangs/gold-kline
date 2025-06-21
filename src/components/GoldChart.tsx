import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData as LightweightCandlestickData, Time } from 'lightweight-charts';
import { fetchHistoricalData } from '../services/goldApi';
import { CandlestickData } from '../types/gold';
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';

interface GoldChartProps {
  loading: boolean;
  currency: 'USD' | 'CNY';
}

const GoldChart: React.FC<GoldChartProps> = ({ loading, currency }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [timeframe, setTimeframe] = useState('1D');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 创建图表
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#4b5563',
      },
      timeScale: {
        borderColor: '#4b5563',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 创建K线系列
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // 加载历史数据
    const loadData = async () => {
      try {
        setChartLoading(true);
        const data = await fetchHistoricalData(30, currency);
        
        if (data.length === 0) {
          console.warn('历史数据不可用');
          setHasData(false);
          return;
        }
        
        // 转换数据格式
        const chartData: LightweightCandlestickData[] = data.map((item: CandlestickData) => ({
          time: item.time as Time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        candlestickSeries.setData(chartData);
        chart.timeScale().fitContent();
        setHasData(true);
      } catch (error) {
        console.error('加载图表数据失败:', error);
        setHasData(false);
      } finally {
        setChartLoading(false);
      }
    };

    loadData();

    // 处理窗口大小变化
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) {
        chart.remove();
      }
    };
  }, [currency]);

  const refreshChart = async () => {
    if (!candlestickSeriesRef.current) return;
    
    try {
      setChartLoading(true);
      const data = await fetchHistoricalData(30, currency);
      
      if (data.length === 0) {
        console.warn('历史数据不可用');
        setHasData(false);
        return;
      }
      
      const chartData: LightweightCandlestickData[] = data.map((item: CandlestickData) => ({
        time: item.time as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      candlestickSeriesRef.current.setData(chartData);
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
      setHasData(true);
    } catch (error) {
      console.error('刷新图表数据失败:', error);
      setHasData(false);
    } finally {
      setChartLoading(false);
    }
  };

  const timeframes = [
    { label: '1分钟', value: '1m' },
    { label: '5分钟', value: '5m' },
    { label: '15分钟', value: '15m' },
    { label: '1小时', value: '1h' },
    { label: '1天', value: '1D' },
    { label: '1周', value: '1W' },
  ];

  const currencyInfo = {
    USD: { symbol: '$', unit: '美元/盎司' },
    CNY: { symbol: '¥', unit: '人民币/克' }
  };

  return (
    <div className="chart-container p-6">
      {/* 图表头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-gold-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">黄金价格走势</h2>
            <p className="text-sm text-slate-400">{currencyInfo[currency].unit}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 时间周期选择 */}
          <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeframe === tf.value
                    ? 'bg-gold-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          
          {/* 刷新按钮 */}
          <button
            onClick={refreshChart}
            disabled={chartLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${chartLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 图表容器 */}
      <div className="relative">
        {(loading || chartLoading) && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 text-gold-400 animate-spin" />
              <span className="text-white">加载中...</span>
            </div>
          </div>
        )}
        
        {/* 无数据提示 */}
        {!loading && !chartLoading && !hasData && (
          <div className="absolute inset-0 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">历史数据暂不可用</h3>
              <p className="text-slate-400 text-sm mb-4 max-w-md">
                可能原因：API配额限制、网络问题或周末/节假日无交易数据
              </p>
              <p className="text-slate-500 text-xs mb-4">
                请查看上方的实时价格信息获取当前黄金价格
              </p>
              <button
                onClick={refreshChart}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm rounded-lg transition-colors"
              >
                重试加载历史数据
              </button>
            </div>
          </div>
        )}
        
        <div
          ref={chartContainerRef}
          className="w-full h-[500px] bg-slate-900/30 rounded-lg"
        />
      </div>

      {/* 图表说明 */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>上涨</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>下跌</span>
          </div>
        </div>
        
        <div className="text-xs">
          {hasData 
            ? `数据来源: GoldAPI.io 真实历史数据 (${currencyInfo[currency].unit})` 
            : '当前仅显示实时价格数据 - 历史数据需要API配额支持'
          }
        </div>
      </div>
    </div>
  );
};

export default GoldChart; 