import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { aiLogicExtractor, ExtractedAILogic, AIPerformanceBaseline } from '../migration/AILogicExtractor';
import { PerWorkoutOptions, UserProfile } from '../../../types';
import { AIInsight } from '../../../types/insights';
import { AIService } from '../core/AIService';

/**
 * AI Validation Suite - Ensures 100% compatibility during migration
 * This test suite validates all current AI behavior and provides baseline metrics
 */
describe('AI Validation Suite', () => {
  let extractedLogic: ExtractedAILogic;
  let performanceBaseline: AIPerformanceBaseline;
  let aiService: AIService;
  
  beforeAll(async () => {
    // Extract all current AI logic for validation
    extractedLogic = await aiLogicExtractor.extractAllAILogic();
    performanceBaseline = await aiLogicExtractor.measurePerformanceBaseline();
  });

  beforeEach(async () => {
    aiService = new AIService();
    
    // Set up a basic context for the AI service
    const basicContext = {
      userProfile: {
        fitnessLevel: 'some experience' as const,
        goals: ['strength'] as const,
        preferences: {
          workoutStyle: ['strength_training'] as const,
          timePreference: 'morning' as const,
          intensityPreference: 'moderate' as const,
          advancedFeatures: false,
          aiAssistanceLevel: 'comprehensive' as const
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['dumbbells'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 45,
          equipmentConstraints: ['dumbbells'],
          locationConstraints: ['home'],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 8,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 20,
          averageDuration: 30,
          preferredFocusAreas: ['strength'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.6,
          plateauRisk: 'moderate'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'moderate',
          feedbackPreference: 'detailed',
          learningStyle: 'mixed',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      },
      currentSelections: {
        customization_energy: 3,
        customization_duration: 30,
        customization_focus: 'strength',
        customization_equipment: ['dumbbells'],
        customization_soreness: [],
        customization_areas: ['upper_body']
      },
      sessionHistory: [],
      preferences: {
        aiAssistanceLevel: 'comprehensive',
        showLearningInsights: true,
        autoApplyLowRiskRecommendations: false
      }
    };
    
    await aiService.setContext(basicContext as any);
  });
  
  describe('Energy Insights Validation', () => {
    it('should generate correct insights for all energy levels', () => {
      const testCases = [
        { input: 1, expectedType: 'warning' },
        { input: 2, expectedType: 'warning' },
        { input: 3, expectedType: 'optimization' },
        { input: 4, expectedType: 'encouragement' },
        { input: 5, expectedType: 'encouragement' }
      ];
      
      testCases.forEach(({ input, expectedType }) => {
        const result = aiService.getEnergyInsights(input);
        
        expect(result.length).toBeGreaterThan(0);
        expect(result.some((insight: AIInsight) => insight.type === expectedType)).toBe(true);
      });
    });
    
    it('should maintain performance standards', () => {
      const baseline = performanceBaseline.energyInsights;
      
      // Energy insights should execute quickly (< 5ms)
      expect(baseline.averageExecutionTime).toBeLessThan(5);
      
      // Should have minimal memory impact
      expect(baseline.memoryUsage).toBeLessThan(1024 * 1024); // 1MB
    });
    
    it('should handle edge cases gracefully', () => {
      const { implementation } = extractedLogic.energyInsights;
      
      // Test boundary values
      expect(() => implementation(0)).not.toThrow();
      expect(() => implementation(1)).not.toThrow();
      expect(() => implementation(5)).not.toThrow();
      
      // Test invalid values
      expect(() => implementation(-1)).not.toThrow();
      expect(() => implementation(6)).not.toThrow();
      expect(() => implementation(NaN)).not.toThrow();
    });
  });
  
  describe('Soreness Insights Validation', () => {
    it('should generate correct insights for all soreness levels', () => {
      const testCases = extractedLogic.sorenessInsights.testCases;
      
      testCases.forEach(({ input, expectedOutput }) => {
        const result = extractedLogic.sorenessInsights.implementation(input);
        
        expect(result).toHaveLength(expectedOutput.length);
        expect(result[0].type).toBe(expectedOutput[0].type);
        expect(result[0].message).toBe(expectedOutput[0].message);
        expect(result[0].recommendation).toBe(expectedOutput[0].recommendation);
      });
    });
    
    it('should maintain performance standards', () => {
      const baseline = performanceBaseline.sorenessInsights;
      
      expect(baseline.averageExecutionTime).toBeLessThan(5);
      expect(baseline.memoryUsage).toBeLessThan(1024 * 1024);
    });
  });
  
  describe('Recommendation Engine Validation', () => {
    it('should generate correct recommendation categories', () => {
      const testCases = extractedLogic.recommendationEngine.testCases;
      
      testCases.forEach(({ input, expectedOutput }) => {
        const result = extractedLogic.recommendationEngine.implementation(
          input.options,
          input.userProfile
        );
        
        expect(result).toHaveProperty('immediate');
        expect(result).toHaveProperty('contextual');
        expect(result).toHaveProperty('learning');
        expect(result).toHaveProperty('optimization');
        
        // Validate specific recommendations
        expect(result.immediate).toEqual(expect.arrayContaining(expectedOutput.immediate));
        expect(result.contextual).toEqual(expect.arrayContaining(expectedOutput.contextual));
        expect(result.learning).toEqual(expect.arrayContaining(expectedOutput.learning));
        expect(result.optimization).toEqual(expect.arrayContaining(expectedOutput.optimization));
      });
    });
    
    it('should handle complex scenarios', () => {
      const { implementation } = extractedLogic.recommendationEngine;
      
      // Test complex option combinations
      const complexOptions: PerWorkoutOptions = {
        customization_energy: 1,
        customization_duration: 75,
        customization_focus: 'power',
        customization_equipment: ['Body Weight'],
        customization_areas: ['Upper Body', 'Lower Body', 'Core'],
        customization_sleep: 2
      };
      
      const advancedUser: UserProfile = {
        fitnessLevel: 'advanced athlete',
        goals: ['strength', 'power', 'muscle_building'],
        preferences: {
          workoutStyle: ['strength_training', 'power_training'],
          timePreference: 'evening',
          intensityPreference: 'high',
          advancedFeatures: true,
          aiAssistanceLevel: 'comprehensive'
        },
        basicLimitations: {
          injuries: ['knee', 'lower_back'],
          availableEquipment: ['barbell', 'dumbbells'],
          availableLocations: ['gym']
        },
        enhancedLimitations: {
          timeConstraints: 60,
          equipmentConstraints: ['barbell', 'dumbbells'],
          locationConstraints: ['gym'],
          recoveryNeeds: {
            restDays: 1,
            sleepHours: 8,
            hydrationLevel: 'high'
          },
          mobilityLimitations: ['knee', 'lower_back'],
          progressionRate: 'aggressive'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 200,
          averageDuration: 75,
          preferredFocusAreas: ['strength', 'power'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.9,
          consistencyScore: 0.9,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'high',
          feedbackPreference: 'detailed',
          learningStyle: 'kinesthetic',
          motivationType: 'achievement',
          adaptationSpeed: 'fast'
        }
      };
      
      const result = implementation(complexOptions, advancedUser);
      
      // Should identify multiple conflicts
      expect(result.immediate.length).toBeGreaterThan(0);
      expect(result.contextual.length).toBeGreaterThan(0);
      
      // Should provide learning insights
      expect(result.learning.length).toBeGreaterThan(0);
    });
    
    it('should maintain performance standards', () => {
      const baseline = performanceBaseline.recommendationEngine;
      
      // Recommendation engine should execute reasonably fast (< 50ms)
      expect(baseline.averageExecutionTime).toBeLessThan(50);
      
      // Memory usage should be reasonable
      expect(baseline.memoryUsage).toBeLessThan(5 * 1024 * 1024); // 5MB
    });
  });
  
  describe('Cross-Component Conflict Detection', () => {
    it('should detect known conflicts', () => {
      const testCases = extractedLogic.crossComponentConflicts.testCases;
      
      testCases.forEach(({ input, expectedOutput }) => {
        const result = extractedLogic.crossComponentConflicts.implementation(
          input.options,
          input.userProfile
        );
        
        expect(result).toEqual(expect.objectContaining({
          conflicts: expect.arrayContaining(expectedOutput)
        }));
      });
    });
    
    it('should provide optimization suggestions', () => {
      const { implementation } = extractedLogic.crossComponentConflicts;
      
      const conflictingOptions: PerWorkoutOptions = {
        customization_energy: 2,
        customization_duration: 60,
        customization_focus: 'power',
        customization_equipment: ['Body Weight']
      };
      
      const newToExerciseUser: UserProfile = {
        fitnessLevel: 'new to exercise',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength_training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Body Weight'],
          availableLocations: ['Home']
        },
        enhancedLimitations: {
          timeConstraints: 0,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 0,
          averageDuration: 30,
          preferredFocusAreas: ['strength'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.5,
          consistencyScore: 0,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'low',
          feedbackPreference: 'simple',
          learningStyle: 'mixed',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      };
      
      const result = implementation(conflictingOptions, newToExerciseUser) as any;
      
      expect(result).toHaveProperty('conflicts');
      expect(result).toHaveProperty('optimizations');
      expect(result).toHaveProperty('missingComplements');
      
      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.optimizations.length).toBeGreaterThan(0);
    });
  });
  
  describe('AI Recommendation Parsing', () => {
    it('should parse recommendations correctly', () => {
      const testCases = extractedLogic.aiRecommendationParsing.testCases;
      
      testCases.forEach(({ input, expectedOutput }) => {
        const result = extractedLogic.aiRecommendationParsing.implementation(
          input.configKey,
          input.recommendation,
          input.options,
          input.userProfile
        );
        
        expect(result).toEqual(expectedOutput);
      });
    });
    
    it('should handle all configuration keys', () => {
      const { implementation } = extractedLogic.aiRecommendationParsing;
      
      const testOptions: PerWorkoutOptions = {
        customization_duration: 45,
        customization_focus: 'strength',
        customization_equipment: ['Dumbbells'],
        customization_energy: 3
      };
      
      const testUser: UserProfile = {
        fitnessLevel: 'some experience',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength_training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Dumbbells'],
          availableLocations: ['Home']
        },
        enhancedLimitations: {
          timeConstraints: 0,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 10,
          averageDuration: 45,
          preferredFocusAreas: ['strength'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.6,
          plateauRisk: 'moderate'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'moderate',
          feedbackPreference: 'detailed',
          learningStyle: 'mixed',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      };
      
      // Test all config keys
      const configKeys = ['customization_duration', 'customization_focus', 'customization_equipment', 'customization_energy'];
      
      configKeys.forEach(key => {
        expect(() => implementation(key, 'test recommendation', testOptions, testUser)).not.toThrow();
      });
    });
  });
  
  describe('Performance Benchmarks', () => {
    it('should meet all performance baselines', () => {
      // Energy insights baseline
      expect(performanceBaseline.energyInsights.averageExecutionTime).toBeLessThan(5);
      
      // Soreness insights baseline
      expect(performanceBaseline.sorenessInsights.averageExecutionTime).toBeLessThan(5);
      
      // Recommendation engine baseline
      expect(performanceBaseline.recommendationEngine.averageExecutionTime).toBeLessThan(50);
      
      // Cross-component analysis baseline
      expect(performanceBaseline.crossComponentAnalysis.averageExecutionTime).toBeLessThan(30);
    });
    
    it('should have acceptable memory usage', () => {
      const totalMemory = Object.values(performanceBaseline)
        .reduce((sum, baseline) => sum + baseline.memoryUsage, 0);
      
      // Total memory usage should be under 10MB
      expect(totalMemory).toBeLessThan(10 * 1024 * 1024);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle invalid inputs gracefully', () => {
      const { implementation: energyImpl } = extractedLogic.energyInsights;
      const { implementation: sorenessImpl } = extractedLogic.sorenessInsights;
      const { implementation: recommendationImpl } = extractedLogic.recommendationEngine;
      
      // Test invalid energy values
      expect(() => energyImpl(null as any)).not.toThrow();
      expect(() => energyImpl(undefined as any)).not.toThrow();
      
      // Test invalid soreness values
      expect(() => sorenessImpl(null as any)).not.toThrow();
      expect(() => sorenessImpl(undefined as any)).not.toThrow();
      
      // Test invalid recommendation inputs
      expect(() => recommendationImpl({} as any, {} as any)).not.toThrow();
      expect(() => recommendationImpl(null as any, null as any)).not.toThrow();
    });
  });
});

/**
 * Integration test suite that validates AI behavior across components
 */
describe('AI Integration Validation', () => {
  it('should maintain consistent behavior across components', async () => {
    const extractedLogic = await aiLogicExtractor.extractAllAILogic();
    
    // Test that energy insights are consistent with recommendations
    const lowEnergyInsights = extractedLogic.energyInsights.implementation(2);
    const lowEnergyRecommendations = extractedLogic.recommendationEngine.implementation(
      { customization_energy: 2, customization_duration: 60 },
      { fitnessLevel: 'some experience', goals: ['strength'] } as UserProfile
    );
    
    // Both should suggest caution with low energy
    expect(lowEnergyInsights[0].type).toBe('warning');
    expect(lowEnergyRecommendations.immediate.length).toBeGreaterThan(0);
  });
  
  it('should handle cross-component scenarios correctly', async () => {
    const extractedLogic = await aiLogicExtractor.extractAllAILogic();
    
    // Test complex scenario
    const complexOptions: PerWorkoutOptions = {
      customization_energy: 1,
      customization_duration: 75,
      customization_focus: 'power',
      customization_equipment: ['Body Weight']
    };
    
    const userProfile: UserProfile = {
      fitnessLevel: 'new to exercise',
      goals: ['strength'],
      preferences: {
        workoutStyle: ['strength_training'],
        timePreference: 'morning',
        intensityPreference: 'moderate',
        advancedFeatures: false,
        aiAssistanceLevel: 'moderate'
      },
      basicLimitations: {
        injuries: [],
        availableEquipment: ['Body Weight'],
        availableLocations: ['Home']
      },
      enhancedLimitations: {
        timeConstraints: 0,
        equipmentConstraints: [],
        locationConstraints: [],
        recoveryNeeds: {
          restDays: 2,
          sleepHours: 7,
          hydrationLevel: 'moderate'
        },
        mobilityLimitations: [],
        progressionRate: 'moderate'
      },
      workoutHistory: {
        estimatedCompletedWorkouts: 0,
        averageDuration: 30,
        preferredFocusAreas: ['strength'],
        progressiveEnhancementUsage: {},
        aiRecommendationAcceptance: 0.5,
        consistencyScore: 0,
        plateauRisk: 'low'
      },
      learningProfile: {
        prefersSimplicity: true,
        explorationTendency: 'low',
        feedbackPreference: 'simple',
        learningStyle: 'mixed',
        motivationType: 'intrinsic',
        adaptationSpeed: 'moderate'
      }
    };
    
    const recommendations = extractedLogic.recommendationEngine.implementation(complexOptions, userProfile);
    const conflicts = extractedLogic.crossComponentConflicts.implementation(complexOptions, userProfile) as any;
    
    // Should identify multiple issues
    expect(recommendations.immediate.length).toBeGreaterThan(0);
    expect(conflicts.conflicts.length).toBeGreaterThan(0);
    
    // Should provide constructive suggestions
    expect(recommendations.optimization.length).toBeGreaterThan(0);
    expect(conflicts.optimizations.length).toBeGreaterThan(0);
  });
});

/**
 * Migration readiness test suite
 */
describe('Migration Readiness', () => {
  it('should have complete test coverage', async () => {
    const extractedLogic = await aiLogicExtractor.extractAllAILogic();
    
    // Verify all components have test cases
    expect(extractedLogic.energyInsights.testCases.length).toBeGreaterThan(0);
    expect(extractedLogic.sorenessInsights.testCases.length).toBeGreaterThan(0);
    expect(extractedLogic.recommendationEngine.testCases.length).toBeGreaterThan(0);
    expect(extractedLogic.crossComponentConflicts.testCases.length).toBeGreaterThan(0);
    expect(extractedLogic.aiRecommendationParsing.testCases.length).toBeGreaterThan(0);
  });
  
  it('should have documented all AI sources', async () => {
    const extractedLogic = await aiLogicExtractor.extractAllAILogic();
    
    // Verify all sources are documented
    expect(extractedLogic.energyInsights.source).toBeDefined();
    expect(extractedLogic.sorenessInsights.source).toBeDefined();
    expect(extractedLogic.recommendationEngine.source).toBeDefined();
    expect(extractedLogic.crossComponentConflicts.source).toBeDefined();
    expect(extractedLogic.aiRecommendationParsing.source).toBeDefined();
  });
  
  it('should have established performance baselines', async () => {
    const baseline = await aiLogicExtractor.measurePerformanceBaseline();
    
    // Verify baselines are established
    expect(baseline.energyInsights.averageExecutionTime).toBeGreaterThan(0);
    expect(baseline.sorenessInsights.averageExecutionTime).toBeGreaterThan(0);
    expect(baseline.recommendationEngine.averageExecutionTime).toBeGreaterThan(0);
    expect(baseline.crossComponentAnalysis.averageExecutionTime).toBeGreaterThan(0);
  });
}); 