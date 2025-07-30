import { FeatureFlagService, featureFlagService } from '../featureFlags/FeatureFlagService';
import { UserProfile } from '../../../types';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let mockUserProfile: UserProfile;

  beforeEach(() => {
    service = new FeatureFlagService();
    mockUserProfile = {
      id: 'test-user-123',
      fitnessLevel: 'some experience',
      goals: ['strength', 'muscle_building'],
      preferences: {
        workoutStyle: ['strength_training'],
        timePreference: 'morning',
        intensityPreference: 'moderate',
        advancedFeatures: false,
        aiAssistanceLevel: 'moderate'
      },
      history: {
        completedWorkouts: 25
      }
    };
  });

  describe('Flag Evaluation', () => {
    it('should return false for disabled flags', () => {
      service.updateFlag('ai_service_unified', { enabled: false });
      const result = service.isEnabled('ai_service_unified', mockUserProfile);
      expect(result).toBe(false);
    });

    it('should return false for non-existent flags', () => {
      const result = service.isEnabled('non_existent_flag', mockUserProfile);
      expect(result).toBe(false);
    });

    it('should respect user overrides', () => {
      service.addUserOverride('ai_service_unified', 'test-user-123', true);
      const result = service.isEnabled('ai_service_unified', mockUserProfile);
      expect(result).toBe(true);
    });

    it('should apply consistent hashing for percentage rollouts', () => {
      // Set 50% rollout
      service.updateFlag('ai_service_unified', { rolloutPercentage: 50 });
      
      // Same user should always get same result
      const result1 = service.isEnabled('ai_service_unified', mockUserProfile);
      const result2 = service.isEnabled('ai_service_unified', mockUserProfile);
      expect(result1).toBe(result2);
    });

    it('should handle user group targeting', () => {
      // Target power users
      service.updateFlag('ai_service_unified', { 
        userGroups: ['power_users'],
        rolloutPercentage: 100
      });
      
      // Regular user should not get the flag
      const result1 = service.isEnabled('ai_service_unified', mockUserProfile);
      expect(result1).toBe(false);
      
      // Power user should get the flag
      const powerUser = {
        ...mockUserProfile,
        preferences: { ...mockUserProfile.preferences, advancedFeatures: true }
      };
      const result2 = service.isEnabled('ai_service_unified', powerUser);
      expect(result2).toBe(true);
    });
  });

  describe('Rollout Management', () => {
    it('should allow increasing rollout percentage', () => {
      const success = service.increaseRollout('ai_service_unified', 25);
      expect(success).toBe(true);
      
      const config = service.exportConfiguration();
      expect(config.ai_service_unified.rolloutPercentage).toBe(25);
    });

    it('should not allow decreasing rollout percentage', () => {
      service.updateFlag('ai_service_unified', { rolloutPercentage: 50 });
      const success = service.increaseRollout('ai_service_unified', 25);
      expect(success).toBe(false);
    });

    it('should handle emergency rollback', () => {
      const success = service.disableFlag('ai_service_unified');
      expect(success).toBe(true);
      
      const config = service.exportConfiguration();
      expect(config.ai_service_unified.enabled).toBe(false);
      expect(config.ai_service_unified.rolloutPercentage).toBe(0);
    });
  });

  describe('A/B Testing and Analytics', () => {
    it('should track user allocations', () => {
      service.isEnabled('ai_service_unified', mockUserProfile);
      
      const allocations = service.getUserAllocations('test-user-123');
      expect(allocations.length).toBeGreaterThan(0);
      expect(allocations[0].userId).toBe('test-user-123');
      expect(allocations[0].flagId).toBe('ai_service_unified');
    });

    it('should generate analytics for flags with users', () => {
      // Simulate some users
      service.isEnabled('ai_service_unified', mockUserProfile);
      service.isEnabled('ai_service_unified', { ...mockUserProfile, id: 'user-2' });
      
      const analytics = service.getAnalytics('ai_service_unified');
      expect(analytics).not.toBeNull();
      expect(analytics!.flagId).toBe('ai_service_unified');
      expect(analytics!.controlGroup.users + analytics!.treatmentGroup.users).toBeGreaterThan(0);
    });

    it('should return null analytics for flags with no users', () => {
      const analytics = service.getAnalytics('non_existent_flag');
      expect(analytics).toBeNull();
    });
  });

  describe('User Grouping', () => {
    it('should assign fitness level groups', () => {
      const beginnerUser = { ...mockUserProfile, fitnessLevel: 'new to exercise' as const };
      service.updateFlag('ai_service_unified', { 
        userGroups: ['fitness_new to exercise'],
        rolloutPercentage: 100
      });
      
      const result = service.isEnabled('ai_service_unified', beginnerUser);
      expect(result).toBe(true);
    });

    it('should assign experience-based groups', () => {
      const experiencedUser = { 
        ...mockUserProfile, 
        history: { completedWorkouts: 100 }
      };
      
      service.updateFlag('ai_service_unified', { 
        userGroups: ['experienced_users'],
        rolloutPercentage: 100
      });
      
      const result = service.isEnabled('ai_service_unified', experiencedUser);
      expect(result).toBe(true);
    });

    it('should assign limitation-based groups', () => {
      const userWithLimitations = { 
        ...mockUserProfile, 
        limitations: { injuries: ['knee'] }
      };
      
      service.updateFlag('ai_service_unified', { 
        userGroups: ['users_with_limitations'],
        rolloutPercentage: 100
      });
      
      const result = service.isEnabled('ai_service_unified', userWithLimitations);
      expect(result).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    it('should export and import configuration', () => {
      const originalConfig = service.exportConfiguration();
      
      // Modify a flag
      service.updateFlag('ai_service_unified', { rolloutPercentage: 75 });
      
      // Import original config
      service.importConfiguration(originalConfig);
      
      const restoredConfig = service.exportConfiguration();
      expect(restoredConfig.ai_service_unified.rolloutPercentage).toBe(originalConfig.ai_service_unified.rolloutPercentage);
    });

    it('should track analytics events', () => {
      let eventCount = 0;
      service.setAnalyticsCallback(() => {
        eventCount++;
      });
      
      service.updateFlag('ai_service_unified', { rolloutPercentage: 30 });
      service.isEnabled('ai_service_unified', mockUserProfile);
      
      expect(eventCount).toBeGreaterThan(0);
    });
  });

  describe('AI Flag Integration', () => {
    it('should get all AI-related flags for a user', () => {
      const aiFlags = service.getAIFlags(mockUserProfile);
      
      expect(Object.keys(aiFlags)).toEqual(
        expect.arrayContaining([
          'ai_service_unified',
          'ai_cross_component_analysis',
          'ai_real_time_insights',
          'ai_learning_system'
        ])
      );
      
      Object.values(aiFlags).forEach(enabled => {
        expect(typeof enabled).toBe('boolean');
      });
    });

    it('should provide correct flag states for different rollout percentages', () => {
      // Test with 0% rollout
      service.updateFlag('ai_service_unified', { rolloutPercentage: 0 });
      let flags = service.getAIFlags(mockUserProfile);
      expect(flags.ai_service_unified).toBe(false);
      
      // Test with 100% rollout
      service.updateFlag('ai_service_unified', { rolloutPercentage: 100 });
      flags = service.getAIFlags(mockUserProfile);
      expect(flags.ai_service_unified).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle users without IDs', () => {
      const userWithoutId = { ...mockUserProfile, id: undefined };
      const result = service.isEnabled('ai_service_unified', userWithoutId);
      expect(typeof result).toBe('boolean');
    });

    it('should handle flags with no metadata', () => {
      service.updateFlag('ai_service_unified', { metadata: undefined });
      const result = service.isEnabled('ai_service_unified', mockUserProfile);
      expect(typeof result).toBe('boolean');
    });

    it('should handle concurrent flag evaluations', () => {
      const promises = Array.from({ length: 100 }, (_, i) => {
        const user = { ...mockUserProfile, id: `user-${i}` };
        return Promise.resolve(service.isEnabled('ai_service_unified', user));
      });
      
      return Promise.all(promises).then(results => {
        expect(results).toHaveLength(100);
        results.forEach(result => {
          expect(typeof result).toBe('boolean');
        });
      });
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of flag evaluations efficiently', () => {
      const startTime = performance.now();
      
      // Evaluate flags for 1000 users
      for (let i = 0; i < 1000; i++) {
        const user = { ...mockUserProfile, id: `perf-user-${i}` };
        service.getAIFlags(user);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in under 200ms (reasonable for 1000 evaluations)
      expect(duration).toBeLessThan(200);
    });

    it('should maintain consistent allocation for repeated evaluations', () => {
      const results = new Set();
      
      // Evaluate the same flag 100 times for the same user
      for (let i = 0; i < 100; i++) {
        const result = service.isEnabled('ai_service_unified', mockUserProfile);
        results.add(result);
      }
      
      // Should always return the same result
      expect(results.size).toBe(1);
    });
  });

  describe('AI Selection Analysis Flag', () => {
    it('should have ai_selection_analysis flag registered and enabled', () => {
      const config = service.exportConfiguration();
      
      expect(config.ai_selection_analysis).toBeDefined();
      expect(config.ai_selection_analysis.enabled).toBe(true);
      expect(config.ai_selection_analysis.rolloutPercentage).toBe(100);
      expect(config.ai_selection_analysis.name).toBe('AI Selection Analysis');
      expect(config.ai_selection_analysis.description).toContain('real-time analysis');
    });

    it('should enable ai_selection_analysis for all users', () => {
      const mockUser: UserProfile = {
        id: 'test-user',
        fitnessLevel: 'beginner',
        experience: 'beginner',
        goals: ['weight_loss'],
        equipment: ['dumbbells'],
        injuries: [],
        limitations: []
      };

      const result = service.isEnabled('ai_selection_analysis', mockUser);
      expect(result).toBe(true);
    });
  });
});

describe('Singleton Instance', () => {
  it('should provide a working singleton instance', () => {
    const flags = featureFlagService.getAIFlags({
      id: 'singleton-test',
      fitnessLevel: 'new to exercise',
      goals: ['weight_loss']
    } as UserProfile);
    
    expect(typeof flags).toBe('object');
    expect(Object.keys(flags).length).toBeGreaterThan(0);
  });
}); 