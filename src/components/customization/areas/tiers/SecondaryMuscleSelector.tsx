import React, { useState, useCallback } from 'react';
import { Settings, ChevronDown, ChevronUp, X } from 'lucide-react';
import { HierarchicalSelectionData } from '../../../../types/areas';
import { UserProfile } from '../../../../types/user';
import { getSecondaryMuscles, hasTertiaryChildren, PRIMARY_REGIONS } from '../data';

interface SecondaryMuscleSelectorProps {
  primaryRegionValue: string;
  hierarchicalData: HierarchicalSelectionData;
  onChange: (data: HierarchicalSelectionData) => void;
  disabled?: boolean;
  userProfile?: UserProfile;
  onMuscleExpand?: (muscleValue: string) => void;
  onMuscleCollapse?: (muscleValue: string) => void;
  expandedMuscles?: Set<string>;
  onSectionClose?: () => void;
}

const getSecondaryButtonClass = (isSelected: boolean, disabled: boolean = false) => {
  const baseClass = "btn btn-sm justify-start h-auto min-h-[2.25rem] py-2 px-3 transition-all duration-200 w-full";
  
  if (disabled) {
    return `${baseClass} btn-disabled`;
  }
  
  if (isSelected) {
    return `${baseClass} btn-secondary border-secondary-focus bg-secondary text-secondary-content hover:bg-secondary-focus`;
  }
  
  return `${baseClass} btn-outline border-base-300 hover:border-secondary hover:bg-secondary hover:text-secondary-content`;
};

export const SecondaryMuscleSelector: React.FC<SecondaryMuscleSelectorProps> = ({
  primaryRegionValue,
  hierarchicalData,
  onChange,
  disabled = false,
  userProfile,
  onMuscleExpand,
  onMuscleCollapse,
  expandedMuscles = new Set(),
  onSectionClose
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Get secondary muscles for this primary region
  const secondaryMuscles = getSecondaryMuscles(primaryRegionValue);
  const primaryRegion = PRIMARY_REGIONS.find(r => r.value === primaryRegionValue);
  
  // Extract selected areas from hierarchical data
  const selectedAreas = Object.keys(hierarchicalData).filter(key => hierarchicalData[key]?.selected);
  
  // Handle secondary muscle toggle
  const handleMuscleToggle = useCallback((muscleValue: string) => {
    const isSelected = selectedAreas.includes(muscleValue);
    const isExpanded = expandedMuscles.has(muscleValue);
    
    if (isSelected) {
      // Remove muscle and all its descendants
      const newHierarchicalData = { ...hierarchicalData };
      delete newHierarchicalData[muscleValue];
      
      // Remove all tertiary children
      Object.keys(newHierarchicalData).forEach(key => {
        const item = newHierarchicalData[key];
        if (item.parentKey === muscleValue) {
          delete newHierarchicalData[key];
        }
      });
      
      // Notify about collapse
      if (isExpanded) {
        onMuscleCollapse?.(muscleValue);
      }
      
      onChange(newHierarchicalData);
    } else {
      // Add muscle
      const muscle = secondaryMuscles.find(m => m.value === muscleValue);
      const newHierarchicalData = {
        ...hierarchicalData,
        [muscleValue]: {
          selected: true,
          label: muscle?.label || muscleValue,
          level: 'secondary' as const,
          parentKey: primaryRegionValue,
          children: hasTertiaryChildren(muscleValue) ? [] : undefined
        }
      };
      
      // Auto-expand if muscle has tertiary children
      if (hasTertiaryChildren(muscleValue)) {
        onMuscleExpand?.(muscleValue);
      }
      
      onChange(newHierarchicalData);
    }
  }, [selectedAreas, hierarchicalData, onChange, onMuscleExpand, onMuscleCollapse, expandedMuscles, primaryRegionValue, secondaryMuscles]);

  // Handle expansion toggle
  const handleExpansionToggle = useCallback((muscleValue: string) => {
    const isExpanded = expandedMuscles.has(muscleValue);
    
    if (isExpanded) {
      onMuscleCollapse?.(muscleValue);
    } else {
      onMuscleExpand?.(muscleValue);
    }
  }, [expandedMuscles, onMuscleExpand, onMuscleCollapse]);

  if (!primaryRegion || secondaryMuscles.length === 0) {
    return null;
  }

  return (
    <div className="border border-base-300 rounded-lg p-4 bg-base-50">
      {/* Header with Advanced Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-base-content">{primaryRegion.label} - Specific Muscles</h4>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <Settings className="w-3 h-3" />
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-sm text-base-content/80 mt-1">
            Select specific muscle groups within {primaryRegion.label.toLowerCase()}:
          </p>
        </div>
        <button
          type="button"
          className="btn btn-xs btn-ghost"
          onClick={onSectionClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Advanced Info Panel */}
      {showAdvanced && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <div className="font-medium text-blue-900">Muscle Groups in {primaryRegion.label}</div>
            <div className="text-blue-700 mt-1">
              {secondaryMuscles.length} muscle groups available
            </div>
            {userProfile && (
              <div className="text-blue-600 mt-1">
                Recommended for {userProfile.fitnessLevel} level
              </div>
            )}
          </div>
        </div>
      )}

      {/* Secondary Muscle Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {secondaryMuscles.map((muscle) => {
          const isSelected = selectedAreas.includes(muscle.value);
          const isExpanded = expandedMuscles.has(muscle.value);
          const hasChildren = hasTertiaryChildren(muscle.value);

          return (
            <div key={muscle.value} className="relative">
              <button
                type="button"
                className={getSecondaryButtonClass(isSelected, disabled)}
                onClick={() => handleMuscleToggle(muscle.value)}
                disabled={disabled}
                title={hasChildren ? "Click to select or expand for specific areas" : ""}
              >
                <span className="flex-1 text-left">{muscle.label}</span>
                {isSelected && hasChildren && (
                  <button
                    type="button"
                    className="ml-2 badge badge-secondary-content badge-xs flex-shrink-0 hover:bg-secondary-focus"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpansionToggle(muscle.value);
                    }}
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                )}
              </button>
              
              {/* Advanced Info Panel for Individual Muscles */}
              {showAdvanced && isSelected && (
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                  <div className="font-medium text-gray-900">{muscle.label}</div>
                  <div className="text-gray-600">
                    {hasChildren 
                      ? `${isExpanded ? 'Expanded' : 'Collapsed'} • Has specific areas`
                      : 'No sub-areas'
                    }
                  </div>
                  {muscle.hasTertiary && (
                    <div className="text-gray-500 mt-1">
                      Advanced targeting available
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary for this Primary Region */}
      {selectedAreas.some(area => hierarchicalData[area]?.level === 'secondary' && hierarchicalData[area]?.parentKey === primaryRegionValue) && (
        <div className="mt-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
          <h5 className="font-medium text-secondary-content mb-2">
            Selected Muscles in {primaryRegion.label}
          </h5>
          <div className="flex flex-wrap gap-2">
            {selectedAreas
              .filter(area => hierarchicalData[area]?.level === 'secondary' && hierarchicalData[area]?.parentKey === primaryRegionValue)
              .map(area => (
                <span key={area} className="px-2 py-1 bg-secondary text-secondary-content rounded text-sm">
                  {hierarchicalData[area]?.label}
                </span>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}; 