import React, { useState, useEffect } from 'react';
import GoldChart from './components/GoldChart';
import Header from './components/Header';
import PriceInfo from './components/PriceInfo';
import MetalSwitch from './components/MetalSwitch';
import { fetchMetalPrice } from './services/goldApi';
import { MetalPrice, MetalType } from './types/gold';

function App() {
  const [metalPrice, setMetalPrice] = useState<MetalPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMetal, setCurrentMetal] = useState<MetalType>('gold');

  useEffect(() => {
    const loadMetalPrice = async () => {
      try {
        setLoading(true);
        const price = await fetchMetalPrice(currentMetal);
        setMetalPrice(price);
        setError(null);
      } catch (err) {
        const metalName = currentMetal === 'gold' ? '黄金' : '白银';
        setError(`获取${metalName}价格失败`);
        console.error(`Error fetching ${currentMetal} price:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadMetalPrice();

    // 每30秒更新一次价格
    const interval = setInterval(loadMetalPrice, 30000);

    return () => clearInterval(interval);
  }, [currentMetal]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-6">
        <Header />

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            {error}
          </div>
        )}


        {/* 金属切换器 */}
        <div className="mb-6 flex justify-center">
          <MetalSwitch
            currentMetal={currentMetal}
            onMetalChange={setCurrentMetal}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <GoldChart loading={loading} metal={currentMetal} />
          </div>

          <div className="lg:col-span-1">
            <PriceInfo metalPrice={metalPrice} loading={loading} metal={currentMetal} />
          </div>
        </div>

        {/* 数据说明 */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-blue-400 text-sm">ℹ️</div>
            <div>
              <h4 className="text-blue-300 font-medium mb-1">数据说明</h4>
              <p className="text-blue-200 text-sm">
                {currentMetal === 'gold'
                  ? '人民币价格来自上海金交所Au99.99数据，通过AKTools本地服务获取。'
                  : '人民币价格来自上海金交所Ag99.99数据，通过AKTools本地服务获取。'
                }
                显示单位为人民币/克，符合国内贵金属交易习惯。
              </p>
            </div>
          </div>
        </div>

        {/* 数据来源说明 */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            数据来源：上海金交所 {currentMetal === 'gold' ? 'Au99.99' : 'Ag99.99'} | AKTools本地服务 | 更新频率：30秒 | 人民币/克
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;