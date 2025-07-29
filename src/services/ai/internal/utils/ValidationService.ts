import { 
  InternalPromptContext,
  InternalPromptConfig,
  InternalRecommendation 
} from '../types/internal-prompt.types';
import { ProfileData } from '../../../../components/Profile/types/profile.types';
import { PerWorkoutOptions } from '../../../../types/core';
import { aiLogger } from '../../logging/AILogger';

/**
 * Validation issue with severity level
 */
export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  context?: string;
  recommendation?: string;
}

/**
 * Validation result with issues and summary
 */
export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

/**
 * Enhanced validation service for internal prompt system
 */
export class ValidationService {
  /**
   * Validate profile data for internal prompt system
   */
  public static validateProfileData(data: ProfileData): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Required fields validation
    const requiredFields = [
      'experienceLevel',
      'primaryGoal',
      'preferredActivities',
      'availableEquipment',
      'injuries'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        issues.push({
          field,
          message: `${field} is required`,
          severity: 'error',
          context: 'profile data validation'
        });
      }
    }

    // Array content validation
    if (!data.preferredActivities?.length) {
      issues.push({
        field: 'preferredActivities',
        message: 'At least one preferred activity is required',
        severity: 'error',
        context: 'profile data validation',
        recommendation: 'Select activities that match your interests and goals'
      });
    }

    if (!data.availableEquipment?.length) {
      issues.push({
        field: 'availableEquipment',
        message: 'At least one equipment item is required',
        severity: 'error',
        context: 'profile data validation',
        recommendation: 'Select equipment you have access to, including bodyweight'
      });
    }

    // Experience level validation
    if (data.experienceLevel === 'Advanced Athlete' && !data.calculatedFitnessLevel) {
      issues.push({
        field: 'experienceLevel',
        message: 'Fitness level calculation required for advanced athletes',
        severity: 'warning',
        context: 'profile data validation',
        recommendation: 'Complete fitness level assessment'
      });
    }

    // Injury validation
    if (data.injuries?.length && !data.injuries.includes('No Injuries')) {
      issues.push({
        field: 'injuries',
        message: 'Injuries reported - workout recommendations will be adjusted',
        severity: 'info',
        context: 'profile data validation',
        recommendation: 'Ensure all current injuries are listed'
      });
    }

    return this.createValidationResult(issues);
  }

  /**
   * Validate workout data for internal prompt system
   */
  public static validateWorkoutData(data: PerWorkoutOptions): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Required fields validation
    if (!data.customization_focus) {
      issues.push({
        field: 'focus',
        message: 'Workout focus is required',
        severity: 'error',
        context: 'workout data validation'
      });
    }

    if (!data.customization_duration) {
      issues.push({
        field: 'duration',
        message: 'Workout duration is required',
        severity: 'error',
        context: 'workout data validation'
      });
    }

    if (data.customization_energy === undefined || data.customization_energy === null) {
      issues.push({
        field: 'energy',
        message: 'Energy level is required',
        severity: 'error',
        context: 'workout data validation'
      });
    }

    // Duration validation
    const duration = Number(data.customization_duration);
    if (isNaN(duration) || duration <= 0) {
      issues.push({
        field: 'duration',
        message: 'Invalid duration value',
        severity: 'error',
        context: 'workout data validation',
        recommendation: 'Duration must be a positive number'
      });
    } else if (duration < 15) {
      issues.push({
        field: 'duration',
        message: 'Duration is very short',
        severity: 'warning',
        context: 'workout data validation',
        recommendation: 'Consider a longer duration for better results'
      });
    }

    // Energy level validation
    const energy = typeof data.customization_energy === 'number' ? 
      data.customization_energy : 
      data.customization_energy?.rating;

    if (energy === undefined || energy < 1 || energy > 10) {
      issues.push({
        field: 'energy',
        message: 'Invalid energy level value',
        severity: 'error',
        context: 'workout data validation',
        recommendation: 'Energy level must be between 1 and 10'
      });
    } else if (energy <= 3) {
      issues.push({
        field: 'energy',
        message: 'Low energy level reported',
        severity: 'warning',
        context: 'workout data validation',
        recommendation: 'Workout intensity will be adjusted for low energy'
      });
    }

    // Soreness validation
    if (data.customization_soreness) {
      const soreness = typeof data.customization_soreness === 'number' ? 
        data.customization_soreness : 
        data.customization_soreness.rating;

      if (soreness > 7) {
        issues.push({
          field: 'soreness',
          message: 'High soreness level reported',
          severity: 'warning',
          context: 'workout data validation',
          recommendation: 'Consider rest or low-intensity workout'
        });
      }
    }

    return this.createValidationResult(issues);
  }

  /**
   * Validate internal prompt context
   */
  public static validateContext(
    context: InternalPromptContext,
    config?: InternalPromptConfig
  ): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Profile validation
    if (!context.profile) {
      issues.push({
        field: 'profile',
        message: 'Profile data is missing',
        severity: 'error',
        context: 'context validation'
      });
    } else {
      // Validate required profile fields
      const requiredProfileFields = [
        'fitnessLevel',
        'experienceLevel',
        'primaryGoal',
        'preferredActivities',
        'availableEquipment'
      ];

      for (const field of requiredProfileFields) {
        if (!context.profile[field]) {
          issues.push({
            field: `profile.${field}`,
            message: `Required profile field missing: ${field}`,
            severity: 'error',
            context: 'context validation'
          });
        }
      }
    }

    // Workout validation
    if (!context.workout) {
      issues.push({
        field: 'workout',
        message: 'Workout data is missing',
        severity: 'error',
        context: 'context validation'
      });
    } else {
      // Validate required workout fields
      const requiredWorkoutFields = [
        'focus',
        'duration',
        'energyLevel',
        'equipment'
      ];

      for (const field of requiredWorkoutFields) {
        if (context.workout[field] === undefined || context.workout[field] === null) {
          issues.push({
            field: `workout.${field}`,
            message: `Required workout field missing: ${field}`,
            severity: 'error',
            context: 'context validation'
          });
        }
      }
    }

    // Preferences validation
    if (!context.preferences) {
      issues.push({
        field: 'preferences',
        message: 'Preferences data is missing',
        severity: 'error',
        context: 'context validation'
      });
    } else {
      // Validate required preferences fields
      const requiredPreferencesFields = [
        'workoutStyle',
        'intensityPreference',
        'aiAssistanceLevel'
      ];

      for (const field of requiredPreferencesFields) {
        if (!context.preferences[field]) {
          issues.push({
            field: `preferences.${field}`,
            message: `Required preferences field missing: ${field}`,
            severity: 'error',
            context: 'context validation'
          });
        }
      }
    }

    // Configuration validation
    if (config) {
      if (config.confidenceThreshold && (config.confidenceThreshold < 0 || config.confidenceThreshold > 1)) {
        issues.push({
          field: 'config.confidenceThreshold',
          message: 'Invalid confidence threshold',
          severity: 'error',
          context: 'configuration validation',
          recommendation: 'Confidence threshold must be between 0 and 1'
        });
      }

      if (config.maxRecommendations && config.maxRecommendations < 1) {
        issues.push({
          field: 'config.maxRecommendations',
          message: 'Invalid max recommendations',
          severity: 'error',
          context: 'configuration validation',
          recommendation: 'Max recommendations must be greater than 0'
        });
      }
    }

    return this.createValidationResult(issues);
  }

  /**
   * Validate recommendations
   */
  public static validateRecommendations(recommendations: InternalRecommendation[]): ValidationResult {
    const issues: ValidationIssue[] = [];

    if (!recommendations.length) {
      issues.push({
        field: 'recommendations',
        message: 'No recommendations generated',
        severity: 'error',
        context: 'recommendations validation'
      });
      return this.createValidationResult(issues);
    }

    // Validate each recommendation
    recommendations.forEach((rec, index) => {
      // Required fields
      if (!rec.type || !rec.content || rec.confidence === undefined || !rec.source || !rec.priority) {
        issues.push({
          field: `recommendation[${index}]`,
          message: 'Missing required fields',
          severity: 'error',
          context: 'recommendations validation'
        });
        return;
      }

      // Validate type
      const validTypes = ['exercise', 'intensity', 'duration', 'equipment', 'focus', 'general'];
      if (!validTypes.includes(rec.type)) {
        issues.push({
          field: `recommendation[${index}].type`,
          message: 'Invalid recommendation type',
          severity: 'error',
          context: 'recommendations validation',
          recommendation: `Type must be one of: ${validTypes.join(', ')}`
        });
      }

      // Validate confidence
      if (rec.confidence < 0 || rec.confidence > 1) {
        issues.push({
          field: `recommendation[${index}].confidence`,
          message: 'Invalid confidence value',
          severity: 'error',
          context: 'recommendations validation',
          recommendation: 'Confidence must be between 0 and 1'
        });
      }

      // Validate source
      const validSources = ['profile', 'workout', 'combined'];
      if (!validSources.includes(rec.source)) {
        issues.push({
          field: `recommendation[${index}].source`,
          message: 'Invalid recommendation source',
          severity: 'error',
          context: 'recommendations validation',
          recommendation: `Source must be one of: ${validSources.join(', ')}`
        });
      }

      // Validate priority
      const validPriorities = ['high', 'medium', 'low'];
      if (!validPriorities.includes(rec.priority)) {
        issues.push({
          field: `recommendation[${index}].priority`,
          message: 'Invalid recommendation priority',
          severity: 'error',
          context: 'recommendations validation',
          recommendation: `Priority must be one of: ${validPriorities.join(', ')}`
        });
      }
    });

    return this.createValidationResult(issues);
  }

  /**
   * Create validation result with summary
   */
  private static createValidationResult(issues: ValidationIssue[]): ValidationResult {
    const summary = {
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length
    };

    aiLogger.debug('ValidationService - Validation complete', {
      totalIssues: issues.length,
      summary
    });

    return {
      isValid: summary.errors === 0,
      issues,
      summary
    };
  }
}