// Selection Analyzer - Main service for analyzing workout selections during generation
import { UserProfile } from '../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../types/core';
import { 
  SelectionAnalysis, 
  SelectionAnalysisContext, 
  SelectionAnalysisConfig,
  DEFAULT_SELECTION_ANALYSIS_CONFIG,
  SelectionAnalyzer as ISelectionAnalyzer,
  SelectionAnalysisError,
  SelectionAnalysisValidationResult,
  FactorAnalysis
} from './types/selection-analysis.types';
import { GoalAlignmentAnalyzer } from './analyzers/GoalAlignmentAnalyzer';
import { IntensityMatchAnalyzer } from './analyzers/IntensityMatchAnalyzer';
import { DurationFitAnalyzer } from './analyzers/DurationFitAnalyzer';
import { RecoveryRespectAnalyzer } from './analyzers/RecoveryRespectAnalyzer';
import { EquipmentOptimizationAnalyzer } from './analyzers/EquipmentOptimizationAnalyzer';
import { aiLogger } from '../../../logging/AILogger';

/**
 * Main selection analysis service that orchestrates factor-based analysis
 * to determine how well user's workout selections align with their profile and goals.
 */
export class SelectionAnalyzer {
  private config: SelectionAnalysisConfig;
  private readonly analyzers: ISelectionAnalyzer[];
  private cache: Map<string, SelectionAnalysis> = new Map();

  constructor(config: Partial<SelectionAnalysisConfig> = {}) {
    this.config = { ...DEFAULT_SELECTION_ANALYSIS_CONFIG, ...config };
    this.analyzers = this.initializeAnalyzers();
  }

  /**
   * Analyze user's workout selections comprehensively
   */
  async analyzeSelections(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): Promise<SelectionAnalysis> {
    const startTime = Date.now();
    
    try {
      aiLogger.debug('SelectionAnalyzer: Starting analysis', {
        context: 'selection analysis',
        component: 'SelectionAnalyzer',
        userProfile: {
          fitnessLevel: userProfile.fitnessLevel,
          goalsCount: userProfile.goals?.length || 0,
          basicLimitations: {
            injuriesCount: userProfile.basicLimitations?.injuries?.length || 0,
            availableEquipmentCount: userProfile.basicLimitations?.availableEquipment?.length || 0
          }
        },
        workoutOptions: {
          focus: workoutOptions.customization_focus,
          energy: workoutOptions.customization_energy,
          duration: workoutOptions.customization_duration,
          equipmentCount: workoutOptions.customization_equipment?.length || 0
        },
        analysisContext: context,
        config: {
          enableCaching: this.config.enableCaching,
          enableDetailedLogging: this.config.enableDetailedLogging,
          cacheTimeout: this.config.cacheTimeout
        }
      });

      // Validate inputs
      const validation = this.validateInputs(userProfile, workoutOptions, context);
      if (!validation.isValid) {
        aiLogger.error({
          error: new Error(`Invalid inputs: ${validation.errors.join(', ')}`),
          context: 'selection analysis',
          component: 'SelectionAnalyzer',
          severity: 'high',
          userImpact: true,
          metadata: {
            validationErrors: validation.errors,
            validationWarnings: validation.warnings,
            dataQuality: validation.dataQuality
          }
        });
        throw new Error(`Invalid inputs: ${validation.errors.join(', ')}`);
      }

      aiLogger.debug('SelectionAnalyzer: Input validation passed', {
        context: 'selection analysis',
        component: 'SelectionAnalyzer',
        dataQuality: validation.dataQuality,
        warnings: validation.warnings
      });

      // Check cache first
      const cacheKey = this.generateCacheKey(userProfile, workoutOptions, context);
      if (this.config.enableCaching) {
        const cached = this.cache.get(cacheKey);
        if (cached && this.isCacheValid(cached)) {
          aiLogger.debug('SelectionAnalyzer: Returning cached analysis result', {
            context: 'selection analysis',
            component: 'SelectionAnalyzer',
            cacheKey: cacheKey.substring(0, 20) + '...',
            cacheAge: Date.now() - cached.metadata.timestamp.getTime()
          });
          return cached;
        }
      }

      aiLogger.debug('SelectionAnalyzer: Calculating factor scores', {
        context: 'selection analysis',
        component: 'SelectionAnalyzer',
        analyzerCount: this.analyzers.length,
        analyzerNames: this.analyzers.map(a => a.getAnalyzerName())
      });

      // Calculate individual factor scores
      const factorResults = await this.calculateFactors(userProfile, workoutOptions, context);
      
      aiLogger.debug('SelectionAnalyzer: Factor calculation completed', {
        context: 'selection analysis',
        component: 'SelectionAnalyzer',
        factors: Object.keys(factorResults).map(factor => ({
          factor,
          score: factorResults[factor as keyof typeof factorResults]?.score || 0,
          status: factorResults[factor as keyof typeof factorResults]?.status || 'unknown'
        }))
      });
      
      // Calculate weighted overall score
      const overallScore = this.calculateWeightedScore(factorResults);
      
      aiLogger.debug('SelectionAnalyzer: Overall score calculated', {
        context: 'selection analysis',
        component: 'SelectionAnalyzer',
        overallScore,
        factorWeights: this.config.weights
      });
      
      // Generate insights and suggestions
      const insights = this.generateInsights(factorResults, userProfile, workoutOptions);
      const suggestions = this.generateSuggestions(factorResults, userProfile, workoutOptions);
      const educationalContent = this.generateEducationalContent(factorResults, userProfile, workoutOptions);
      
      aiLogger.debug('SelectionAnalyzer: Generated insights and suggestions', {
        context: 'selection analysis',
        component: 'SelectionAnalyzer',
        insightsCount: insights.length,
        suggestionsCount: suggestions.length,
        educationalContentCount: educationalContent.length
      });
      
      // Calculate metadata
      const analysisTime = Date.now() - startTime;
      const metadata = {
        analysisTime,
        factorWeights: this.config.weights,
        dataQuality: validation.dataQuality,
        version: '1.0.0',
        timestamp: new Date()
      };

      const result: SelectionAnalysis = {
        overallScore,
        factors: factorResults,
        insights,
        suggestions,
        educationalContent,
        metadata
      };

      // Cache the result
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result);
        this.cleanupCache();
        aiLogger.debug('SelectionAnalyzer: Result cached', {
          context: 'selection analysis',
          component: 'SelectionAnalyzer',
          cacheSize: this.cache.size
        });
      }

      aiLogger.info('SelectionAnalyzer: Analysis completed successfully', {
        context: 'selection analysis',
        component: 'SelectionAnalyzer',
        analysisTime,
        overallScore,
        factors: Object.keys(factorResults).map(key => ({ 
          factor: key, 
          score: factorResults[key as keyof typeof factorResults].score,
          status: factorResults[key as keyof typeof factorResults].status
        })),
        insightsCount: insights.length,
        suggestionsCount: suggestions.length,
        educationalContentCount: educationalContent.length,
        cacheHit: false
      });

      return result;

    } catch (error) {
      const analysisTime = Date.now() - startTime;
      const selectionError: SelectionAnalysisError = {
        type: 'ANALYSIS_ERROR',
        message: error instanceof Error ? error.message : 'Unknown selection analysis error',
        details: error,
        timestamp: new Date()
      };

      aiLogger.error({
        error: new Error(selectionError.message),
        context: 'selection analysis',
        component: 'SelectionAnalyzer',
        severity: 'medium',
        userImpact: false,
        metadata: {
          analysisTime,
          userProfile: {
            fitnessLevel: userProfile.fitnessLevel,
            goalsCount: userProfile.goals?.length || 0
          },
          workoutOptions: {
            focus: workoutOptions.customization_focus,
            energy: workoutOptions.customization_energy,
            duration: workoutOptions.customization_duration
          },
          analysisContext: context
        }
      });

      throw selectionError;
    }
  }

  /**
   * Calculate individual factor scores using all analyzers
   */
  private async calculateFactors(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    context: SelectionAnalysisContext
  ): Promise<SelectionAnalysis['factors']> {
    const factorPromises = this.analyzers.map(async (analyzer) => {
      try {
        const result = await analyzer.analyze(userProfile, workoutOptions, context);
        return {
          name: analyzer.getAnalyzerName(),
          result
        };
      } catch (error) {
        aiLogger.warn(`Factor analysis failed for ${analyzer.getAnalyzerName()}`, {
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'factor analysis',
          component: 'SelectionAnalyzer'
        });
        return {
          name: analyzer.getAnalyzerName(),
          result: {
            score: 0.5,
            status: 'warning',
            reasoning: 'Analysis failed - using default score',
            impact: 'Unable to determine impact',
            details: ['Analysis encountered an error']
          }
        };
      }
    });

    const factorResults = await Promise.all(factorPromises);
    
    return {
      goalAlignment: (factorResults.find(f => f.name === 'goalAlignment')?.result || this.getDefaultFactorResult()) as FactorAnalysis,
      intensityMatch: (factorResults.find(f => f.name === 'intensityMatch')?.result || this.getDefaultFactorResult()) as FactorAnalysis,
      durationFit: (factorResults.find(f => f.name === 'durationFit')?.result || this.getDefaultFactorResult()) as FactorAnalysis,
      recoveryRespect: (factorResults.find(f => f.name === 'recoveryRespect')?.result || this.getDefaultFactorResult()) as FactorAnalysis,
      equipmentOptimization: (factorResults.find(f => f.name === 'equipmentOptimization')?.result || this.getDefaultFactorResult()) as FactorAnalysis
    };
  }

  /**
   * Calculate weighted overall score from individual factors
   */
  private calculateWeightedScore(factors: SelectionAnalysis['factors']): number {
    const weightedSum = Object.entries(factors).reduce((sum, [factorName, factor]) => {
      const weight = this.config.weights[factorName as keyof typeof this.config.weights] || 0;
      return sum + (factor.score * weight);
    }, 0);

    return Math.max(0, Math.min(1, weightedSum));
  }

  /**
   * Generate insights based on factor analysis
   */
  private generateInsights(
    factors: SelectionAnalysis['factors'],
    _userProfile: UserProfile,
    _workoutOptions: PerWorkoutOptions
  ): SelectionAnalysis['insights'] {
    const insights: SelectionAnalysis['insights'] = [];
    const overallScore = this.calculateWeightedScore(factors);

    // Overall score insight
    if (overallScore >= 0.85) {
      insights.push({
        id: 'excellent-overall',
        type: 'positive',
        title: 'Excellent Selections!',
        message: 'Your workout selections are perfectly aligned with your profile and goals.',
        factor: 'overall',
        priority: 1,
        actionable: false
      });
    } else if (overallScore >= 0.7) {
      insights.push({
        id: 'good-overall',
        type: 'positive',
        title: 'Good Selections',
        message: 'Your selections generally work well with your profile and goals.',
        factor: 'overall',
        priority: 2,
        actionable: false
      });
    } else if (overallScore >= 0.5) {
      insights.push({
        id: 'moderate-overall',
        type: 'warning',
        title: 'Room for Improvement',
        message: 'Some selections could be optimized for better results.',
        factor: 'overall',
        priority: 3,
        actionable: true
      });
    } else {
      insights.push({
        id: 'poor-overall',
        type: 'warning',
        title: 'Consider Adjustments',
        message: 'Your selections may not optimally support your goals.',
        factor: 'overall',
        priority: 4,
        actionable: true
      });
    }

    // Factor-specific insights
    Object.entries(factors).forEach(([factorName, factor]) => {
      if (factor.score < 0.6) {
        insights.push({
          id: `low-${factorName}`,
          type: 'suggestion',
          title: `${this.getFactorDisplayName(factorName)} Needs Attention`,
          message: factor.reasoning,
          factor: factorName,
          priority: 5,
          actionable: true
        });
      } else if (factor.score >= 0.9) {
        insights.push({
          id: `excellent-${factorName}`,
          type: 'positive',
          title: `Excellent ${this.getFactorDisplayName(factorName)}`,
          message: factor.reasoning,
          factor: factorName,
          priority: 6,
          actionable: false
        });
      }
    });

    return insights.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate actionable suggestions based on factor analysis
   */
  private generateSuggestions(
    factors: SelectionAnalysis['factors'],
    _userProfile: UserProfile,
    _workoutOptions: PerWorkoutOptions
  ): SelectionAnalysis['suggestions'] {
    const suggestions: SelectionAnalysis['suggestions'] = [];
    let suggestionId = 1;

    // Collect suggestions from all factors
    Object.entries(factors).forEach(([factorName, factor]) => {
      if (factor.suggestions) {
        factor.suggestions.forEach((suggestion, _index) => {
          suggestions.push({
            id: `suggestion-${suggestionId++}`,
            action: suggestion,
            description: `Improve ${this.getFactorDisplayName(factorName)}`,
            impact: this.getSuggestionImpact(factor.score),
            estimatedScoreIncrease: this.estimateScoreIncrease(factor.score),
            quickFix: this.isQuickFix(suggestion),
            category: this.getSuggestionCategory(factorName),
            timeRequired: this.getTimeRequired(suggestion),
            priority: this.getSuggestionPriority(factor.score, factorName)
          });
        });
      }
    });

    return suggestions.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate educational content based on factor analysis
   */
  private generateEducationalContent(
    factors: SelectionAnalysis['factors'],
    _userProfile: UserProfile,
    _workoutOptions: PerWorkoutOptions
  ): SelectionAnalysis['educationalContent'] {
    const content: SelectionAnalysis['educationalContent'] = [];

    // Add general educational content
    content.push({
      id: 'selection-basics',
      title: 'Understanding Workout Selection',
      content: 'Your workout selections directly impact the effectiveness and safety of your training. Consider how each choice aligns with your goals, fitness level, and available resources.',
      category: 'selection',
      priority: 1
    });

    // Add factor-specific educational content
    Object.entries(factors).forEach(([factorName, factor]) => {
      if (factor.score < 0.7) {
        content.push({
          id: `learn-${factorName}`,
          title: `Improving ${this.getFactorDisplayName(factorName)}`,
          content: `Learn how to optimize your ${this.getFactorDisplayName(factorName).toLowerCase()} for better workout results.`,
          category: this.getEducationalCategory(factorName),
          priority: 2,
          learnMoreUrl: `/education/${factorName}`
        });
      }
    });

    return content.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Validate input data quality and completeness
   */
  private validateInputs(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    _context: SelectionAnalysisContext
  ): SelectionAnalysisValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let dataQuality = 1.0;

    // Check user profile completeness
    if (!userProfile.fitnessLevel) {
      warnings.push('Fitness level not specified');
      dataQuality -= 0.1;
    }

    if (!userProfile.goals || userProfile.goals.length === 0) {
      warnings.push('No fitness goals specified');
      dataQuality -= 0.2;
    }

    // Check workout options completeness
    if (!workoutOptions.customization_focus) {
      warnings.push('Workout focus not specified');
      dataQuality -= 0.1;
    }

    if (!workoutOptions.customization_energy) {
      warnings.push('Energy level not specified');
      dataQuality -= 0.1;
    }

    if (!workoutOptions.customization_duration) {
      warnings.push('Duration not specified');
      dataQuality -= 0.1;
    }

    // Check for critical errors
    if (!userProfile) {
      errors.push('User profile is required');
      dataQuality = 0;
    }

    if (!workoutOptions) {
      errors.push('Workout options are required');
      dataQuality = 0;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      dataQuality: Math.max(0, dataQuality)
    };
  }

  /**
   * Generate cache key for analysis results
   */
  private generateCacheKey(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    _context: SelectionAnalysisContext
  ): string {
    const profileHash = JSON.stringify({
      fitnessLevel: userProfile.fitnessLevel,
      goals: userProfile.goals,
      equipment: userProfile.basicLimitations?.availableEquipment,
      injuries: userProfile.basicLimitations?.injuries
    });
    
    const optionsHash = JSON.stringify(workoutOptions);
    const contextHash = JSON.stringify({
      generationType: _context.generationType,
      userExperience: _context.userExperience,
      timeOfDay: _context.timeOfDay
    });

    return `${profileHash}-${optionsHash}-${contextHash}`;
  }

  /**
   * Check if cached result is still valid
   */
  private isCacheValid(cached: SelectionAnalysis): boolean {
    const cacheAge = new Date().getTime() - cached.metadata.timestamp.getTime();
    return cacheAge < this.config.cacheTimeout;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = new Date();
    for (const [key, value] of this.cache.entries()) {
      if (!this.isCacheValid(value)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Initialize all analyzers
   */
  private initializeAnalyzers(): ISelectionAnalyzer[] {
    return [
      new GoalAlignmentAnalyzer(),
      new IntensityMatchAnalyzer(),
      new DurationFitAnalyzer(),
      new RecoveryRespectAnalyzer(),
      new EquipmentOptimizationAnalyzer()
    ];
  }

  /**
   * Get default factor result for fallback
   */
  private getDefaultFactorResult(): FactorAnalysis {
    return {
      score: 0.5,
      status: 'warning',
      reasoning: 'Unable to analyze this factor',
      impact: 'Impact unknown',
      details: ['Analysis not available']
    };
  }

  // Helper methods for suggestion generation
  private getFactorDisplayName(factorName: string): string {
    const names: Record<string, string> = {
      goalAlignment: 'Goal Alignment',
      intensityMatch: 'Intensity Match',
      durationFit: 'Duration Fit',
      recoveryRespect: 'Recovery Respect',
      equipmentOptimization: 'Equipment Optimization'
    };
    return names[factorName] || factorName;
  }

  private getSuggestionImpact(score: number): 'high' | 'medium' | 'low' {
    if (score < 0.5) return 'high';
    if (score < 0.7) return 'medium';
    return 'low';
  }

  private estimateScoreIncrease(currentScore: number): number {
    if (currentScore < 0.5) return 0.3;
    if (currentScore < 0.7) return 0.2;
    return 0.1;
  }

  private isQuickFix(suggestion: string): boolean {
    const quickFixKeywords = ['consider', 'try', 'switch', 'change'];
    return quickFixKeywords.some(keyword => suggestion.toLowerCase().includes(keyword));
  }

  private getSuggestionCategory(factorName: string): 'goals' | 'intensity' | 'duration' | 'recovery' | 'equipment' {
    const categories: Record<string, 'goals' | 'intensity' | 'duration' | 'recovery' | 'equipment'> = {
      goalAlignment: 'goals',
      intensityMatch: 'intensity',
      durationFit: 'duration',
      recoveryRespect: 'recovery',
      equipmentOptimization: 'equipment'
    };
    return categories[factorName] || 'goals';
  }

  private getTimeRequired(suggestion: string): 'immediate' | '5min' | '15min' | '30min' {
    if (suggestion.toLowerCase().includes('consider')) return 'immediate';
    if (suggestion.toLowerCase().includes('update')) return '5min';
    if (suggestion.toLowerCase().includes('complete')) return '15min';
    return '30min';
  }

  private getSuggestionPriority(score: number, factorName: string): number {
    const basePriority = score < 0.5 ? 1 : score < 0.7 ? 2 : 3;
    const factorPriorities: Record<string, number> = {
      goalAlignment: 1,
      intensityMatch: 2,
      durationFit: 3,
      recoveryRespect: 4,
      equipmentOptimization: 5
    };
    return basePriority * 10 + (factorPriorities[factorName] || 5);
  }

  private getEducationalCategory(factorName: string): 'selection' | 'fitness' | 'safety' | 'equipment' | 'goals' {
    const categories: Record<string, 'selection' | 'fitness' | 'safety' | 'equipment' | 'goals'> = {
      goalAlignment: 'goals',
      intensityMatch: 'fitness',
      durationFit: 'fitness',
      recoveryRespect: 'safety',
      equipmentOptimization: 'equipment'
    };
    return categories[factorName] || 'selection';
  }

  /**
   * Get service configuration
   */
  getConfig(): SelectionAnalysisConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<SelectionAnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get all analyzers
   */
  getAnalyzers(): ISelectionAnalyzer[] {
    return [...this.analyzers];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
} 