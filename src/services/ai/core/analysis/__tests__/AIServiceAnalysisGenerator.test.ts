import { AIServiceAnalysisGenerator } from '../AIServiceAnalysisGenerator';
import { 
  UnifiedAIAnalysis, 
  CrossComponentConflict,
  GlobalAIContext 
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

describe('AIServiceAnalysisGenerator', () => {
  let generator: AIServiceAnalysisGenerator;
  let mockDomainServices: Map<string, any>;
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

    generator = new AIServiceAnalysisGenerator(mockDomainServices);

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

  describe('generateAnalysis', () => {
    it('should generate complete analysis with insights and conflicts', async () => {
      const analysis = await generator.generateAnalysis(mockSelections, mockContext);

      expect(analysis).toHaveProperty('id');
      expect(analysis).toHaveProperty('timestamp');
      expect(analysis).toHaveProperty('insights');
      expect(analysis).toHaveProperty('crossComponentConflicts');
      expect(analysis).toHaveProperty('recommendations');
      expect(analysis).toHaveProperty('confidence');
      expect(analysis).toHaveProperty('reasoning');

      // Check insights structure
      expect(analysis.insights).toHaveProperty('energy');
      expect(analysis.insights).toHaveProperty('soreness');
      expect(analysis.insights).toHaveProperty('focus');
      expect(analysis.insights).toHaveProperty('duration');
      expect(analysis.insights).toHaveProperty('equipment');

      // Check that domain services were called
      expect(mockDomainServices.get('energy')?.analyze).toHaveBeenCalledWith(5, mockContext);
      expect(mockDomainServices.get('soreness')?.analyze).toHaveBeenCalledWith(['legs', 'back'], mockContext);
      expect(mockDomainServices.get('crossComponent')?.detectConflicts).toHaveBeenCalledWith(mockSelections, mockContext);
    });

    it('should handle domain service errors gracefully', async () => {
      // Make energy service throw an error
      mockDomainServices.get('energy')!.analyze = jest.fn().mockRejectedValue(new Error('Energy service error'));

      // Should fail since errors now bubble up
      await expect(generator.generateAnalysis(mockSelections, mockContext)).rejects.toThrow('Energy service error');
    });

    it('should handle missing cross-component service', async () => {
      mockDomainServices.delete('crossComponent');

      const analysis = await generator.generateAnalysis(mockSelections, mockContext);

      expect(analysis.crossComponentConflicts).toEqual([]);
    });

    it('should handle domain services without analyze method', async () => {
      // Replace energy service with one that has generateInsights instead
      mockDomainServices.set('energy', {
        generateInsights: jest.fn().mockResolvedValue([
          { id: 'energy-1', type: 'info', message: 'Energy analysis', actionable: true, confidence: 0.8 }
        ])
      });

      const analysis = await generator.generateAnalysis(mockSelections, mockContext);

      expect(analysis.insights.energy).toHaveLength(1);
    });

    it('should handle domain services with no analysis methods', async () => {
      // Replace energy service with one that has no analysis methods
      mockDomainServices.set('energy', {});

      const analysis = await generator.generateAnalysis(mockSelections, mockContext);

      expect(analysis.insights.energy).toEqual([]);
    });
  });

  describe('validateAnalysis', () => {
    it('should validate correct analysis structure', () => {
      const validAnalysis: UnifiedAIAnalysis = {
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
        confidence: 0.8,
        reasoning: 'Test reasoning',
        performanceMetrics: {
          totalExecutionTime: 100,
          cacheHitRate: 0.5,
          memoryPeakUsage: 1024
        }
      };

      expect(generator.validateAnalysis(validAnalysis)).toBe(true);
    });

    it('should reject analysis with missing required fields', () => {
      const invalidAnalysis = {
        id: 'test-id',
        timestamp: new Date(),
        // Missing insights, conflicts, recommendations, etc.
      } as UnifiedAIAnalysis;

      expect(generator.validateAnalysis(invalidAnalysis)).toBe(false);
    });

    it('should reject analysis with invalid insights structure', () => {
      const invalidAnalysis: UnifiedAIAnalysis = {
        id: 'test-id',
        timestamp: new Date(),
        insights: {
          energy: 'not an array' as any,
          soreness: [],
          focus: [],
          duration: [],
          equipment: []
        },
        crossComponentConflicts: [],
        recommendations: [],
        confidence: 0.8,
        reasoning: 'Test reasoning',
        performanceMetrics: {
          totalExecutionTime: 100,
          cacheHitRate: 0.5,
          memoryPeakUsage: 1024
        }
      };

      expect(generator.validateAnalysis(invalidAnalysis)).toBe(false);
    });

    it('should reject analysis with invalid confidence', () => {
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

      expect(generator.validateAnalysis(invalidAnalysis)).toBe(false);
    });
  });

  describe('getAnalysisSummary', () => {
    it('should return analysis summary', () => {
      const analysis: UnifiedAIAnalysis = {
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
          { id: 'rec-1', priority: 'critical', category: 'safety', targetComponent: 'energy', title: 'test', description: 'test', reasoning: 'test', confidence: 0.9, risk: 'high' }
        ],
        confidence: 0.8,
        reasoning: 'Test reasoning',
        performanceMetrics: {
          totalExecutionTime: 100,
          cacheHitRate: 0.5,
          memoryPeakUsage: 1024
        }
      };

      const summary = generator.getAnalysisSummary(analysis);

      expect(summary.id).toBe('test-id');
      expect(summary.insightCount).toBe(2);
      expect(summary.conflictCount).toBe(1);
      expect(summary.recommendationCount).toBe(1);
      expect(summary.confidence).toBe(0.8);
      expect(summary.domains).toEqual(['energy', 'soreness']);
    });
  });

  describe('isAnalysisRecent', () => {
    it('should return true for recent analysis', () => {
      const recentAnalysis: UnifiedAIAnalysis = {
        id: 'test-id',
        timestamp: new Date(), // Now
        insights: { energy: [], soreness: [], focus: [], duration: [], equipment: [] },
        crossComponentConflicts: [],
        recommendations: [],
        confidence: 0.8,
        reasoning: 'Test',
        performanceMetrics: { totalExecutionTime: 0, cacheHitRate: 0, memoryPeakUsage: 0 }
      };

      expect(generator.isAnalysisRecent(recentAnalysis)).toBe(true);
    });

    it('should return false for old analysis', () => {
      const oldAnalysis: UnifiedAIAnalysis = {
        id: 'test-id',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        insights: { energy: [], soreness: [], focus: [], duration: [], equipment: [] },
        crossComponentConflicts: [],
        recommendations: [],
        confidence: 0.8,
        reasoning: 'Test',
        performanceMetrics: { totalExecutionTime: 0, cacheHitRate: 0, memoryPeakUsage: 0 }
      };

      expect(generator.isAnalysisRecent(oldAnalysis, 5 * 60 * 1000)).toBe(false); // 5 minute window
    });
  });

  describe('domain service management', () => {
    it('should get domain service health status', () => {
      // Add health status methods to mock services
      mockDomainServices.get('energy')!.getHealthStatus = jest.fn().mockReturnValue('healthy');
      mockDomainServices.get('soreness')!.getHealthStatus = jest.fn().mockReturnValue('degraded');

      const health = generator.getDomainServiceHealth();

      expect(health.energy).toBe('healthy');
      expect(health.soreness).toBe('degraded');
      expect(health.focus).toBe('healthy'); // Default for services without health method
    });

    it('should handle health check errors', () => {
      mockDomainServices.get('energy')!.getHealthStatus = jest.fn().mockImplementation(() => {
        throw new Error('Health check failed');
      });

      const health = generator.getDomainServiceHealth();

      expect(health.energy).toBe('unhealthy');
    });

    it('should update domain services', () => {
      const newServices = new Map([
        ['newDomain', { analyze: jest.fn() }]
      ]);

      generator.updateDomainServices(newServices);

      expect(generator.getAvailableDomains()).toEqual(['newDomain']);
    });

    it('should check if domain service is available', () => {
      expect(generator.hasDomainService('energy')).toBe(true);
      expect(generator.hasDomainService('nonexistent')).toBe(false);
    });

    it('should get available domains', () => {
      const domains = generator.getAvailableDomains();

      expect(domains).toContain('energy');
      expect(domains).toContain('soreness');
      expect(domains).toContain('focus');
      expect(domains).toContain('duration');
      expect(domains).toContain('equipment');
      expect(domains).toContain('crossComponent');
    });
  });
}); 