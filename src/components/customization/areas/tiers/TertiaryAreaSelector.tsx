import React, { useState, useCallback } from 'react';
import { Settings, ChevronDown, ChevronUp, X } from 'lucide-react';
import { HierarchicalSelectionData } from '../../../../types/areas';
import { UserProfile } from '../../../../types/user';
import { getTertiaryAreas, getSecondaryMuscles, PRIMARY_REGIONS } from '../data';

interface TertiaryAreaSelectorProps {
  secondaryMuscleValue: string;
  hierarchicalData: HierarchicalSelectionData;
  onChange: (data: HierarchicalSelectionData) => void;
  disabled?: boolean;
  userProfile?: UserProfile;
  onSectionClose?: () => void;
}

export const TertiaryAreaSelector: React.FC<TertiaryAreaSelectorProps> = ({
  secondaryMuscleValue,
  hierarchicalData,
  onChange,
  disabled = false,
  userProfile,
  onSectionClose
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Get tertiary areas for this secondary muscle
  const tertiaryAreas = getTertiaryAreas(secondaryMuscleValue);
  
  // Find the secondary muscle info and its parent primary region
  const secondaryMuscle = hierarchicalData[secondaryMuscleValue];
  const primaryRegionValue = secondaryMuscle?.parentKey;
  const primaryRegion = PRIMARY_REGIONS.find(r => r.value === primaryRegionValue);
  
  // Extract selected areas from hierarchical data
  const selectedAreas = Object.keys(hierarchicalData).filter(key => hierarchicalData[key]?.selected);
  
  // Handle tertiary area toggle
  const handleAreaToggle = useCallback((areaValue: string) => {
    const isSelected = selectedAreas.includes(areaValue);
    
    if (isSelected) {
      // Remove area
      const newHierarchicalData = { ...hierarchicalData };
      delete newHierarchicalData[areaValue];
      
      onChange(newHierarchicalData);
    } else {
      // Add area
      const area = tertiaryAreas.find(a => a.value === areaValue);
      const newHierarchicalData = {
        ...hierarchicalData,
        [areaValue]: {
          selected: true,
          label: area?.label || areaValue,
          level: 'tertiary' as const,
          parentKey: secondaryMuscleValue,
          children: undefined
        }
      };
      
      onChange(newHierarchicalData);
    }
  }, [selectedAreas, hierarchicalData, onChange, secondaryMuscleValue, tertiaryAreas]);

  if (!secondaryMuscle || tertiaryAreas.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 bg-base-100 border border-base-200 rounded-lg p-4">
      {/* Header with Advanced Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h5 className="font-medium text-base-content text-sm">
              {secondaryMuscle.label} - Specific Areas
            </h5>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <Settings className="w-3 h-3" />
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-sm text-base-content/80 mt-1">
            Target specific areas within {secondaryMuscle.label.toLowerCase()}:
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
            <div className="font-medium text-blue-900">
              Specific Areas in {secondaryMuscle.label}
            </div>
            <div className="text-blue-700 mt-1">
              {tertiaryAreas.length} specific areas available
            </div>
            {primaryRegion && (
              <div className="text-blue-600 mt-1">
                Part of {primaryRegion.label} region
              </div>
            )}
            {userProfile && (
              <div className="text-blue-500 mt-1">
                Advanced targeting for {userProfile.fitnessLevel} level
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tertiary Area Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tertiaryAreas.map((area) => {
          const isSelected = selectedAreas.includes(area.value);

          return (
            <div key={area.value} className="relative">
              <label className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-base-200 transition-colors border border-base-300">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-accent"
                  checked={isSelected}
                  onChange={() => handleAreaToggle(area.value)}
                  disabled={disabled}
                />
                <span className="text-sm text-base-content font-medium flex-1">
                  {area.label}
                </span>
              </label>
              
              {/* Advanced Info Panel for Individual Areas */}
              {showAdvanced && isSelected && (
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                  <div className="font-medium text-gray-900">{area.label}</div>
                  <div className="text-gray-600">
                    Specific targeting area
                  </div>
                  <div className="text-gray-500 mt-1">
                    Terminal selection (no sub-areas)
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary for this Secondary Muscle */}
      {selectedAreas.some(area => hierarchicalData[area]?.level === 'tertiary' && hierarchicalData[area]?.parentKey === secondaryMuscleValue) && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
          <h6 className="font-medium text-accent-content mb-2">
            Selected Areas in {secondaryMuscle.label}
          </h6>
          <div className="flex flex-wrap gap-2">
            {selectedAreas
              .filter(area => hierarchicalData[area]?.level === 'tertiary' && hierarchicalData[area]?.parentKey === secondaryMuscleValue)
              .map(area => (
                <span key={area} className="px-2 py-1 bg-accent text-accent-content rounded text-sm">
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