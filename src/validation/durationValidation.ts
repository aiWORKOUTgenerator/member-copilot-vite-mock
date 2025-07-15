import { ValidationResult } from '../types/core';
import { DurationConfigurationData } from '../types/duration';

export const validateDuration = (value: number | DurationConfigurationData, allOptions?: any): ValidationResult => {
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
  
  // Additional validation for complex duration data
  if (typeof value === 'object' && value) {
    const durationData = value as DurationConfigurationData;
    
    if (durationData.warmUp.included && durationData.warmUp.duration < 3) {
      result.warnings = result.warnings || [];
      result.warnings.push('Warm-up duration should be at least 3 minutes for effectiveness');
    }
    
    if (durationData.coolDown.included && durationData.coolDown.duration < 3) {
      result.warnings = result.warnings || [];
      result.warnings.push('Cool-down duration should be at least 3 minutes for recovery');
    }
    
    if (durationData.workingTime < 10) {
      result.isValid = false;
      result.errors = result.errors || [];
      result.errors.push('Working time must be at least 10 minutes after warm-up/cool-down');
    }
  }
  
  return result;
}; 