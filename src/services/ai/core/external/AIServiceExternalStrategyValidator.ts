import { AIServiceComponent } from '../utils/AIServiceBase';
import { GlobalAIContext, AIServiceWorkoutRequest } from '../types/AIServiceTypes';
import { PerWorkoutOptions, UserProfile } from '../../../../types';

/**
 * Validates external AI strategies and related data structures
 * Ensures data integrity and proper functionality of external AI integrations
 */
export class AIServiceExternalStrategyValidator extends AIServiceComponent {
  
  /**
   * Validate external AI strategy object
   */
  validateStrategy(strategy: any): boolean {
    if (!strategy || typeof strategy !== 'object') {
      this.log('error', 'Strategy validation failed: strategy is not an object');
      return false;
    }

    // Check for required methods
    const requiredMethods = [
      'generateWorkout',
      'generateRecommendations',
      'enhanceInsights',
      'analyzeUserPreferences'
    ];

    const missingMethods = requiredMethods.filter(method => 
      typeof strategy[method] !== 'function'
    );

    if (missingMethods.length > 0) {
      this.log('error', 'Strategy validation failed: missing required methods', {
        missingMethods
      });
      return false;
    }

    // Check for optional health check methods
    const hasHealthCheck = 
      typeof strategy.isHealthy === 'function' ||
      typeof strategy.getHealthStatus === 'function';

    if (!hasHealthCheck) {
      this.log('warn', 'Strategy validation warning: no health check methods found');
    }

    this.log('info', 'Strategy validation passed', {
      strategyType: strategy.constructor.name,
      hasHealthCheck
    });

    return true;
  }

  /**
   * Validate workout request data structure
   */
  validateWorkoutRequest(request: AIServiceWorkoutRequest): boolean {
    if (!request || typeof request !== 'object') {
      this.log('error', 'Workout request validation failed: request is not an object');
      return false;
    }

    // Validate user profile
    if (!this.validateUserProfile(request.userProfile)) {
      this.log('error', 'Workout request validation failed: invalid user profile');
      return false;
    }

    // Validate workout options
    if (!this.validateWorkoutOptions(request.workoutOptions)) {
      this.log('error', 'Workout request validation failed: invalid workout options');
      return false;
    }

    // Validate preferences
    if (!this.validatePreferences(request.preferences)) {
      this.log('error', 'Workout request validation failed: invalid preferences');
      return false;
    }

    // Validate constraints
    if (!this.validateConstraints(request.constraints)) {
      this.log('error', 'Workout request validation failed: invalid constraints');
      return false;
    }

    this.log('debug', 'Workout request validation passed');
    return true;
  }

  /**
   * Validate AI context for external strategy operations
   */
  validateContext(context: GlobalAIContext): boolean {
    if (!context || typeof context !== 'object') {
      this.log('error', 'Context validation failed: context is not an object');
      return false;
    }

    // Validate user profile
    if (!this.validateUserProfile(context.userProfile)) {
      this.log('error', 'Context validation failed: invalid user profile');
      return false;
    }

    // Validate current selections
    if (!this.validateWorkoutOptions(context.currentSelections)) {
      this.log('error', 'Context validation failed: invalid current selections');
      return false;
    }

    // Validate session history
    if (!Array.isArray(context.sessionHistory)) {
      this.log('error', 'Context validation failed: session history is not an array');
      return false;
    }

    // Validate preferences
    if (!context.preferences || typeof context.preferences !== 'object') {
      this.log('error', 'Context validation failed: preferences is not an object');
      return false;
    }

    const requiredPreferences = [
      'aiAssistanceLevel',
      'showLearningInsights',
      'autoApplyLowRiskRecommendations'
    ];

    const missingPreferences = requiredPreferences.filter(pref => 
      !(pref in context.preferences)
    );

    if (missingPreferences.length > 0) {
      this.log('error', 'Context validation failed: missing required preferences', {
        missingPreferences
      });
      return false;
    }

    this.log('debug', 'Context validation passed');
    return true;
  }

  /**
   * Validate user profile data
   */
  private validateUserProfile(profile: UserProfile): boolean {
    if (!profile || typeof profile !== 'object') {
      this.log('error', 'User profile validation failed: profile is not an object');
      return false;
    }

    // Check for required fields (age, weight, height are now optional)
    const requiredFields = ['fitnessLevel'];
    const missingFields = requiredFields.filter(field => 
      !(field in profile) || profile[field as keyof UserProfile] === undefined
    );

    if (missingFields.length > 0) {
      this.log('error', 'User profile validation failed: missing required fields', {
        missingFields
      });
      return false;
    }

    // Validate fitness level
    const validFitnessLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validFitnessLevels.includes(profile.fitnessLevel)) {
      this.log('error', 'User profile validation failed: invalid fitness level', {
        fitnessLevel: profile.fitnessLevel,
        validLevels: validFitnessLevels
      });
      return false;
    }

    // Validate optional numeric fields (only if present)
    const optionalNumericFields = ['age', 'weight', 'height'];
    const invalidNumericFields = optionalNumericFields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return value !== undefined && (typeof value !== 'number' || value <= 0);
    });

    if (invalidNumericFields.length > 0) {
      this.log('error', 'User profile validation failed: invalid numeric fields', {
        invalidFields: invalidNumericFields
      });
      return false;
    }

    return true;
  }

  /**
   * Validate workout options data
   */
  private validateWorkoutOptions(options: PerWorkoutOptions): boolean {
    if (!options || typeof options !== 'object') {
      this.log('error', 'Workout options validation failed: options is not an object');
      return false;
    }

    // Check for required customization fields
    const requiredFields = [
      'customization_energy',
      'customization_soreness',
      'customization_focus',
      'customization_duration',
      'customization_equipment'
    ];

    const missingFields = requiredFields.filter(field => 
      !(field in options) || options[field as keyof PerWorkoutOptions] === undefined
    );

    if (missingFields.length > 0) {
      this.log('error', 'Workout options validation failed: missing required fields', {
        missingFields
      });
      return false;
    }

    // Validate energy level
    const energy = options.customization_energy;
    if (typeof energy !== 'number' || energy < 1 || energy > 10) {
      this.log('error', 'Workout options validation failed: invalid energy level', {
        energy,
        expectedRange: '1-10'
      });
      return false;
    }

    // Validate soreness areas
    const soreness = options.customization_soreness;
    if (!Array.isArray(soreness)) {
      this.log('error', 'Workout options validation failed: soreness is not an array');
      return false;
    }

    // Validate focus
    const focus = options.customization_focus;
    if (typeof focus !== 'string' || focus.trim().length === 0) {
      this.log('error', 'Workout options validation failed: invalid focus');
      return false;
    }

    // Validate duration
    const duration = options.customization_duration;
    if (typeof duration !== 'number' || duration <= 0) {
      this.log('error', 'Workout options validation failed: invalid duration', {
        duration
      });
      return false;
    }

    // Validate equipment
    const equipment = options.customization_equipment;
    if (!Array.isArray(equipment)) {
      this.log('error', 'Workout options validation failed: equipment is not an array');
      return false;
    }

    return true;
  }

  /**
   * Validate preferences object
   */
  private validatePreferences(preferences: any): boolean {
    if (!preferences || typeof preferences !== 'object') {
      this.log('error', 'Preferences validation failed: preferences is not an object');
      return false;
    }

    const requiredFields = ['duration', 'focus', 'intensity', 'equipment', 'location'];
    const missingFields = requiredFields.filter(field => 
      !(field in preferences)
    );

    if (missingFields.length > 0) {
      this.log('error', 'Preferences validation failed: missing required fields', {
        missingFields
      });
      return false;
    }

    // Validate intensity
    const validIntensities = ['low', 'moderate', 'high'];
    if (!validIntensities.includes(preferences.intensity)) {
      this.log('error', 'Preferences validation failed: invalid intensity', {
        intensity: preferences.intensity,
        validIntensities
      });
      return false;
    }

    // Validate duration
    if (typeof preferences.duration !== 'number' || preferences.duration <= 0) {
      this.log('error', 'Preferences validation failed: invalid duration', {
        duration: preferences.duration
      });
      return false;
    }

    // Validate equipment array
    if (!Array.isArray(preferences.equipment)) {
      this.log('error', 'Preferences validation failed: equipment is not an array');
      return false;
    }

    return true;
  }

  /**
   * Validate constraints object
   */
  private validateConstraints(constraints: any): boolean {
    if (!constraints || typeof constraints !== 'object') {
      this.log('error', 'Constraints validation failed: constraints is not an object');
      return false;
    }

    const requiredFields = ['timeOfDay', 'energyLevel', 'sorenessAreas'];
    const missingFields = requiredFields.filter(field => 
      !(field in constraints)
    );

    if (missingFields.length > 0) {
      this.log('error', 'Constraints validation failed: missing required fields', {
        missingFields
      });
      return false;
    }

    // Validate energy level
    if (typeof constraints.energyLevel !== 'number' || constraints.energyLevel < 1 || constraints.energyLevel > 10) {
      this.log('error', 'Constraints validation failed: invalid energy level', {
        energyLevel: constraints.energyLevel,
        expectedRange: '1-10'
      });
      return false;
    }

    // Validate soreness areas array
    if (!Array.isArray(constraints.sorenessAreas)) {
      this.log('error', 'Constraints validation failed: soreness areas is not an array');
      return false;
    }

    return true;
  }
} 