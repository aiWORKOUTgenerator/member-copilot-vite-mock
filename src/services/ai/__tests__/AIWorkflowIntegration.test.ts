/**
 * AI Workflow Integration Tests
 * 
 * Comprehensive tests for the complete AI workout analysis pipeline
 * Validates that all domain services work together seamlessly
 */

import { AIService } from '../core/AIService';
import { GlobalAIContext } from '../core/AIService';
import { PerWorkoutOptions, CategoryRatingData } from '../../../types/core';
import { UserProfile } from '../../../types/user';

describe('AI Workflow Integration', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('Complete Workout Analysis Pipeline', () => {
    it('should generate complete workout analysis for balanced scenario', async () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'some experience',
          goals: ['strength', 'endurance'],
          preferences: {
            workoutStyle: ['strength_training', 'cardio'],
            timePreference: 'morning',
            intensityPreference: 'moderate',
            advancedFeatures: false,
            aiAssistanceLevel: 'comprehensive'
          },
          basicLimitations: {
            injuries: [],
            availableEquipment: ['dumbbells', 'resistance_bands'],
            availableLocations: ['home']
          },
          enhancedLimitations: {
            timeConstraints: 60,
            equipmentConstraints: ['dumbbells', 'resistance_bands'],
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
            estimatedCompletedWorkouts: 50,
            averageDuration: 45,
            preferredFocusAreas: ['strength', 'endurance'],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.8,
            consistencyScore: 0.7,
            plateauRisk: 'low'
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
          customization_energy: 7,
          customization_duration: 45,
          customization_focus: 'strength',
          customization_equipment: ['dumbbells', 'resistance_bands'],
          customization_soreness: {
            'legs': {
              selected: true,
              rating: 3,
              label: 'Legs'
            }
          } as CategoryRatingData,
          customization_areas: ['upper_body', 'core']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          availableTime: 60,
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        } as {
          aiAssistanceLevel: 'minimal' | 'moderate' | 'comprehensive';
          showLearningInsights: boolean;
          autoApplyLowRiskRecommendations: boolean;
        }
      };

      await aiService.setContext(context);
      const analysis = await aiService.analyze();

      // Verify all domain services provided insights
      expect(analysis.insights.energy).toBeDefined();
      expect(analysis.insights.duration).toBeDefined();
      expect(analysis.insights.focus).toBeDefined();
      expect(analysis.insights.equipment).toBeDefined();
      expect(analysis.insights.soreness).toBeDefined();

      // Verify cross-component analysis
      expect(analysis.crossComponentConflicts).toBeDefined();

      // Verify performance metrics
      expect(analysis.performanceMetrics).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.confidence).toBeDefined();
    });

    it('should handle high-intensity workout scenario', async () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'advanced athlete',
          goals: ['power', 'strength'],
          preferences: {
            workoutStyle: ['power_training', 'strength_training'],
            timePreference: 'afternoon',
            intensityPreference: 'high',
            advancedFeatures: true,
            aiAssistanceLevel: 'comprehensive'
          },
          basicLimitations: {
            injuries: [],
            availableEquipment: ['barbell', 'dumbbells', 'bench'],
            availableLocations: ['gym']
          },
          enhancedLimitations: {
            timeConstraints: 90,
            equipmentConstraints: ['barbell', 'dumbbells', 'bench'],
            locationConstraints: ['gym'],
            recoveryNeeds: {
              restDays: 1,
              sleepHours: 8,
              hydrationLevel: 'high'
            },
            mobilityLimitations: [],
            progressionRate: 'aggressive'
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 200,
            averageDuration: 75,
            preferredFocusAreas: ['power', 'strength'],
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
        },
        currentSelections: {
          customization_energy: 5,
          customization_duration: 75,
          customization_focus: 'power',
          customization_equipment: ['barbell', 'dumbbells', 'bench'],
          customization_soreness: {},
          customization_areas: ['full_body']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'afternoon',
          availableTime: 90,
          location: 'gym'
        },
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: true
        }
      };

      await aiService.setContext(context);
      const analysis = await aiService.analyze();

      // Verify high-energy insights
      expect(analysis.insights.energy.length).toBeGreaterThan(0);
      // High energy (5) should generate encouragement insights
      expect(analysis.insights.energy.some(insight => 
        insight.type === 'encouragement' || insight.type === 'optimization'
      )).toBe(true);

      // Verify duration insights
      expect(analysis.insights.duration.length).toBeGreaterThan(0);
      expect(analysis.insights.duration.some(insight => insight.type === 'optimization')).toBe(true);

      // Verify equipment insights
      expect(analysis.insights.equipment.length).toBeGreaterThan(0);

      // Verify well-planned workout has minimal conflicts
      expect(analysis.crossComponentConflicts.length).toBeLessThanOrEqual(1);
    });

    it('should detect and resolve conflicts in problematic scenario', async () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'new to exercise',
          goals: ['general_fitness'],
          preferences: {
            workoutStyle: ['general_fitness'],
            timePreference: 'evening',
            intensityPreference: 'low',
            advancedFeatures: false,
            aiAssistanceLevel: 'comprehensive'
          },
          basicLimitations: {
            injuries: ['back', 'shoulders'],
            availableEquipment: ['bodyweight'],
            availableLocations: ['home']
          },
          enhancedLimitations: {
            timeConstraints: 45,
            equipmentConstraints: ['bodyweight'],
            locationConstraints: ['home'],
            recoveryNeeds: {
              restDays: 3,
              sleepHours: 8,
              hydrationLevel: 'moderate'
            },
            mobilityLimitations: ['back', 'shoulders'],
            progressionRate: 'conservative'
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 5,
            averageDuration: 20,
            preferredFocusAreas: ['general_fitness'],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.6,
            consistencyScore: 0.4,
            plateauRisk: 'high'
          },
          learningProfile: {
            prefersSimplicity: true,
            explorationTendency: 'low',
            feedbackPreference: 'simple',
            learningStyle: 'visual',
            motivationType: 'extrinsic',
            adaptationSpeed: 'slow'
          }
        },
        currentSelections: {
          customization_energy: 2,
          customization_duration: 60,
          customization_focus: 'power',
          customization_equipment: ['barbell'],
          customization_soreness: {
            'back': {
              selected: true,
              rating: 4,
              label: 'Back'
            },
            'shoulders': {
              selected: true,
              rating: 3,
              label: 'Shoulders'
            },
            'legs': {
              selected: true,
              rating: 2,
              label: 'Legs'
            }
          },
          customization_areas: ['upper_body']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'evening',
          availableTime: 45,
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await aiService.setContext(context);
      const analysis = await aiService.analyze();

      // Verify conflict detection
      expect(analysis.crossComponentConflicts.length).toBeGreaterThan(0);

      // Verify energy warnings
      expect(analysis.insights.energy.length).toBeGreaterThan(0);
      expect(analysis.insights.energy.some(insight => insight.type === 'warning')).toBe(true);

      // Verify soreness warnings
      expect(analysis.insights.soreness.length).toBeGreaterThan(0);
      expect(analysis.insights.soreness.some(insight => insight.type === 'warning')).toBe(true);

      // Verify duration conflicts
      expect(analysis.insights.duration.length).toBeGreaterThan(0);
      expect(analysis.insights.duration.some(insight => insight.type === 'warning')).toBe(true);
    });

    it('should provide recovery-focused insights for low energy scenario', async () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'some experience',
          goals: ['recovery', 'flexibility'],
          preferences: {
            workoutStyle: ['yoga', 'stretching'],
            timePreference: 'morning',
            intensityPreference: 'low',
            advancedFeatures: false,
            aiAssistanceLevel: 'comprehensive'
          },
          basicLimitations: {
            injuries: [],
            availableEquipment: ['yoga_mat'],
            availableLocations: ['home']
          },
          enhancedLimitations: {
            timeConstraints: 30,
            equipmentConstraints: ['yoga_mat'],
            locationConstraints: ['home'],
            recoveryNeeds: {
              restDays: 2,
              sleepHours: 8,
              hydrationLevel: 'moderate'
            },
            mobilityLimitations: [],
            progressionRate: 'conservative'
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 30,
            averageDuration: 25,
            preferredFocusAreas: ['recovery', 'flexibility'],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.7,
            consistencyScore: 0.6,
            plateauRisk: 'moderate'
          },
          learningProfile: {
            prefersSimplicity: true,
            explorationTendency: 'low',
            feedbackPreference: 'simple',
            learningStyle: 'kinesthetic',
            motivationType: 'intrinsic',
            adaptationSpeed: 'moderate'
          }
        },
        currentSelections: {
          customization_energy: 3,
          customization_duration: 20,
          customization_focus: 'recovery',
          customization_equipment: ['yoga_mat'],
          customization_soreness: {
            'full_body': {
              selected: true,
              rating: 4,
              label: 'Full Body'
            }
          },
          customization_areas: ['core', 'lower_body']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          availableTime: 30,
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: true
        }
      };

      await aiService.setContext(context);
      const analysis = await aiService.analyze();

      // Verify recovery-focused insights
      expect(analysis.insights.energy.length).toBeGreaterThan(0);
      expect(analysis.insights.energy.some(insight => insight.type === 'optimization')).toBe(true);

      // Verify soreness insights
      expect(analysis.insights.soreness.length).toBeGreaterThan(0);
      // High soreness should generate warning insights
      expect(analysis.insights.soreness.some(insight => 
        insight.type === 'warning' || insight.type === 'optimization'
      )).toBe(true);

      // Verify focus insights
      expect(analysis.insights.focus.length).toBeGreaterThan(0);
      expect(analysis.insights.focus.some(insight => insight.type === 'encouragement')).toBe(true);
    });
  });

  describe('Workflow Performance and Reliability', () => {
    it('should handle rapid context changes efficiently', async () => {
      const baseContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'some experience',
          goals: ['strength'],
          preferences: {
            workoutStyle: ['strength_training'],
            timePreference: 'morning',
            intensityPreference: 'moderate',
            advancedFeatures: false,
            aiAssistanceLevel: 'comprehensive'
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
            estimatedCompletedWorkouts: 40,
            averageDuration: 35,
            preferredFocusAreas: ['strength'],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.8,
            consistencyScore: 0.7,
            plateauRisk: 'low'
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
          customization_energy: 5,
          customization_duration: 30,
          customization_focus: 'strength',
          customization_equipment: ['dumbbells'],
          customization_soreness: {},
          customization_areas: ['upper_body']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          availableTime: 45,
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await aiService.setContext(baseContext);
      
      // Rapid context changes
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        const modifiedContext = {
          ...baseContext,
          currentSelections: {
            ...baseContext.currentSelections,
            customization_energy: 5 + i,
            customization_duration: 30 + (i * 5)
          }
        };
        
        await aiService.setContext(modifiedContext);
        const analysis = await aiService.analyze();
        
        expect(analysis.insights.energy).toBeDefined();
        expect(analysis.insights.duration).toBeDefined();
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds for 5 iterations)
      expect(totalTime).toBeLessThan(5000);
    });

    it('should maintain consistency across multiple analyses', async () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'advanced athlete',
          goals: ['endurance'],
          preferences: {
            workoutStyle: ['cardio', 'endurance_training'],
            timePreference: 'afternoon',
            intensityPreference: 'high',
            advancedFeatures: true,
            aiAssistanceLevel: 'comprehensive'
          },
          basicLimitations: {
            injuries: [],
            availableEquipment: ['treadmill', 'bike'],
            availableLocations: ['gym']
          },
          enhancedLimitations: {
            timeConstraints: 75,
            equipmentConstraints: ['treadmill', 'bike'],
            locationConstraints: ['gym'],
            recoveryNeeds: {
              restDays: 1,
              sleepHours: 8,
              hydrationLevel: 'high'
            },
            mobilityLimitations: [],
            progressionRate: 'aggressive'
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 150,
            averageDuration: 60,
            preferredFocusAreas: ['endurance'],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.9,
            consistencyScore: 0.8,
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
        },
        currentSelections: {
          customization_energy: 8,
          customization_duration: 60,
          customization_focus: 'endurance',
          customization_equipment: ['treadmill', 'bike'],
          customization_soreness: {
            'legs': {
              selected: true,
              rating: 3,
              label: 'Legs'
            }
          },
          customization_areas: ['lower_body']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'afternoon',
          availableTime: 75,
          location: 'gym'
        },
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await aiService.setContext(context);
      
      // Run multiple analyses
      const analyses = [];
      for (let i = 0; i < 3; i++) {
        const analysis = await aiService.analyze();
        analyses.push(analysis);
      }
      
      // Verify consistency
      expect(analyses[0].insights.energy.length).toBe(analyses[1].insights.energy.length);
      expect(analyses[1].insights.energy.length).toBe(analyses[2].insights.energy.length);
      
      expect(analyses[0].insights.duration.length).toBe(analyses[1].insights.duration.length);
      expect(analyses[1].insights.duration.length).toBe(analyses[2].insights.duration.length);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing or invalid selections gracefully', async () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'some experience',
          goals: ['strength'],
          preferences: {
            workoutStyle: ['strength_training'],
            timePreference: 'morning',
            intensityPreference: 'moderate',
            advancedFeatures: false,
            aiAssistanceLevel: 'comprehensive'
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
            estimatedCompletedWorkouts: 40,
            averageDuration: 35,
            preferredFocusAreas: ['strength'],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.8,
            consistencyScore: 0.7,
            plateauRisk: 'low'
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
          customization_energy: undefined,
          customization_duration: undefined,
          customization_focus: undefined,
          customization_equipment: undefined,
          customization_soreness: undefined,
          customization_areas: undefined
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          availableTime: 45,
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await aiService.setContext(context);
      const analysis = await aiService.analyze();

      // Should handle gracefully without errors
      expect(analysis.insights).toBeDefined();
      expect(analysis.crossComponentConflicts).toBeDefined();
      expect(analysis.performanceMetrics).toBeDefined();
    });

    it('should handle extreme values appropriately', async () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'new to exercise',
          goals: ['general_fitness'],
          preferences: {
            workoutStyle: ['general_fitness'],
            timePreference: 'evening',
            intensityPreference: 'low',
            advancedFeatures: false,
            aiAssistanceLevel: 'comprehensive'
          },
          basicLimitations: {
            injuries: [],
            availableEquipment: ['bodyweight'],
            availableLocations: ['home']
          },
          enhancedLimitations: {
            timeConstraints: 30,
            equipmentConstraints: ['bodyweight'],
            locationConstraints: ['home'],
            recoveryNeeds: {
              restDays: 3,
              sleepHours: 8,
              hydrationLevel: 'moderate'
            },
            mobilityLimitations: [],
            progressionRate: 'conservative'
          },
          workoutHistory: {
            estimatedCompletedWorkouts: 5,
            averageDuration: 20,
            preferredFocusAreas: ['general_fitness'],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.6,
            consistencyScore: 0.4,
            plateauRisk: 'high'
          },
          learningProfile: {
            prefersSimplicity: true,
            explorationTendency: 'low',
            feedbackPreference: 'simple',
            learningStyle: 'visual',
            motivationType: 'extrinsic',
            adaptationSpeed: 'slow'
          }
        },
        currentSelections: {
          customization_energy: 10, // Extreme high
          customization_duration: 180, // Extreme long
          customization_focus: 'power',
          customization_equipment: ['barbell', 'dumbbells', 'bench', 'rack', 'cables'],
          customization_soreness: {
            'full_body': {
              selected: true,
              rating: 5,
              label: 'Full Body'
            }
          },
          customization_areas: ['full_body']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'evening',
          availableTime: 30, // Mismatch with duration
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await aiService.setContext(context);
      const analysis = await aiService.analyze();

      // Should provide appropriate warnings for extreme values
      expect(analysis.crossComponentConflicts.length).toBeGreaterThan(0);
      expect(analysis.insights.duration.length).toBeGreaterThan(0);
      expect(analysis.insights.duration.some(insight => insight.type === 'warning')).toBe(true);
    });
  });

  describe('Integration with External Systems', () => {
    it('should provide comprehensive performance metrics', async () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'some experience',
          goals: ['strength'],
          preferences: {
            workoutStyle: ['strength_training'],
            timePreference: 'morning',
            intensityPreference: 'moderate',
            advancedFeatures: false,
            aiAssistanceLevel: 'comprehensive'
          },
          basicLimitations: {
            injuries: [],
            availableEquipment: ['dumbbells'],
            availableLocations: ['home']
          },
          enhancedLimitations: {
            timeConstraints: 60,
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
            estimatedCompletedWorkouts: 40,
            averageDuration: 45,
            preferredFocusAreas: ['strength'],
            progressiveEnhancementUsage: {},
            aiRecommendationAcceptance: 0.8,
            consistencyScore: 0.7,
            plateauRisk: 'low'
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
          customization_energy: 6,
          customization_duration: 45,
          customization_focus: 'strength',
          customization_equipment: ['dumbbells'],
          customization_soreness: {},
          customization_areas: ['upper_body']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          availableTime: 60,
          location: 'home'
        },
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await aiService.setContext(context);
      const analysis = await aiService.analyze();

      // Verify performance metrics
      expect(analysis.performanceMetrics).toBeDefined();
      expect(analysis.performanceMetrics.totalExecutionTime).toBeGreaterThan(0);
      expect(analysis.performanceMetrics.cacheHitRate).toBeDefined();
      expect(analysis.performanceMetrics.memoryPeakUsage).toBeDefined();
    });
  });
}); 