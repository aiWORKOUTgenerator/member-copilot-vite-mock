import { AIServiceInteractionTracker } from '../AIServiceInteractionTracker';
import { AIInteraction } from '../../types/AIServiceTypes';

describe('AIServiceInteractionTracker', () => {
  let tracker: AIServiceInteractionTracker;

  beforeEach(() => {
    tracker = new AIServiceInteractionTracker();
  });

  describe('constructor', () => {
    it('should initialize with default max history size', () => {
      expect(tracker).toBeInstanceOf(AIServiceInteractionTracker);
    });

    it('should initialize with custom max history size', () => {
      const customTracker = new AIServiceInteractionTracker(500);
      expect(customTracker).toBeInstanceOf(AIServiceInteractionTracker);
    });
  });

  describe('recordInteraction', () => {
    const validInteraction: AIInteraction = {
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

    it('should record a valid interaction', () => {
      tracker.recordInteraction(validInteraction);
      const history = tracker.getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(validInteraction);
    });

    it('should update statistics when recording interaction', () => {
      tracker.recordInteraction(validInteraction);
      const stats = tracker.getInteractionStats();
      expect(stats.totalInteractions).toBe(1);
      expect(stats.interactionsByType['recommendation_shown']).toBe(1);
    });

    it('should handle interaction without performance metrics', () => {
      const interactionWithoutMetrics: AIInteraction = {
        id: 'test-interaction-2',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_dismissed'
      };
      
      tracker.recordInteraction(interactionWithoutMetrics);
      const history = tracker.getSessionHistory();
      expect(history).toHaveLength(1);
    });

    it('should handle interaction without user feedback', () => {
      const interactionWithoutFeedback: AIInteraction = {
        id: 'test-interaction-3',
        timestamp: new Date(),
        component: 'test-component',
        action: 'error_occurred',
        errorDetails: {
          message: 'Test error',
          stack: 'Error stack'
        }
      };
      
      tracker.recordInteraction(interactionWithoutFeedback);
      const history = tracker.getSessionHistory();
      expect(history).toHaveLength(1);
    });

    it('should throw error for invalid interaction', () => {
      const invalidInteraction = {
        id: 'test-interaction-4',
        timestamp: new Date(),
        component: 'test-component'
        // Missing required 'action' field
      } as any;

      expect(() => tracker.recordInteraction(invalidInteraction)).toThrow();
    });

    it('should limit session history size', () => {
      const maxHistorySize = 5;
      const limitedTracker = new AIServiceInteractionTracker(maxHistorySize);
      
      // Add more interactions than the limit
      for (let i = 0; i < 10; i++) {
        limitedTracker.recordInteraction({
          id: `test-interaction-${i}`,
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown'
        });
      }
      
      const history = limitedTracker.getSessionHistory();
      expect(history.length).toBeLessThanOrEqual(maxHistorySize);
    });
  });

  describe('getSessionHistory', () => {
    it('should return empty array initially', () => {
      const history = tracker.getSessionHistory();
      expect(history).toEqual([]);
    });

    it('should return copy of session history', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown'
      };
      
      tracker.recordInteraction(interaction);
      const history1 = tracker.getSessionHistory();
      const history2 = tracker.getSessionHistory();
      
      expect(history1).toEqual(history2);
      expect(history1).not.toBe(history2); // Should be different references
    });
  });

  describe('clearSessionHistory', () => {
    it('should clear session history', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown'
      };
      
      tracker.recordInteraction(interaction);
      expect(tracker.getSessionHistory()).toHaveLength(1);
      
      tracker.clearSessionHistory();
      expect(tracker.getSessionHistory()).toHaveLength(0);
    });

    it('should reset statistics when clearing history', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown'
      };
      
      tracker.recordInteraction(interaction);
      expect(tracker.getInteractionStats().totalInteractions).toBe(1);
      
      tracker.clearSessionHistory();
      expect(tracker.getInteractionStats().totalInteractions).toBe(0);
    });
  });

  describe('getInteractionStats', () => {
    it('should return initial statistics', () => {
      const stats = tracker.getInteractionStats();
      expect(stats).toEqual({
        totalInteractions: 0,
        interactionsByType: {},
        averageResponseTime: 0,
        userSatisfactionRate: 0
      });
    });

    it('should return copy of statistics', () => {
      const stats1 = tracker.getInteractionStats();
      const stats2 = tracker.getInteractionStats();
      
      expect(stats1).toEqual(stats2);
      expect(stats1).not.toBe(stats2); // Should be different references
    });

    it('should calculate correct statistics for multiple interactions', () => {
      const interactions: AIInteraction[] = [
        {
          id: 'test-1',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          userFeedback: 'helpful',
          performanceMetrics: { executionTime: 100, memoryUsage: 1024, cacheHit: true }
        },
        {
          id: 'test-2',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_applied',
          userFeedback: 'not_helpful',
          performanceMetrics: { executionTime: 200, memoryUsage: 2048, cacheHit: false }
        },
        {
          id: 'test-3',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          userFeedback: 'partially_helpful',
          performanceMetrics: { executionTime: 150, memoryUsage: 1536, cacheHit: true }
        }
      ];
      
      interactions.forEach(interaction => tracker.recordInteraction(interaction));
      
      const stats = tracker.getInteractionStats();
      expect(stats.totalInteractions).toBe(3);
      expect(stats.interactionsByType['recommendation_shown']).toBe(2);
      expect(stats.interactionsByType['recommendation_applied']).toBe(1);
      expect(stats.averageResponseTime).toBe(150); // (100 + 200 + 150) / 3
    });
  });

  describe('getInteractionsByType', () => {
    it('should return interactions of specific type', () => {
      const interactions: AIInteraction[] = [
        {
          id: 'test-1',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown'
        },
        {
          id: 'test-2',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_applied'
        },
        {
          id: 'test-3',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown'
        }
      ];
      
      interactions.forEach(interaction => tracker.recordInteraction(interaction));
      
      const shownInteractions = tracker.getInteractionsByType('recommendation_shown');
      expect(shownInteractions).toHaveLength(2);
      expect(shownInteractions.every(i => i.action === 'recommendation_shown')).toBe(true);
    });

    it('should return empty array for non-existent type', () => {
      const interactions = tracker.getInteractionsByType('non_existent_type');
      expect(interactions).toEqual([]);
    });
  });

  describe('getRecentInteractions', () => {
    it('should return recent interactions', () => {
      const interactions: AIInteraction[] = [
        {
          id: 'test-1',
          timestamp: new Date(Date.now() - 1000),
          component: 'test-component',
          action: 'recommendation_shown'
        },
        {
          id: 'test-2',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_applied'
        }
      ];
      
      interactions.forEach(interaction => tracker.recordInteraction(interaction));
      
      const recent = tracker.getRecentInteractions(1);
      expect(recent).toHaveLength(1);
      expect(recent[0].id).toBe('test-2');
    });

    it('should return default number of recent interactions', () => {
      for (let i = 0; i < 15; i++) {
        tracker.recordInteraction({
          id: `test-${i}`,
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown'
        });
      }
      
      const recent = tracker.getRecentInteractions();
      expect(recent).toHaveLength(10); // Default is 10
    });
  });

  describe('getUserFeedbackStats', () => {
    it('should return correct feedback statistics', () => {
      const interactions: AIInteraction[] = [
        {
          id: 'test-1',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          userFeedback: 'helpful'
        },
        {
          id: 'test-2',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          userFeedback: 'not_helpful'
        },
        {
          id: 'test-3',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          userFeedback: 'partially_helpful'
        },
        {
          id: 'test-4',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          userFeedback: 'helpful'
        }
      ];
      
      interactions.forEach(interaction => tracker.recordInteraction(interaction));
      
      const feedbackStats = tracker.getUserFeedbackStats();
      expect(feedbackStats.totalFeedback).toBe(4);
      expect(feedbackStats.helpful).toBe(2);
      expect(feedbackStats.notHelpful).toBe(1);
      expect(feedbackStats.partiallyHelpful).toBe(1);
      expect(feedbackStats.satisfactionRate).toBe(0.625); // (2 + 0.5) / 4
    });

    it('should handle no feedback', () => {
      const feedbackStats = tracker.getUserFeedbackStats();
      expect(feedbackStats.totalFeedback).toBe(0);
      expect(feedbackStats.satisfactionRate).toBe(0);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics from interactions', () => {
      const interactions: AIInteraction[] = [
        {
          id: 'test-1',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          performanceMetrics: { executionTime: 100, memoryUsage: 1024, cacheHit: true }
        },
        {
          id: 'test-2',
          timestamp: new Date(),
          component: 'test-component',
          action: 'recommendation_shown',
          performanceMetrics: { executionTime: 200, memoryUsage: 2048, cacheHit: false }
        },
        {
          id: 'test-3',
          timestamp: new Date(),
          component: 'test-component',
          action: 'error_occurred' // No performance metrics
        }
      ];
      
      interactions.forEach(interaction => tracker.recordInteraction(interaction));
      
      const performanceMetrics = tracker.getPerformanceMetrics();
      expect(performanceMetrics.averageExecutionTime).toBe(150); // (100 + 200) / 2
      expect(performanceMetrics.averageMemoryUsage).toBe(1536); // (1024 + 2048) / 2
      expect(performanceMetrics.cacheHitRate).toBe(0.5); // 1 hit out of 2
      expect(performanceMetrics.errorRate).toBe(1/3); // 1 error out of 3 total
    });

    it('should handle no performance metrics', () => {
      const performanceMetrics = tracker.getPerformanceMetrics();
      expect(performanceMetrics.averageExecutionTime).toBe(0);
      expect(performanceMetrics.averageMemoryUsage).toBe(0);
      expect(performanceMetrics.cacheHitRate).toBe(0);
      expect(performanceMetrics.errorRate).toBe(0);
    });
  });

  describe('exportSessionData', () => {
    it('should export session data', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown'
      };
      
      tracker.recordInteraction(interaction);
      
      const sessionData = tracker.exportSessionData();
      expect(sessionData.totalInteractions).toBe(1);
      expect(sessionData.interactions).toHaveLength(1);
      expect(sessionData.sessionId).toBeDefined();
      expect(sessionData.startTime).toEqual(interaction.timestamp);
      expect(sessionData.endTime).toEqual(interaction.timestamp);
    });

    it('should throw error when no session data exists', () => {
      expect(() => tracker.exportSessionData()).toThrow('No session data to export');
    });
  });
}); 