// AI Service Context Validation
import { AIServiceComponent } from '../utils/AIServiceBase';
import { GlobalAIContext, UserProfile, PerWorkoutOptions } from '../types/AIServiceTypes';

/**
 * Validates AI Service context including user profile and current selections
 */
export class AIServiceContextValidator extends AIServiceComponent {
  constructor() {
    super('AIServiceContextValidator');
  }

  /**
   * Validate the complete context
   */
  async validateContext(context: GlobalAIContext): Promise<void> {
    this.log('debug', 'Validating AI service context');

    // Validate user profile
    this.validateUserProfile(context.userProfile);

    // Validate current selections
    this.validateCurrentSelections(context.currentSelections);

    // Validate preferences
    this.validatePreferences(context.preferences);

    // Validate environmental factors (optional)
    if (context.environmentalFactors) {
      this.validateEnvironmentalFactors(context.environmentalFactors);
    }

    // Validate session history (optional)
    if (context.sessionHistory) {
      this.validateSessionHistory(context.sessionHistory);
    }

    this.log('info', 'AI service context validation passed');
  }

  /**
   * Validate user profile
   */
  validateUserProfile(userProfile: UserProfile): boolean {
    if (!userProfile) {
      throw new Error('User profile is required in AI context');
    }

    // Validate required fields
    this.validateRequired(userProfile.fitnessLevel, 'fitnessLevel');
    this.validateRequired(userProfile.goals, 'goals');
    this.validateRequired(userProfile.age, 'age');

    // Validate fitness level
    const validFitnessLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    this.validateEnum(userProfile.fitnessLevel, validFitnessLevels, 'fitnessLevel');

    // Validate goals array
    if (!Array.isArray(userProfile.goals) || userProfile.goals.length === 0) {
      throw new Error('User goals must be a non-empty array');
    }

    // Validate age range
    this.validateRange(userProfile.age, 13, 100, 'age');

    // Validate gender (optional but if present, must be valid)
    if (userProfile.gender) {
      const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
      this.validateEnum(userProfile.gender, validGenders, 'gender');
    }

    // Validate height (optional but if present, must be reasonable)
    if (userProfile.height) {
      this.validateRange(parseFloat(userProfile.height), 100, 250, 'height (cm)');
    }

    // Validate weight (optional but if present, must be reasonable)
    if (userProfile.weight) {
      this.validateRange(parseFloat(userProfile.weight), 30, 300, 'weight (kg)');
    }

    this.log('debug', 'User profile validation passed', {
      fitnessLevel: userProfile.fitnessLevel,
      goalsCount: userProfile.goals.length,
      age: userProfile.age
    });

    return true;
  }

  /**
   * Validate current selections
   */
  validateCurrentSelections(selections: PerWorkoutOptions): boolean {
    if (!selections) {
      throw new Error('Current selections are required in AI context');
    }

    // Validate energy level if present
    if (selections.customization_energy !== undefined) {
      this.validateRange(selections.customization_energy, 1, 10, 'energy level');
    }

    // Validate duration if present
    if (selections.customization_duration !== undefined) {
      this.validateRange(selections.customization_duration, 5, 120, 'duration (minutes)');
    }

    // Validate focus areas if present
    if (selections.customization_focus) {
      if (typeof selections.customization_focus !== 'string' && !Array.isArray(selections.customization_focus)) {
        throw new Error('Focus must be a string or array');
      }
    }

    // Validate equipment if present
    if (selections.customization_equipment) {
      if (!Array.isArray(selections.customization_equipment)) {
        throw new Error('Equipment must be an array');
      }
    }

    // Validate soreness areas if present
    if (selections.customization_soreness) {
      if (!Array.isArray(selections.customization_soreness)) {
        throw new Error('Soreness areas must be an array');
      }
    }

    this.log('debug', 'Current selections validation passed', {
      hasEnergy: selections.customization_energy !== undefined,
      hasDuration: selections.customization_duration !== undefined,
      hasFocus: !!selections.customization_focus,
      hasEquipment: !!selections.customization_equipment,
      hasSoreness: !!selections.customization_soreness
    });

    return true;
  }

  /**
   * Validate user preferences
   */
  validatePreferences(preferences: GlobalAIContext['preferences']): boolean {
    if (!preferences) {
      throw new Error('User preferences are required in AI context');
    }

    // Validate AI assistance level
    const validAssistanceLevels = ['minimal', 'moderate', 'comprehensive'];
    this.validateEnum(preferences.aiAssistanceLevel, validAssistanceLevels, 'aiAssistanceLevel');

    // Validate boolean preferences
    if (typeof preferences.showLearningInsights !== 'boolean') {
      throw new Error('showLearningInsights must be a boolean');
    }

    if (typeof preferences.autoApplyLowRiskRecommendations !== 'boolean') {
      throw new Error('autoApplyLowRiskRecommendations must be a boolean');
    }

    this.log('debug', 'User preferences validation passed', {
      aiAssistanceLevel: preferences.aiAssistanceLevel,
      showLearningInsights: preferences.showLearningInsights,
      autoApplyLowRiskRecommendations: preferences.autoApplyLowRiskRecommendations
    });

    return true;
  }

  /**
   * Validate environmental factors
   */
  validateEnvironmentalFactors(factors: GlobalAIContext['environmentalFactors']): boolean {
    if (!factors) {
      return true; // Environmental factors are optional
    }

    // Validate time of day if present
    if (factors.timeOfDay) {
      const validTimeOfDay = ['morning', 'afternoon', 'evening', 'night'];
      this.validateEnum(factors.timeOfDay, validTimeOfDay, 'timeOfDay');
    }

    // Validate location if present
    if (factors.location) {
      const validLocations = ['home', 'gym', 'outdoor', 'office', 'other'];
      this.validateEnum(factors.location, validLocations, 'location');
    }

    // Validate available time if present
    if (factors.availableTime !== undefined) {
      this.validateRange(factors.availableTime, 5, 300, 'availableTime (minutes)');
    }

    // Validate weather if present
    if (factors.weather) {
      const validWeather = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'unknown'];
      this.validateEnum(factors.weather, validWeather, 'weather');
    }

    this.log('debug', 'Environmental factors validation passed', {
      timeOfDay: factors.timeOfDay,
      location: factors.location,
      availableTime: factors.availableTime,
      weather: factors.weather
    });

    return true;
  }

  /**
   * Validate session history
   */
  validateSessionHistory(history: any[]): boolean {
    if (!Array.isArray(history)) {
      throw new Error('Session history must be an array');
    }

    // Validate each interaction in the history
    history.forEach((interaction, index) => {
      try {
        this.validateInteraction(interaction);
      } catch (error) {
        throw new Error(`Invalid interaction at index ${index}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    this.log('debug', 'Session history validation passed', {
      historyLength: history.length
    });

    return true;
  }

  /**
   * Validate individual interaction
   */
  validateInteraction(interaction: any): boolean {
    if (!interaction) {
      throw new Error('Interaction cannot be null or undefined');
    }

    // Validate required fields
    this.validateRequired(interaction.id, 'interaction.id');
    this.validateRequired(interaction.timestamp, 'interaction.timestamp');
    this.validateRequired(interaction.component, 'interaction.component');
    this.validateRequired(interaction.action, 'interaction.action');

    // Validate action type
    const validActions = ['recommendation_shown', 'recommendation_applied', 'recommendation_dismissed', 'error_occurred'];
    this.validateEnum(interaction.action, validActions, 'interaction.action');

    // Validate timestamp
    if (!(interaction.timestamp instanceof Date)) {
      throw new Error('interaction.timestamp must be a Date object');
    }

    // Validate user feedback if present
    if (interaction.userFeedback) {
      const validFeedback = ['helpful', 'not_helpful', 'partially_helpful'];
      this.validateEnum(interaction.userFeedback, validFeedback, 'interaction.userFeedback');
    }

    // Validate performance metrics if present
    if (interaction.performanceMetrics) {
      this.validatePerformanceMetrics(interaction.performanceMetrics);
    }

    return true;
  }

  /**
   * Validate performance metrics
   */
  validatePerformanceMetrics(metrics: any): boolean {
    if (!metrics) {
      return true; // Performance metrics are optional
    }

    // Validate execution time
    if (metrics.executionTime !== undefined) {
      if (typeof metrics.executionTime !== 'number' || metrics.executionTime < 0) {
        throw new Error('executionTime must be a non-negative number');
      }
    }

    // Validate memory usage
    if (metrics.memoryUsage !== undefined) {
      if (typeof metrics.memoryUsage !== 'number' || metrics.memoryUsage < 0) {
        throw new Error('memoryUsage must be a non-negative number');
      }
    }

    // Validate cache hit
    if (metrics.cacheHit !== undefined) {
      if (typeof metrics.cacheHit !== 'boolean') {
        throw new Error('cacheHit must be a boolean');
      }
    }

    return true;
  }

  /**
   * Validate context for specific operations
   */
  validateContextForAnalysis(context: GlobalAIContext): boolean {
    this.log('debug', 'Validating context for analysis operation');

    // Ensure we have the minimum required data for analysis
    if (!context.userProfile) {
      throw new Error('User profile is required for analysis');
    }

    if (!context.currentSelections) {
      throw new Error('Current selections are required for analysis');
    }

    // Validate that we have at least one selection
    const hasAnySelection = Object.values(context.currentSelections).some(value => 
      value !== undefined && value !== null && value !== ''
    );

    if (!hasAnySelection) {
      throw new Error('At least one selection is required for analysis');
    }

    this.log('debug', 'Context validation for analysis passed');
    return true;
  }

  /**
   * Validate context for workout generation
   */
  validateContextForWorkoutGeneration(context: GlobalAIContext): boolean {
    this.log('debug', 'Validating context for workout generation');

    // Ensure we have the minimum required data for workout generation
    if (!context.userProfile) {
      throw new Error('User profile is required for workout generation');
    }

    if (!context.currentSelections) {
      throw new Error('Current selections are required for workout generation');
    }

    // Validate that we have energy level
    if (context.currentSelections.customization_energy === undefined) {
      throw new Error('Energy level is required for workout generation');
    }

    // Validate that we have duration
    if (context.currentSelections.customization_duration === undefined) {
      throw new Error('Duration is required for workout generation');
    }

    this.log('debug', 'Context validation for workout generation passed');
    return true;
  }
} 