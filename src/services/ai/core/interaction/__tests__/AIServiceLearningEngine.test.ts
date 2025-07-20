import { AIServiceLearningEngine } from '../AIServiceLearningEngine';
import { AIInteraction } from '../../types/AIServiceTypes';

describe('AIServiceLearningEngine', () => {
  let learningEngine: AIServiceLearningEngine;

  beforeEach(() => {
    learningEngine = new AIServiceLearningEngine();
  });

  describe('constructor', () => {
    it('should initialize learning engine', () => {
      expect(learningEngine).toBeInstanceOf(AIServiceLearningEngine);
    });

    it('should initialize with empty learning data', () => {
      const metrics = learningEngine.getLearningMetrics();
      expect(metrics.totalLearningEvents).toBe(0);
      expect(metrics.positiveFeedbackCount).toBe(0);
      expect(metrics.negativeFeedbackCount).toBe(0);
    });
  });

  describe('updateRecommendationWeights', () => {
    const validInteraction: AIInteraction = {
      id: 'test-interaction-1',
      timestamp: new Date(),
      component: 'test-component',
      action: 'recommendation_shown',
      recommendationId: 'rec-1',
      userFeedback: 'helpful'
    };

    it('should update weights for helpful feedback', () => {
      learningEngine.updateRecommendationWeights(validInteraction);
      
      const weight = learningEngine.getRecommendationWeight('rec-1');
      expect(weight).toBeGreaterThan(1.0); // Should increase from default 1.0
    });

    it('should update weights for not helpful feedback', () => {
      const notHelpfulInteraction: AIInteraction = {
        ...validInteraction,
        userFeedback: 'not_helpful'
      };
      
      learningEngine.updateRecommendationWeights(notHelpfulInteraction);
      
      const weight = learningEngine.getRecommendationWeight('rec-1');
      expect(weight).toBeLessThan(1.0); // Should decrease from default 1.0
    });

    it('should update weights for partially helpful feedback', () => {
      const partiallyHelpfulInteraction: AIInteraction = {
        ...validInteraction,
        userFeedback: 'partially_helpful'
      };
      
      learningEngine.updateRecommendationWeights(partiallyHelpfulInteraction);
      
      const weight = learningEngine.getRecommendationWeight('rec-1');
      expect(weight).toBeGreaterThan(1.0); // Should increase slightly
    });

    it('should handle interaction without feedback', () => {
      const noFeedbackInteraction: AIInteraction = {
        id: 'test-interaction-2',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown'
        // No userFeedback
      };
      
      learningEngine.updateRecommendationWeights(noFeedbackInteraction);
      
      const metrics = learningEngine.getLearningMetrics();
      expect(metrics.totalLearningEvents).toBe(0); // Should not count as learning event
    });

    it('should handle interaction without recommendation ID', () => {
      const noRecIdInteraction: AIInteraction = {
        id: 'test-interaction-3',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        userFeedback: 'helpful'
        // No recommendationId
      };
      
      learningEngine.updateRecommendationWeights(noRecIdInteraction);
      
      const metrics = learningEngine.getLearningMetrics();
      expect(metrics.totalLearningEvents).toBe(0); // Should not count as learning event
    });

    it('should cap weights at maximum value', () => {
      // Add multiple helpful feedbacks to increase weight
      for (let i = 0; i < 20; i++) {
        learningEngine.updateRecommendationWeights({
          ...validInteraction,
          id: `test-${i}`
        });
      }
      
      const weight = learningEngine.getRecommendationWeight('rec-1');
      expect(weight).toBeLessThanOrEqual(2.0); // Should be capped at 2.0
    });

    it('should floor weights at minimum value', () => {
      // Add multiple not helpful feedbacks to decrease weight
      for (let i = 0; i < 20; i++) {
        learningEngine.updateRecommendationWeights({
          ...validInteraction,
          userFeedback: 'not_helpful',
          id: `test-${i}`
        });
      }
      
      const weight = learningEngine.getRecommendationWeight('rec-1');
      expect(weight).toBeGreaterThanOrEqual(0.1); // Should be floored at 0.1
    });

    it('should update metrics correctly', () => {
      const helpfulInteraction: AIInteraction = {
        ...validInteraction,
        userFeedback: 'helpful'
      };
      
      const notHelpfulInteraction: AIInteraction = {
        ...validInteraction,
        recommendationId: 'rec-2',
        userFeedback: 'not_helpful'
      };
      
      learningEngine.updateRecommendationWeights(helpfulInteraction);
      learningEngine.updateRecommendationWeights(notHelpfulInteraction);
      
      const metrics = learningEngine.getLearningMetrics();
      expect(metrics.totalLearningEvents).toBe(2);
      expect(metrics.positiveFeedbackCount).toBe(1);
      expect(metrics.negativeFeedbackCount).toBe(1);
    });
  });

  describe('learnFromUserFeedback', () => {
    it('should learn from helpful feedback', () => {
      learningEngine.learnFromUserFeedback('helpful', {
        recommendationId: 'rec-1',
        component: 'test-component'
      });
      
      const metrics = learningEngine.getLearningMetrics();
      expect(metrics.totalLearningEvents).toBe(1);
      expect(metrics.positiveFeedbackCount).toBe(1);
    });

    it('should learn from not helpful feedback', () => {
      learningEngine.learnFromUserFeedback('not_helpful', {
        recommendationId: 'rec-1',
        component: 'test-component'
      });
      
      const metrics = learningEngine.getLearningMetrics();
      expect(metrics.totalLearningEvents).toBe(1);
      expect(metrics.negativeFeedbackCount).toBe(1);
    });

    it('should learn from partially helpful feedback', () => {
      learningEngine.learnFromUserFeedback('partially_helpful', {
        recommendationId: 'rec-1',
        component: 'test-component'
      });
      
      const metrics = learningEngine.getLearningMetrics();
      expect(metrics.totalLearningEvents).toBe(1);
      expect(metrics.positiveFeedbackCount).toBe(0.5);
    });

    it('should update user preferences when user profile is provided', () => {
      const userProfile = {
        fitnessLevel: 'intermediate',
        goals: ['strength', 'endurance'],
        experience: 'some experience',
        preferences: { intensity: 'moderate' }
      };
      
      learningEngine.learnFromUserFeedback('helpful', {
        recommendationId: 'rec-1',
        component: 'test-component',
        userProfile
      });
      
      const preferences = learningEngine.getUserPreferences();
      expect(preferences.size).toBeGreaterThan(0);
    });

    it('should throw error for invalid feedback', () => {
      expect(() => {
        learningEngine.learnFromUserFeedback('invalid' as any, {
          recommendationId: 'rec-1',
          component: 'test-component'
        });
      }).toThrow();
    });
  });

  describe('getLearningMetrics', () => {
    it('should return initial metrics', () => {
      const metrics = learningEngine.getLearningMetrics();
      expect(metrics).toEqual({
        totalLearningEvents: 0,
        positiveFeedbackCount: 0,
        negativeFeedbackCount: 0,
        recommendationImprovementRate: 0,
        lastLearningUpdate: expect.any(Date)
      });
    });

    it('should return copy of metrics', () => {
      const metrics1 = learningEngine.getLearningMetrics();
      const metrics2 = learningEngine.getLearningMetrics();
      
      expect(metrics1).toEqual(metrics2);
      expect(metrics1).not.toBe(metrics2); // Should be different references
    });
  });

  describe('getRecommendationWeight', () => {
    it('should return default weight for unknown recommendation', () => {
      const weight = learningEngine.getRecommendationWeight('unknown-rec');
      expect(weight).toBe(1.0);
    });

    it('should return updated weight for known recommendation', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful'
      };
      
      learningEngine.updateRecommendationWeights(interaction);
      
      const weight = learningEngine.getRecommendationWeight('rec-1');
      expect(weight).toBeGreaterThan(1.0);
    });
  });

  describe('getAllRecommendationWeights', () => {
    it('should return empty map initially', () => {
      const weights = learningEngine.getAllRecommendationWeights();
      expect(weights.size).toBe(0);
    });

    it('should return copy of weights map', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful'
      };
      
      learningEngine.updateRecommendationWeights(interaction);
      
      const weights1 = learningEngine.getAllRecommendationWeights();
      const weights2 = learningEngine.getAllRecommendationWeights();
      
      expect(weights1).toEqual(weights2);
      expect(weights1).not.toBe(weights2); // Should be different references
    });
  });

  describe('getUserPreferences', () => {
    it('should return empty map initially', () => {
      const preferences = learningEngine.getUserPreferences();
      expect(preferences.size).toBe(0);
    });

    it('should return copy of preferences map', () => {
      const userProfile = {
        fitnessLevel: 'beginner',
        goals: ['weight loss'],
        experience: 'new to exercise',
        preferences: { intensity: 'low' }
      };
      
      learningEngine.learnFromUserFeedback('helpful', {
        recommendationId: 'rec-1',
        component: 'test-component',
        userProfile
      });
      
      const preferences1 = learningEngine.getUserPreferences();
      const preferences2 = learningEngine.getUserPreferences();
      
      expect(preferences1).toEqual(preferences2);
      expect(preferences1).not.toBe(preferences2); // Should be different references
    });
  });

  describe('getFeedbackHistory', () => {
    it('should return empty array initially', () => {
      const history = learningEngine.getFeedbackHistory();
      expect(history).toEqual([]);
    });

    it('should return copy of feedback history', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful'
      };
      
      learningEngine.updateRecommendationWeights(interaction);
      
      const history1 = learningEngine.getFeedbackHistory();
      const history2 = learningEngine.getFeedbackHistory();
      
      expect(history1).toEqual(history2);
      expect(history1).not.toBe(history2); // Should be different references
    });

    it('should record feedback history correctly', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful'
      };
      
      learningEngine.updateRecommendationWeights(interaction);
      
      const history = learningEngine.getFeedbackHistory();
      expect(history).toHaveLength(1);
      expect(history[0].recommendationId).toBe('rec-1');
      expect(history[0].feedback).toBe('helpful');
    });
  });

  describe('getLearningInsights', () => {
    it('should return initial insights', () => {
      const insights = learningEngine.getLearningInsights();
      expect(insights.topPerformingRecommendations).toEqual([]);
      expect(insights.needsImprovement).toEqual([]);
      expect(insights.overallSatisfaction).toBe(0);
      expect(insights.learningTrend).toBe('stable');
    });

    it('should return insights for multiple recommendations', () => {
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
          recommendationId: 'rec-2',
          userFeedback: 'not_helpful'
        },
        {
          id: 'test-3',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          recommendationId: 'rec-3',
          userFeedback: 'helpful'
        }
      ];
      
      interactions.forEach(interaction => {
        learningEngine.updateRecommendationWeights(interaction);
      });
      
      const insights = learningEngine.getLearningInsights();
      expect(insights.topPerformingRecommendations.length).toBeGreaterThan(0);
      expect(insights.needsImprovement.length).toBeGreaterThan(0);
      expect(insights.overallSatisfaction).toBeGreaterThan(0);
    });
  });

  describe('resetLearningData', () => {
    it('should reset all learning data', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful'
      };
      
      learningEngine.updateRecommendationWeights(interaction);
      expect(learningEngine.getLearningMetrics().totalLearningEvents).toBe(1);
      
      learningEngine.resetLearningData();
      
      expect(learningEngine.getLearningMetrics().totalLearningEvents).toBe(0);
      expect(learningEngine.getAllRecommendationWeights().size).toBe(0);
      expect(learningEngine.getUserPreferences().size).toBe(0);
      expect(learningEngine.getFeedbackHistory()).toEqual([]);
    });
  });

  describe('exportLearningData', () => {
    it('should export learning data', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        recommendationId: 'rec-1',
        userFeedback: 'helpful'
      };
      
      learningEngine.updateRecommendationWeights(interaction);
      
      const exportData = learningEngine.exportLearningData();
      expect(exportData.metrics).toBeDefined();
      expect(exportData.recommendationWeights).toBeDefined();
      expect(exportData.userPreferences).toBeDefined();
      expect(exportData.feedbackHistory).toBeDefined();
      expect(exportData.insights).toBeDefined();
    });

    it('should export empty data when no learning has occurred', () => {
      const exportData = learningEngine.exportLearningData();
      expect(exportData.metrics.totalLearningEvents).toBe(0);
      expect(Object.keys(exportData.recommendationWeights)).toHaveLength(0);
      expect(Object.keys(exportData.userPreferences)).toHaveLength(0);
      expect(exportData.feedbackHistory).toEqual([]);
    });
  });
}); 