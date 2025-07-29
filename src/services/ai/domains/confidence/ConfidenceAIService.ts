// Confidence AI Service - Domain-specific AI logic for confidence score calculation
import { UserProfile } from '../../../../types/user';
import { GeneratedWorkout } from '../../../../types/workout-generation.types';
import { 
  ConfidenceFactors, 
  ConfidenceResult, 
  ConfidenceLevel, 
  ConfidenceContext, 
  ConfidenceConfig,
  DEFAULT_CONFIDENCE_CONFIG,
  FactorCalculator,
  ConfidenceError
} from './types/confidence.types';
import { ProfileMatchCalculator } from './calculators/ProfileMatchCalculator';
import { SafetyScoreCalculator } from './calculators/SafetyScoreCalculator';
import { EquipmentFitCalculator } from './calculators/EquipmentFitCalculator';
import { GoalAlignmentCalculator } from './calculators/GoalAlignmentCalculator';
import { StructureQualityCalculator } from './calculators/StructureQualityCalculator';
import { aiLogger } from '../../logging/AILogger';

/**
 * Main confidence calculation service that orchestrates factor-based scoring
 * to determine how well a workout fits a user's profile and needs.
 */
export class ConfidenceAIService {
  private config: ConfidenceConfig;
  private readonly calculators: FactorCalculator[];

  constructor(config: Partial<ConfidenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIDENCE_CONFIG, ...config };
    this.calculators = this.initializeCalculators();
  }

  /**
   * Calculate comprehensive confidence score for a workout-user combination
   */
  async calculateConfidence(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): Promise<ConfidenceResult> {
    const startTime = Date.now();
    
    try {
      // Validate inputs
      this.validateInputs(userProfile, workoutData, context);

      // Calculate individual factor scores
      const factors = await this.calculateFactors(userProfile, workoutData, context);
      
      // Calculate weighted overall score
      const overallScore = this.calculateWeightedScore(factors);
      
      // Determine confidence level
      const level = this.determineConfidenceLevel(overallScore);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(factors, level);
      
      // Calculate metadata
      const calculationTime = Date.now() - startTime;
      const metadata = {
        calculationTime,
        factorWeights: this.config.weights,
        dataQuality: this.assessDataQuality(userProfile, workoutData),
        version: '1.0.0',
        timestamp: new Date()
      };

      const result: ConfidenceResult = {
        overallScore,
        factors,
        level,
        recommendations,
        metadata
      };

      if (this.config.enableDetailedLogging) {
        aiLogger.debug('Confidence calculation completed', {
          overallScore,
          level,
          calculationTime,
          factors: Object.keys(factors).map(key => ({ [key]: factors[key as keyof ConfidenceFactors] }))
        });
      }

      return result;

    } catch (error) {
      const calculationTime = Date.now() - startTime;
      const confidenceError: ConfidenceError = {
        type: 'CALCULATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown confidence calculation error',
        details: error,
        timestamp: new Date()
      };

      aiLogger.error({
        error: new Error(confidenceError.message),
        context: 'confidence calculation',
        component: 'ConfidenceAIService',
        severity: 'high',
        userImpact: true,
        metadata: {
          calculationTime
        }
      });

      throw confidenceError;
    }
  }

  /**
   * Calculate individual factor scores using all calculators
   */
  private async calculateFactors(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): Promise<ConfidenceFactors> {
    const factorPromises = this.calculators.map(async (calculator) => {
      try {
        const score = await calculator.calculate(userProfile, workoutData, context);
        return {
          name: calculator.getFactorName(),
          score: Math.max(0, Math.min(1, score)) // Ensure score is between 0-1
        };
      } catch (error) {
        aiLogger.warn(`Factor calculation failed for ${calculator.getFactorName()}`, {
          error: error instanceof Error ? error : new Error(String(error)),
          context: 'factor calculation',
          component: 'ConfidenceAIService'
        });
        return {
          name: calculator.getFactorName(),
          score: 0.5 // Default fallback score
        };
      }
    });

    const factorResults = await Promise.all(factorPromises);
    
    return {
      profileMatch: factorResults.find(f => f.name === 'profileMatch')?.score || 0.5,
      safetyAlignment: factorResults.find(f => f.name === 'safetyAlignment')?.score || 0.5,
      equipmentFit: factorResults.find(f => f.name === 'equipmentFit')?.score || 0.5,
      goalAlignment: factorResults.find(f => f.name === 'goalAlignment')?.score || 0.5,
      structureQuality: factorResults.find(f => f.name === 'structureQuality')?.score || 0.5
    };
  }

  /**
   * Calculate weighted overall score from individual factors
   */
  private calculateWeightedScore(factors: ConfidenceFactors): number {
    const weightedSum = Object.entries(factors).reduce((sum, [factorName, score]) => {
      const weight = this.config.weights[factorName as keyof ConfidenceFactors] || 0;
      return sum + (score * weight);
    }, 0);

    return Math.max(0, Math.min(1, weightedSum));
  }

  /**
   * Determine confidence level based on overall score
   */
  private determineConfidenceLevel(overallScore: number): ConfidenceLevel {
    if (overallScore >= this.config.thresholds.excellent) {
      return 'excellent';
    } else if (overallScore >= this.config.thresholds.good) {
      return 'good';
    } else {
      return 'needs-review';
    }
  }

  /**
   * Generate improvement recommendations based on factor scores
   */
  private generateRecommendations(factors: ConfidenceFactors, level: ConfidenceLevel): string[] {
    const recommendations: string[] = [];

    // Add level-based recommendations
    if (level === 'needs-review') {
      recommendations.push('This workout may need adjustments to better match your profile');
    } else if (level === 'good') {
      recommendations.push('This workout is well-suited to your needs');
    } else {
      recommendations.push('This workout is excellently matched to your profile');
    }

    // Add factor-specific recommendations
    if (factors.profileMatch < 0.6) {
      recommendations.push('Consider adjusting workout intensity to better match your fitness level');
    }
    if (factors.safetyAlignment < 0.6) {
      recommendations.push('Review exercises for any safety concerns with your current condition');
    }
    if (factors.equipmentFit < 0.6) {
      recommendations.push('Some exercises may require equipment you don\'t have available');
    }
    if (factors.goalAlignment < 0.6) {
      recommendations.push('Workout focus may not align perfectly with your primary fitness goals');
    }
    if (factors.structureQuality < 0.6) {
      recommendations.push('Workout structure could be optimized for better flow and effectiveness');
    }

    return recommendations;
  }

  /**
   * Assess data quality for confidence calculation
   */
  private assessDataQuality(userProfile: UserProfile, workoutData: GeneratedWorkout): number {
    let qualityScore = 1.0;
    let missingFields = 0;
    let totalFields = 0;

    // Check user profile completeness
    const profileFields = ['fitnessLevel', 'experienceLevel', 'primaryGoal', 'energyLevel'];
    profileFields.forEach(field => {
      totalFields++;
      if (!userProfile[field as keyof UserProfile]) {
        missingFields++;
      }
    });

          // Check workout data completeness
      const workoutFields = ['mainWorkout', 'totalDuration', 'difficulty'];
      workoutFields.forEach(field => {
        totalFields++;
        if (!workoutData[field as keyof GeneratedWorkout]) {
          missingFields++;
        }
      });

    // Calculate quality score
    if (totalFields > 0) {
      qualityScore = Math.max(0.1, 1 - (missingFields / totalFields));
    }

    return qualityScore;
  }

  /**
   * Validate input parameters
   */
  private validateInputs(
    userProfile: UserProfile,
    workoutData: GeneratedWorkout,
    context: ConfidenceContext
  ): void {
    if (!userProfile) {
      throw new Error('UserProfile is required for confidence calculation');
    }
    if (!workoutData) {
      throw new Error('GeneratedWorkout is required for confidence calculation');
    }
    if (!context) {
      throw new Error('ConfidenceContext is required for confidence calculation');
    }

    // Validate user profile has required fields
    if (!userProfile.fitnessLevel) {
      throw new Error('UserProfile must include fitnessLevel');
    }

    // Validate workout data has required fields
    if (!workoutData.mainWorkout || !Array.isArray(workoutData.mainWorkout.exercises)) {
      throw new Error('GeneratedWorkout must include mainWorkout with exercises array');
    }
  }

  /**
   * Initialize all factor calculators
   */
  private initializeCalculators(): FactorCalculator[] {
    return [
      new ProfileMatchCalculator(),
      new SafetyScoreCalculator(),
      new EquipmentFitCalculator(),
      new GoalAlignmentCalculator(),
      new StructureQualityCalculator()
    ];
  }

  /**
   * Get service configuration
   */
  getConfig(): ConfidenceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<ConfidenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get available factor calculators
   */
  getCalculators(): FactorCalculator[] {
    return [...this.calculators];
  }
} 