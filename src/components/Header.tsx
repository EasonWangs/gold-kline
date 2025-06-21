import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gold-500/20 rounded-full">
            <TrendingUp className="w-8 h-8 text-gold-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              黄金K线图
            </h1>
            <p className="text-slate-400 text-lg">实时监测黄金走势</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4" />
          <span>实时数据</span>
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>每30秒更新</span>
      </div>
    </header>
  );
};

export default Header; 