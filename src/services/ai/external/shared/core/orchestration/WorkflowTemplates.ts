// Workflow Templates - Pre-built Advanced AI Workflows
// These templates showcase complex orchestration patterns and can be used as examples

import { 
  WorkflowConfig, 
  WorkflowTemplate,
  WorkflowStep,
  RetryPolicy,
  ErrorHandlingStrategy
} from '../../types/workflow.types';

// ===== COMMON RETRY POLICIES =====

export const STANDARD_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  backoffMultiplier: 2,
  initialDelay: 1000,
  maxDelay: 10000,
  retryableErrors: ['timeout', 'rate-limit', 'service-unavailable']
};

export const AGGRESSIVE_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 5,
  backoffMultiplier: 1.5,
  initialDelay: 500,
  maxDelay: 8000,
  retryableErrors: ['timeout', 'rate-limit', 'service-unavailable', 'network-error']
};

// ===== COMMON ERROR HANDLING STRATEGIES =====

export const RESILIENT_ERROR_HANDLING: ErrorHandlingStrategy = {
  onStepFailure: 'fallback',
  onWorkflowFailure: 'cleanup',
  rollbackSteps: [],
  cleanupSteps: ['cleanup-temp-data', 'log-failure']
};

export const STRICT_ERROR_HANDLING: ErrorHandlingStrategy = {
  onStepFailure: 'stop',
  onWorkflowFailure: 'rollback',
  rollbackSteps: ['rollback-data-changes'],
  cleanupSteps: ['cleanup-temp-data']
};

// ===== WORKFLOW TEMPLATES =====

/**
 * Comprehensive Workout Generation - Multi-step AI workflow
 * This demonstrates complex feature integration and data flow
 */
export const COMPREHENSIVE_WORKOUT_WORKFLOW: WorkflowConfig = {
  id: 'comprehensive-workout-generation',
  name: 'Comprehensive Workout Generation',
  description: 'Generate personalized workout with full analysis and recommendations',
  version: '1.0.0',
  timeout: 45000,
  retryPolicy: STANDARD_RETRY_POLICY,
  errorHandling: RESILIENT_ERROR_HANDLING,
  maxConcurrency: 3,
  steps: [
    {
      id: 'analyze-user-preferences',
      name: 'Analyze User Preferences',
      type: 'feature-call',
      feature: 'user-preference-analysis',
      operation: 'analyzeUserProfile',
      params: {
        userId: '{{userId}}',
        includeHistory: true,
        analyzePatterns: true
      },
      timeout: 10000,
      retries: 2
    },
    {
      id: 'generate-base-workout',
      name: 'Generate Base Workout',
      type: 'feature-call',
      feature: 'quick-workout-setup',
      operation: 'generateWorkout',
      params: {
        duration: '{{duration}}',
        focus: '{{focus}}',
        equipment: '{{equipment}}',
        userPreferences: '{{stepResults.analyze-user-preferences}}'
      },
      dependencies: ['analyze-user-preferences'],
      timeout: 15000,
      retries: 3,
      fallback: {
        id: 'generate-basic-workout',
        name: 'Generate Basic Workout Fallback',
        type: 'feature-call',
        feature: 'quick-workout-setup',
        operation: 'generateBasicWorkout',
        params: {
          duration: '{{duration}}',
          focus: '{{focus}}'
        }
      }
    },
    {
      id: 'parallel-enhancement',
      name: 'Parallel Workout Enhancement',
      type: 'parallel',
      dependencies: ['generate-base-workout'],
      parallel: [
        {
          id: 'generate-recommendations',
          name: 'Generate Workout Recommendations',
          type: 'feature-call',
          feature: 'workout-recommendations',
          operation: 'generateRecommendations',
          params: {
            baseWorkout: '{{stepResults.generate-base-workout}}',
            userProfile: '{{stepResults.analyze-user-preferences}}',
            includeProgressions: true
          }
        },
        {
          id: 'evaluate-equipment',
          name: 'Evaluate Equipment Needs',
          type: 'feature-call',
          feature: 'equipment-analysis',
          operation: 'evaluateEquipment',
          params: {
            workout: '{{stepResults.generate-base-workout}}',
            availableEquipment: '{{equipment}}',
            suggestAlternatives: true
          }
        },
        {
          id: 'analyze-safety',
          name: 'Safety Analysis',
          type: 'feature-call',
          feature: 'safety-validator',
          operation: 'analyzeSafety',
          params: {
            workout: '{{stepResults.generate-base-workout}}',
            userProfile: '{{stepResults.analyze-user-preferences}}',
            checkContraindications: true
          }
        }
      ]
    },
    {
      id: 'generate-detailed-workout',
      name: 'Generate Detailed Workout',
      type: 'feature-call',
      feature: 'detailed-workout-generation',
      operation: 'enhanceWorkout',
      params: {
        baseWorkout: '{{stepResults.generate-base-workout}}',
        recommendations: '{{stepResults.parallel-enhancement.generate-recommendations}}',
        equipmentAnalysis: '{{stepResults.parallel-enhancement.evaluate-equipment}}',
        safetyAnalysis: '{{stepResults.parallel-enhancement.analyze-safety}}'
      },
      dependencies: ['parallel-enhancement'],
      timeout: 20000,
      retries: 2
    },
    {
      id: 'finalize-workout',
      name: 'Finalize Workout',
      type: 'feature-call',
      feature: 'workout-finalizer',
      operation: 'finalizeWorkout',
      params: {
        detailedWorkout: '{{stepResults.generate-detailed-workout}}',
        addMetadata: true,
        generateSummary: true
      },
      dependencies: ['generate-detailed-workout'],
      timeout: 5000
    }
  ],
  metadata: {
    category: 'ai-generation',
    complexity: 'high',
    estimatedDuration: 30000,
    requiredFeatures: [
      'user-preference-analysis',
      'quick-workout-setup', 
      'workout-recommendations',
      'equipment-analysis',
      'safety-validator',
      'detailed-workout-generation',
      'workout-finalizer'
    ]
  }
};

/**
 * Real-time Workout Adaptation - Event-driven workflow
 * This demonstrates conditional logic and real-time adaptation
 */
export const REALTIME_WORKOUT_ADAPTATION: WorkflowConfig = {
  id: 'realtime-workout-adaptation',
  name: 'Real-time Workout Adaptation',
  description: 'Adapt workout in real-time based on user feedback and performance',
  version: '1.0.0',
  timeout: 10000,
  retryPolicy: AGGRESSIVE_RETRY_POLICY,
  errorHandling: RESILIENT_ERROR_HANDLING,
  maxConcurrency: 2,
  steps: [
    {
      id: 'assess-current-state',
      name: 'Assess Current State',
      type: 'feature-call',
      feature: 'performance-monitor',
      operation: 'assessCurrentState',
      params: {
        userId: '{{userId}}',
        workoutId: '{{workoutId}}',
        currentExercise: '{{currentExercise}}'
      },
      timeout: 3000
    },
    {
      id: 'check-adaptation-needed',
      name: 'Check if Adaptation Needed',
      type: 'conditional',
      condition: {
        type: 'custom',
        field: 'stepResults.assess-current-state.adaptationScore',
        customValidator: (context) => {
          const score = context.stepResults['assess-current-state']?.adaptationScore || 0;
          return score > 0.7; // Adaptation needed if score > 70%
        }
      },
      dependencies: ['assess-current-state']
    },
    {
      id: 'conditional-adaptation',
      name: 'Conditional Workout Adaptation',
      type: 'conditional',
      condition: {
        type: 'equals',
        field: 'stepResults.check-adaptation-needed.conditionMet',
        value: true
      },
      dependencies: ['check-adaptation-needed']
    },
    {
      id: 'parallel-adaptation-analysis',
      name: 'Parallel Adaptation Analysis',
      type: 'parallel',
      dependencies: ['conditional-adaptation'],
      parallel: [
        {
          id: 'analyze-performance',
          name: 'Analyze Performance',
          type: 'feature-call',
          feature: 'performance-analyzer',
          operation: 'analyzePerformance',
          params: {
            currentState: '{{stepResults.assess-current-state}}',
            performanceHistory: '{{performanceHistory}}'
          }
        },
        {
          id: 'get-user-feedback',
          name: 'Get User Feedback',
          type: 'feature-call',
          feature: 'feedback-collector',
          operation: 'getCurrentFeedback',
          params: {
            userId: '{{userId}}',
            workoutId: '{{workoutId}}'
          }
        }
      ]
    },
    {
      id: 'generate-adaptations',
      name: 'Generate Workout Adaptations',
      type: 'feature-call',
      feature: 'workout-adapter',
      operation: 'generateAdaptations',
      params: {
        currentWorkout: '{{currentWorkout}}',
        performanceAnalysis: '{{stepResults.parallel-adaptation-analysis.analyze-performance}}',
        userFeedback: '{{stepResults.parallel-adaptation-analysis.get-user-feedback}}',
        adaptationType: 'real-time'
      },
      dependencies: ['parallel-adaptation-analysis'],
      timeout: 8000
    }
  ],
  metadata: {
    category: 'real-time-adaptation',
    complexity: 'medium',
    estimatedDuration: 8000,
    requiredFeatures: [
      'performance-monitor',
      'performance-analyzer',
      'feedback-collector',
      'workout-adapter'
    ]
  }
};

/**
 * Progressive Training Program - Long-running workflow
 * This demonstrates sequential workflow with state management
 */
export const PROGRESSIVE_TRAINING_PROGRAM: WorkflowConfig = {
  id: 'progressive-training-program',
  name: 'Progressive Training Program',
  description: 'Create a multi-week progressive training program',
  version: '1.0.0',
  timeout: 60000,
  retryPolicy: STANDARD_RETRY_POLICY,
  errorHandling: STRICT_ERROR_HANDLING,
  maxConcurrency: 4,
  steps: [
    {
      id: 'baseline-assessment',
      name: 'Baseline Fitness Assessment',
      type: 'feature-call',
      feature: 'fitness-assessor',
      operation: 'performBaselineAssessment',
      params: {
        userId: '{{userId}}',
        assessmentType: 'comprehensive',
        includeHistory: true
      },
      timeout: 15000
    },
    {
      id: 'goal-analysis',
      name: 'Training Goal Analysis',
      type: 'feature-call',
      feature: 'goal-analyzer',
      operation: 'analyzeTrainingGoals',
      params: {
        userId: '{{userId}}',
        goals: '{{goals}}',
        timeline: '{{timeline}}',
        baselineAssessment: '{{stepResults.baseline-assessment}}'
      },
      dependencies: ['baseline-assessment'],
      timeout: 10000
    },
    {
      id: 'sequential-program-creation',
      name: 'Sequential Program Creation',
      type: 'sequential',
      dependencies: ['goal-analysis'],
      sequential: [
        {
          id: 'create-week1-4',
          name: 'Create Weeks 1-4 (Foundation)',
          type: 'feature-call',
          feature: 'program-builder',
          operation: 'createProgramPhase',
          params: {
            phase: 'foundation',
            weeks: [1, 2, 3, 4],
            baselineAssessment: '{{stepResults.baseline-assessment}}',
            goalAnalysis: '{{stepResults.goal-analysis}}'
          }
        },
        {
          id: 'create-week5-8',
          name: 'Create Weeks 5-8 (Development)',
          type: 'feature-call',
          feature: 'program-builder',
          operation: 'createProgramPhase',
          params: {
            phase: 'development',
            weeks: [5, 6, 7, 8],
            previousPhase: '{{stepResults.create-week1-4}}',
            progressionRate: 1.15
          }
        },
        {
          id: 'create-week9-12',
          name: 'Create Weeks 9-12 (Specialization)',
          type: 'feature-call',
          feature: 'program-builder',
          operation: 'createProgramPhase',
          params: {
            phase: 'specialization',
            weeks: [9, 10, 11, 12],
            previousPhase: '{{stepResults.create-week5-8}}',
            progressionRate: 1.25
          }
        }
      ]
    },
    {
      id: 'validate-program',
      name: 'Validate Complete Program',
      type: 'feature-call',
      feature: 'program-validator',
      operation: 'validateProgram',
      params: {
        completeProgram: {
          foundation: '{{stepResults.sequential-program-creation.create-week1-4}}',
          development: '{{stepResults.sequential-program-creation.create-week5-8}}',
          specialization: '{{stepResults.sequential-program-creation.create-week9-12}}'
        },
        validationLevel: 'comprehensive'
      },
      dependencies: ['sequential-program-creation'],
      timeout: 10000
    }
  ],
  metadata: {
    category: 'program-design',
    complexity: 'high',
    estimatedDuration: 45000,
    requiredFeatures: [
      'fitness-assessor',
      'goal-analyzer',
      'program-builder',
      'program-validator'
    ]
  }
};

/**
 * Multi-User Group Workout - Complex coordination workflow
 * This demonstrates advanced parallel processing and coordination
 */
export const MULTI_USER_GROUP_WORKOUT: WorkflowConfig = {
  id: 'multi-user-group-workout',
  name: 'Multi-User Group Workout',
  description: 'Generate coordinated workout for multiple users with different capabilities',
  version: '1.0.0',
  timeout: 120000, // Increased from 30s to 120s
  retryPolicy: AGGRESSIVE_RETRY_POLICY,
  errorHandling: RESILIENT_ERROR_HANDLING,
  maxConcurrency: 10, // High concurrency for multiple users
  steps: [
    {
      id: 'analyze-group-composition',
      name: 'Analyze Group Composition',
      type: 'feature-call',
      feature: 'group-analyzer',
      operation: 'analyzeGroup',
      params: {
        userIds: '{{userIds}}',
        groupType: '{{groupType}}',
        sessionDuration: '{{duration}}'
      },
      timeout: 8000
    },
    {
      id: 'parallel-individual-analysis',
      name: 'Parallel Individual Analysis',
      type: 'parallel',
      dependencies: ['analyze-group-composition'],
      parallel: [
        {
          id: 'analyze-fitness-levels',
          name: 'Analyze Individual Fitness Levels',
          type: 'feature-call',
          feature: 'fitness-analyzer',
          operation: 'analyzeBatch',
          params: {
            userIds: '{{userIds}}',
            analysisType: 'fitness-level'
          }
        },
        {
          id: 'analyze-preferences',
          name: 'Analyze Individual Preferences',
          type: 'feature-call',
          feature: 'preference-analyzer',
          operation: 'analyzeBatch',
          params: {
            userIds: '{{userIds}}',
            analysisType: 'workout-preferences'
          }
        },
        {
          id: 'analyze-limitations',
          name: 'Analyze Individual Limitations',
          type: 'feature-call',
          feature: 'limitation-analyzer',
          operation: 'analyzeBatch',
          params: {
            userIds: '{{userIds}}',
            analysisType: 'physical-limitations'
          }
        }
      ]
    },
    {
      id: 'find-common-ground',
      name: 'Find Common Ground',
      type: 'feature-call',
      feature: 'compatibility-finder',
      operation: 'findCompatibility',
      params: {
        groupComposition: '{{stepResults.analyze-group-composition}}',
        fitnessLevels: '{{stepResults.parallel-individual-analysis.analyze-fitness-levels}}',
        preferences: '{{stepResults.parallel-individual-analysis.analyze-preferences}}',
        limitations: '{{stepResults.parallel-individual-analysis.analyze-limitations}}'
      },
      dependencies: ['parallel-individual-analysis'],
      timeout: 10000
    },
    {
      id: 'generate-base-group-workout',
      name: 'Generate Base Group Workout',
      type: 'feature-call',
      feature: 'group-workout-generator',
      operation: 'generateGroupWorkout',
      params: {
        compatibility: '{{stepResults.find-common-ground}}',
        duration: '{{duration}}',
        equipment: '{{equipment}}'
      },
      dependencies: ['find-common-ground'],
      timeout: 12000
    },
    {
      id: 'generate-individual-variations',
      name: 'Generate Individual Variations',
      type: 'parallel',
      dependencies: ['generate-base-group-workout'],
      parallel: [
        {
          id: 'beginner-modifications',
          name: 'Generate Beginner Modifications',
          type: 'feature-call',
          feature: 'modification-generator',
          operation: 'generateModifications',
          params: {
            baseWorkout: '{{stepResults.generate-base-group-workout}}',
            targetGroup: 'beginner',
            userIds: '{{beginnerUserIds}}'
          }
        },
        {
          id: 'advanced-modifications',
          name: 'Generate Advanced Modifications',
          type: 'feature-call',
          feature: 'modification-generator',
          operation: 'generateModifications',
          params: {
            baseWorkout: '{{stepResults.generate-base-group-workout}}',
            targetGroup: 'advanced',
            userIds: '{{advancedUserIds}}'
          }
        },
        {
          id: 'limitation-modifications',
          name: 'Generate Limitation-Based Modifications',
          type: 'feature-call',
          feature: 'modification-generator',
          operation: 'generateLimitationModifications',
          params: {
            baseWorkout: '{{stepResults.generate-base-group-workout}}',
            limitations: '{{stepResults.parallel-individual-analysis.analyze-limitations}}'
          }
        }
      ]
    }
  ],
  metadata: {
    category: 'group-coordination',
    complexity: 'high',
    estimatedDuration: 25000,
    requiredFeatures: [
      'group-analyzer',
      'fitness-analyzer',
      'preference-analyzer',
      'limitation-analyzer',
      'compatibility-finder',
      'group-workout-generator',
      'modification-generator'
    ]
  }
};

// ===== WORKFLOW TEMPLATE REGISTRY =====

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  'comprehensive-workout': {
    id: 'comprehensive-workout',
    name: 'Comprehensive Workout Generation',
    description: 'Generate a complete personalized workout with full analysis and recommendations',
    category: 'ai-generation',
    template: COMPREHENSIVE_WORKOUT_WORKFLOW,
    parameterSchema: {
      type: 'object',
      required: ['userId', 'duration', 'focus'],
      properties: {
        userId: { type: 'string', description: 'User identifier' },
        duration: { type: 'number', minimum: 5, maximum: 120, description: 'Workout duration in minutes' },
        focus: { type: 'string', enum: ['strength', 'cardio', 'flexibility', 'mixed'], description: 'Workout focus area' },
        equipment: { type: 'array', items: { type: 'string' }, description: 'Available equipment' }
      }
    },
    examples: [
      {
        name: 'Basic Strength Workout',
        description: 'Generate a 30-minute strength workout',
        parameters: {
          userId: 'user123',
          duration: 30,
          focus: 'strength',
          equipment: ['dumbbells', 'bench']
        },
        expectedResult: 'Complete strength workout with warm-up, main exercises, and cool-down'
      }
    ]
  },
  
  'realtime-adaptation': {
    id: 'realtime-adaptation',
    name: 'Real-time Workout Adaptation',
    description: 'Adapt workout in real-time based on user feedback and performance metrics',
    category: 'real-time',
    template: REALTIME_WORKOUT_ADAPTATION,
    parameterSchema: {
      type: 'object',
      required: ['userId', 'workoutId', 'currentExercise'],
      properties: {
        userId: { type: 'string', description: 'User identifier' },
        workoutId: { type: 'string', description: 'Current workout identifier' },
        currentExercise: { type: 'object', description: 'Current exercise being performed' },
        performanceHistory: { type: 'array', description: 'Historical performance data' }
      }
    },
    examples: [
      {
        name: 'Mid-Workout Adaptation',
        description: 'Adapt workout during execution based on fatigue',
        parameters: {
          userId: 'user123',
          workoutId: 'workout456',
          currentExercise: { name: 'Push-ups', sets: 3, reps: 15 },
          performanceHistory: []
        },
        expectedResult: 'Adapted exercise difficulty and remaining workout plan'
      }
    ]
  },

  'progressive-program': {
    id: 'progressive-program',
    name: 'Progressive Training Program',
    description: 'Create a comprehensive multi-week progressive training program',
    category: 'program-design',
    template: PROGRESSIVE_TRAINING_PROGRAM,
    parameterSchema: {
      type: 'object',
      required: ['userId', 'goals', 'timeline'],
      properties: {
        userId: { type: 'string', description: 'User identifier' },
        goals: { type: 'array', items: { type: 'string' }, description: 'Training goals' },
        timeline: { type: 'number', minimum: 4, maximum: 52, description: 'Program duration in weeks' }
      }
    },
    examples: [
      {
        name: '12-Week Strength Program',
        description: 'Create a progressive 12-week strength training program',
        parameters: {
          userId: 'user123',
          goals: ['increase-strength', 'build-muscle', 'improve-endurance'],
          timeline: 12
        },
        expectedResult: 'Complete 12-week progressive training program with phase-based progression'
      }
    ]
  },

  'group-workout': {
    id: 'group-workout',
    name: 'Multi-User Group Workout',
    description: 'Generate coordinated workout for multiple users with different capabilities',
    category: 'group-coordination',
    template: MULTI_USER_GROUP_WORKOUT,
    parameterSchema: {
      type: 'object',
      required: ['userIds', 'duration', 'groupType'],
      properties: {
        userIds: { type: 'array', items: { type: 'string' }, description: 'Array of user identifiers' },
        duration: { type: 'number', minimum: 15, maximum: 90, description: 'Session duration in minutes' },
        groupType: { type: 'string', enum: ['mixed', 'beginner', 'intermediate', 'advanced'], description: 'Group fitness level' },
        equipment: { type: 'array', items: { type: 'string' }, description: 'Available equipment' }
      }
    },
    examples: [
      {
        name: 'Mixed Level Group Session',
        description: 'Create workout for mixed fitness level group',
        parameters: {
          userIds: ['user1', 'user2', 'user3', 'user4'],
          duration: 45,
          groupType: 'mixed',
          equipment: ['dumbbells', 'mats', 'resistance-bands']
        },
        expectedResult: 'Group workout with individual modifications for different fitness levels'
      }
    ]
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get workflow template by ID
 */
export function getWorkflowTemplate(templateId: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES[templateId];
}

/**
 * List all available workflow templates
 */
export function listWorkflowTemplates(): WorkflowTemplate[] {
  return Object.values(WORKFLOW_TEMPLATES);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
  return Object.values(WORKFLOW_TEMPLATES).filter(template => template.category === category);
}

/**
 * Create workflow config from template with parameter substitution
 */
export function createWorkflowFromTemplate(
  templateId: string, 
  parameters: Record<string, any>
): WorkflowConfig | null {
  const template = WORKFLOW_TEMPLATES[templateId];
  if (!template) {
    return null;
  }

  // Deep clone the template config
  const config = JSON.parse(JSON.stringify(template.template)) as WorkflowConfig;
  
  // Apply parameter substitution
  const configString = JSON.stringify(config);
  const substitutedString = configString.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const value = getNestedValue(parameters, key.trim());
    return value !== undefined ? JSON.stringify(value) : match;
  });
  
  return JSON.parse(substitutedString);
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
} 