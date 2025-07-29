import { DataTransformerBase } from '../core/DataTransformerBase';
import { ProfileData } from '../../../../../components/Profile/types/profile.types';
import { UserProfile } from '../../../../../types/user';
import { validateProfileData } from '../validators/ProfileDataValidator';
import { DEFAULT_VALUES, DERIVED_VALUE_MAPS } from '../constants/DefaultValues';
import { validatePreferredActivities, validateAvailableLocations, validateInjuries } from '../utils/ArrayTransformUtils';

/**
 * Transforms ProfileData to structured UserProfile for app logic
 * This transformer creates the structured UserProfile objects that the app expects,
 * as opposed to the flat PromptVariables used for AI generation.
 * 
 * Uses existing DataTransformer infrastructure for consistency and maintainability.
 */
export class UserProfileTransformer extends DataTransformerBase<ProfileData, UserProfile> {
  
  /**
   * Transform ProfileData to UserProfile
   */
  transform(profileData: ProfileData): UserProfile {
    this.log('🔄 UserProfileTransformer: Transforming ProfileData to UserProfile', {
      hasExperienceLevel: !!profileData.experienceLevel,
      hasPrimaryGoal: !!profileData.primaryGoal,
      totalFields: Object.keys(profileData || {}).length
    });

    try {
      // Use existing validation infrastructure - but don't fail on validation errors
      const validation = validateProfileData(profileData);
      if (!validation.isValid) {
        this.log('⚠️ Profile validation warnings (continuing with transformation):', validation.errors);
        // Continue with transformation even if validation fails
      }

      // Use existing derived value calculations
      const fitnessLevel = DERIVED_VALUE_MAPS.calculateFitnessLevel(
        profileData.experienceLevel,
        profileData.physicalActivity
      );
      
      // Create goals array from primary goal
      const goals = profileData.primaryGoal ? [profileData.primaryGoal] : ['general fitness'];
      
      // Build preferences using existing utilities and defaults
      const preferences = this.buildUserPreferences(profileData, fitnessLevel);
      
      // Build basic limitations using existing utilities
      const basicLimitations = this.buildBasicLimitations(profileData);
      
      // Build enhanced limitations using existing derived value maps
      const enhancedLimitations = this.buildEnhancedLimitations(profileData, fitnessLevel);
      
      // Build workout history using existing derived value maps
      const workoutHistory = this.buildWorkoutHistory(profileData, fitnessLevel);
      
      // Build learning profile using existing derived value maps
      const learningProfile = this.buildLearningProfile(profileData, fitnessLevel);

      const userProfile: UserProfile = {
        fitnessLevel,
        goals,
        preferences,
        basicLimitations,
        enhancedLimitations,
        workoutHistory,
        learningProfile,
        // Optional personal metrics - convert string types to numbers
        age: profileData.age ? DERIVED_VALUE_MAPS.parseAgeRange(profileData.age) : undefined,
        weight: profileData.weight ? DERIVED_VALUE_MAPS.parseWeight(profileData.weight) : undefined,
        height: profileData.height ? DERIVED_VALUE_MAPS.parseHeight(profileData.height) : undefined,
        gender: profileData.gender
      };

      this.log('✅ UserProfileTransformer: UserProfile created successfully', {
        fitnessLevel: userProfile.fitnessLevel,
        goalsCount: userProfile.goals.length,
        hasPreferences: !!userProfile.preferences,
        hasBasicLimitations: !!userProfile.basicLimitations
      });

      return userProfile;

    } catch (error) {
      this.log('❌ UserProfileTransformer: Transformation failed', error);
      return this.handleError(error as Error);
    }
  }

  /**
   * Build UserPreferences object using existing utilities and defaults
   */
  private buildUserPreferences(profileData: ProfileData, fitnessLevel: string) {
    return {
      workoutStyle: validatePreferredActivities(profileData.preferredActivities),
      timePreference: this.inferTimePreference(profileData),
      intensityPreference: DERIVED_VALUE_MAPS.calculateWorkoutIntensity(
        profileData.intensityLevel,
        profileData.timeCommitment
      ),
      advancedFeatures: false, // Default to false for safety
      aiAssistanceLevel: 'moderate' as const // Default moderate assistance
    };
  }

  /**
   * Infer time preference from available data
   */
  private inferTimePreference(profileData: ProfileData): 'morning' | 'afternoon' | 'evening' {
    // Default to morning if no preference available
    return 'morning';
  }

  /**
   * Build UserBasicLimitations object using existing utilities
   */
  private buildBasicLimitations(profileData: ProfileData) {
    return {
      injuries: validateInjuries(profileData.injuries),
      availableEquipment: profileData.availableEquipment || DEFAULT_VALUES.profile.availableEquipment,
      availableLocations: validateAvailableLocations(profileData.availableLocations)
    };
  }

  /**
   * Build AIEnhancedLimitations object using existing derived value maps
   */
  private buildEnhancedLimitations(profileData: ProfileData, fitnessLevel: string) {
    return {
      timeConstraints: this.calculateTimeConstraints(profileData),
      equipmentConstraints: this.filterEquipmentConstraints(profileData.availableEquipment),
      locationConstraints: this.filterLocationConstraints(profileData.availableLocations),
      recoveryNeeds: DERIVED_VALUE_MAPS.calculateRecoveryNeeds(fitnessLevel as any),
      mobilityLimitations: this.inferMobilityLimitations(profileData),
      progressionRate: DERIVED_VALUE_MAPS.determineProgressionRate(fitnessLevel as any)
    };
  }

  /**
   * Calculate time constraints based on profile data
   */
  private calculateTimeConstraints(profileData: ProfileData): number {
    // Default to 30 minutes if no specific constraint
    return 30;
  }

  /**
   * Filter and prioritize equipment constraints
   */
  private filterEquipmentConstraints(equipment?: string[]): string[] {
    if (!equipment || equipment.length === 0) {
      return ['body_weight']; // Default to body weight exercises
    }
    return equipment.filter(e => e && e.trim().length > 0);
  }

  /**
   * Filter and prioritize location constraints
   */
  private filterLocationConstraints(locations?: string[]): string[] {
    if (!locations || locations.length === 0) {
      return ['home']; // Default to home workouts
    }
    return locations.filter(l => l && l.trim().length > 0);
  }

  /**
   * Infer mobility limitations from profile data
   */
  private inferMobilityLimitations(profileData: ProfileData): string[] {
    const limitations: string[] = [];
    
    if (profileData.injuries && profileData.injuries.length > 0) {
      limitations.push(...profileData.injuries);
    }
    
    // Add age-based limitations
    if (profileData.age && profileData.age !== '18-25') {
      limitations.push('reduced_mobility');
    }
    
    return limitations;
  }

  /**
   * Build AIWorkoutHistory object using existing derived value maps
   */
  private buildWorkoutHistory(profileData: ProfileData, fitnessLevel: string) {
    return {
      estimatedCompletedWorkouts: DERIVED_VALUE_MAPS.estimateCompletedWorkouts(fitnessLevel as any),
      averageDuration: this.estimateAverageDuration(profileData),
      preferredFocusAreas: this.inferPreferredFocusAreas(profileData),
      progressiveEnhancementUsage: {},
      aiRecommendationAcceptance: 0.7, // Default 70% acceptance
      consistencyScore: DERIVED_VALUE_MAPS.calculateConsistencyScore(fitnessLevel as any),
      plateauRisk: DERIVED_VALUE_MAPS.assessPlateauRisk(fitnessLevel as any)
    };
  }

  /**
   * Estimate average workout duration
   */
  private estimateAverageDuration(profileData: ProfileData): number {
    // Default to 30 minutes
    return 30;
  }

  /**
   * Infer preferred focus areas from profile data
   */
  private inferPreferredFocusAreas(profileData: ProfileData): string[] {
    if (profileData.primaryGoal) {
      return [profileData.primaryGoal];
    }
    return ['general fitness'];
  }

  /**
   * Build AILearningProfile object using existing derived value maps
   */
  private buildLearningProfile(profileData: ProfileData, fitnessLevel: string) {
    return {
      prefersSimplicity: this.determineSimplicityPreference(fitnessLevel),
      explorationTendency: DERIVED_VALUE_MAPS.determineExplorationTendency(fitnessLevel as any),
      feedbackPreference: this.determineFeedbackPreference(fitnessLevel),
      learningStyle: 'mixed' as const,
      motivationType: 'intrinsic' as const,
      adaptationSpeed: DERIVED_VALUE_MAPS.determineAdaptationSpeed(fitnessLevel as any)
    };
  }

  /**
   * Determine simplicity preference based on fitness level
   */
  private determineSimplicityPreference(fitnessLevel: string): boolean {
    return ['beginner', 'novice'].includes(fitnessLevel);
  }

  /**
   * Determine feedback preference based on fitness level
   */
  private determineFeedbackPreference(fitnessLevel: string): 'simple' | 'detailed' {
    return ['beginner', 'novice'].includes(fitnessLevel) ? 'simple' : 'detailed';
  }

  /**
   * Validate the transformation result
   */
  validate(result: UserProfile): boolean {
    if (!result.fitnessLevel) {
      this.log('❌ UserProfileTransformer: Missing fitnessLevel');
      return false;
    }
    
    if (!result.goals || result.goals.length === 0) {
      this.log('❌ UserProfileTransformer: Missing goals');
      return false;
    }
    
    if (!result.preferences) {
      this.log('❌ UserProfileTransformer: Missing preferences');
      return false;
    }
    
    if (!result.basicLimitations) {
      this.log('❌ UserProfileTransformer: Missing basicLimitations');
      return false;
    }
    
    this.log('✅ UserProfileTransformer: Validation passed');
    return true;
  }
} 