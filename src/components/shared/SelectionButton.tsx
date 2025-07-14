import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SelectionButtonProps {
  label: string;
  description?: string;
  icon?: LucideIcon;
  value: string;
  selectedValue: string;
  onClick: (value: string) => void;
  variant?: 'default' | 'radio' | 'icon';
  gradient?: string;
}

const SelectionButton: React.FC<SelectionButtonProps> = ({
  label,
  description,
  icon: Icon,
  value,
  selectedValue,
  onClick,
  variant = 'default',
  gradient = 'from-blue-500 to-purple-600'
}) => {
  const isSelected = selectedValue === value;

  if (variant === 'icon' && Icon) {
    return (
      <button
        onClick={() => onClick(value)}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isSelected
            ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-xl scale-105'
            : 'border-white/30 bg-white/40 backdrop-blur-sm hover:border-blue-300/50 hover:bg-white/60 hover:scale-[1.02]'
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center mb-3`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-900">{label}</span>
        </div>
      </button>
    );
  }

  if (variant === 'radio') {
    return (
      <label className="group relative flex items-center p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <input
          type="radio"
          name={`radio-${value}`}
          value={value}
          checked={isSelected}
          onChange={() => onClick(value)}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
          isSelected
            ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
            : 'border-gray-300 bg-white/50 group-hover:border-blue-400'
        }`}>
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          )}
        </div>
        <div className="flex-1">
          <span className={`font-medium transition-colors duration-300 ${
            isSelected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
          }`}>{label}</span>
          {description && (
            <div className="text-sm text-gray-500 mt-1">{description}</div>
          )}
        </div>
        {isSelected && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
        )}
      </label>
    );
  }

  // Default variant
  return (
    <button
      onClick={() => onClick(value)}
      className={`p-4 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="font-medium">{label}</div>
      {description && (
        <div className="text-sm text-gray-500 mt-1">{description}</div>
      )}
    </button>
  );
};

export default SelectionButton; 