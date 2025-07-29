import React from 'react';
import { DataRowProps } from '../types';

export const DataRow: React.FC<DataRowProps> = ({ 
  label, 
  value, 
  icon: Icon,
  status,
  statusIcon: StatusIcon
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 text-green-700';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700';
      case 'error':
        return 'bg-red-50 text-red-700';
      case 'info':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-900';
    }
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="w-4 h-4 text-gray-500 mr-2" />}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-sm font-medium text-right flex items-center space-x-2">
        {Array.isArray(value) ? (
          <div className="space-y-1">
            {value.map((item, index) => (
              <div key={index} className={`px-2 py-1 rounded text-xs ${getStatusStyles()}`}>
                {item}
              </div>
            ))}
          </div>
        ) : (
          <>
            <span className={`px-2 py-1 rounded ${getStatusStyles()}`}>{value}</span>
            {StatusIcon && <StatusIcon className={`w-4 h-4 ${getStatusStyles()}`} />}
          </>
        )}
      </div>
    </div>
  );
}; 