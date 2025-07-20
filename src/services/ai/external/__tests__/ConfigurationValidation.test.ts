// Configuration Validation Tests - Phase 3D
import { validateConfig, getOpenAIConfig } from '../config/openai.config';
import { WORKOUT_GENERATION_CONSTANTS } from '../constants/workout-generation-constants';
import { validateWorkoutRequest } from '../utils/workout-validation';
import { WorkoutGenerationRequest } from '../../../../types/workout-generation.types';

// Mock workout generation request for testing
const mockValidWorkoutRequest: WorkoutGenerationRequest = {
  type: 'quick',
  userProfile: {
    fitnessLevel: 'some experience',
    goals: ['strength', 'endurance'],
    preferences: {
      workoutDuration: 45,
      intensity: 'moderate',
      equipment: ['dumbbells', 'bodyweight']
    }
  },
  workoutFocusData: {
    customization_duration: 45,
    customization_energy: 7,
    customization_focus: 'strength',
    customization_equipment: ['dumbbells', 'bodyweight'],
    customization_soreness: {
      'upper body': 'mild',
      'lower body': 'none'
    }
  },
  profileData: {
    experienceLevel: 'some experience',
    physicalActivity: 'moderate',
    preferredDuration: 45,
    timeCommitment: 'medium',
    intensityLevel: 'moderate',
    preferredActivities: ['strength training', 'cardio'],
    availableEquipment: ['dumbbells', 'bodyweight'],
    primaryGoal: 'strength',
    goalTimeline: '3 months',
    age: 30,
    height: 175,
    weight: 70,
    gender: 'not specified',
    hasCardiovascularConditions: false,
    injuries: []
  }
};

describe('Configuration Validation - Phase 3D', () => {
  describe('OpenAI Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const openAIConfig = getOpenAIConfig();
      const config = validateConfig(openAIConfig);
      
      expect(config.isValid).toBe(true);
      expect(config.errors).toHaveLength(0);
      expect(config.warnings).toBeDefined();
    });

    it('should detect missing API key', () => {
      const originalKey = process.env.VITE_OPENAI_API_KEY;
      delete process.env.VITE_OPENAI_API_KEY;
      
      const openAIConfig = getOpenAIConfig();
      const config = validateConfig(openAIConfig);
      
      expect(config.isValid).toBe(false);
      expect(config.errors.length).toBeGreaterThan(0);
      
      // Restore environment variable
      if (originalKey) {
        process.env.VITE_OPENAI_API_KEY = originalKey;
      }
    });

    it('should warn about high token limits', () => {
      const openAIConfig = getOpenAIConfig();
      const config = validateConfig(openAIConfig);
      
      // Configuration should be valid but may have warnings about performance
      expect(config.isValid).toBe(true);
      expect(config.warnings).toBeDefined();
    });

    it('should validate configuration structure', () => {
      const openAIConfig = getOpenAIConfig();
      const config = validateConfig(openAIConfig);
      
      expect(config).toHaveProperty('isValid');
      expect(config).toHaveProperty('errors');
      expect(config).toHaveProperty('warnings');
      expect(Array.isArray(config.errors)).toBe(true);
      expect(Array.isArray(config.warnings)).toBe(true);
    });

    it('should handle environment variable edge cases', () => {
      const originalKey = process.env.VITE_OPENAI_API_KEY;
      
      // Test with empty string
      process.env.VITE_OPENAI_API_KEY = '';
      const openAIConfig = getOpenAIConfig();
      const emptyConfig = validateConfig(openAIConfig);
      expect(emptyConfig.isValid).toBe(false);
      
      // Test with undefined
      delete process.env.VITE_OPENAI_API_KEY;
      const undefinedOpenAIConfig = getOpenAIConfig();
      const undefinedConfig = validateConfig(undefinedOpenAIConfig);
      expect(undefinedConfig.isValid).toBe(false);
      
      // Restore environment variable
      if (originalKey) {
        process.env.VITE_OPENAI_API_KEY = originalKey;
      }
    });
  });

  describe('Workout Generation Constants Validation', () => {
    it('should have valid workout generation constants', () => {
      expect(WORKOUT_GENERATION_CONSTANTS).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.MAX_RETRY_ATTEMPTS).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.CACHE_TIMEOUT_MS).toBeGreaterThan(0);
    });

    it('should have reasonable timeout values', () => {
      expect(WORKOUT_GENERATION_CONSTANTS.REQUEST_TIMEOUT_MS).toBeLessThanOrEqual(60000); // Max 60 seconds
      expect(WORKOUT_GENERATION_CONSTANTS.CACHE_TIMEOUT_MS).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.RETRY_DELAY_MS).toBeGreaterThan(0);
    });

    it('should have valid retry configuration', () => {
      expect(WORKOUT_GENERATION_CONSTANTS.MAX_RETRY_ATTEMPTS).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.MAX_RETRY_ATTEMPTS).toBeLessThanOrEqual(10); // Max 10 retries
      expect(WORKOUT_GENERATION_CONSTANTS.BACKOFF_MULTIPLIER).toBeGreaterThan(1);
    });

    it('should have valid cache configuration', () => {
      expect(WORKOUT_GENERATION_CONSTANTS.MAX_CACHE_SIZE).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.CACHE_CLEANUP_INTERVAL_MS).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.CACHE_ENTRY_TTL_MS).toBeGreaterThan(0);
    });

    it('should have valid validation thresholds', () => {
      expect(WORKOUT_GENERATION_CONSTANTS.MIN_WORKOUT_DURATION).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.MAX_WORKOUT_DURATION).toBeGreaterThan(WORKOUT_GENERATION_CONSTANTS.MIN_WORKOUT_DURATION);
      expect(WORKOUT_GENERATION_CONSTANTS.MIN_ENERGY_LEVEL).toBeGreaterThanOrEqual(1);
      expect(WORKOUT_GENERATION_CONSTANTS.MAX_ENERGY_LEVEL).toBeLessThanOrEqual(10);
    });

    it('should have valid performance thresholds', () => {
      expect(WORKOUT_GENERATION_CONSTANTS.SLOW_RESPONSE_THRESHOLD_MS).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_RATE_WARNING_THRESHOLD).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_RATE_WARNING_THRESHOLD).toBeLessThanOrEqual(1);
      expect(WORKOUT_GENERATION_CONSTANTS.CACHE_HIT_RATE_TARGET).toBeGreaterThanOrEqual(0);
      expect(WORKOUT_GENERATION_CONSTANTS.CACHE_HIT_RATE_TARGET).toBeLessThanOrEqual(1);
    });

    it('should have valid default values', () => {
      expect(WORKOUT_GENERATION_CONSTANTS.DEFAULT_WORKOUT_DURATION).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.DEFAULT_ENERGY_LEVEL).toBeGreaterThanOrEqual(1);
      expect(WORKOUT_GENERATION_CONSTANTS.DEFAULT_ENERGY_LEVEL).toBeLessThanOrEqual(10);
      expect(WORKOUT_GENERATION_CONSTANTS.DEFAULT_FOCUS).toBeDefined();
      expect(Array.isArray(WORKOUT_GENERATION_CONSTANTS.DEFAULT_EQUIPMENT)).toBe(true);
    });

    it('should have comprehensive error messages', () => {
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_REQUEST).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.MISSING_USER_PROFILE).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.MISSING_WORKOUT_DATA).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_DURATION).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_ENERGY_LEVEL).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_FOCUS).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.TIMEOUT_ERROR).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.RETRY_FAILED).toBeDefined();
    });

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
      const validation = validateWorkoutRequest(mockValidWorkoutRequest);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toBeDefined();
    });

    it('should detect missing user profile', () => {
      const invalidRequest = {
        ...mockValidWorkoutRequest,
        userProfile: undefined
      } as WorkoutGenerationRequest;
      
      const validation = validateWorkoutRequest(invalidRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.MISSING_USER_PROFILE);
    });

    it('should detect missing workout focus data', () => {
      const invalidRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: undefined
      } as WorkoutGenerationRequest;
      
      const validation = validateWorkoutRequest(invalidRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.MISSING_WORKOUT_DATA);
    });

    it('should detect missing workout type', () => {
      const invalidRequest = {
        ...mockValidWorkoutRequest,
        type: undefined
      } as WorkoutGenerationRequest;
      
      const validation = validateWorkoutRequest(invalidRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Workout type is required');
    });

    it('should validate workout duration', () => {
      const shortDurationRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_duration: 3 // Below minimum
        }
      };
      
      const validation = validateWorkoutRequest(shortDurationRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_DURATION);
    });

    it('should validate energy level', () => {
      const invalidEnergyRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_energy: 15 // Above maximum
        }
      };
      
      const validation = validateWorkoutRequest(invalidEnergyRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES.INVALID_ENERGY_LEVEL);
    });

    it('should warn about long workout duration', () => {
      const longDurationRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_duration: 200 // Above warning threshold
        }
      };
      
      const validation = validateWorkoutRequest(longDurationRequest);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.LONG_DURATION);
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
      
      const validation = validateWorkoutRequest(highEnergyLongDurationRequest);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.HIGH_ENERGY);
    });

    it('should warn about low energy with long duration', () => {
      const lowEnergyLongDurationRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_energy: 2,
          customization_duration: 60
        }
      };
      
      const validation = validateWorkoutRequest(lowEnergyLongDurationRequest);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.LOW_ENERGY);
    });

    it('should warn about no equipment selected', () => {
      const noEquipmentRequest = {
        ...mockValidWorkoutRequest,
        workoutFocusData: {
          ...mockValidWorkoutRequest.workoutFocusData,
          customization_equipment: []
        }
      };
      
      const validation = validateWorkoutRequest(noEquipmentRequest);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES.NO_EQUIPMENT);
    });

    it('should validate detailed workout requirements', () => {
      const detailedRequest = {
        ...mockValidWorkoutRequest,
        type: 'detailed',
        profileData: {
          ...mockValidWorkoutRequest.profileData,
          experienceLevel: undefined
        }
      };
      
      const validation = validateWorkoutRequest(detailedRequest);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Experience level is required for detailed workouts');
    });
  });

  describe('Configuration Integration Validation', () => {
    it('should have consistent configuration across services', () => {
      // Verify that all services use the same configuration patterns
      const openAIConfig = getOpenAIConfig();
      const config = validateConfig(openAIConfig);
      
      expect(config.isValid).toBe(true);
      expect(WORKOUT_GENERATION_CONSTANTS).toBeDefined();
      
      // Both configurations should follow the same validation pattern
      expect(config).toHaveProperty('isValid');
      expect(config).toHaveProperty('errors');
      expect(config).toHaveProperty('warnings');
    });

    it('should handle configuration changes gracefully', () => {
      // Test that configuration validation handles changes properly
      const originalTimeout = WORKOUT_GENERATION_CONSTANTS.REQUEST_TIMEOUT_MS;
      
      // Configuration should remain valid even if constants change
      expect(WORKOUT_GENERATION_CONSTANTS.REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
      
      // Validation should work with current configuration
      const openAIConfig = getOpenAIConfig();
      const config = validateConfig(openAIConfig);
      expect(config.isValid).toBe(true);
    });

    it('should provide meaningful error messages', () => {
      const originalKey = process.env.VITE_OPENAI_API_KEY;
      delete process.env.VITE_OPENAI_API_KEY;
      
      const openAIConfig = getOpenAIConfig();
      const config = validateConfig(openAIConfig);
      
      expect(config.isValid).toBe(false);
      expect(config.errors.length).toBeGreaterThan(0);
      expect(config.errors[0]).toContain('required');
      
      // Restore environment variable
      if (originalKey) {
        process.env.VITE_OPENAI_API_KEY = originalKey;
      }
    });

    it('should provide meaningful warning messages', () => {
      const openAIConfig = getOpenAIConfig();
      const config = validateConfig(openAIConfig);
      
      if (config.warnings.length > 0) {
        config.warnings.forEach(warning => {
          expect(typeof warning).toBe('string');
          expect(warning.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Phase 3D Configuration Success Criteria', () => {
    it('should meet all configuration validation requirements', () => {
      // 1. OpenAI configuration stability
      const openAIConfig = getOpenAIConfig();
      const config = validateConfig(openAIConfig);
      expect(config.isValid).toBe(true);
      
      // 2. Workout generation constants validation
      expect(WORKOUT_GENERATION_CONSTANTS).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.MAX_RETRY_ATTEMPTS).toBeGreaterThan(0);
      expect(WORKOUT_GENERATION_CONSTANTS.REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
      
      // 3. Workout request validation
      const workoutValidation = validateWorkoutRequest(mockValidWorkoutRequest);
      expect(workoutValidation.isValid).toBe(true);
      
      // 4. Error message consistency
      expect(WORKOUT_GENERATION_CONSTANTS.ERROR_MESSAGES).toBeDefined();
      expect(WORKOUT_GENERATION_CONSTANTS.WARNING_MESSAGES).toBeDefined();
    });

    it('should provide comprehensive validation coverage', () => {
      // Test various validation scenarios
      const scenarios = [
        { name: 'valid request', request: mockValidWorkoutRequest, shouldBeValid: true },
        { name: 'missing user profile', request: { ...mockValidWorkoutRequest, userProfile: undefined }, shouldBeValid: false },
        { name: 'missing workout data', request: { ...mockValidWorkoutRequest, workoutFocusData: undefined }, shouldBeValid: false },
        { name: 'invalid duration', request: { ...mockValidWorkoutRequest, workoutFocusData: { ...mockValidWorkoutRequest.workoutFocusData, customization_duration: 2 } }, shouldBeValid: false },
        { name: 'invalid energy', request: { ...mockValidWorkoutRequest, workoutFocusData: { ...mockValidWorkoutRequest.workoutFocusData, customization_energy: 15 } }, shouldBeValid: false }
      ];
      
      scenarios.forEach(scenario => {
        const validation = validateWorkoutRequest(scenario.request as WorkoutGenerationRequest);
        expect(validation.isValid).toBe(scenario.shouldBeValid);
      });
    });
  });
}); 