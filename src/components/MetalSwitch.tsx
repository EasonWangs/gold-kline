import React from 'react';
import { Coins, Gem } from 'lucide-react';
import { MetalType } from '../types/gold';

interface MetalSwitchProps {
  currentMetal: MetalType;
  onMetalChange: (metal: MetalType) => void;
}

const MetalSwitch: React.FC<MetalSwitchProps> = ({ currentMetal, onMetalChange }) => {
  const metals = [
    {
      type: 'gold' as MetalType,
      name: '黄金',
      symbol: 'Au99.99',
      icon: Coins,
      color: 'text-yellow-400',
      activeColor: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-500/20'
    },
    {
      type: 'silver' as MetalType,
      name: '白银',
      symbol: 'Ag99.99',
      icon: Gem,
      color: 'text-gray-300',
      activeColor: 'bg-gray-400',
      hoverColor: 'hover:bg-gray-400/20'
    }
  ];

  return (
    <div className="flex items-center space-x-2 bg-slate-800 rounded-lg p-1">
      {metals.map((metal) => {
        const Icon = metal.icon;
        const isActive = currentMetal === metal.type;

        return (
          <button
            key={metal.type}
            onClick={() => onMetalChange(metal.type)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isActive
                ? `${metal.activeColor} text-white shadow-md`
                : `text-slate-400 ${metal.hoverColor} hover:text-white`
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : metal.color}`} />
            <span>{metal.name}</span>
            <span className="text-xs opacity-75">({metal.symbol})</span>
          </button>
        );
      })}
    </div>
  );
};

export default MetalSwitch;