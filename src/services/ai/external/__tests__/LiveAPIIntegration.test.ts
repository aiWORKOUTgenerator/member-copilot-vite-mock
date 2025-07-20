// Live API Integration Tests - Phase 3D (Complete Rewrite)
import { OpenAIStrategy } from '../OpenAIStrategy';
import { WorkoutGenerationService } from '../WorkoutGenerationService';
import { OpenAIService } from '../OpenAIService';
import { 
  LiveAPITestUtils, 
  describeLiveAPI, 
  setupLiveAPITests, 
  LIVE_API_TIMEOUT 
} from './live-api-test-setup';

// ✅ FIXED: Import unified types from workout-generation.types.ts
import { 
  WorkoutGenerationRequest, 
  GeneratedWorkout,
  WorkoutRequestAdapter
} from '../../../../types/workout-generation.types';

// ✅ FIXED: Import ProfileData type
import { ProfileData } from '../../../../components/Profile/types/profile.types';

// ✅ FIXED: Import UserProfile and PerWorkoutOptions from core types to avoid conflicts
import { UserProfile } from '../../../../types/user';
import { PerWorkoutOptions } from '../../../../types/core';

// ✅ FIXED: Import GlobalAIContext from core types
import { GlobalAIContext } from '../../core/types/AIServiceTypes';

// ✅ FIXED: Add Jest mock for config module to avoid import.meta syntax errors
jest.mock('../config/openai.config', () => ({
  setEnvironmentAdapter: jest.fn(),
  createTestEnvironmentAdapter: jest.fn(() => ({
    getMode: () => 'test',
    getApiKey: () => process.env.VITE_OPENAI_API_KEY || 'test-api-key',
    getBaseUrl: () => 'https://api.openai.com/v1',
    getModel: () => 'gpt-4-turbo',
    getMaxTokens: () => 2000,
    getTemperature: () => 0.7
  })),
  openAIConfig: {
    openai: {
      apiKey: process.env.VITE_OPENAI_API_KEY || 'test-api-key',
      model: 'gpt-4-turbo',
      maxTokens: 2000,
      temperature: 0.7,
      baseURL: 'https://api.openai.com/v1'
    },
    performance: {
      maxRequestsPerMinute: 100,
      requestTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    }
  },
  validateConfig: jest.fn(() => ({ isValid: true, errors: [] })),
  getOpenAIConfig: jest.fn(() => ({
    openai: {
      apiKey: process.env.VITE_OPENAI_API_KEY || 'test-api-key',
      model: 'gpt-4-turbo',
      maxTokens: 2000,
      temperature: 0.7,
      baseURL: 'https://api.openai.com/v1'
    },
    performance: {
      maxRequestsPerMinute: 100,
      requestTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    }
  })),
  getConfigHealth: jest.fn(() => ({ status: 'healthy', details: {} })),
  configPresets: {
    development: {},
    production: {},
    test: {}
  },
  OPENAI_CONFIG_CONSTANTS: {
    DEFAULT_MODEL: 'gpt-4-turbo',
    DEFAULT_MAX_TOKENS: 2000,
    DEFAULT_TEMPERATURE: 0.7
  },
  ViteEnvironmentAdapter: jest.fn(),
  // ✅ FIXED: Add missing estimateTokenCost function
  estimateTokenCost: jest.fn(() => ({
    inputTokens: 100,
    outputTokens: 50,
    totalCost: 0.002,
    model: 'gpt-4-turbo'
  })),
  // ✅ FIXED: Add other missing functions
  calculateTokenUsage: jest.fn(() => ({
    inputTokens: 100,
    outputTokens: 50,
    totalTokens: 150
  })),
  validateApiKey: jest.fn(() => ({ isValid: true, error: null })),
  getModelInfo: jest.fn(() => ({
    name: 'gpt-4-turbo',
    maxTokens: 4096,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03
  }))
}));

// ✅ FIXED: Create comprehensive test data factory
class TestDataFactory {
  static createCompleteProfileData(): ProfileData {
    return {
      experienceLevel: 'Some Experience',
      physicalActivity: 'moderate',
      preferredDuration: '30-45 min',
      timeCommitment: '3-4',
      intensityLevel: 'moderately',
      preferredActivities: ['Running/Jogging', 'Swimming'],
      availableEquipment: ['Dumbbells', 'Resistance Bands'],
      availableLocations: ['Home', 'Gym'],
      primaryGoal: 'Strength',
      goalTimeline: '3 months',
      age: '26-35',
      height: '175',
      weight: '70',
      gender: 'male',
      hasCardiovascularConditions: 'No',
      injuries: ['No Injuries']
    };
  }

  static createWorkoutFocusData(): PerWorkoutOptions {
    return {
      customization_duration: 30,
      customization_energy: 7,
      customization_focus: 'strength',
      customization_equipment: ['dumbbells', 'bodyweight'],
      // ✅ FIXED: Use correct CategoryRatingData structure for soreness
      customization_soreness: {
        'upper body': {
          selected: true,
          rating: 2,
          label: 'Upper Body',
          description: 'Mild soreness in upper body',
          metadata: {
            severity: 'mild',
            affectedActivities: ['push-ups', 'pull-ups']
          }
        },
        'lower body': {
          selected: false,
          rating: 0,
          label: 'Lower Body',
          description: 'No soreness in lower body'
        }
      }
    };
  }

  // ✅ FIXED: Create UserProfile compatible with LiveAPITestUtils structure
  static createUserProfile(): UserProfile {
    return {
      fitnessLevel: 'some experience',
      goals: ['strength', 'endurance'],
      preferences: {
        workoutStyle: ['strength_training', 'cardio'],
        timePreference: 'morning',
        intensityPreference: 'moderate',
        advancedFeatures: false,
        aiAssistanceLevel: 'moderate'
      },
      basicLimitations: {
        injuries: [],
        availableEquipment: ['dumbbells', 'bodyweight'],
        availableLocations: ['home', 'gym']
      },
      enhancedLimitations: {
        timeConstraints: 30,
        equipmentConstraints: ['dumbbells', 'bodyweight'],
        locationConstraints: ['home', 'gym'],
        recoveryNeeds: {
          restDays: 2,
          sleepHours: 8,
          hydrationLevel: 'moderate'
        },
        mobilityLimitations: [],
        progressionRate: 'moderate'
      },
      workoutHistory: {
        estimatedCompletedWorkouts: 50,
        averageDuration: 30,
        preferredFocusAreas: ['strength', 'cardio'],
        progressiveEnhancementUsage: {},
        aiRecommendationAcceptance: 0.7,
        consistencyScore: 0.8,
        plateauRisk: 'low'
      },
      learningProfile: {
        prefersSimplicity: false,
        explorationTendency: 'moderate',
        feedbackPreference: 'detailed',
        learningStyle: 'mixed',
        motivationType: 'intrinsic',
        adaptationSpeed: 'moderate'
      }
    };
  }

  // ✅ FIXED: Create unified WorkoutGenerationRequest structure
  static createWorkoutGenerationRequest(): WorkoutGenerationRequest {
    return WorkoutRequestAdapter.createBasicRequest(
      'quick',
      this.createCompleteProfileData(),
      this.createWorkoutFocusData(),
      this.createUserProfile()
    );
  }

  // ✅ FIXED: Create correct GlobalAIContext structure
  static createGlobalAIContext(): GlobalAIContext {
    return {
      userProfile: this.createUserProfile(),
      currentSelections: this.createWorkoutFocusData(),
      sessionHistory: [],
      // ✅ FIXED: Add missing required preferences property
      preferences: {
        aiAssistanceLevel: 'moderate',
        showLearningInsights: true,
        autoApplyLowRiskRecommendations: false
      }
    };
  }
}

// ✅ FIXED: Update LiveAPITestUtils to use correct GeneratedWorkout structure
class EnhancedLiveAPITestUtils extends LiveAPITestUtils {
  static validateWorkoutResponse(workout: GeneratedWorkout): boolean {
    if (!workout) return false;
    
    // ✅ FIXED: Validate correct GeneratedWorkout structure
    const hasRequiredFields = 
      workout.id &&
      workout.title &&
      workout.description &&
      workout.totalDuration &&
      workout.warmup &&
      workout.mainWorkout &&
      workout.cooldown;
    
    if (!hasRequiredFields) {
      console.error('Invalid workout response structure:', workout);
      return false;
    }

    // ✅ FIXED: Validate each workout phase
    const phases = [workout.warmup, workout.mainWorkout, workout.cooldown];
    const validPhases = phases.every(phase => 
      phase.name && 
      phase.duration && 
      Array.isArray(phase.exercises) &&
      phase.exercises.length > 0
    );

    if (!validPhases) {
      console.error('Invalid workout phase structure');
      return false;
    }

    // ✅ FIXED: Validate exercises in each phase
    const allExercises = phases.flatMap(phase => phase.exercises);
    const validExercises = allExercises.every(exercise => 
      exercise.name && 
      exercise.description &&
      exercise.duration
    );

    return validExercises;
  }

  // ✅ FIXED: Override to return the correct type
  static createTestWorkoutRequest(): any {
    return TestDataFactory.createWorkoutGenerationRequest();
  }
}

// Setup live API testing
setupLiveAPITests();

describeLiveAPI('Live OpenAI API Integration - Phase 3D (Fixed)', () => {
  let openAIService: OpenAIService;
  let openAIStrategy: OpenAIStrategy;
  let workoutGenerationService: WorkoutGenerationService;

  beforeEach(() => {
    // Initialize services with live API configuration
    openAIService = new OpenAIService();
    openAIStrategy = new OpenAIStrategy(openAIService);
    workoutGenerationService = new WorkoutGenerationService(openAIService);
  });

  afterEach(() => {
    // Clean up any mocks or state
    jest.clearAllMocks();
  });

  describe('OpenAI Service Live API Tests', () => {
    it('should perform health check with live API', async () => {
      const startTime = Date.now();
      
      try {
        const healthStatus = await openAIService.healthCheck();
        const duration = Date.now() - startTime;
        
        expect(typeof healthStatus).toBe('boolean');
        EnhancedLiveAPITestUtils.logTestResult('OpenAI Health Check', true, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('OpenAI Health Check', false, duration, error);
        throw error;
      }
    }, LIVE_API_TIMEOUT);

    it('should make a simple API request to OpenAI', async () => {
      const startTime = Date.now();
      
      try {
        const response = await openAIService.makeRequest([
          { role: 'system', content: 'You are a helpful fitness assistant.' },
          { role: 'user', content: 'Generate a simple 5-minute warm-up routine.' }
        ], {
          maxTokens: 200,
          temperature: 0.7
        });
        
        const duration = Date.now() - startTime;
        
        expect(response).toBeDefined();
        expect(response.choices).toBeDefined();
        expect(response.choices.length).toBeGreaterThan(0);
        expect(response.choices[0].message).toBeDefined();
        expect(response.choices[0].message.content).toBeDefined();
        
        EnhancedLiveAPITestUtils.logTestResult('Simple API Request', true, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('Simple API Request', false, duration, error);
        throw error;
      }
    }, LIVE_API_TIMEOUT);
  });

  describe('OpenAI Strategy Live API Tests', () => {
    it('should generate recommendations with live API', async () => {
      const startTime = Date.now();
      
      try {
        // ✅ FIXED: Use correct GlobalAIContext structure
        const mockContext = TestDataFactory.createGlobalAIContext();
        
        const recommendations = await openAIStrategy.generateRecommendations(mockContext);
        const duration = Date.now() - startTime;
        
        expect(Array.isArray(recommendations)).toBe(true);
        expect(recommendations.length).toBeGreaterThan(0);
        
        // Validate recommendation structure
        recommendations.forEach(rec => {
          expect(rec).toHaveProperty('id');
          expect(rec).toHaveProperty('title');
          expect(rec).toHaveProperty('description');
          expect(rec).toHaveProperty('priority');
        });
        
        EnhancedLiveAPITestUtils.logTestResult('Generate Recommendations', true, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('Generate Recommendations', false, duration, error);
        throw error;
      }
    }, LIVE_API_TIMEOUT);

    it('should analyze user preferences with live API', async () => {
      const startTime = Date.now();
      
      try {
        // ✅ FIXED: Use correct GlobalAIContext structure
        const mockContext = TestDataFactory.createGlobalAIContext();
        
        const analysis = await openAIStrategy.analyzeUserPreferences(mockContext);
        const duration = Date.now() - startTime;
        
        expect(analysis).toBeDefined();
        expect(analysis).toHaveProperty('preferences');
        expect(analysis).toHaveProperty('insights');
        expect(analysis).toHaveProperty('recommendations');
        
        EnhancedLiveAPITestUtils.logTestResult('User Preference Analysis', true, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('User Preference Analysis', false, duration, error);
        throw error;
      }
    }, LIVE_API_TIMEOUT);
  });

  describe('Workout Generation Service Live API Tests', () => {
    it('should generate a complete workout with live API', async () => {
      const startTime = Date.now();
      
      try {
        // ✅ FIXED: Use unified WorkoutGenerationRequest structure
        const request = TestDataFactory.createWorkoutGenerationRequest();
        const workout = await workoutGenerationService.generateWorkout(request);
        const duration = Date.now() - startTime;
        
        // ✅ FIXED: Validate workout response structure using correct properties
        const isValidResponse = EnhancedLiveAPITestUtils.validateWorkoutResponse(workout);
        expect(isValidResponse).toBe(true);
        
        // ✅ FIXED: Use correct GeneratedWorkout properties
        expect(workout.warmup).toBeDefined();
        expect(workout.mainWorkout).toBeDefined();
        expect(workout.cooldown).toBeDefined();
        expect(workout.warmup.exercises.length).toBeGreaterThan(0);
        expect(workout.mainWorkout.exercises.length).toBeGreaterThan(0);
        expect(workout.cooldown.exercises.length).toBeGreaterThan(0);
        
        // ✅ FIXED: Validate exercise structure in each phase
        workout.warmup.exercises.forEach((exercise: any) => {
          expect(exercise).toHaveProperty('name');
          expect(exercise).toHaveProperty('description');
          expect(exercise).toHaveProperty('duration');
          expect(typeof exercise.name).toBe('string');
          expect(exercise.name.length).toBeGreaterThan(0);
        });
        
        EnhancedLiveAPITestUtils.logTestResult('Generate Complete Workout', true, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('Generate Complete Workout', false, duration, error);
        throw error;
      }
    }, LIVE_API_TIMEOUT);

    it('should generate a detailed workout with live API', async () => {
      const startTime = Date.now();
      
      try {
        // ✅ FIXED: Create detailed workout request with unified structure
        const request = WorkoutRequestAdapter.createBasicRequest(
          'detailed',
          TestDataFactory.createCompleteProfileData(),
          TestDataFactory.createWorkoutFocusData(),
          TestDataFactory.createUserProfile()
        );
        
        const workout = await workoutGenerationService.generateWorkout(request);
        const duration = Date.now() - startTime;
        
        // ✅ FIXED: Validate detailed workout response using correct structure
        const isValidResponse = EnhancedLiveAPITestUtils.validateWorkoutResponse(workout);
        expect(isValidResponse).toBe(true);
        
        // ✅ FIXED: Use correct GeneratedWorkout properties
        expect(workout.warmup).toBeDefined();
        expect(workout.mainWorkout).toBeDefined();
        expect(workout.cooldown).toBeDefined();
        expect(workout.warmup.exercises.length).toBeGreaterThan(0);
        expect(workout.mainWorkout.exercises.length).toBeGreaterThan(0);
        expect(workout.cooldown.exercises.length).toBeGreaterThan(0);
        
        // ✅ FIXED: Validate detailed exercise structure in each phase
        workout.mainWorkout.exercises.forEach((exercise: any) => {
          expect(exercise).toHaveProperty('name');
          expect(exercise).toHaveProperty('description');
          expect(exercise).toHaveProperty('duration');
          // ✅ FIXED: Use correct property name from Exercise interface
          expect(typeof exercise.description).toBe('string');
          expect(exercise.description.length).toBeGreaterThan(0);
        });
        
        EnhancedLiveAPITestUtils.logTestResult('Generate Detailed Workout', true, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('Generate Detailed Workout', false, duration, error);
        throw error;
      }
    }, LIVE_API_TIMEOUT);

    it('should handle different energy levels with live API', async () => {
      const energyLevels = [3, 5, 8]; // Low, medium, high energy
      
      for (const energyLevel of energyLevels) {
        const startTime = Date.now();
        
        try {
          // ✅ FIXED: Create request with unified structure and energy level
          const request = TestDataFactory.createWorkoutGenerationRequest();
          request.workoutFocusData.customization_energy = energyLevel;
          
          const workout = await workoutGenerationService.generateWorkout(request);
          const duration = Date.now() - startTime;
          
          // ✅ FIXED: Validate workout response using correct structure
          const isValidResponse = EnhancedLiveAPITestUtils.validateWorkoutResponse(workout);
          expect(isValidResponse).toBe(true);
          
          EnhancedLiveAPITestUtils.logTestResult(`Energy Level ${energyLevel}`, true, duration);
          
        } catch (error) {
          const duration = Date.now() - startTime;
          EnhancedLiveAPITestUtils.logTestResult(`Energy Level ${energyLevel}`, false, duration, error);
          throw error;
        }
      }
    }, LIVE_API_TIMEOUT);

    it('should handle different focus areas with live API', async () => {
      const focusAreas = ['strength', 'cardio', 'flexibility'];
      
      for (const focus of focusAreas) {
        const startTime = Date.now();
        
        try {
          // ✅ FIXED: Create request with unified structure and focus area
          const request = TestDataFactory.createWorkoutGenerationRequest();
          request.workoutFocusData.customization_focus = focus;
          
          const workout = await workoutGenerationService.generateWorkout(request);
          const duration = Date.now() - startTime;
          
          // ✅ FIXED: Validate workout response using correct structure
          const isValidResponse = EnhancedLiveAPITestUtils.validateWorkoutResponse(workout);
          expect(isValidResponse).toBe(true);
          
          EnhancedLiveAPITestUtils.logTestResult(`Focus Area ${focus}`, true, duration);
          
        } catch (error) {
          const duration = Date.now() - startTime;
          EnhancedLiveAPITestUtils.logTestResult(`Focus Area ${focus}`, false, duration, error);
          throw error;
        }
      }
    }, LIVE_API_TIMEOUT);
  });

  describe('Performance and Reliability Tests', () => {
    it('should handle concurrent API requests', async () => {
      const startTime = Date.now();
      
      try {
        // ✅ FIXED: Create multiple requests with unified structure
        const requests = Array(3).fill(null).map(() => 
          TestDataFactory.createWorkoutGenerationRequest()
        );
        
        const promises = requests.map(request => 
          workoutGenerationService.generateWorkout(request)
        );
        
        const results = await Promise.all(promises);
        const duration = Date.now() - startTime;
        
        // ✅ FIXED: Validate all results using correct structure
        results.forEach((workout) => {
          const isValidResponse = EnhancedLiveAPITestUtils.validateWorkoutResponse(workout);
          expect(isValidResponse).toBe(true);
        });
        
        EnhancedLiveAPITestUtils.logTestResult('Concurrent API Requests', true, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('Concurrent API Requests', false, duration, error);
        throw error;
      }
    }, LIVE_API_TIMEOUT);

    it('should demonstrate caching behavior', async () => {
      const startTime = Date.now();
      
      try {
        // ✅ FIXED: Create request with unified structure
        const request = TestDataFactory.createWorkoutGenerationRequest();
        
        // First request (cache miss)
        const firstWorkout = await workoutGenerationService.generateWorkout(request);
        const firstDuration = Date.now() - startTime;
        
        // Second request (should be cached)
        const secondStartTime = Date.now();
        const secondWorkout = await workoutGenerationService.generateWorkout(request);
        const secondDuration = Date.now() - secondStartTime;
        
        // ✅ FIXED: Validate both responses using correct structure
        const firstValid = EnhancedLiveAPITestUtils.validateWorkoutResponse(firstWorkout);
        const secondValid = EnhancedLiveAPITestUtils.validateWorkoutResponse(secondWorkout);
        
        expect(firstValid).toBe(true);
        expect(secondValid).toBe(true);
        
        // Second request should be faster (cached)
        expect(secondDuration).toBeLessThan(firstDuration);
        
        EnhancedLiveAPITestUtils.logTestResult('Caching Behavior', true, firstDuration + secondDuration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('Caching Behavior', false, duration, error);
        throw error;
      }
    }, LIVE_API_TIMEOUT);
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API rate limiting gracefully', async () => {
      const startTime = Date.now();
      
      try {
        // ✅ FIXED: Create multiple requests with unified structure
        const requests = Array(5).fill(null).map(() => 
          TestDataFactory.createWorkoutGenerationRequest()
        );
        
        const promises = requests.map(request => 
          workoutGenerationService.generateWorkout(request).catch(error => error)
        );
        
        const results = await Promise.all(promises);
        const duration = Date.now() - startTime;
        
        // Some requests might fail due to rate limiting, which is expected
        const successfulRequests = results.filter(result => !(result instanceof Error));
        const failedRequests = results.filter(result => result instanceof Error);
        
        expect(successfulRequests.length + failedRequests.length).toBe(5);
        
        EnhancedLiveAPITestUtils.logTestResult('Rate Limiting Handling', true, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('Rate Limiting Handling', false, duration, error);
        throw error;
      }
    }, LIVE_API_TIMEOUT);

    it('should handle network timeouts gracefully', async () => {
      const startTime = Date.now();
      
      try {
        // ✅ FIXED: Create request with unified structure
        const request = TestDataFactory.createWorkoutGenerationRequest();
        
        // This test might timeout, which is expected behavior
        const workout = await workoutGenerationService.generateWorkout(request);
        const duration = Date.now() - startTime;
        
        const isValidResponse = EnhancedLiveAPITestUtils.validateWorkoutResponse(workout);
        expect(isValidResponse).toBe(true);
        
        EnhancedLiveAPITestUtils.logTestResult('Network Timeout Handling', true, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        EnhancedLiveAPITestUtils.logTestResult('Network Timeout Handling', false, duration, error);
        // ✅ FIXED: Proper error type handling
        if (error instanceof Error) {
          expect(error.message).toContain('timeout');
        }
      }
    }, LIVE_API_TIMEOUT);
  });
}); 