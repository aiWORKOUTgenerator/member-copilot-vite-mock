import { AIServiceAnalyzer } from '../AIServiceAnalyzer';
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

describe('AIServiceAnalyzer', () => {
  let analyzer: AIServiceAnalyzer;
  let mockDomainServices: Map<string, any>;
  let mockConfig: AIServiceConfig;
  let mockContext: GlobalAIContext;
  let mockSelections: PerWorkoutOptions;

  beforeEach(() => {
    // Create mock domain services
    mockDomainServices = new Map([
      ['energy', {
        analyze: jest.fn().mockResolvedValue([
          { id: 'energy-1', type: 'info', message: 'Energy analysis', actionable: true, confidence: 0.8 }
        ])
      }],
      ['soreness', {
        analyze: jest.fn().mockResolvedValue([
          { id: 'soreness-1', type: 'warning', message: 'Soreness detected', actionable: true, confidence: 0.9 }
        ])
      }],
      ['focus', {
        analyze: jest.fn().mockResolvedValue([])
      }],
      ['duration', {
        analyze: jest.fn().mockResolvedValue([])
      }],
      ['equipment', {
        analyze: jest.fn().mockResolvedValue([])
      }],
      ['crossComponent', {
        detectConflicts: jest.fn().mockResolvedValue([
          {
            id: 'conflict-1',
            components: ['energy', 'duration'],
            type: 'safety',
            severity: 'critical',
            description: 'Test conflict',
            suggestedResolution: 'Test resolution',
            confidence: 0.9,
            impact: 'safety'
          }
        ])
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

    analyzer = new AIServiceAnalyzer(mockDomainServices, mockConfig);

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
        customization_energy: 5,
        customization_soreness: ['legs', 'back'],
        customization_focus: 'strength',
        customization_duration: 30,
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
      customization_energy: 5,
      customization_soreness: ['legs', 'back'],
      customization_focus: 'strength',
      customization_duration: 30,
      customization_equipment: ['dumbbells'],
      customization_areas: ['upper body']
    };
  });

  describe('analyze', () => {
    it('should perform complete analysis with recommendations', async () => {
      const analysis = await analyzer.analyze({}, mockContext);

      expect(analysis).toHaveProperty('id');
      expect(analysis).toHaveProperty('timestamp');
      expect(analysis).toHaveProperty('insights');
      expect(analysis).toHaveProperty('crossComponentConflicts');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis).toHaveProperty('confidence');
      expect(analysis).toHaveProperty('reasoning');

      // Should have recommendations generated
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(analysis.reasoning).toBeTruthy();
    });

    it('should merge partial selections with context selections', async () => {
      const partialSelections = {
        customization_energy: 8,
        customization_duration: 45
      };

      const analysis = await analyzer.analyze(partialSelections, mockContext);

      // Should use merged selections (context + partial)
      expect(mockDomainServices.get('energy')?.analyze).toHaveBeenCalledWith(8, mockContext);
    });

    it('should throw error when context is not provided', async () => {
      await expect(analyzer.analyze({}, null as any)).rejects.toThrow('AI Service requires global context to be set');
    });

    it('should handle domain service errors gracefully', async () => {
      // Make energy service throw an error
      mockDomainServices.get('energy')!.analyze = jest.fn().mockRejectedValue(new Error('Energy service error'));

      // Should fail after max retries since the error is persistent
      await expect(analyzer.analyze({}, mockContext)).rejects.toThrow('Energy service error');
    });

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

    it('should fail after max retries', async () => {
      mockDomainServices.get('energy')!.analyze = jest.fn().mockRejectedValue(new Error('Persistent error'));

      await expect(analyzer.analyze({}, mockContext)).rejects.toThrow('Persistent error');
    });
  });

  describe('getAnalysisSummary', () => {
    it('should return comprehensive analysis summary', () => {
      const mockAnalysis: UnifiedAIAnalysis = {
        id: 'test-id',
        timestamp: new Date(),
        insights: {
          energy: [{ id: '1', type: 'info', message: 'test', actionable: true, confidence: 0.8 }],
          soreness: [{ id: '2', type: 'warning', message: 'test', actionable: true, confidence: 0.9 }],
          focus: [],
          duration: [],
          equipment: []
        },
        crossComponentConflicts: [
          { id: 'conflict-1', components: ['energy'], type: 'safety', severity: 'critical', description: 'test', suggestedResolution: 'test', confidence: 0.9, impact: 'safety' }
        ],
        recommendations: [
          { id: 'rec-1', priority: 'critical', category: 'safety', targetComponent: 'energy', title: 'test', description: 'test', reasoning: 'test', confidence: 0.9, risk: 'high' },
          { id: 'rec-2', priority: 'high', category: 'optimization', targetComponent: 'soreness', title: 'test', description: 'test', reasoning: 'test', confidence: 0.7, risk: 'medium' }
        ],
        confidence: 0.8,
        reasoning: 'Test reasoning',
        performanceMetrics: {
          totalExecutionTime: 100,
          cacheHitRate: 0.5,
          memoryPeakUsage: 1024
        }
      };

      const summary = analyzer.getAnalysisSummary(mockAnalysis);

      expect(summary.id).toBe('test-id');
      expect(summary.insightCount).toBe(2);
      expect(summary.conflictCount).toBe(1);
      expect(summary.recommendationCount).toBe(2);
      expect(summary.confidence).toBe(0.8);
      expect(summary.domains).toEqual(['energy', 'soreness']);
      expect(summary.criticalRecommendations).toBe(1);
      expect(summary.highPriorityRecommendations).toBe(1);
    });
  });

  describe('validateAnalysis', () => {
    it('should validate correct analysis', () => {
      const validAnalysis: UnifiedAIAnalysis = {
        id: 'test-id',
        timestamp: new Date(),
        insights: {
          energy: [{ id: '1', type: 'info', message: 'test', actionable: true, confidence: 0.8 }],
          soreness: [],
          focus: [],
          duration: [],
          equipment: []
        },
        crossComponentConflicts: [],
        recommendations: [
          { id: 'rec-1', priority: 'high', category: 'safety', targetComponent: 'energy', title: 'test', description: 'test', reasoning: 'test', confidence: 0.8, risk: 'medium' }
        ],
        confidence: 0.8,
        reasoning: 'Test reasoning',
        performanceMetrics: {
          totalExecutionTime: 100,
          cacheHitRate: 0.5,
          memoryPeakUsage: 1024
        }
      };

      const result = analyzer.validateAnalysis(validAnalysis);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect validation errors', () => {
      const invalidAnalysis: UnifiedAIAnalysis = {
        id: 'test-id',
        timestamp: new Date(),
        insights: {
          energy: [],
          soreness: [],
          focus: [],
          duration: [],
          equipment: []
        },
        crossComponentConflicts: [],
        recommendations: [],
        confidence: 1.5, // Invalid: > 1
        reasoning: 'Test reasoning',
        performanceMetrics: {
          totalExecutionTime: 100,
          cacheHitRate: 0.5,
          memoryPeakUsage: 1024
        }
      };

      const result = analyzer.validateAnalysis(invalidAnalysis);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Confidence must be between 0 and 1');
      expect(result.warnings).toContain('No insights generated');
    });

    it('should detect warnings for critical conflicts', () => {
      const analysisWithConflicts: UnifiedAIAnalysis = {
        id: 'test-id',
        timestamp: new Date(),
        insights: {
          energy: [{ id: '1', type: 'info', message: 'test', actionable: true, confidence: 0.8 }],
          soreness: [],
          focus: [],
          duration: [],
          equipment: []
        },
        crossComponentConflicts: [
          { id: 'conflict-1', components: ['energy'], type: 'safety', severity: 'critical', description: 'test', suggestedResolution: 'test', confidence: 0.9, impact: 'safety' }
        ],
        recommendations: [],
        confidence: 0.8,
        reasoning: 'Test reasoning',
        performanceMetrics: {
          totalExecutionTime: 100,
          cacheHitRate: 0.5,
          memoryPeakUsage: 1024
        }
      };

      const result = analyzer.validateAnalysis(analysisWithConflicts);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('1 critical conflicts detected');
    });
  });

  describe('domain service management', () => {
    it('should get domain service health status', () => {
      // Add health status methods to mock services
      mockDomainServices.get('energy')!.getHealthStatus = jest.fn().mockReturnValue('healthy');
      mockDomainServices.get('soreness')!.getHealthStatus = jest.fn().mockReturnValue('degraded');

      const health = analyzer.getDomainServiceHealth();

      expect(health.energy).toBe('healthy');
      expect(health.soreness).toBe('degraded');
    });

    it('should check if all domain services are healthy', () => {
      // Add health status methods to mock services
      mockDomainServices.get('energy')!.getHealthStatus = jest.fn().mockReturnValue('healthy');
      mockDomainServices.get('soreness')!.getHealthStatus = jest.fn().mockReturnValue('healthy');

      expect(analyzer.areDomainServicesHealthy()).toBe(true);
    });

    it('should detect unhealthy services', () => {
      // Add health status methods to mock services
      mockDomainServices.get('energy')!.getHealthStatus = jest.fn().mockReturnValue('unhealthy');
      mockDomainServices.get('soreness')!.getHealthStatus = jest.fn().mockReturnValue('healthy');

      expect(analyzer.areDomainServicesHealthy()).toBe(false);
    });

    it('should get performance metrics', () => {
      const metrics = analyzer.getPerformanceMetrics();

      expect(metrics).toHaveProperty('generatorHealth');
      expect(metrics).toHaveProperty('availableDomains');
      expect(metrics).toHaveProperty('totalDomainServices');
      expect(metrics).toHaveProperty('healthyServices');
      expect(metrics.totalDomainServices).toBe(6);
    });
  });

  describe('configuration management', () => {
    it('should update configuration', () => {
      const newConfig = { maxRetries: 5 };
      analyzer.updateConfig(newConfig);

      const currentConfig = analyzer.getConfig();
      expect(currentConfig.maxRetries).toBe(5);
      expect(currentConfig.enableValidation).toBe(true); // Other config should remain unchanged
    });

    it('should get current configuration', () => {
      const config = analyzer.getConfig();

      expect(config).toEqual(mockConfig);
    });
  });

  describe('domain service updates', () => {
    it('should update domain services', () => {
      const newServices = new Map([
        ['newDomain', { analyze: jest.fn() }]
      ]);

      analyzer.updateDomainServices(newServices);

      expect(analyzer.getAvailableDomains()).toEqual(['newDomain']);
      expect(analyzer.hasDomainService('newDomain')).toBe(true);
      expect(analyzer.hasDomainService('energy')).toBe(false);
    });

    it('should check if domain service is available', () => {
      expect(analyzer.hasDomainService('energy')).toBe(true);
      expect(analyzer.hasDomainService('nonexistent')).toBe(false);
    });

    it('should get available domains', () => {
      const domains = analyzer.getAvailableDomains();

      expect(domains).toContain('energy');
      expect(domains).toContain('soreness');
      expect(domains).toContain('focus');
      expect(domains).toContain('duration');
      expect(domains).toContain('equipment');
      expect(domains).toContain('crossComponent');
    });
  });

  describe('component access', () => {
    it('should provide access to recommendation engine', () => {
      const recommendationEngine = analyzer.getRecommendationEngine();
      expect(recommendationEngine).toBeDefined();
      expect(typeof recommendationEngine.generatePrioritizedRecommendations).toBe('function');
    });

    it('should provide access to analysis generator', () => {
      const analysisGenerator = analyzer.getAnalysisGenerator();
      expect(analysisGenerator).toBeDefined();
      expect(typeof analysisGenerator.generateAnalysis).toBe('function');
    });
  });
}); 