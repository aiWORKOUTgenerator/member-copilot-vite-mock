import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface OptionConfig {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface OptionGridProps {
  options: OptionConfig[];
  selectedValues: string | string[];
  onSelect: (value: string) => void;
  multiple?: boolean;
  columns?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'radio' | 'icon';
  className?: string;
  disabled?: boolean;
  error?: string;
  'aria-label'?: string;
}

const OptionGrid: React.FC<OptionGridProps> = ({
  options,
  selectedValues,
  onSelect,
  multiple = false,
  columns = 3,
  variant = 'default',
  className = '',
  disabled = false,
  error,
  'aria-label': ariaLabel
}) => {
  const isSelected = (value: string): boolean => {
    if (Array.isArray(selectedValues)) {
      return selectedValues.includes(value);
    }
    return selectedValues === value;
  };

  const getColumnClass = () => {
    const columnMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4'
    };
    return columnMap[columns];
  };

  const getButtonClass = (option: OptionConfig) => {
    const baseClass = 'transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    const isOptionSelected = isSelected(option.value);
    const isDisabled = disabled || option.disabled;

    if (variant === 'icon' && option.icon) {
      return `${baseClass} p-4 rounded-xl border-2 cursor-pointer ${
        isOptionSelected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-xl scale-105'
          : 'border-white/30 bg-white/40 backdrop-blur-sm hover:border-blue-300/50 hover:bg-white/60 hover:scale-[1.02]'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`;
    }

    if (variant === 'radio') {
      return `${baseClass} group relative flex items-center p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/60 hover:border-white/30 cursor-pointer hover:scale-[1.02] ${
        isDisabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
      }`;
    }

    // Default variant
    return `${baseClass} p-4 rounded-lg border-2 text-left ${
      isOptionSelected
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-200 hover:border-gray-300'
    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
  };

  const renderOption = (option: OptionConfig) => {
    const isOptionSelected = isSelected(option.value);

    if (variant === 'icon' && option.icon) {
      const IconComponent = option.icon;
      return (
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3">
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <span className="font-medium text-gray-900">{option.label}</span>
          {option.description && (
            <span className="text-sm text-gray-500 mt-1">{option.description}</span>
          )}
        </div>
      );
    }

    if (variant === 'radio') {
      return (
        <>
          <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-300 ${
            isOptionSelected
              ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
              : 'border-gray-300 bg-white/50 group-hover:border-blue-400'
          }`}>
            {isOptionSelected && (
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            )}
          </div>
          <div className="flex-1">
            <span className={`font-medium transition-colors duration-300 ${
              isOptionSelected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
            }`}>{option.label}</span>
            {option.description && (
              <div className="text-sm text-gray-500 mt-1">{option.description}</div>
            )}
          </div>
          {isOptionSelected && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
          )}
        </>
      );
    }

    // Default variant
    return (
      <>
        <div className="font-medium">{option.label}</div>
        {option.description && (
          <div className="text-sm text-gray-500 mt-1">{option.description}</div>
        )}
      </>
    );
  };

  return (
    <div className={className}>
      <div 
        className={`grid ${getColumnClass()} gap-3`}
        role={multiple ? 'group' : 'radiogroup'}
        aria-label={ariaLabel}
        aria-invalid={!!error}
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => !disabled && !option.disabled && onSelect(option.value)}
            className={getButtonClass(option)}
            disabled={disabled || option.disabled}
            aria-pressed={multiple ? isSelected(option.value) : undefined}
            aria-checked={!multiple ? isSelected(option.value) : undefined}
            role={multiple ? 'button' : 'radio'}
            aria-describedby={error ? `${option.value}-error` : undefined}
          >
            {renderOption(option)}
          </button>
        ))}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default OptionGrid; 