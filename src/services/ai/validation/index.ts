/**
 * Validation Module - Main export interface
 * Provides clean exports for the validation system
 */

// Core exports
export { WorkoutRequestValidator } from './core/WorkoutRequestValidator';
export type { ValidationResult } from '../../../types/core';
export { ValidationContext } from './core/ValidationContext';
export type { ValidationRule } from './core/ValidationRule';
export { BaseValidationRule } from './core/ValidationRule';

// Rules exports
export { CoreFieldsRule } from './rules/CoreFieldsRule';
export { WorkoutDataRule } from './rules/WorkoutDataRule';
export { BusinessLogicRule } from './rules/BusinessLogicRule';

// Metrics exports
export type { ValidationMetricsData } from './metrics/ValidationMetrics';
export { ValidationMetrics } from './metrics/ValidationMetrics';

// Adapters exports
export { LegacyCompatibility } from './adapters/LegacyCompatibility';

// Register default rules
import { CoreFieldsRule } from './rules/CoreFieldsRule';
import { WorkoutDataRule } from './rules/WorkoutDataRule';
import { BusinessLogicRule } from './rules/BusinessLogicRule';
import { WorkoutRequestValidator } from './core/WorkoutRequestValidator';

// Initialize validation system
WorkoutRequestValidator.registerRule(new CoreFieldsRule());
WorkoutRequestValidator.registerRule(new WorkoutDataRule());
WorkoutRequestValidator.registerRule(new BusinessLogicRule()); 