import { EquipmentFitCalculator } from '../EquipmentFitCalculator';
import { UserProfile } from '../../../../../../types/user';
import { GeneratedWorkout } from '../../../../../../types/workout-generation.types';
import { ConfidenceContext } from '../../types/confidence.types';

describe('EquipmentFitCalculator', () => {
  let calculator: EquipmentFitCalculator;

  beforeEach(() => {
    calculator = new EquipmentFitCalculator();
  });

  describe('calculate', () => {
    it('should calculate high confidence for well-equipped workout', async () => {
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
          availableEquipment: ['dumbbells', 'barbell', 'bench', 'rack'],
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
        title: 'Full Equipment Strength Training',
        description: 'Comprehensive strength training using all available equipment',
        totalDuration: 2700, // 45 minutes
        estimatedCalories: 350,
        difficulty: 'some experience',
        equipment: ['dumbbells', 'barbell', 'bench'],
        warmup: {
          name: 'Equipment Warmup',
          duration: 300,
          exercises: [
            {
              name: 'Light Dumbbell Curls',
              sets: 1,
              reps: 10,
              equipment: ['dumbbells'],
              instructions: ['Hold dumbbells', 'Perform curls'],
              tips: ['Keep movements controlled'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Begin with light equipment work',
          tips: ['Focus on form', 'Breathe steadily']
        },
        mainWorkout: {
          name: 'Strength Training',
          duration: 1800,
          exercises: [
            {
              name: 'Barbell Bench Press',
              sets: 3,
              reps: 8,
              equipment: ['barbell', 'bench'],
              instructions: ['Lie on bench', 'Lower bar to chest', 'Press up'],
              tips: ['Keep feet flat', 'Control the movement'],
              intensity: 'moderate',
              restBetweenSets: 90
            },
            {
              name: 'Dumbbell Rows',
              sets: 3,
              reps: 10,
              equipment: ['dumbbells'],
              instructions: ['Bend over', 'Pull dumbbell to chest'],
              tips: ['Keep back straight'],
              intensity: 'moderate',
              restBetweenSets: 60
            }
          ],
          instructions: 'Complete all sets with proper form',
          tips: ['Maintain proper form', 'Control the movement']
        },
        cooldown: {
          name: 'Equipment Cooldown',
          duration: 600,
          exercises: [
            {
              name: 'Light Stretching',
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
          tips: ['Hold stretches', 'Relax muscles']
        },
        reasoning: 'Full equipment workout matching available resources',
        personalizedNotes: ['Uses all available equipment', 'Good variety'],
        progressionTips: ['Increase weight gradually'],
        safetyReminders: ['Use spotter for heavy lifts'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.9,
        tags: ['strength', 'equipment', 'comprehensive']
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

    it('should calculate lower confidence for missing equipment', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'beginner',
        goals: ['weight loss'],
        preferences: {
          workoutStyle: ['cardio'],
          timePreference: 'morning',
          intensityPreference: 'low',
          advancedFeatures: false,
          aiAssistanceLevel: 'minimal'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: [], // No equipment available
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
        title: 'Equipment-Heavy Workout',
        description: 'Workout requiring extensive equipment not available',
        totalDuration: 1800, // 30 minutes
        estimatedCalories: 300,
        difficulty: 'some experience',
        equipment: ['barbell', 'kettlebells', 'plyo box', 'resistance bands'], // Equipment not available
        warmup: {
          name: 'Equipment Warmup',
          duration: 300,
          exercises: [
            {
              name: 'Kettlebell Swings',
              sets: 1,
              reps: 10,
              equipment: ['kettlebells'],
              instructions: ['Hold kettlebell', 'Perform swings'],
              tips: ['Keep back straight'],
              intensity: 'moderate',
              restBetweenSets: 0
            }
          ],
          instructions: 'Begin with equipment work',
          tips: ['Focus on form']
        },
        mainWorkout: {
          name: 'Equipment Circuit',
          duration: 1200,
          exercises: [
            {
              name: 'Barbell Squats',
              sets: 3,
              reps: 10,
              equipment: ['barbell'],
              instructions: ['Set up barbell', 'Perform squats'],
              tips: ['Keep chest up'],
              intensity: 'moderate',
              restBetweenSets: 60
            },
            {
              name: 'Box Jumps',
              sets: 3,
              reps: 15,
              equipment: ['plyo box'],
              instructions: ['Jump onto box'],
              tips: ['Land softly'],
              intensity: 'high',
              restBetweenSets: 60
            }
          ],
          instructions: 'Complete all rounds',
          tips: ['Maintain form']
        },
        cooldown: {
          name: 'Stretching',
          duration: 300,
          exercises: [
            {
              name: 'Static Stretches',
              sets: 1,
              reps: 5,
              equipment: [],
              instructions: ['Hold stretches'],
              tips: ['Breathe deeply'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'End with stretching',
          tips: ['Hold stretches']
        },
        reasoning: 'Equipment-heavy workout',
        personalizedNotes: ['Requires equipment'],
        progressionTips: ['Add more weight'],
        safetyReminders: ['Use proper form'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.8,
        tags: ['equipment', 'circuit', 'moderate']
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
          duration: 30,
          focus: 'cardio'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeLessThan(0.75);
      expect(result).toBeGreaterThan(0);
    });

    it('should handle partial equipment matches appropriately', async () => {
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
          availableEquipment: ['dumbbells', 'resistance bands'], // Limited equipment
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
          preferredFocusAreas: ['upper body'],
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
        title: 'Mixed Equipment Workout',
        description: 'Workout using some available and some unavailable equipment',
        totalDuration: 2400, // 40 minutes
        estimatedCalories: 320,
        difficulty: 'some experience',
        equipment: ['dumbbells', 'barbell', 'resistance bands'], // Some available, some not
        warmup: {
          name: 'Mixed Warmup',
          duration: 300,
          exercises: [
            {
              name: 'Dumbbell Arm Circles',
              sets: 1,
              reps: 10,
              equipment: ['dumbbells'],
              instructions: ['Hold dumbbells', 'Perform arm circles'],
              tips: ['Keep movements controlled'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Begin with available equipment',
          tips: ['Focus on form']
        },
        mainWorkout: {
          name: 'Mixed Equipment Training',
          duration: 1500,
          exercises: [
            {
              name: 'Dumbbell Squats',
              sets: 3,
              reps: 12,
              equipment: ['dumbbells'],
              instructions: ['Hold dumbbells', 'Perform squats'],
              tips: ['Keep chest up'],
              intensity: 'moderate',
              restBetweenSets: 60
            },
            {
              name: 'Barbell Rows',
              sets: 3,
              reps: 10,
              equipment: ['barbell'],
              instructions: ['Bend over', 'Pull barbell'],
              tips: ['Keep back straight'],
              intensity: 'moderate',
              restBetweenSets: 60
            },
            {
              name: 'Resistance Band Pulls',
              sets: 3,
              reps: 15,
              equipment: ['resistance bands'],
              instructions: ['Anchor band', 'Pull towards chest'],
              tips: ['Control the movement'],
              intensity: 'moderate',
              restBetweenSets: 45
            }
          ],
          instructions: 'Complete all sets',
          tips: ['Maintain form']
        },
        cooldown: {
          name: 'Stretching',
          duration: 600,
          exercises: [
            {
              name: 'Static Stretches',
              sets: 1,
              reps: 5,
              equipment: [],
              instructions: ['Hold stretches'],
              tips: ['Breathe deeply'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'End with stretching',
          tips: ['Hold stretches']
        },
        reasoning: 'Mixed equipment workout with some substitutions needed',
        personalizedNotes: ['Some equipment substitutions needed'],
        progressionTips: ['Increase resistance gradually'],
        safetyReminders: ['Use proper form'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.7,
        tags: ['mixed', 'equipment', 'moderate']
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
          duration: 40,
          focus: 'strength training'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeGreaterThan(0.4);
      expect(result).toBeLessThan(0.9);
    });

    it('should handle bodyweight-only workouts appropriately', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'beginner',
        goals: ['general fitness'],
        preferences: {
          workoutStyle: ['bodyweight'],
          timePreference: 'morning',
          intensityPreference: 'low',
          advancedFeatures: false,
          aiAssistanceLevel: 'minimal'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: [], // No equipment
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 20,
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
          estimatedCompletedWorkouts: 3,
          averageDuration: 20,
          preferredFocusAreas: ['cardio'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.6,
          consistencyScore: 0.4,
          plateauRisk: 'high'
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
        id: 'test-workout-4',
        title: 'Bodyweight Only Workout',
        description: 'Complete bodyweight workout requiring no equipment',
        totalDuration: 1200, // 20 minutes
        estimatedCalories: 150,
        difficulty: 'new to exercise',
        equipment: [], // No equipment required
        warmup: {
          name: 'Bodyweight Warmup',
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
          instructions: 'Begin with bodyweight movements',
          tips: ['Focus on form', 'Breathe steadily']
        },
        mainWorkout: {
          name: 'Bodyweight Training',
          duration: 600,
          exercises: [
            {
              name: 'Push-ups',
              sets: 2,
              reps: 5,
              equipment: [],
              instructions: ['Start in plank position', 'Lower body', 'Push up'],
              tips: ['Keep body straight'],
              intensity: 'moderate',
              restBetweenSets: 60
            },
            {
              name: 'Bodyweight Squats',
              sets: 2,
              reps: 10,
              equipment: [],
              instructions: ['Stand with feet shoulder-width apart', 'Squat down'],
              tips: ['Keep chest up'],
              intensity: 'moderate',
              restBetweenSets: 60
            }
          ],
          instructions: 'Complete all sets',
          tips: ['Maintain form']
        },
        cooldown: {
          name: 'Stretching',
          duration: 300,
          exercises: [
            {
              name: 'Static Stretches',
              sets: 1,
              reps: 5,
              equipment: [],
              instructions: ['Hold stretches'],
              tips: ['Breathe deeply'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'End with stretching',
          tips: ['Hold stretches']
        },
        reasoning: 'Perfect bodyweight workout for no-equipment situation',
        personalizedNotes: ['No equipment needed', 'Perfect for home'],
        progressionTips: ['Increase reps gradually'],
        safetyReminders: ['Stop if you feel pain'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.9,
        tags: ['bodyweight', 'beginner', 'home']
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
          duration: 20,
          focus: 'general fitness'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeGreaterThan(0.8);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should complete calculation within performance requirements', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'advanced',
        goals: ['strength', 'muscle gain'],
        preferences: {
          workoutStyle: ['strength training'],
          timePreference: 'morning',
          intensityPreference: 'high',
          advancedFeatures: true,
          aiAssistanceLevel: 'comprehensive'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['barbell', 'dumbbells', 'bench', 'rack', 'kettlebells'],
          availableLocations: ['gym']
        },
        enhancedLimitations: {
          timeConstraints: 60,
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
          estimatedCompletedWorkouts: 50,
          averageDuration: 60,
          preferredFocusAreas: ['upper body', 'lower body'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.9,
          consistencyScore: 0.8,
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
        title: 'Advanced Equipment Workout',
        description: 'Complex workout using all available equipment',
        totalDuration: 3600, // 60 minutes
        estimatedCalories: 450,
        difficulty: 'advanced athlete',
        equipment: ['barbell', 'dumbbells', 'bench', 'rack', 'kettlebells'],
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
          name: 'Advanced Equipment Training',
          duration: 2100,
          exercises: [
            {
              name: 'Barbell Deadlifts',
              sets: 4,
              reps: 6,
              equipment: ['barbell'],
              instructions: ['Set up barbell', 'Perform deadlifts'],
              tips: ['Keep back straight'],
              intensity: 'high',
              restBetweenSets: 180
            },
            {
              name: 'Dumbbell Bench Press',
              sets: 4,
              reps: 8,
              equipment: ['dumbbells', 'bench'],
              instructions: ['Lie on bench', 'Press dumbbells'],
              tips: ['Control the movement'],
              intensity: 'high',
              restBetweenSets: 120
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
        reasoning: 'Advanced workout using all available equipment',
        personalizedNotes: ['Uses all equipment', 'Advanced movements'],
        progressionTips: ['Increase weight', 'Add volume'],
        safetyReminders: ['Use spotter', 'Maintain form'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.95,
        tags: ['advanced', 'equipment', 'strength']
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
      expect(calculator.getFactorName()).toBe('equipmentFit');
    });
  });

  describe('getWeight', () => {
    it('should return correct weight', () => {
      expect(calculator.getWeight()).toBe(0.15);
    });
  });

  describe('getDescription', () => {
    it('should return meaningful description', () => {
      const description = calculator.getDescription();
      expect(description).toContain('equipment');
      expect(description).toContain('available');
      expect(description.length).toBeGreaterThan(20);
    });
  });
}); 