import React, { useState, useCallback, useEffect } from 'react';
import { Target, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { PerWorkoutOptions, ValidationResult } from '../../../types/core';
import { HierarchicalAreaSelector } from './HierarchicalAreaSelector';
import { ValidationFeedback } from '../shared/ValidationFeedback';
import { ConflictWarning } from '../shared/ConflictWarning';
import { AIRecommendationPanel } from '../shared/AIRecommendationPanel';
import { useAIService } from '../../../contexts/composition/AIServiceProvider';
import { aiLogger } from '../../../services/ai/logging/AILogger';
import { PRIMARY_REGIONS, findOptionInfo, getAllDescendants, getParentKey } from './data';

// Helper function to consistently extract focus areas value
const getCurrentAreas = (value: string[] | HierarchicalSelectionData): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).filter(key => value[key]?.selected);
  }
  return [];
};

// Helper function to check if value is complex object
const isComplexValue = (value: string[] | HierarchicalSelectionData): value is HierarchicalSelectionData => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// Helper function to create default complex areas data
const createComplexAreasData = (
  selectedAreas: string[]
): HierarchicalSelectionData => {
  const hierarchicalData: HierarchicalSelectionData = {};
  
  selectedAreas.forEach(area => {
    const optionInfo = findOptionInfo(area);
    if (optionInfo) {
      hierarchicalData[area] = {
        selected: true,
        label: optionInfo.label,
        level: optionInfo.level,
        parentKey: getParentKey(area, optionInfo.level),
        children: undefined // Will be populated when needed
      };
    }
  });
  
  return hierarchicalData;
};

// AI-powered focus areas analysis and recommendations
const generateAreasRecommendations = (
  userProfile: UserProfile | undefined,
  aiContext: AIRecommendationContext | undefined,
  currentAreas: string[]
): {
  recommendations: string[];
  warnings: string[];
  optimizations: string[];
} => {
  const recommendations: string[] = [];
  const warnings: string[] = [];
  const optimizations: string[] = [];

  if (!userProfile || !aiContext) {
    return { recommendations, warnings, optimizations };
  }

  // User profile-based recommendations
  if (userProfile.fitnessLevel === 'new to exercise' && currentAreas.includes('Full Body')) {
    recommendations.push('Consider focusing on specific areas first to build foundation');
  }

  if (userProfile.goals?.includes('weight_loss') && !currentAreas.includes('Cardio')) {
    recommendations.push('Add cardio training to support weight loss goals');
  }

  if (userProfile.basicLimitations?.injuries && 
      userProfile.basicLimitations.injuries.length > 0 && 
      currentAreas.includes('Core')) {
    warnings.push('Core training may need modification with current injuries');
  }

  // Balance recommendations
  const hasUpper = currentAreas.includes('Upper Body');
  const hasLower = currentAreas.includes('Lower Body');
  const hasCore = currentAreas.includes('Core');

  if (hasUpper && !hasLower && !hasCore) {
    optimizations.push('Consider adding lower body or core for balanced training');
  }

  if (hasLower && !hasUpper && !hasCore) {
    optimizations.push('Consider adding upper body or core for balanced training');
  }

  if (currentAreas.length > 4) {
    warnings.push('Too many focus areas may reduce workout effectiveness');
    optimizations.push('Consider limiting to 2-3 focus areas for better results');
  }

  // Context-based recommendations
  if (aiContext.currentSelections?.customization_duration) {
    const duration = typeof aiContext.currentSelections.customization_duration === 'number'
      ? aiContext.currentSelections.customization_duration
      : aiContext.currentSelections.customization_duration?.totalDuration;
    
    if (duration && duration < 30 && currentAreas.length > 3) {
      warnings.push('Short duration may limit effectiveness with many focus areas');
      optimizations.push('Consider reducing focus areas for shorter workouts');
    }
  }

  return { recommendations, warnings, optimizations };
};

// Type guard for UserProfile
const isValidUserProfile = (profile: UserProfile | undefined): profile is UserProfile => {
  return profile !== undefined && 
         typeof profile.fitnessLevel === 'string' &&
         Array.isArray(profile.goals);
};

// Type guard for AIRecommendationContext
const isValidAIContext = (context: AIRecommendationContext | undefined): context is AIRecommendationContext => {
  return context !== undefined && 
         typeof context.currentSelections === 'object' &&
         context.currentSelections !== null;
};

// AI recommendation component
const AIRecommendationPanel: React.FC<{
  userProfile: UserProfile | undefined;
  aiContext: AIRecommendationContext | undefined;
  currentAreas: string[];
  onApplyRecommendation: (recommendation: string, areas: string[]) => void;
}> = ({ userProfile, aiContext, currentAreas, onApplyRecommendation }) => {
  const [aiInsights, setAIInsights] = useState<{
    recommendations: string[];
    warnings: string[];
    optimizations: string[];
  }>({ recommendations: [], warnings: [], optimizations: [] });

  const updateAIInsights = useCallback(() => {
    if (isValidUserProfile(userProfile) && isValidAIContext(aiContext)) {
      const insights = generateAreasRecommendations(userProfile, aiContext, currentAreas);
      setAIInsights(insights);
    }
  }, [userProfile, aiContext, currentAreas]);

  useEffect(() => {
    updateAIInsights();
  }, [updateAIInsights]);

  if (!isValidUserProfile(userProfile) || !isValidAIContext(aiContext)) {
    return null;
  }

  const hasAnyInsights = aiInsights.recommendations.length > 0 || 
                        aiInsights.warnings.length > 0 || 
                        aiInsights.optimizations.length > 0;

  if (!hasAnyInsights) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* AI Warnings */}
      {aiInsights.warnings.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-1">Caution</h4>
              {aiInsights.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-red-700">{warning}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {aiInsights.recommendations.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800 mb-2">AI Recommendations</h4>
              <div className="space-y-2">
                {aiInsights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start justify-between">
                    <p className="text-sm text-blue-700 flex-1">{rec}</p>
                    {rec.includes('cardio') && (
                      <button
                        onClick={() => onApplyRecommendation(rec, [...currentAreas, 'Cardio'])}
                        className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    )}
                    {rec.includes('specific areas') && (
                      <button
                        onClick={() => onApplyRecommendation(rec, ['Upper Body', 'Lower Body'])}
                        className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Optimizations */}
      {aiInsights.optimizations.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Optimization Tips</h4>
              {aiInsights.optimizations.map((tip, index) => (
                <p key={index} className="text-sm text-yellow-700">{tip}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FocusAreasCustomization: React.FC<CustomizationComponentProps<string[] | HierarchicalSelectionData>> = ({
  value = [],
  onChange,
  userProfile,
  aiContext,
  onAIRecommendationApply
}) => {
  // Consistent state management
  const [isAdvanced, setIsAdvanced] = useState(isComplexValue(value));
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  
  // Create area options from the hierarchical data for simple mode
  const areaOptions = PRIMARY_REGIONS.map(region => {
    // Add descriptions for each region
    const descriptions: Record<string, string> = {
      upper_body: 'Chest, back, shoulders, arms',
      lower_body: 'Legs, glutes, calves',
      core: 'Abs, obliques, lower back',
      full_body: 'Total body integration',
      mobility: 'Flexibility and range of motion',
      recovery: 'Stretching and recovery movements'
    };
    
    return {
      value: region.value,
      label: region.label,
      description: descriptions[region.value] || '',
      metadata: {
        icon: Activity,
        anatomicalGroup: region.value,
        difficultyLevel: 'some experience' as const
      }
    };
  });

  // Consistent areas value extraction
  const currentAreas = getCurrentAreas(value);
  
  // Always show advanced options for areas (hierarchical selection provides more value)
  const hasAdvancedOptions = true;
  
  // Sync advanced mode with actual data structure
  useEffect(() => {
    const valueIsComplex = isComplexValue(value);
    if (isAdvanced !== valueIsComplex) {
      setIsAdvanced(valueIsComplex);
    }
  }, [value, isAdvanced]);

  // AI-powered areas recommendations
  const handleAIRecommendationApply = useCallback((recommendation: string, areas: string[]) => {
    if (isAdvanced) {
      const complexAreas = createComplexAreasData(areas);
      onChange(complexAreas);
    } else {
      onChange(areas);
    }
    onAIRecommendationApply?.(recommendation);
  }, [isAdvanced, onChange, onAIRecommendationApply]);

  // Handle area selection
  const handleAreaSelect = useCallback((area: string) => {
    if (isAdvanced) {
      const complexData = isComplexValue(value) ? { ...value } : createComplexAreasData(currentAreas);
      
      if (complexData[area]) {
        complexData[area].selected = !complexData[area].selected;
        if (!complexData[area].selected) {
          // Remove the area itself
          delete complexData[area];
          
          // Remove all descendants (cascading deletion)
          const optionInfo = findOptionInfo(area);
          if (optionInfo) {
            const descendants = getAllDescendants(area, optionInfo.level);
            descendants.forEach(descendant => {
              delete complexData[descendant];
            });
          }
        }
      } else {
        const optionInfo = findOptionInfo(area);
        if (optionInfo) {
          complexData[area] = {
            selected: true,
            label: optionInfo.label,
            level: optionInfo.level,
            parentKey: getParentKey(area, optionInfo.level),
            children: undefined
          };
        }
      }
      onChange(complexData);
    } else {
      const currentAreas = Array.isArray(value) ? value : [];
      const newAreas = currentAreas.includes(area)
        ? currentAreas.filter(a => a !== area)
        : [...currentAreas, area];
      onChange(newAreas);
    }
  }, [isAdvanced, value, currentAreas, onChange]);

  // Handle mode toggle
  const handleToggle = useCallback(() => {
    if (isAdvanced) {
      // Convert from complex to simple
      const simpleAreas = getCurrentAreas(value);
      onChange(simpleAreas);
      setIsAdvanced(false);
    } else {
      // Convert from simple to complex
      const complexAreas = createComplexAreasData(currentAreas);
      onChange(complexAreas);
      setIsAdvanced(true);
    }
  }, [isAdvanced, value, currentAreas, onChange]);
  
  // Advanced Mode Rendering
  if (isAdvanced) {
    const hierarchicalData = isComplexValue(value) ? value : createComplexAreasData(currentAreas);
    
    return (
      <div className="space-y-6">
        {/* AI Recommendations Panel */}
        {showAIRecommendations && isValidUserProfile(userProfile) && isValidAIContext(aiContext) && (
          <AIRecommendationPanel
            userProfile={userProfile}
            aiContext={aiContext}
            currentAreas={currentAreas}
            onApplyRecommendation={handleAIRecommendationApply}
          />
        )}

        {/* Header with Toggle */}
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Focus Areas</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIRecommendations(!showAIRecommendations)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showAIRecommendations 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Brain className="w-4 h-4" />
              AI
            </button>
            <button
              onClick={handleToggle}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Advanced
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Advanced Hierarchical Areas Selection */}
        <HierarchicalAreaSelector
          data={hierarchicalData}
          onChange={onChange}
          userProfile={userProfile}
        />
      </div>
    );
  }
  
  // Simple Mode Rendering
  return (
    <div className="space-y-4">
      {/* AI Recommendations Panel */}
      {showAIRecommendations && isValidUserProfile(userProfile) && isValidAIContext(aiContext) && (
        <AIRecommendationPanel
          userProfile={userProfile}
          aiContext={aiContext}
          currentAreas={currentAreas}
          onApplyRecommendation={handleAIRecommendationApply}
        />
      )}

      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Focus Areas</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIRecommendations(!showAIRecommendations)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showAIRecommendations 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            AI
          </button>
          {hasAdvancedOptions && (
            <button
              onClick={handleToggle}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Advanced
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Simple Areas Selection */}
      <OptionGrid
        options={areaOptions}
        selected={currentAreas}
        onSelect={handleAreaSelect}
        multi
        columns={{ base: 2, md: 3 }}
        userProfile={userProfile}
        aiRecommendations={[]}
        onAIRecommendationApply={onAIRecommendationApply}
      />
    </div>
  );
};

export default FocusAreasCustomization; 