import { 
  UserProfile, 
  AIEnhancedLimitations, 
  AIWorkoutHistory, 
  AILearningProfile,
  UserBasicLimitations,
  UserPreferences,
  FitnessLevel,
  ExplorationTendency,
  FeedbackPreference,
  TimePreference,
  IntensityLevel,
  AIAssistanceLevel
} from '../../../types/user';
import { ProfileData } from '../../../components/Profile/types/profile.types';
import { profileTransformers } from '../../../utils/dataTransformers';

/**
 * Service responsible for enhancing user profile data with AI-generated insights
 * This separates user-provided data from AI-inferred data
 */
export class UserProfileEnhancer {
  
  /**
   * Enhances basic profile data with AI-generated insights
   */
  static enhanceProfile(profileData: ProfileData): UserProfile {
    return profileTransformers.convertProfileToUserProfileSimple(profileData);
  }

  private static mapExperienceToFitnessLevel(experienceLevel: ProfileData['experienceLevel']): FitnessLevel {
    switch (experienceLevel) {
      case 'New to Exercise': return 'beginner';
      case 'Some Experience': return 'intermediate';
      case 'Advanced Athlete': return 'advanced';
      default: return 'beginner';
    }
  }

  private static buildUserPreferences(profileData: ProfileData): UserPreferences {
    const workoutStyle: string[] = profileData.preferredActivities.map(activity => {
      const normalized = activity.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return normalized || 'general_fitness'; // fallback for empty strings
    });

    const timePreference: TimePreference = 'morning'; // default, could be enhanced with user input
    const intensityPreference: IntensityLevel = profileData.calculatedWorkoutIntensity;
    const advancedFeatures: boolean = profileData.experienceLevel === 'Advanced Athlete';
    const aiAssistanceLevel: AIAssistanceLevel = 'moderate';

    return {
      workoutStyle,
      timePreference,
      intensityPreference,
      advancedFeatures,
      aiAssistanceLevel
    };
  }

  private static buildBasicLimitations(profileData: ProfileData): UserBasicLimitations {
    const injuries: string[] = profileData.injuries.filter(injury => injury !== 'No Injuries');
    const availableEquipment: string[] = [...profileData.availableEquipment]; // explicit copy
    const availableLocations: string[] = [...profileData.availableLocations]; // explicit copy

    return {
      injuries,
      availableEquipment,
      availableLocations
    };
  }



  private static generateEnhancedLimitations(profileData: ProfileData): AIEnhancedLimitations {
    // Calculate time constraints from duration and commitment
    const [minDuration, maxDuration] = this.parseDuration(profileData.preferredDuration);
    const [minDays, maxDays] = this.parseCommitment(profileData.timeCommitment);
    const timeConstraints: number = Math.round((minDuration + maxDuration) / 2 * (minDays + maxDays) / 2);

    // Filter and prioritize equipment
    const equipmentConstraints: string[] = this.prioritizeEquipment(profileData.availableEquipment);

    // Filter and prioritize locations
    const locationConstraints: string[] = this.prioritizeLocations(profileData.availableLocations);

    // Calculate recovery needs based on age and activity
    const age: number = this.parseAge(profileData.age);
    const recoveryNeeds = this.calculateRecoveryNeeds(age, profileData.physicalActivity);

    // Determine progression rate
    const progressionRate: 'conservative' | 'moderate' | 'aggressive' = this.determineProgressionRate(profileData.experienceLevel, profileData.calculatedWorkoutIntensity);

    const mobilityLimitations: string[] = this.inferMobilityLimitations(profileData);

    return {
      timeConstraints,
      equipmentConstraints,
      locationConstraints,
      recoveryNeeds,
      mobilityLimitations,
      progressionRate
    };
  }

  private static generateWorkoutHistory(profileData: ProfileData): AIWorkoutHistory {
    const experienceLevel: ProfileData['experienceLevel'] = profileData.experienceLevel;
    const activityLevel: ProfileData['physicalActivity'] = profileData.physicalActivity;
    
    // Estimate completed workouts based on experience and activity
    let estimatedWorkouts: number = 0;
    switch (experienceLevel) {
      case 'New to Exercise': estimatedWorkouts = 0; break;
      case 'Some Experience': estimatedWorkouts = 25; break;
      case 'Advanced Athlete': estimatedWorkouts = 100; break;
    }

    // Adjust based on activity level
    switch (activityLevel) {
      case 'sedentary': estimatedWorkouts *= 0.3; break;
      case 'light': estimatedWorkouts *= 0.6; break;
      case 'moderate': estimatedWorkouts *= 1.0; break;
      case 'very': estimatedWorkouts *= 1.5; break;
      case 'extremely': estimatedWorkouts *= 2.0; break;
      case 'varies': estimatedWorkouts *= 0.8; break;
    }

    // Calculate average duration
    const [minDuration, maxDuration] = this.parseDuration(profileData.preferredDuration);
    const averageDuration: number = Math.round((minDuration + maxDuration) / 2);

    // Determine consistency score
    const consistencyScore: number = this.calculateConsistencyScore(activityLevel, profileData.timeCommitment);

    const estimatedCompletedWorkouts: number = Math.round(estimatedWorkouts);
    const preferredFocusAreas: string[] = this.inferPreferredFocusAreas(profileData);
    const progressiveEnhancementUsage: Record<string, number> = {};
    const aiRecommendationAcceptance: number = 0.7; // default, could be learned over time
    const plateauRisk: 'low' | 'moderate' | 'high' = this.assessPlateauRisk(profileData);

    return {
      estimatedCompletedWorkouts,
      averageDuration,
      preferredFocusAreas,
      progressiveEnhancementUsage,
      aiRecommendationAcceptance,
      consistencyScore,
      plateauRisk
    };
  }

  private static generateLearningProfile(profileData: ProfileData): AILearningProfile {
    const experienceLevel: ProfileData['experienceLevel'] = profileData.experienceLevel;
    const activityLevel: ProfileData['physicalActivity'] = profileData.physicalActivity;
    const primaryGoal: string = profileData.primaryGoal.toLowerCase();

    const prefersSimplicity: boolean = experienceLevel === 'New to Exercise';
    const explorationTendency: ExplorationTendency = this.determineExplorationTendency(activityLevel, primaryGoal);
    const feedbackPreference: FeedbackPreference = experienceLevel === 'New to Exercise' ? 'simple' : 'detailed';
    const learningStyle: 'visual' | 'kinesthetic' | 'auditory' | 'mixed' = this.determineLearningStyle(profileData);
    const motivationType: 'intrinsic' | 'extrinsic' | 'social' | 'achievement' = this.determineMotivationType(primaryGoal);
    const adaptationSpeed: 'slow' | 'moderate' | 'fast' = this.determineAdaptationSpeed(experienceLevel, activityLevel);

    return {
      prefersSimplicity,
      explorationTendency,
      feedbackPreference,
      learningStyle,
      motivationType,
      adaptationSpeed
    };
  }

  // Helper methods for data parsing and calculations
  private static parseDuration(duration: ProfileData['preferredDuration']): [number, number] {
    switch (duration) {
      case '15-30 min': return [15, 30];
      case '30-45 min': return [30, 45];
      case '45-60 min': return [45, 60];
      case '60+ min': return [60, 90];
      default: return [30, 45];
    }
  }

  private static parseCommitment(commitment: ProfileData['timeCommitment']): [number, number] {
    switch (commitment) {
      case '2-3': return [2, 3];
      case '3-4': return [3, 4];
      case '4-5': return [4, 5];
      case '6-7': return [6, 7];
      default: return [3, 4];
    }
  }

  private static parseAge(age: ProfileData['age']): number {
    const match: RegExpMatchArray | null = age.match(/(\d+)/);
    if (match && match[1]) {
      const parsedAge: number = parseInt(match[1], 10);
      return isNaN(parsedAge) ? 30 : parsedAge;
    }
    return 30; // default fallback
  }

  private static prioritizeEquipment(equipment: ProfileData['availableEquipment']): string[] {
    // Priority order for equipment - using actual schema values
    const priorityOrder: readonly string[] = [
      'Barbells & Weight Plates',
      'Strength Machines',
      'Cardio Machines (Treadmill, Elliptical, Bike)',
      'Functional Training Area (Kettlebells, Resistance Bands, TRX)',
      'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)',
      'Pool (If available)',
      'Dumbbells',
      'Resistance Bands',
      'Kettlebells',
      'Cardio Machine (Treadmill, Bike)',
      'Yoga Mat & Stretching Space',
      'Body Weight',
      'Yoga Mat',
      'Suspension Trainer/TRX',
      'No equipment required'
    ] as const;

    const filteredEquipment: string[] = equipment.filter(eq => priorityOrder.includes(eq));
    const sortedEquipment: string[] = filteredEquipment.sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));
    
    return sortedEquipment;
  }

  private static prioritizeLocations(locations: ProfileData['availableLocations']): string[] {
    // Priority order for locations
    const priorityOrder: readonly string[] = [
      'Gym',
      'Home Gym',
      'Home',
      'Parks/Outdoor Spaces',
      'Swimming Pool',
      'Running Track'
    ] as const;

    const filteredLocations: string[] = locations.filter(loc => priorityOrder.includes(loc));
    const sortedLocations: string[] = filteredLocations.sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));
    
    return sortedLocations;
  }

  private static calculateRecoveryNeeds(age: number, activityLevel: ProfileData['physicalActivity']): {
    restDays: number;
    sleepHours: number;
    hydrationLevel: 'low' | 'moderate' | 'high';
  } {
    let restDays: number = 2;
    let sleepHours: number = 7;
    let hydrationLevel: 'low' | 'moderate' | 'high' = 'moderate';

    // Adjust based on age
    if (age > 50) {
      restDays += 1;
      sleepHours += 1;
    }

    // Adjust based on activity level
    switch (activityLevel) {
      case 'extremely':
        restDays += 1;
        hydrationLevel = 'high';
        break;
      case 'very':
        restDays += 0.5;
        hydrationLevel = 'high';
        break;
      case 'sedentary':
        restDays -= 1;
        hydrationLevel = 'low';
        break;
      case 'varies':
        restDays += 0.25;
        hydrationLevel = 'moderate';
        break;
    }

    const roundedRestDays: number = Math.round(restDays);
    return { restDays: roundedRestDays, sleepHours, hydrationLevel };
  }

  private static determineProgressionRate(experienceLevel: ProfileData['experienceLevel'], calculatedIntensity: ProfileData['calculatedWorkoutIntensity']): 'conservative' | 'moderate' | 'aggressive' {
    if (experienceLevel === 'New to Exercise') return 'conservative';
    if (experienceLevel === 'Advanced Athlete' && calculatedIntensity === 'high') return 'aggressive';
    return 'moderate';
  }

  private static inferMobilityLimitations(profileData: ProfileData): string[] {
    const limitations: string[] = [];
    const age: number = this.parseAge(profileData.age);

    if (age > 50) limitations.push('reduced_flexibility');
    if (profileData.injuries.includes('Lower Back')) limitations.push('back_mobility');
    if (profileData.injuries.includes('Knee')) limitations.push('knee_mobility');
    if (profileData.injuries.includes('Shoulder')) limitations.push('shoulder_mobility');

    return limitations;
  }

  private static inferPreferredFocusAreas(profileData: ProfileData): string[] {
    const focusAreas: string[] = [];
    const goal: string = profileData.primaryGoal.toLowerCase();

    if (goal.includes('strength')) focusAreas.push('strength_training');
    if (goal.includes('cardio')) focusAreas.push('cardiovascular');
    if (goal.includes('flexibility')) focusAreas.push('mobility');
    if (goal.includes('weight loss')) focusAreas.push('fat_burning');
    if (goal.includes('muscle')) focusAreas.push('muscle_building');

    return focusAreas;
  }

  private static calculateConsistencyScore(activityLevel: ProfileData['physicalActivity'], timeCommitment: ProfileData['timeCommitment']): number {
    let score: number = 0.5; // base score

    // Adjust based on activity level
    switch (activityLevel) {
      case 'sedentary': score -= 0.3; break;
      case 'light': score -= 0.1; break;
      case 'moderate': score += 0.1; break;
      case 'very': score += 0.2; break;
      case 'extremely': score += 0.3; break;
      case 'varies': score += 0.0; break;
    }

    // Adjust based on time commitment
    const [minDays]: [number, number] = this.parseCommitment(timeCommitment);
    if (minDays >= 5) score += 0.2;
    else if (minDays >= 3) score += 0.1;

    const finalScore: number = Math.max(0, Math.min(1, score));
    return finalScore;
  }

  private static assessPlateauRisk(profileData: ProfileData): 'low' | 'moderate' | 'high' {
    const experienceLevel: ProfileData['experienceLevel'] = profileData.experienceLevel;
    const activityLevel: ProfileData['physicalActivity'] = profileData.physicalActivity;

    if (experienceLevel === 'New to Exercise') return 'low';
    if (experienceLevel === 'Advanced Athlete' && (activityLevel === 'very' || activityLevel === 'extremely')) return 'high';
    return 'moderate';
  }

  private static determineExplorationTendency(activityLevel: ProfileData['physicalActivity'], primaryGoal: string): ExplorationTendency {
    if (activityLevel === 'extremely' || activityLevel === 'very' || primaryGoal.includes('athletic')) return 'high';
    if (activityLevel === 'sedentary' || primaryGoal.includes('general health')) return 'low';
    return 'moderate';
  }

  private static determineLearningStyle(profileData: ProfileData): 'visual' | 'kinesthetic' | 'auditory' | 'mixed' {
    // This could be enhanced with user preferences, but for now use defaults
    const learningStyle: 'visual' | 'kinesthetic' | 'auditory' | 'mixed' = 'mixed';
    return learningStyle;
  }

  private static determineMotivationType(primaryGoal: string): 'intrinsic' | 'extrinsic' | 'social' | 'achievement' {
    if (primaryGoal.includes('athletic') || primaryGoal.includes('performance')) {
      const motivationType: 'intrinsic' | 'extrinsic' | 'social' | 'achievement' = 'achievement';
      return motivationType;
    }
    if (primaryGoal.includes('general health')) {
      const motivationType: 'intrinsic' | 'extrinsic' | 'social' | 'achievement' = 'intrinsic';
      return motivationType;
    }
    if (primaryGoal.includes('weight loss')) {
      const motivationType: 'intrinsic' | 'extrinsic' | 'social' | 'achievement' = 'extrinsic';
      return motivationType;
    }
    const motivationType: 'intrinsic' | 'extrinsic' | 'social' | 'achievement' = 'intrinsic';
    return motivationType;
  }

  private static determineAdaptationSpeed(experienceLevel: ProfileData['experienceLevel'], activityLevel: ProfileData['physicalActivity']): 'slow' | 'moderate' | 'fast' {
    if (experienceLevel === 'New to Exercise') {
      const adaptationSpeed: 'slow' | 'moderate' | 'fast' = 'slow';
      return adaptationSpeed;
    }
    if (experienceLevel === 'Advanced Athlete' && (activityLevel === 'very' || activityLevel === 'extremely')) {
      const adaptationSpeed: 'slow' | 'moderate' | 'fast' = 'fast';
      return adaptationSpeed;
    }
    const adaptationSpeed: 'slow' | 'moderate' | 'fast' = 'moderate';
    return adaptationSpeed;
  }
} 