// Enhanced AI Service with Validation Mode and Error Handling
import { PerWorkoutOptions, UserProfile } from '../../../types';
import { AIInsight } from '../../../types/insights';
import { aiLogicExtractor } from '../migration/AILogicExtractor';
import { EnergyAIService } from '../domains/EnergyAIService';
import { SorenessAIService } from '../domains/SorenessAIService';
import { FocusAIService } from '../domains/FocusAIService';
import { DurationAIService } from '../domains/DurationAIService';
import { EquipmentAIService } from '../domains/EquipmentAIService';
import { CrossComponentAIService } from '../domains/CrossComponentAIService';
import { AIPerformanceMonitor } from '../utils/AIPerformanceMonitor';
import { AIErrorHandler } from '../utils/AIErrorHandler';

// Enhanced interfaces with validation support
export interface GlobalAIContext {
  userProfile: UserProfile;
  currentSelections: PerWorkoutOptions;
  sessionHistory: AIInteraction[];
  environmentalFactors?: {
    timeOfDay: string;
    location: string;
    weather?: string;
    availableTime?: number;
  };
  preferences: {
    aiAssistanceLevel: 'minimal' | 'moderate' | 'comprehensive';
    showLearningInsights: boolean;
    autoApplyLowRiskRecommendations: boolean;
  };
  validationMode?: boolean; // Enable validation during migration
}

export interface AIInteraction {
  id: string;
  timestamp: Date;
  component: string;
  action: 'recommendation_shown' | 'recommendation_applied' | 'recommendation_dismissed' | 'error_occurred';
  recommendationId?: string;
  userFeedback?: 'helpful' | 'not_helpful' | 'partially_helpful';
  errorDetails?: {
    message: string;
    stack?: string;
    context?: any;
  };
  performanceMetrics?: {
    executionTime: number;
    memoryUsage: number;
    cacheHit: boolean;
  };
}

export interface UnifiedAIAnalysis {
  id: string;
  timestamp: Date;
  insights: {
    energy: AIInsight[];
    soreness: AIInsight[];
    focus: AIInsight[];
    duration: AIInsight[];
    equipment: AIInsight[];
  };
  crossComponentConflicts: CrossComponentConflict[];
  recommendations: PrioritizedRecommendation[];
  confidence: number;
  reasoning: string;
  validationResults?: ValidationResult;
  performanceMetrics: {
    totalExecutionTime: number;
    cacheHitRate: number;
    memoryPeakUsage: number;
  };
}

export interface CrossComponentConflict {
  id: string;
  components: string[];
  type: 'safety' | 'efficiency' | 'goal_alignment';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestedResolution: string;
  confidence: number;
  impact: 'performance' | 'safety' | 'effectiveness';
}

export interface PrioritizedRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'safety' | 'optimization' | 'education' | 'efficiency';
  targetComponent: string;
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  action?: {
    type: 'update_field' | 'suggest_alternative' | 'show_education';
    field?: string;
    value?: any;
    alternatives?: any[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  consistencyScore: number;
  discrepancies: Array<{
    component: string;
    expected: any;
    actual: any;
    severity: 'low' | 'medium' | 'high';
  }>;
  performanceComparison: {
    oldTime: number;
    newTime: number;
    memoryDifference: number;
  };
}

export interface AIServiceConfig {
  enableValidation: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
  cacheSize: number;
  cacheTimeout: number;
  maxRetries: number;
  fallbackToLegacy: boolean;
}

/**
 * Enhanced AI Service with validation mode and comprehensive error handling
 */
export class AIService {
  private energy: EnergyAIService;
  private soreness: SorenessAIService;
  private focus: FocusAIService;
  private duration: DurationAIService;
  private equipment: EquipmentAIService;
  private crossComponent: CrossComponentAIService;
  
  private globalContext: GlobalAIContext | null = null;
  private analysisCache = new Map<string, UnifiedAIAnalysis>();
  private performanceMonitor: AIPerformanceMonitor;
  private errorHandler: AIErrorHandler;
  private config: AIServiceConfig;
  
  // External AI integration
  private externalStrategy: any = null; // Will be set via setExternalStrategy
  
  // Legacy implementations for validation
  private legacyImplementations: any = null;
  
  constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = {
      enableValidation: false,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      cacheSize: 1000,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      fallbackToLegacy: true,
      ...config
    };
    
    this.energy = new EnergyAIService();
    this.soreness = new SorenessAIService();
    this.focus = new FocusAIService();
    this.duration = new DurationAIService();
    this.equipment = new EquipmentAIService();
    this.crossComponent = new CrossComponentAIService();
    
    this.performanceMonitor = new AIPerformanceMonitor();
    this.errorHandler = new AIErrorHandler({
      enableReporting: this.config.enableErrorReporting,
      fallbackToLegacy: this.config.fallbackToLegacy
    });
    
    // Initialize legacy implementations for validation
    this.initializeLegacyImplementations();
  }
  
  /**
   * Set global context with validation
   */
  async setContext(context: GlobalAIContext): Promise<void> {
    try {
      this.globalContext = context;
      this.clearCache();
      
      // Validate context if validation mode is enabled
      if (this.config.enableValidation) {
        await this.validateContext(context);
      }
      
      // Record context change
      if (this.config.enablePerformanceMonitoring) {
        this.recordInteraction({
          id: this.generateId(),
          timestamp: new Date(),
          component: 'ai_service',
          action: 'recommendation_shown',
          performanceMetrics: {
            executionTime: 0,
            memoryUsage: window.performance.memory?.usedJSHeapSize || 0,
            cacheHit: false
          }
        });
      }
    } catch (error) {
      this.errorHandler.handleError(error, 'setContext', { context });
      throw error;
    }
  }
  
  /**
   * Get current global context
   */
  getContext(): GlobalAIContext | null {
    return this.globalContext;
  }
  
  /**
   * Main analysis method with validation and error handling
   */
  async analyze(partialSelections?: Partial<PerWorkoutOptions>): Promise<UnifiedAIAnalysis> {
    const startTime = performance.now();
    const startMemory = window.performance.memory?.usedJSHeapSize || 0;
    
    if (!this.globalContext) {
      throw new Error('AI Service requires global context to be set');
    }
    
    const currentSelections = { ...this.globalContext.currentSelections, ...partialSelections };
    
    try {
      const cacheKey = this.generateCacheKey(currentSelections);
      
      // Check cache first
      const cached = this.analysisCache.get(cacheKey);
      if (cached && !this.isCacheExpired(cached)) {
        this.performanceMonitor.recordCacheHit();
        return cached;
      }
      
      // Generate analysis with retry logic
      const analysis = await this.executeWithRetry(
        () => this.generateAnalysis(currentSelections),
        this.config.maxRetries
      );
      
      // Validate against legacy implementation if enabled
      if (this.config.enableValidation && this.legacyImplementations) {
        analysis.validationResults = await this.validateAnalysis(analysis, currentSelections);
      }
      
      // Add performance metrics
      const endTime = performance.now();
      const endMemory = window.performance.memory?.usedJSHeapSize || 0;
      
      analysis.performanceMetrics = {
        totalExecutionTime: endTime - startTime,
        cacheHitRate: this.performanceMonitor.getCacheHitRate(),
        memoryPeakUsage: endMemory - startMemory
      };
      
      // Cache the result
      this.analysisCache.set(cacheKey, analysis);
      this.maintainCacheSize();
      
      // Monitor performance
      if (this.config.enablePerformanceMonitoring) {
        this.performanceMonitor.recordAnalysis(analysis.performanceMetrics);
      }
      
      return analysis;
      
    } catch (error) {
      this.errorHandler.handleError(error, 'analyze', { partialSelections });
      throw error;
    }
  }
  
  /**
   * Generate analysis using domain services
   */
  private async generateAnalysis(currentSelections: PerWorkoutOptions): Promise<UnifiedAIAnalysis> {
    const analysisId = this.generateId();
    
    // Generate domain-specific insights in parallel
    const [energyInsights, sorenessInsights, focusInsights, durationInsights, equipmentInsights] = await Promise.all([
      this.energy.analyze(currentSelections.customization_energy, this.globalContext!),
      this.soreness.analyze(currentSelections.customization_soreness, this.globalContext!),
      this.focus.analyze(currentSelections.customization_focus, this.globalContext!),
      this.duration.analyze(currentSelections.customization_duration, this.globalContext!),
      this.equipment.analyze(currentSelections.customization_equipment, this.globalContext!)
    ]);
    
    const insights = {
      energy: energyInsights,
      soreness: sorenessInsights,
      focus: focusInsights,
      duration: durationInsights,
      equipment: equipmentInsights
    };
    
    // Cross-component analysis
    const crossComponentConflicts = await this.crossComponent.detectConflicts(
      currentSelections,
      this.globalContext!
    );
    
    // Generate prioritized recommendations
    const recommendations = await this.generatePrioritizedRecommendations(
      insights,
      crossComponentConflicts
    );
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(insights, recommendations);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(insights, crossComponentConflicts, recommendations);
    
    return {
      id: analysisId,
      timestamp: new Date(),
      insights,
      crossComponentConflicts,
      recommendations,
      confidence,
      reasoning,
      performanceMetrics: {
        totalExecutionTime: 0, // Will be set by caller
        cacheHitRate: 0,
        memoryPeakUsage: 0
      }
    };
  }
  
  /**
   * Validate analysis against legacy implementation
   */
  private async validateAnalysis(
    analysis: UnifiedAIAnalysis,
    currentSelections: PerWorkoutOptions
  ): Promise<ValidationResult> {
    if (!this.legacyImplementations) {
      return {
        isValid: true,
        consistencyScore: 1.0,
        discrepancies: [],
        performanceComparison: { oldTime: 0, newTime: 0, memoryDifference: 0 }
      };
    }
    
    try {
      const discrepancies: ValidationResult['discrepancies'] = [];
      
      // Validate energy insights
      if (currentSelections.customization_energy) {
        const legacyEnergy = this.legacyImplementations.energy.implementation(
          currentSelections.customization_energy
        );
        const newEnergy = analysis.insights.energy;
        
        if (!this.compareInsights(legacyEnergy, newEnergy)) {
          discrepancies.push({
            component: 'energy',
            expected: legacyEnergy,
            actual: newEnergy,
            severity: 'high'
          });
        }
      }
      
      // Validate recommendations
      const legacyRecommendations = this.legacyImplementations.recommendations.implementation(
        currentSelections,
        this.globalContext!.userProfile
      );
      
      if (!this.compareRecommendations(legacyRecommendations, analysis.recommendations)) {
        discrepancies.push({
          component: 'recommendations',
          expected: legacyRecommendations,
          actual: analysis.recommendations,
          severity: 'medium'
        });
      }
      
      const consistencyScore = 1.0 - (discrepancies.length * 0.1);
      
      return {
        isValid: discrepancies.length === 0,
        consistencyScore: Math.max(0, consistencyScore),
        discrepancies,
        performanceComparison: {
          oldTime: 0, // Would be measured in real implementation
          newTime: 0,
          memoryDifference: 0
        }
      };
      
    } catch (error) {
      this.errorHandler.handleError(error, 'validateAnalysis', { analysis, currentSelections });
      
      return {
        isValid: false,
        consistencyScore: 0,
        discrepancies: [{
          component: 'validation',
          expected: 'successful_validation',
          actual: 'validation_error',
          severity: 'high'
        }],
        performanceComparison: { oldTime: 0, newTime: 0, memoryDifference: 0 }
      };
    }
  }
  
  /**
   * Execute function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
  
  /**
   * Record user interaction with enhanced tracking
   */
  recordInteraction(interaction: AIInteraction): void {
    if (!this.globalContext) return;
    
    // Add to session history
    this.globalContext.sessionHistory.push(interaction);
    
    // Limit session history size
    if (this.globalContext.sessionHistory.length > 1000) {
      this.globalContext.sessionHistory = this.globalContext.sessionHistory.slice(-500);
    }
    
    // Learn from interaction
    this.updateRecommendationWeights(interaction);
    
    // Monitor performance
    if (this.config.enablePerformanceMonitoring && interaction.performanceMetrics) {
      this.performanceMonitor.recordInteraction(interaction);
    }
    
    // Handle errors
    if (interaction.action === 'error_occurred' && interaction.errorDetails) {
      this.errorHandler.handleError(
        new Error(interaction.errorDetails.message),
        'user_interaction',
        interaction.errorDetails.context
      );
    }
  }
  
  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    averageExecutionTime: number;
    cacheHitRate: number;
    errorRate: number;
    memoryUsage: number;
  } {
    return this.performanceMonitor.getMetrics();
  }
  
  /**
   * Enable or disable validation mode
   */
  setValidationMode(enabled: boolean): void {
    this.config.enableValidation = enabled;
    
    if (enabled && !this.legacyImplementations) {
      this.initializeLegacyImplementations();
    }
  }
  
  /**
   * Get health status of AI service
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      cacheSize: number;
      errorRate: number;
      averageResponseTime: number;
      validationEnabled: boolean;
    };
  } {
    const metrics = this.getPerformanceMetrics();
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (metrics.errorRate > 0.1) {
      status = 'unhealthy';
    } else if (metrics.errorRate > 0.05 || metrics.averageExecutionTime > 100) {
      status = 'degraded';
    }
    
    return {
      status,
      details: {
        cacheSize: this.analysisCache.size,
        errorRate: metrics.errorRate,
        averageResponseTime: metrics.averageExecutionTime,
        validationEnabled: this.config.enableValidation
      }
    };
  }
  
  // External AI Strategy Integration
  setExternalStrategy(strategy: any): void {
    this.externalStrategy = strategy;
  }

  // Generate AI-powered workout from Quick Workout data
  async generateWorkout(workoutData: any): Promise<any> {
    if (!this.externalStrategy) {
      throw new Error('External AI strategy not configured');
    }
    
    if (!this.globalContext) {
      throw new Error('AI Service requires global context to be set');
    }

    try {
      // Use external AI to generate workout
      const workoutRequest = {
        userProfile: this.globalContext.userProfile,
        workoutOptions: workoutData,
        preferences: {
          duration: workoutData.customization_duration || 30,
          focus: workoutData.customization_focus || 'General Fitness',
          intensity: this.mapEnergyToIntensity(workoutData.customization_energy || 5),
          equipment: workoutData.customization_equipment || [],
          location: 'home'
        },
        constraints: {
          timeOfDay: 'morning',
          energyLevel: workoutData.customization_energy || 5,
          sorenessAreas: workoutData.customization_soreness || []
        }
      };

      return await this.externalStrategy.generateWorkout(workoutRequest);
    } catch (error) {
      console.error('External AI workout generation failed:', error);
      throw error;
    }
  }

  // Enhanced recommendations using external AI
  async getEnhancedRecommendations(): Promise<PrioritizedRecommendation[]> {
    if (!this.externalStrategy || !this.globalContext) {
      // Fall back to standard analysis
      const analysis = await this.analyze();
      return analysis.recommendations;
    }

    try {
      // Use external AI for enhanced recommendations
      const enhancedRecommendations = await this.externalStrategy.generateRecommendations(this.globalContext);
      return enhancedRecommendations;
    } catch (error) {
      console.error('External AI recommendations failed, falling back to standard:', error);
      // Fall back to standard recommendations
      const analysis = await this.analyze();
      return analysis.recommendations;
    }
  }

  // Enhanced insights using external AI
  async getEnhancedInsights(): Promise<any> {
    if (!this.externalStrategy || !this.globalContext) {
      return this.analyze();
    }

    try {
      // Get standard analysis first
      const standardAnalysis = await this.analyze();
      
      // Enhance with external AI
      const enhancedInsights = await this.externalStrategy.enhanceInsights(
        Object.values(standardAnalysis.insights).flat(),
        this.globalContext
      );

      return {
        ...standardAnalysis,
        enhancedInsights
      };
    } catch (error) {
      console.error('External AI insight enhancement failed:', error);
      return this.analyze();
    }
  }

  // User preference analysis using external AI
  async analyzeUserPreferences(): Promise<any> {
    if (!this.externalStrategy || !this.globalContext) {
      return null;
    }

    try {
      return await this.externalStrategy.analyzeUserPreferences(this.globalContext);
    } catch (error) {
      console.error('External AI user analysis failed:', error);
      return null;
    }
  }

  // Helper method to map energy level to intensity
  private mapEnergyToIntensity(energyLevel: number): 'low' | 'moderate' | 'high' {
    if (energyLevel <= 3) return 'low';
    if (energyLevel <= 7) return 'moderate';
    return 'high';
  }

  // Private helper methods
  private async initializeLegacyImplementations(): Promise<void> {
    try {
      this.legacyImplementations = await aiLogicExtractor.extractAllAILogic();
    } catch (error) {
      this.errorHandler.handleError(error, 'initializeLegacyImplementations', {});
    }
  }
  
  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateCacheKey(selections: PerWorkoutOptions): string {
    return JSON.stringify({
      selections,
      fitnessLevel: this.globalContext?.userProfile.fitnessLevel || 'unknown',
      timestamp: Math.floor(Date.now() / (5 * 60 * 1000)) // 5-minute cache windows
    });
  }
  
  private isCacheExpired(analysis: UnifiedAIAnalysis): boolean {
    const age = Date.now() - analysis.timestamp.getTime();
    return age > this.config.cacheTimeout;
  }
  
  private clearCache(): void {
    this.analysisCache.clear();
  }
  
  private maintainCacheSize(): void {
    if (this.analysisCache.size > this.config.cacheSize) {
      const entries = Array.from(this.analysisCache.entries());
      entries.sort((a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime());
      
      // Keep only the newest entries
      this.analysisCache.clear();
      entries.slice(0, this.config.cacheSize).forEach(([key, value]) => {
        this.analysisCache.set(key, value);
      });
    }
  }
  
  private async validateContext(context: GlobalAIContext): Promise<void> {
    if (!context.userProfile) {
      throw new Error('User profile is required in AI context');
    }
    
    if (!context.currentSelections) {
      throw new Error('Current selections are required in AI context');
    }
    
    // Additional validation logic...
  }
  
  private compareInsights(legacy: AIInsight[], current: AIInsight[]): boolean {
    if (legacy.length !== current.length) return false;
    
    for (let i = 0; i < legacy.length; i++) {
      if (legacy[i].type !== current[i].type ||
          legacy[i].message !== current[i].message ||
          legacy[i].recommendation !== current[i].recommendation) {
        return false;
      }
    }
    
    return true;
  }
  
  private compareRecommendations(legacy: any, current: PrioritizedRecommendation[]): boolean {
    // Compare recommendation content and priority
    // This would be implemented based on specific legacy format
    return true; // Placeholder
  }
  
  private async generatePrioritizedRecommendations(
    insights: UnifiedAIAnalysis['insights'],
    conflicts: CrossComponentConflict[]
  ): Promise<PrioritizedRecommendation[]> {
    const recommendations: PrioritizedRecommendation[] = [];
    
    // Convert conflicts to high-priority recommendations
    conflicts.forEach(conflict => {
      recommendations.push({
        id: conflict.id,
        priority: conflict.severity === 'critical' ? 'critical' : 'high',
        category: conflict.type === 'safety' ? 'safety' : 'optimization',
        targetComponent: conflict.components[0],
        title: `${conflict.type.replace('_', ' ').toUpperCase()} Issue Detected`,
        description: conflict.description,
        reasoning: conflict.suggestedResolution,
        confidence: conflict.confidence,
        risk: conflict.severity === 'critical' ? 'high' : 'medium',
        action: {
          type: 'suggest_alternative',
          alternatives: [conflict.suggestedResolution]
        }
      });
    });
    
    // Convert domain insights to recommendations
    Object.entries(insights).forEach(([domain, domainInsights]) => {
      domainInsights.forEach(insight => {
        if (insight.actionable) {
          recommendations.push({
            id: insight.id,
            priority: insight.type === 'warning' ? 'high' : 'medium',
            category: insight.type === 'warning' ? 'safety' : 'optimization',
            targetComponent: domain,
            title: insight.message,
            description: insight.message,
            reasoning: `Based on ${domain} analysis`,
            confidence: insight.confidence,
            risk: insight.type === 'warning' ? 'medium' : 'low'
          });
        }
      });
    });
    
    // Sort by priority and confidence
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }
  
  private calculateOverallConfidence(
    insights: UnifiedAIAnalysis['insights'],
    recommendations: PrioritizedRecommendation[]
  ): number {
    const allConfidences = [
      ...Object.values(insights).flat().map(i => i.confidence),
      ...recommendations.map(r => r.confidence)
    ];
    
    return allConfidences.length > 0 
      ? allConfidences.reduce((sum, conf) => sum + conf, 0) / allConfidences.length
      : 0.5;
  }
  
  private generateReasoning(
    insights: UnifiedAIAnalysis['insights'],
    conflicts: CrossComponentConflict[],
    recommendations: PrioritizedRecommendation[]
  ): string {
    const reasoningParts: string[] = [];
    
    if (conflicts.length > 0) {
      reasoningParts.push(`Detected ${conflicts.length} cross-component issue(s) requiring attention.`);
    }
    
    const criticalRecs = recommendations.filter(r => r.priority === 'critical').length;
    if (criticalRecs > 0) {
      reasoningParts.push(`${criticalRecs} critical recommendation(s) for immediate action.`);
    }
    
    const domains = Object.keys(insights).filter(domain => insights[domain as keyof typeof insights].length > 0);
    if (domains.length > 0) {
      reasoningParts.push(`Analysis based on ${domains.join(', ')} parameters.`);
    }
    
    return reasoningParts.join(' ') || 'Comprehensive analysis completed successfully.';
  }
  
  private updateRecommendationWeights(interaction: AIInteraction): void {
    // Enhanced learning mechanism
    if (interaction.userFeedback === 'helpful') {
      // Increase confidence in similar recommendations
      console.log('Learning: User found recommendation helpful');
    } else if (interaction.userFeedback === 'not_helpful') {
      // Decrease confidence in similar recommendations
      console.log('Learning: User found recommendation not helpful');
    }
  }
  
  /**
   * Get energy insights (backward compatibility)
   */
  getEnergyInsights(value: number): any[] {
    if (!this.globalContext) {
      return [];
    }
    
    try {
      // Use the energy service directly for backward compatibility
      return this.energy.generateInsights(value, this.globalContext);
    } catch (error) {
      console.error('Energy insights failed:', error);
      return [];
    }
  }
  
  /**
   * Get soreness insights (backward compatibility)
   */
  getSorenessInsights(value: string[]): any[] {
    if (!this.globalContext) {
      return [];
    }
    
    try {
      // Use the soreness service directly for backward compatibility
      return this.soreness.generateInsights(value, this.globalContext);
    } catch (error) {
      console.error('Soreness insights failed:', error);
      return [];
    }
  }
} 