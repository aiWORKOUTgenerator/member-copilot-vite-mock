import { PromptVariableComposer } from '../DataTransformer';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { PromptTemplate } from '../types/external-ai.types';
import { WORKOUT_TEMPLATES } from './templates';
import { logger } from '../../../../utils/logger';

export class WorkoutPromptBuilder {
  private composer: PromptVariableComposer;

  constructor(debugMode = false) {
    this.composer = new PromptVariableComposer(debugMode);
  }

  buildWorkoutPrompt(request: WorkoutGenerationRequest): { template: PromptTemplate; variables: Record<string, unknown> } {
    try {
      // Transform data using the DataTransformer
      const promptVariables = this.composer.transformToPromptVariables(
        request.profileData,
        request.workoutFocusData,
        request.additionalContext
      );

      // Log the transformed variables for debugging
      logger.debug('Transformed prompt variables:', {
        hasExperienceLevel: !!promptVariables.experienceLevel,
        hasPrimaryGoal: !!promptVariables.primaryGoal,
        hasFocus: !!promptVariables.focus,
        hasEnergyLevel: !!promptVariables.energyLevel,
        variables: promptVariables
      });

      // Select the appropriate template based on workout type
      const template = WORKOUT_TEMPLATES[request.workoutType] || WORKOUT_TEMPLATES.default;

      return {
        template,
        variables: promptVariables
      };
    } catch (error) {
      logger.error('Failed to build workout prompt:', error);
      throw new Error(`Failed to build workout prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validatePromptVariables(variables: Record<string, unknown>): void {
    // Check for unresolved template variables
    Object.entries(variables).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('{{')) {
        throw new Error(`Unresolved template variable in field: ${key}`);
      }
    });

    // Check for required fields
    const requiredFields = [
      'experienceLevel',
      'primaryGoal',
      'focus',
      'duration',
      'energyLevel'
    ];

    const missingFields = requiredFields.filter(field => !variables[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
} 