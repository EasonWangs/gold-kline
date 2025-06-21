import React, { useState, useEffect } from 'react';
import GoldChart from './components/GoldChart';
import Header from './components/Header';
import PriceInfo from './components/PriceInfo';
import CurrencySwitch from './components/CurrencySwitch';
import { fetchGoldPrice } from './services/goldApi';
import { GoldPrice } from './types/gold';

function App() {
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'CNY'>('USD');

  useEffect(() => {
    const loadGoldPrice = async () => {
      try {
        setLoading(true);
        const price = await fetchGoldPrice(currency);
        setGoldPrice(price);
        setError(null);
      } catch (err) {
        setError('获取黄金价格失败');
        console.error('Error fetching gold price:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGoldPrice();
    
    // 每30秒更新一次价格
    const interval = setInterval(loadGoldPrice, 30000);
    
    return () => clearInterval(interval);
  }, [currency]);

  const handleCurrencyChange = (newCurrency: 'USD' | 'CNY') => {
    setCurrency(newCurrency);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-6">
        <Header />
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        {/* 货币切换器 */}
        <CurrencySwitch 
          currency={currency} 
          onCurrencyChange={handleCurrencyChange}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <GoldChart loading={loading} currency={currency} />
          </div>
          
          <div className="lg:col-span-1">
            <PriceInfo goldPrice={goldPrice} loading={loading} currency={currency} />
          </div>
        </div>
        
        {/* 汇率说明 */}
        {currency === 'CNY' && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-blue-400 text-sm">ℹ️</div>
              <div>
                <h4 className="text-blue-300 font-medium mb-1">数据说明</h4>
                <p className="text-blue-200 text-sm">
                  人民币价格直接来自GoldAPI.io的XAU/CNY接口，为真实的市场数据。
                  显示单位为人民币/克，符合国内黄金交易习惯。
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 数据来源说明 */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            数据来源：GoldAPI.io 真实市场数据 | 更新频率：30秒 | 
            {currency === 'USD' ? '美元/盎司（国际金价）' : '人民币/克（国内金价）'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App; 