import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AreaSelectionButtonProps {
  value: string;
  label: string;
  description?: string;
  isSelected: boolean;
  isExpanded?: boolean;
  hasChildren?: boolean;
  disabled?: boolean;
  tier: 'primary' | 'secondary' | 'tertiary';
  icon?: LucideIcon;
  badge?: string;
  onClick: () => void;
  onExpansionToggle?: () => void;
  className?: string;
}

const getTierButtonClass = (tier: 'primary' | 'secondary' | 'tertiary', isSelected: boolean, disabled: boolean = false) => {
  const baseClass = "btn justify-start text-left transition-all duration-200 w-full";
  
  if (disabled) {
    return `${baseClass} btn-disabled`;
  }
  
  switch (tier) {
    case 'primary':
      const primaryClass = "border-2 h-auto min-h-[2.5rem] py-3 px-4";
      return isSelected 
        ? `${baseClass} ${primaryClass} btn-primary border-primary-focus bg-primary text-primary-content hover:bg-primary-focus`
        : `${baseClass} ${primaryClass} btn-outline border-base-300 hover:border-primary hover:bg-primary hover:text-primary-content`;
    
    case 'secondary':
      const secondaryClass = "btn-sm h-auto min-h-[2.25rem] py-2 px-3";
      return isSelected
        ? `${baseClass} ${secondaryClass} btn-secondary border-secondary-focus bg-secondary text-secondary-content hover:bg-secondary-focus`
        : `${baseClass} ${secondaryClass} btn-outline border-base-300 hover:border-secondary hover:bg-secondary hover:text-secondary-content`;
    
    case 'tertiary':
      return "flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-base-200 transition-colors border border-base-300";
    
    default:
      return baseClass;
  }
};

const ExpansionIndicator: React.FC<{ 
  isExpanded: boolean; 
  tier: 'primary' | 'secondary' | 'tertiary';
  onClick: (e: React.MouseEvent) => void;
}> = ({ isExpanded, tier, onClick }) => {
  const getIndicatorClass = () => {
    switch (tier) {
      case 'primary':
        return "ml-2 badge badge-primary-content badge-xs flex-shrink-0 hover:bg-primary-focus";
      case 'secondary':
        return "ml-2 badge badge-secondary-content badge-xs flex-shrink-0 hover:bg-secondary-focus";
      default:
        return "ml-2 badge badge-accent-content badge-xs flex-shrink-0 hover:bg-accent-focus";
    }
  };

  return (
    <button
      type="button"
      className={getIndicatorClass()}
      onClick={onClick}
    >
      {isExpanded ? '−' : '+'}
    </button>
  );
};

export const AreaSelectionButton: React.FC<AreaSelectionButtonProps> = ({
  value,
  label,
  description,
  isSelected,
  isExpanded = false,
  hasChildren = false,
  disabled = false,
  tier,
  icon: Icon,
  badge,
  onClick,
  onExpansionToggle,
  className = ""
}) => {
  const buttonClass = getTierButtonClass(tier, isSelected, disabled);
  const combinedClass = `${buttonClass} ${className}`;

  if (tier === 'tertiary') {
    return (
      <label className={combinedClass}>
        <input
          type="checkbox"
          className="checkbox checkbox-sm checkbox-accent"
          checked={isSelected}
          onChange={onClick}
          disabled={disabled}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            <span className="text-sm text-base-content font-medium">
              {label}
            </span>
            {badge && (
              <span className="badge badge-xs badge-outline">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-base-content/70 mt-1">
              {description}
            </p>
          )}
        </div>
      </label>
    );
  }

  return (
    <button
      type="button"
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
      title={hasChildren ? "Click to select or expand for more options" : ""}
    >
      <div className="flex items-center gap-2 flex-1">
        {Icon && <Icon className="w-4 h-4" />}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span>{label}</span>
            {badge && (
              <span className="badge badge-xs badge-outline">
                {badge}
              </span>
            )}
          </div>
          {description && tier === 'primary' && (
            <p className="text-xs opacity-70 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {isSelected && hasChildren && onExpansionToggle && (
        <ExpansionIndicator
          isExpanded={isExpanded}
          tier={tier}
          onClick={(e) => {
            e.stopPropagation();
            onExpansionToggle();
          }}
        />
      )}
    </button>
  );
}; 