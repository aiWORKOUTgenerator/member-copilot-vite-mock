// Integration test for all domain services
import { describe, it, expect, beforeEach } from '@jest/globals';
import { AIService, GlobalAIContext } from '../core/AIService';
import { EnergyAIService } from '../domains/EnergyAIService';
import { SorenessAIService } from '../domains/SorenessAIService';
import { FocusAIService } from '../domains/FocusAIService';
import { DurationAIService } from '../domains/DurationAIService';
import { EquipmentAIService } from '../domains/EquipmentAIService';
import { CrossComponentAIService } from '../domains/CrossComponentAIService';

describe('Domain Services Integration', () => {
  let aiService: AIService;
  let mockContext: GlobalAIContext;

  beforeEach(() => {
    // Initialize AI service
    aiService = new AIService({
      enableValidation: false,
      enablePerformanceMonitoring: false,
      enableErrorReporting: false
    });

    // Create mock context
    mockContext = {
      userProfile: {
        id: 'test-user',
        fitnessLevel: 'some experience',
        goals: ['strength', 'muscle_building'],
        preferences: {
          workoutStyle: ['strength_training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        }
      },
      currentSelections: {
        customization_energy: 3,
        customization_duration: 45,
        customization_focus: 'strength',
        customization_equipment: ['Dumbbells'],
        customization_areas: ['Upper Body'],
        customization_soreness: []
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
  });

  describe('Individual Domain Services', () => {
    it('should create all domain services successfully', () => {
      const energyService = new EnergyAIService();
      const sorenessService = new SorenessAIService();
      const focusService = new FocusAIService();
      const durationService = new DurationAIService();
      const equipmentService = new EquipmentAIService();
      const crossComponentService = new CrossComponentAIService();

      expect(energyService).toBeDefined();
      expect(sorenessService).toBeDefined();
      expect(focusService).toBeDefined();
      expect(durationService).toBeDefined();
      expect(equipmentService).toBeDefined();
      expect(crossComponentService).toBeDefined();
    });

    it('should generate energy insights', async () => {
      const energyService = new EnergyAIService();
      const insights = await energyService.analyze(3, mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toHaveProperty('id');
      expect(insights[0]).toHaveProperty('type');
      expect(insights[0]).toHaveProperty('message');
      expect(insights[0]).toHaveProperty('confidence');
    });

    it('should generate soreness insights', async () => {
      const sorenessService = new SorenessAIService();
      const insights = await sorenessService.analyze(['Upper Body'], mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toHaveProperty('id');
      expect(insights[0]).toHaveProperty('type');
      expect(insights[0]).toHaveProperty('message');
    });

    it('should generate focus insights', async () => {
      const focusService = new FocusAIService();
      const insights = await focusService.analyze('strength', mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toHaveProperty('confidence');
      expect(insights[0]).toHaveProperty('actionable');
    });

    it('should generate duration insights', async () => {
      const durationService = new DurationAIService();
      const insights = await durationService.analyze(45, mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toHaveProperty('relatedFields');
      expect(insights[0]).toHaveProperty('metadata');
    });

    it('should generate equipment insights', async () => {
      const equipmentService = new EquipmentAIService();
      const insights = await equipmentService.analyze(['Dumbbells'], mockContext);
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toHaveProperty('type');
      expect(insights[0]).toHaveProperty('actionable');
    });

    it('should detect cross-component conflicts', async () => {
      const crossComponentService = new CrossComponentAIService();
      
      // Create a conflicting scenario
      const conflictingOptions = {
        customization_energy: 1, // Very low energy
        customization_duration: 90, // Very long duration
        customization_focus: 'strength' // High intensity focus
      };
      
      const conflicts = await crossComponentService.detectConflicts(conflictingOptions, mockContext);
      
      expect(conflicts).toBeDefined();
      expect(Array.isArray(conflicts)).toBe(true);
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0]).toHaveProperty('components');
      expect(conflicts[0]).toHaveProperty('severity');
      expect(conflicts[0]).toHaveProperty('description');
    });
  });

  describe('Unified AI Service Integration', () => {
    it('should initialize AI service with context', async () => {
      await aiService.setContext(mockContext);
      const context = aiService.getContext();
      
      expect(context).toBeDefined();
      expect(context?.userProfile).toEqual(mockContext.userProfile);
      expect(context?.currentSelections).toEqual(mockContext.currentSelections);
    });

    it('should generate comprehensive analysis', async () => {
      await aiService.setContext(mockContext);
      const analysis = await aiService.analyze();
      
      expect(analysis).toBeDefined();
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
      
      // Verify insights are arrays
      expect(Array.isArray(analysis.insights.energy)).toBe(true);
      expect(Array.isArray(analysis.insights.soreness)).toBe(true);
      expect(Array.isArray(analysis.insights.focus)).toBe(true);
      expect(Array.isArray(analysis.insights.duration)).toBe(true);
      expect(Array.isArray(analysis.insights.equipment)).toBe(true);
    });

    it('should handle partial selections updates', async () => {
      await aiService.setContext(mockContext);
      
      // Update with partial selections
      const analysis = await aiService.analyze({
        customization_energy: 2, // Lower energy
        customization_focus: 'recovery' // Change focus
      });
      
      expect(analysis).toBeDefined();
      expect(analysis.insights.energy.length).toBeGreaterThan(0);
      expect(analysis.insights.focus.length).toBeGreaterThan(0);
    });

    it('should generate prioritized recommendations', async () => {
      await aiService.setContext(mockContext);
      const analysis = await aiService.analyze();
      
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      
      if (analysis.recommendations.length > 0) {
        expect(analysis.recommendations[0]).toHaveProperty('id');
        expect(analysis.recommendations[0]).toHaveProperty('priority');
        expect(analysis.recommendations[0]).toHaveProperty('category');
        expect(analysis.recommendations[0]).toHaveProperty('confidence');
      }
    });

    it('should calculate overall confidence', async () => {
      await aiService.setContext(mockContext);
      const analysis = await aiService.analyze();
      
      expect(analysis.confidence).toBeDefined();
      expect(typeof analysis.confidence).toBe('number');
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(1);
    });

    it('should generate reasoning', async () => {
      await aiService.setContext(mockContext);
      const analysis = await aiService.analyze();
      
      expect(analysis.reasoning).toBeDefined();
      expect(typeof analysis.reasoning).toBe('string');
      expect(analysis.reasoning.length).toBeGreaterThan(0);
    });

    it('should handle error scenarios gracefully', async () => {
      // Test without context
      expect(async () => {
        await aiService.analyze();
      }).rejects.toThrow('AI Service requires global context to be set');
    });

    it('should provide backward compatibility methods', async () => {
      await aiService.setContext(mockContext);
      
      const energyInsights = aiService.getEnergyInsights(3);
      expect(energyInsights).toBeDefined();
      expect(Array.isArray(energyInsights)).toBe(true);
      
      const sorenessInsights = aiService.getSorenessInsights(['Upper Body']);
      expect(sorenessInsights).toBeDefined();
      expect(Array.isArray(sorenessInsights)).toBe(true);
    });
  });

  describe('Performance and Caching', () => {
    it('should cache analysis results', async () => {
      await aiService.setContext(mockContext);
      
      // First analysis
      const analysis1 = await aiService.analyze();
      const startTime1 = performance.now();
      
      // Second analysis with same parameters should be faster (cached)
      const analysis2 = await aiService.analyze();
      const startTime2 = performance.now();
      
      expect(analysis1.id).toBe(analysis2.id);
      expect(startTime2 - startTime1).toBeLessThan(10); // Should be much faster
    });

    it('should invalidate cache on context change', async () => {
      await aiService.setContext(mockContext);
      
      const analysis1 = await aiService.analyze();
      
      // Change context
      const newContext = {
        ...mockContext,
        currentSelections: {
          ...mockContext.currentSelections,
          customization_energy: 5
        }
      };
      
      await aiService.setContext(newContext);
      const analysis2 = await aiService.analyze();
      
      expect(analysis1.id).not.toBe(analysis2.id);
    });
  });

  describe('Cross-Component Analysis', () => {
    it('should detect conflicts between components', async () => {
      const conflictingContext = {
        ...mockContext,
        currentSelections: {
          customization_energy: 1, // Very low energy
          customization_duration: 90, // Very long duration
          customization_focus: 'strength', // High intensity
          customization_soreness: ['Upper Body', 'Lower Body', 'Core'], // High soreness
          customization_areas: ['Upper Body'] // Overlapping with soreness
        }
      };
      
      await aiService.setContext(conflictingContext);
      const analysis = await aiService.analyze();
      
      expect(analysis.crossComponentConflicts).toBeDefined();
      expect(analysis.crossComponentConflicts.length).toBeGreaterThan(0);
      
      // Should have energy vs duration conflict
      const energyDurationConflict = analysis.crossComponentConflicts.find(c => 
        c.components.includes('customization_energy') && 
        c.components.includes('customization_duration')
      );
      expect(energyDurationConflict).toBeDefined();
    });

    it('should provide conflict resolution suggestions', async () => {
      const conflictingContext = {
        ...mockContext,
        currentSelections: {
          customization_energy: 1,
          customization_duration: 90,
          customization_focus: 'strength'
        }
      };
      
      await aiService.setContext(conflictingContext);
      const analysis = await aiService.analyze();
      
      expect(analysis.crossComponentConflicts.length).toBeGreaterThan(0);
      expect(analysis.crossComponentConflicts[0]).toHaveProperty('suggestedResolution');
      expect(analysis.crossComponentConflicts[0].suggestedResolution).toBeTruthy();
    });
  });
}); 