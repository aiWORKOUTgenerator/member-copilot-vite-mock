import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AcknowledgmentCardProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
  variant?: 'default' | 'warning' | 'danger';
}

const AcknowledgmentCard: React.FC<AcknowledgmentCardProps> = ({
  title,
  description,
  checked,
  onChange,
  required = false,
  error,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'danger':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getCheckboxStyles = () => {
    switch (variant) {
      case 'warning':
        return 'text-yellow-600 focus:ring-yellow-500';
      case 'danger':
        return 'text-red-600 focus:ring-red-500';
      default:
        return 'text-blue-600 focus:ring-blue-500';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getVariantStyles()}`}>
      <label className="flex items-start">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={`mr-3 h-5 w-5 border-gray-300 rounded mt-0.5 ${getCheckboxStyles()}`}
          required={required}
        />
        <span className="text-gray-800">
          <strong>{title}</strong> {description}
        </span>
      </label>
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AcknowledgmentCard; 