import React from 'react';
import { ChevronDown, ChevronUp, Expand, Minimize2, X } from 'lucide-react';

interface ExpansionControlsProps {
  isExpanded: boolean;
  onToggle: () => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  onClose?: () => void;
  level: 'primary' | 'secondary' | 'tertiary';
  itemCount?: number;
  selectedCount?: number;
  disabled?: boolean;
  className?: string;
}

const getControlsClass = (level: 'primary' | 'secondary' | 'tertiary') => {
  const baseClass = "flex items-center gap-2";
  
  switch (level) {
    case 'primary':
      return `${baseClass} text-primary-content`;
    case 'secondary':
      return `${baseClass} text-secondary-content`;
    case 'tertiary':
      return `${baseClass} text-accent-content`;
    default:
      return baseClass;
  }
};

const getButtonClass = (level: 'primary' | 'secondary' | 'tertiary', variant: 'primary' | 'secondary' = 'secondary') => {
  const baseClass = "btn btn-xs";
  
  if (variant === 'primary') {
    switch (level) {
      case 'primary':
        return `${baseClass} btn-primary`;
      case 'secondary':
        return `${baseClass} btn-secondary`;
      case 'tertiary':
        return `${baseClass} btn-accent`;
      default:
        return baseClass;
    }
  }
  
  return `${baseClass} btn-ghost`;
};

export const ExpansionControls: React.FC<ExpansionControlsProps> = ({
  isExpanded,
  onToggle,
  onExpandAll,
  onCollapseAll,
  onClose,
  level,
  itemCount,
  selectedCount,
  disabled = false,
  className = ""
}) => {
  const controlsClass = getControlsClass(level);
  const primaryButtonClass = getButtonClass(level, 'primary');
  const secondaryButtonClass = getButtonClass(level, 'secondary');

  return (
    <div className={`${controlsClass} ${className}`}>
      {/* Main expansion toggle */}
      <button
        type="button"
        className={primaryButtonClass}
        onClick={onToggle}
        disabled={disabled}
        title={isExpanded ? "Collapse section" : "Expand section"}
      >
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        <span className="ml-1">
          {isExpanded ? 'Collapse' : 'Expand'}
        </span>
      </button>

      {/* Expand/Collapse all controls */}
      {isExpanded && (onExpandAll || onCollapseAll) && (
        <div className="flex items-center gap-1">
          {onExpandAll && (
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={onExpandAll}
              disabled={disabled}
              title="Expand all sub-sections"
            >
              <Expand className="w-3 h-3" />
            </button>
          )}
          {onCollapseAll && (
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={onCollapseAll}
              disabled={disabled}
              title="Collapse all sub-sections"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Selection counter */}
      {(itemCount !== undefined || selectedCount !== undefined) && (
        <div className="flex items-center gap-1 text-xs opacity-70">
          {selectedCount !== undefined && itemCount !== undefined && (
            <span>
              {selectedCount}/{itemCount} selected
            </span>
          )}
          {selectedCount !== undefined && itemCount === undefined && (
            <span>
              {selectedCount} selected
            </span>
          )}
          {itemCount !== undefined && selectedCount === undefined && (
            <span>
              {itemCount} available
            </span>
          )}
        </div>
      )}

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={onClose}
          disabled={disabled}
          title="Close section"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}; 