// QuickWorkoutSetup Feature - Duration Strategy
// Handles duration selection logic and configuration mapping

import { DurationConfig, DURATION_CONFIGS, getDurationConfig, QUICK_WORKOUT_CONSTANTS } from '../constants/quick-workout.constants';
import { 
  QuickWorkoutParams, 
  DurationStrategyResult, 
  WorkflowContext,
  DurationOptimization 
} from '../types/quick-workout.types';
import { UserProfile } from '../../../../types';

/**
 * Duration strategy for optimizing workout duration based on user context
 */
export class DurationStrategy {
  private readonly supportedDurations = QUICK_WORKOUT_CONSTANTS.SUPPORTED_DURATIONS;
  private readonly defaultDuration = QUICK_WORKOUT_CONSTANTS.DEFAULT_DURATION;

  /**
   * Select optimal duration strategy based on parameters
   */
  selectStrategy(params: QuickWorkoutParams, userProfile?: UserProfile): DurationStrategyResult {
    console.log(`🎯 DurationStrategy: Selecting strategy for ${params.duration}min workout`);

    // Find the closest supported duration
    const adjustedDuration = this.findOptimalDuration(params);
    const config = getDurationConfig(adjustedDuration);

    // Analyze the selection
    const isExactMatch = adjustedDuration === params.duration;
    const adjustmentReason = this.getAdjustmentReason(params.duration, adjustedDuration, params);

    // Generate recommendations
    const recommendations = this.generateRecommendations(params, config, userProfile);
    const alternativeOptions = this.getAlternativeOptions(adjustedDuration, params);

    console.log(`✅ DurationStrategy: Selected ${adjustedDuration}min (${config.name}) - exact match: ${isExactMatch}`);

    return {
      config,
      adjustedDuration,
      isExactMatch,
      adjustmentReason,
      recommendations,
      alternativeOptions
    };
  }

  /**
   * Find the optimal duration based on user context
   */
  private findOptimalDuration(params: QuickWorkoutParams): number {
    const requestedDuration = params.duration;

    // If exact match exists, use it
    if (this.supportedDurations.includes(requestedDuration)) {
      return requestedDuration;
    }

    // Find closest duration with context-aware adjustments
    let closestDuration = this.supportedDurations.reduce((prev, curr) => 
      Math.abs(curr - requestedDuration) < Math.abs(prev - requestedDuration) ? curr : prev
    );

    // Apply context-based adjustments
    closestDuration = this.applyContextAdjustments(closestDuration, params);

    return closestDuration;
  }

  /**
   * Apply context-based adjustments to duration selection
   */
  private applyContextAdjustments(duration: number, params: QuickWorkoutParams): number {
    let adjustedDuration = duration;

    // Low energy level - prefer shorter durations
    if (params.energyLevel <= 3) {
      const shorterOptions = this.supportedDurations.filter(d => d <= duration);
      if (shorterOptions.length > 0) {
        adjustedDuration = Math.max(...shorterOptions.filter(d => d >= 10)); // Minimum 10min
        console.log(`⚡ DurationStrategy: Low energy (${params.energyLevel}/10) - adjusting to ${adjustedDuration}min`);
      }
    }

    // High soreness - prefer gentler, potentially shorter workouts
    if (params.sorenessAreas.length >= 3) {
      const gentlerOptions = this.supportedDurations.filter(d => d <= duration && d >= 15);
      if (gentlerOptions.length > 0) {
        adjustedDuration = Math.min(adjustedDuration, Math.max(...gentlerOptions));
        console.log(`🩹 DurationStrategy: High soreness (${params.sorenessAreas.length} areas) - adjusting to ${adjustedDuration}min`);
      }
    }

    // Limited equipment - ensure duration matches available options
    if (params.equipment.length === 0) {
      // Body weight workouts can be any duration
      console.log(`🏠 DurationStrategy: Body weight workout - keeping ${adjustedDuration}min`);
    }

    // Fitness level considerations
    if (params.fitnessLevel === 'new to exercise' && adjustedDuration > 30) {
      adjustedDuration = 30;
      console.log(`👤 DurationStrategy: New to exercise - capping at ${adjustedDuration}min`);
    }

    return adjustedDuration;
  }

  /**
   * Get reason for duration adjustment
   */
  private getAdjustmentReason(
    requested: number, 
    adjusted: number, 
    params: QuickWorkoutParams
  ): string | undefined {
    if (requested === adjusted) {
      return undefined;
    }

    const reasons: string[] = [];

    // Duration not supported
    if (!this.supportedDurations.includes(requested)) {
      reasons.push(`${requested}min not directly supported`);
    }

    // Context-based adjustments
    if (params.energyLevel <= 3 && adjusted < requested) {
      reasons.push(`adjusted down due to low energy level (${params.energyLevel}/10)`);
    }

    if (params.sorenessAreas.length >= 3 && adjusted < requested) {
      reasons.push(`adjusted down due to high soreness (${params.sorenessAreas.length} areas)`);
    }

    if (params.fitnessLevel === 'new to exercise' && adjusted < requested) {
      reasons.push(`adjusted down for beginner-friendly duration`);
    }

    return reasons.join('; ');
  }

  /**
   * Generate context-aware recommendations
   */
  private generateRecommendations(
    params: QuickWorkoutParams, 
    config: DurationConfig,
    userProfile?: UserProfile
  ): string[] {
    const recommendations: string[] = [];

    // Energy level recommendations
    if (params.energyLevel <= 3) {
      recommendations.push(`With low energy (${params.energyLevel}/10), focus on gentle movements and listen to your body`);
    } else if (params.energyLevel >= 8) {
      recommendations.push(`High energy level (${params.energyLevel}/10) - great opportunity for an intense ${config.name.toLowerCase()}`);
    }

    // Soreness recommendations
    if (params.sorenessAreas.length > 0) {
      recommendations.push(`Avoid intense work on sore areas: ${params.sorenessAreas.join(', ')}`);
    }

    // Duration-specific recommendations
    if (config.duration <= 10) {
      recommendations.push(`Short ${config.duration}min workout - focus on compound movements for maximum efficiency`);
    } else if (config.duration >= 30) {
      recommendations.push(`Longer ${config.duration}min workout - good opportunity for comprehensive training`);
    }

    // Equipment recommendations
    if (params.equipment.length === 0) {
      recommendations.push(`Body weight workout - focus on form and controlled movements`);
    } else if (params.equipment.length >= 3) {
      recommendations.push(`Good equipment variety - opportunity for diverse exercise selection`);
    }

    // Fitness level recommendations
    if (params.fitnessLevel === 'new to exercise') {
      recommendations.push(`As someone new to exercise, focus on learning proper form over intensity`);
    } else if (params.fitnessLevel === 'advanced athlete') {
      recommendations.push(`Advanced level - opportunity for complex movements and higher intensity`);
    }

    return recommendations;
  }

  /**
   * Get alternative duration options
   */
  private getAlternativeOptions(selectedDuration: number, params: QuickWorkoutParams): DurationConfig[] {
    // Get 2-3 alternative durations
    const alternatives = this.supportedDurations
      .filter(d => d !== selectedDuration)
      .sort((a, b) => Math.abs(a - params.duration) - Math.abs(b - params.duration))
      .slice(0, 3)
      .map(d => getDurationConfig(d));

    return alternatives;
  }

  /**
   * Validate duration strategy selection
   */
  validateStrategy(result: DurationStrategyResult, params: QuickWorkoutParams): boolean {
    // Check if selected duration is supported
    if (!this.supportedDurations.includes(result.adjustedDuration)) {
      console.error(`❌ DurationStrategy: Invalid duration ${result.adjustedDuration}min not in supported list`);
      return false;
    }

    // Check if configuration exists
    if (!result.config) {
      console.error(`❌ DurationStrategy: No configuration found for ${result.adjustedDuration}min`);
      return false;
    }

    // Check for reasonable adjustment (not more than 50% change)
    const adjustmentRatio = Math.abs(result.adjustedDuration - params.duration) / params.duration;
    if (adjustmentRatio > 0.5) {
      console.warn(`⚠️ DurationStrategy: Large adjustment from ${params.duration}min to ${result.adjustedDuration}min (${Math.round(adjustmentRatio * 100)}%)`);
    }

    console.log(`✅ DurationStrategy: Validation passed for ${result.adjustedDuration}min strategy`);
    return true;
  }

  /**
   * Create duration optimization information
   */
  createDurationOptimization(
    params: QuickWorkoutParams,
    result: DurationStrategyResult
  ): DurationOptimization {
    const config = result.config;
    const actualDuration = result.adjustedDuration;

    // Calculate phase allocation in seconds
    const totalSeconds = actualDuration * 60;
    const phaseAllocation = {
      warmup: Math.round(totalSeconds * (config.timeAllocation.warmupPercent / 100)),
      main: Math.round(totalSeconds * (config.timeAllocation.mainPercent / 100)),
      cooldown: Math.round(totalSeconds * (config.timeAllocation.cooldownPercent / 100))
    };

    // Generate optimization recommendations
    const recommendations: string[] = [];
    if (!result.isExactMatch) {
      recommendations.push(`Adjusted from ${params.duration}min to ${actualDuration}min for optimal workout structure`);
    }

    if (config.complexity === 'minimal') {
      recommendations.push(`Simple structure with ${config.exerciseCount.total} exercises for time efficiency`);
    } else if (config.complexity === 'comprehensive') {
      recommendations.push(`Comprehensive structure with ${config.exerciseCount.total} exercises for complete training`);
    }

    // Suggest alternative durations
    const alternativeDurations = result.alternativeOptions.map(alt => alt.duration);

    return {
      requestedDuration: params.duration,
      actualDuration,
      isOptimal: result.isExactMatch,
      phaseAllocation,
      recommendations,
      alternativeDurations
    };
  }

  /**
   * Get supported durations
   */
  getSupportedDurations(): number[] {
    return [...this.supportedDurations];
  }

  /**
   * Get duration configuration by duration
   */
  getDurationConfig(duration: number): DurationConfig {
    return getDurationConfig(duration);
  }
} 