import { AIServiceRecommendationEngine } from '../AIServiceRecommendationEngine';
import { 
  PrioritizedRecommendation, 
  CrossComponentConflict,
  UnifiedAIAnalysis 
} from '../../types/AIServiceTypes';
import { AIInsight } from '../../../../../types/insights';

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

describe('AIServiceRecommendationEngine', () => {
  let engine: AIServiceRecommendationEngine;

  beforeEach(() => {
    engine = new AIServiceRecommendationEngine();
  });

  describe('generatePrioritizedRecommendations', () => {
    it('should generate recommendations from conflicts and insights', async () => {
      const mockInsights: UnifiedAIAnalysis['insights'] = {
        energy: [
          {
            id: 'energy-1',
            type: 'warning',
            message: 'Energy level is too low for intense workout',
            recommendation: 'Consider a lighter workout',
            actionable: true,
            confidence: 0.8
          }
        ],
        soreness: [],
        focus: [],
        duration: [],
        equipment: []
      };

      const mockConflicts: CrossComponentConflict[] = [
        {
          id: 'conflict-1',
          components: ['energy', 'duration'],
          type: 'safety',
          severity: 'critical',
          description: 'High intensity workout with low energy',
          suggestedResolution: 'Reduce workout intensity',
          confidence: 0.9,
          impact: 'safety'
        }
      ];

      const recommendations = await engine.generatePrioritizedRecommendations(mockInsights, mockConflicts);

      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].priority).toBe('critical'); // Conflict should be first
      expect(recommendations[1].priority).toBe('high'); // Warning insight should be high
    });

    it('should handle empty insights and conflicts', async () => {
      const mockInsights: UnifiedAIAnalysis['insights'] = {
        energy: [],
        soreness: [],
        focus: [],
        duration: [],
        equipment: []
      };

      const recommendations = await engine.generatePrioritizedRecommendations(mockInsights, []);

      expect(recommendations).toHaveLength(0);
    });

    it('should sort recommendations by priority and confidence', async () => {
      const mockInsights: UnifiedAIAnalysis['insights'] = {
        energy: [
          {
            id: 'energy-1',
            type: 'info',
            message: 'Energy level is moderate',
            recommendation: 'Good for moderate workout',
            actionable: true,
            confidence: 0.6
          }
        ],
        soreness: [],
        focus: [],
        duration: [],
        equipment: []
      };

      const mockConflicts: CrossComponentConflict[] = [
        {
          id: 'conflict-1',
          components: ['energy'],
          type: 'efficiency',
          severity: 'medium',
          description: 'Suboptimal energy usage',
          suggestedResolution: 'Optimize workout timing',
          confidence: 0.7,
          impact: 'performance'
        }
      ];

      const recommendations = await engine.generatePrioritizedRecommendations(mockInsights, mockConflicts);

      expect(recommendations[0].priority).toBe('high'); // Conflict (medium severity -> high priority)
      expect(recommendations[1].priority).toBe('medium'); // Info insight
    });
  });

  describe('calculateOverallConfidence', () => {
    it('should calculate average confidence from insights and recommendations', () => {
      const mockInsights: UnifiedAIAnalysis['insights'] = {
        energy: [
          { id: '1', type: 'info', message: 'test', actionable: true, confidence: 0.8 },
          { id: '2', type: 'info', message: 'test', actionable: true, confidence: 0.6 }
        ],
        soreness: [],
        focus: [],
        duration: [],
        equipment: []
      };

      const mockRecommendations: PrioritizedRecommendation[] = [
        {
          id: 'rec-1',
          priority: 'high',
          category: 'safety',
          targetComponent: 'energy',
          title: 'Test',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          risk: 'medium'
        }
      ];

      const confidence = engine.calculateOverallConfidence(mockInsights, mockRecommendations);

      // (0.8 + 0.6 + 0.9) / 3 = 0.767
      expect(confidence).toBeCloseTo(0.767, 2);
    });

    it('should handle undefined confidence values', () => {
      const mockInsights: UnifiedAIAnalysis['insights'] = {
        energy: [
          { id: '1', type: 'info', message: 'test', actionable: true, confidence: undefined }
        ],
        soreness: [],
        focus: [],
        duration: [],
        equipment: []
      };

      const confidence = engine.calculateOverallConfidence(mockInsights, []);

      // Should default to 0.5 for undefined confidence
      expect(confidence).toBe(0.5);
    });

    it('should return 0.5 for empty inputs', () => {
      const mockInsights: UnifiedAIAnalysis['insights'] = {
        energy: [],
        soreness: [],
        focus: [],
        duration: [],
        equipment: []
      };

      const confidence = engine.calculateOverallConfidence(mockInsights, []);

      expect(confidence).toBe(0.5);
    });
  });

  describe('generateReasoning', () => {
    it('should generate reasoning from conflicts and recommendations', () => {
      const mockInsights: UnifiedAIAnalysis['insights'] = {
        energy: [{ id: '1', type: 'info', message: 'test', actionable: true, confidence: 0.8 }],
        soreness: [],
        focus: [],
        duration: [],
        equipment: []
      };

      const mockConflicts: CrossComponentConflict[] = [
        {
          id: 'conflict-1',
          components: ['energy'],
          type: 'safety',
          severity: 'critical',
          description: 'Test conflict',
          suggestedResolution: 'Test resolution',
          confidence: 0.9,
          impact: 'safety'
        }
      ];

      const mockRecommendations: PrioritizedRecommendation[] = [
        {
          id: 'rec-1',
          priority: 'critical',
          category: 'safety',
          targetComponent: 'energy',
          title: 'Test',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          risk: 'high'
        }
      ];

      const reasoning = engine.generateReasoning(mockInsights, mockConflicts, mockRecommendations);

      expect(reasoning).toContain('Detected 1 cross-component issue(s)');
      expect(reasoning).toContain('1 critical recommendation(s)');
      expect(reasoning).toContain('Analysis based on energy parameters');
    });

    it('should handle empty inputs gracefully', () => {
      const mockInsights: UnifiedAIAnalysis['insights'] = {
        energy: [],
        soreness: [],
        focus: [],
        duration: [],
        equipment: []
      };

      const reasoning = engine.generateReasoning(mockInsights, [], []);

      expect(reasoning).toBe('Comprehensive analysis completed successfully.');
    });
  });

  describe('filtering methods', () => {
    let mockRecommendations: PrioritizedRecommendation[];

    beforeEach(() => {
      mockRecommendations = [
        {
          id: 'rec-1',
          priority: 'critical',
          category: 'safety',
          targetComponent: 'energy',
          title: 'Critical Safety Issue',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.9,
          risk: 'high'
        },
        {
          id: 'rec-2',
          priority: 'high',
          category: 'optimization',
          targetComponent: 'duration',
          title: 'Optimization Opportunity',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.7,
          risk: 'medium'
        },
        {
          id: 'rec-3',
          priority: 'medium',
          category: 'education',
          targetComponent: 'equipment',
          title: 'Educational Content',
          description: 'Test',
          reasoning: 'Test',
          confidence: 0.5,
          risk: 'low'
        }
      ];
    });

    it('should filter by priority', () => {
      const critical = engine.filterByPriority(mockRecommendations, 'critical');
      expect(critical).toHaveLength(1);
      expect(critical[0].priority).toBe('critical');
    });

    it('should filter by category', () => {
      const safety = engine.filterByCategory(mockRecommendations, 'safety');
      expect(safety).toHaveLength(1);
      expect(safety[0].category).toBe('safety');
    });

    it('should filter by target component', () => {
      const energy = engine.getRecommendationsForComponent(mockRecommendations, 'energy');
      expect(energy).toHaveLength(1);
      expect(energy[0].targetComponent).toBe('energy');
    });
  });

  describe('validation methods', () => {
    it('should validate correct recommendation structure', () => {
      const validRecommendation: PrioritizedRecommendation = {
        id: 'test',
        priority: 'high',
        category: 'safety',
        targetComponent: 'energy',
        title: 'Test',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.8,
        risk: 'medium'
      };

      expect(engine.validateRecommendation(validRecommendation)).toBe(true);
    });

    it('should reject invalid recommendation structure', () => {
      const invalidRecommendation = {
        id: 'test',
        priority: 'high',
        // Missing required fields
      } as PrioritizedRecommendation;

      expect(engine.validateRecommendation(invalidRecommendation)).toBe(false);
    });

    it('should reject recommendation with invalid confidence', () => {
      const invalidRecommendation: PrioritizedRecommendation = {
        id: 'test',
        priority: 'high',
        category: 'safety',
        targetComponent: 'energy',
        title: 'Test',
        description: 'Test',
        reasoning: 'Test',
        confidence: 1.5, // Invalid: > 1
        risk: 'medium'
      };

      expect(engine.validateRecommendation(invalidRecommendation)).toBe(false);
    });

    it('should validate list of recommendations', () => {
      const validRecommendation: PrioritizedRecommendation = {
        id: 'test',
        priority: 'high',
        category: 'safety',
        targetComponent: 'energy',
        title: 'Test',
        description: 'Test',
        reasoning: 'Test',
        confidence: 0.8,
        risk: 'medium'
      };

      const invalidRecommendation = {
        id: 'test2',
        priority: 'high',
        // Missing required fields
      } as PrioritizedRecommendation;

      const result = engine.validateRecommendations([validRecommendation, invalidRecommendation]);

      expect(result.valid).toHaveLength(1);
      expect(result.invalid).toHaveLength(1);
      expect(result.valid[0]).toBe(validRecommendation);
      expect(result.invalid[0]).toBe(invalidRecommendation);
    });
  });
}); 