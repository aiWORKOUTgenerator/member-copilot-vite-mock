/**
 * Validation System Integration Tests
 */

import { WorkoutRequestValidator } from '../../core/WorkoutRequestValidator';
import { ValidationMetrics } from '../../metrics/ValidationMetrics';
import { WorkoutGenerationRequest } from '../../../../../types/workout-generation.types';
import { CoreFieldsRule } from '../../rules/CoreFieldsRule';
import { WorkoutDataRule } from '../../rules/WorkoutDataRule';
import { BusinessLogicRule } from '../../rules/BusinessLogicRule';

describe('Validation System Integration', () => {
  let metrics: ValidationMetrics;
  let mockRequest: WorkoutGenerationRequest;
  let mockUserProfile: any;
  let mockWorkoutFocusData: any;

  beforeEach(() => {
    // Reset validator
    WorkoutRequestValidator.clearRules();
    
    // Setup metrics
    metrics = new ValidationMetrics();
    WorkoutRequestValidator.setMetrics(metrics);
    
    // Register rules
    WorkoutRequestValidator.registerRule(new CoreFieldsRule());
    WorkoutRequestValidator.registerRule(new WorkoutDataRule());
    WorkoutRequestValidator.registerRule(new BusinessLogicRule());

    // Setup mock data
    mockUserProfile = {
      fitnessLevel: 'some experience'
    };

    mockWorkoutFocusData = {
      customization_duration: 30
    };

    // Setup mock request
    mockRequest = {
      workoutType: 'quick',
      profileData: {},
      workoutFocusData: mockWorkoutFocusData,
      userProfile: mockUserProfile
    } as any;
  });

  it('should validate complete request successfully', () => {
    const result = WorkoutRequestValidator.validate(mockRequest);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should collect validation metrics', () => {
    WorkoutRequestValidator.validate(mockRequest);
    const metricsData = metrics.getMetrics();
    
    expect(metricsData.totalValidations).toBe(1);
    expect(metricsData.successfulValidations).toBe(1);
    expect(metricsData.failedValidations).toBe(0);
  });

  it('should execute rules in priority order', () => {
    const executionOrder: string[] = [];
    
    class TestRule1 extends CoreFieldsRule {
      validate(context: any): void {
        executionOrder.push(this.getName());
        super.validate(context);
      }
    }
    
    class TestRule2 extends WorkoutDataRule {
      validate(context: any): void {
        executionOrder.push(this.getName());
        super.validate(context);
      }
    }

    WorkoutRequestValidator.clearRules();
    WorkoutRequestValidator.registerRule(new TestRule2()); // Priority 20
    WorkoutRequestValidator.registerRule(new TestRule1()); // Priority 10

    WorkoutRequestValidator.validate(mockRequest);

    expect(executionOrder).toEqual(['CoreFieldsRule', 'WorkoutDataRule']);
  });

  it('should handle multiple validation errors', () => {
    mockRequest = {
      ...mockRequest,
      workoutType: undefined,
      workoutFocusData: {
        ...mockWorkoutFocusData,
        customization_duration: undefined // Invalid duration
      }
    } as any;

    const result = WorkoutRequestValidator.validate(mockRequest);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].field).toBe('workoutType');
  });
}); 