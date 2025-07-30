import { UserProfile } from '../../../../../../types/user';
import { PerWorkoutOptions } from '../../../../../../types/core';
import { 
  SelectionAnalyzer, 
  FactorAnalysis, 
  SelectionAnalysisContext 
} from '../types/selection-analysis.types';

/**
 * Analyzes how well selections optimize the use of available equipment
 * Considers equipment availability, workout type compatibility, and space constraints
 */
export class EquipmentOptimizationAnalyzer implements SelectionAnalyzer {
  
  /**
   * Analyze equipment optimization of user's selections
   */
  async analyze(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions,
    _context: SelectionAnalysisContext
  ): Promise<FactorAnalysis> {
    const scores: number[] = [];
    const details: string[] = [];
    const suggestions: string[] = [];

    // 1. Equipment Availability Match (40% weight)
    const availabilityScore = this.analyzeEquipmentAvailabilityMatch(userProfile, workoutOptions);
    scores.push(availabilityScore.score * 0.4);
    details.push(...availabilityScore.details);
    if (availabilityScore.suggestions) suggestions.push(...availabilityScore.suggestions);

    // 2. Workout Type Equipment Optimization (30% weight)
    const typeScore = this.analyzeWorkoutTypeEquipmentOptimization(userProfile, workoutOptions);
    scores.push(typeScore.score * 0.3);
    details.push(...typeScore.details);
    if (typeScore.suggestions) suggestions.push(...typeScore.suggestions);

    // 3. Space Constraint Consideration (20% weight)
    const spaceScore = this.analyzeSpaceConstraintConsideration(userProfile, workoutOptions);
    scores.push(spaceScore.score * 0.2);
    details.push(...spaceScore.details);
    if (spaceScore.suggestions) suggestions.push(...spaceScore.suggestions);

    // 4. Equipment Quality Utilization (10% weight)
    const qualityScore = this.analyzeEquipmentQualityUtilization(userProfile, workoutOptions);
    scores.push(qualityScore.score * 0.1);
    details.push(...qualityScore.details);
    if (qualityScore.suggestions) suggestions.push(...qualityScore.suggestions);

    const overallScore = scores.reduce((sum, score) => sum + score, 0);
    const status = this.getStatus(overallScore);
    const reasoning = this.generateReasoning(overallScore, userProfile, workoutOptions);
    const impact = this.generateImpact(overallScore, userProfile);

    return {
      score: overallScore,
      status,
      reasoning,
      impact,
      details,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Analyze how well selections match available equipment
   */
  private analyzeEquipmentAvailabilityMatch(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const availableEquipment = userProfile.basicLimitations?.availableEquipment || [];
    const workoutFocus = this.getFocusValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let availabilityScore = 0.8; // Base score

    if (availableEquipment.length === 0) {
      details.push('No equipment specified - assuming bodyweight-only workouts');
      if (this.requiresEquipment(workoutFocus)) {
        availabilityScore -= 0.3;
        details.push(`${workoutFocus} focus may require equipment not specified`);
        suggestions.push('Consider "Bodyweight" or "General Fitness" focus for equipment-free workouts');
      }
      return { score: availabilityScore, details, suggestions: suggestions.length > 0 ? suggestions : undefined };
    }

    // Check equipment requirements for different workout types
    const requiredEquipment = this.getRequiredEquipment(workoutFocus);
    const availableEquipmentLower = availableEquipment.map(eq => eq.toLowerCase());
    
    if (requiredEquipment.length === 0) {
      details.push(`${workoutFocus} focus works well with your available equipment`);
      availabilityScore += 0.1;
    } else {
      const matchedEquipment = requiredEquipment.filter(eq => 
        availableEquipmentLower.includes(eq.toLowerCase())
      );
      
      const matchPercentage = matchedEquipment.length / requiredEquipment.length;
      
      if (matchPercentage >= 0.8) {
        details.push(`Excellent equipment match for ${workoutFocus} focus`);
        availabilityScore += 0.2;
      } else if (matchPercentage >= 0.6) {
        details.push(`Good equipment match for ${workoutFocus} focus`);
        availabilityScore += 0.1;
      } else if (matchPercentage >= 0.4) {
        details.push(`Moderate equipment match for ${workoutFocus} focus`);
        availabilityScore -= 0.1;
      } else {
        details.push(`Poor equipment match for ${workoutFocus} focus`);
        availabilityScore -= 0.3;
        suggestions.push(`Consider ${this.getAlternativeFocus(availableEquipment)} for better equipment utilization`);
      }
      
      // List specific equipment considerations
      requiredEquipment.forEach(eq => {
        if (availableEquipmentLower.includes(eq.toLowerCase())) {
          details.push(`✓ ${eq} available for ${workoutFocus} focus`);
        } else {
          details.push(`✗ ${eq} may be needed for optimal ${workoutFocus} training`);
        }
      });
    }

    return { 
      score: Math.max(0, Math.min(1, availabilityScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well workout type optimizes equipment usage
   */
  private analyzeWorkoutTypeEquipmentOptimization(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const availableEquipment = userProfile.basicLimitations?.availableEquipment || [];
    const workoutFocus = this.getFocusValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let typeScore = 0.8; // Base score

    if (availableEquipment.length === 0) {
      details.push('No equipment available - bodyweight focus is optimal');
      if (this.isBodyweightOptimized(workoutFocus)) {
        typeScore += 0.1;
        details.push(`${workoutFocus} focus is perfect for equipment-free training`);
      }
      return { score: typeScore, details };
    }

    // Analyze equipment optimization for different workout types
    if (this.isStrengthFocus(workoutFocus)) {
      if (this.hasStrengthEquipment(availableEquipment)) {
        typeScore += 0.2;
        details.push(`${workoutFocus} focus optimally uses your strength equipment`);
      } else {
        typeScore -= 0.2;
        details.push(`${workoutFocus} focus may not utilize your equipment effectively`);
        suggestions.push('Consider "General Fitness" or "Bodyweight" for better equipment utilization');
      }
    } else if (this.isCardioFocus(workoutFocus)) {
      if (this.hasCardioEquipment(availableEquipment)) {
        typeScore += 0.2;
        details.push(`${workoutFocus} focus optimally uses your cardio equipment`);
      } else {
        typeScore -= 0.1;
        details.push(`${workoutFocus} focus may not utilize your equipment effectively`);
        suggestions.push('Consider "Strength" or "General Fitness" for better equipment utilization');
      }
    } else if (this.isFlexibilityFocus(workoutFocus)) {
      if (this.hasFlexibilityEquipment(availableEquipment)) {
        typeScore += 0.1;
        details.push(`${workoutFocus} focus uses your flexibility equipment well`);
      } else {
        details.push(`${workoutFocus} focus works well with minimal equipment`);
      }
    } else if (this.isGeneralFocus(workoutFocus)) {
      typeScore += 0.1;
      details.push(`${workoutFocus} focus adapts well to your available equipment`);
    }

    return { 
      score: Math.max(0, Math.min(1, typeScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well selections consider space constraints
   */
  private analyzeSpaceConstraintConsideration(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const workoutFocus = this.getFocusValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let spaceScore = 0.8; // Base score

    // Check if workout type requires significant space
    if (this.requiresLargeSpace(workoutFocus)) {
      spaceScore -= 0.2;
      details.push(`${workoutFocus} focus may require significant space`);
      suggestions.push('Consider "Compact" or "General Fitness" for space-efficient workouts');
    } else if (this.isSpaceEfficient(workoutFocus)) {
      spaceScore += 0.1;
      details.push(`${workoutFocus} focus is space-efficient`);
    }

    // Consider equipment space requirements
    const availableEquipment = userProfile.basicLimitations?.availableEquipment || [];
    if (this.hasLargeEquipment(availableEquipment)) {
      if (this.requiresLargeSpace(workoutFocus)) {
        spaceScore -= 0.1;
        details.push('Large equipment may limit workout space');
      }
    }

    return { 
      score: Math.max(0, Math.min(1, spaceScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Analyze how well selections utilize equipment quality
   */
  private analyzeEquipmentQualityUtilization(
    userProfile: UserProfile,
    workoutOptions: PerWorkoutOptions
  ): { score: number; details: string[]; suggestions?: string[] } {
    const availableEquipment = userProfile.basicLimitations?.availableEquipment || [];
    const workoutFocus = this.getFocusValue(workoutOptions);
    const details: string[] = [];
    const suggestions: string[] = [];

    let qualityScore = 0.8; // Base score

    if (availableEquipment.length === 0) {
      details.push('No equipment to optimize - bodyweight focus is appropriate');
      return { score: qualityScore, details };
    }

    // Check if workout type utilizes high-quality equipment effectively
    if (this.hasHighQualityEquipment(availableEquipment)) {
      if (this.optimizesHighQualityEquipment(workoutFocus)) {
        qualityScore += 0.2;
        details.push(`${workoutFocus} focus optimally uses your high-quality equipment`);
      } else {
        qualityScore -= 0.1;
        details.push(`${workoutFocus} focus may not utilize your high-quality equipment effectively`);
        suggestions.push('Consider "Strength" or "Advanced" focus for better equipment utilization');
      }
    } else if (this.hasBasicEquipment(availableEquipment)) {
      if (this.optimizesBasicEquipment(workoutFocus)) {
        qualityScore += 0.1;
        details.push(`${workoutFocus} focus works well with your basic equipment`);
      }
    }

    return { 
      score: Math.max(0, Math.min(1, qualityScore)), 
      details, 
      suggestions: suggestions.length > 0 ? suggestions : undefined 
    };
  }

  /**
   * Get status based on score
   */
  private getStatus(score: number): 'excellent' | 'good' | 'warning' | 'poor' {
    if (score >= 0.85) return 'excellent';
    if (score >= 0.7) return 'good';
    if (score >= 0.5) return 'warning';
    return 'poor';
  }

  /**
   * Generate reasoning for the score
   */
  private generateReasoning(
    score: number, 
    userProfile: UserProfile, 
    workoutOptions: PerWorkoutOptions
  ): string {
    const _availableEquipment = userProfile.basicLimitations?.availableEquipment || [];
    const workoutFocus = this.getFocusValue(workoutOptions);

    if (score >= 0.85) {
      return `Excellent equipment optimization! Your ${workoutFocus} selection makes optimal use of your available equipment.`;
    } else if (score >= 0.7) {
      return `Good equipment optimization. Your ${workoutFocus} selection generally works well with your equipment.`;
    } else if (score >= 0.5) {
      return `Moderate equipment optimization. Your ${workoutFocus} selection may not optimally utilize your equipment.`;
    } else {
      return `Poor equipment optimization. Your ${workoutFocus} selection may not work well with your available equipment.`;
    }
  }

  /**
   * Generate impact description
   */
  private generateImpact(score: number, _userProfile: UserProfile): string {
    if (score >= 0.85) {
      return 'Your selections will maximize the effectiveness of your available equipment.';
    } else if (score >= 0.7) {
      return 'Your selections will generally work well with your equipment.';
    } else if (score >= 0.5) {
      return 'Your selections may not optimally utilize your equipment.';
    } else {
      return 'Your selections may not work effectively with your available equipment.';
    }
  }

  // Helper methods for equipment analysis
  private requiresEquipment(focus: string): boolean {
    return this.isStrengthFocus(focus) || this.isCardioFocus(focus);
  }

  private isBodyweightOptimized(focus: string): boolean {
    return focus.includes('bodyweight') || focus.includes('general') || focus.includes('flexibility');
  }

  private isStrengthFocus(focus: string): boolean {
    return focus.includes('strength') || focus.includes('muscle') || focus.includes('power');
  }

  private isCardioFocus(focus: string): boolean {
    return focus.includes('cardio') || focus.includes('endurance') || focus.includes('sweat');
  }

  private isFlexibilityFocus(focus: string): boolean {
    return focus.includes('flexibility') || focus.includes('mobility') || focus.includes('stretch');
  }

  private isGeneralFocus(focus: string): boolean {
    return focus.includes('general') || focus.includes('fitness');
  }

  private requiresLargeSpace(focus: string): boolean {
    return focus.includes('cardio') || focus.includes('endurance') || focus.includes('circuit');
  }

  private isSpaceEfficient(focus: string): boolean {
    return focus.includes('strength') || focus.includes('bodyweight') || focus.includes('flexibility');
  }

  private getRequiredEquipment(focus: string): string[] {
    if (this.isStrengthFocus(focus)) {
      return ['dumbbells', 'barbell', 'resistance bands', 'kettlebell'];
    } else if (this.isCardioFocus(focus)) {
      return ['treadmill', 'bike', 'elliptical', 'rower'];
    } else if (this.isFlexibilityFocus(focus)) {
      return ['yoga mat', 'foam roller', 'stretching strap'];
    }
    return [];
  }

  private hasStrengthEquipment(equipment: string[]): boolean {
    const strengthEquipment = ['dumbbells', 'barbell', 'resistance bands', 'kettlebell', 'weight'];
    return equipment.some(eq => strengthEquipment.some(se => eq.toLowerCase().includes(se)));
  }

  private hasCardioEquipment(equipment: string[]): boolean {
    const cardioEquipment = ['treadmill', 'bike', 'elliptical', 'rower', 'cardio'];
    return equipment.some(eq => cardioEquipment.some(ce => eq.toLowerCase().includes(ce)));
  }

  private hasFlexibilityEquipment(equipment: string[]): boolean {
    const flexibilityEquipment = ['yoga mat', 'foam roller', 'stretching strap', 'block'];
    return equipment.some(eq => flexibilityEquipment.some(fe => eq.toLowerCase().includes(fe)));
  }

  private hasLargeEquipment(equipment: string[]): boolean {
    const largeEquipment = ['treadmill', 'bike', 'elliptical', 'rower', 'rack', 'bench'];
    return equipment.some(eq => largeEquipment.some(le => eq.toLowerCase().includes(le)));
  }

  private hasHighQualityEquipment(equipment: string[]): boolean {
    const highQualityEquipment = ['barbell', 'rack', 'bench', 'treadmill', 'elliptical'];
    return equipment.some(eq => highQualityEquipment.some(hqe => eq.toLowerCase().includes(hqe)));
  }

  private hasBasicEquipment(equipment: string[]): boolean {
    const basicEquipment = ['dumbbells', 'resistance bands', 'yoga mat'];
    return equipment.some(eq => basicEquipment.some(be => eq.toLowerCase().includes(be)));
  }

  private optimizesHighQualityEquipment(focus: string): boolean {
    return this.isStrengthFocus(focus);
  }

  private optimizesBasicEquipment(focus: string): boolean {
    return this.isGeneralFocus(focus) || this.isFlexibilityFocus(focus);
  }

  private getAlternativeFocus(availableEquipment: string[]): string {
    if (this.hasStrengthEquipment(availableEquipment)) return 'Strength Training';
    if (this.hasCardioEquipment(availableEquipment)) return 'Cardio';
    if (this.hasFlexibilityEquipment(availableEquipment)) return 'Flexibility';
    return 'General Fitness';
  }

  // Helper methods for extracting values from complex types
  private getFocusValue(workoutOptions: PerWorkoutOptions): string {
    const focus = workoutOptions.customization_focus;
    if (typeof focus === 'string') return focus;
    if (focus?.focus) return focus.focus;
    return 'general';
  }

  getAnalyzerName(): string {
    return 'equipmentOptimization';
  }

  getWeight(): number {
    return 0.15;
  }

  getDescription(): string {
    return 'Analyzes how well selections optimize the use of available equipment';
  }
} 