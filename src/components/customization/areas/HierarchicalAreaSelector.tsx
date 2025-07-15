import React, { useState, useCallback } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { HierarchicalSelectionData } from '../../../types/areas';
import { UserProfile } from '../../../types/user';
import { buildHierarchicalPath } from './data';
import { PrimaryRegionSelector, SecondaryMuscleSelector, TertiaryAreaSelector } from './tiers';

interface HierarchicalAreaSelectorProps {
  data: HierarchicalSelectionData;
  onChange: (data: HierarchicalSelectionData) => void;
  userProfile?: UserProfile;
  disabled?: boolean;
}

const generateHierarchicalBadgeClass = (level: 'primary' | 'secondary' | 'tertiary', size: 'sm' | 'md' = 'sm') => {
  const baseClass = `badge badge-${size}`;
  
  switch (level) {
    case 'primary':
      return `${baseClass} badge-primary`;
    case 'secondary':
      return `${baseClass} badge-secondary`;
    case 'tertiary':
      return `${baseClass} badge-accent`;
    default:
      return baseClass;
  }
};

const HierarchicalAreaSelector: React.FC<HierarchicalAreaSelectorProps> = ({
  data,
  onChange,
  userProfile,
  disabled = false
}) => {
  // Multi-level expansion state management
  const [expandedPrimary, setExpandedPrimary] = useState<Set<string>>(new Set());
  const [expandedSecondary, setExpandedSecondary] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Extract selected areas from hierarchical data
  const selectedAreas = Object.keys(data).filter(key => data[key]?.selected);
  
  // Primary region expansion handlers
  const handlePrimaryExpansion = useCallback((regionValue: string) => {
    setExpandedPrimary(prev => new Set(prev).add(regionValue));
  }, []);

  const handlePrimaryCollapse = useCallback((regionValue: string) => {
    setExpandedPrimary(prev => {
      const newSet = new Set(prev);
      newSet.delete(regionValue);
      
      // Also collapse all related secondary sections
      setExpandedSecondary(prev => {
        const newSecondary = new Set(prev);
        // Remove any secondary that belongs to this primary
        Object.keys(data).forEach(key => {
          if (data[key]?.level === 'secondary' && data[key]?.parentKey === regionValue) {
            newSecondary.delete(key);
          }
        });
        return newSecondary;
      });
      
      return newSet;
    });
  }, [data]);

  // Secondary muscle expansion handlers
  const handleSecondaryExpansion = useCallback((muscleValue: string) => {
    setExpandedSecondary(prev => new Set(prev).add(muscleValue));
  }, []);

  const handleSecondaryCollapse = useCallback((muscleValue: string) => {
    setExpandedSecondary(prev => {
      const newSet = new Set(prev);
      newSet.delete(muscleValue);
      return newSet;
    });
  }, []);

  // Close section handlers
  const handlePrimarySectionClose = useCallback((regionValue: string) => {
    handlePrimaryCollapse(regionValue);
  }, [handlePrimaryCollapse]);

  const handleSecondarySectionClose = useCallback((muscleValue: string) => {
    handleSecondaryCollapse(muscleValue);
  }, [handleSecondaryCollapse]);

  return (
    <div className="space-y-6">
      {/* Header with Advanced Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">Focus Areas</label>
          <p className="text-sm text-gray-500 mt-1">
            Select body regions and specific muscle groups to target
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

      {/* Primary Region Selector */}
      <PrimaryRegionSelector
        hierarchicalData={data}
        onChange={onChange}
        disabled={disabled}
        userProfile={userProfile}
        onRegionExpand={handlePrimaryExpansion}
        onRegionCollapse={handlePrimaryCollapse}
        expandedRegions={expandedPrimary}
      />

      {/* Secondary Level - Expandable sections for selected primaries */}
      {Array.from(expandedPrimary).map((regionValue) => {
        const isPrimarySelected = selectedAreas.includes(regionValue);
        
        return (
          isPrimarySelected && (
            <SecondaryMuscleSelector
              key={`${regionValue}-secondary`}
              primaryRegionValue={regionValue}
              hierarchicalData={data}
              onChange={onChange}
              disabled={disabled}
              userProfile={userProfile}
              onMuscleExpand={handleSecondaryExpansion}
              onMuscleCollapse={handleSecondaryCollapse}
              expandedMuscles={expandedSecondary}
              onSectionClose={() => handlePrimarySectionClose(regionValue)}
            />
          )
        );
      })}

      {/* Tertiary Level - Expandable sections for selected secondaries */}
      {Array.from(expandedSecondary).map((muscleValue) => {
        const isSecondarySelected = selectedAreas.includes(muscleValue);
        
        return (
          isSecondarySelected && (
            <TertiaryAreaSelector
              key={`${muscleValue}-tertiary`}
              secondaryMuscleValue={muscleValue}
              hierarchicalData={data}
              onChange={onChange}
              disabled={disabled}
              userProfile={userProfile}
              onSectionClose={() => handleSecondarySectionClose(muscleValue)}
            />
          )
        );
      })}

      {/* Advanced Information Panel */}
      {showAdvanced && selectedAreas.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Advanced Selection Info</h4>
          <div className="space-y-3">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Hierarchical Breakdown</h5>
              <div className="space-y-1 text-sm text-blue-700">
                <div>Total selections: {selectedAreas.length}</div>
                <div>Primary regions: {selectedAreas.filter(area => data[area]?.level === 'primary').length}</div>
                <div>Secondary muscles: {selectedAreas.filter(area => data[area]?.level === 'secondary').length}</div>
                <div>Tertiary areas: {selectedAreas.filter(area => data[area]?.level === 'tertiary').length}</div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Selection Paths</h5>
              <div className="space-y-1">
                {selectedAreas.slice(0, 5).map(area => (
                  <div key={area} className="text-sm text-blue-700">
                    {buildHierarchicalPath(area, data[area]?.level || 'primary')}
                  </div>
                ))}
                {selectedAreas.length > 5 && (
                  <div className="text-sm text-blue-600 italic">
                    ... and {selectedAreas.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedAreas.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Selected Focus Areas ({selectedAreas.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data)
              .filter(([, info]) => info.selected)
              .map(([key, info]) => {
                const badgeClass = generateHierarchicalBadgeClass(
                  info.level as 'primary' | 'secondary' | 'tertiary',
                  'sm'
                );
                
                // Build hierarchical label
                let label = info.label;
                if (info.level === 'secondary' && info.parentKey) {
                  const parent = data[info.parentKey];
                  if (parent) {
                    label = `${parent.label} > ${info.label}`;
                  }
                } else if (info.level === 'tertiary' && info.parentKey) {
                  const parent = data[info.parentKey];
                  const grandparent = parent?.parentKey ? data[parent.parentKey] : null;
                  if (grandparent && parent) {
                    label = `${grandparent.label} > ${parent.label} > ${info.label}`;
                  } else if (parent) {
                    label = `${parent.label} > ${info.label}`;
                  }
                }
                
                return (
                  <span key={key} className={badgeClass}>
                    {label}
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalAreaSelector; 