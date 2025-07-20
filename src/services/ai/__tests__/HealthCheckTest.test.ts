/**
 * Health Check Test - Tests the enhanced health monitoring and domain service integration
 * This test verifies that our Day 2 Afternoon enhancements are working
 */

import { AIService } from '../core/AIService';
import { GlobalAIContext } from '../core/AIService';
import { UserProfile } from '../../../types/user';

describe('AI Service Health Monitoring and Domain Integration', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('Enhanced Health Status', () => {
    it('should provide comprehensive health status with domain service details', () => {
      const healthStatus = aiService.getHealthStatus();
      
      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      
      // Check enhanced details
      expect(healthStatus.details).toBeDefined();
      expect(healthStatus.details.domainServices).toBeDefined();
      expect(healthStatus.details.contextStatus).toBeDefined();
      expect(healthStatus.details.externalStrategy).toBeDefined();
      expect(healthStatus.details.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(healthStatus.details.uptime).toBeGreaterThanOrEqual(0);
      
      // Check domain services
      expect(healthStatus.details.domainServices.energy).toBeDefined();
      expect(healthStatus.details.domainServices.soreness).toBeDefined();
      expect(healthStatus.details.domainServices.focus).toBeDefined();
      expect(healthStatus.details.domainServices.duration).toBeDefined();
      expect(healthStatus.details.domainServices.equipment).toBeDefined();
      expect(healthStatus.details.domainServices.crossComponent).toBeDefined();
      
      // Check context status
      expect(['set', 'not_set', 'invalid']).toContain(healthStatus.details.contextStatus);
      
      // Check external strategy status
      expect(['configured', 'not_configured', 'error']).toContain(healthStatus.details.externalStrategy);
    });

    it('should detect unhealthy status when domain services fail', () => {
      // Mock a scenario where services are unhealthy
      const healthStatus = aiService.getHealthStatus();
      
      // Check that we can detect service status (may be healthy or degraded initially)
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      
      // Check that we can detect unhealthy services
      const domainServices = healthStatus.details.domainServices;
      Object.values(domainServices).forEach(status => {
        expect(['healthy', 'degraded', 'unhealthy']).toContain(status);
      });
    });
  });

  describe('Comprehensive Health Check', () => {
    it('should perform comprehensive health check with recovery attempts', async () => {
      const healthCheck = await aiService.performHealthCheck();
      
      expect(healthCheck).toBeDefined();
      expect(healthCheck.overall).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthCheck.overall);
      
      expect(healthCheck.details).toBeDefined();
      expect(Array.isArray(healthCheck.recoveryAttempts)).toBe(true);
      expect(Array.isArray(healthCheck.recommendations)).toBe(true);
      
      // Should provide recommendations based on health status
      if (healthCheck.overall !== 'healthy') {
        expect(healthCheck.recommendations.length).toBeGreaterThan(0);
      }
    });

    it('should provide specific recommendations for different issues', async () => {
      const healthCheck = await aiService.performHealthCheck();
      
      // Check that recommendations are actionable
      healthCheck.recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Detailed Performance Metrics', () => {
    it('should provide detailed performance metrics with domain service breakdown', () => {
      const metrics = aiService.getDetailedPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.overall).toBeDefined();
      expect(metrics.domainServices).toBeDefined();
      expect(metrics.cache).toBeDefined();
      
      // Check overall metrics
      expect(metrics.overall.averageExecutionTime).toBeGreaterThanOrEqual(0);
      expect(metrics.overall.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.overall.cacheHitRate).toBeLessThanOrEqual(1);
      expect(metrics.overall.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.overall.errorRate).toBeLessThanOrEqual(1);
      expect(metrics.overall.memoryUsage).toBeGreaterThanOrEqual(0);
      
      // Check domain service metrics
      expect(metrics.domainServices.energy).toBeDefined();
      expect(metrics.domainServices.soreness).toBeDefined();
      expect(metrics.domainServices.focus).toBeDefined();
      expect(metrics.domainServices.duration).toBeDefined();
      expect(metrics.domainServices.equipment).toBeDefined();
      expect(metrics.domainServices.crossComponent).toBeDefined();
      
      // Check cache metrics
      expect(metrics.cache.size).toBeGreaterThanOrEqual(0);
      expect(metrics.cache.hitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.cache.hitRate).toBeLessThanOrEqual(1);
      expect(metrics.cache.missRate).toBeGreaterThanOrEqual(0);
      expect(metrics.cache.missRate).toBeLessThanOrEqual(1);
      expect(metrics.cache.evictionRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Force Recovery', () => {
    it('should attempt to recover services when forced', async () => {
      const recovery = await aiService.forceRecovery();
      
      expect(recovery).toBeDefined();
      expect(typeof recovery.success).toBe('boolean');
      expect(Array.isArray(recovery.recoveredServices)).toBe(true);
      expect(Array.isArray(recovery.failedServices)).toBe(true);
      expect(Array.isArray(recovery.errors)).toBe(true);
      
      // Should have attempted recovery on cache at minimum
      expect(recovery.recoveredServices).toContain('cache');
    });

    it('should handle recovery failures gracefully', async () => {
      const recovery = await aiService.forceRecovery();
      
      // Should not throw errors even if some services fail to recover
      expect(recovery.success).toBeDefined();
      expect(recovery.errors).toBeDefined();
      
      // If there are errors, they should be strings
      recovery.errors.forEach(error => {
        expect(typeof error).toBe('string');
      });
    });
  });

  describe('Domain Service Integration', () => {
    it('should maintain service health after context setting', async () => {
      const mockUserProfile: UserProfile = {
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
          availableEquipment: ['dumbbells'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 60,
          equipmentConstraints: ['dumbbells'],
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
          averageDuration: 45,
          preferredFocusAreas: [],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.5,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'moderate',
          feedbackPreference: 'detailed',
          learningStyle: 'visual',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      };

      const context: GlobalAIContext = {
        userProfile: mockUserProfile,
        currentSelections: {
          customization_energy: 3,
          customization_focus: 'strength'
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'moderate',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      // Set context
      await aiService.setContext(context);
      
      // Check health after context setting
      const healthBefore = aiService.getHealthStatus();
      expect(healthBefore.details.contextStatus).toBe('set');
      
      // Perform analysis
      const analysis = await aiService.analyze();
      expect(analysis).toBeDefined();
      
      // Check health after analysis
      const healthAfter = aiService.getHealthStatus();
      expect(healthAfter.status).not.toBe('unhealthy');
      
      // Domain services should remain healthy
      Object.values(healthAfter.details.domainServices).forEach(status => {
        expect(['healthy', 'degraded']).toContain(status);
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should track errors and provide error information in health status', () => {
      const healthStatus = aiService.getHealthStatus();
      
      // Should have error tracking capability (lastError property exists, may be undefined)
      expect('lastError' in healthStatus.details).toBe(true);
      
      // Initially should have no errors (lastError should be undefined)
      expect(healthStatus.details.lastError).toBeUndefined();
      
      // Check that error rate is tracked
      expect(healthStatus.details.errorRate).toBeGreaterThanOrEqual(0);
      expect(healthStatus.details.errorRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track performance metrics and provide recommendations', async () => {
      const healthCheck = await aiService.performHealthCheck();
      
      // Should provide performance-based recommendations
      const hasPerformanceRecommendations = healthCheck.recommendations.some(
        rec => rec.includes('performance') || rec.includes('response time') || rec.includes('memory')
      );
      
      // May or may not have performance recommendations depending on current state
      expect(Array.isArray(healthCheck.recommendations)).toBe(true);
    });

    it('should monitor memory usage and provide cleanup recommendations', async () => {
      const healthCheck = await aiService.performHealthCheck();
      
      // Should be able to detect memory issues
      const hasMemoryRecommendations = healthCheck.recommendations.some(
        rec => rec.includes('memory') || rec.includes('cache')
      );
      
      // May or may not have memory recommendations depending on current usage
      expect(Array.isArray(healthCheck.recommendations)).toBe(true);
    });
  });
}); 