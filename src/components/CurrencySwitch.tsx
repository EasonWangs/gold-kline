import React from 'react';
import { DollarSign, Coins } from 'lucide-react';

interface CurrencySwitchProps {
  currency: 'USD' | 'CNY';
  onCurrencyChange: (currency: 'USD' | 'CNY') => void;
}

const CurrencySwitch: React.FC<CurrencySwitchProps> = ({ currency, onCurrencyChange }) => {
  const currencies = [
    {
      code: 'USD' as const,
      name: '美元/盎司',
      icon: DollarSign,
      description: '国际金价'
    },
    {
      code: 'CNY' as const,
      name: '人民币/克',
      icon: Coins,
      description: '国内金价'
    }
  ];

  return (
    <div className="chart-container p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">计价单位</h3>
        <div className="text-sm text-slate-400">选择您偏好的计价方式</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {currencies.map((curr) => {
          const Icon = curr.icon;
          const isActive = currency === curr.code;
          
          return (
            <button
              key={curr.code}
              onClick={() => onCurrencyChange(curr.code)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isActive
                  ? 'border-gold-500 bg-gold-500/10 text-white'
                  : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  isActive ? 'bg-gold-500/20' : 'bg-slate-700'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-gold-400' : 'text-slate-400'
                  }`} />
                </div>
                
                <div className="text-left">
                  <div className="font-semibold text-sm">{curr.name}</div>
                  <div className="text-xs opacity-75">{curr.description}</div>
                </div>
              </div>
              
              {isActive && (
                <div className="mt-2 text-xs text-gold-400 font-medium">
                  ✓ 当前选择
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
        <div className="text-xs text-slate-400 text-center">
          💡 提示：美元/盎司为国际标准计价，人民币/克为国内常用计价
        </div>
      </div>
    </div>
  );
};

export default CurrencySwitch; 