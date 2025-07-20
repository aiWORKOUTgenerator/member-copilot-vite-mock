// Live API Test Setup - Phase 3D
import { setEnvironmentAdapter, createTestEnvironmentAdapter } from '../config/openai.config';

// Test environment configuration
export const LIVE_API_TEST_CONFIG = {
  // Set to true to enable live API testing
  ENABLE_LIVE_TESTS: process.env.ENABLE_LIVE_API_TESTS === 'true',
  
  // API key for testing (should be set in environment)
  API_KEY: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  
  // Test timeout for live API calls (longer than unit tests)
  LIVE_TEST_TIMEOUT: 30000, // 30 seconds
  
  // Maximum retries for live API tests
  MAX_RETRIES: 2,
  
  // Test user profile for consistent testing
  TEST_USER_PROFILE: {
    fitnessLevel: 'some experience',
    goals: ['strength', 'endurance'],
    preferences: {
      workoutDuration: 30,
      intensity: 'moderate',
      equipment: ['dumbbells', 'bodyweight']
    }
  },
  
  // Test workout focus data
  TEST_WORKOUT_FOCUS_DATA: {
    customization_duration: 30,
    customization_energy: 7,
    customization_focus: 'strength',
    customization_equipment: ['dumbbells', 'bodyweight'],
    customization_soreness: {
      'upper body': 'mild',
      'lower body': 'none'
    }
  }
};

// Live API test utilities
export class LiveAPITestUtils {
  private static isLiveTestingEnabled = LIVE_API_TEST_CONFIG.ENABLE_LIVE_TESTS;
  private static hasValidAPIKey = !!LIVE_API_TEST_CONFIG.API_KEY;

  /**
   * Check if live API testing is available
   */
  static canRunLiveTests(): boolean {
    return this.isLiveTestingEnabled && this.hasValidAPIKey;
  }

  /**
   * Get test environment adapter with API key
   */
  static getTestEnvironmentAdapter() {
    if (!this.hasValidAPIKey) {
      throw new Error('OpenAI API key not found. Set VITE_OPENAI_API_KEY or OPENAI_API_KEY environment variable.');
    }

    return createTestEnvironmentAdapter({
      MODE: 'test',
      VITE_OPENAI_API_KEY: LIVE_API_TEST_CONFIG.API_KEY!,
      VITE_OPENAI_BASE_URL: 'https://api.openai.com/v1'
    });
  }

  /**
   * Setup environment for live API testing
   */
  static setupLiveTesting() {
    if (!this.canRunLiveTests()) {
      console.warn('Live API testing disabled. Set ENABLE_LIVE_API_TESTS=true and VITE_OPENAI_API_KEY to enable.');
      return false;
    }

    const adapter = this.getTestEnvironmentAdapter();
    setEnvironmentAdapter(adapter);
    
    console.log('✅ Live API testing enabled with valid API key');
    return true;
  }

  /**
   * Create a test workout request
   */
  static createTestWorkoutRequest() {
    return {
      type: 'quick' as const,
      userProfile: LIVE_API_TEST_CONFIG.TEST_USER_PROFILE,
      workoutFocusData: LIVE_API_TEST_CONFIG.TEST_WORKOUT_FOCUS_DATA,
      profileData: {
        experienceLevel: 'some experience',
        physicalActivity: 'moderate',
        preferredDuration: 30,
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
  }

  /**
   * Validate API response structure
   */
  static validateWorkoutResponse(response: any): boolean {
    if (!response) return false;
    
    // Basic structure validation
    const hasRequiredFields = 
      response.workout &&
      response.exercises &&
      Array.isArray(response.exercises) &&
      response.exercises.length > 0;
    
    if (!hasRequiredFields) {
      console.error('Invalid workout response structure:', response);
      return false;
    }

    // Exercise validation
    const validExercises = response.exercises.every((exercise: any) => 
      exercise.name && 
      exercise.duration && 
      exercise.category
    );

    if (!validExercises) {
      console.error('Invalid exercise structure in response');
      return false;
    }

    return true;
  }

  /**
   * Log API test results
   */
  static logTestResult(testName: string, success: boolean, duration: number, error?: any) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    const time = `${duration}ms`;
    
    console.log(`${status} ${testName} (${time})`);
    
    if (error) {
      console.error('Error details:', error.message);
    }
  }
}

// Jest setup for live API tests
export const setupLiveAPITests = () => {
  beforeAll(() => {
    LiveAPITestUtils.setupLiveTesting();
  });

  afterAll(() => {
    // Cleanup if needed
  });
};

// Conditional test execution
export const describeLiveAPI = (name: string, fn: () => void) => {
  if (LiveAPITestUtils.canRunLiveTests()) {
    describe(name, fn);
  } else {
    describe.skip(`${name} (Live API disabled)`, fn);
  }
};

// Test timeout configuration for live API tests
export const LIVE_API_TIMEOUT = LIVE_API_TEST_CONFIG.LIVE_TEST_TIMEOUT; 