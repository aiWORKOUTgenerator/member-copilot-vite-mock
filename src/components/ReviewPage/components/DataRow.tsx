import React from 'react';
import { DataRowProps } from '../types';

export const DataRow: React.FC<DataRowProps> = ({ 
  label, 
  value, 
  icon: Icon 
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center">
      {Icon && <Icon className="w-4 h-4 text-gray-500 mr-2" />}
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
    <div className="text-sm text-gray-900 font-medium text-right">
      {Array.isArray(value) ? (
        <div className="space-y-1">
          {value.map((item, index) => (
            <div key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
              {item}
            </div>
          ))}
        </div>
      ) : (
        <span className="bg-gray-50 px-2 py-1 rounded">{value}</span>
      )}
    </div>
  </div>
); 