import React, { ReactNode } from 'react';

export interface ConfidenceTooltipProps {
  children: ReactNode;
  className?: string;
}

export const ConfidenceTooltip: React.FC<ConfidenceTooltipProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 ${className}`}>
      {children}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
    </div>
  );
}; 