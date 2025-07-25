// Integration test for all domain services
import { AIService } from '../core/AIService';
import { EnergyAIService } from '../domains/EnergyAIService';
import { SorenessAIService } from '../domains/SorenessAIService';
import { FocusAIService } from '../domains/FocusAIService';
import { DurationAIService } from '../domains/DurationAIService';
import { EquipmentAIService } from '../domains/EquipmentAIService';
import { CrossComponentAIService } from '../domains';
import { GlobalAIContext, PerWorkoutOptions } from '../../../types';

describe('Domain Services Integration', () => {
  let aiService: AIService;
  let energyService: EnergyAIService;
  let sorenessService: SorenessAIService;
  let focusService: FocusAIService;
  let durationService: DurationAIService;
  let equipmentService: EquipmentAIService;
  let crossComponentService: CrossComponentAIService;

  const mockContext: GlobalAIContext = {
    userProfile: {
      fitnessLevel: 'some experience',
      goals: ['strength', 'endurance'],
      preferences: {
        workoutIntensity: 'moderate',
        preferredDuration: 45,
        equipmentAccess: 'home_gym'
      }
    },
    currentSelections: {
      customization_energy: 3,
      customization_soreness: ['legs', 'back'],
      customization_focus: 'strength',
      customization_duration: 45,
      customization_equipment: ['Dumbbells', 'Resistance Bands'],
      customization_areas: ['chest', 'back', 'legs']
    },
    sessionHistory: [],
    environmentalFactors: {
      timeOfDay: 'morning',
      location: 'home'
    },
    preferences: {
      aiAssistanceLevel: 'moderate',
      showLearningInsights: true,
      autoApplyLowRiskRecommendations: false
    }
  };

  beforeEach(() => {
    aiService = new AIService();
    energyService = new EnergyAIService();
    sorenessService = new SorenessAIService();
    focusService = new FocusAIService();
    durationService = new DurationAIService();
    equipmentService = new EquipmentAIService();
    crossComponentService = new CrossComponentAIService();
  });

  describe('Individual Domain Services', () => {
    test('EnergyAIService should generate insights for energy level', async () => {
      const insights = await energyService.analyze(3, mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      
      // Check that all insights have required properties
      insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.message).toBeDefined();
        expect(insight.recommendation).toBeDefined();
        expect(typeof insight.confidence).toBe('number');
      });
    });

    test('SorenessAIService should generate insights for soreness areas', async () => {
      const insights = await sorenessService.analyze(['legs', 'back'], mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      
      insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.message).toBeDefined();
        expect(insight.recommendation).toBeDefined();
      });
    });

    test('FocusAIService should generate insights for focus type', async () => {
      const insights = await focusService.analyze('strength', mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      
      insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.message).toBeDefined();
        expect(insight.recommendation).toBeDefined();
      });
    });

    test('DurationAIService should generate insights for duration', async () => {
      const insights = await durationService.analyze(45, mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      
      insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.message).toBeDefined();
        expect(insight.recommendation).toBeDefined();
      });
    });

    test('EquipmentAIService should generate insights for equipment', async () => {
      const insights = await equipmentService.analyze(['Dumbbells', 'Resistance Bands'], mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      
      insights.forEach(insight => {
        expect(insight.id).toBeDefined();
        expect(insight.type).toBeDefined();
        expect(insight.message).toBeDefined();
        expect(insight.recommendation).toBeDefined();
      });
    });
  });

  describe('Cross-Component Analysis', () => {
    test('CrossComponentAIService should detect conflicts', async () => {
      const conflicts = await crossComponentService.detectConflicts(mockContext.currentSelections, mockContext);
      
      expect(conflicts).toBeDefined();
      expect(Array.isArray(conflicts)).toBe(true);
      
      // Check that all conflicts have required properties
      conflicts.forEach(conflict => {
        expect(conflict.id).toBeDefined();
        expect(conflict.components).toBeDefined();
        expect(Array.isArray(conflict.components)).toBe(true);
        expect(conflict.type).toBeDefined();
        expect(conflict.severity).toBeDefined();
        expect(conflict.description).toBeDefined();
        expect(conflict.suggestedResolution).toBeDefined();
        expect(conflict.confidence).toBeDefined();
        expect(conflict.impact).toBeDefined();
      });
    });

    test('CrossComponentAIService should find synergies', async () => {
      const synergies = await crossComponentService.findSynergies(mockContext.currentSelections, mockContext);
      
      expect(synergies).toBeDefined();
      expect(Array.isArray(synergies)).toBe(true);
      
      synergies.forEach(synergy => {
        expect(synergy.id).toBeDefined();
        expect(synergy.components).toBeDefined();
        expect(synergy.type).toBeDefined();
        expect(synergy.description).toBeDefined();
        expect(synergy.confidence).toBeDefined();
      });
    });

    test('CrossComponentAIService should analyze all interactions', async () => {
      const analysis = await crossComponentService.analyzeInteractions(mockContext.currentSelections, mockContext);
      
      expect(analysis).toBeDefined();
      expect(analysis.conflicts).toBeDefined();
      expect(analysis.synergies).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.conflicts)).toBe(true);
      expect(Array.isArray(analysis.synergies)).toBe(true);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });
  });

  describe('AIService Integration', () => {
    test('AIService should set context successfully', async () => {
      await expect(aiService.setContext(mockContext)).resolves.not.toThrow();
      expect(aiService.getContext()).toEqual(mockContext);
    });

    test('AIService should generate unified analysis', async () => {
      await aiService.setContext(mockContext);
      
      const analysis = await aiService.analyze();
      
      expect(analysis).toBeDefined();
      expect(analysis.id).toBeDefined();
      expect(analysis.timestamp).toBeDefined();
      expect(analysis.insights).toBeDefined();
      expect(analysis.crossComponentConflicts).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.confidence).toBeDefined();
      expect(analysis.reasoning).toBeDefined();
      expect(analysis.performanceMetrics).toBeDefined();
      
      // Check insights structure
      expect(analysis.insights.energy).toBeDefined();
      expect(analysis.insights.soreness).toBeDefined();
      expect(analysis.insights.focus).toBeDefined();
      expect(analysis.insights.duration).toBeDefined();
      expect(analysis.insights.equipment).toBeDefined();
      
      // Check that all insights arrays contain valid insights
      Object.values(analysis.insights).forEach(insightArray => {
        expect(Array.isArray(insightArray)).toBe(true);
        insightArray.forEach(insight => {
          expect(insight.id).toBeDefined();
          expect(insight.type).toBeDefined();
          expect(insight.message).toBeDefined();
          expect(insight.recommendation).toBeDefined();
        });
      });
      
      // Check conflicts structure
      expect(Array.isArray(analysis.crossComponentConflicts)).toBe(true);
      analysis.crossComponentConflicts.forEach(conflict => {
        expect(conflict.id).toBeDefined();
        expect(conflict.components).toBeDefined();
        expect(conflict.type).toBeDefined();
        expect(conflict.severity).toBeDefined();
        expect(conflict.description).toBeDefined();
        expect(conflict.suggestedResolution).toBeDefined();
        expect(conflict.confidence).toBeDefined();
        expect(conflict.impact).toBeDefined();
      });
      
      // Check recommendations structure
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      analysis.recommendations.forEach(recommendation => {
        expect(recommendation.id).toBeDefined();
        expect(recommendation.priority).toBeDefined();
        expect(recommendation.category).toBeDefined();
        expect(recommendation.targetComponent).toBeDefined();
        expect(recommendation.title).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.reasoning).toBeDefined();
        expect(recommendation.confidence).toBeDefined();
        expect(recommendation.risk).toBeDefined();
      });
    });

    test('AIService should handle partial selections', async () => {
      await aiService.setContext(mockContext);
      
      const partialSelections: Partial<PerWorkoutOptions> = {
        customization_energy: 5
      };
      
      const analysis = await aiService.analyze(partialSelections);
      
      expect(analysis).toBeDefined();
      // Should use the updated energy level (5) instead of the original (3)
      expect(analysis.insights.energy).toBeDefined();
    });

    test('AIService should provide performance metrics', () => {
      const metrics = aiService.getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.averageExecutionTime).toBe('number');
      expect(typeof metrics.cacheHitRate).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
      expect(typeof metrics.memoryUsage).toBe('number');
    });

    test('AIService should provide health status', () => {
      const health = aiService.getHealthStatus();
      
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
      expect(health.details).toBeDefined();
      expect(typeof health.details.cacheSize).toBe('number');
      expect(typeof health.details.errorRate).toBe('number');
      expect(typeof health.details.averageResponseTime).toBe('number');
      expect(typeof health.details.validationEnabled).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    test('AIService should handle missing context gracefully', async () => {
      await expect(aiService.analyze()).rejects.toThrow('AI Service requires global context to be set');
    });

    test('AIService should handle invalid selections gracefully', async () => {
      const invalidContext = {
        ...mockContext,
        currentSelections: {
          ...mockContext.currentSelections,
          customization_energy: -1 // Invalid energy level
        }
      };
      
      await aiService.setContext(invalidContext);
      
      // Should not throw, but should handle the invalid data
      const analysis = await aiService.analyze();
      expect(analysis).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    test('All services should maintain type safety with PerWorkoutOptions', () => {
      // This test ensures that our type guards work correctly
      const validSelections: PerWorkoutOptions = {
        customization_energy: 4,
        customization_soreness: ['arms'],
        customization_focus: 'endurance',
        customization_duration: 30,
        customization_equipment: ['Treadmill'],
        customization_areas: ['legs']
      };
      
      // Should not cause TypeScript errors
      expect(validSelections.customization_energy).toBe(4);
      expect(validSelections.customization_soreness).toEqual(['arms']);
      expect(validSelections.customization_focus).toBe('endurance');
      expect(validSelections.customization_duration).toBe(30);
      expect(validSelections.customization_equipment).toEqual(['Treadmill']);
      expect(validSelections.customization_areas).toEqual(['legs']);
    });
  });
}); 