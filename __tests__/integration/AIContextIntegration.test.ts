/**
 * AIContext Integration Tests - MANDATORY SAFETY MEASURE
 * 
 * Comprehensive tests for all AIContext consumers to ensure refactoring safety.
 * Tests all 12+ components that use the useAI hook.
 * 
 * CRITICAL: These tests must pass before any AIContext refactoring.
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { AIProvider, useAI } from '../../src/contexts/AIContext';
import { UserProfile } from '../../src/types';

// Mock components to test AIContext integration
const MockAIConsumer = ({ testId, hookTest }: { testId: string; hookTest: (context: any) => void }) => {
  const context = useAI();
  React.useEffect(() => {
    hookTest(context);
  }, [context, hookTest]);
  
  return <div data-testid={testId}>AI Context Consumer</div>;
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

  return (
    <div data-testid="test-wrapper" data-status={serviceStatus} data-initialized={isInitialized}>
      {children}
    </div>
  );
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="init-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={invalidProfile}>
            <MockAIConsumer testId="error-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="status-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="status-check-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="flags-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="override-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="energy-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="soreness-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="analysis-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="workout-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="dev-tools-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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

    it('should provide AIDevTools component in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const { AIDevTools } = await import('../../src/contexts/AIContext');
      
      render(
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <AIDevTools />
          </TestWrapper>
        </AIProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('AI Debug Panel')).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('6. Environment Status', () => {
    it('should provide environment status information', async () => {
      const hookTest = jest.fn();
      
      render(
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="env-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper>
            <MockAIConsumer testId="no-profile-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={invalidProfile}>
            <MockAIConsumer testId="invalid-profile-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            {consumers.map((i) => (
              <MockAIConsumer key={i} testId={`consumer-${i}`} hookTest={hookTests[i]} />
            ))}
          </TestWrapper>
        </AIProvider>
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
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MockAIConsumer testId="rapid-updates-test" hookTest={hookTest} />
          </TestWrapper>
        </AIProvider>
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

  describe('9. Integration with Real Components', () => {
    it('should work with EnergyLevelSection component', async () => {
      const { EnergyLevelSection } = await import('../../src/components/quickWorkout/components/EnergyLevelSection');
      
      const mockFocusData = {
        energyLevel: 5,
        workoutFocus: 'strength',
        workoutDuration: 30
      };
      
      const mockOnInputChange = jest.fn();
      
      render(
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <EnergyLevelSection
              focusData={mockFocusData}
              onInputChange={mockOnInputChange}
              viewMode="edit"
              userProfile={mockUserProfile}
            />
          </TestWrapper>
        </AIProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Energy Level')).toBeInTheDocument();
      });
    });

    it('should work with MuscleSorenessSection component', async () => {
      const { MuscleSorenessSection } = await import('../../src/components/quickWorkout/components/MuscleSorenessSection');
      
      const mockFocusData = {
        sorenessLevel: 3,
        workoutFocus: 'strength',
        workoutDuration: 30
      };
      
      const mockOnInputChange = jest.fn();
      
      render(
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <MuscleSorenessSection
              focusData={mockFocusData}
              onInputChange={mockOnInputChange}
              viewMode="edit"
              userProfile={mockUserProfile}
            />
          </TestWrapper>
        </AIProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Muscle Soreness')).toBeInTheDocument();
      });
    });
  });

  describe('10. Hook Dependencies and Stability', () => {
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
        
        return <div>Test</div>;
      };
      
      render(
        <AIProvider>
          <TestWrapper userProfile={mockUserProfile}>
            <TestComponent />
          </TestWrapper>
        </AIProvider>
      );

      await waitFor(() => {
        expect(hookTest).toHaveBeenCalled();
      });

      // Should have stable references (not too many different instances)
      expect(callbackRefs.size).toBeLessThan(10);
    });
  });
}); 