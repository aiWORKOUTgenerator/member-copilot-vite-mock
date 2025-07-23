import { PerWorkoutOptions, DurationConfigurationData, WorkoutFocusConfigurationData } from '../../../types/core';
import { ProfileData } from '../../Profile/types/profile.types';
import { PromptDataTransformer } from '../../../services/ai/external/shared/utils/PromptDataTransformer';

interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  helpText?: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

export class ValidationService {
  /**
   * Comprehensive validation for workout data with detailed feedback
   */
  static validateWorkoutData(
    workoutFocusData: PerWorkoutOptions | null,
    profileData: ProfileData | null,
    workoutType: 'quick' | 'detailed',
    onNavigate?: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void
  ): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Profile validation
    if (!profileData) {
      issues.push({
        field: 'Profile Information',
        message: 'Complete profile information is required for personalized workouts.',
        severity: 'error',
        action: onNavigate ? {
          label: 'Complete Profile',
          onClick: () => onNavigate('profile')
        } : undefined,
        helpText: 'Your profile helps us create workouts tailored to your fitness level, goals, and preferences.'
      });
    }

    // Workout focus validation
    if (!workoutFocusData) {
      issues.push({
        field: 'Workout Focus',
        message: 'Workout focus preferences are required.',
        severity: 'error',
        action: onNavigate ? {
          label: 'Set Focus',
          onClick: () => onNavigate('focus')
        } : undefined,
        helpText: 'Choose your workout focus and preferences to get started.'
      });
    } else {
      // Basic workout requirements
      if (!workoutFocusData.customization_focus) {
        issues.push({
          field: 'Workout Focus',
          message: 'Please select your primary workout focus.',
          severity: 'error',
          action: onNavigate ? {
            label: 'Set Focus',
            onClick: () => onNavigate('focus')
          } : undefined,
          helpText: 'Choose whether you want to focus on strength, cardio, flexibility, or other goals.'
        });
      }

      if (!workoutFocusData.customization_duration) {
        issues.push({
          field: 'Workout Duration',
          message: 'Please specify your desired workout duration.',
          severity: 'error',
          action: onNavigate ? {
            label: 'Set Duration',
            onClick: () => onNavigate('focus')
          } : undefined,
          helpText: 'Duration helps us structure your workout with appropriate exercise volume.'
        });
      }

      if (workoutFocusData.customization_energy === undefined) {
        issues.push({
          field: 'Energy Level',
          message: 'Please rate your current energy level.',
          severity: 'error',
          action: onNavigate ? {
            label: 'Set Energy Level',
            onClick: () => onNavigate('focus')
          } : undefined,
          helpText: 'Your energy level helps us adjust workout intensity and exercise selection.'
        });
      }

      // Detailed workout specific validation
      if (workoutType === 'detailed') {
        // Validate focus areas
        if (!Array.isArray(workoutFocusData.customization_areas) || workoutFocusData.customization_areas.length === 0) {
          issues.push({
            field: 'Focus Areas',
            message: 'Please select at least one focus area.',
            severity: 'error',
            action: onNavigate ? {
              label: 'Set Focus Areas',
              onClick: () => onNavigate('focus')
            } : undefined,
            helpText: 'Focus areas help us target specific muscle groups in your workout.'
          });
        }

        // Validate equipment
        if (!Array.isArray(workoutFocusData.customization_equipment) || workoutFocusData.customization_equipment.length === 0) {
          issues.push({
            field: 'Equipment',
            message: 'Please select available equipment.',
            severity: 'error',
            action: onNavigate ? {
              label: 'Set Equipment',
              onClick: () => onNavigate('focus')
            } : undefined,
            helpText: 'Equipment selection helps us choose appropriate exercises for your workout.'
          });
        }

        // Validate duration for detailed workouts
        const duration = typeof workoutFocusData.customization_duration === 'number'
          ? workoutFocusData.customization_duration
          : workoutFocusData.customization_duration?.duration;

        if (duration && duration < 15) {
          issues.push({
            field: 'Duration',
            message: 'Detailed workouts work best with at least 15 minutes.',
            severity: 'warning',
            helpText: 'Consider increasing duration for a more effective workout.'
          });
        }
      }
    }

    // Calculate summary
    const summary = {
      errors: issues.filter(i => i.severity === 'error').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length
    };

    return {
      isValid: summary.errors === 0,
      issues,
      summary
    };
  }

  /**
   * Debug validation consistency
   */
  static debugValidationConsistency(
    profileData: ProfileData | null,
    workoutFocusData: PerWorkoutOptions | null,
    workoutType: 'quick' | 'detailed'
  ): void {
    if (!profileData || !workoutFocusData) {
      console.warn('Missing required data for validation');
      return;
    }

    // Log key validation fields
    console.log('🔍 ValidationService - Validation check:', {
      profileData: {
        experienceLevel: profileData.experienceLevel,
        primaryGoal: profileData.primaryGoal
      },
      workoutFocusData: {
        focus: workoutFocusData.customization_focus,
        duration: workoutFocusData.customization_duration,
        energy: workoutFocusData.customization_energy
      },
      workoutType
    });
  }
} 