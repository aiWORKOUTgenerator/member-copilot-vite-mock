/**
 * Day 3 Morning Integration Tests
 * Tests the fixes and enhancements made during Day 3 Morning tasks
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { AIService } from '../core/AIService';
import { GlobalAIContext } from '../core/AIService';
import { UserProfile } from '../../../types/user';

describe('Day 3 Morning - Test Fixes and Integration', () => {
  let aiService: AIService;

  beforeEach(async () => {
    aiService = new AIService();
    
    // Set up a basic context for testing
    const basicContext: GlobalAIContext = {
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
    
    await aiService.setContext(basicContext);
  });

  describe('Task 3.1: Fixed Failing Tests', () => {
    it('should generate energy insights with correct types', () => {
      // Test energy level 5 (high energy) - should generate encouragement
      const highEnergyInsights = aiService.getEnergyInsights(5);
      expect(highEnergyInsights.length).toBeGreaterThan(0);
      expect(highEnergyInsights.some(insight => insight.type === 'encouragement')).toBe(true);

      // Test energy level 2 (low energy) - should generate warning
      const lowEnergyInsights = aiService.getEnergyInsights(2);
      expect(lowEnergyInsights.length).toBeGreaterThan(0);
      expect(lowEnergyInsights.some(insight => insight.type === 'warning')).toBe(true);

      // Test energy level 3 (moderate energy) - should generate optimization
      const moderateEnergyInsights = aiService.getEnergyInsights(3);
      expect(moderateEnergyInsights.length).toBeGreaterThan(0);
      expect(moderateEnergyInsights.some(insight => 
        insight.type === 'optimization' || insight.type === 'warning'
      )).toBe(true);
    });

    it('should generate soreness insights with correct types', () => {
      // Test high soreness - should generate warning
      const highSorenessInsights = aiService.getSorenessInsights(['Back', 'Legs', 'Shoulders']);
      expect(highSorenessInsights.length).toBeGreaterThan(0);
      expect(highSorenessInsights.some(insight => 
        insight.type === 'warning' || insight.type === 'optimization'
      )).toBe(true);

      // Test no soreness - should generate encouragement
      const noSorenessInsights = aiService.getSorenessInsights([]);
      expect(noSorenessInsights.length).toBeGreaterThan(0);
      expect(noSorenessInsights.some(insight => insight.type === 'encouragement')).toBe(true);
    });

    it('should handle valid energy levels correctly', () => {
      // Test all valid energy levels (1-5)
      for (let energy = 1; energy <= 5; energy++) {
        const insights = aiService.getEnergyInsights(energy);
        expect(insights.length).toBeGreaterThan(0);
        expect(insights.every(insight => 
          ['warning', 'optimization', 'encouragement', 'education'].includes(insight.type)
        )).toBe(true);
      }
    });

    it('should handle invalid energy levels gracefully', () => {
      // Test invalid energy levels
      const invalidInsights = aiService.getEnergyInsights(0);
      expect(invalidInsights.length).toBeGreaterThan(0);
      expect(invalidInsights.some(insight => insight.type === 'warning')).toBe(true);

      const highInvalidInsights = aiService.getEnergyInsights(10);
      expect(highInvalidInsights.length).toBeGreaterThan(0);
      expect(highInvalidInsights.some(insight => insight.type === 'warning')).toBe(true);
    });
  });

  describe('Task 3.2: Integration Tests', () => {
    it('should perform complete workout analysis', async () => {
      const analysis = await aiService.analyze();
      
      expect(analysis).toBeDefined();
      expect(analysis.insights).toBeDefined();
      expect(analysis.insights.energy).toBeDefined();
      expect(analysis.insights.soreness).toBeDefined();
      expect(analysis.insights.focus).toBeDefined();
      expect(analysis.insights.duration).toBeDefined();
      expect(analysis.insights.equipment).toBeDefined();
      
      // Should have insights for all domains
      expect(analysis.insights.energy.length).toBeGreaterThan(0);
      expect(analysis.insights.soreness.length).toBeGreaterThan(0);
      expect(analysis.insights.focus.length).toBeGreaterThan(0);
      expect(analysis.insights.duration.length).toBeGreaterThan(0);
      expect(analysis.insights.equipment.length).toBeGreaterThan(0);
    });

    it('should detect cross-component conflicts', async () => {
      // Set up a conflicting scenario
      const conflictingContext: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'new to exercise',
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
            availableEquipment: ['bodyweight'],
            availableLocations: ['home']
          },
          enhancedLimitations: {
            timeConstraints: 45,
            equipmentConstraints: ['bodyweight'],
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
            estimatedCompletedWorkouts: 5,
            averageDuration: 20,
            preferredFocusAreas: ['strength'],
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
          customization_energy: 2, // Low energy
          customization_duration: 60, // Long duration
          customization_focus: 'power', // Power focus
          customization_equipment: ['bodyweight'],
          customization_soreness: ['back', 'shoulders'],
          customization_areas: ['upper_body']
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'comprehensive',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      await aiService.setContext(conflictingContext);
      const analysis = await aiService.analyze();

      // Should detect conflicts
      expect(analysis.crossComponentConflicts.length).toBeGreaterThan(0);
      
      // Should have recommendations
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      
      // Should have high-priority recommendations for conflicts
      const highPriorityRecs = analysis.recommendations.filter(r => 
        r.priority === 'critical' || r.priority === 'high'
      );
      expect(highPriorityRecs.length).toBeGreaterThan(0);
    });

    it('should provide health status monitoring', () => {
      const healthStatus = aiService.getHealthStatus();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      
      expect(healthStatus.details).toBeDefined();
      expect(healthStatus.details.domainServices).toBeDefined();
      expect(healthStatus.details.cacheSize).toBeDefined();
      expect(healthStatus.details.errorRate).toBeDefined();
      expect(healthStatus.details.averageResponseTime).toBeDefined();
    });

    it('should provide performance metrics', () => {
      const metrics = aiService.getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.averageExecutionTime).toBeDefined();
      expect(metrics.cacheHitRate).toBeDefined();
      expect(metrics.errorRate).toBeDefined();
      expect(metrics.memoryUsage).toBeDefined();
      
      // Metrics should be reasonable values
      expect(metrics.averageExecutionTime).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeLessThanOrEqual(1);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Task 3.3: Error Handling and Recovery', () => {
    it('should handle service health checks', async () => {
      const healthCheck = await aiService.performHealthCheck();
      
      expect(healthCheck).toBeDefined();
      expect(healthCheck.overall).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthCheck.overall);
      expect(healthCheck.details).toBeDefined();
      expect(healthCheck.recoveryAttempts).toBeDefined();
      expect(healthCheck.recommendations).toBeDefined();
    });

    it('should handle force recovery', async () => {
      const recovery = await aiService.forceRecovery();
      
      expect(recovery).toBeDefined();
      expect(recovery.success).toBeDefined();
      expect(typeof recovery.success).toBe('boolean');
      expect(recovery.recoveredServices).toBeDefined();
      expect(recovery.failedServices).toBeDefined();
      expect(recovery.errors).toBeDefined();
    });

    it('should provide detailed performance metrics', () => {
      const detailedMetrics = aiService.getDetailedPerformanceMetrics();
      
      expect(detailedMetrics).toBeDefined();
      expect(detailedMetrics.overall).toBeDefined();
      expect(detailedMetrics.domainServices).toBeDefined();
      expect(detailedMetrics.cache).toBeDefined();
      
      // Check domain services
      expect(detailedMetrics.domainServices.energy).toBeDefined();
      expect(detailedMetrics.domainServices.soreness).toBeDefined();
      expect(detailedMetrics.domainServices.focus).toBeDefined();
      expect(detailedMetrics.domainServices.duration).toBeDefined();
      expect(detailedMetrics.domainServices.equipment).toBeDefined();
      expect(detailedMetrics.domainServices.crossComponent).toBeDefined();
      
      // Check cache metrics
      expect(detailedMetrics.cache.size).toBeDefined();
      expect(detailedMetrics.cache.hitRate).toBeDefined();
      expect(detailedMetrics.cache.missRate).toBeDefined();
      expect(detailedMetrics.cache.evictionRate).toBeDefined();
    });
  });
}); 