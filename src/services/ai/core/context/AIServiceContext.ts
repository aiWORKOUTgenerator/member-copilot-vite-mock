// AI Service Context Management
import { AIServiceComponent } from '../utils/AIServiceBase';
import { 
  GlobalAIContext, 
  AIInteraction, 
  AIServiceConfig,
  isValidContext 
} from '../types/AIServiceTypes';
import { AIServiceContextValidator } from './AIServiceContextValidator';

/**
 * Manages AI Service context including user profile, current selections, and session history
 */
export class AIServiceContext extends AIServiceComponent {
  private context: GlobalAIContext | null = null;
  private sessionHistory: AIInteraction[] = [];
  private validator: AIServiceContextValidator;
  private config: AIServiceConfig;
  private maxHistorySize: number = 1000;

  constructor(config: AIServiceConfig) {
    super('AIServiceContext');
    this.config = config;
    this.validator = new AIServiceContextValidator();
    
    this.log('info', 'AIServiceContext initialized', {
      maxHistorySize: this.maxHistorySize,
      enableValidation: config.enableValidation
    });
  }

  /**
   * Set the global AI context with validation
   */
  async setContext(context: GlobalAIContext): Promise<void> {
    try {
      this.log('info', 'Setting AI service context', {
        hasUserProfile: !!context.userProfile,
        hasCurrentSelections: !!context.currentSelections,
        sessionHistorySize: context.sessionHistory?.length || 0
      });

      // Validate context if validation is enabled
      if (this.config.enableValidation) {
        await this.validator.validateContext(context);
      }

      // Store the context
      this.context = context;
      
      // Initialize session history if not provided
      if (!context.sessionHistory) {
        this.sessionHistory = [];
      } else {
        this.sessionHistory = [...context.sessionHistory];
      }

      // Record context change interaction
      this.recordInteraction({
        id: this.generateId(),
        timestamp: new Date(),
        component: 'ai_service',
        action: 'recommendation_shown',
        performanceMetrics: {
          executionTime: 0,
          memoryUsage: 0,
          cacheHit: false
        }
      });

      this.log('info', 'AI service context set successfully', {
        userProfile: context.userProfile ? {
          fitnessLevel: context.userProfile.fitnessLevel,
          goals: context.userProfile.goals?.length || 0
        } : null,
        currentSelections: context.currentSelections ? Object.keys(context.currentSelections) : []
      });

    } catch (error) {
      this.handleError(error as Error, 'setContext', { context });
      throw error;
    }
  }

  /**
   * Get the current global context
   */
  getContext(): GlobalAIContext | null {
    return this.context;
  }

  /**
   * Check if context is set and valid
   */
  hasContext(): boolean {
    return isValidContext(this.context);
  }

  /**
   * Get the current user profile
   */
  getUserProfile() {
    return this.context?.userProfile || null;
  }

  /**
   * Get the current workout selections
   */
  getCurrentSelections() {
    return this.context?.currentSelections || null;
  }

  /**
   * Update current selections
   */
  updateSelections(selections: Partial<typeof this.context.currentSelections>): void {
    if (!this.context) {
      this.log('warn', 'Cannot update selections: no context set');
      return;
    }

    this.context.currentSelections = {
      ...this.context.currentSelections,
      ...selections
    };

    this.log('debug', 'Updated current selections', {
      updatedFields: Object.keys(selections),
      totalFields: Object.keys(this.context.currentSelections).length
    });
  }

  /**
   * Record an interaction with the AI service
   */
  recordInteraction(interaction: AIInteraction): void {
    if (!this.context) {
      this.log('warn', 'Cannot record interaction: no context set');
      return;
    }

    // Add to session history
    this.sessionHistory.push(interaction);
    
    // Limit session history size
    if (this.sessionHistory.length > this.maxHistorySize) {
      this.sessionHistory = this.sessionHistory.slice(-this.maxHistorySize / 2);
      this.log('debug', 'Session history trimmed', {
        newSize: this.sessionHistory.length,
        maxSize: this.maxHistorySize
      });
    }

    // Update context session history
    this.context.sessionHistory = [...this.sessionHistory];

    // Learn from interaction if it has feedback
    if (interaction.userFeedback) {
      this.log('info', 'User feedback recorded', {
        feedback: interaction.userFeedback,
        component: interaction.component,
        recommendationId: interaction.recommendationId
      });
    }

    // Handle errors
    if (interaction.action === 'error_occurred' && interaction.errorDetails) {
      this.log('error', 'Error interaction recorded', {
        error: interaction.errorDetails.message,
        component: interaction.component,
        context: interaction.errorDetails.context
      });
    }

    this.log('debug', 'Interaction recorded', {
      action: interaction.action,
      component: interaction.component,
      sessionHistorySize: this.sessionHistory.length
    });
  }

  /**
   * Get the session history
   */
  getSessionHistory(): AIInteraction[] {
    return [...this.sessionHistory];
  }

  /**
   * Get recent interactions
   */
  getRecentInteractions(count: number = 10): AIInteraction[] {
    return this.sessionHistory.slice(-count);
  }

  /**
   * Get interactions by component
   */
  getInteractionsByComponent(component: string): AIInteraction[] {
    return this.sessionHistory.filter(interaction => interaction.component === component);
  }

  /**
   * Get interactions by action type
   */
  getInteractionsByAction(action: AIInteraction['action']): AIInteraction[] {
    return this.sessionHistory.filter(interaction => interaction.action === action);
  }

  /**
   * Clear the session history
   */
  clearSessionHistory(): void {
    this.sessionHistory = [];
    if (this.context) {
      this.context.sessionHistory = [];
    }
    
    this.log('info', 'Session history cleared');
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalInteractions: number;
    recommendationsShown: number;
    recommendationsApplied: number;
    recommendationsDismissed: number;
    errorsOccurred: number;
    averageUserFeedback: number;
  } {
    const totalInteractions = this.sessionHistory.length;
    const recommendationsShown = this.getInteractionsByAction('recommendation_shown').length;
    const recommendationsApplied = this.getInteractionsByAction('recommendation_applied').length;
    const recommendationsDismissed = this.getInteractionsByAction('recommendation_dismissed').length;
    const errorsOccurred = this.getInteractionsByAction('error_occurred').length;

    // Calculate average user feedback
    const feedbackInteractions = this.sessionHistory.filter(i => i.userFeedback);
    const averageUserFeedback = feedbackInteractions.length > 0
      ? feedbackInteractions.reduce((sum, i) => {
          const score = i.userFeedback === 'helpful' ? 1 : i.userFeedback === 'partially_helpful' ? 0.5 : 0;
          return sum + score;
        }, 0) / feedbackInteractions.length
      : 0;

    return {
      totalInteractions,
      recommendationsShown,
      recommendationsApplied,
      recommendationsDismissed,
      errorsOccurred,
      averageUserFeedback
    };
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<GlobalAIContext['preferences']>): void {
    if (!this.context) {
      this.log('warn', 'Cannot update preferences: no context set');
      return;
    }

    this.context.preferences = {
      ...this.context.preferences,
      ...preferences
    };

    this.log('info', 'User preferences updated', {
      updatedPreferences: Object.keys(preferences)
    });
  }

  /**
   * Update environmental factors
   */
  updateEnvironmentalFactors(factors: Partial<GlobalAIContext['environmentalFactors']>): void {
    if (!this.context) {
      this.log('warn', 'Cannot update environmental factors: no context set');
      return;
    }

    this.context.environmentalFactors = {
      ...this.context.environmentalFactors,
      ...factors
    };

    this.log('info', 'Environmental factors updated', {
      updatedFactors: Object.keys(factors)
    });
  }

  /**
   * Clear the context
   */
  clearContext(): void {
    this.context = null;
    this.sessionHistory = [];
    
    this.log('info', 'AI service context cleared');
  }

  /**
   * Get context health status
   */
  getHealthStatus(): 'set' | 'not_set' | 'invalid' {
    if (!this.context) {
      return 'not_set';
    }

    if (!this.validator.validateUserProfile(this.context.userProfile) ||
        !this.validator.validateCurrentSelections(this.context.currentSelections)) {
      return 'invalid';
    }

    return 'set';
  }

  /**
   * Export context for debugging
   */
  exportContext(): any {
    if (!this.context) {
      return null;
    }

    return {
      userProfile: this.context.userProfile ? {
        fitnessLevel: this.context.userProfile.fitnessLevel,
        goals: this.context.userProfile.goals,
        age: this.context.userProfile.age,
        gender: this.context.userProfile.gender
      } : null,
      currentSelections: this.context.currentSelections,
      sessionHistory: {
        total: this.sessionHistory.length,
        recent: this.getRecentInteractions(5)
      },
      preferences: this.context.preferences,
      environmentalFactors: this.context.environmentalFactors,
      healthStatus: this.getHealthStatus()
    };
  }
} 