import React, { useState, useCallback } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { HierarchicalSelectionData } from '../../../../types/areas';
import { UserProfile } from '../../../../types/user';
import { PRIMARY_REGIONS, hasSecondaryChildren } from '../data';

interface PrimaryRegionSelectorProps {
  hierarchicalData: HierarchicalSelectionData;
  onChange: (data: HierarchicalSelectionData) => void;
  disabled?: boolean;
  userProfile?: UserProfile;
  onRegionExpand?: (regionValue: string) => void;
  onRegionCollapse?: (regionValue: string) => void;
  expandedRegions?: Set<string>;
}

const getCustomizationButtonClass = (isSelected: boolean, disabled: boolean = false) => {
  const baseClass = "btn justify-start text-left transition-all duration-200 border-2";
  
  if (disabled) {
    return `${baseClass} btn-disabled`;
  }
  
  if (isSelected) {
    return `${baseClass} btn-primary border-primary-focus bg-primary text-primary-content hover:bg-primary-focus`;
  }
  
  return `${baseClass} btn-outline border-base-300 hover:border-primary hover:bg-primary hover:text-primary-content`;
};

export const PrimaryRegionSelector: React.FC<PrimaryRegionSelectorProps> = ({
  hierarchicalData,
  onChange,
  disabled = false,
  userProfile,
  onRegionExpand,
  onRegionCollapse,
  expandedRegions = new Set()
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Extract selected areas from hierarchical data
  const selectedAreas = Object.keys(hierarchicalData).filter(key => hierarchicalData[key]?.selected);
  
  // Handle primary region toggle
  const handleRegionToggle = useCallback((regionValue: string) => {
    const isSelected = selectedAreas.includes(regionValue);
    const isExpanded = expandedRegions.has(regionValue);
    
    if (isSelected) {
      // Remove region and all its descendants
      const newHierarchicalData = { ...hierarchicalData };
      delete newHierarchicalData[regionValue];
      
      // Remove all descendants
      Object.keys(newHierarchicalData).forEach(key => {
        const item = newHierarchicalData[key];
        if (item.parentKey === regionValue) {
          delete newHierarchicalData[key];
          // Also remove tertiary children
          Object.keys(newHierarchicalData).forEach(subKey => {
            const subItem = newHierarchicalData[subKey];
            if (subItem.parentKey === key) {
              delete newHierarchicalData[subKey];
            }
          });
        }
      });
      
      // Notify about collapse
      if (isExpanded) {
        onRegionCollapse?.(regionValue);
      }
      
      onChange(Object.keys(newHierarchicalData).length > 0 ? newHierarchicalData : {});
    } else {
      // Add region
      const newHierarchicalData = {
        ...hierarchicalData,
        [regionValue]: {
          selected: true,
          label: PRIMARY_REGIONS.find(r => r.value === regionValue)?.label || regionValue,
          level: 'primary' as const,
          parentKey: undefined,
          children: hasSecondaryChildren(regionValue) ? [] : undefined
        }
      };
      
      // Auto-expand if region has children
      if (hasSecondaryChildren(regionValue)) {
        onRegionExpand?.(regionValue);
      }
      
      onChange(newHierarchicalData);
    }
  }, [selectedAreas, hierarchicalData, onChange, onRegionExpand, onRegionCollapse, expandedRegions]);

  // Handle expansion toggle
  const handleExpansionToggle = useCallback((regionValue: string) => {
    const isExpanded = expandedRegions.has(regionValue);
    
    if (isExpanded) {
      onRegionCollapse?.(regionValue);
    } else {
      onRegionExpand?.(regionValue);
    }
  }, [expandedRegions, onRegionExpand, onRegionCollapse]);

  return (
    <div className="space-y-4">
      {/* Header with Advanced Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">Body Regions</label>
          <p className="text-sm text-gray-500 mt-1">
            Select the body regions or workout types you want to focus on:
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Advanced
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Region Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRIMARY_REGIONS.map((region) => {
          const isSelected = selectedAreas.includes(region.value);
          const isExpanded = expandedRegions.has(region.value);
          const hasChildren = hasSecondaryChildren(region.value);

          return (
            <div key={region.value} className="relative">
              <button
                type="button"
                className={`${getCustomizationButtonClass(isSelected, disabled)} h-auto min-h-[2.5rem] py-3 px-4 w-full`}
                onClick={() => handleRegionToggle(region.value)}
                disabled={disabled}
              >
                <span className="flex-1 text-left">{region.label}</span>
                {isSelected && hasChildren && (
                  <button
                    type="button"
                    className="ml-2 badge badge-primary-content badge-xs flex-shrink-0 hover:bg-primary-focus"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpansionToggle(region.value);
                    }}
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                )}
              </button>
              
              {/* Advanced Info Panel */}
              {showAdvanced && isSelected && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-blue-900">Region: {region.label}</div>
                    <div className="text-blue-700 mt-1">
                      {hasChildren 
                        ? `${isExpanded ? 'Expanded' : 'Collapsed'} • Has muscle groups`
                        : 'No sub-categories'
                      }
                    </div>
                    {userProfile && (
                      <div className="text-blue-600 mt-1">
                        Fitness Level: {userProfile.fitnessLevel} • 
                        {userProfile.goals?.includes('weight_loss') && region.value === 'cardio' && 
                          ' Recommended for weight loss'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedAreas.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Selected Regions ({selectedAreas.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedAreas
              .filter(area => hierarchicalData[area]?.level === 'primary')
              .map(area => (
                <span key={area} className="px-3 py-1 bg-primary text-primary-content rounded-full text-sm">
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