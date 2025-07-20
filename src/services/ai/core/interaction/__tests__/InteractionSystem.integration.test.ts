import { AIServiceInteractionTracker } from '../AIServiceInteractionTracker';
import { AIServiceLearningEngine } from '../AIServiceLearningEngine';
import { AIInteraction } from '../../types/AIServiceTypes';

describe('Interaction System Integration', () => {
  let tracker: AIServiceInteractionTracker;
  let learningEngine: AIServiceLearningEngine;

  beforeEach(() => {
    tracker = new AIServiceInteractionTracker();
    learningEngine = new AIServiceLearningEngine();
  });

  describe('Interaction Tracking and Learning Collaboration', () => {
    it('should track interactions and learn from them simultaneously', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction-1',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful',
        performanceMetrics: {
          executionTime: 100,
          memoryUsage: 1024,
          cacheHit: true
        }
      };

      // Track the interaction
      tracker.recordInteraction(interaction);
      
      // Learn from the interaction
      learningEngine.updateRecommendationWeights(interaction);

      // Verify both systems recorded the interaction
      const sessionHistory = tracker.getSessionHistory();
      const learningMetrics = learningEngine.getLearningMetrics();
      const recommendationWeight = learningEngine.getRecommendationWeight('rec-1');

      expect(sessionHistory).toHaveLength(1);
      expect(sessionHistory[0]).toEqual(interaction);
      expect(learningMetrics.totalLearningEvents).toBe(1);
      expect(learningMetrics.positiveFeedbackCount).toBe(1);
      expect(recommendationWeight).toBeGreaterThan(1.0);
    });

    it('should maintain consistency between tracking and learning data', () => {
      const interactions: AIInteraction[] = [
        {
          id: 'test-1',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: 'rec-1',
          userFeedback: 'helpful'
        },
        {
          id: 'test-2',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_applied',
          recommendationId: 'rec-2',
          userFeedback: 'not_helpful'
        },
        {
          id: 'test-3',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: 'rec-3',
          userFeedback: 'partially_helpful'
        }
      ];

      // Process all interactions
      interactions.forEach(interaction => {
        tracker.recordInteraction(interaction);
        learningEngine.updateRecommendationWeights(interaction);
      });

      // Verify consistency
      const sessionHistory = tracker.getSessionHistory();
      const learningMetrics = learningEngine.getLearningMetrics();
      const feedbackHistory = learningEngine.getFeedbackHistory();

      expect(sessionHistory).toHaveLength(3);
      expect(learningMetrics.totalLearningEvents).toBe(3);
      expect(feedbackHistory).toHaveLength(3);

      // Verify that all interactions with feedback are in learning history
      const interactionsWithFeedback = interactions.filter(i => i.userFeedback);
      expect(feedbackHistory.length).toBe(interactionsWithFeedback.length);
    });

    it('should handle mixed feedback types correctly', () => {
      const interactions: AIInteraction[] = [
        {
          id: 'test-1',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: 'rec-1',
          userFeedback: 'helpful'
        },
        {
          id: 'test-2',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: 'rec-1', // Same recommendation
          userFeedback: 'not_helpful'
        },
        {
          id: 'test-3',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: 'rec-1', // Same recommendation
          userFeedback: 'helpful'
        }
      ];

      // Process all interactions
      interactions.forEach(interaction => {
        tracker.recordInteraction(interaction);
        learningEngine.updateRecommendationWeights(interaction);
      });

      // Verify the final weight reflects the mixed feedback
      const finalWeight = learningEngine.getRecommendationWeight('rec-1');
      const learningMetrics = learningEngine.getLearningMetrics();

      expect(learningMetrics.totalLearningEvents).toBe(3);
      expect(learningMetrics.positiveFeedbackCount).toBe(2);
      expect(learningMetrics.negativeFeedbackCount).toBe(1);
      
      // The weight should be 1.1 due to mixed feedback (2 helpful, 1 not_helpful)
      expect(finalWeight).toBeCloseTo(1.1, 1);
    });
  });

  describe('Session Management Integration', () => {
    it('should maintain session history when learning occurs', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful'
      };

      tracker.recordInteraction(interaction);
      learningEngine.updateRecommendationWeights(interaction);

      // Clear session history
      tracker.clearSessionHistory();

      // Verify session is cleared but learning data remains
      expect(tracker.getSessionHistory()).toHaveLength(0);
      expect(learningEngine.getLearningMetrics().totalLearningEvents).toBe(1);
      expect(learningEngine.getRecommendationWeight('rec-1')).toBeGreaterThan(1.0);
    });

    it('should handle session history limits correctly', () => {
      const maxHistorySize = 3;
      const limitedTracker = new AIServiceInteractionTracker(maxHistorySize);

      // Add more interactions than the limit
      for (let i = 0; i < 5; i++) {
        const interaction: AIInteraction = {
          id: `test-${i}`,
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: `rec-${i}`,
          userFeedback: 'helpful'
        };

        limitedTracker.recordInteraction(interaction);
        learningEngine.updateRecommendationWeights(interaction);
      }

      // Verify session history is limited but learning data is complete
      const sessionHistory = limitedTracker.getSessionHistory();
      const learningMetrics = learningEngine.getLearningMetrics();

      expect(sessionHistory.length).toBeLessThanOrEqual(maxHistorySize);
      expect(learningMetrics.totalLearningEvents).toBe(5); // All learning events recorded
    });
  });

  describe('Analytics Integration', () => {
    it('should provide comprehensive analytics from both systems', () => {
      const interactions: AIInteraction[] = [
        {
          id: 'test-1',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: 'rec-1',
          userFeedback: 'helpful',
          performanceMetrics: { executionTime: 100, memoryUsage: 1024, cacheHit: true }
        },
        {
          id: 'test-2',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_applied',
          recommendationId: 'rec-2',
          userFeedback: 'not_helpful',
          performanceMetrics: { executionTime: 200, memoryUsage: 2048, cacheHit: false }
        }
      ];

      // Process interactions
      interactions.forEach(interaction => {
        tracker.recordInteraction(interaction);
        learningEngine.updateRecommendationWeights(interaction);
      });

      // Get analytics from both systems
      const interactionStats = tracker.getInteractionStats();
      const learningMetrics = learningEngine.getLearningMetrics();
      const userFeedbackStats = tracker.getUserFeedbackStats();
      const performanceMetrics = tracker.getPerformanceMetrics();
      const learningInsights = learningEngine.getLearningInsights();

      // Verify comprehensive analytics
      expect(interactionStats.totalInteractions).toBe(2);
      expect(learningMetrics.totalLearningEvents).toBe(2);
      expect(userFeedbackStats.totalFeedback).toBe(2);
      expect(performanceMetrics.averageExecutionTime).toBe(150);
      expect(learningInsights.overallSatisfaction).toBeGreaterThan(0);
    });

    it('should export data from both systems correctly', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful'
      };

      tracker.recordInteraction(interaction);
      learningEngine.updateRecommendationWeights(interaction);

      // Export data from both systems
      const sessionData = tracker.exportSessionData();
      const learningData = learningEngine.exportLearningData();

      // Verify exported data
      expect(sessionData.totalInteractions).toBe(1);
      expect(sessionData.interactions).toHaveLength(1);
      expect(learningData.metrics.totalLearningEvents).toBe(1);
      expect(learningData.recommendationWeights['rec-1']).toBeGreaterThan(1.0);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle errors gracefully in both systems', () => {
      const invalidInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component'
        // Missing required 'action' field
      } as any;

      // Should not throw errors, but should handle gracefully
      expect(() => tracker.recordInteraction(invalidInteraction)).toThrow();
      
      // Learning engine should handle missing data gracefully
      const noFeedbackInteraction: AIInteraction = {
        id: 'test-interaction-2',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown'
        // No userFeedback or recommendationId
      };

      expect(() => learningEngine.updateRecommendationWeights(noFeedbackInteraction)).not.toThrow();
    });

    it('should maintain system stability during errors', () => {
      const validInteraction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful'
      };

      // Process valid interaction first
      tracker.recordInteraction(validInteraction);
      learningEngine.updateRecommendationWeights(validInteraction);

      // Verify systems are working
      expect(tracker.getSessionHistory()).toHaveLength(1);
      expect(learningEngine.getLearningMetrics().totalLearningEvents).toBe(1);

      // Try to process invalid interaction
      const invalidInteraction = {
        id: 'test-interaction-2',
        timestamp: new Date(),
        component: 'test-component'
        // Missing required fields
      } as any;

      expect(() => tracker.recordInteraction(invalidInteraction)).toThrow();

      // Verify systems are still stable
      expect(tracker.getSessionHistory()).toHaveLength(1);
      expect(learningEngine.getLearningMetrics().totalLearningEvents).toBe(1);
    });
  });

  describe('Performance Integration', () => {
    it('should handle high-volume interactions efficiently', () => {
      const startTime = Date.now();
      
      // Process many interactions
      for (let i = 0; i < 100; i++) {
        const interaction: AIInteraction = {
          id: `test-${i}`,
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: `rec-${i % 10}`, // 10 different recommendations
          userFeedback: i % 3 === 0 ? 'helpful' : i % 3 === 1 ? 'not_helpful' : 'partially_helpful'
        };

        tracker.recordInteraction(interaction);
        learningEngine.updateRecommendationWeights(interaction);
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify all interactions were processed
      expect(tracker.getSessionHistory()).toHaveLength(100);
      expect(learningEngine.getLearningMetrics().totalLearningEvents).toBe(100);

      // Verify performance is reasonable (should complete in under 1 second)
      expect(processingTime).toBeLessThan(1000);
    });

    it('should maintain performance with session history limits', () => {
      const limitedTracker = new AIServiceInteractionTracker(10);

      const startTime = Date.now();
      
      // Process more interactions than the limit
      for (let i = 0; i < 1000; i++) {
        const interaction: AIInteraction = {
          id: `test-${i}`,
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: `rec-${i}`,
          userFeedback: 'helpful'
        };

        limitedTracker.recordInteraction(interaction);
        learningEngine.updateRecommendationWeights(interaction);
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify session history is limited
      expect(limitedTracker.getSessionHistory().length).toBeLessThanOrEqual(10);
      
      // Verify all learning events were recorded
      expect(learningEngine.getLearningMetrics().totalLearningEvents).toBe(1000);

      // Verify performance is reasonable
      expect(processingTime).toBeLessThan(2000);
    });
  });
}); 