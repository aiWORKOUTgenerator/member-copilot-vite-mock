import React from 'react';
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
  ValidationResult
} from '../types/core';

import { 
  DurationCustomization,
  FocusCustomization,
  EnhancedEquipmentCustomization,
  FocusAreasCustomization,
  RatingScaleWrapper,
  TextInputWrapper
} from '../components/customization';

// import { 
//   validateDuration,
//   validateFocus,
//   validateEquipment,
//   validateFocusAreas,
//   validateEnergy,
//   validateSleep
// } from '../validation';

// ============================================================================
// COMPONENT IMPLEMENTATIONS - Using modular components from /components/customization
// ============================================================================

// Components are now imported from their respective modules
// Duration and Focus customization are still inline until migration is complete

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
      required: true
      // custom: validateDuration
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
      required: true
      // custom: validateFocus
    },
    uiConfig: {
      componentType: 'progressive-disclosure',
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
      // custom: validateFocusAreas
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
    component: EnhancedEquipmentCustomization,
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
      required: true
      // custom: validateEquipment
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
    component: ({ value, onChange, userProfile }) => (
      <RatingScaleWrapper
        value={value}
        onChange={onChange}
        userProfile={userProfile}
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
        enableAI={true}
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
      // custom: validateEnergy
    },
    uiConfig: {
      componentType: 'rating-scale',
      aiAssistance: 'suggestions'
    }
  },
  {
    key: 'customization_sleep',
    component: ({ value, onChange, userProfile }) => (
      <RatingScaleWrapper
        value={value}
        onChange={onChange}
        userProfile={userProfile}
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
        enableAI={true}
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
    validation: {
      // custom: validateSleep
    },
    uiConfig: {
      componentType: 'rating-scale',
      aiAssistance: 'suggestions'
    }
  },
  {
    key: 'customization_include',
    component: ({ value, onChange, userProfile }) => (
      <TextInputWrapper
        value={value}
        onChange={onChange}
        userProfile={userProfile}
        type="include"
        enableAI={true}
      />
    ),
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
    component: ({ value, onChange, userProfile }) => (
      <TextInputWrapper
        value={value}
        onChange={onChange}
        userProfile={userProfile}
        type="exclude"
        enableAI={true}
      />
    ),
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