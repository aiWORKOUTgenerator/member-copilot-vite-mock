// Configuration Validation Tests - Phase 3D
import { WORKOUT_GENERATION_CONSTANTS } from '../constants/workout-generation-constants';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';
import { WorkoutRequestValidator } from '../../validation/core/WorkoutRequestValidator';
import { CoreFieldsRule } from '../../validation/rules/CoreFieldsRule';
import { WorkoutDataRule } from '../../validation/rules/WorkoutDataRule';
import { BusinessLogicRule } from '../../validation/rules/BusinessLogicRule';

describe('Configuration Validation - Phase 3D', () => {
  let mockValidWorkoutRequest: WorkoutGenerationRequest;

  beforeEach(() => {
    // Reset validator
    WorkoutRequestValidator.clearRules();
    
    // Register rules
    WorkoutRequestValidator.registerRule(new CoreFieldsRule());
    WorkoutRequestValidator.registerRule(new WorkoutDataRule());
    WorkoutRequestValidator.registerRule(new BusinessLogicRule());

    // Setup mock valid request
    mockValidWorkoutRequest = {
      workoutType: 'quick',
      userProfile: {
        fitnessLevel: 'intermediate',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['balanced'],
          timePreference: 'morning',
          intensityPreference: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Body Weight'],
          availableLocations: ['Home']
        }
      },
      profileData: {
        experienceLevel: 'intermediate',
        physicalActivity: 'moderate',
        preferredDuration: '30-45 min',
        timeCommitment: '3-4',
        intensityLevel: 'moderately',
        preferredActivities: ['strength_training'],
        availableLocations: ['Home'],
        availableEquipment: ['Dumbbells'],
        primaryGoal: 'Strength',
        goalTimeline: '3 months',
        age: '26-35',
        height: '5\'8"',
        weight: '150 lbs',
        gender: 'male',
        hasCardiovascularConditions: 'No',
        injuries: ['No Injuries']
      },
      workoutFocusData: {
        customization_duration: 30,
        customization_energy: 7,
        customization_focus: 'strength',
        customization_equipment: ['bodyweight'],
        customization_soreness: {}
      }
    } as WorkoutGenerationRequest;
  });

  describe('Workout Generation Constants Validation', () => {
    it('should have comprehensive warning messages', () => {
      expect(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.LONG_DURATION).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.HIGH_ENERGY).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.LOW_ENERGY).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.NO_EQUIPMENT).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.MANY_FOCUS_AREAS).toBeDefined();
    });
  });

  describe('Workout Request Validation', () => {
    it('should validate correct workout request', () => {
      const validation = WorkoutRequestValidator.validate(mockValidWorkoutRequest);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toBeDefined();
    });

    it('should detect missing user profile', () => {
      const invalidRequest = {
        ...mockValidWorkoutRequest,
        userProfile: undefined
      } as WorkoutGenerationRequest;
      
      const validation = WorkoutRequestValidator.validate(invalidRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('userProfile is required'))).toBe(true);
    });

    it('should detect missing workout focus data', () => {
      const invalidRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: undefined
      } as WorkoutGenerationRequest;
      
      const validation = WorkoutRequestValidator.validate(invalidRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('workoutFocusData is required'))).toBe(true);
    });

    it('should detect invalid duration', () => {
      const shortDurationRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_duration: 2
        }
      };
      
      const validation = WorkoutRequestValidator.validate(shortDurationRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('Duration must be at least'))).toBe(true);
    });

    it('should detect invalid energy level', () => {
      const invalidEnergyRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_energy: 11
        }
      };
      
      const validation = WorkoutRequestValidator.validate(invalidEnergyRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('Energy level must be between'))).toBe(true);
    });

    it('should warn about long duration', () => {
      const longDurationRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_duration: 120
        }
      };
      
      const validation = WorkoutRequestValidator.validate(longDurationRequest);
      
      expect(validation.warnings.some(w => w.message.includes('Workout duration is quite long'))).toBe(true);
    });

    it('should warn about high energy with long duration', () => {
      const highEnergyLongDurationRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_energy: 9,
          customization_duration: 90
        }
      };
      
      const validation = WorkoutRequestValidator.validate(highEnergyLongDurationRequest);
      
      expect(validation.warnings.some(w => w.message.includes('High energy'))).toBe(true);
    });

    it('should warn about low energy with long duration', () => {
      const lowEnergyLongDurationRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_energy: 2,
          customization_duration: 45
        }
      };
      
      const validation = WorkoutRequestValidator.validate(lowEnergyLongDurationRequest);
      
      expect(validation.warnings.some(w => w.message.includes('Low energy'))).toBe(true);
    });

    it('should warn about no equipment', () => {
      const noEquipmentRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_equipment: []
        }
      };
      
      const validation = WorkoutRequestValidator.validate(noEquipmentRequest);
      
      expect(validation.warnings.some(w => w.message.includes('No equipment'))).toBe(true);
    });

    it('should validate detailed workout requirements', () => {
      const detailedRequest = {
        ...mockValidWorkoutRequest,
        workoutType: 'detailed',
        profileData: {
          ...mockValidWorkoutRequest.profileData,
          experienceLevel: undefined
        }
      };
      
      const validation = WorkoutRequestValidator.validate(detailedRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('Experience level is required'))).toBe(true);
    });
  });
}); 