/**
 * CoreFieldsRule Unit Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { CoreFieldsRule } from '../../rules/CoreFieldsRule';
import { ValidationContext } from '../../core/ValidationContext';
import { ValidationMetrics } from '../../metrics/ValidationMetrics';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { UserProfile } from '../../../../types/user';

describe('CoreFieldsRule', () => {
  let rule: CoreFieldsRule;
  let context: ValidationContext;
  let mockRequest: WorkoutGenerationRequest;

  beforeEach(() => {
    rule = new CoreFieldsRule();
    
    // Create a valid mock request
    mockRequest = {
      workoutType: 'quick',
      userProfile: {
        fitnessLevel: 'intermediate',
        goals: ['general_fitness'],
        preferences: {
          workoutStyle: ['balanced'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Body Weight'],
          availableLocations: ['Home']
        },
        enhancedLimitations: {
          timeConstraints: 0,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 0,
          averageDuration: 45,
          preferredFocusAreas: [],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.5,
          plateauRisk: 'low'
        }
      },
      profileData: {
        experienceLevel: 'Some Experience',
        physicalActivity: 'moderate',
        preferredDuration: '45-60 min',
        timeCommitment: '3-4',
        intensityLevel: 'moderately',
        preferredActivities: ['Running/Jogging', 'Yoga'],
        availableLocations: ['Gym', 'Home'],
        availableEquipment: ['Dumbbells', 'Resistance Bands'],
        primaryGoal: 'Strength',
        goalTimeline: '6 months',
        age: '36-45',
        height: '',
        weight: '',
        gender: 'prefer-not-to-say',
        hasCardiovascularConditions: 'No',
        injuries: ['No Injuries']
      },
      workoutFocusData: {
        customization_duration: 30,
        customization_focus: 'strength',
        customization_energy: 7
      }
    };

    context = new ValidationContext(mockRequest);
  });

  it('should pass validation with all required fields', () => {
    rule.validate(context);
    expect(context.getResult().isValid).toBe(true);
  });

  it('should fail validation with missing workoutType', () => {
    mockRequest.workoutType = undefined;
    context = new ValidationContext(mockRequest);
    rule.validate(context);
    
    const result = context.getResult();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.errors[0].field).toBe('workoutType');
    expect(result.errors[0].message).toBe('workoutType is required');
  });

  it('should fail validation with invalid workoutType', () => {
    (mockRequest as any).workoutType = 'invalid';
    context = new ValidationContext(mockRequest);
    rule.validate(context);
    
    const result = context.getResult();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.errors[0].field).toBe('workoutType');
    expect(result.errors[0].message).toBe('workoutType must be one of: quick, detailed');
  });

  it('should fail validation with missing userProfile', () => {
    mockRequest.userProfile = undefined;
    context = new ValidationContext(mockRequest);
    rule.validate(context);
    
    const result = context.getResult();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.errors[0].field).toBe('userProfile');
    expect(result.errors[0].message).toBe('userProfile is required');
  });

  it('should fail validation with missing userProfile.fitnessLevel', () => {
    delete (mockRequest.userProfile as any).fitnessLevel;
    context = new ValidationContext(mockRequest);
    rule.validate(context);
    
    const result = context.getResult();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.errors[0].field).toBe('userProfile.fitnessLevel');
    expect(result.errors[0].message).toBe('userProfile.fitnessLevel is required');
  });

  it('should fail validation with invalid userProfile.fitnessLevel', () => {
    (mockRequest.userProfile as any).fitnessLevel = 'invalid';
    context = new ValidationContext(mockRequest);
    rule.validate(context);
    
    const result = context.getResult();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.errors[0].field).toBe('userProfile.fitnessLevel');
    expect(result.errors[0].message).toBe('userProfile.fitnessLevel must be one of: beginner, novice, intermediate, advanced, adaptive');
  });

  it('should fail validation with missing profileData', () => {
    mockRequest.profileData = undefined;
    context = new ValidationContext(mockRequest);
    rule.validate(context);
    
    const result = context.getResult();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.errors[0].field).toBe('profileData');
    expect(result.errors[0].message).toBe('profileData is required');
  });

  it('should fail validation with missing workoutFocusData', () => {
    mockRequest.workoutFocusData = undefined;
    context = new ValidationContext(mockRequest);
    rule.validate(context);
    
    const result = context.getResult();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.errors[0].field).toBe('workoutFocusData');
    expect(result.errors[0].message).toBe('workoutFocusData is required');
  });

  it('should fail validation with non-object workoutFocusData', () => {
    (mockRequest as any).workoutFocusData = 'invalid';
    context = new ValidationContext(mockRequest);
    rule.validate(context);
    
    const result = context.getResult();
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.errors[0].field).toBe('workoutFocusData');
    expect(result.errors[0].message).toBe('workoutFocusData must be an object');
  });
}); 