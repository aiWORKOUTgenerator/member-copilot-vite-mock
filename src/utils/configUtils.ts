import { CustomizationConfig } from '../types/config';
import { ValidationResult, PerWorkoutOptions, CustomizationComponentProps } from '../types/core';
import React from 'react';
import { FitnessLevel } from '../types/user';

// ============================================================================
// METADATA TEMPLATES - Common patterns for reducing repetition
// ============================================================================

export const createMetadataTemplate = (
  difficulty: 'new to exercise' | 'some experience' | 'advanced athlete',
  timeRequired: number,
  tags: string[],
  learningObjectives: string[],
  userBenefits: string[]
) => ({
  difficulty,
  timeRequired,
  tags,
  learningObjectives,
  userBenefits
});

// Common metadata patterns
export const METADATA_PATTERNS = {
  quickAssessment: (tags: string[], objectives: string[], benefits: string[]) => 
    createMetadataTemplate('new to exercise', 1, tags, objectives, benefits),
  
  basicSetup: (tags: string[], objectives: string[], benefits: string[]) => 
    createMetadataTemplate('new to exercise', 2, tags, objectives, benefits),
  
  detailedSetup: (tags: string[], objectives: string[], benefits: string[]) => 
    createMetadataTemplate('new to exercise', 3, tags, objectives, benefits),
  
  someExperienceCustomization: (tags: string[], objectives: string[], benefits: string[]) => 
    createMetadataTemplate('some experience', 2, tags, objectives, benefits),
  
  advancedCustomization: (tags: string[], objectives: string[], benefits: string[]) => 
    createMetadataTemplate('some experience', 3, tags, objectives, benefits)
};

/**
 * Generate navigation steps from configuration
 * Groups customization configs by category and sorts them by order
 */
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
  }, {} as Record<string, { id: string; label: string; icon: React.ComponentType<{ className?: string }>; configs: CustomizationConfig[] }>);

  // Sort configs within each category by order
  Object.values(grouped).forEach((step) => {
    step.configs.sort((a, b) => (a.order || 999) - (b.order || 999));
  });

  return Object.values(grouped);
};

/**
 * Create a base configuration with default values
 */
export const createBaseConfig = (
  key: keyof PerWorkoutOptions,
  label: string,
  component: React.ComponentType<CustomizationComponentProps<unknown>>,
  icon: React.ComponentType<{ className?: string }>,
  overrides: Partial<CustomizationConfig> = {}
): CustomizationConfig => ({
  key,
  label,
  component,
  icon,
  category: 'General',
  required: false,
  order: 999,
  metadata: {
    difficulty: 'new to exercise',
    timeRequired: 2,
    tags: [],
    learningObjectives: [],
    userBenefits: []
  },
  validation: {
    required: false
  },
  uiConfig: {
    componentType: 'option-grid',
    progressiveEnhancement: false,
    aiAssistance: 'none'
  },
  ...overrides
});

/**
 * Create a training structure configuration (Duration, Focus, etc.)
 */
export const createTrainingStructureConfig = (
  key: keyof PerWorkoutOptions,
  label: string,
  component: React.ComponentType<CustomizationComponentProps<unknown>>,
  icon: React.ComponentType<{ className?: string }>,
  order: number,
  validationFn?: (value: unknown, allOptions: PerWorkoutOptions) => ValidationResult,
  overrides: Partial<CustomizationConfig> = {}
): CustomizationConfig => createBaseConfig(key, label, component, icon, {
  category: 'Training Structure',
  required: true,
  order,
  metadata: {
    difficulty: 'new to exercise',
    timeRequired: 3,
    tags: ['training', 'structure', 'planning'],
    learningObjectives: ['Understand training principles', 'Structure effective workouts'],
    userBenefits: ['Better workout planning', 'Improved results', 'Time efficiency']
  },
  validation: {
    required: true,
    custom: validationFn
  },
  uiConfig: {
    componentType: 'progressive-disclosure',
    progressiveEnhancement: true,
    aiAssistance: 'suggestions'
  },
  ...overrides
});

/**
 * Create a training details configuration (Areas, Equipment, etc.)
 */
export const createTrainingDetailsConfig = (
  key: keyof PerWorkoutOptions,
  label: string,
  component: React.ComponentType<CustomizationComponentProps<unknown>>,
  icon: React.ComponentType<{ className?: string }>,
  order: number,
  validationFn?: (value: unknown, allOptions: PerWorkoutOptions) => ValidationResult,
  overrides: Partial<CustomizationConfig> = {}
): CustomizationConfig => createBaseConfig(key, label, component, icon, {
  category: 'Training Details',
  required: false,
  order,
  metadata: {
    difficulty: 'some experience',
    timeRequired: 3,
    tags: ['details', 'customization', 'specifics'],
    learningObjectives: ['Configure training details', 'Optimize workout settings'],
    userBenefits: ['Personalized workouts', 'Better results', 'Targeted training']
  },
  validation: {
    required: false,
    custom: validationFn
  },
  uiConfig: {
    componentType: 'option-grid',
    progressiveEnhancement: true,
    aiAssistance: 'suggestions'
  },
  ...overrides
});

/**
 * Create a physical state configuration (Energy, Sleep, etc.)
 */
export const createPhysicalStateConfig = (
  key: keyof PerWorkoutOptions,
  label: string,
  component: React.ComponentType<CustomizationComponentProps<unknown>>,
  icon: React.ComponentType<{ className?: string }>,
  order: number,
  validationFn?: (value: unknown, allOptions: PerWorkoutOptions) => ValidationResult,
  overrides: Partial<CustomizationConfig> = {}
): CustomizationConfig => createBaseConfig(key, label, component, icon, {
  category: 'Physical State',
  required: false,
  order,
  metadata: {
    difficulty: 'new to exercise',
    timeRequired: 1,
    tags: ['state', 'readiness', 'assessment'],
    learningObjectives: ['Assess current state', 'Adapt workout intensity'],
    userBenefits: ['Optimized intensity', 'Better recovery', 'Safe progression']
  },
  validation: {
    required: false,
    custom: validationFn
  },
  uiConfig: {
    componentType: 'rating-scale',
    progressiveEnhancement: false,
    aiAssistance: 'suggestions'
  },
  ...overrides
});

/**
 * Create an exercise selection configuration (Include/Exclude exercises)
 */
export const createExerciseSelectionConfig = (
  key: keyof PerWorkoutOptions,
  label: string,
  component: React.ComponentType<CustomizationComponentProps<unknown>>,
  icon: React.ComponentType<{ className?: string }>,
  order: number,
  overrides: Partial<CustomizationConfig> = {}
): CustomizationConfig => createBaseConfig(key, label, component, icon, {
  category: 'Exercise Selection',
  required: false,
  order,
  metadata: {
    difficulty: 'some experience',
    timeRequired: 2,
    tags: ['exercises', 'selection', 'preferences'],
    learningObjectives: ['Select exercises', 'Customize workout content'],
    userBenefits: ['Personalized selection', 'Preferred exercises', 'Targeted training']
  },
  uiConfig: {
    componentType: 'text-input',
    progressiveEnhancement: true,
    aiAssistance: 'full'
  },
  ...overrides
}); 

/**
 * Maps UI experience level values to AI service fitness levels by converting to lowercase
 * This preserves the meaning while making them compatible with AI services
 * Also handles legacy 'Beginner' value migration
 */
export const mapExperienceLevelToFitnessLevel = (experienceLevel: string): FitnessLevel => {
  // Handle legacy 'Beginner' value migration
  if (experienceLevel === 'Beginner') {
    console.warn('⚠️ Legacy experience level "Beginner" detected, migrating to "New to Exercise"');
    return 'new to exercise';
  }
  
  // Handle valid experience levels
  const normalized = experienceLevel.toLowerCase();
  if (['new to exercise', 'some experience', 'advanced athlete'].includes(normalized)) {
    return normalized as FitnessLevel;
  }
  
  // Fallback for unknown values
  console.warn(`⚠️ Unknown experience level: ${experienceLevel}, defaulting to "some experience"`);
  return 'some experience';
};

/**
 * Maps AI service fitness levels back to UI experience level values
 * This preserves the original UI meaning
 */
export const mapFitnessLevelToExperienceLevel = (fitnessLevel: string): string => {
  // Convert back to proper case for UI display
  switch (fitnessLevel.toLowerCase()) {
    case 'new to exercise':
      return 'New to Exercise';
    case 'some experience':
      return 'Some Experience';
    case 'advanced athlete':
      return 'Advanced Athlete';
    case 'beginner':
      // Handle legacy 'beginner' value
      console.warn('⚠️ Legacy fitness level "beginner" detected, mapping to "New to Exercise"');
      return 'New to Exercise';
    default:
      console.warn(`⚠️ Unknown fitness level: ${fitnessLevel}, defaulting to "Some Experience"`);
      return 'Some Experience';
  }
}; 