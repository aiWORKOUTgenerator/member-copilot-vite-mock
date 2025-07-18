import { AIInsight } from '../../../types/insights';
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
        'no_equipment',
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
   * Analyze equipment variety and balance
   */
  private analyzeEquipmentVariety(equipment: string[], context: GlobalAIContext): AIInsight | null {
    const categories = this.getEquipmentCategories(equipment);
    
    if (categories.length === 1 && categories[0] === 'BODYWEIGHT') {
      return this.createInsight(
        'limited_variety',
        'info',
        'Body weight workouts are excellent for building strength and endurance. Consider adding resistance equipment for progressive overload.',
        0.7,
        true,
        ['customization_equipment'],
        { 
          context: 'bodyweight_only',
          recommendation: 'Add resistance bands or dumbbells for variety',
          categories: categories
        }
      );
    }

    if (categories.length < 2) {
      return this.createInsight(
        'low_variety',
        'warning',
        'Limited equipment variety may restrict workout options. Consider adding equipment from different categories.',
        0.6,
        true,
        ['customization_equipment'],
        { 
          context: 'low_variety',
          recommendation: 'Add equipment from different categories',
          categories: categories
        }
      );
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
        'focus_misalignment',
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
        'focus_alignment',
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
    const userProfile = context.userProfile;
    if (!userProfile) return null;

    const experienceLevel = userProfile.fitnessLevel || 'new to exercise';
    const advancedEquipment = equipment.filter(eq => this.EQUIPMENT_COMPLEXITY.ADVANCED.includes(eq));
    const beginnerEquipment = equipment.filter(eq => this.EQUIPMENT_COMPLEXITY.BEGINNER.includes(eq));

    if (experienceLevel === 'new to exercise' && advancedEquipment.length > 0) {
      return this.createInsight(
        'complexity_mismatch',
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
        'under_challenging',
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
    type: string,
    severity: 'info' | 'warning' | 'success' | 'error',
    message: string,
    confidence: number,
    actionable: boolean,
    relatedFields: string[],
    metadata: Record<string, any>
  ): AIInsight {
    return {
      type,
      severity,
      message,
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
    const userProfile = context.userProfile;

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
    const userProfile = context.userProfile;
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
} 