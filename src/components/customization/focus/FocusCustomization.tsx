import React, { useState, useEffect, useCallback } from 'react';
import { Dumbbell, Heart, Activity, Users, Zap, Moon, Settings, ChevronDown, ChevronUp, Brain, AlertTriangle, Lightbulb } from 'lucide-react';

import { 
  CustomizationComponentProps, 
  WorkoutFocusConfigurationData,
  UserProfile,
  AIRecommendationContext
} from '../../../types';

import { FocusOptionsGrid } from './FocusOptionsGrid';
import { aiRecommendationEngine } from '../../../utils/migrationUtils';

// Helper function to consistently extract focus value
const getCurrentFocus = (value: string | WorkoutFocusConfigurationData): string => {
  return typeof value === 'object' && value ? value.focus : value as string;
};

// Helper function to check if value is complex object
const isComplexValue = (value: string | WorkoutFocusConfigurationData): value is WorkoutFocusConfigurationData => {
  return typeof value === 'object' && value !== null && 'focus' in value;
};

// Helper function to create default complex focus data
const createComplexFocusData = (
  focusValue: string, 
  focusOptions: any[]
): WorkoutFocusConfigurationData => {
  const focusOption = focusOptions.find(opt => opt.value === focusValue);
  return {
    selected: true,
    focus: focusValue,
    focusLabel: focusOption?.label || focusValue,
    label: focusOption?.label || focusValue,
    value: focusValue,
    description: focusOption?.description || '',
    configuration: 'focus-only',
    metadata: {
      intensity: focusOption?.metadata.difficulty === 'beginner' ? 'low' : 
                 focusOption?.metadata.difficulty === 'intermediate' ? 'moderate' : 'high',
      equipment: 'moderate',
      experience: focusOption?.metadata.difficulty || 'beginner',
      duration_compatibility: [15, 30, 45, 60],
      category: focusOption?.metadata.category || 'strength_power',
      primaryBenefit: focusOption?.description || '',
      secondaryBenefits: []
    }
  };
};

// AI-powered focus analysis and recommendations
const generateFocusRecommendations = (
  userProfile: UserProfile | undefined,
  aiContext: AIRecommendationContext | undefined,
  currentFocus: string
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
  if (userProfile.fitnessLevel === 'beginner' && currentFocus === 'power') {
    warnings.push('Power training is advanced - consider starting with strength or endurance');
    recommendations.push('Try strength training first to build a foundation');
  }

  if (userProfile.goals?.includes('weight_loss') && currentFocus !== 'weight_loss') {
    recommendations.push('Weight loss focus aligns with your goals');
  }

  if (userProfile.limitations?.injuries && 
      userProfile.limitations.injuries.length > 0 && 
      currentFocus === 'power') {
    warnings.push('Power training may not be suitable with current injuries');
    recommendations.push('Consider recovery or flexibility focus');
  }

  // Context-based recommendations
  if (aiContext.currentSelections?.customization_duration) {
    const duration = typeof aiContext.currentSelections.customization_duration === 'number'
      ? aiContext.currentSelections.customization_duration
      : aiContext.currentSelections.customization_duration?.totalDuration;
    
    if (duration && duration < 30 && currentFocus === 'endurance') {
      warnings.push('Short duration may limit endurance training effectiveness');
      optimizations.push('Consider 45+ minutes for optimal endurance benefits');
    }
  }

  if (aiContext.currentSelections?.customization_equipment) {
    const equipment = Array.isArray(aiContext.currentSelections.customization_equipment)
      ? aiContext.currentSelections.customization_equipment
      : aiContext.currentSelections.customization_equipment?.specificEquipment;
    
    if (equipment?.includes('bodyweight') && currentFocus === 'strength') {
      optimizations.push('Add resistance equipment for better strength gains');
    }
  }

  if (aiContext.currentSelections?.customization_energy && 
      aiContext.currentSelections.customization_energy <= 2 && 
      currentFocus === 'power') {
    warnings.push('Low energy levels may affect power training performance');
    recommendations.push('Consider recovery or flexibility focus instead');
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
  currentFocus: string;
  onApplyRecommendation: (recommendation: string, focusValue: string) => void;
}> = ({ userProfile, aiContext, currentFocus, onApplyRecommendation }) => {
  const [aiInsights, setAIInsights] = useState<{
    recommendations: string[];
    warnings: string[];
    optimizations: string[];
  }>({ recommendations: [], warnings: [], optimizations: [] });

  const updateAIInsights = useCallback(() => {
    if (isValidUserProfile(userProfile) && isValidAIContext(aiContext)) {
      const insights = generateFocusRecommendations(userProfile, aiContext, currentFocus);
      setAIInsights(insights);
    }
  }, [userProfile, aiContext, currentFocus]);

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
                    {rec.includes('strength') && (
                      <button
                        onClick={() => onApplyRecommendation(rec, 'strength')}
                        className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    )}
                    {rec.includes('weight loss') && (
                      <button
                        onClick={() => onApplyRecommendation(rec, 'weight_loss')}
                        className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    )}
                    {rec.includes('recovery') && (
                      <button
                        onClick={() => onApplyRecommendation(rec, 'recovery')}
                        className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    )}
                    {rec.includes('flexibility') && (
                      <button
                        onClick={() => onApplyRecommendation(rec, 'flexibility')}
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

// Focus Customization Component
export const FocusCustomization: React.FC<CustomizationComponentProps<string | WorkoutFocusConfigurationData>> = ({
  value,
  onChange,
  userProfile,
  aiContext,
  onAIRecommendationApply
}) => {
  // Consistent state management
  const [isAdvanced, setIsAdvanced] = useState(isComplexValue(value));
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);

  const focusOptions = [
    { 
      value: 'strength', 
      label: 'Strength Training', 
      sublabel: 'Build muscle and power',
      description: 'Focus on progressive overload and muscle building',
      metadata: { 
        icon: Dumbbell, 
        difficulty: 'intermediate' as const,
        category: 'strength_power' as const,
        badge: 'Popular'
      }
    },
    { 
      value: 'endurance', 
      label: 'Endurance Training', 
      sublabel: 'Improve cardiovascular fitness',
      description: 'Enhance stamina and aerobic capacity',
      metadata: { 
        icon: Heart, 
        difficulty: 'beginner' as const,
        category: 'conditioning_cardio' as const
      }
    },
    { 
      value: 'weight_loss', 
      label: 'Weight Loss', 
      sublabel: 'Burn calories efficiently',
      description: 'High-intensity fat burning workouts',
      metadata: { 
        icon: Activity, 
        difficulty: 'beginner' as const,
        category: 'conditioning_cardio' as const,
        badge: 'Effective'
      }
    },
    { 
      value: 'flexibility', 
      label: 'Flexibility & Mobility', 
      sublabel: 'Enhance range of motion',
      description: 'Improve joint health and movement quality',
      metadata: { 
        icon: Users, 
        difficulty: 'beginner' as const,
        category: 'functional_recovery' as const
      }
    },
    { 
      value: 'power', 
      label: 'Power & Explosiveness', 
      sublabel: 'Develop athletic performance',
      description: 'Explosive movements and plyometrics',
      metadata: { 
        icon: Zap, 
        difficulty: 'advanced' as const,
        category: 'strength_power' as const,
        badge: 'Advanced'
      }
    },
    { 
      value: 'recovery', 
      label: 'Recovery & Wellness', 
      sublabel: 'Active recovery and restoration',
      description: 'Gentle movements for recovery',
      metadata: { 
        icon: Moon, 
        difficulty: 'beginner' as const,
        category: 'functional_recovery' as const
      }
    }
  ];

  // Consistent focus value extraction
  const currentFocus = getCurrentFocus(value);
  
  // Check if current focus has advanced options
  const hasAdvancedOptions = currentFocus === 'strength' || currentFocus === 'power';
  
  // Sync advanced mode with actual data structure
  useEffect(() => {
    const valueIsComplex = isComplexValue(value);
    if (isAdvanced !== valueIsComplex) {
      setIsAdvanced(valueIsComplex);
    }
  }, [value, isAdvanced]);

  // AI-powered focus recommendations
  const handleAIRecommendationApply = useCallback((recommendation: string, focusValue: string) => {
    if (isAdvanced) {
      const complexFocus = createComplexFocusData(focusValue, focusOptions);
      onChange(complexFocus);
    } else {
      onChange(focusValue);
    }
    onAIRecommendationApply?.(recommendation);
  }, [isAdvanced, focusOptions, onChange, onAIRecommendationApply]);

  // Handle focus selection
  const handleFocusSelect = useCallback((newFocus: string) => {
    if (isAdvanced) {
      const complexFocus = createComplexFocusData(newFocus, focusOptions);
      onChange(complexFocus);
    } else {
      onChange(newFocus);
    }
  }, [isAdvanced, focusOptions, onChange]);

  // Handle mode toggle
  const handleToggle = useCallback(() => {
    if (isAdvanced) {
      // Convert from complex to simple
      const simpleFocus = getCurrentFocus(value);
      onChange(simpleFocus);
      setIsAdvanced(false);
    } else {
      // Convert from simple to complex
      const complexFocus = createComplexFocusData(currentFocus, focusOptions);
      onChange(complexFocus);
      setIsAdvanced(true);
    }
  }, [isAdvanced, value, currentFocus, focusOptions, onChange]);
  
  // Advanced Mode Rendering
  if (isAdvanced) {
    const focusData = isComplexValue(value) ? value : createComplexFocusData(currentFocus, focusOptions);
    
    return (
      <div className="space-y-6">
        {/* AI Recommendations Panel */}
        {showAIRecommendations && isValidUserProfile(userProfile) && isValidAIContext(aiContext) && (
          <AIRecommendationPanel
            userProfile={userProfile}
            aiContext={aiContext}
            currentFocus={currentFocus}
            onApplyRecommendation={handleAIRecommendationApply}
          />
        )}

        {/* Header with Toggle */}
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Primary Focus</label>
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
        
        {/* Primary Focus Selection */}
        <div>
          <FocusOptionsGrid
            options={focusOptions}
            selected={focusData.focus}
            onSelect={handleFocusSelect}
            columns={{ base: 1, sm: 2, md: 3 }}
            size="lg"
            userProfile={userProfile}
            aiRecommendations={aiContext && userProfile ? aiRecommendationEngine.generateRecommendations(aiContext.currentSelections, userProfile).contextual : []}
            onAIRecommendationApply={onAIRecommendationApply}
          />
        </div>
        
        {/* Format Selection for Strength Focus */}
        {focusData.focus === 'strength' && (
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Training Format</label>
            <FocusOptionsGrid
              options={[
                { value: 'straight_sets', label: 'Straight Sets', description: 'Traditional set structure' },
                { value: 'super_sets', label: 'Super Sets', description: 'Back-to-back exercises' },
                { value: 'drop_sets', label: 'Drop Sets', description: 'Descending weight sets' },
                { value: 'pyramid', label: 'Pyramid', description: 'Ascending/descending reps' }
              ]}
              selected={focusData.format || 'straight_sets'}
              onSelect={(format) => onChange({
                ...focusData,
                format,
                formatLabel: format.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                configuration: 'focus-with-format'
              })}
              columns={{ base: 2, md: 4 }}
              size="sm"
            />
          </div>
        )}

        {/* Advanced Options for Power Training */}
        {focusData.focus === 'power' && (
          <div className="bg-orange-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Power Training Style</label>
            <FocusOptionsGrid
              options={[
                { value: 'plyometric', label: 'Plyometric', description: 'Explosive jumping movements' },
                { value: 'olympic_lifts', label: 'Olympic Lifts', description: 'Clean & jerk, snatch variants' },
                { value: 'speed_strength', label: 'Speed Strength', description: 'Fast concentric movements' },
                { value: 'reactive', label: 'Reactive', description: 'Quick response drills' }
              ]}
              selected={focusData.format || 'plyometric'}
              onSelect={(powerStyle) => onChange({
                ...focusData,
                format: powerStyle,
                formatLabel: powerStyle.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                configuration: 'focus-with-format'
              })}
              columns={{ base: 2, md: 4 }}
              size="sm"
            />
          </div>
        )}
        
        {/* Focus Metadata Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Focus Benefits</h4>
          <div className="space-y-2">
            {focusData.metadata.primaryBenefit && (
              <div className="text-sm text-blue-800">
                <span className="font-medium">Primary:</span> {focusData.metadata.primaryBenefit}
              </div>
            )}
            {focusData.metadata.secondaryBenefits && focusData.metadata.secondaryBenefits.length > 0 && (
              <div className="text-sm text-blue-800">
                <span className="font-medium">Secondary:</span> {focusData.metadata.secondaryBenefits.join(', ')}
              </div>
            )}
            <div className="text-sm text-blue-800">
              <span className="font-medium">Intensity Level:</span> {focusData.metadata.intensity}
            </div>
            <div className="text-sm text-blue-800">
              <span className="font-medium">Experience Level:</span> {focusData.metadata.experience}
            </div>
          </div>
        </div>
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
          currentFocus={currentFocus}
          onApplyRecommendation={handleAIRecommendationApply}
        />
      )}

      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Primary Focus</label>
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
      
      <FocusOptionsGrid
        options={focusOptions}
        selected={currentFocus}
        onSelect={handleFocusSelect}
        columns={{ base: 1, sm: 2, md: 3 }}
        size="lg"
        userProfile={userProfile}
        aiRecommendations={aiContext && userProfile ? aiRecommendationEngine.generateRecommendations(aiContext.currentSelections, userProfile).contextual : []}
        onAIRecommendationApply={onAIRecommendationApply}
      />
    </div>
  );
}; 