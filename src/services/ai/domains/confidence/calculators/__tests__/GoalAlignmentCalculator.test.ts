import { GoalAlignmentCalculator } from '../GoalAlignmentCalculator';
import { UserProfile } from '../../../../../../types/user';
import { GeneratedWorkout } from '../../../../../../types/workout-generation.types';
import { ConfidenceContext } from '../../types/confidence.types';

describe('GoalAlignmentCalculator', () => {
  let calculator: GoalAlignmentCalculator;

  beforeEach(() => {
    calculator = new GoalAlignmentCalculator();
  });

  describe('calculate', () => {
    it('should calculate high confidence for strength goal alignment', async () => {
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
          preferredFocusAreas: ['upper body'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.8,
          consistencyScore: 0.7,
          plateauRisk: 'low'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'low',
          feedbackPreference: 'detailed',
          learningStyle: 'visual',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      };

      const workoutData: GeneratedWorkout = {
        id: 'test-workout-1',
        title: 'Strength Training Focus',
        description: 'Comprehensive strength training workout focusing on compound movements and muscle building',
        totalDuration: 2700, // 45 minutes
        estimatedCalories: 350,
        difficulty: 'some experience',
        equipment: ['dumbbells', 'barbell'],
        warmup: {
          name: 'Strength Warmup',
          duration: 300,
          exercises: [
            {
              name: 'Light Squats',
              sets: 1,
              reps: 10,
              equipment: [],
              instructions: ['Perform bodyweight squats'],
              tips: ['Focus on form'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Begin with light strength movements',
          tips: ['Focus on form', 'Breathe steadily']
        },
        mainWorkout: {
          name: 'Strength Training',
          duration: 1800,
          exercises: [
            {
              name: 'Barbell Squats',
              sets: 4,
              reps: 8,
              equipment: ['barbell'],
              instructions: ['Set up barbell', 'Perform squats'],
              tips: ['Keep chest up', 'Knees behind toes'],
              intensity: 'moderate',
              restBetweenSets: 90
            },
            {
              name: 'Dumbbell Bench Press',
              sets: 3,
              reps: 10,
              equipment: ['dumbbells'],
              instructions: ['Lie on bench', 'Press dumbbells'],
              tips: ['Control the movement'],
              intensity: 'moderate',
              restBetweenSets: 90
            }
          ],
          instructions: 'Complete all sets with proper form',
          tips: ['Maintain proper form', 'Focus on strength']
        },
        cooldown: {
          name: 'Recovery',
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
          instructions: 'End with stretching',
          tips: ['Hold stretches', 'Focus on recovery']
        },
        reasoning: 'Strength-focused workout for muscle building and strength gains',
        personalizedNotes: ['Focus on compound movements', 'Progressive overload'],
        progressionTips: ['Increase weight gradually', 'Add more sets'],
        safetyReminders: ['Use proper form', 'Stop if you feel pain'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.9,
        tags: ['strength', 'muscle-building', 'compound']
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

      expect(result).toBeGreaterThan(0.8);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should calculate lower confidence for goal mismatch', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'beginner',
        goals: ['weight loss', 'cardio health'],
        preferences: {
          workoutStyle: ['cardio', 'walking'],
          timePreference: 'morning',
          intensityPreference: 'low',
          advancedFeatures: false,
          aiAssistanceLevel: 'minimal'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: [],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 30,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 2,
            sleepHours: 7,
            hydrationLevel: 'low'
          },
          mobilityLimitations: [],
          progressionRate: 'conservative'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 5,
          averageDuration: 30,
          preferredFocusAreas: ['cardio'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.5,
          consistencyScore: 0.4,
          plateauRisk: 'moderate'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'low',
          feedbackPreference: 'simple',
          learningStyle: 'kinesthetic',
          motivationType: 'extrinsic',
          adaptationSpeed: 'slow'
        }
      };

      const workoutData: GeneratedWorkout = {
        id: 'test-workout-2',
        title: 'Heavy Strength Training',
        description: 'Intense strength training with heavy weights and long rest periods',
        totalDuration: 3600, // 60 minutes
        estimatedCalories: 400,
        difficulty: 'advanced athlete',
        equipment: ['barbell', 'dumbbells', 'bench'],
        warmup: {
          name: 'Heavy Warmup',
          duration: 600,
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
          instructions: 'Comprehensive warmup for heavy lifting',
          tips: ['Prepare for heavy weights']
        },
        mainWorkout: {
          name: 'Heavy Strength Training',
          duration: 2400,
          exercises: [
            {
              name: 'Barbell Deadlifts',
              sets: 5,
              reps: 5,
              equipment: ['barbell'],
              instructions: ['Set up barbell', 'Perform deadlifts'],
              tips: ['Keep back straight'],
              intensity: 'high',
              restBetweenSets: 180
            },
            {
              name: 'Barbell Bench Press',
              sets: 4,
              reps: 6,
              equipment: ['barbell', 'bench'],
              instructions: ['Lie on bench', 'Press barbell'],
              tips: ['Control the movement'],
              intensity: 'high',
              restBetweenSets: 150
            }
          ],
          instructions: 'Heavy compound movements',
          tips: ['Focus on form', 'Use spotter']
        },
        cooldown: {
          name: 'Recovery',
          duration: 600,
          exercises: [
            {
              name: 'Static Stretching',
              sets: 1,
              reps: 5,
              equipment: [],
              instructions: ['Hold stretches'],
              tips: ['Breathe deeply'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Comprehensive cooldown',
          tips: ['Focus on recovery']
        },
        reasoning: 'Heavy strength training for advanced lifters',
        personalizedNotes: ['Heavy compound movements', 'Long rest periods'],
        progressionTips: ['Increase weight', 'Add volume'],
        safetyReminders: ['Use spotter', 'Maintain form'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.9,
        tags: ['strength', 'heavy', 'advanced']
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
          duration: 60,
          focus: 'strength training'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeLessThan(0.7);
      expect(result).toBeGreaterThan(0);
    });

    it('should handle multiple goals appropriately', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'intermediate',
        goals: ['weight loss', 'cardio health', 'general fitness'],
        preferences: {
          workoutStyle: ['cardio', 'strength training'],
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
          timeConstraints: 40,
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
          estimatedCompletedWorkouts: 15,
          averageDuration: 40,
          preferredFocusAreas: ['cardio', 'upper body'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.7,
          consistencyScore: 0.6,
          plateauRisk: 'moderate'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'low',
          feedbackPreference: 'detailed',
          learningStyle: 'visual',
          motivationType: 'intrinsic',
          adaptationSpeed: 'moderate'
        }
      };

      const workoutData: GeneratedWorkout = {
        id: 'test-workout-3',
        title: 'Mixed Cardio and Strength',
        description: 'Balanced workout combining cardio and strength training',
        totalDuration: 2400, // 40 minutes
        estimatedCalories: 300,
        difficulty: 'some experience',
        equipment: ['dumbbells'],
        warmup: {
          name: 'Mixed Warmup',
          duration: 300,
          exercises: [
            {
              name: 'Light Jogging',
              sets: 1,
              reps: 1,
              equipment: [],
              instructions: ['Jog in place for 3 minutes'],
              tips: ['Keep it light'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Begin with light cardio',
          tips: ['Focus on form', 'Breathe steadily']
        },
        mainWorkout: {
          name: 'Mixed Training',
          duration: 1500,
          exercises: [
            {
              name: 'Jumping Jacks',
              sets: 3,
              reps: 20,
              equipment: [],
              instructions: ['Perform jumping jacks'],
              tips: ['Keep moving'],
              intensity: 'moderate',
              restBetweenSets: 30
            },
            {
              name: 'Dumbbell Squats',
              sets: 3,
              reps: 12,
              equipment: ['dumbbells'],
              instructions: ['Hold dumbbells', 'Perform squats'],
              tips: ['Keep chest up'],
              intensity: 'moderate',
              restBetweenSets: 60
            }
          ],
          instructions: 'Alternate cardio and strength',
          tips: ['Maintain form', 'Keep heart rate up']
        },
        cooldown: {
          name: 'Cool Down',
          duration: 600,
          exercises: [
            {
              name: 'Light Walking',
              sets: 1,
              reps: 1,
              equipment: [],
              instructions: ['Walk slowly for 5 minutes'],
              tips: ['Gradually slow down'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'End with light cardio',
          tips: ['Gradually reduce intensity']
        },
        reasoning: 'Balanced workout for multiple fitness goals',
        personalizedNotes: ['Good for weight loss', 'Balanced approach'],
        progressionTips: ['Increase intensity gradually'],
        safetyReminders: ['Stop if you feel pain'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.8,
        tags: ['mixed', 'cardio', 'strength']
      };

      const context: ConfidenceContext = {
        workoutType: 'quick',
        generationSource: 'external',
        environmentalFactors: {
          location: 'indoor',
          timeOfDay: 'morning'
        },
        userPreferences: {
          intensity: 'moderate',
          duration: 40,
          focus: 'mixed training'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeGreaterThan(0.6);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should handle flexibility goals appropriately', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'beginner',
        goals: ['flexibility', 'mobility'],
        preferences: {
          workoutStyle: ['yoga', 'stretching'],
          timePreference: 'evening',
          intensityPreference: 'low',
          advancedFeatures: false,
          aiAssistanceLevel: 'minimal'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: [],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 30,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 1,
            sleepHours: 8,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: [],
          progressionRate: 'conservative'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 8,
          averageDuration: 30,
          preferredFocusAreas: ['flexibility'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.6,
          consistencyScore: 0.5,
          plateauRisk: 'moderate'
        },
        learningProfile: {
          prefersSimplicity: true,
          explorationTendency: 'low',
          feedbackPreference: 'simple',
          learningStyle: 'kinesthetic',
          motivationType: 'intrinsic',
          adaptationSpeed: 'slow'
        }
      };

      const workoutData: GeneratedWorkout = {
        id: 'test-workout-4',
        title: 'Flexibility and Mobility',
        description: 'Gentle stretching and mobility workout',
        totalDuration: 1800, // 30 minutes
        estimatedCalories: 100,
        difficulty: 'new to exercise',
        equipment: [],
        warmup: {
          name: 'Gentle Warmup',
          duration: 300,
          exercises: [
            {
              name: 'Arm Circles',
              sets: 1,
              reps: 10,
              equipment: [],
              instructions: ['Perform gentle arm circles'],
              tips: ['Keep movements slow'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Begin with gentle movements',
          tips: ['Focus on breathing', 'Take your time']
        },
        mainWorkout: {
          name: 'Stretching and Mobility',
          duration: 900,
          exercises: [
            {
              name: 'Hamstring Stretches',
              sets: 2,
              reps: 3,
              equipment: [],
              instructions: ['Sit on floor', 'Reach for toes'],
              tips: ['Don\'t force', 'Breathe deeply'],
              intensity: 'low',
              restBetweenSets: 30
            },
            {
              name: 'Hip Flexor Stretches',
              sets: 2,
              reps: 3,
              equipment: [],
              instructions: ['Lunge position', 'Hold stretch'],
              tips: ['Keep back straight'],
              intensity: 'low',
              restBetweenSets: 30
            }
          ],
          instructions: 'Hold each stretch',
          tips: ['Don\'t bounce', 'Breathe deeply']
        },
        cooldown: {
          name: 'Relaxation',
          duration: 600,
          exercises: [
            {
              name: 'Deep Breathing',
              sets: 1,
              reps: 5,
              equipment: [],
              instructions: ['Sit comfortably', 'Breathe deeply'],
              tips: ['Focus on breath'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'End with relaxation',
          tips: ['Focus on breathing', 'Relax']
        },
        reasoning: 'Gentle flexibility and mobility workout',
        personalizedNotes: ['Good for flexibility', 'Gentle approach'],
        progressionTips: ['Hold stretches longer', 'Add more stretches'],
        safetyReminders: ['Don\'t force stretches', 'Stop if painful'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.9,
        tags: ['flexibility', 'mobility', 'gentle']
      };

      const context: ConfidenceContext = {
        workoutType: 'quick',
        generationSource: 'internal',
        environmentalFactors: {
          location: 'indoor',
          timeOfDay: 'evening'
        },
        userPreferences: {
          intensity: 'low',
          duration: 30,
          focus: 'flexibility'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeGreaterThan(0.8);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should complete calculation within performance requirements', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'advanced',
        goals: ['muscle gain', 'strength', 'performance'],
        preferences: {
          workoutStyle: ['strength training', 'bodybuilding'],
          timePreference: 'morning',
          intensityPreference: 'high',
          advancedFeatures: true,
          aiAssistanceLevel: 'comprehensive'
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
          progressionRate: 'aggressive'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 100,
          averageDuration: 90,
          preferredFocusAreas: ['upper body', 'lower body'],
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
        id: 'test-workout-5',
        title: 'Advanced Bodybuilding',
        description: 'Comprehensive bodybuilding workout for muscle gain and strength',
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
          name: 'Bodybuilding Training',
          duration: 3600,
          exercises: [
            {
              name: 'Barbell Bench Press',
              sets: 5,
              reps: 8,
              equipment: ['barbell', 'bench'],
              instructions: ['Lie on bench', 'Press barbell'],
              tips: ['Control the movement'],
              intensity: 'high',
              restBetweenSets: 120
            },
            {
              name: 'Barbell Squats',
              sets: 4,
              reps: 10,
              equipment: ['barbell'],
              instructions: ['Set up barbell', 'Perform squats'],
              tips: ['Keep chest up'],
              intensity: 'high',
              restBetweenSets: 120
            }
          ],
          instructions: 'Heavy compound movements',
          tips: ['Focus on form', 'Progressive overload']
        },
        cooldown: {
          name: 'Recovery',
          duration: 900,
          exercises: [
            {
              name: 'Static Stretching',
              sets: 1,
              reps: 5,
              equipment: [],
              instructions: ['Hold stretches'],
              tips: ['Breathe deeply'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Comprehensive cooldown',
          tips: ['Focus on recovery']
        },
        reasoning: 'Advanced bodybuilding workout for muscle gain',
        personalizedNotes: ['Heavy compound movements', 'Progressive overload'],
        progressionTips: ['Increase weight', 'Add volume'],
        safetyReminders: ['Use spotter', 'Maintain form'],
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

      expect(result).toBeGreaterThan(0.8);
      expect(result).toBeLessThanOrEqual(1.0);
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('getFactorName', () => {
    it('should return correct factor name', () => {
      expect(calculator.getFactorName()).toBe('goalAlignment');
    });
  });

  describe('getWeight', () => {
    it('should return correct weight', () => {
      expect(calculator.getWeight()).toBe(0.20);
    });
  });

  describe('getDescription', () => {
    it('should return meaningful description', () => {
      const description = calculator.getDescription();
      expect(description).toContain('goal');
      expect(description).toContain('aligns');
      expect(description.length).toBeGreaterThan(20);
    });
  });
}); 