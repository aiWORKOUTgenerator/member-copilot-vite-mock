import { AIInsight, AIInsightType, AIInsightPriority } from '../../../types/insights';
import { GlobalAIContext } from '../core/AIService';
import { UserProfile } from '../../../types/user';
import { WorkoutFocus } from '../../../types/focus';

/**
 * AI service for equipment analysis and recommendations
 * Provides intelligent insights for equipment selection and optimization
 */
export class EquipmentAIService {
  // Equipment categories for analysis
  private readonly EQUIPMENT_CATEGORIES = {
    BODYWEIGHT: ['Body Weight'],
    CARDIO: ['Treadmill', 'Stationary Bike', 'Rowing Machine', 'Elliptical', 'Jump Rope'],
    STRENGTH: ['Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Bands', 'Weight Machine'],
    FLEXIBILITY: ['Yoga Mat', 'Foam Roller', 'Stretching Straps'],
    OUTDOOR: ['Mountain Bike or Road Bike', 'Running Shoes', 'Hiking Gear'],
    HOME_GYM: ['Pull-up Bar', 'Bench', 'Squat Rack', 'Cable Machine']
  };

  // Focus area to equipment alignment - Updated to match actual available equipment
  private readonly FOCUS_EQUIPMENT_ALIGNMENT = new Map<WorkoutFocus, string[]>([
    ['strength', ['Dumbbells', 'Barbells & Weight Plates', 'Kettlebells', 'Resistance Bands', 'Strength Machines']],
    ['endurance', ['Cardio Machines (Treadmill, Elliptical, Bike)', 'Cardio Machine (Treadmill, Bike)', 'Resistance Bands', 'Body Weight']],
    ['flexibility', ['Yoga Mat', 'Yoga Mat & Stretching Space', 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)']],
    ['power', ['Dumbbells', 'Barbells & Weight Plates', 'Kettlebells', 'Resistance Bands', 'Strength Machines']],
    ['weight_loss', ['Cardio Machines (Treadmill, Elliptical, Bike)', 'Cardio Machine (Treadmill, Bike)', 'Body Weight', 'Resistance Bands']],
    ['recovery', ['Yoga Mat', 'Yoga Mat & Stretching Space', 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)', 'Pool (If available)']]
  ]);

  // Equipment complexity levels
  private readonly EQUIPMENT_COMPLEXITY = {
    BEGINNER: ['Body Weight', 'Resistance Bands', 'Yoga Mat', 'Jump Rope'],
    INTERMEDIATE: ['Dumbbells', 'Kettlebell', 'Foam Roller', 'Pull-up Bar'],
    ADVANCED: ['Barbell', 'Weight Machine', 'Squat Rack', 'Cable Machine']
  };

  /**
   * Analyze equipment selection and generate insights
   */
  analyze(equipment: string[], context: GlobalAIContext): AIInsight[] {
    const insights: AIInsight[] = [];

    // Validate input
    if (!equipment || equipment.length === 0) {
      const insight = this.createInsight(
        'warning',
        'warning',
        'No equipment selected. Consider adding equipment for more varied workouts.',
        0.8,
        true,
        ['customization_equipment'],
        { context: 'empty_selection' }
      );
      insights.push({ ...insight, recommendation: 'Select at least one equipment option' });
      return insights;
    }

    // Analyze equipment variety
    const varietyInsight = this.analyzeEquipmentVariety(equipment, context);
    if (varietyInsight) insights.push(varietyInsight);

    // Analyze focus alignment
    const focusInsight = this.analyzeFocusAlignment(equipment, context);
    if (focusInsight) insights.push(focusInsight);

    // Analyze complexity level
    const complexityInsight = this.analyzeComplexityLevel(equipment, context);
    if (complexityInsight) insights.push(complexityInsight);

    // Space requirements analysis removed

    // Cost considerations analysis removed

    return insights;
  }

  /**
   * Analyze equipment variety and balance with comprehensive context awareness
   */
  private analyzeEquipmentVariety(equipment: string[], context: GlobalAIContext): AIInsight | null {
    const categories = this.getEquipmentCategories(equipment);
    const userProfile: UserProfile = context.userProfile;
    const sessionHistory = context.sessionHistory || [];
    const environmentalFactors = context.environmentalFactors;
    
    // Check for bodyweight-only selection
    if (categories.length === 1 && categories[0] === 'BODYWEIGHT') {
      // Enhanced analysis based on user profile and history
      const isNewToExercise = userProfile?.fitnessLevel === 'new to exercise';
      const hasEquipmentHistory = sessionHistory.some(interaction => 
        interaction.component === 'equipment' && 
        interaction.action === 'recommendation_applied'
      );
      
      let message = 'Body weight workouts are excellent for building strength and endurance. Consider adding resistance equipment for progressive overload.';
      let recommendation = 'Add resistance bands or dumbbells for variety';
      let confidence = 0.7;
      
      if (isNewToExercise) {
        message = 'Great choice for starting your fitness journey! Body weight exercises are perfect for building foundational strength.';
        recommendation = 'Start with body weight, then gradually add resistance bands';
        confidence = 0.8;
      } else if (hasEquipmentHistory) {
        message = 'You\'ve used equipment before - consider adding some resistance for continued progress.';
        recommendation = 'Reintroduce dumbbells or resistance bands for variety';
        confidence = 0.75;
      }
      
      const insight = this.createInsight(
        'education',
        'info',
        message,
        confidence,
        true,
        ['customization_equipment'],
        { 
          context: 'bodyweight_only',
          categories,
          userFitnessLevel: userProfile?.fitnessLevel,
          hasEquipmentHistory
        }
      );
      return { ...insight, recommendation };
    }

    // Check for limited variety
    if (categories.length < 2) {
      // Enhanced analysis based on user preferences and environmental factors
      const aiAssistanceLevel = userProfile?.preferences?.aiAssistanceLevel;
      const timeOfDay = environmentalFactors?.timeOfDay;
      const availableTime = environmentalFactors?.availableTime;
      
      let message = 'Limited equipment variety may restrict workout options. Consider adding equipment from different categories.';
      let recommendation = 'Add equipment from different categories';
      let confidence = 0.6;
      
      // Time-based recommendations
      if (timeOfDay === 'morning' && availableTime && availableTime < 30) {
        message = 'Morning quick workout detected - limited variety is fine for short sessions.';
        recommendation = 'Focus on efficiency with current equipment';
        confidence = 0.5; // Lower confidence since limited variety is acceptable
      } else if (aiAssistanceLevel === 'minimal') {
        message = 'You prefer minimal equipment - current selection aligns with your preferences.';
        recommendation = 'Continue with current approach if it works for you';
        confidence = 0.4; // Lower confidence since user prefers simplicity
      }
      
      const insight = this.createInsight(
        'warning',
        'warning',
        message,
        confidence,
        true,
        ['customization_equipment'],
        { 
          context: 'low_variety',
          categories,
          timeOfDay,
          availableTime,
          aiAssistanceLevel
        }
      );
      return { ...insight, recommendation };
    }

    // Check for equipment usage patterns from session history
    const equipmentUsagePattern = this.analyzeEquipmentUsagePattern(sessionHistory, equipment);
    if (equipmentUsagePattern) {
      return equipmentUsagePattern;
    }

    // Check for environmental factor considerations
    const environmentalInsight = this.analyzeEnvironmentalFactors(equipment, environmentalFactors, userProfile);
    if (environmentalInsight) {
      return environmentalInsight;
    }

    return null;
  }

  /**
   * Analyze alignment with workout focus
   */
  private analyzeFocusAlignment(equipment: string[], context: GlobalAIContext): AIInsight | null {
    const focus = context.currentSelections?.customization_focus;
    if (!focus || typeof focus !== 'string') return null;

    const focusValue = focus as WorkoutFocus;
    const recommendedEquipment = this.FOCUS_EQUIPMENT_ALIGNMENT.get(focusValue) || [];
    const alignedEquipment = equipment.filter(eq => recommendedEquipment.includes(eq));
    const alignmentPercentage = (alignedEquipment.length / equipment.length) * 100;

    if (alignmentPercentage < 50) {
      const insight = this.createInsight(
        'warning',
        'warning',
        `Your equipment selection has limited alignment with ${focus} training. Consider adding focus-specific equipment.`,
        0.8,
        true,
        ['customization_equipment', 'customization_focus'],
        {
          context: 'focus_misalignment',
          focus: focus,
          alignedEquipment: alignedEquipment,
          alignmentPercentage: alignmentPercentage
        }
      );
      return { ...insight, recommendation: `Add ${focus}-specific equipment` };
    }

    if (alignmentPercentage > 80) {
      const insight = this.createInsight(
        'encouragement',
        'success',
        `Excellent equipment selection for ${focus} training! Your equipment is well-aligned with your focus area.`,
        0.9,
        false,
        ['customization_equipment', 'customization_focus'],
        {
          context: 'focus_alignment',
          focus: focus,
          alignedEquipment: alignedEquipment,
          alignmentPercentage: alignmentPercentage
        }
      );
      return { ...insight, recommendation: 'Maintain this excellent equipment selection for continued progress' };
    }

    return null;
  }

  /**
   * Analyze equipment complexity level
   */
  private analyzeComplexityLevel(equipment: string[], context: GlobalAIContext): AIInsight | null {
    const userProfile: UserProfile = context.userProfile;
    if (!userProfile) return null;

    const experienceLevel = userProfile.fitnessLevel || 'new to exercise';
    const advancedEquipment = equipment.filter(eq => this.EQUIPMENT_COMPLEXITY.ADVANCED.includes(eq));
    const beginnerEquipment = equipment.filter(eq => this.EQUIPMENT_COMPLEXITY.BEGINNER.includes(eq));

    if (experienceLevel === 'new to exercise' && advancedEquipment.length > 0) {
      const insight = this.createInsight(
        'warning',
        'warning',
        'Advanced equipment detected for beginner level. Consider starting with simpler equipment and progressing gradually.',
        0.8,
        true,
        ['customization_equipment'],
        {
          context: 'complexity_mismatch',
          experienceLevel: experienceLevel,
          advancedEquipment: advancedEquipment
        }
      );
      return { ...insight, recommendation: 'Start with beginner-friendly equipment' };
    }

    if (experienceLevel === 'advanced athlete' && beginnerEquipment.length === equipment.length) {
      const insight = this.createInsight(
        'opportunity',
        'info',
        'Consider adding more advanced equipment to challenge your current fitness level.',
        0.7,
        true,
        ['customization_equipment'],
        {
          context: 'under_challenging',
          experienceLevel: experienceLevel
        }
      );
      return { ...insight, recommendation: 'Add advanced equipment for progression' };
    }

    return null;
  }


  /**
   * Get equipment categories for the selected equipment
   */
  private getEquipmentCategories(equipment: string[]): string[] {
    const categories: string[] = [];
    
    for (const [category, items] of Object.entries(this.EQUIPMENT_CATEGORIES)) {
      if (equipment.some(eq => items.includes(eq))) {
        categories.push(category);
      }
    }
    
    return categories;
  }

  /**
   * Generate unique insight ID
   */
  private generateInsightId(type: string): string {
    return `equipment_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * Create a standardized AI insight
   */
  private createInsight(
    type: AIInsightType,
    severity: 'info' | 'warning' | 'success' | 'error',
    message: string,
    confidence: number,
    actionable: boolean,
    relatedFields: string[],
    metadata: Record<string, any>
  ): AIInsight {
    // Map severity to priority
    const priority: AIInsightPriority = 
      severity === 'error' ? 'high' :
      severity === 'warning' ? 'medium' :
      'low';

    return {
      id: this.generateInsightId(type),
      type,
      message,
      priority,
      category: 'equipment',
      confidence,
      actionable,
      relatedFields,
      metadata
    };
  }

  /**
   * Get equipment recommendations based on context with focus-specific prioritization
   */
  getRecommendations(context: GlobalAIContext): string[] {
    const focus = context.currentSelections?.customization_focus;
    const userProfile: UserProfile = context.userProfile;

    if (!focus || typeof focus !== 'string') {
      return ['Body Weight', 'Resistance Bands'];
    }

    const focusValue = focus as WorkoutFocus;
    const focusEquipment = this.FOCUS_EQUIPMENT_ALIGNMENT.get(focusValue) || [];
    
    // Get location-specific equipment if available
    const locationEquipment = this.getLocationSpecificEquipment(context);
    
    // Combine and prioritize equipment based on focus
    let recommendations = [...new Set([...focusEquipment, ...locationEquipment])];
    
    // Prioritize focus-specific equipment
    recommendations = this.prioritizeByFocus(recommendations, focusValue);
    
    // Filter by user preferences if available
    if (userProfile?.preferences?.aiAssistanceLevel === 'minimal') {
      recommendations = recommendations.filter(eq => 
        !['Strength Machines', 'Cardio Machines (Treadmill, Elliptical, Bike)'].includes(eq)
      );
    }

    return recommendations.slice(0, 6); // Limit to top 6 recommendations
  }

  /**
   * Prioritize equipment based on focus area
   */
  private prioritizeByFocus(equipment: string[], focus: WorkoutFocus): string[] {
    const focusEquipment = this.FOCUS_EQUIPMENT_ALIGNMENT.get(focus) || [];
    
    // Sort equipment so focus-specific items come first
    return equipment.sort((a, b) => {
      const aIsFocusSpecific = focusEquipment.includes(a);
      const bIsFocusSpecific = focusEquipment.includes(b);
      
      if (aIsFocusSpecific && !bIsFocusSpecific) return -1;
      if (!aIsFocusSpecific && bIsFocusSpecific) return 1;
      
      return 0;
    });
  }
  
  /**
   * Get location-specific equipment recommendations
   */
  private getLocationSpecificEquipment(context: GlobalAIContext): string[] {
    // Default equipment for any location
    const defaultEquipment = ['Body Weight', 'Resistance Bands'];
    
    // Try to get location from user profile if available
    const userProfile: UserProfile = context.userProfile;
    if (userProfile?.basicLimitations?.availableLocations) {
      const locations = userProfile.basicLimitations.availableLocations;
      
      // If gym is available, include gym equipment
      if (locations.includes('Gym')) {
        return ['Barbells & Weight Plates', 'Strength Machines', 'Cardio Machines (Treadmill, Elliptical, Bike)', ...defaultEquipment];
      }
      
      // If home gym is available
      if (locations.includes('Home Gym')) {
        return ['Dumbbells', 'Kettlebells', 'Cardio Machine (Treadmill, Bike)', ...defaultEquipment];
      }
      
      // If outdoor spaces are available
      if (locations.includes('Parks/Outdoor Spaces')) {
        return ['Body Weight', 'Resistance Bands', 'Yoga Mat'];
      }
    }
    
    return defaultEquipment;
  }

  /**
   * Analyze equipment usage patterns from session history
   */
  private analyzeEquipmentUsagePattern(sessionHistory: any[], equipment: string[]): AIInsight | null {
    // Check for repetitive equipment usage
    const equipmentInteractions = sessionHistory.filter(interaction => 
      interaction.component === 'equipment'
    );
    
    if (equipmentInteractions.length >= 5) {
      const recentInteractions = equipmentInteractions.slice(-5);
      const sameEquipmentCount = recentInteractions.filter(interaction => 
        interaction.action === 'recommendation_applied'
      ).length;
      
      if (sameEquipmentCount >= 4) {
        const insight = this.createInsight(
          'education',
          'info',
          'You\'ve been using similar equipment consistently - great for building habits!',
          0.7,
          false,
          ['customization_equipment'],
          {
            context: 'consistent_usage'
          }
        );
        return { ...insight, recommendation: 'Continue with current approach if it\'s working well' };
      }
    }

    // Analyze current equipment selection against historical patterns
    const currentEquipmentCategories = this.getEquipmentCategories(equipment);
    const equipmentVariety = currentEquipmentCategories.length;
    
    // Check if user is trying new equipment types
    const historicalEquipmentInteractions = sessionHistory.filter(interaction => 
      interaction.component === 'equipment' && 
      interaction.action === 'recommendation_applied'
    );
    
    if (historicalEquipmentInteractions.length >= 3) {
      // Analyze if current selection represents a change in approach
      const recentEquipmentSelections = historicalEquipmentInteractions.slice(-3);
      const hasRecentVariety = recentEquipmentSelections.some(interaction => 
        interaction.metadata?.equipmentVariety > 1
      );
      
      // If user typically uses limited variety but current selection has more variety
      if (!hasRecentVariety && equipmentVariety > 1) {
        const insight = this.createInsight(
          'encouragement',
          'success',
          'Great progress! You\'re expanding your equipment variety - this will add more workout options.',
          0.8,
          false,
          ['customization_equipment'],
          {
            context: 'variety_expansion',
            currentVariety: equipmentVariety,
            equipmentCategories: currentEquipmentCategories
          }
        );
        return { ...insight, recommendation: 'Continue exploring different equipment types for balanced training' };
      }
      
      // If user typically uses variety but current selection is limited
      if (hasRecentVariety && equipmentVariety === 1) {
        const insight = this.createInsight(
          'optimization',
          'info',
          'You\'ve simplified your equipment selection - this can be great for focused training.',
          0.6,
          false,
          ['customization_equipment'],
          {
            context: 'simplified_selection',
            currentVariety: equipmentVariety,
            equipmentCategories: currentEquipmentCategories
          }
        );
        return { ...insight, recommendation: 'Consider if this focused approach aligns with your current goals' };
      }
    }

    // Check for equipment progression patterns
    const currentComplexity = this.assessEquipmentComplexity(equipment);
    const historicalComplexity = this.analyzeHistoricalComplexity(sessionHistory);
    
    if (historicalComplexity && currentComplexity > historicalComplexity) {
      const insight = this.createInsight(
        'encouragement',
        'success',
        'You\'re progressing to more advanced equipment - excellent for continued growth!',
        0.8,
        false,
        ['customization_equipment'],
        {
          context: 'complexity_progression',
          currentComplexity,
          historicalComplexity,
          equipment
        }
      );
      return { ...insight, recommendation: 'Ensure proper form and safety with new equipment' };
    }

    // Check for equipment consistency with focus areas
    const focusInteractions = sessionHistory.filter(interaction => 
      interaction.component === 'focus' && 
      interaction.action === 'recommendation_applied'
    );
    
    if (focusInteractions.length >= 2) {
      const recentFocus = focusInteractions.slice(-2);
      const focusConsistency = this.assessFocusEquipmentConsistency(equipment, recentFocus);
      
      if (focusConsistency.isConsistent) {
        const insight = this.createInsight(
          'encouragement',
          'success',
          `Your equipment selection aligns well with your recent ${focusConsistency.focusType} focus - great consistency!`,
          0.7,
          false,
          ['customization_equipment', 'customization_focus'],
          {
            context: 'focus_equipment_alignment',
            focusType: focusConsistency.focusType,
            equipment
          }
        );
        return { ...insight, recommendation: 'Maintain this alignment for optimal training results' };
      }
    }
    
    return null;
  }

  /**
   * Analyze environmental factors for equipment recommendations
   */
  private analyzeEnvironmentalFactors(equipment: string[], environmentalFactors: any, userProfile: UserProfile): AIInsight | null {
    if (!environmentalFactors) return null;
    
    const { timeOfDay, location, availableTime } = environmentalFactors;
    const fitnessLevel = userProfile?.fitnessLevel;
    const aiAssistanceLevel = userProfile?.preferences?.aiAssistanceLevel;
    
    // Time-based recommendations with user profile consideration
    if (timeOfDay === 'evening' && equipment.includes('Cardio Machines (Treadmill, Elliptical, Bike)')) {
      let message = 'Evening cardio can affect sleep - consider lower intensity options';
      let recommendation = 'Switch to strength training or gentle cardio for evening workouts';
      let confidence = 0.6;
      
      // Adjust based on user's fitness level
      if (fitnessLevel === 'new to exercise') {
        message = 'Evening cardio might be too stimulating for sleep - try gentle movement instead';
        recommendation = 'Choose yoga, stretching, or light body weight exercises for evening';
        confidence = 0.7;
      } else if (fitnessLevel === 'advanced athlete') {
        message = 'Evening cardio may affect sleep quality - consider timing adjustments';
        recommendation = 'Complete cardio 2-3 hours before bedtime or switch to strength training';
        confidence = 0.5; // Lower confidence for advanced users who may handle it better
      }
      
      const insight = this.createInsight(
        'optimization',
        'info',
        message,
        confidence,
        true,
        ['customization_equipment'],
        {
          context: 'evening_cardio',
          fitnessLevel,
          timeOfDay
        }
      );
      return { ...insight, recommendation };
    }
    
    // Location-based recommendations with user profile consideration
    if (location === 'home' && equipment.includes('Strength Machines')) {
      let message = 'Strength machines typically require gym access - consider home alternatives';
      let recommendation = 'Use dumbbells, resistance bands, or body weight alternatives';
      let confidence = 0.8;
      
      // Adjust based on user's AI assistance preference
      if (aiAssistanceLevel === 'minimal') {
        message = 'You prefer minimal equipment - strength machines may be too complex for home use';
        recommendation = 'Stick with simple equipment like dumbbells and resistance bands';
        confidence = 0.9;
      }
      
      const insight = this.createInsight(
        'optimization',
        'info',
        message,
        confidence,
        true,
        ['customization_equipment'],
        {
          context: 'home_equipment_mismatch',
          location,
          aiAssistanceLevel
        }
      );
      return { ...insight, recommendation };
    }
    
    // Time constraint recommendations with user profile consideration
    if (availableTime && availableTime < 30 && equipment.length > 3) {
      let message = 'Limited time with many equipment options - focus on efficiency';
      let recommendation = 'Select 2-3 key pieces of equipment for time efficiency';
      let confidence = 0.7;
      
      // Adjust based on user's fitness level and preferences
      if (fitnessLevel === 'new to exercise') {
        message = 'Short workout time - keep it simple with 1-2 pieces of equipment';
        recommendation = 'Choose body weight and one resistance option for quick, effective workouts';
        confidence = 0.8;
      } else if (aiAssistanceLevel === 'minimal') {
        message = 'Quick workout with minimal equipment complexity';
        recommendation = 'Focus on 2-3 simple, versatile pieces of equipment';
        confidence = 0.6;
      }
      
      const insight = this.createInsight(
        'optimization',
        'warning',
        message,
        confidence,
        true,
        ['customization_equipment'],
        {
          context: 'time_constraint',
          availableTime,
          fitnessLevel,
          aiAssistanceLevel
        }
      );
      return { ...insight, recommendation };
    }
    
    return null;
  }

  /**
   * Assess the complexity level of current equipment selection
   */
  private assessEquipmentComplexity(equipment: string[]): number {
    let complexityScore = 0;
    
    equipment.forEach(eq => {
      if (this.EQUIPMENT_COMPLEXITY.BEGINNER.includes(eq)) {
        complexityScore += 1;
      } else if (this.EQUIPMENT_COMPLEXITY.INTERMEDIATE.includes(eq)) {
        complexityScore += 2;
      } else if (this.EQUIPMENT_COMPLEXITY.ADVANCED.includes(eq)) {
        complexityScore += 3;
      }
    });
    
    return complexityScore;
  }

  /**
   * Analyze historical equipment complexity from session history
   */
  private analyzeHistoricalComplexity(sessionHistory: any[]): number | null {
    const equipmentInteractions = sessionHistory.filter(interaction => 
      interaction.component === 'equipment' && 
      interaction.action === 'recommendation_applied'
    );
    
    if (equipmentInteractions.length === 0) return null;
    
    // For now, return a simple complexity score based on interaction count
    // In a real implementation, this would analyze actual equipment data from history
    return equipmentInteractions.length >= 5 ? 2 : 1;
  }

  /**
   * Assess if current equipment selection is consistent with recent focus choices
   */
  private assessFocusEquipmentConsistency(equipment: string[], focusInteractions: any[]): { isConsistent: boolean; focusType: string } {
    // Extract focus types from recent interactions
    const focusTypes = focusInteractions.map(interaction => 
      interaction.metadata?.focus || 'strength' // Default to strength if not specified
    );
    
    // Get the most common focus type
    const focusCount = new Map<string, number>();
    focusTypes.forEach(focus => {
      focusCount.set(focus, (focusCount.get(focus) || 0) + 1);
    });
    
    const mostCommonFocus = Array.from(focusCount.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'strength';
    
    // Check if current equipment aligns with the most common focus
    const recommendedEquipment = this.FOCUS_EQUIPMENT_ALIGNMENT.get(mostCommonFocus as WorkoutFocus) || [];
    const alignedEquipment = equipment.filter(eq => recommendedEquipment.includes(eq));
    const alignmentPercentage = (alignedEquipment.length / equipment.length) * 100;
    
    return {
      isConsistent: alignmentPercentage >= 50,
      focusType: mostCommonFocus
    };
  }
} 