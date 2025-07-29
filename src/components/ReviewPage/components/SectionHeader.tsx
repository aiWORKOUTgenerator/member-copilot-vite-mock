import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  badge: string;
  badgeColor: 'purple' | 'green' | 'orange' | 'blue' | 'teal' | 'red';
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

const getBadgeStyles = (color: SectionHeaderProps['badgeColor']) => {
  const baseStyles = 'w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm';
  const colorStyles = {
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    teal: 'bg-teal-500',
    red: 'bg-red-500'
  };
  return `${baseStyles} ${colorStyles[color]}`;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  badge,
  badgeColor,
  isExpanded,
  onToggle,
  className = ''
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        w-full px-4 py-3 bg-white rounded-lg border border-gray-200
        flex items-center justify-between
        hover:bg-gray-50 transition-colors duration-200
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className={getBadgeStyles(badgeColor)}>
          {badge}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>
      {isExpanded ? (
        <ArrowUp className="w-5 h-5 text-gray-500" />
      ) : (
        <ArrowDown className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );
};