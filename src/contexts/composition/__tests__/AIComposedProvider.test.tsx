import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { AIComposedProvider } from '../AIComposedProvider';
import { useAIService } from '../../../hooks/useAIService';
import { useAIWorkout } from '../../../hooks/useAIWorkout';
import { useAIHealth } from '../../../hooks/useAIHealth';
import { useAIFeatureFlags } from '../AIFeatureFlagsProvider';
import { useAIAnalytics } from '../AIAnalyticsProvider';
import { useAI } from '../../AIContext';
import { mockUserProfile } from '../../../__tests__/mocks/userProfile';
import { mockWorkoutOptions } from '../../../__tests__/mocks/workoutOptions';
import { AIInteractionType } from '../../../types/ai-context.types';

describe('AIComposedProvider Integration', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AIComposedProvider>{children}</AIComposedProvider>
  );

  describe('Provider Composition', () => {
    it('initializes all providers without errors', () => {
      const { result: healthResult } = renderHook(() => useAIHealth(), { wrapper });
      const { result: featureFlagsResult } = renderHook(() => useAIFeatureFlags(), { wrapper });
      const { result: analyticsResult } = renderHook(() => useAIAnalytics(), { wrapper });

      expect(healthResult.current.isHealthy()).toBe(true);
      expect(featureFlagsResult.current.isFeatureEnabled('ai_real_time_insights')).toBeDefined();
      expect(analyticsResult.current.trackAIInteraction).toBeDefined();
    });

    it('maintains provider independence', () => {
      const { result: healthResult } = renderHook(() => useAIHealth(), { wrapper });
      const { result: featureFlagsResult } = renderHook(() => useAIFeatureFlags(), { wrapper });

      // Health provider changes shouldn't affect feature flags
      act(() => {
        healthResult.current.getHealthStatus();
      });
      expect(featureFlagsResult.current.isFeatureEnabled('ai_real_time_insights')).toBeDefined();

      // Feature flag changes shouldn't affect health
      act(() => {
        featureFlagsResult.current.isFeatureEnabled('test_flag');
      });
      expect(healthResult.current.isHealthy()).toBe(true);
    });
  });

  describe('Core Service Integration', () => {
    it('initializes AI service with user profile', async () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
      });

      expect(result.current.currentUserProfile).toEqual(mockUserProfile);
    });

    it('updates selections and maintains state', async () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
        result.current.updateSelections(mockWorkoutOptions);
      });

      expect(result.current.currentSelections).toEqual(mockWorkoutOptions);
    });

    it('analyzes workout options with proper error handling', async () => {
      const { result } = renderHook(() => useAIService(), { wrapper });

      await act(async () => {
        await result.current.initialize(mockUserProfile);
      });

      const analysis = await result.current.analyze(mockWorkoutOptions);
      expect(analysis).toBeDefined();
      expect(analysis?.insights).toBeDefined();
    });
  });

  describe('Workout Generation Integration', () => {
    it('generates workout with analytics tracking', async () => {
      const analyticsTrackSpy = jest.fn();
      const mockAnalytics = {
        trackAIInteraction: analyticsTrackSpy
      };

      jest.spyOn(require('../AIAnalyticsProvider'), 'useAIAnalytics')
        .mockImplementation(() => mockAnalytics);

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      await act(async () => {
        await result.current.generateWorkout(mockWorkoutOptions);
      });

      expect(analyticsTrackSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'workout_request',
          component: 'test-component'
        })
      );
    });

    it('handles workout generation errors gracefully', async () => {
      const mockError = new Error('Generation failed');
      const mockService = {
        generateWorkout: jest.fn().mockRejectedValue(mockError)
      };

      jest.spyOn(require('../../../hooks/useAIService'), 'useAIService')
        .mockImplementation(() => ({
          ...mockService,
          currentUserProfile: mockUserProfile
        }));

      const { result } = renderHook(() => useAIWorkout('test-component'), { wrapper });

      const workout = await result.current.generateWorkout(mockWorkoutOptions);
      expect(workout).toBeNull();
    });
  });

  describe('Type Safety', () => {
    it('enforces proper types for analytics events', async () => {
      const { result } = renderHook(() => useAIAnalytics(), { wrapper });

      // This should type check
      act(() => {
        result.current.trackAIInteraction({
          type: 'workout_request' as AIInteractionType,
          component: 'test',
          data: {
            options: mockWorkoutOptions
          }
        });
      });

      // Invalid type should be caught by TypeScript
      const invalidEvent = {
        type: 'invalid_type',
        component: 'test',
        data: {}
      };
      // @ts-expect-error
      result.current.trackAIInteraction(invalidEvent);
    });

    it('enforces proper types for feature flags', () => {
      const { result } = renderHook(() => useAIFeatureFlags(), { wrapper });

      const flag: boolean = result.current.isFeatureEnabled('ai_real_time_insights');
      expect(typeof flag).toBe('boolean');

      // @ts-expect-error - Invalid flag name
      result.current.isFeatureEnabled(123);
    });

    it('enforces proper types for health status', () => {
      const { result } = renderHook(() => useAIHealth(), { wrapper });

      const status = result.current.getHealthStatus();
      expect(status).toHaveProperty('isHealthy');
      expect(status).toHaveProperty('status');
      expect(typeof status.isHealthy).toBe('boolean');
    });
  });

  describe('AIContext Compatibility', () => {
    it('works alongside existing AIContext', () => {
      const { result: aiContextResult } = renderHook(() => useAI(), { wrapper });
      const { result: aiServiceResult } = renderHook(() => useAIService(), { wrapper });
      const { result: aiHealthResult } = renderHook(() => useAIHealth(), { wrapper });

      expect(aiContextResult.current).toBeDefined();
      expect(aiServiceResult.current).toBeDefined();
      expect(aiHealthResult.current).toBeDefined();
    });

    it('maintains consistent state between contexts', async () => {
      // Set up spies
      const updateSelectionsSpy = jest.spyOn(require('../../AIContext'), 'useAI')
        .mockImplementation(() => ({
          updateSelections: jest.fn(),
          initialize: jest.fn().mockResolvedValue(undefined)
        }));

      const { result: aiContextResult } = renderHook(() => useAI(), { wrapper });
      const { result: aiServiceResult } = renderHook(() => useAIService(), { wrapper });

      // Initialize both contexts
      await act(async () => {
        await aiContextResult.current.initialize(mockUserProfile);
        await aiServiceResult.current.initialize(mockUserProfile);
      });

      // Update selections in AIService
      act(() => {
        aiServiceResult.current.updateSelections(mockWorkoutOptions);
      });

      // Both contexts should reflect the changes
      expect(updateSelectionsSpy).toHaveBeenCalledWith(mockWorkoutOptions);
      expect(aiServiceResult.current.currentSelections).toEqual(mockWorkoutOptions);

      // Clean up
      updateSelectionsSpy.mockRestore();
    });

    it('handles feature flags consistently', () => {
      const { result: aiContextResult } = renderHook(() => useAI(), { wrapper });
      const { result: featureFlagsResult } = renderHook(() => useAIFeatureFlags(), { wrapper });

      const legacyFlag = aiContextResult.current.isFeatureEnabled('ai_real_time_insights');
      const newFlag = featureFlagsResult.current.isFeatureEnabled('ai_real_time_insights');

      expect(legacyFlag).toBe(newFlag);
    });

    it('maintains analytics tracking compatibility', () => {
      const { result: aiContextResult } = renderHook(() => useAI(), { wrapper });
      const { result: analyticsResult } = renderHook(() => useAIAnalytics(), { wrapper });

      const event = {
        type: 'insight_shown' as AIInteractionType,
        component: 'test',
        data: { value: 7 }
      };

      // Both tracking methods should work
      act(() => {
        aiContextResult.current.trackAIInteraction(event);
        analyticsResult.current.trackAIInteraction(event);
      });

      // Verify through analytics provider
      const summary = analyticsResult.current.getAnalyticsSummary();
      expect(summary.interactionCount).toBeGreaterThan(0);
      expect(summary.summary.totalInteractions).toBeGreaterThan(0);
    });

    it('preserves error handling across contexts', async () => {
      const { result: aiContextResult } = renderHook(() => useAI(), { wrapper });
      const { result: aiServiceResult } = renderHook(() => useAIService(), { wrapper });
      const { result: healthResult } = renderHook(() => useAIHealth(), { wrapper });

      // Simulate error in legacy context
      await act(async () => {
        try {
          await aiContextResult.current.analyze({});
        } catch (error) {
          // Expected error
        }
      });

      // Simulate error in new context
      await act(async () => {
        try {
          await aiServiceResult.current.analyze({});
        } catch (error) {
          // Expected error
        }
      });

      // Both errors should be reflected in health monitoring
      const healthStatus = healthResult.current.getHealthStatus();
      expect(healthStatus.status).toBe('error');
    });

    it('maintains development tools functionality', () => {
      const { result: aiContextResult } = renderHook(() => useAI(), { wrapper });
      const { result: healthResult } = renderHook(() => useAIHealth(), { wrapper });

      // Legacy dev tools
      const legacyTools = aiContextResult.current.developmentTools;
      expect(legacyTools).toBeDefined();
      expect(legacyTools.validateState).toBeDefined();

      // New health monitoring
      const healthReport = healthResult.current.getHealthStatus();
      expect(healthReport).toBeDefined();
      expect(healthReport.isHealthy).toBeDefined();
    });
  });
}); 