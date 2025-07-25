import { 
  Clock, 
  Target, 
  Activity, 
  Dumbbell, 
  Battery, 
  Moon, 
  Plus, 
  Minus
} from 'lucide-react';

import { 
  CustomizationConfig
} from '../types/config';

import { 
  DurationCustomization,
  FocusCustomization,
  EnhancedEquipmentCustomization,
  FocusAreasCustomization
} from '../components/customization';

import { validateDuration } from '../validation/durationValidation';
import { validateFocus } from '../validation/focusValidation';
import { validateEquipment } from '../validation/equipmentValidation';
import { validateFocusAreas } from '../validation/focusAreasValidation';
import { validateEnergy, validateSleep } from '../validation/energyValidation';
import { 
  createTrainingStructureConfig, 
  createTrainingDetailsConfig, 
  createPhysicalStateConfig, 
  createExerciseSelectionConfig,
  METADATA_PATTERNS
} from '../utils/configUtils';
import { 
  EnergyComponent, 
  SleepComponent, 
  IncludeComponent, 
  ExcludeComponent 
} from './componentFactories.jsx';
import type { ComponentType } from 'react';
import type { CustomizationComponentProps, ValidationResult, PerWorkoutOptions } from '../types/core';

// ============================================================================
// COMPONENT IMPLEMENTATIONS - Using modular components from /components/customization
// ============================================================================

// Component factories imported from ./componentFactories.ts

// ============================================================================
// CONFIGURATION ARRAY - The heart of the system
// ============================================================================

export const WORKOUT_CUSTOMIZATION_CONFIG: CustomizationConfig[] = [
  // Training Structure Configurations
  createTrainingStructureConfig('customization_duration', 'Workout Duration', DurationCustomization as ComponentType<CustomizationComponentProps<unknown>>, Clock, 1, validateDuration as (value: unknown, allOptions: PerWorkoutOptions) => ValidationResult, {
    metadata: METADATA_PATTERNS.basicSetup(
      ['time-management', 'planning', 'structure'],
      ['Understand workout timing', 'Plan session structure'],
      ['Better time management', 'Structured workout planning', 'Optimized recovery periods']
    )
  }),
  
  createTrainingStructureConfig('customization_focus', 'Primary Focus', FocusCustomization as ComponentType<CustomizationComponentProps<unknown>>, Target, 2, validateFocus as (value: unknown, allOptions: PerWorkoutOptions) => ValidationResult, {
    metadata: METADATA_PATTERNS.detailedSetup(
      ['goals', 'targeting', 'focus'],
      ['Identify fitness goals', 'Choose appropriate training style'],
      ['Goal-specific training', 'Targeted results', 'Efficient workout design']
    ),
    uiConfig: {
      componentType: 'progressive-disclosure',
      progressiveEnhancement: true,
      aiAssistance: 'full'
    }
  }),

  // Training Details Configurations
  createTrainingDetailsConfig('customization_areas', 'Focus Areas', FocusAreasCustomization as ComponentType<CustomizationComponentProps<unknown>>, Activity, 3, validateFocusAreas as (value: unknown, allOptions: PerWorkoutOptions) => ValidationResult, {
    metadata: METADATA_PATTERNS.advancedCustomization(
      ['muscle-groups', 'targeting', 'anatomy'],
      ['Understand muscle groups', 'Plan balanced training'],
      ['Targeted muscle development', 'Balanced physique', 'Injury prevention']
    ),
    uiConfig: {
      componentType: 'option-grid',
      gridColumns: { base: 2, md: 3 },
      multiSelect: true,
      progressiveEnhancement: true,
      aiAssistance: 'suggestions'
    }
  }),

  createTrainingDetailsConfig('customization_equipment', 'Available Equipment', EnhancedEquipmentCustomization as ComponentType<CustomizationComponentProps<unknown>>, Dumbbell, 4, validateEquipment as (value: unknown, allOptions: PerWorkoutOptions) => ValidationResult, {
    required: true,
    metadata: METADATA_PATTERNS.basicSetup(
      ['equipment', 'resources', 'environment'],
      ['Identify available equipment', 'Maximize equipment usage'],
      ['Optimized equipment usage', 'Effective workout design', 'Equipment-specific progressions']
    ),
    uiConfig: {
      componentType: 'progressive-disclosure',
      multiSelect: true,
      progressiveEnhancement: true,
      aiAssistance: 'suggestions'
    }
  }),

  // Physical State Configurations
  createPhysicalStateConfig('customization_energy', 'Current Energy Level', EnergyComponent as ComponentType<CustomizationComponentProps<unknown>>, Battery, 5, validateEnergy as (value: unknown, allOptions: PerWorkoutOptions) => ValidationResult, {
    required: true, // CHANGE TO TRUE to match Training Structure pattern
    metadata: METADATA_PATTERNS.basicSetup( // CHANGE TO basicSetup to match Training Details
      ['energy', 'readiness', 'state'],
      ['Assess current energy', 'Adapt workout intensity'],
      ['Optimized intensity', 'Better performance', 'Safe progression']
    ),
    validation: {
      required: true, // CHANGE TO TRUE
      custom: validateEnergy
    },
    uiConfig: {
      componentType: 'progressive-disclosure', // CHANGE TO match Training Details
      progressiveEnhancement: true, // CHANGE TO TRUE
      aiAssistance: 'suggestions'
    }
  }),

  createPhysicalStateConfig('customization_soreness', 'Muscle Soreness', SleepComponent as ComponentType<CustomizationComponentProps<unknown>>, Moon, 6, validateSleep as (value: unknown, allOptions: PerWorkoutOptions) => ValidationResult, {
    required: false, // Keep optional
    metadata: METADATA_PATTERNS.basicSetup(
      ['soreness', 'recovery', 'safety'],
      ['Identify soreness areas', 'Adapt workout safely'],
      ['Safe workout planning', 'Injury prevention', 'Better recovery']
    ),
    validation: {
      required: false,
      custom: validateSleep
    },
    uiConfig: {
      componentType: 'progressive-disclosure',
      progressiveEnhancement: true,
      aiAssistance: 'suggestions'
    }
  }),

  // Exercise Selection Configurations
  createExerciseSelectionConfig('customization_include', 'Include Exercises', IncludeComponent as ComponentType<CustomizationComponentProps<unknown>>, Plus, 7, {
    metadata: METADATA_PATTERNS.someExperienceCustomization(
      ['exercises', 'preferences', 'customization'],
      ['Specify preferred exercises', 'Customize workout content'],
      ['Personalized exercise selection', 'Enjoyable workouts', 'Skill development']
    )
  }),

  createExerciseSelectionConfig('customization_exclude', 'Exclude Exercises', ExcludeComponent as ComponentType<CustomizationComponentProps<unknown>>, Minus, 8, {
    metadata: METADATA_PATTERNS.someExperienceCustomization(
      ['exercises', 'limitations', 'safety'],
      ['Identify limitations', 'Ensure safe exercise selection'],
      ['Safe workout planning', 'Injury prevention', 'Comfortable training']
    )
  })
];

// Re-export the generateStepsFromConfig function from utils
export { generateStepsFromConfig } from '../utils/configUtils';

export default WORKOUT_CUSTOMIZATION_CONFIG; 