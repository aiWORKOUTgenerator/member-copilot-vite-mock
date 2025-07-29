import { SafetyScoreCalculator } from '../SafetyScoreCalculator';
import { UserProfile } from '../../../../../../types/user';
import { GeneratedWorkout } from '../../../../../../types/workout-generation.types';
import { ConfidenceContext } from '../../types/confidence.types';

describe('SafetyScoreCalculator', () => {
  let calculator: SafetyScoreCalculator;

  beforeEach(() => {
    calculator = new SafetyScoreCalculator();
  });

  describe('calculate', () => {
    it('should calculate high safety score for safe workout', async () => {
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
          estimatedCompletedWorkouts: 20,
          averageDuration: 30,
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
        title: 'Safe Strength Training',
        description: 'Moderate intensity strength training with proper form focus',
        totalDuration: 1800, // 30 minutes
        estimatedCalories: 250,
        difficulty: 'some experience',
        equipment: ['dumbbells'],
        warmup: {
          name: 'Gentle Warmup',
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
          instructions: 'Begin with gentle movements',
          tips: ['Focus on form', 'Breathe steadily']
        },
        mainWorkout: {
          name: 'Strength Training',
          duration: 1200,
          exercises: [
            {
              name: 'Dumbbell Squats',
              sets: 3,
              reps: 10,
              equipment: ['dumbbells'],
              instructions: ['Stand with feet shoulder-width apart', 'Hold dumbbells at sides'],
              tips: ['Keep chest up', 'Knees behind toes'],
              intensity: 'moderate',
              restBetweenSets: 90
            }
          ],
          instructions: 'Complete all sets with proper form',
          tips: ['Maintain proper form', 'Control the movement']
        },
        cooldown: {
          name: 'Gentle Cooldown',
          duration: 300,
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
          instructions: 'End with gentle stretching',
          tips: ['Hold stretches', 'Relax muscles']
        },
        reasoning: 'Safe, moderate intensity workout',
        personalizedNotes: ['Focus on form', 'Take your time'],
        progressionTips: ['Increase weight gradually'],
        safetyReminders: ['Stop if you feel pain', 'Maintain proper form'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.85,
        tags: ['strength', 'safe', 'moderate']
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
          focus: 'strength training'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeGreaterThan(0.7);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should calculate lower safety score for high-risk workout', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'beginner',
        goals: ['weight loss'],
        preferences: {
          workoutStyle: ['cardio'],
          timePreference: 'evening',
          intensityPreference: 'low',
          advancedFeatures: false,
          aiAssistanceLevel: 'minimal'
        },
        basicLimitations: {
          injuries: ['knee', 'back'],
          availableEquipment: [],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 20,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 3,
            sleepHours: 6,
            hydrationLevel: 'low'
          },
          mobilityLimitations: ['knee pain', 'back stiffness'],
          progressionRate: 'conservative'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 5,
          averageDuration: 15,
          preferredFocusAreas: ['cardio'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.5,
          consistencyScore: 0.3,
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
        id: 'test-workout-2',
        title: 'High-Intensity Plyometric Training',
        description: 'Explosive movements with jumping and high impact exercises',
        totalDuration: 2400, // 40 minutes
        estimatedCalories: 400,
        difficulty: 'advanced athlete',
        equipment: ['plyo box', 'kettlebells'],
        warmup: {
          name: 'Dynamic Warmup',
          duration: 300,
          exercises: [
            {
              name: 'Jump Rope',
              sets: 1,
              reps: 50,
              equipment: ['jump rope'],
              instructions: ['Jump rope for 1 minute'],
              tips: ['Keep it light'],
              intensity: 'high',
              restBetweenSets: 0
            }
          ],
          instructions: 'High-intensity warmup',
          tips: ['Get your heart rate up']
        },
        mainWorkout: {
          name: 'Plyometric Circuit',
          duration: 1800,
          exercises: [
            {
              name: 'Box Jumps',
              sets: 4,
              reps: 20,
              equipment: ['plyo box'],
              instructions: ['Jump onto box', 'Land softly', 'Jump back down'],
              tips: ['Explosive movement'],
              intensity: 'high',
              restBetweenSets: 30
            },
            {
              name: 'Burpees',
              sets: 4,
              reps: 15,
              equipment: [],
              instructions: ['Drop to push-up position', 'Perform push-up', 'Jump up'],
              tips: ['Full body movement'],
              intensity: 'high',
              restBetweenSets: 30
            }
          ],
          instructions: 'Complete all rounds with maximum effort',
          tips: ['Push yourself to the limit']
        },
        cooldown: {
          name: 'Active Recovery',
          duration: 300,
          exercises: [
            {
              name: 'Light Jogging',
              sets: 1,
              reps: 1,
              equipment: [],
              instructions: ['Jog lightly for 3 minutes'],
              tips: ['Keep it easy'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Light cardio to cool down',
          tips: ['Gradually reduce intensity']
        },
        reasoning: 'High-intensity plyometric workout',
        personalizedNotes: ['High impact', 'Explosive movements'],
        progressionTips: ['Increase height', 'Reduce rest time'],
        safetyReminders: ['Stop if you feel pain', 'Land softly'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.9,
        tags: ['plyometrics', 'high-intensity', 'advanced']
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
          duration: 40,
          focus: 'cardio'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeLessThan(0.6);
      expect(result).toBeGreaterThan(0);
    });

    it('should handle users with injuries appropriately', async () => {
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
          injuries: ['shoulder', 'lower back'],
          availableEquipment: ['dumbbells', 'resistance bands'],
          availableLocations: ['home']
        },
        enhancedLimitations: {
          timeConstraints: 45,
          equipmentConstraints: [],
          locationConstraints: [],
          recoveryNeeds: {
            restDays: 3,
            sleepHours: 8,
            hydrationLevel: 'moderate'
          },
          mobilityLimitations: ['shoulder pain', 'back stiffness'],
          progressionRate: 'conservative'
        },
        workoutHistory: {
          estimatedCompletedWorkouts: 15,
          averageDuration: 45,
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
        title: 'Injury-Aware Strength Training',
        description: 'Modified strength training avoiding shoulder and back stress',
        totalDuration: 2700, // 45 minutes
        estimatedCalories: 300,
        difficulty: 'some experience',
        equipment: ['dumbbells', 'resistance bands'],
        warmup: {
          name: 'Gentle Warmup',
          duration: 600,
          exercises: [
            {
              name: 'Shoulder Rolls',
              sets: 1,
              reps: 10,
              equipment: [],
              instructions: ['Roll shoulders gently'],
              tips: ['Avoid pain'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Gentle warmup focusing on mobility',
          tips: ['Listen to your body', 'Stop if painful']
        },
        mainWorkout: {
          name: 'Modified Strength Training',
          duration: 1500,
          exercises: [
            {
              name: 'Wall Push-ups',
              sets: 3,
              reps: 12,
              equipment: [],
              instructions: ['Stand facing wall', 'Place hands on wall', 'Perform push-up'],
              tips: ['Keep body straight', 'Avoid shoulder strain'],
              intensity: 'low',
              restBetweenSets: 90
            }
          ],
          instructions: 'Modified exercises for injury safety',
          tips: ['Focus on form', 'Avoid pain']
        },
        cooldown: {
          name: 'Gentle Stretching',
          duration: 600,
          exercises: [
            {
              name: 'Gentle Stretches',
              sets: 1,
              reps: 5,
              equipment: [],
              instructions: ['Hold gentle stretches'],
              tips: ['Don\'t force', 'Breathe deeply'],
              intensity: 'low',
              restBetweenSets: 0
            }
          ],
          instructions: 'Gentle stretching and recovery',
          tips: ['Focus on recovery', 'Listen to body']
        },
        reasoning: 'Modified workout for users with injuries',
        personalizedNotes: ['Modified for injuries', 'Focus on safety'],
        progressionTips: ['Gradual progression', 'Listen to body'],
        safetyReminders: ['Stop if painful', 'Focus on form'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.8,
        tags: ['modified', 'injury-safe', 'gentle']
      };

      const context: ConfidenceContext = {
        workoutType: 'detailed',
        generationSource: 'external',
        environmentalFactors: {
          location: 'indoor',
          timeOfDay: 'morning'
        },
        userPreferences: {
          intensity: 'low',
          duration: 45,
          focus: 'strength training'
        }
      };

      const result = await calculator.calculate(userProfile, workoutData, context);

      expect(result).toBeGreaterThan(0.6);
      expect(result).toBeLessThanOrEqual(1.0);
    });

    it('should handle empty workout data gracefully', async () => {
      const userProfile: UserProfile = {
        fitnessLevel: 'beginner',
        goals: ['general fitness'],
        preferences: {
          workoutStyle: ['walking'],
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
          timeConstraints: 15,
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
          estimatedCompletedWorkouts: 2,
          averageDuration: 15,
          preferredFocusAreas: ['cardio'],
          progressiveEnhancementUsage: {},
          aiRecommendationAcceptance: 0.5,
          consistencyScore: 0.3,
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
        title: 'Empty Workout',
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
          availableEquipment: ['barbell', 'dumbbells', 'bench'],
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
        title: 'Advanced Strength Training',
        description: 'Heavy compound movements with proper safety protocols',
        totalDuration: 3600, // 60 minutes
        estimatedCalories: 400,
        difficulty: 'advanced athlete',
        equipment: ['barbell', 'dumbbells', 'bench'],
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
          name: 'Heavy Compound Movements',
          duration: 2100,
          exercises: [
            {
              name: 'Barbell Squats',
              sets: 5,
              reps: 5,
              equipment: ['barbell'],
              instructions: ['Set up barbell on rack', 'Perform squats'],
              tips: ['Keep chest up', 'Knees behind toes'],
              intensity: 'high',
              restBetweenSets: 180
            }
          ],
          instructions: 'Heavy compound movements with proper form',
          tips: ['Focus on form', 'Use spotter if needed']
        },
        cooldown: {
          name: 'Recovery and Stretching',
          duration: 600,
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
        reasoning: 'Advanced strength training with safety focus',
        personalizedNotes: ['Heavy compound movements', 'Focus on form'],
        progressionTips: ['Increase weight gradually', 'Maintain form'],
        safetyReminders: ['Use spotter for heavy lifts', 'Stop if form breaks'],
        generatedAt: new Date(),
        aiModel: 'gpt-4o',
        confidence: 0.9,
        tags: ['strength', 'advanced', 'compound']
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

      expect(result).toBeGreaterThan(0.6);
      expect(result).toBeLessThanOrEqual(1.0);
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('getFactorName', () => {
    it('should return correct factor name', () => {
      expect(calculator.getFactorName()).toBe('safetyAlignment');
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
      expect(description).toContain('safety');
      expect(description).toContain('soreness');
      expect(description.length).toBeGreaterThan(20);
    });
  });
}); 