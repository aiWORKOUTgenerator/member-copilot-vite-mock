import { PerWorkoutOptions } from '../../../types/enhanced-workout-types';
import { ProfileData } from '../../Profile/types/profile.types';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  helpText?: string;
}

export interface ValidationResult {
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
    } else {
      // Validate specific profile fields
      if (!profileData.experienceLevel) {
        issues.push({
          field: 'Experience Level',
          message: 'Please specify your fitness experience level.',
          severity: 'error',
          action: onNavigate ? {
            label: 'Update Profile',
            onClick: () => onNavigate('profile')
          } : undefined,
          helpText: 'This helps us determine appropriate exercise difficulty and progression.'
        });
      }

      if (!profileData.primaryGoal) {
        issues.push({
          field: 'Primary Goal',
          message: 'Please select your primary fitness goal.',
          severity: 'error',
          action: onNavigate ? {
            label: 'Update Profile',
            onClick: () => onNavigate('profile')
          } : undefined,
          helpText: 'Your goal guides exercise selection and workout structure.'
        });
      }
    }

    // Workout focus validation
    if (!workoutFocusData) {
      issues.push({
        field: 'Workout Preferences',
        message: 'Please configure your workout preferences.',
        severity: 'error',
        action: onNavigate ? {
          label: 'Set Preferences',
          onClick: () => onNavigate('focus')
        } : undefined,
        helpText: 'Configure your workout focus, duration, and current state for personalized recommendations.'
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
        const areaIssues = this.validateFocusAreas(workoutFocusData, onNavigate);
        issues.push(...areaIssues);

        const equipmentIssues = this.validateEquipment(workoutFocusData, onNavigate);
        issues.push(...equipmentIssues);

        const durationIssues = this.validateDuration(workoutFocusData);
        issues.push(...durationIssues);

        const energyIssues = this.validateEnergyLevel(workoutFocusData);
        issues.push(...energyIssues);
      }

      // Cross-component validation
      const crossComponentIssues = this.validateCrossComponent(workoutFocusData, profileData);
      issues.push(...crossComponentIssues);
    }

    const errors = issues.filter(issue => issue.severity === 'error').length;
    const warnings = issues.filter(issue => issue.severity === 'warning').length;
    const info = issues.filter(issue => issue.severity === 'info').length;

    return {
      isValid: errors === 0,
      issues,
      summary: { errors, warnings, info }
    };
  }

  /**
   * Validate focus areas for detailed workouts
   */
  private static validateFocusAreas(
    workoutFocusData: PerWorkoutOptions,
    onNavigate?: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const hasValidAreas = (() => {
      if (Array.isArray(workoutFocusData.customization_areas)) {
        return (workoutFocusData.customization_areas || []).length > 0;
      }
      if (typeof workoutFocusData.customization_areas === 'object' && workoutFocusData.customization_areas !== null) {
        const selectedAreas = Object.values(workoutFocusData.customization_areas).filter((item: any) => item?.selected);
        return selectedAreas.length > 0;
      }
      return false;
    })();

    if (!hasValidAreas) {
      issues.push({
        field: 'Focus Areas',
        message: 'Please select at least one muscle group to target.',
        severity: 'error',
        action: onNavigate ? {
          label: 'Select Areas',
          onClick: () => onNavigate('focus')
        } : undefined,
        helpText: 'Focus areas help us create targeted exercises for specific muscle groups.'
      });
    } else {
      // Check for optimal area selection
      const areaCount = Array.isArray(workoutFocusData.customization_areas) 
        ? workoutFocusData.customization_areas.length 
        : Object.values(workoutFocusData.customization_areas || {}).filter((item: any) => item?.selected).length;

      if (areaCount > 4) {
        issues.push({
          field: 'Focus Areas',
          message: 'Too many focus areas may reduce workout effectiveness.',
          severity: 'warning',
          helpText: 'Consider focusing on 2-3 primary areas for better results.'
        });
      }
    }

    return issues;
  }

  /**
   * Validate equipment selection for detailed workouts
   */
  private static validateEquipment(
    workoutFocusData: PerWorkoutOptions,
    onNavigate?: (page: 'profile' | 'waiver' | 'focus' | 'review' | 'results') => void
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const hasValidEquipment = (() => {
      if (Array.isArray(workoutFocusData.customization_equipment)) {
        return (workoutFocusData.customization_equipment || []).length > 0;
      }
      if (typeof workoutFocusData.customization_equipment === 'object' && workoutFocusData.customization_equipment !== null) {
        const equipment = workoutFocusData.customization_equipment.specificEquipment || [];
        return Array.isArray(equipment) && equipment.length > 0;
      }
      return false;
    })();

    if (!hasValidEquipment) {
      issues.push({
        field: 'Equipment',
        message: 'Please select available equipment for personalized exercises.',
        severity: 'error',
        action: onNavigate ? {
          label: 'Select Equipment',
          onClick: () => onNavigate('focus')
        } : undefined,
        helpText: 'Equipment selection ensures exercises are tailored to what you have available.'
      });
    } else {
      // Check equipment compatibility with focus
      const focus = typeof workoutFocusData.customization_focus === 'string' 
        ? workoutFocusData.customization_focus 
        : workoutFocusData.customization_focus?.focus;

      const equipment = Array.isArray(workoutFocusData.customization_equipment)
        ? workoutFocusData.customization_equipment
        : workoutFocusData.customization_equipment?.specificEquipment || [];

      if (focus === 'strength' && equipment.includes('Body Weight') && equipment.length === 1) {
        issues.push({
          field: 'Equipment',
          message: 'Body weight-only training may limit strength development.',
          severity: 'warning',
          helpText: 'Consider adding resistance equipment for better strength gains.'
        });
      }
    }

    return issues;
  }

  /**
   * Validate workout duration appropriateness
   */
  private static validateDuration(workoutFocusData: PerWorkoutOptions): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (workoutFocusData.customization_duration) {
      const duration = typeof workoutFocusData.customization_duration === 'number' 
        ? workoutFocusData.customization_duration 
        : workoutFocusData.customization_duration?.totalDuration;

      if (duration && duration < 15) {
        issues.push({
          field: 'Workout Duration',
          message: 'Detailed workouts work best with at least 15 minutes.',
          severity: 'warning',
          helpText: 'Longer workouts allow for proper warm-up, main exercises, and cool-down.'
        });
      }

      if (duration && duration > 90) {
        issues.push({
          field: 'Workout Duration',
          message: 'Workouts longer than 90 minutes may lead to fatigue.',
          severity: 'warning',
          helpText: 'Consider breaking into multiple sessions for better recovery and performance.'
        });
      }
    }

    return issues;
  }

  /**
   * Validate energy level appropriateness
   */
  private static validateEnergyLevel(workoutFocusData: PerWorkoutOptions): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (workoutFocusData.customization_energy !== undefined) {
      if (workoutFocusData.customization_energy <= 2) {
        issues.push({
          field: 'Energy Level',
          message: 'Low energy level detected. Consider a lighter workout.',
          severity: 'warning',
          helpText: 'Low energy workouts should focus on recovery, mobility, or light cardio.'
        });
      }

      if (workoutFocusData.customization_energy >= 8) {
        issues.push({
          field: 'Energy Level',
          message: 'High energy level detected. You may be ready for intense training.',
          severity: 'info',
          helpText: 'High energy is perfect for strength training, HIIT, or challenging workouts.'
        });
      }
    }

    return issues;
  }

  /**
   * Cross-component validation
   */
  private static validateCrossComponent(
    workoutFocusData: PerWorkoutOptions,
    profileData: ProfileData | null
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Duration vs Energy validation
    if (workoutFocusData.customization_duration && workoutFocusData.customization_energy !== undefined) {
      const duration = typeof workoutFocusData.customization_duration === 'number' 
        ? workoutFocusData.customization_duration 
        : workoutFocusData.customization_duration?.totalDuration;

      if (duration && workoutFocusData.customization_energy >= 8 && duration > 60) {
        issues.push({
          field: 'Workout Intensity',
          message: 'High energy with long duration may lead to overtraining.',
          severity: 'warning',
          helpText: 'Consider reducing duration or intensity to prevent burnout.'
        });
      }

      if (duration && workoutFocusData.customization_energy <= 3 && duration > 30) {
        issues.push({
          field: 'Workout Intensity',
          message: 'Low energy with long duration may affect performance.',
          severity: 'warning',
          helpText: 'Consider a shorter, lighter workout or focus on recovery.'
        });
      }
    }

    // Profile vs Workout validation
    if (profileData) {
      const experienceLevel = profileData.experienceLevel;
      const focus = typeof workoutFocusData.customization_focus === 'string' 
        ? workoutFocusData.customization_focus 
        : workoutFocusData.customization_focus?.focus;

      if (experienceLevel === 'New to Exercise' && focus === 'strength') {
        issues.push({
          field: 'Experience Level',
          message: 'Strength training for beginners should focus on form and progression.',
          severity: 'info',
          helpText: 'We\'ll prioritize bodyweight exercises and proper form instruction.'
        });
      }
    }

    return issues;
  }
} 