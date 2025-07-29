import { ProfileMatchCalculator } from '../ProfileMatchCalculator';
import { UserProfile } from '../../../../../types/user';
import { GeneratedWorkout } from '../../../../../types/workout-generation.types';
import { ConfidenceContext } from '../../types/confidence.types';

describe('ProfileMatchCalculator', () => {
  let calculator: ProfileMatchCalculator;

  beforeEach(() => {
    calculator = new ProfileMatchCalculator();
  });

  describe('calculate', () => {
    it('should calculate high confidence for well-matched workout', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['strength', 'muscle gain'],
        preferences: {
          workoutStyle: ['strength training'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['dumbbells', 'barbell'],
          availableLocations: ['gym']
        },
        enhancedLimitations: {
          timeConstraints: 45,
          equipmentConstraints: [],
          locationConstraints: [],
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
          averageDuration: 45,
          preferredFocusAreas: ['upper body', 'core'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.8,
          consistencyScore: 0.7,
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

      const workoutData: GeneratedWorkout = {
        id: 'test-workout-1',
        title: 'Intermediate Strength Training',
        description: 'A comprehensive strength training workout focusing on compound movements and muscle building',
        totalDuration: 2700, // 45 minutes
        estimatedCalories: 350,
        difficulty: 'some experience',
        equipment: ['dumbbells', 'barbell'],
        warmup: {
          name: 'Warmup',
          duration: 300,
          exercises: [
            {
              name: 'Arm Circles',
              sets: 1,
              reps: 10,
              equipment: [],
              instructions: ['Stand with feet shoulder-width apart'],
              tips: ['Keep movements controlled'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Begin with light cardio and dynamic stretching',
          tips: ['Focus on form', 'Breathe steadily']
        },
        mainWorkout: {
          name: 'Strength Training',
          duration: 1800,
          exercises: [
            {
              name: 'Dumbbell Squats',
              sets: 3,
              reps: 12,
              equipment: ['dumbbells'],
              instructions: ['Stand with feet shoulder-width apart', 'Hold dumbbells at sides'],
              tips: ['Keep chest up', 'Knees behind toes'],
              intensity: 'moderate',
              restBetweenSets: 60
            }
          ],
          instructions: 'Complete all sets with proper form',
          tips: ['Maintain proper form', 'Control the movement']
        },
        cooldown: {
          name: 'Cooldown',
          duration: 600,
          exercises: [
            {
              name: 'Static Stretches',
              sets: 1,
              reps: 5,
              equipment: [],
              instructions: ['Hold each stretch for 30 seconds'],
              tips: ['Don\'t bounce', 'Breathe deeply'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'End with stretching and deep breathing',
          tips: ['Hold stretches', 'Relax muscles']
        },
        reasoning: 'This workout provides balanced strength training for intermediate level',
        personalizedNotes: ['Good for muscle building', 'Focus on compound movements'],
        progressionTips: ['Increase weight gradually', 'Add more sets as you progress'],
        safetyReminders: ['Stop if you feel pain', 'Maintain proper form'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.85,
        tags: ['strength', 'intermediate', 'muscle-building']
      };

      const context: ConfidenceContext = {
        workoutType: 'detailed',
        generationSource: 'external',
        environmentalFactors: {
          location: 'indoor',
          timeOfDay: 'morning'
        },
        userPreferences: {
          intensity: 'moderate',
          duration: 45,
          focus: 'strength training'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeGreaterThan(0.7);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should calculate lower confidence for mismatched workout', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'beginner',
        goals: ['weight loss', 'cardio health'],
        preferences: {
          workoutStyle: ['cardio', 'walking'],
          timePreference: 'evening',
          intensityPreference: 'low',
          advancedFeatures: false,
          aiAssistanceLevel: 'low'
        },
        basicLimitations: {
          injuries: ['knee'],
          availableEquipment: [],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 20,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 3,
            sleepHours: 7,
            hydrationLevel: 'low'
          },
          mobilityLimitations: ['knee pain'],
          progressionRate: 'slow'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 5,
          averageDuration: 20,
          preferredFocusAreas: ['cardio'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.5,
          consistencyScore: 0.3,
          plateauRisk: 'high'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'low',
          feedbackPreference: 'minimal',
          learningStyle: 'kinesthetic',
          motivationType: 'extrinsic',
          adaptationSpeed: 'slow'
        }
      };

      const workoutData: GeneratedWorkout = {
        id: 'test-workout-2',
        title: 'Advanced HIIT Training',
        description: 'High-intensity interval training with complex movements and heavy weights',
        totalDuration: 3600, // 60 minutes
        estimatedCalories: 600,
        difficulty: 'advanced athlete',
        equipment: ['barbell', 'kettlebells', 'plyo box'],
        warmup: {
          name: 'Dynamic Warmup',
          duration: 600,
          exercises: [
            {
              name: 'Jump Rope',
              sets: 1,
              reps: 100,
              equipment: ['jump rope'],
              instructions: ['Jump rope for 2 minutes'],
              tips: ['Keep it light'],
              intensity: 'high',
              restBetweenSets: 0
            }
          ],
          instructions: 'High-intensity warmup',
          tips: ['Get your heart rate up']
        },
        mainWorkout: {
          name: 'HIIT Circuit',
          duration: 2400,
          exercises: [
            {
              name: 'Burpee Box Jumps',
              sets: 5,
              reps: 15,
              equipment: ['plyo box'],
              instructions: ['Perform burpee then jump onto box'],
              tips: ['Explosive movement'],
              intensity: 'high',
              restBetweenSets: 30
            }
          ],
          instructions: 'Complete all rounds with maximum effort',
          tips: ['Push yourself to the limit']
        },
        cooldown: {
          name: 'Active Recovery',
          duration: 600,
          exercises: [
            {
              name: 'Light Jogging',
              sets: 1,
              reps: 1,
              equipment: [],
              instructions: ['Jog lightly for 5 minutes'],
              tips: ['Keep it easy'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Light cardio to cool down',
          tips: ['Gradually reduce intensity']
        },
        reasoning: 'Advanced HIIT workout for experienced athletes',
        personalizedNotes: ['High intensity', 'Complex movements'],
        progressionTips: ['Increase reps', 'Reduce rest time'],
        safetyReminders: ['Stop if you feel dizzy', 'Maintain form'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.9,
        tags: ['hiit', 'advanced', 'cardio']
      };

      const context: ConfidenceContext = {
        workoutType: 'detailed',
        generationSource: 'external',
        environmentalFactors: {
          location: 'indoor',
          timeOfDay: 'evening'
        },
        userPreferences: {
          intensity: 'high',
          duration: 60,
          focus: 'hiit'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeLessThan(0.5);
      expect(result).toBeGreaterThan(0);
    });

    it('should handle missing workout data gracefully', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['strength'],
        preferences: {
          workoutStyle: ['strength training'],
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
          timeConstraints: 30,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 8,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'moderate'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 10,
          averageDuration: 30,
          preferredFocusAreas: ['upper body'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.6,
          plateauRisk: 'medium'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'low',
          feedbackPreference: 'moderate',
          learningStyle: 'visual',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      };

      const workoutData: GeneratedWorkout = {
        id: 'test-workout-3',
        title: 'Minimal Workout',
        description: '',
        totalDuration: 0,
        estimatedCalories: 0,
        difficulty: 'new to exercise',
        equipment: [],
        warmup: {
          name: '',
          duration: 0,
          exercises: [],
          instructions: '',
          tips: []
        },
        mainWorkout: {
          name: '',
          duration: 0,
          exercises: [],
          instructions: '',
          tips: []
        },
        cooldown: {
          name: '',
          duration: 0,
          exercises: [],
          instructions: '',
          tips: []
        },
        reasoning: '',
        personalizedNotes: [],
        progressionTips: [],
        safetyReminders: [],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.5,
        tags: []
      };

      const context: ConfidenceContext = {
        workoutType: 'quick',
        generationSource: 'internal',
        environmentalFactors: {
          location: 'indoor',
          timeOfDay: 'morning'
        },
        userPreferences: {
          intensity: 'low',
          duration: 15,
          focus: 'general fitness'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should complete calculation within performance requirements', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'advanced',
        goals: ['muscle gain', 'strength'],
        preferences: {
          workoutStyle: ['strength training', 'bodybuilding'],
          timePreference: 'morning',
          intensityPreference: 'high',
          advancedFeatures: true,
          aiAssistanceLevel: 'high'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['barbell', 'dumbbells', 'bench', 'rack'],
          availableLocations: ['gym']
        },
        enhancedLimitations: {
          timeConstraints: 90,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 1,
            sleepHours: 8,
            hydrationLevel: 'high'
          },
          mobilityLimitations: [],
          progressionRate: 'fast'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 100,
          averageDuration: 90,
          preferredFocusAreas: ['upper body', 'lower body', 'core'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.9,
          consistencyScore: 0.9,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: false,
          explorationTendency: 'high',
          feedbackPreference: 'detailed',
          learningStyle: 'auditory',
          motivationType: 'intrinsic',
          adaptationSpeed: 'fast'
        }
      };

      const workoutData: GeneratedWorkout = {
        id: 'test-workout-4',
        title: 'Advanced Bodybuilding Split',
        description: 'Comprehensive bodybuilding workout with advanced techniques',
        totalDuration: 5400, // 90 minutes
        estimatedCalories: 500,
        difficulty: 'advanced athlete',
        equipment: ['barbell', 'dumbbells', 'bench', 'rack'],
        warmup: {
          name: 'Comprehensive Warmup',
          duration: 900,
          exercises: [
            {
              name: 'Dynamic Stretching',
              sets: 1,
              reps: 10,
              equipment: [],
              instructions: ['Perform dynamic stretches'],
              tips: ['Focus on mobility'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Comprehensive warmup routine',
          tips: ['Prepare for heavy lifting']
        },
        mainWorkout: {
          name: 'Upper Body Focus',
          duration: 3600,
          exercises: [
            {
              name: 'Barbell Bench Press',
              sets: 5,
              reps: 8,
              equipment: ['barbell', 'bench'],
              instructions: ['Lie on bench', 'Lower bar to chest', 'Press up'],
              tips: ['Control the movement', 'Keep feet flat'],
              intensity: 'high',
              restBetweenSets: 120
            }
          ],
          instructions: 'Heavy compound movements',
          tips: ['Focus on progressive overload']
        },
        cooldown: {
          name: 'Stretching and Recovery',
          duration: 900,
          exercises: [
            {
              name: 'Static Stretching',
              sets: 1,
              reps: 5,
              equipment: [],
              instructions: ['Hold stretches for 60 seconds'],
              tips: ['Breathe deeply'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Comprehensive cooldown',
          tips: ['Focus on recovery']
        },
        reasoning: 'Advanced bodybuilding workout for experienced lifters',
        personalizedNotes: ['Heavy compound movements', 'Progressive overload'],
        progressionTips: ['Increase weight weekly', 'Add more volume'],
        safetyReminders: ['Use spotter for heavy lifts', 'Maintain form'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.95,
        tags: ['bodybuilding', 'advanced', 'strength']
      };

      const context: ConfidenceContext = {
        workoutType: 'detailed',
        generationSource: 'external',
        environmentalFactors: {
          location: 'indoor',
          timeOfDay: 'morning'
        },
        userPreferences: {
          intensity: 'high',
          duration: 90,
          focus: 'bodybuilding'
        }
      };

      const startTime = Date.now();
      const result = await calculator.calculate(userProfile, workoutData, context);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(result).toBeGreaterThan(0.6);
      expect(result).toBeLessThanOrEqual(1.0);
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('getFactorName', () => {
    it('should return correct factor name', () => {
      expect(calculator.getFactorName()).toBe('profileMatch');
    });
  });

  describe('getWeight', () => {
    it('should return correct weight', () => {
      expect(calculator.getWeight()).toBe(0.25);
    });
  });

  describe('getDescription', () => {
    it('should return meaningful description', () => {
      const description = calculator.getDescription();
      expect(description).toContain('fitness level');
      expect(description).toContain('intensity');
      expect(description.length).toBeGreaterThan(20);
    });
  });
}); 