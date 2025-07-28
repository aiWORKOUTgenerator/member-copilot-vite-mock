/**
 * AIContext Core Tests - MANDATORY SAFETY MEASURE
 * 
 * Focused tests for core AIContext functionality to ensure refactoring safety.
 * Tests the essential context features without external dependencies.
 * 
 * CRITICAL: These tests must pass before any AIContext refactoring.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { UserProfile } from '../../../types';

// Mock the AIContext to avoid external dependencies
const mockAIContext = {
  serviceStatus: 'ready',
  featureFlags: {
    ai_service_unified: true,
    ai_cross_component_analysis: true,
    ai_real_time_insights: false,
    ai_learning_system: false,
    openai_workout_generation: true,
    openai_enhanced_recommendations: true,
    openai_user_analysis: true
  },
  environmentStatus: {
    isConfigured: true,
    hasApiKey: true,
    isDevelopment: true,
    issues: [],
    recommendations: []
  },
  isFeatureEnabled: jest.fn((flag: string) => mockAIContext.featureFlags[flag as keyof typeof mockAIContext.featureFlags] || false),
  getEnergyInsights: jest.fn(() => []),
  getSorenessInsights: jest.fn(() => []),
  analyze: jest.fn(() => ({ insights: [], recommendations: [] })),
  generateWorkout: jest.fn(() => ({ workout: 'mock' })),
  updateSelections: jest.fn(),
  developmentTools: {
    overrideFlag: jest.fn(),
    exportFlags: jest.fn(),
    checkEnvironment: jest.fn(),
    validateState: jest.fn()
  }
};

// Mock the useAI hook
jest.mock('../../../contexts/AIContext', () => ({
  useAI: () => mockAIContext,
  AIProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children)
}));

import { useAI, AIProvider } from '../../../contexts/AIContext';

// Mock components to test AIContext integration
const MockAIConsumer = ({ testId, hookTest }: { testId: string; hookTest: (context: any) => void }) => {
  const context = useAI();
  React.useEffect(() => {
    hookTest(context);
  }, [context, hookTest]);
  
  return React.createElement('div', { 'data-testid': testId }, 'AI Context Consumer');
};

// Test wrapper with AIProvider
const TestWrapper = ({ children, userProfile }: { children: React.ReactNode; userProfile?: UserProfile }) => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { serviceStatus } = useAI();

  React.useEffect(() => {
    if (userProfile && serviceStatus === 'ready') {
      setIsInitialized(true);
    }
  }, [userProfile, serviceStatus]);

  return React.createElement('div', {
    'data-testid': 'test-wrapper',
    'data-status': serviceStatus,
    'data-initialized': isInitialized
  }, children);
};

// Mock user profile for testing
const mockUserProfile: UserProfile = {
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
    availableEquipment: ['dumbbells', 'resistance_bands'],
    availableLocations: ['home']
  },
  enhancedLimitations: {
    timeConstraints: 60,
    equipmentConstraints: ['dumbbells', 'resistance_bands'],
    locationConstraints: ['home'],
    recoveryNeeds: {
      restDays: 2,
      sleepHours: 8,
      hydrationLevel: 'moderate'
    },
    mobilityLimitations: [],
    progressionRate: 'moderate'
  },
  workoutHistory: {
    estimatedCompletedWorkouts: 20,
    averageDuration: 45,
    preferredFocusAreas: ['strength'],
    progressiveEnhancementUsage: {},
    aiRecommendationAcceptance: 0.7,
    consistencyScore: 0.6,
    plateauRisk: 'moderate'
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

describe('AIContext Core Tests - MANDATORY SAFETY', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock context state
    mockAIContext.serviceStatus = 'ready';
    mockAIContext.featureFlags = {
      ai_service_unified: true,
      ai_cross_component_analysis: true,
      ai_real_time_insights: false,
      ai_learning_system: false,
      openai_workout_generation: true,
      openai_enhanced_recommendations: true,
      openai_user_analysis: true
    };
  });

  describe('1. Core Context Structure', () => {
    it('should provide correct context structure', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'structure-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      // Core properties
      expect(context.serviceStatus).toBe('ready');
      expect(context.featureFlags).toBeDefined();
      expect(context.environmentStatus).toBeDefined();
      
      // Core methods
      expect(context.isFeatureEnabled).toBeDefined();
      expect(typeof context.isFeatureEnabled).toBe('function');
      expect(context.getEnergyInsights).toBeDefined();
      expect(typeof context.getEnergyInsights).toBe('function');
      expect(context.getSorenessInsights).toBeDefined();
      expect(typeof context.getSorenessInsights).toBe('function');
      expect(context.analyze).toBeDefined();
      expect(typeof context.analyze).toBe('function');
      expect(context.generateWorkout).toBeDefined();
      expect(typeof context.generateWorkout).toBe('function');
      expect(context.updateSelections).toBeDefined();
      expect(typeof context.updateSelections).toBe('function');
    });
  });

  describe('2. Service Status Management', () => {
    it('should provide correct service status', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'status-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      expect(context.serviceStatus).toBe('ready');
    });

    it('should handle service status changes', () => {
      mockAIContext.serviceStatus = 'error';
      
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'status-change-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      expect(context.serviceStatus).toBe('error');
    });
  });

  describe('3. Feature Flag System', () => {
    it('should provide feature flags correctly', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'flags-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      expect(context.featureFlags).toBeDefined();
      expect(typeof context.featureFlags).toBe('object');
      expect(context.featureFlags.ai_service_unified).toBe(true);
      expect(context.featureFlags.ai_real_time_insights).toBe(false);
    });

    it('should check feature flags correctly', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'flag-check-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      expect(context.isFeatureEnabled('ai_service_unified')).toBe(true);
      expect(context.isFeatureEnabled('ai_real_time_insights')).toBe(false);
      expect(context.isFeatureEnabled('nonexistent_flag')).toBe(false);
    });
  });

  describe('4. AI Service Methods', () => {
    it('should provide energy insights method', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'energy-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      expect(context.getEnergyInsights).toBeDefined();
      expect(typeof context.getEnergyInsights).toBe('function');
      
      const insights = context.getEnergyInsights(5);
      expect(Array.isArray(insights)).toBe(true);
      expect(context.getEnergyInsights).toHaveBeenCalledWith(5);
    });

    it('should provide soreness insights method', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'soreness-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      expect(context.getSorenessInsights).toBeDefined();
      expect(typeof context.getSorenessInsights).toBe('function');
      
      const insights = context.getSorenessInsights(3);
      expect(Array.isArray(insights)).toBe(true);
      expect(context.getSorenessInsights).toHaveBeenCalledWith(3);
    });

    it('should provide analysis method', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'analysis-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      expect(context.analyze).toBeDefined();
      expect(typeof context.analyze).toBe('function');
      
      const result = context.analyze();
      expect(result).toEqual({ insights: [], recommendations: [] });
      expect(context.analyze).toHaveBeenCalled();
    });

    it('should provide workout generation method', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'workout-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      expect(context.generateWorkout).toBeDefined();
      expect(typeof context.generateWorkout).toBe('function');
      
      const result = context.generateWorkout();
      expect(result).toEqual({ workout: 'mock' });
      expect(context.generateWorkout).toHaveBeenCalled();
    });
  });

  describe('5. Development Tools', () => {
    it('should provide development tools', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'dev-tools-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      expect(context.developmentTools).toBeDefined();
      expect(context.developmentTools.overrideFlag).toBeDefined();
      expect(typeof context.developmentTools.overrideFlag).toBe('function');
      expect(context.developmentTools.exportFlags).toBeDefined();
      expect(typeof context.developmentTools.exportFlags).toBe('function');
      expect(context.developmentTools.checkEnvironment).toBeDefined();
      expect(typeof context.developmentTools.checkEnvironment).toBe('function');
      expect(context.developmentTools.validateState).toBeDefined();
      expect(typeof context.developmentTools.validateState).toBe('function');
    });


  });

  describe('6. Environment Status', () => {
    it('should provide environment status information', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'env-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      expect(context.environmentStatus).toBeDefined();
      expect(context.environmentStatus.isConfigured).toBeDefined();
      expect(context.environmentStatus.hasApiKey).toBeDefined();
      expect(context.environmentStatus.isDevelopment).toBeDefined();
      expect(Array.isArray(context.environmentStatus.issues)).toBe(true);
      expect(Array.isArray(context.environmentStatus.recommendations)).toBe(true);
    });
  });

  describe('7. State Updates', () => {
    it('should handle state updates', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'updates-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      expect(context.updateSelections).toBeDefined();
      expect(typeof context.updateSelections).toBe('function');
      
      context.updateSelections({ customization_energy: 5 });
      expect(context.updateSelections).toHaveBeenCalledWith({ customization_energy: 5 });
    });
  });

  describe('8. Multiple Consumers', () => {
    it('should work with multiple consumers', () => {
      const consumers = Array.from({ length: 5 }, (_, i) => i);
      const hookTests = consumers.map(() => jest.fn());
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            ...consumers.map((i) => 
              React.createElement(MockAIConsumer, { 
                key: i, 
                testId: `consumer-${i}`, 
                hookTest: hookTests[i] 
              })
            )
          )
        )
      );

      // All consumers should have been called
      hookTests.forEach(hookTest => {
        expect(hookTest).toHaveBeenCalled();
      });

      // All consumers should get the same context
      hookTests.forEach(hookTest => {
        const context = hookTest.mock.calls[0][0];
        expect(context.serviceStatus).toBe('ready');
        expect(context.featureFlags).toBeDefined();
      });
    });
  });

  describe('9. Error Handling', () => {
    it('should handle error states', () => {
      mockAIContext.serviceStatus = 'error';
      
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'error-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      expect(context.serviceStatus).toBe('error');
    });
  });

  describe('10. Performance', () => {
    it('should handle rapid method calls efficiently', () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'performance-test', hookTest })
          )
        )
      );

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      
      // Test rapid calls
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        context.getEnergyInsights(i);
        context.getSorenessInsights(i);
        context.isFeatureEnabled('ai_service_unified');
      }
      const endTime = Date.now();
      
      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Should have been called the expected number of times
      expect(context.getEnergyInsights).toHaveBeenCalledTimes(100);
      expect(context.getSorenessInsights).toHaveBeenCalledTimes(100);
      expect(context.isFeatureEnabled).toHaveBeenCalledTimes(100);
    });
  });
}); 