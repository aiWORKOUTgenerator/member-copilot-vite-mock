import React, { useState, useMemo, useCallback, memo } from 'react';
import { Brain, Settings, ChevronRight, ChevronLeft, Eye, Zap, CheckCircle, AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { 
  PerWorkoutOptions, 
  UserProfile, 
  AIRecommendationContext,
  CustomizationConfig,
  ValidationResult,
  WorkoutType
} from '../types/enhanced-workout-types';
import { CustomizationWrapper } from './shared/DRYComponents';
import { WORKOUT_CUSTOMIZATION_CONFIG, generateStepsFromConfig } from '../config/workoutCustomizationConfig';

import { useAI } from '../contexts/AIContext';

interface DetailedWorkoutContainerProps {
  options: PerWorkoutOptions;
  onChange: (key: keyof PerWorkoutOptions, value: PerWorkoutOptions[keyof PerWorkoutOptions]) => void;
  errors: Record<string, string>;
  disabled: boolean;
  onNavigate: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void;
  userProfile?: UserProfile;
  aiContext?: AIRecommendationContext;
  workoutType: WorkoutType;
}

const DetailedWorkoutContainer = memo(function DetailedWorkoutContainer({
  options,
  onChange,
  errors,
  disabled = false,
  onNavigate,
  userProfile,
  aiContext,
  workoutType
}: DetailedWorkoutContainerProps) {
  // Enhanced state management with AI integration
  const [activeStep, setActiveStep] = useState('training_structure');
  const [aiRecommendations, setAIRecommendations] = useState<string[]>([]);
  const [userInteractions, setUserInteractions] = useState<Record<string, number>>({});
  const [progressiveEnhancements, setProgressiveEnhancements] = useState<Record<string, boolean>>({});
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Mock user profile for demo purposes
  const mockUserProfile: UserProfile = userProfile || {
    fitnessLevel: 'some experience',
    goals: ['strength', 'muscle_building'],
    preferences: {
      workoutStyle: ['strength_training', 'functional'],
      timePreference: 'morning',
      intensityPreference: 'moderate',
      advancedFeatures: false,
      aiAssistanceLevel: 'moderate'
    },
    limitations: {
      timeConstraints: 60,
      equipmentConstraints: ['home_gym']
    },
    history: {
      completedWorkouts: 15,
      averageDuration: 45,
      preferredFocusAreas: ['upper_body', 'core'],
      progressiveEnhancementUsage: {},
      aiRecommendationAcceptance: 0.7
    },
    learningProfile: {
      prefersSimplicity: false,
      explorationTendency: 'moderate',
      feedbackPreference: 'detailed'
    }
  };

  // Mock AI context
  const mockAIContext: AIRecommendationContext = aiContext || {
    currentSelections: options,
    userProfile: mockUserProfile,
    environmentalFactors: {
      timeOfDay: 'morning',
      location: 'home',
      availableTime: 60
    },
    recentActivity: {
      lastWorkoutDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastWorkoutType: 'strength',
      recoveryStatus: 'full'
    }
  };

  // Generate navigation steps from configuration
  const navigationSteps = useMemo(() => generateStepsFromConfig(WORKOUT_CUSTOMIZATION_CONFIG), []);

  // Enhanced AI-powered recommendation generation
  const updateAIRecommendations = useCallback(() => {
    const recommendations = [];
    
    // Cross-component analysis for intelligent suggestions
    const duration = typeof options.customization_duration === 'number' 
      ? options.customization_duration 
      : options.customization_duration?.totalDuration;
      
    // Duration-energy compatibility analysis
    if (options.customization_energy && options.customization_energy <= 2 && duration && duration > 45) {
      recommendations.push({
        type: 'immediate',
        message: "Consider reducing workout duration due to low energy levels",
        action: 'reduce_duration',
        targetValue: Math.max(30, duration - 15),
        priority: 'high',
        category: 'energy_optimization'
      });
    }
    
    // Equipment-focus synergy analysis
    if (Array.isArray(options.customization_equipment) && 
        options.customization_equipment.includes("Body Weight") && 
        options.customization_focus === 'strength') {
      recommendations.push({
        type: 'contextual',
        message: "For strength goals, consider adding resistance equipment",
        action: 'suggest_equipment',
        targetValue: ['Resistance Bands', 'Dumbbells'],
        priority: 'medium',
        category: 'equipment_optimization'
      });
    }
    
    // Sleep-intensity adaptation with learning
    if (options.customization_sleep && options.customization_sleep <= 2 && 
        options.customization_focus === 'power') {
      recommendations.push({
        type: 'immediate',
        message: "Poor sleep detected - consider recovery or flexibility work instead",
        action: 'change_focus',
        targetValue: 'recovery',
        priority: 'high',
        category: 'recovery_optimization',
        learningNote: 'Poor sleep impacts power output by up to 30%'
      });
    }
    
    // Advanced cross-component conflict detection
    const conflicts = detectCrossComponentConflicts(options, mockUserProfile);
    conflicts.forEach(conflict => {
      recommendations.push({
        type: 'warning',
        message: conflict.message,
        action: conflict.suggestedAction,
        priority: 'medium',
        category: 'conflict_resolution'
      });
    });
    
    // Progressive enhancement suggestions
    const enhancementSuggestions = analyzeEnhancementOpportunities(options, mockUserProfile, userInteractions);
    enhancementSuggestions.forEach(suggestion => {
      recommendations.push({
        type: 'enhancement',
        message: suggestion.message,
        action: suggestion.action,
        priority: 'low',
        category: 'feature_enhancement'
      });
    });
    
    setAIRecommendations(recommendations);
  }, [options, mockUserProfile, userInteractions]);

  // Enhanced cross-component conflict detection
  const detectCrossComponentConflicts = useCallback((options: PerWorkoutOptions, userProfile: UserProfile) => {
    const conflicts = [];
    
    // Multiple high-impact conflicts
    const duration = typeof options.customization_duration === 'number' 
      ? options.customization_duration 
      : options.customization_duration?.totalDuration;
      
    if (duration && options.customization_energy && options.customization_sleep) {
      if (duration > 75 && options.customization_energy <= 2 && options.customization_sleep <= 2) {
        conflicts.push({
          message: "Long workout with low energy and poor sleep may lead to injury risk",
          suggestedAction: 'reduce_duration',
          fields: ['customization_duration', 'customization_energy', 'customization_sleep'],
          severity: 'high'
        });
      }
    }
    
    // Equipment-goals-space conflicts
    if (Array.isArray(options.customization_equipment) && 
        options.customization_equipment.length > 5 && 
        userProfile.limitations?.equipmentConstraints?.includes('minimal_space')) {
      conflicts.push({
        message: "Selected equipment may not fit in available space",
        suggestedAction: 'optimize_equipment',
        fields: ['customization_equipment'],
        severity: 'medium'
      });
    }
    
    return conflicts;
  }, []);

  // Enhanced progressive enhancement analysis
  const analyzeEnhancementOpportunities = useCallback((
    options: PerWorkoutOptions, 
    userProfile: UserProfile, 
    interactions: Record<string, number>
  ) => {
    const suggestions = [];
    
    // User expertise-based suggestions
    if (userProfile.fitnessLevel === 'advanced athlete') {
      Object.entries(options).forEach(([key, value]) => {
        if (typeof value === 'number' || typeof value === 'string' || Array.isArray(value)) {
          const interactionCount = interactions[key] || 0;
          if (interactionCount > 3) {
            suggestions.push({
              message: `Enable advanced ${key.replace('customization_', '')} features for more control`,
              action: 'enable_enhancement',
              field: key,
              reason: 'high_interaction_frequency'
            });
          }
        }
      });
    }
    
    // Goal-specific enhancement suggestions
    if (userProfile.goals.includes('professional') || userProfile.goals.includes('competition')) {
      suggestions.push({
        message: "Professional goals detected - consider enabling detailed session planning",
        action: 'enable_advanced_mode',
        field: 'customization_duration',
        reason: 'professional_goals'
      });
    }
    
    return suggestions;
  }, []);

  // Enhanced change handler with AI integration
  const handleChange = useCallback((key: keyof PerWorkoutOptions, value: any) => {
    // Track user interaction
    setUserInteractions(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));

    // Update options
    onChange(key, value);

    // Trigger AI analysis
    updateAIRecommendations();
  }, [onChange, updateAIRecommendations]);

  // Progressive enhancement management
  const handleEnhancementToggle = useCallback((configKey: string, enhance: boolean) => {
    const currentValue = options[configKey as keyof PerWorkoutOptions];
    const newValue = enhance ? currentValue : currentValue;

    setProgressiveEnhancements(prev => ({ ...prev, [configKey]: enhance }));
    handleChange(configKey as keyof PerWorkoutOptions, newValue);
  }, [options, handleChange]);

  // Enhanced AI recommendation application
  const handleAIRecommendationApply = useCallback((action: string, targetValue: any) => {
    switch (action) {
      case 'reduce_duration':
        if (typeof targetValue === 'number') {
          handleChange('customization_duration', targetValue);
        }
        break;
      case 'suggest_equipment':
        if (Array.isArray(targetValue)) {
          const currentEquipment = Array.isArray(options.customization_equipment) 
            ? options.customization_equipment 
            : [];
          const newEquipment = [...new Set([...currentEquipment, ...targetValue])];
          handleChange('customization_equipment', newEquipment);
        }
        break;
      case 'change_focus':
        if (typeof targetValue === 'string') {
          handleChange('customization_focus', targetValue);
        }
        break;
      case 'optimize_equipment':
        // Implement equipment optimization logic
        const currentEquipment = Array.isArray(options.customization_equipment) 
          ? options.customization_equipment 
          : [];
        const optimizedEquipment = currentEquipment.slice(0, 5); // Limit to 5 items
        handleChange('customization_equipment', optimizedEquipment);
        break;
      default:
        console.warn('Unknown AI recommendation action:', action);
    }
  }, [handleChange, options]);

  // Calculate completion status for each step
  const getStepCompletion = useCallback((stepId: string) => {
    const step = navigationSteps.find(s => s.id === stepId);
    const stepConfigs = step?.configs || [];
    const completedCount = stepConfigs.filter((config: CustomizationConfig) => {
      const value = options[config.key];
      return value !== undefined && value !== null && value !== '';
    }).length;
    return { completed: completedCount, total: stepConfigs.length };
  }, [navigationSteps, options]);

  // Form validation
  const isFormValid = useMemo(() => {
    const requiredConfigs = WORKOUT_CUSTOMIZATION_CONFIG.filter(config => config.required);
    return requiredConfigs.every(config => {
      const value = options[config.key];
      return value !== undefined && value !== null && value !== '';
    });
  }, [options]);

  // Get configurations for current step
  const currentConfigurations = useMemo(() => {
    const step = navigationSteps.find(s => s.id === activeStep);
    return step?.configs || [];
  }, [navigationSteps, activeStep]);

  // Smart badge generation with progressive enhancement support
  const generateBadge = useCallback((config: CustomizationConfig, value: any) => {
    if (!value) return null;

    switch (config.key) {
      case 'customization_duration':
        if (typeof value === 'number') return `${value} min`;
        return `${value.totalDuration} min${value.configuration !== 'duration-only' ? ' + extras' : ''}`;
      case 'customization_focus':
        if (typeof value === 'string') return value.replace('_', ' ');
        return value.focusLabel || value.label;
      case 'customization_areas':
        if (Array.isArray(value)) {
          return value.length === 1 ? value[0] : `${value.length} areas`;
        } else {
          const selected = Object.values(value || {}).filter((item: any) => item.selected);
          return selected.length === 1 ? selected[0].label : `${selected.length} areas`;
        }
      case 'customization_equipment':
        if (Array.isArray(value)) {
          return value.length === 1 ? value[0] : `${value.length} items`;
        } else {
          const count = value?.specificEquipment?.length || 0;
          return count === 1 ? value.specificEquipment[0] : `${count} items`;
        }
      case 'customization_energy':
      case 'customization_sleep':
        const labels = config.key === 'customization_sleep' 
          ? ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
          : ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
        return `${labels[value - 1]} (${value}/5)`;
      case 'customization_include':
      case 'customization_exclude':
        if (typeof value === 'string') {
          return value.length > 20 ? `${value.substring(0, 20)}...` : value;
        } else {
          const text = value?.customExercises || '';
          const libraryCount = value?.libraryExercises?.length || 0;
          if (text && libraryCount > 0) return `Custom + ${libraryCount} library`;
          if (text) return text.length > 20 ? `${text.substring(0, 20)}...` : text;
          if (libraryCount > 0) return `${libraryCount} from library`;
        }
        return null;
      default:
        return null;
    }
  }, []);

  // Navigation helpers
  const currentStepIndex = navigationSteps.findIndex(step => step.id === activeStep);
  const canGoNext = currentStepIndex < navigationSteps.length - 1;
  const canGoPrevious = currentStepIndex > 0;

  if (disabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">Customization Disabled</div>
          <p className="text-sm">Detailed customization is not available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Page Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Settings className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detailed Workout Focus</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Fine-tune your workout preferences with AI-powered recommendations
        </p>
      </div>

      {/* Enhanced AI Recommendations Panel */}
      {aiRecommendations.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">AI Workout Insights</h3>
                
                {/* Categorized Recommendations */}
                <div className="space-y-4">
                  {/* Immediate Priority */}
                  {aiRecommendations.filter(rec => rec.priority === 'high').length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <h4 className="font-medium text-red-800">Immediate Attention</h4>
                      </div>
                      <div className="space-y-2">
                        {aiRecommendations.filter(rec => rec.priority === 'high').map((rec, index) => (
                          <div key={index} className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-red-700 text-sm">{rec.message}</p>
                              {rec.learningNote && (
                                <p className="text-red-600 text-xs mt-1 italic">💡 {rec.learningNote}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleAIRecommendationApply(rec.action, rec.targetValue)}
                              className="ml-3 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Contextual Recommendations */}
                  {aiRecommendations.filter(rec => rec.priority === 'medium').length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800">Optimization Suggestions</h4>
                      </div>
                      <div className="space-y-2">
                        {aiRecommendations.filter(rec => rec.priority === 'medium').map((rec, index) => (
                          <div key={index} className="flex items-start justify-between">
                            <p className="text-yellow-700 text-sm flex-1">{rec.message}</p>
                            <button
                              onClick={() => handleAIRecommendationApply(rec.action, rec.targetValue)}
                              className="ml-3 px-3 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Enhancement Suggestions */}
                  {aiRecommendations.filter(rec => rec.priority === 'low').length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-green-800">Feature Enhancements</h4>
                      </div>
                      <div className="space-y-2">
                        {aiRecommendations.filter(rec => rec.priority === 'low').map((rec, index) => (
                          <div key={index} className="flex items-start justify-between">
                            <p className="text-green-700 text-sm flex-1">{rec.message}</p>
                            <button
                              onClick={() => handleEnhancementToggle(rec.field, true)}
                              className="ml-3 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Enable
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {navigationSteps.map((step, index) => {
            const isActive = activeStep === step.id;
            const completion = getStepCompletion(step.id);
            const isCompleted = completion.completed > 0;
            
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : isCompleted
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
                {completion.completed > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-purple-400 text-white' : 'bg-purple-200 text-purple-800'
                  }`}>
                    {completion.completed}/{completion.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStepIndex + 1) / navigationSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / navigationSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Configuration Content */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-12">
          {currentConfigurations.map((config: CustomizationConfig) => {
            const CustomizationComponent = config.component;
            const value = options[config.key];
            const error = errors[config.key];
            const isEnhanced = progressiveEnhancements[config.key] || (typeof value === 'object' && value !== null && !Array.isArray(value));

            return (
              <CustomizationWrapper
                key={config.key}
                config={config}
                isEnhanced={isEnhanced}
                userProfile={mockUserProfile}
                onEnhancementToggle={(enhance) => handleEnhancementToggle(config.key, enhance)}
                value={value}
                error={error}
              >
                <CustomizationComponent
                  value={value}
                  onChange={(newValue: any) => handleChange(config.key, newValue)}
                  disabled={disabled}
                  error={error}
                  config={config}
                  userProfile={mockUserProfile}
                  aiContext={mockAIContext}
                  onAIRecommendationApply={(rec) => handleAIRecommendationApply(config.key, rec)}
                  onComplexityChange={(from, to) => console.log(`Complexity changed from ${from} to ${to}`)}
                />
              </CustomizationWrapper>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveStep('selection')}
              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Options
            </button>
            
            {canGoPrevious && (
              <button
                onClick={() => setActiveStep(navigationSteps[currentStepIndex - 1].id)}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {canGoNext && (
              <button
                onClick={() => setActiveStep(navigationSteps[currentStepIndex + 1].id)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Next
              </button>
            )}
            
            {!canGoNext && (
              <button
                onClick={() => isFormValid && onNavigate('review')}
                disabled={!isFormValid}
                className={`flex items-center justify-center px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group ${
                  isFormValid
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Review Selections</span>
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Debug Panel */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Enhanced Debug Panel
            </h3>
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              {showDebugPanel ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {showDebugPanel && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Options Data</h4>
                <div className="bg-white rounded-lg p-4 border max-h-64 overflow-auto">
                  <pre className="text-xs">{JSON.stringify(options, null, 2)}</pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">AI & Enhancement Status</h4>
                <div className="bg-white rounded-lg p-4 border max-h-64 overflow-auto">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-blue-600">AI Recommendations:</span>
                      <div className="text-sm text-gray-600 mt-1">
                        {aiRecommendations.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {aiRecommendations.map((rec, i) => (
                              <li key={i} className="truncate">{rec}</li>
                            ))}
                          </ul>
                        ) : (
                          'No active recommendations'
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-purple-600">Enhanced Components:</span>
                      <div className="text-sm text-gray-600 mt-1">
                        {Object.entries(progressiveEnhancements).map(([key, isEnhanced]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className={isEnhanced ? 'text-green-600' : 'text-gray-500'}>
                              {isEnhanced ? '✓' : '○'}
                            </span>
                            <span>{key.replace('customization_', '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-green-600">Form Validation:</span>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-2">
                          {isFormValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span>{isFormValid ? 'Valid' : 'Invalid'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DetailedWorkoutContainer; 