// Main AI Service Orchestrator
// Coordinates all extracted components while maintaining existing public API
import { PerWorkoutOptions, UserProfile } from '../../../types';
// UserProfile is used in GlobalAIContext interface
import { AIInsight } from '../../../types/insights';
import { 
  GlobalAIContext, 
  AIInteraction, 
  UnifiedAIAnalysis, 
  PrioritizedRecommendation,
  AIServiceConfig,
  AIServiceHealthStatus,
  AIServicePerformanceMetrics,
  InteractionStats,
  LearningMetrics
} from './types/AIServiceTypes';

// Domain Services
import { EnergyAIService } from '../domains/EnergyAIService';
import { SorenessAIService } from '../domains/SorenessAIService';
import { FocusAIService } from '../domains/FocusAIService';
import { DurationAIService } from '../domains/DurationAIService';
import { EquipmentAIService } from '../domains/EquipmentAIService';
import { CrossComponentAIService } from '../domains/CrossComponentAIService';

// Core Components
import { AIServiceContext } from './context/AIServiceContext';
import { AIServiceCache } from './caching/AIServiceCache';
import { AIServiceHealthChecker } from './health/AIServiceHealthChecker';
import { AIServicePerformanceMonitor } from './performance/AIServicePerformanceMonitor';
import { AIServiceAnalyzer } from './analysis/AIServiceAnalyzer';
import { AIServiceValidator } from './validation/AIServiceValidator';
import { AIServiceErrorHandler } from './error/AIServiceErrorHandler';
import { AIServiceInteractionTracker } from './interaction/AIServiceInteractionTracker';
import { AIServiceLearningEngine } from './interaction/AIServiceLearningEngine';

// OpenAI Strategy - Direct Integration
import { OpenAIStrategy } from '../external/OpenAIStrategy';
import { OpenAIService } from '../external/OpenAIService';

/**
 * Main AI Service Orchestrator
 * Coordinates all extracted components while maintaining existing public API
 */
export class AIService {
  // Component properties
  private context!: AIServiceContext;
  private cache!: AIServiceCache;
  private healthChecker!: AIServiceHealthChecker;
  private performanceMonitor!: AIServicePerformanceMonitor;
  private analyzer!: AIServiceAnalyzer;
  private validator!: AIServiceValidator;
  private errorHandler!: AIServiceErrorHandler;
  private interactionTracker!: AIServiceInteractionTracker;
  private learningEngine!: AIServiceLearningEngine;
  
  // OpenAI Strategy - Direct Integration
  private openAIStrategy?: OpenAIStrategy;
  
  // Configuration and domain services
  private config: AIServiceConfig;
  private domainServices: Map<string, any>;
  
  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = this.initializeConfig(config);
    this.domainServices = this.initializeDomainServices();
    this.initializeComponents();
  }

  // ============================================================================
  // PUBLIC API - Context Management
  // ============================================================================

  /**
   * Set global context with validation
   */
  async setContext(context: GlobalAIContext): Promise<void> {
    try {
      // Type assertion to ensure UserProfile import is recognized
      const userProfile: UserProfile = context.userProfile;
      if (!userProfile) {
        throw new Error('UserProfile is required in GlobalAIContext');
      }

      // Validate user profile has all required fields
      if (!userProfile.preferences) {
        throw new Error('User profile must include preferences');
      }

      if (!userProfile.basicLimitations) {
        throw new Error('User profile must include basic limitations');
      }

      if (!userProfile.basicLimitations.availableEquipment) {
        throw new Error('User profile must include available equipment in basic limitations');
      }

      if (!userProfile.basicLimitations.availableLocations) {
        throw new Error('User profile must include available locations in basic limitations');
      }

      if (!userProfile.basicLimitations.injuries) {
        throw new Error('User profile must include injuries in basic limitations');
      }

      // Validate preferences
      if (!userProfile.preferences.workoutStyle) {
        throw new Error('User profile preferences must include workout style');
      }

      if (!userProfile.preferences.timePreference) {
        throw new Error('User profile preferences must include time preference');
      }

      if (!userProfile.preferences.intensityPreference) {
        throw new Error('User profile preferences must include intensity preference');
      }

      if (typeof userProfile.preferences.advancedFeatures !== 'boolean') {
        throw new Error('User profile preferences must include advanced features flag');
      }

      if (!userProfile.preferences.aiAssistanceLevel) {
        throw new Error('User profile preferences must include AI assistance level');
      }
      
      await this.context.setContext(context);
      this.cache.clear(); // Clear cache when context changes
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'setContext', { context });
      throw error;
    }
  }

  /**
   * Get the current global context
   */
  getContext(): GlobalAIContext | null {
    return this.context.getContext();
  }

  // ============================================================================
  // PUBLIC API - Analysis
  // ============================================================================

  /**
   * Main analysis method with caching and validation
   */
  async analyze(partialSelections?: Partial<PerWorkoutOptions>): Promise<UnifiedAIAnalysis> {
    try {
      const context = this.context.getContext();
      if (!context) {
        throw new Error('Context not set');
      }

      // Merge partial selections with current context
      const fullSelections = {
        ...context.currentSelections,
        ...partialSelections
      };

      // Generate cache key
      const cacheKey = this.generateCacheKey(fullSelections);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached as UnifiedAIAnalysis;
      }

      // Perform analysis using domain services
      const analysis = await this.analyzer.analyze(fullSelections, context);
      
      // Cache the result
      this.cache.set(cacheKey, analysis);
      
      return analysis;
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'analyze', { partialSelections });
      throw error;
    }
  }

  // ============================================================================
  // PUBLIC API - OpenAI Strategy Integration
  // ============================================================================

  /**
   * Set OpenAI strategy directly
   */
  setOpenAIStrategy(strategy: OpenAIStrategy | null): void {
    this.openAIStrategy = strategy || undefined;
    this.log('info', 'OpenAI strategy configured', {
      strategyType: strategy?.constructor?.name || 'none'
    });
  }

  /**
   * Get the OpenAIService from the OpenAI strategy
   */
  getOpenAIService(): OpenAIService | undefined {
    return this.openAIStrategy?.getOpenAIService();
  }

  /**
   * Generate workout using OpenAI strategy
   */
  async generateWorkout(request: any): Promise<any> {
    try {
      // Extract workoutData from request or use request directly
      const workoutData = request.workoutFocusData || request;
      
      // Get current context or create default context
      let context = this.context.getContext();
      
      if (!context) {
        // Create a default context if none exists
        context = {
          userProfile: request.userProfile || {
            fitnessLevel: 'intermediate' as const,
            goals: ['general_fitness'],
            preferences: {
              workoutStyle: ['balanced'],
              timePreference: 'morning',
              intensityPreference: 'moderate',
              advancedFeatures: false,
              aiAssistanceLevel: 'moderate'
            },
            basicLimitations: {
              injuries: [],
              availableEquipment: ['Body Weight'],
              availableLocations: ['Home']
            },
            enhancedLimitations: {
              timeConstraints: 0,
              equipmentConstraints: [],
              locationConstraints: [],
              recoveryNeeds: {
                restDays: 2,
                sleepHours: 7,
                hydrationLevel: 'moderate'
              },
              mobilityLimitations: [],
              progressionRate: 'moderate'
            },
            workoutHistory: {
              estimatedCompletedWorkouts: 0,
              averageDuration: 45,
              preferredFocusAreas: [],
              progressiveEnhancementUsage: {},
              aiRecommendationAcceptance: 0.7,
              consistencyScore: 0.5,
              plateauRisk: 'low'
            },
            learningProfile: {
              prefersSimplicity: true,
              explorationTendency: 'moderate',
              feedbackPreference: 'simple',
              learningStyle: 'visual',
              motivationType: 'intrinsic',
              adaptationSpeed: 'moderate'
            }
          },
          currentSelections: workoutData,
          sessionHistory: [],
          preferences: {
            aiAssistanceLevel: 'moderate',
            showLearningInsights: true,
            autoApplyLowRiskRecommendations: false
          },
          environmentalFactors: {
            timeOfDay: 'morning',
            location: 'home',
            availableTime: 60
          }
        };
      } else {
        // Update existing context with current workout selections
        context = {
          ...context,
          currentSelections: workoutData
        };
      }

      // Set the updated context
      await this.context.setContext(context);
      
      // Check if OpenAI strategy is configured
      if (!this.openAIStrategy) {
        throw new Error('OpenAI strategy not configured');
      }
      
      // Generate workout using OpenAI strategy directly
      return await this.openAIStrategy.generateWorkout(request);
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'generateWorkout', { request });
      throw error;
    }
  }

  /**
   * Generate recommendations using OpenAI strategy
   */
  async generateRecommendations(context: GlobalAIContext): Promise<PrioritizedRecommendation[]> {
    try {
      if (!this.openAIStrategy) {
        throw new Error('OpenAI strategy not configured');
      }
      return await this.openAIStrategy.generateRecommendations(context);
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'generateRecommendations', { context });
      throw error;
    }
  }

  /**
   * Enhance insights using OpenAI strategy
   */
  async enhanceInsights(insights: AIInsight[], context: GlobalAIContext): Promise<any> {
    try {
      if (!this.openAIStrategy) {
        throw new Error('OpenAI strategy not configured');
      }
      return await this.openAIStrategy.enhanceInsights(insights, context);
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'enhanceInsights', { insights, context });
      throw error;
    }
  }

  /**
   * Analyze user preferences using OpenAI strategy
   */
  async analyzeUserPreferences(context: GlobalAIContext): Promise<any> {
    try {
      if (!this.openAIStrategy) {
        throw new Error('OpenAI strategy not configured');
      }
      return await this.openAIStrategy.analyzeUserPreferences(context);
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'analyzeUserPreferences', { context });
      throw error;
    }
  }

  // ============================================================================
  // PUBLIC API - Health and Monitoring
  // ============================================================================

  /**
   * Get overall health status
   */
  getHealthStatus(): AIServiceHealthStatus {
    const baseHealth = this.healthChecker.checkOverallHealth();
    
    // Add OpenAI strategy status
    const openAIStrategyStatus = this.openAIStrategy ? 'configured' : 'not_configured';
    
    return {
      ...baseHealth,
      details: {
        ...baseHealth.details,
        openAIStrategy: openAIStrategyStatus
      }
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): AIServicePerformanceMetrics {
    return this.performanceMonitor.getMetrics();
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<any> {
    return await this.healthChecker.performComprehensiveHealthCheck();
  }

  // ============================================================================
  // PUBLIC API - Interaction Tracking
  // ============================================================================

  /**
   * Record interaction with the AI service
   */
  recordInteraction(interaction: AIInteraction): void {
    // Ensure interaction has a unique ID
    const interactionWithId = {
      ...interaction,
      id: interaction.id || this.generateId()
    };
    
    this.interactionTracker.recordInteraction(interactionWithId);
    this.learningEngine.updateRecommendationWeights(interactionWithId);
    
    if (this.config.enablePerformanceMonitoring && interaction.performanceMetrics) {
      this.performanceMonitor.recordAnalysis(
        interaction.performanceMetrics.executionTime,
        interaction.performanceMetrics.memoryUsage
      );
    }
  }

  /**
   * Get interaction statistics
   */
  getInteractionStats(): InteractionStats {
    return this.interactionTracker.getInteractionStats();
  }

  /**
   * Get learning metrics
   */
  getLearningMetrics(): LearningMetrics {
    return this.learningEngine.getLearningMetrics();
  }

  /**
   * Get session history
   */
  getSessionHistory(): AIInteraction[] {
    return this.interactionTracker.getSessionHistory();
  }

  /**
   * Clear session history
   */
  clearSessionHistory(): void {
    this.interactionTracker.clearSessionHistory();
  }

  /**
   * Learn from user feedback
   */
  learnFromUserFeedback(
    feedback: 'helpful' | 'not_helpful' | 'partially_helpful',
    context: any
  ): void {
    this.learningEngine.learnFromUserFeedback(feedback, context);
  }

  // ============================================================================
  // PUBLIC API - Data Export
  // ============================================================================

  /**
   * Export session data
   */
  exportSessionData(): any {
    return {
      sessionHistory: this.getSessionHistory(),
      interactionStats: this.getInteractionStats(),
      performanceMetrics: this.getPerformanceMetrics()
    };
  }

  /**
   * Export learning data
   */
  exportLearningData(): any {
    return {
      learningMetrics: this.getLearningMetrics(),
      sessionHistory: this.getSessionHistory()
    };
  }

  // ============================================================================
  // PRIVATE METHODS - Initialization
  // ============================================================================

  /**
   * Initialize configuration with defaults
   */
  private initializeConfig(config: Partial<AIServiceConfig>): AIServiceConfig {
    return {
      enableValidation: false,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      cacheSize: 1000,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      fallbackToLegacy: true,
      ...config
    };
  }

  /**
   * Initialize domain services
   */
  private initializeDomainServices(): Map<string, any> {
    const services = new Map<string, any>();
    services.set('energy', new EnergyAIService());
    services.set('soreness', new SorenessAIService());
    services.set('focus', new FocusAIService());
    services.set('duration', new DurationAIService());
    services.set('equipment', new EquipmentAIService());
    services.set('crossComponent', new CrossComponentAIService());
    return services;
  }

  /**
   * Initialize all components with proper dependencies
   */
  private initializeComponents(): void {
    this.context = new AIServiceContext(this.config);
    this.cache = new AIServiceCache(this.config);
    this.healthChecker = new AIServiceHealthChecker(this.domainServices, this.config);
    this.performanceMonitor = new AIServicePerformanceMonitor(this.config);
    this.analyzer = new AIServiceAnalyzer(this.domainServices, this.config);
    this.validator = new AIServiceValidator();
    this.errorHandler = new AIServiceErrorHandler(this.config);
    this.interactionTracker = new AIServiceInteractionTracker(this.config.cacheSize);
    this.learningEngine = new AIServiceLearningEngine();
  }

  // ============================================================================
  // PRIVATE METHODS - Utilities
  // ============================================================================

  /**
   * Generate cache key from selections
   */
  private generateCacheKey(selections: PerWorkoutOptions): string {
    return JSON.stringify(selections);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log message with component prefix
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const prefix = `[AIService]`;
    switch (level) {
      case 'debug':
        console.debug(`${prefix} 🔍 ${message}`, data);
        break;
      case 'info':
        console.info(`${prefix} ℹ️ ${message}`, data);
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️ ${message}`, data);
        break;
      case 'error':
        console.error(`${prefix} ❌ ${message}`, data);
        break;
    }
  }
} 