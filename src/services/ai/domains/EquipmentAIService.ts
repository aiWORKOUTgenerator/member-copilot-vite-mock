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
      insights.push(this.createInsight(
        'warning',
        'warning',
        'No equipment selected. Consider adding equipment for more varied workouts.',
        0.8,
        true,
        ['customization_equipment'],
        { context: 'empty_selection', recommendation: 'Select at least one equipment option' }
      ));
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
      
      return this.createInsight(
        'education',
        'info',
        message,
        confidence,
        true,
        ['customization_equipment'],
        { 
          context: 'bodyweight_only',
          recommendation,
          categories,
          userFitnessLevel: userProfile?.fitnessLevel,
          hasEquipmentHistory
        }
      );
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
      } else if (aiAssistanceLevel === 'low') {
        message = 'You prefer minimal equipment - current selection aligns with your preferences.';
        recommendation = 'Continue with current approach if it works for you';
        confidence = 0.4; // Lower confidence since user prefers simplicity
      }
      
      return this.createInsight(
        'warning',
        'warning',
        message,
        confidence,
        true,
        ['customization_equipment'],
        { 
          context: 'low_variety',
          recommendation,
          categories,
          timeOfDay,
          availableTime,
          aiAssistanceLevel
        }
      );
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
      return this.createInsight(
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
          alignmentPercentage: alignmentPercentage,
          recommendation: `Add ${focus}-specific equipment`
        }
      );
    }

    if (alignmentPercentage > 80) {
      return this.createInsight(
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
      return this.createInsight(
        'warning',
        'warning',
        'Advanced equipment detected for beginner level. Consider starting with simpler equipment and progressing gradually.',
        0.8,
        true,
        ['customization_equipment'],
        {
          context: 'complexity_mismatch',
          experienceLevel: experienceLevel,
          advancedEquipment: advancedEquipment,
          recommendation: 'Start with beginner-friendly equipment'
        }
      );
    }

    if (experienceLevel === 'advanced athlete' && beginnerEquipment.length === equipment.length) {
      return this.createInsight(
        'opportunity',
        'info',
        'Consider adding more advanced equipment to challenge your current fitness level.',
        0.7,
        true,
        ['customization_equipment'],
        {
          context: 'under_challenging',
          experienceLevel: experienceLevel,
          recommendation: 'Add advanced equipment for progression'
        }
      );
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
    if (userProfile?.preferences?.aiAssistanceLevel === 'low') {
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
        return this.createInsight(
          'education',
          'info',
          'You\'ve been using similar equipment consistently - great for building habits!',
          0.7,
          false,
          ['customization_equipment'],
          {
            context: 'consistent_usage',
            recommendation: 'Continue with current approach if it\'s working well'
          }
        );
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
    
    // Time-based recommendations
    if (timeOfDay === 'evening' && equipment.includes('Cardio Machines (Treadmill, Elliptical, Bike)')) {
      return this.createInsight(
        'optimization',
        'info',
        'Evening cardio can affect sleep - consider lower intensity options',
        0.6,
        true,
        ['customization_equipment'],
        {
          context: 'evening_cardio',
          recommendation: 'Switch to strength training or gentle cardio for evening workouts'
        }
      );
    }
    
    // Location-based recommendations
    if (location === 'home' && equipment.includes('Strength Machines')) {
      return this.createInsight(
        'optimization',
        'info',
        'Strength machines typically require gym access - consider home alternatives',
        0.8,
        true,
        ['customization_equipment'],
        {
          context: 'home_equipment_mismatch',
          recommendation: 'Use dumbbells, resistance bands, or body weight alternatives'
        }
      );
    }
    
    // Time constraint recommendations
    if (availableTime && availableTime < 30 && equipment.length > 3) {
      return this.createInsight(
        'optimization',
        'warning',
        'Limited time with many equipment options - focus on efficiency',
        0.7,
        true,
        ['customization_equipment'],
        {
          context: 'time_constraint',
          recommendation: 'Select 2-3 key pieces of equipment for time efficiency'
        }
      );
    }
    
    return null;
  }
} 