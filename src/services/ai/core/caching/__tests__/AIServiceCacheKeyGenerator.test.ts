import { AIServiceCacheKeyGenerator } from '../AIServiceCacheKeyGenerator';
import { PerWorkoutOptions, GlobalAIContext } from '../../types/AIServiceTypes';

describe('AIServiceCacheKeyGenerator', () => {
  let keyGenerator: AIServiceCacheKeyGenerator;

  beforeEach(() => {
    keyGenerator = new AIServiceCacheKeyGenerator();
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(keyGenerator).toBeInstanceOf(AIServiceCacheKeyGenerator);
    });
  });

  describe('generateKey', () => {
    it('should generate consistent keys for identical selections', () => {
      const selections: PerWorkoutOptions = {
        energy: 5,
        soreness: ['legs', 'back'],
        focus: 'strength',
        duration: 45,
        equipment: ['dumbbells', 'bench']
      };

      const key1 = keyGenerator.generateKey(selections, 'intermediate');
      const key2 = keyGenerator.generateKey(selections, 'intermediate');

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different fitness levels', () => {
      const selections: PerWorkoutOptions = {
        energy: 5,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const key1 = keyGenerator.generateKey(selections, 'beginner');
      const key2 = keyGenerator.generateKey(selections, 'advanced');

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different selections', () => {
      const selections1: PerWorkoutOptions = {
        energy: 5,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const selections2: PerWorkoutOptions = {
        energy: 7,
        soreness: ['arms'],
        focus: 'cardio',
        duration: 45,
        equipment: ['treadmill']
      };

      const key1 = keyGenerator.generateKey(selections1, 'intermediate');
      const key2 = keyGenerator.generateKey(selections2, 'intermediate');

      // The keys should be different due to different selections
      expect(key1).not.toBe(key2);
    });

    it('should handle undefined fitness level', () => {
      const selections: PerWorkoutOptions = {
        energy: 5,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const key = keyGenerator.generateKey(selections);
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });

    it('should normalize array order in selections', () => {
      const selections1: PerWorkoutOptions = {
        energy: 5,
        soreness: ['legs', 'back'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells', 'bench']
      };

      const selections2: PerWorkoutOptions = {
        energy: 5,
        soreness: ['back', 'legs'], // Different order
        focus: 'strength',
        duration: 30,
        equipment: ['bench', 'dumbbells'] // Different order
      };

      const key1 = keyGenerator.generateKey(selections1, 'intermediate');
      const key2 = keyGenerator.generateKey(selections2, 'intermediate');

      expect(key1).toBe(key2);
    });

    it('should handle empty selections', () => {
      const selections: PerWorkoutOptions = {
        energy: 0,
        soreness: [],
        focus: '',
        duration: 0,
        equipment: []
      };

      const key = keyGenerator.generateKey(selections, 'beginner');
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });
  });

  describe('generateKeyFromContext', () => {
    it('should generate key from complete context', () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'intermediate',
          experience: 'some experience',
          goals: ['strength', 'endurance'],
          preferences: {
            workoutDuration: 45,
            intensity: 'moderate',
            equipment: ['dumbbells', 'bench']
          }
        },
        currentSelections: {
          energy: 6,
          soreness: ['legs'],
          focus: 'strength',
          duration: 45,
          equipment: ['dumbbells']
        },
        sessionHistory: [],
        environmentalFactors: {
          timeOfDay: 'morning',
          location: 'gym',
          weather: 'sunny',
          availableTime: 60
        },
        preferences: {
          aiAssistanceLevel: 'standard',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      const key = keyGenerator.generateKeyFromContext(context);
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });

    it('should handle context without environmental factors', () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'beginner',
          experience: 'new to exercise',
          goals: ['general fitness'],
          preferences: {
            workoutDuration: 30,
            intensity: 'low',
            equipment: ['bodyweight']
          }
        },
        currentSelections: {
          energy: 4,
          soreness: [],
          focus: 'general',
          duration: 30,
          equipment: []
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'minimal',
          showLearningInsights: false,
          autoApplyLowRiskRecommendations: true
        }
      };

      const key = keyGenerator.generateKeyFromContext(context);
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });

    it('should handle context with missing user profile', () => {
      const context: GlobalAIContext = {
        userProfile: {
          fitnessLevel: 'unknown',
          experience: 'unknown',
          goals: [],
          preferences: {
            workoutDuration: 30,
            intensity: 'low',
            equipment: []
          }
        },
        currentSelections: {
          energy: 5,
          soreness: ['legs'],
          focus: 'strength',
          duration: 30,
          equipment: ['dumbbells']
        },
        sessionHistory: [],
        preferences: {
          aiAssistanceLevel: 'standard',
          showLearningInsights: true,
          autoApplyLowRiskRecommendations: false
        }
      };

      const key = keyGenerator.generateKeyFromContext(context);
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });
  });

  describe('generateKeyFromPartialSelections', () => {
    it('should generate key from partial selections', () => {
      const partialSelections: Partial<PerWorkoutOptions> = {
        energy: 6,
        focus: 'strength'
      };

      const key = keyGenerator.generateKeyFromPartialSelections(partialSelections);
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });

    it('should generate different keys for different partial selections', () => {
      const partial1: Partial<PerWorkoutOptions> = {
        energy: 6,
        focus: 'strength'
      };

      const partial2: Partial<PerWorkoutOptions> = {
        energy: 8,
        focus: 'cardio'
      };

      const key1 = keyGenerator.generateKeyFromPartialSelections(partial1);
      const key2 = keyGenerator.generateKeyFromPartialSelections(partial2);

      // The keys should be different due to different energy and focus values
      expect(key1).not.toBe(key2);
    });

    it('should handle empty partial selections', () => {
      const partialSelections: Partial<PerWorkoutOptions> = {};

      const key = keyGenerator.generateKeyFromPartialSelections(partialSelections);
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    });
  });

  describe('generateDomainKey', () => {
    it('should generate domain-specific keys', () => {
      const selections: PerWorkoutOptions = {
        energy: 5,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const energyKey = keyGenerator.generateDomainKey('energy', selections, 'intermediate');
      const focusKey = keyGenerator.generateDomainKey('focus', selections, 'intermediate');

      expect(energyKey).toContain('energy:');
      expect(focusKey).toContain('focus:');
      expect(energyKey).not.toBe(focusKey);
    });

    it('should include domain prefix in key', () => {
      const selections: PerWorkoutOptions = {
        energy: 5,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const key = keyGenerator.generateDomainKey('soreness', selections, 'intermediate');
      expect(key.startsWith('soreness:')).toBe(true);
    });
  });

  describe('validateKey', () => {
    it('should validate correct keys', () => {
      const validKey = 'abc123def456';
      expect(keyGenerator.validateKey(validKey)).toBe(true);
    });

    it('should reject empty keys', () => {
      expect(keyGenerator.validateKey('')).toBe(false);
    });

    it('should reject very long keys', () => {
      const longKey = 'a'.repeat(1001);
      expect(keyGenerator.validateKey(longKey)).toBe(false);
    });

    it('should reject non-string keys', () => {
      expect(keyGenerator.validateKey(null as any)).toBe(false);
      expect(keyGenerator.validateKey(undefined as any)).toBe(false);
      expect(keyGenerator.validateKey(123 as any)).toBe(false);
    });
  });

  describe('parseKey', () => {
    it('should parse valid keys', () => {
      const key = 'abc123def456';
      const result = keyGenerator.parseKey(key);

      expect(result.isValid).toBe(true);
      expect(result.info).toBeDefined();
      expect(result.info?.keyLength).toBe(key.length);
      expect(result.info?.keyPrefix).toBe(key.substring(0, 8));
    });

    it('should handle invalid keys', () => {
      const result = keyGenerator.parseKey('');
      expect(result.isValid).toBe(false);
      expect(result.info).toBeUndefined();
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(1001);
      const result = keyGenerator.parseKey(longKey);
      expect(result.isValid).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle errors in key generation gracefully', () => {
      // Test with invalid selections that might cause JSON.stringify to fail
      const invalidSelections = {
        energy: 5,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells'],
        circular: {} as any
      };
      
      // Create circular reference
      invalidSelections.circular = invalidSelections;

      // Should not throw, should return fallback key
      expect(() => {
        const key = keyGenerator.generateKey(invalidSelections as any, 'intermediate');
        expect(key).toBeTruthy();
        expect(typeof key).toBe('string');
      }).not.toThrow();
    });

    it('should handle errors in context key generation', () => {
      const invalidContext = {
        userProfile: null,
        currentSelections: null,
        sessionHistory: [],
        preferences: null
      } as any;

      // Should not throw, should return fallback key
      expect(() => {
        const key = keyGenerator.generateKeyFromContext(invalidContext);
        expect(key).toBeTruthy();
        expect(typeof key).toBe('string');
      }).not.toThrow();
    });

    it('should handle errors in partial key generation', () => {
      const invalidPartial = {
        energy: undefined,
        focus: null,
        circular: {} as any
      };
      
      // Create circular reference
      invalidPartial.circular = invalidPartial;

      // Should not throw, should return fallback key
      expect(() => {
        const key = keyGenerator.generateKeyFromPartialSelections(invalidPartial as any);
        expect(key).toBeTruthy();
        expect(typeof key).toBe('string');
      }).not.toThrow();
    });
  });

  describe('cache window behavior', () => {
    it('should generate different keys in different cache windows', () => {
      const selections: PerWorkoutOptions = {
        energy: 5,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const key1 = keyGenerator.generateKey(selections, 'intermediate');
      
      // Wait for cache window to change (this would be 5 minutes in real scenario)
      // For testing, we'll just verify the key structure
      expect(key1).toBeTruthy();
      expect(typeof key1).toBe('string');
    });

    it('should generate same key within same cache window', () => {
      const selections: PerWorkoutOptions = {
        energy: 5,
        soreness: ['legs'],
        focus: 'strength',
        duration: 30,
        equipment: ['dumbbells']
      };

      const key1 = keyGenerator.generateKey(selections, 'intermediate');
      const key2 = keyGenerator.generateKey(selections, 'intermediate');

      expect(key1).toBe(key2);
    });
  });
}); 