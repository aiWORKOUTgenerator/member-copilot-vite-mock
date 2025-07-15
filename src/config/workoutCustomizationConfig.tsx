import React from 'react';
import { 
  Clock, 
  Target, 
  Zap, 
  Dumbbell, 
  Heart, 
  Activity, 
  Settings, 
  Battery, 
  Moon, 
  Brain, 
  AlertTriangle, 
  Plus, 
  Minus,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';

import { 
  CustomizationConfig, 
  PerWorkoutOptions, 
  UserProfile,
  AIRecommendationContext,
  ValidationResult,
  DurationConfigurationData,
  WorkoutFocusConfigurationData,
  EquipmentSelectionData,
  HierarchicalSelectionData,
  CategoryRatingData,
  IncludeExercisesData,
  ExcludeExercisesData,
  CustomizationComponentProps
} from '../types/enhanced-workout-types';

import { OptionGrid, RatingScale, CustomizationWrapper } from '../components/shared/DRYComponents';
import { migrationUtils, aiRecommendationEngine } from '../utils/migrationUtils';

// ============================================================================
// COMPONENT IMPLEMENTATIONS - Specific customization components
// ============================================================================

// Duration Customization Component
const DurationCustomization: React.FC<CustomizationComponentProps<number | DurationConfigurationData>> = ({
  value,
  onChange,
  userProfile,
  aiContext,
  onAIRecommendationApply
}) => {
  const isComplex = typeof value === 'object';
  
  if (isComplex) {
    const durationData = value as DurationConfigurationData;
    
    return (
      <div className="space-y-6">
        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Total Duration</label>
          <OptionGrid
            options={[
              { value: 15, label: '15 min', sublabel: 'Quick session', description: 'Perfect for busy schedules' },
              { value: 30, label: '30 min', sublabel: 'Standard workout', description: 'Most popular duration' },
              { value: 45, label: '45 min', sublabel: 'Extended session', description: 'Comprehensive training' },
              { value: 60, label: '60 min', sublabel: 'Full training', description: 'Maximum results' },
              { value: 90, label: '90 min', sublabel: 'Elite session', description: 'Advanced athletes only' }
            ]}
            selected={durationData.totalDuration}
            onSelect={(duration) => onChange({
              ...durationData,
              totalDuration: duration,
              workingTime: duration - 
                (durationData.warmUp.included ? durationData.warmUp.duration : 0) - 
                (durationData.coolDown.included ? durationData.coolDown.duration : 0)
            })}
            columns={{ base: 2, md: 3, lg: 5 }}
            userProfile={userProfile}
            aiRecommendations={aiContext ? aiRecommendationEngine.generateRecommendations(aiContext.currentSelections, userProfile).immediate : []}
            onAIRecommendationApply={onAIRecommendationApply}
          />
        </div>
        
        {/* Warm-up Configuration */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Warm-up Phase</h4>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={durationData.warmUp.included}
                onChange={(e) => onChange({
                  ...durationData,
                  warmUp: { ...durationData.warmUp, included: e.target.checked },
                  workingTime: durationData.totalDuration - 
                    (e.target.checked ? durationData.warmUp.duration : 0) - 
                    (durationData.coolDown.included ? durationData.coolDown.duration : 0)
                })}
                className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Include warm-up</span>
            </label>
          </div>
          
          {durationData.warmUp.included && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration: {durationData.warmUp.duration} minutes</label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={durationData.warmUp.duration}
                  onChange={(e) => onChange({
                    ...durationData,
                    warmUp: { ...durationData.warmUp, duration: parseInt(e.target.value) },
                    workingTime: durationData.totalDuration - parseInt(e.target.value) - 
                      (durationData.coolDown.included ? durationData.coolDown.duration : 0)
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warm-up Type</label>
                <OptionGrid
                  options={[
                    { value: 'dynamic', label: 'Dynamic', description: 'Movement-based preparation' },
                    { value: 'static', label: 'Static', description: 'Held stretches' },
                    { value: 'cardio', label: 'Cardio', description: 'Light cardiovascular work' },
                    { value: 'mixed', label: 'Mixed', description: 'Combination approach' }
                  ]}
                  selected={durationData.warmUp.type || 'dynamic'}
                  onSelect={(type) => onChange({
                    ...durationData,
                    warmUp: { ...durationData.warmUp, type }
                  })}
                  columns={{ base: 2, md: 4 }}
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Cool-down Configuration */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Cool-down Phase</h4>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={durationData.coolDown.included}
                onChange={(e) => onChange({
                  ...durationData,
                  coolDown: { ...durationData.coolDown, included: e.target.checked },
                  workingTime: durationData.totalDuration - 
                    (durationData.warmUp.included ? durationData.warmUp.duration : 0) - 
                    (e.target.checked ? durationData.coolDown.duration : 0)
                })}
                className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Include cool-down</span>
            </label>
          </div>
          
          {durationData.coolDown.included && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration: {durationData.coolDown.duration} minutes</label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={durationData.coolDown.duration}
                  onChange={(e) => onChange({
                    ...durationData,
                    coolDown: { ...durationData.coolDown, duration: parseInt(e.target.value) },
                    workingTime: durationData.totalDuration - 
                      (durationData.warmUp.included ? durationData.warmUp.duration : 0) - 
                      parseInt(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cool-down Type</label>
                <OptionGrid
                  options={[
                    { value: 'static_stretch', label: 'Static Stretch', description: 'Held stretches for flexibility' },
                    { value: 'walking', label: 'Walking', description: 'Gentle movement' },
                    { value: 'breathing', label: 'Breathing', description: 'Focused breathing exercises' },
                    { value: 'mixed', label: 'Mixed', description: 'Combination approach' }
                  ]}
                  selected={durationData.coolDown.type || 'static_stretch'}
                  onSelect={(type) => onChange({
                    ...durationData,
                    coolDown: { ...durationData.coolDown, type }
                  })}
                  columns={{ base: 2, md: 4 }}
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Working Time Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-blue-900">Actual Working Time</div>
              <div className="text-sm text-blue-700">
                {durationData.workingTime} minutes of focused exercise
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Simple duration selection
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Workout Duration</label>
      <OptionGrid
        options={[
          { value: 15, label: '15 min', sublabel: 'Quick', description: 'Perfect for busy days' },
          { value: 30, label: '30 min', sublabel: 'Standard', description: 'Most popular choice' },
          { value: 45, label: '45 min', sublabel: 'Extended', description: 'Comprehensive workout' },
          { value: 60, label: '60 min', sublabel: 'Full', description: 'Maximum results' }
        ]}
        selected={value as number}
        onSelect={onChange}
        columns={{ base: 2, md: 4 }}
        userProfile={userProfile}
        aiRecommendations={aiContext ? aiRecommendationEngine.generateRecommendations(aiContext.currentSelections, userProfile).immediate : []}
        onAIRecommendationApply={onAIRecommendationApply}
      />
    </div>
  );
};

// Focus Customization Component
const FocusCustomization: React.FC<CustomizationComponentProps<string | WorkoutFocusConfigurationData>> = ({
  value,
  onChange,
  userProfile,
  aiContext,
  onAIRecommendationApply
}) => {
  const isComplex = typeof value === 'object';
  
  const focusOptions = [
    { 
      value: 'strength', 
      label: 'Strength Training', 
      sublabel: 'Build muscle and power',
      description: 'Focus on progressive overload and muscle building',
      metadata: { 
        icon: Dumbbell, 
        difficulty: 'intermediate' as const,
        category: 'strength_power',
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
        category: 'conditioning_cardio'
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
        category: 'conditioning_cardio',
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
        category: 'functional_recovery'
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
        category: 'strength_power',
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
        category: 'functional_recovery'
      }
    }
  ];
  
  if (isComplex) {
    const focusData = value as WorkoutFocusConfigurationData;
    
    return (
      <div className="space-y-6">
        {/* Primary Focus Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Primary Focus</label>
          <OptionGrid
            options={focusOptions}
            selected={focusData.focus}
            onSelect={(focus) => onChange({
              ...focusData,
              focus,
              focusLabel: focusOptions.find(opt => opt.value === focus)?.label || focus
            })}
            columns={{ base: 1, sm: 2, md: 3 }}
            size="lg"
            userProfile={userProfile}
            aiRecommendations={aiContext ? aiRecommendationEngine.generateRecommendations(aiContext.currentSelections, userProfile).contextual : []}
            onAIRecommendationApply={onAIRecommendationApply}
          />
        </div>
        
        {/* Format Selection for Advanced Focus */}
        {focusData.focus === 'strength' && (
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Training Format</label>
            <OptionGrid
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
                formatLabel: format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
            {focusData.metadata.secondaryBenefits && (
              <div className="text-sm text-blue-800">
                <span className="font-medium">Secondary:</span> {focusData.metadata.secondaryBenefits.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Simple focus selection
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Primary Focus</label>
      <OptionGrid
        options={focusOptions}
        selected={value as string}
        onSelect={onChange}
        columns={{ base: 1, sm: 2, md: 3 }}
        size="lg"
        userProfile={userProfile}
        aiRecommendations={aiContext ? aiRecommendationEngine.generateRecommendations(aiContext.currentSelections, userProfile).contextual : []}
        onAIRecommendationApply={onAIRecommendationApply}
      />
    </div>
  );
};

// Equipment Customization Component
const EquipmentCustomization: React.FC<CustomizationComponentProps<string[] | EquipmentSelectionData>> = ({
  value = [],
  onChange,
  userProfile,
  aiContext
}) => {
  const isComplex = typeof value === 'object' && !Array.isArray(value);
  
  if (isComplex) {
    // This would implement the 4-tier progressive disclosure
    // For now, showing the equipment selection part
    const equipmentData = value as EquipmentSelectionData;
    
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Available Equipment</label>
          <OptionGrid
            options={[
              { value: 'dumbbells', label: 'Dumbbells', description: 'Versatile free weights' },
              { value: 'barbell', label: 'Barbell', description: 'Heavy compound movements' },
              { value: 'kettlebells', label: 'Kettlebells', description: 'Functional training' },
              { value: 'resistance_bands', label: 'Resistance Bands', description: 'Portable resistance' },
              { value: 'pull_up_bar', label: 'Pull-up Bar', description: 'Upper body pulling' },
              { value: 'bench', label: 'Bench', description: 'Support for exercises' },
              { value: 'cable_machine', label: 'Cable Machine', description: 'Constant tension' },
              { value: 'bodyweight', label: 'Bodyweight Only', description: 'No equipment needed' }
            ]}
            selected={equipmentData.specificEquipment}
            onSelect={(equipment) => {
              const newEquipment = equipmentData.specificEquipment.includes(equipment)
                ? equipmentData.specificEquipment.filter(e => e !== equipment)
                : [...equipmentData.specificEquipment, equipment];
              onChange({
                ...equipmentData,
                specificEquipment: newEquipment
              });
            }}
            multi
            columns={{ base: 2, md: 3, lg: 4 }}
            userProfile={userProfile}
          />
        </div>
      </div>
    );
  }
  
  // Simple equipment selection
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Available Equipment</label>
      <OptionGrid
        options={[
          { value: 'dumbbells', label: 'Dumbbells', description: 'Versatile free weights' },
          { value: 'barbell', label: 'Barbell', description: 'Heavy compound movements' },
          { value: 'kettlebells', label: 'Kettlebells', description: 'Functional training' },
          { value: 'resistance_bands', label: 'Resistance Bands', description: 'Portable resistance' },
          { value: 'bodyweight', label: 'Bodyweight Only', description: 'No equipment needed' }
        ]}
        selected={value as string[]}
        onSelect={(equipment) => {
          const currentEquipment = Array.isArray(value) ? value : [];
          const newEquipment = currentEquipment.includes(equipment)
            ? currentEquipment.filter(e => e !== equipment)
            : [...currentEquipment, equipment];
          onChange(newEquipment);
        }}
        multi
        columns={{ base: 2, md: 3 }}
        userProfile={userProfile}
      />
    </div>
  );
};

// Focus Areas Customization Component
const FocusAreasCustomization: React.FC<CustomizationComponentProps<string[] | HierarchicalSelectionData>> = ({
  value = [],
  onChange,
  userProfile
}) => {
  const isComplex = typeof value === 'object' && !Array.isArray(value);
  
  if (isComplex) {
    const hierarchicalData = value as HierarchicalSelectionData;
    
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Focus Areas</label>
          <OptionGrid
            options={[
              { value: 'Upper Body', label: 'Upper Body', description: 'Chest, back, shoulders, arms' },
              { value: 'Lower Body', label: 'Lower Body', description: 'Legs, glutes, calves' },
              { value: 'Core', label: 'Core', description: 'Abs, obliques, lower back' },
              { value: 'Full Body', label: 'Full Body', description: 'Total body integration' },
              { value: 'Cardio', label: 'Cardio', description: 'Heart and lung conditioning' },
              { value: 'Functional', label: 'Functional', description: 'Real-world movements' }
            ]}
            selected={Object.keys(hierarchicalData).filter(key => hierarchicalData[key]?.selected)}
            onSelect={(area) => {
              const newData = { ...hierarchicalData };
              if (newData[area]) {
                newData[area].selected = !newData[area].selected;
              } else {
                newData[area] = {
                  selected: true,
                  label: area,
                  level: 'primary',
                  metadata: {
                    anatomicalGroup: area.toLowerCase().replace(' ', '_'),
                    difficultyLevel: 'intermediate'
                  }
                };
              }
              onChange(newData);
            }}
            multi
            columns={{ base: 2, md: 3 }}
            userProfile={userProfile}
          />
        </div>
      </div>
    );
  }
  
  // Simple focus areas selection
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Focus Areas</label>
      <OptionGrid
        options={[
          { value: 'Upper Body', label: 'Upper Body', description: 'Chest, back, shoulders, arms' },
          { value: 'Lower Body', label: 'Lower Body', description: 'Legs, glutes, calves' },
          { value: 'Core', label: 'Core', description: 'Abs, obliques, lower back' },
          { value: 'Full Body', label: 'Full Body', description: 'Total body integration' },
          { value: 'Cardio', label: 'Cardio', description: 'Heart and lung conditioning' },
          { value: 'Functional', label: 'Functional', description: 'Real-world movements' }
        ]}
        selected={value as string[]}
        onSelect={(area) => {
          const currentAreas = Array.isArray(value) ? value : [];
          const newAreas = currentAreas.includes(area)
            ? currentAreas.filter(a => a !== area)
            : [...currentAreas, area];
          onChange(newAreas);
        }}
        multi
        columns={{ base: 2, md: 3 }}
        userProfile={userProfile}
      />
    </div>
  );
};

// ============================================================================
// CONFIGURATION ARRAY - The heart of the system
// ============================================================================

export const WORKOUT_CUSTOMIZATION_CONFIG: CustomizationConfig[] = [
  {
    key: 'customization_duration',
    component: DurationCustomization,
    label: 'Workout Duration',
    icon: Clock,
    category: 'Training Structure',
    required: true,
    order: 1,
    metadata: {
      difficulty: 'beginner',
      timeRequired: 2,
      tags: ['time-management', 'planning', 'structure'],
      learningObjectives: ['Understand workout timing', 'Plan session structure'],
      userBenefits: ['Better time management', 'Structured workout planning', 'Optimized recovery periods']
    },
    validation: {
      required: true,
      custom: (value, allOptions) => {
        const duration = typeof value === 'number' ? value : value?.totalDuration;
        const result: ValidationResult = { isValid: true };
        
        if (!duration || duration < 10) {
          result.isValid = false;
          result.errors = ['Workout duration must be at least 10 minutes'];
        }
        
        if (duration && duration > 120) {
          result.warnings = ['Very long workouts may lead to overtraining'];
          result.recommendations = ['Consider breaking into multiple sessions'];
        }
        
        return result;
      }
    },
    uiConfig: {
      componentType: 'progressive-disclosure',
      progressiveEnhancement: true,
      aiAssistance: 'suggestions'
    },
    analytics: {
      trackInteractions: true,
      trackComplexityChanges: true,
      trackAIRecommendationUsage: true
    }
  },
  {
    key: 'customization_focus',
    component: FocusCustomization,
    label: 'Primary Focus',
    icon: Target,
    category: 'Training Structure',
    required: true,
    order: 2,
    metadata: {
      difficulty: 'beginner',
      timeRequired: 3,
      tags: ['goals', 'targeting', 'focus'],
      learningObjectives: ['Identify fitness goals', 'Choose appropriate training style'],
      userBenefits: ['Goal-specific training', 'Targeted results', 'Efficient workout design']
    },
    validation: {
      required: true,
      custom: (value, allOptions) => {
        const focus = typeof value === 'string' ? value : value?.focus;
        const result: ValidationResult = { isValid: true };
        
        if (!focus) {
          result.isValid = false;
          result.errors = ['Please select a primary workout focus'];
        }
        
        // Cross-component validation
        if (focus === 'strength' && Array.isArray(allOptions.customization_equipment) && 
            allOptions.customization_equipment.includes('bodyweight')) {
          result.warnings = ['Bodyweight exercises may limit strength training effectiveness'];
          result.recommendations = ['Consider adding resistance equipment for better strength gains'];
        }
        
        return result;
      }
    },
    uiConfig: {
      componentType: 'option-grid',
      gridColumns: { base: 1, sm: 2, md: 3 },
      progressiveEnhancement: true,
      aiAssistance: 'full'
    }
  },
  {
    key: 'customization_areas',
    component: FocusAreasCustomization,
    label: 'Focus Areas',
    icon: Activity,
    category: 'Training Details',
    order: 3,
    metadata: {
      difficulty: 'intermediate',
      timeRequired: 3,
      tags: ['muscle-groups', 'targeting', 'anatomy'],
      learningObjectives: ['Understand muscle groups', 'Plan balanced training'],
      userBenefits: ['Targeted muscle development', 'Balanced physique', 'Injury prevention']
    },
    validation: {
      custom: (value, allOptions) => {
        const areas = Array.isArray(value) ? value : Object.keys(value || {}).filter(k => value?.[k]?.selected);
        const result: ValidationResult = { isValid: true };
        
        if (areas.length === 0) {
          result.warnings = ['No focus areas selected - will use full body default'];
          result.recommendations = ['Select specific areas for better targeting'];
        }
        
        if (areas.length > 4) {
          result.warnings = ['Too many focus areas may reduce workout effectiveness'];
          result.recommendations = ['Consider focusing on 2-3 primary areas'];
        }
        
        return result;
      }
    },
    uiConfig: {
      componentType: 'option-grid',
      gridColumns: { base: 2, md: 3 },
      multiSelect: true,
      progressiveEnhancement: true,
      aiAssistance: 'suggestions'
    }
  },
  {
    key: 'customization_equipment',
    component: EquipmentCustomization,
    label: 'Available Equipment',
    icon: Dumbbell,
    category: 'Training Details',
    required: true,
    order: 4,
    metadata: {
      difficulty: 'beginner',
      timeRequired: 2,
      tags: ['equipment', 'resources', 'environment'],
      learningObjectives: ['Identify available equipment', 'Maximize equipment usage'],
      userBenefits: ['Optimized equipment usage', 'Effective workout design', 'Equipment-specific progressions']
    },
    validation: {
      required: true,
      custom: (value, allOptions) => {
        const equipment = Array.isArray(value) ? value : value?.specificEquipment || [];
        const result: ValidationResult = { isValid: true };
        
        if (equipment.length === 0) {
          result.isValid = false;
          result.errors = ['Please select at least one equipment option'];
        }
        
        return result;
      }
    },
    uiConfig: {
      componentType: 'progressive-disclosure',
      multiSelect: true,
      progressiveEnhancement: true,
      aiAssistance: 'suggestions'
    }
  },
  {
    key: 'customization_energy',
    component: ({ value, onChange, userProfile, aiContext, onAIInsight }) => (
      <RatingScale
        value={value}
        onChange={onChange}
        config={{
          min: 1,
          max: 5,
          labels: {
            low: 'Low Energy',
            high: 'High Energy',
            scale: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
          },
          size: 'md',
          showLabels: true,
          showValue: true
        }}
        userProfile={userProfile}
        aiContext={aiContext}
        onAIInsight={onAIInsight}
      />
    ),
    label: 'Current Energy Level',
    icon: Battery,
    category: 'Physical State',
    order: 5,
    metadata: {
      difficulty: 'beginner',
      timeRequired: 1,
      tags: ['energy', 'readiness', 'adaptation'],
      learningObjectives: ['Assess current energy', 'Adapt workout intensity'],
      userBenefits: ['Adaptive workout intensity', 'Better performance', 'Reduced injury risk']
    },
    validation: {
      custom: (value, allOptions) => {
        const result: ValidationResult = { isValid: true };
        
        if (value && value <= 2) {
          result.warnings = ['Low energy may affect workout performance'];
          result.recommendations = ['Consider a shorter or less intense workout'];
        }
        
        return result;
      }
    },
    uiConfig: {
      componentType: 'rating-scale',
      aiAssistance: 'suggestions'
    }
  },
  {
    key: 'customization_sleep',
    component: ({ value, onChange, userProfile, aiContext, onAIInsight }) => (
      <RatingScale
        value={value}
        onChange={onChange}
        config={{
          min: 1,
          max: 5,
          labels: {
            low: 'Poor Sleep',
            high: 'Great Sleep',
            scale: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
          },
          size: 'md',
          showLabels: true,
          showValue: true
        }}
        userProfile={userProfile}
        aiContext={aiContext}
        onAIInsight={onAIInsight}
      />
    ),
    label: 'Sleep Quality',
    icon: Moon,
    category: 'Physical State',
    order: 6,
    metadata: {
      difficulty: 'beginner',
      timeRequired: 1,
      tags: ['sleep', 'recovery', 'performance'],
      learningObjectives: ['Understand sleep impact', 'Adjust training accordingly'],
      userBenefits: ['Better recovery planning', 'Performance optimization', 'Injury prevention']
    },
    uiConfig: {
      componentType: 'rating-scale',
      aiAssistance: 'suggestions'
    }
  },
  {
    key: 'customization_include',
    component: ({ value, onChange }) => {
      const handleIncludeChange = (newText: string) => {
        if (typeof value === 'string') {
          onChange(newText);
        } else {
          onChange({
            ...value,
            customExercises: newText,
            libraryExercises: value?.libraryExercises || []
          });
        }
      };

      const currentText = typeof value === 'string' ? value : value?.customExercises || '';

      return (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Include Specific Exercises
          </label>
          <textarea
            value={currentText}
            onChange={(e) => handleIncludeChange(e.target.value)}
            placeholder="e.g., push-ups, squats, deadlifts, pull-ups..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Include specific exercises"
          />
          <p className="text-sm text-gray-500">
            Enter exercises you want to include, separated by commas
          </p>
        </div>
      );
    },
    label: 'Include Exercises',
    icon: Plus,
    category: 'Exercise Selection',
    order: 7,
    metadata: {
      difficulty: 'intermediate',
      timeRequired: 2,
      tags: ['exercises', 'preferences', 'customization'],
      learningObjectives: ['Specify preferred exercises', 'Customize workout content'],
      userBenefits: ['Personalized exercise selection', 'Enjoyable workouts', 'Skill development']
    },
    uiConfig: {
      componentType: 'text-input',
      progressiveEnhancement: true,
      aiAssistance: 'suggestions'
    }
  },
  {
    key: 'customization_exclude',
    component: ({ value, onChange }) => {
      const handleExcludeChange = (newText: string) => {
        if (typeof value === 'string') {
          onChange(newText);
        } else {
          onChange({
            ...value,
            customExercises: newText,
            libraryExercises: value?.libraryExercises || []
          });
        }
      };

      const currentText = typeof value === 'string' ? value : value?.customExercises || '';

      return (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Exclude Exercises
          </label>
          <textarea
            value={currentText}
            onChange={(e) => handleExcludeChange(e.target.value)}
            placeholder="e.g., burpees, jump squats, overhead press..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Exclude specific exercises"
          />
          <p className="text-sm text-gray-500">
            Enter exercises you want to avoid, separated by commas
          </p>
        </div>
      );
    },
    label: 'Exclude Exercises',
    icon: Minus,
    category: 'Exercise Selection',
    order: 8,
    metadata: {
      difficulty: 'intermediate',
      timeRequired: 2,
      tags: ['exercises', 'limitations', 'safety'],
      learningObjectives: ['Identify limitations', 'Ensure safe exercise selection'],
      userBenefits: ['Safe workout planning', 'Injury prevention', 'Comfortable training']
    },
    uiConfig: {
      componentType: 'text-input',
      progressiveEnhancement: true,
      aiAssistance: 'suggestions'
    }
  }
];

// Generate navigation steps from configuration
export const generateStepsFromConfig = (configs: CustomizationConfig[]) => {
  const grouped = configs.reduce((acc, config) => {
    const category = config.category || "Other";
    if (!acc[category]) {
      acc[category] = {
        id: category.toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and'),
        label: category,
        icon: config.icon,
        configs: []
      };
    }
    acc[category].configs.push(config);
    return acc;
  }, {} as Record<string, any>);

  // Sort configs within each category by order
  Object.values(grouped).forEach((step: any) => {
    step.configs.sort((a: CustomizationConfig, b: CustomizationConfig) =>
      (a.order || 999) - (b.order || 999)
    );
  });

  return Object.values(grouped);
};

export default WORKOUT_CUSTOMIZATION_CONFIG; 