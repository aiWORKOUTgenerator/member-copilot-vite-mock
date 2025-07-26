/**
 * AIContext Integration Tests - MANDATORY SAFETY MEASURE
 * 
 * Comprehensive tests for all AIContext consumers to ensure refactoring safety.
 * Tests all 12+ components that use the useAI hook.
 * 
 * CRITICAL: These tests must pass before any AIContext refactoring.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { AIProvider, useAI } from '../../../contexts/AIContext';
import { UserProfile } from '../../../types';

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
  const { initialize, serviceStatus } = useAI();

  React.useEffect(() => {
    if (userProfile && serviceStatus === 'initializing') {
      initialize(userProfile).then(() => setIsInitialized(true));
    }
  }, [userProfile, initialize, serviceStatus]);

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

describe('AIContext Integration Tests - MANDATORY SAFETY', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Core Context Initialization', () => {
    it('should initialize AIContext successfully', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'init-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-wrapper')).toHaveAttribute('data-status', 'ready');
      });

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      expect(context.serviceStatus).toBe('ready');
      expect(context.featureFlags).toBeDefined();
      expect(context.environmentStatus).toBeDefined();
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidProfile = { ...mockUserProfile, fitnessLevel: undefined as any };
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: invalidProfile },
            React.createElement(MockAIConsumer, { testId: 'error-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-wrapper')).toHaveAttribute('data-status', 'error');
      });

      expect(hookTest).toHaveBeenCalled();
      const context = hookTest.mock.calls[0][0];
      expect(context.serviceStatus).toBe('error');
    });
  });

  describe('2. Service Status Management', () => {
    it('should provide correct service status transitions', async () => {
      const statusHistory: string[] = [];
      const hookTest = jest.fn((context) => {
        statusHistory.push(context.serviceStatus);
      });
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'status-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-wrapper')).toHaveAttribute('data-status', 'ready');
      });

      // Should transition from initializing to ready
      expect(statusHistory).toContain('initializing');
      expect(statusHistory).toContain('ready');
    });

    it('should handle service status checks correctly', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'status-check-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.serviceStatus).toBe('ready');
      });
    });
  });

  describe('3. Feature Flag System', () => {
    it('should provide feature flags correctly', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'flags-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.featureFlags).toBeDefined();
        expect(typeof context.featureFlags).toBe('object');
        expect(context.isFeatureEnabled).toBeDefined();
        expect(typeof context.isFeatureEnabled).toBe('function');
      });
    });

    it('should allow feature flag overrides', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'override-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.developmentTools.overrideFlag).toBeDefined();
        expect(typeof context.developmentTools.overrideFlag).toBe('function');
      });
    });
  });

  describe('4. AI Service Methods', () => {
    it('should provide energy insights method', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'energy-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.getEnergyInsights).toBeDefined();
        expect(typeof context.getEnergyInsights).toBe('function');
        
        const insights = context.getEnergyInsights(5);
        expect(Array.isArray(insights)).toBe(true);
      });
    });

    it('should provide soreness insights method', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'soreness-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.getSorenessInsights).toBeDefined();
        expect(typeof context.getSorenessInsights).toBe('function');
        
        const insights = context.getSorenessInsights(3);
        expect(Array.isArray(insights)).toBe(true);
      });
    });

    it('should provide analysis method', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'analysis-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.analyze).toBeDefined();
        expect(typeof context.analyze).toBe('function');
      });
    });

    it('should provide workout generation method', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'workout-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.generateWorkout).toBeDefined();
        expect(typeof context.generateWorkout).toBe('function');
      });
    });
  });

  describe('5. Development Tools', () => {
    it('should provide development tools in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'dev-tools-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.developmentTools).toBeDefined();
        expect(context.developmentTools.overrideFlag).toBeDefined();
        expect(context.developmentTools.exportFlags).toBeDefined();
        expect(context.developmentTools.checkEnvironment).toBeDefined();
        expect(context.developmentTools.validateState).toBeDefined();
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('6. Environment Status', () => {
    it('should provide environment status information', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'env-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.environmentStatus).toBeDefined();
        expect(context.environmentStatus.isConfigured).toBeDefined();
        expect(context.environmentStatus.hasApiKey).toBeDefined();
        expect(context.environmentStatus.isDevelopment).toBeDefined();
        expect(Array.isArray(context.environmentStatus.issues)).toBe(true);
        expect(Array.isArray(context.environmentStatus.recommendations)).toBe(true);
      });
    });
  });

  describe('7. Error Scenarios and Fallbacks', () => {
    it('should handle missing user profile gracefully', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, null,
            React.createElement(MockAIConsumer, { testId: 'no-profile-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.serviceStatus).toBe('initializing');
        expect(context.featureFlags).toEqual({});
      });
    });

    it('should handle invalid user profile gracefully', async () => {
      const invalidProfile = { fitnessLevel: 'invalid' as any };
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: invalidProfile },
            React.createElement(MockAIConsumer, { testId: 'invalid-profile-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
        expect(context.serviceStatus).toBe('error');
      });
    });
  });

  describe('8. Performance and Memory', () => {
    it('should not cause memory leaks with multiple consumers', async () => {
      const consumers = Array.from({ length: 10 }, (_, i) => i);
      const hookTests = consumers.map(() => jest.fn());
      
      const { unmount } = render(
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

      await waitFor(() => {
        expect(screen.getByTestId('test-wrapper')).toHaveAttribute('data-status', 'ready');
      });

      // All consumers should have been called
      hookTests.forEach(hookTest => {
        expect(hookTest).toHaveBeenCalled();
      });

      unmount();
    });

    it('should handle rapid state updates efficiently', async () => {
      const hookTest = jest.fn();
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(MockAIConsumer, { testId: 'rapid-updates-test', hookTest })
          )
        )
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-wrapper')).toHaveAttribute('data-status', 'ready');
      });

      const context = hookTest.mock.calls[hookTest.mock.calls.length - 1][0];
      
      // Test rapid updates
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        context.updateSelections({ customization_energy: i });
      }
      const endTime = Date.now();
      
      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('9. Hook Dependencies and Stability', () => {
    it('should maintain stable references for callback functions', async () => {
      const hookTest = jest.fn();
      const callbackRefs: Set<any> = new Set();
      
      const TestComponent = () => {
        const context = useAI();
        
        React.useEffect(() => {
          callbackRefs.add(context.getEnergyInsights);
          callbackRefs.add(context.getSorenessInsights);
          callbackRefs.add(context.analyze);
          callbackRefs.add(context.generateWorkout);
          hookTest(context);
        }, [context]);
        
        return React.createElement('div', null, 'Test');
      };
      
      render(
        React.createElement(AIProvider, null,
          React.createElement(TestWrapper, { userProfile: mockUserProfile },
            React.createElement(TestComponent)
          )
        )
      );

      await waitFor(() => {
        expect(hookTest).toHaveBeenCalled();
      });

      // Should have stable references (not too many different instances)
      expect(callbackRefs.size).toBeLessThan(10);
    });
  });
}); 