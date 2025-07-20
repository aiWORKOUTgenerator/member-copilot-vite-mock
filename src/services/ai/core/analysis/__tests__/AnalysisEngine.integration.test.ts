import { AIServiceAnalyzer } from '../AIServiceAnalyzer';
import { AIServiceAnalysisGenerator } from '../AIServiceAnalysisGenerator';
import { AIServiceRecommendationEngine } from '../AIServiceRecommendationEngine';
import { 
  UnifiedAIAnalysis, 
  GlobalAIContext,
  AIServiceConfig 
} from '../../types/AIServiceTypes';
import { PerWorkoutOptions } from '../../../../../types';

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.debug = jest.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
});

describe('Analysis Engine Integration', () => {
  let analyzer: AIServiceAnalyzer;
  let generator: AIServiceAnalysisGenerator;
  let recommendationEngine: AIServiceRecommendationEngine;
  let mockDomainServices: Map<string, any>;
  let mockConfig: AIServiceConfig;
  let mockContext: GlobalAIContext;
  let mockSelections: PerWorkoutOptions;

  beforeEach(() => {
    // Create comprehensive mock domain services
    mockDomainServices = new Map([
      ['energy', {
        analyze: jest.fn().mockResolvedValue([
          { 
            id: 'energy-1', 
            type: 'warning', 
            message: 'Energy level is low for intense workout', 
            recommendation: 'Consider reducing workout intensity',
            actionable: true, 
            confidence: 0.85 
          },
          { 
            id: 'energy-2', 
            type: 'info', 
            message: 'Energy level supports moderate activity', 
            recommendation: 'Good for moderate workout',
            actionable: true, 
            confidence: 0.7 
          }
        ]),
        getHealthStatus: jest.fn().mockReturnValue('healthy')
      }],
      ['soreness', {
        analyze: jest.fn().mockResolvedValue([
          { 
            id: 'soreness-1', 
            type: 'warning', 
            message: 'Soreness detected in legs and back', 
            recommendation: 'Focus on upper body or take rest day',
            actionable: true, 
            confidence: 0.9 
          }
        ]),
        getHealthStatus: jest.fn().mockReturnValue('healthy')
      }],
      ['focus', {
        analyze: jest.fn().mockResolvedValue([
          { 
            id: 'focus-1', 
            type: 'info', 
            message: 'Strength focus aligns with user goals', 
            recommendation: 'Continue with strength training',
            actionable: true, 
            confidence: 0.8 
          }
        ]),
        getHealthStatus: jest.fn().mockReturnValue('healthy')
      }],
      ['duration', {
        analyze: jest.fn().mockResolvedValue([
          { 
            id: 'duration-1', 
            type: 'warning', 
            message: '30 minutes may be too short for strength goals', 
            recommendation: 'Consider extending to 45-60 minutes',
            actionable: true, 
            confidence: 0.75 
          }
        ]),
        getHealthStatus: jest.fn().mockReturnValue('healthy')
      }],
      ['equipment', {
        analyze: jest.fn().mockResolvedValue([
          { 
            id: 'equipment-1', 
            type: 'info', 
            message: 'Dumbbells are suitable for strength training', 
            recommendation: 'Good equipment choice',
            actionable: true, 
            confidence: 0.9 
          }
        ]),
        getHealthStatus: jest.fn().mockReturnValue('healthy')
      }],
      ['crossComponent', {
        detectConflicts: jest.fn().mockResolvedValue([
          {
            id: 'conflict-1',
            components: ['energy', 'duration'],
            type: 'safety',
            severity: 'critical',
            description: 'Low energy with short duration may lead to poor form',
            suggestedResolution: 'Increase duration or reduce intensity',
            confidence: 0.95,
            impact: 'safety'
          },
          {
            id: 'conflict-2',
            components: ['soreness', 'focus'],
            type: 'efficiency',
            severity: 'medium',
            description: 'Soreness may limit strength training effectiveness',
            suggestedResolution: 'Consider recovery-focused workout',
            confidence: 0.8,
            impact: 'effectiveness'
          }
        ]),
        getHealthStatus: jest.fn().mockReturnValue('healthy')
      }]
    ]);

    // Create mock config
    mockConfig = {
      enableValidation: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      cacheSize: 100,
      cacheTimeout: 300000, // 5 minutes
      maxRetries: 3,
      fallbackToLegacy: false
    };

    // Create components
    analyzer = new AIServiceAnalyzer(mockDomainServices, mockConfig);
    generator = new AIServiceAnalysisGenerator(mockDomainServices);
    recommendationEngine = new AIServiceRecommendationEngine();

    // Create mock context
    mockContext = {
      userProfile: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        fitnessLevel: 'intermediate',
        goals: ['strength', 'endurance'],
        preferences: {
          workoutDuration: 45,
          preferredExercises: ['squats', 'pushups'],
          equipment: ['dumbbells', 'resistance bands']
        }
      },
      currentSelections: {
        customization_energy: 3, // Low energy
        customization_soreness: ['legs', 'back'],
        customization_focus: 'strength',
        customization_duration: 30, // Short duration
        customization_equipment: ['dumbbells'],
        customization_areas: ['upper body']
      },
      sessionHistory: [],
      preferences: {
        aiAssistanceLevel: 'moderate',
        showLearningInsights: true,
        autoApplyLowRiskRecommendations: false
      }
    };

    // Create mock selections
    mockSelections = {
      customization_energy: 3,
      customization_soreness: ['legs', 'back'],
      customization_focus: 'strength',
      customization_duration: 30,
      customization_equipment: ['dumbbells'],
      customization_areas: ['upper body']
    };
  });

  describe('Complete Analysis Workflow', () => {
    it('should perform end-to-end analysis with all components', async () => {
      const analysis = await analyzer.analyze({}, mockContext);

      // Verify analysis structure
      expect(analysis).toHaveProperty('id');
      expect(analysis).toHaveProperty('timestamp');
      expect(analysis).toHaveProperty('insights');
      expect(analysis).toHaveProperty('crossComponentConflicts');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis).toHaveProperty('confidence');
      expect(analysis).toHaveProperty('reasoning');

      // Verify insights from all domains
      expect(analysis.insights.energy).toHaveLength(2);
      expect(analysis.insights.soreness).toHaveLength(1);
      expect(analysis.insights.focus).toHaveLength(1);
      expect(analysis.insights.duration).toHaveLength(1);
      expect(analysis.insights.equipment).toHaveLength(1);

      // Verify conflicts
      expect(analysis.crossComponentConflicts).toHaveLength(2);

      // Verify recommendations (should be generated from insights + conflicts)
      expect(analysis.recommendations.length).toBeGreaterThan(0);

      // Verify confidence calculation
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);

      // Verify reasoning
      expect(analysis.reasoning).toBeTruthy();
      expect(analysis.reasoning).toContain('cross-component issue');
    });

    it('should prioritize critical conflicts in recommendations', async () => {
      const analysis = await analyzer.analyze({}, mockContext);

      // Find critical recommendations (from conflicts)
      const criticalRecommendations = analysis.recommendations.filter(r => r.priority === 'critical');
      expect(criticalRecommendations.length).toBeGreaterThan(0);

      // Critical recommendations should come first
      const firstRecommendation = analysis.recommendations[0];
      expect(firstRecommendation.priority).toBe('critical');
      expect(firstRecommendation.category).toBe('safety');
    });

    it('should generate actionable recommendations from insights', async () => {
      const analysis = await analyzer.analyze({}, mockContext);

      // All recommendations should be actionable
      analysis.recommendations.forEach(recommendation => {
        expect(recommendation.title).toBeTruthy();
        expect(recommendation.description).toBeTruthy();
        expect(recommendation.reasoning).toBeTruthy();
        expect(recommendation.confidence).toBeGreaterThan(0);
        expect(recommendation.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate reasonable confidence scores', async () => {
      const analysis = await analyzer.analyze({}, mockContext);

      // Confidence should be reasonable (not too low, not too high)
      expect(analysis.confidence).toBeGreaterThan(0.5); // Should be above 50%
      expect(analysis.confidence).toBeLessThan(1.0); // Should not be perfect

      // Confidence should reflect the quality of insights and conflicts
      const insightConfidences = Object.values(analysis.insights)
        .flat()
        .map(i => i.confidence || 0.5);
      const averageInsightConfidence = insightConfidences.reduce((sum, c) => sum + c, 0) / insightConfidences.length;
      
      // Analysis confidence should be close to average insight confidence
      expect(Math.abs(analysis.confidence - averageInsightConfidence)).toBeLessThan(0.2);
    });
  });

  describe('Component Interaction', () => {
    it('should coordinate between generator and recommendation engine', async () => {
      // Test direct component interaction
      const rawAnalysis = await generator.generateAnalysis(mockSelections, mockContext);
      
      const recommendations = await recommendationEngine.generatePrioritizedRecommendations(
        rawAnalysis.insights,
        rawAnalysis.crossComponentConflicts
      );

      const confidence = recommendationEngine.calculateOverallConfidence(
        rawAnalysis.insights,
        recommendations
      );

      const reasoning = recommendationEngine.generateReasoning(
        rawAnalysis.insights,
        rawAnalysis.crossComponentConflicts,
        recommendations
      );

      // Verify the components work together
      expect(rawAnalysis.insights.energy).toHaveLength(2);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(confidence).toBeGreaterThan(0);
      expect(reasoning).toBeTruthy();
    });

    it('should handle component failures gracefully', async () => {
      // Make one domain service fail
      mockDomainServices.get('energy')!.analyze = jest.fn().mockRejectedValue(new Error('Energy service failed'));

      // Should fail after max retries since the error is persistent
      await expect(analyzer.analyze({}, mockContext)).rejects.toThrow('Energy service failed');
    });

    it('should validate analysis at each step', async () => {
      const analysis = await analyzer.analyze({}, mockContext);

      // Validate using the analyzer's validation method
      const validation = analyzer.validateAnalysis(analysis);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Validate using the generator's validation method
      expect(generator.validateAnalysis(analysis)).toBe(true);

      // Validate recommendations
      const { valid, invalid } = recommendationEngine.validateRecommendations(analysis.recommendations);
      expect(invalid).toHaveLength(0);
      expect(valid.length).toBe(analysis.recommendations.length);
    });
  });

  describe('Performance and Health', () => {
    it('should report domain service health correctly', () => {
      const health = analyzer.getDomainServiceHealth();
      
      expect(health.energy).toBe('healthy');
      expect(health.soreness).toBe('healthy');
      expect(health.focus).toBe('healthy');
      expect(health.duration).toBe('healthy');
      expect(health.equipment).toBe('healthy');
      expect(health.crossComponent).toBe('healthy');
    });

    it('should report overall health status', () => {
      expect(analyzer.areDomainServicesHealthy()).toBe(true);
    });

    it('should provide performance metrics', () => {
      const metrics = analyzer.getPerformanceMetrics();
      
      expect(metrics.totalDomainServices).toBe(6);
      expect(metrics.healthyServices).toBe(6);
      expect(metrics.availableDomains).toHaveLength(6);
      expect(metrics.generatorHealth).toBeDefined();
    });

    it('should handle unhealthy services', () => {
      // Make one service unhealthy
      mockDomainServices.get('energy')!.getHealthStatus = jest.fn().mockReturnValue('unhealthy');

      expect(analyzer.areDomainServicesHealthy()).toBe(false);
      
      const health = analyzer.getDomainServiceHealth();
      expect(health.energy).toBe('unhealthy');
      expect(health.soreness).toBe('healthy');
    });
  });

  describe('Configuration and Updates', () => {
    it('should handle configuration updates', () => {
      const newConfig = { maxRetries: 5, enableValidation: false };
      analyzer.updateConfig(newConfig);

      const currentConfig = analyzer.getConfig();
      expect(currentConfig.maxRetries).toBe(5);
      expect(currentConfig.enableValidation).toBe(false);
      expect(currentConfig.enablePerformanceMonitoring).toBe(true); // Should remain unchanged
    });

    it('should handle domain service updates', () => {
      const newServices = new Map([
        ['newDomain', { 
          analyze: jest.fn().mockResolvedValue([]),
          getHealthStatus: jest.fn().mockReturnValue('healthy')
        }]
      ]);

      analyzer.updateDomainServices(newServices);

      expect(analyzer.getAvailableDomains()).toEqual(['newDomain']);
      expect(analyzer.hasDomainService('newDomain')).toBe(true);
      expect(analyzer.hasDomainService('energy')).toBe(false);
    });

    it('should provide access to internal components', () => {
      const internalGenerator = analyzer.getAnalysisGenerator();
      const internalRecommendationEngine = analyzer.getRecommendationEngine();

      expect(internalGenerator).toBeInstanceOf(AIServiceAnalysisGenerator);
      expect(internalRecommendationEngine).toBeInstanceOf(AIServiceRecommendationEngine);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should retry failed operations', async () => {
      let callCount = 0;
      mockDomainServices.get('energy')!.analyze = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary error');
        }
        return Promise.resolve([
          { id: 'energy-1', type: 'info', message: 'Success after retry', actionable: true, confidence: 0.8 }
        ]);
      });

      const analysis = await analyzer.analyze({}, mockContext);

      expect(callCount).toBe(3);
      expect(analysis.insights.energy).toHaveLength(1);
    });

    it('should fail gracefully after max retries', async () => {
      mockDomainServices.get('energy')!.analyze = jest.fn().mockRejectedValue(new Error('Persistent error'));

      await expect(analyzer.analyze({}, mockContext)).rejects.toThrow('Persistent error');
    });

    it('should handle missing services gracefully', async () => {
      mockDomainServices.delete('energy');

      const analysis = await analyzer.analyze({}, mockContext);

      expect(analysis.insights.energy).toEqual([]);
      expect(analysis.insights.soreness).toHaveLength(1); // Other services should still work
    });
  });
}); 