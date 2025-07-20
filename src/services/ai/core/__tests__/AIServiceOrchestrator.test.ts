import { AIService } from '../AIService';
import { GlobalAIContext, AIInteraction } from '../types/AIServiceTypes';
import { PerWorkoutOptions } from '../../../../types';

describe('AIService Orchestrator', () => {
  let aiService: AIService;
  let mockContext: GlobalAIContext;

  beforeEach(() => {
    aiService = new AIService({
      enableValidation: false,
      enablePerformanceMonitoring: true,
      cacheSize: 100,
      cacheTimeout: 5 * 60 * 1000
    });

    mockContext = {
      userProfile: {
        fitnessLevel: 'intermediate',
        goals: ['strength', 'endurance'],
        age: 30,
        weight: 70,
        height: 175,
        experience: 'some experience'
      },
      currentSelections: {
        customization_energy: 7,
        customization_duration: 45,
        customization_focus: 'strength',
        customization_equipment: ['dumbbells', 'bench'],
        customization_soreness: ['shoulders', 'back']
      },
      sessionHistory: [],
      preferences: {
        aiAssistanceLevel: 'moderate',
        showLearningInsights: true,
        autoApplyLowRiskRecommendations: false
      }
    };
  });

  describe('Component Integration', () => {
    it('should initialize all components correctly', () => {
      expect(aiService).toBeDefined();
      expect(aiService.getContext()).toBeNull();
    });

    it('should set and get context through context component', async () => {
      await aiService.setContext(mockContext);
      const retrievedContext = aiService.getContext();
      
      expect(retrievedContext).toBeDefined();
      expect(retrievedContext?.userProfile.fitnessLevel).toBe('intermediate');
      expect(retrievedContext?.currentSelections.customization_energy).toBe(7);
    });

    it('should record interactions through interaction tracker', () => {
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown',
        performanceMetrics: {
          executionTime: 100,
          memoryUsage: 50,
          cacheHit: false
        }
      };

      aiService.recordInteraction(interaction);
      const stats = aiService.getInteractionStats();
      
      expect(stats.totalInteractions).toBeGreaterThan(0);
    });

    it('should get health status through health checker', () => {
      const healthStatus = aiService.getHealthStatus();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.details).toBeDefined();
    });

    it('should get performance metrics through performance monitor', () => {
      const metrics = aiService.getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.averageExecutionTime).toBe('number');
      expect(typeof metrics.cacheHitRate).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
    });

    it('should export session data', () => {
      const sessionData = aiService.exportSessionData();
      
      expect(sessionData).toBeDefined();
      expect(sessionData.sessionHistory).toBeDefined();
      expect(sessionData.interactionStats).toBeDefined();
      expect(sessionData.performanceMetrics).toBeDefined();
    });

    it('should export learning data', () => {
      const learningData = aiService.exportLearningData();
      
      expect(learningData).toBeDefined();
      expect(learningData.learningMetrics).toBeDefined();
      expect(learningData.sessionHistory).toBeDefined();
    });
  });

  describe('Analysis Workflow', () => {
    beforeEach(async () => {
      await aiService.setContext(mockContext);
    });

    it('should perform analysis with caching', async () => {
      const analysis = await aiService.analyze();
      
      expect(analysis).toBeDefined();
      expect(analysis.id).toBeDefined();
      expect(analysis.timestamp).toBeDefined();
      expect(analysis.insights).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle partial selections', async () => {
      const partialSelections: Partial<PerWorkoutOptions> = {
        customization_energy: 8,
        customization_focus: 'cardio'
      };

      const analysis = await aiService.analyze(partialSelections);
      
      expect(analysis).toBeDefined();
      expect(analysis.insights).toBeDefined();
    });
  });

  describe('External Strategy Integration', () => {
    beforeEach(async () => {
      await aiService.setContext(mockContext);
    });

    it('should set external strategy', () => {
      const mockStrategy = {
        generateWorkout: jest.fn(),
        generateRecommendations: jest.fn(),
        enhanceInsights: jest.fn(),
        analyzeUserPreferences: jest.fn()
      };

      expect(() => aiService.setExternalStrategy(mockStrategy)).not.toThrow();
    });

    it('should handle external strategy methods', async () => {
      const mockStrategy = {
        generateWorkout: jest.fn().mockResolvedValue({ workout: 'mock' }),
        generateRecommendations: jest.fn().mockResolvedValue([]),
        enhanceInsights: jest.fn().mockResolvedValue({ enhanced: true }),
        analyzeUserPreferences: jest.fn().mockResolvedValue({ preferences: 'mock' })
      };

      aiService.setExternalStrategy(mockStrategy);

      // Set context first so the methods work
      await aiService.setContext(mockContext);

      // These should work with the mock strategy
      await expect(aiService.generateWorkout(mockContext.currentSelections)).resolves.toEqual({ workout: 'mock' });
      await expect(aiService.generateRecommendations(mockContext)).resolves.toEqual([]);
      await expect(aiService.enhanceInsights([], mockContext)).resolves.toEqual({ enhanced: true });
      await expect(aiService.analyzeUserPreferences(mockContext)).resolves.toEqual({ preferences: 'mock' });
    });
  });

  describe('Learning and Feedback', () => {
    it('should learn from user feedback', () => {
      expect(() => {
        aiService.learnFromUserFeedback('helpful', {
          recommendationId: 'test-rec',
          component: 'test-component'
        });
      }).not.toThrow();

      const learningMetrics = aiService.getLearningMetrics();
      expect(learningMetrics).toBeDefined();
    });

    it('should clear session history', () => {
      // First record some interactions
      const interaction: AIInteraction = {
        id: 'test-interaction',
        timestamp: new Date(),
        component: 'test-component',
        action: 'recommendation_shown'
      };

      aiService.recordInteraction(interaction);
      
      // Clear history
      aiService.clearSessionHistory();
      
      const sessionHistory = aiService.getSessionHistory();
      expect(sessionHistory).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis without context', async () => {
      await expect(aiService.analyze()).rejects.toThrow('Context not set');
    });

    it('should handle external strategy calls without context', async () => {
      await expect(aiService.generateWorkout({})).rejects.toThrow('Context not set');
    });
  });
}); 