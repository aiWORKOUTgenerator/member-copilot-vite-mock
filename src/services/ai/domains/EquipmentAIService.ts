import { AIInsight, GlobalAIContext } from '../../../types/ai';
import { EquipmentOption } from '../../../types/equipment';
import { UserProfile } from '../../../types/user';
import { FocusArea } from '../../../types/areas';
import { WorkoutFocus } from '../../../types/focus';
import { equipmentOptions } from '../../../config/equipmentOptions';

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

  // Focus area to equipment alignment
  private readonly FOCUS_EQUIPMENT_ALIGNMENT = new Map<WorkoutFocus, string[]>([
    ['strength', ['Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Bands', 'Weight Machine']],
    ['cardio', ['Treadmill', 'Stationary Bike', 'Rowing Machine', 'Elliptical', 'Jump Rope', 'Mountain Bike or Road Bike']],
    ['flexibility', ['Yoga Mat', 'Foam Roller', 'Stretching Straps']],
    ['balance', ['Yoga Mat', 'Balance Board', 'Resistance Bands']],
    ['endurance', ['Treadmill', 'Stationary Bike', 'Rowing Machine', 'Elliptical', 'Jump Rope']]
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

    // Analyze space requirements
    const spaceInsight = this.analyzeSpaceRequirements(equipment, context);
    if (spaceInsight) insights.push(spaceInsight);

    // Analyze cost considerations
    const costInsight = this.analyzeCostConsiderations(equipment, context);
    if (costInsight) insights.push(costInsight);

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
    if (!focus) return null;

    const recommendedEquipment = this.FOCUS_EQUIPMENT_ALIGNMENT.get(focus) || [];
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

    const experienceLevel = userProfile.experience?.level || 'beginner';
    const advancedEquipment = equipment.filter(eq => this.EQUIPMENT_COMPLEXITY.ADVANCED.includes(eq));
    const beginnerEquipment = equipment.filter(eq => this.EQUIPMENT_COMPLEXITY.BEGINNER.includes(eq));

    if (experienceLevel === 'beginner' && advancedEquipment.length > 0) {
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

    if (experienceLevel === 'advanced' && beginnerEquipment.length === equipment.length) {
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
   * Analyze space requirements
   */
  private analyzeSpaceRequirements(equipment: string[], context: GlobalAIContext): AIInsight | null {
    const location = context.currentSelections?.customization_equipment_location;
    if (!location) return null;

    const spaceIntensiveEquipment = ['Treadmill', 'Stationary Bike', 'Rowing Machine', 'Elliptical', 'Squat Rack', 'Cable Machine'];
    const spaceIntensiveCount = equipment.filter(eq => spaceIntensiveEquipment.includes(eq)).length;

    if (location === 'home' && spaceIntensiveCount > 1) {
      return this.createInsight(
        'space_concern',
        'warning',
        'Multiple space-intensive equipment items selected for home use. Consider space constraints and equipment placement.',
        0.8,
        true,
        ['customization_equipment', 'customization_equipment_location'],
        {
          context: 'space_concern',
          location: location,
          spaceIntensiveCount: spaceIntensiveCount,
          recommendation: 'Consider space-efficient alternatives'
        }
      );
    }

    return null;
  }

  /**
   * Analyze cost considerations
   */
  private analyzeCostConsiderations(equipment: string[], context: GlobalAIContext): AIInsight | null {
    const userProfile = context.userProfile;
    if (!userProfile) return null;

    const budget = userProfile.preferences?.budget;
    if (!budget) return null;

    const expensiveEquipment = ['Treadmill', 'Stationary Bike', 'Rowing Machine', 'Elliptical', 'Weight Machine', 'Cable Machine'];
    const expensiveCount = equipment.filter(eq => expensiveEquipment.includes(eq)).length;

    if (budget === 'low' && expensiveCount > 0) {
      return this.createInsight(
        'budget_concern',
        'warning',
        'Expensive equipment selected for low budget. Consider cost-effective alternatives or gradual equipment acquisition.',
        0.7,
        true,
        ['customization_equipment'],
        {
          context: 'budget_concern',
          budget: budget,
          expensiveCount: expensiveCount,
          recommendation: 'Consider budget-friendly alternatives'
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
   * Get equipment recommendations based on context
   */
  getRecommendations(context: GlobalAIContext): string[] {
    const focus = context.currentSelections?.customization_focus;
    const location = context.currentSelections?.customization_equipment_location;
    const userProfile = context.userProfile;

    if (!focus || !location) {
      return ['Body Weight', 'Resistance Bands'];
    }

    const focusEquipment = this.FOCUS_EQUIPMENT_ALIGNMENT.get(focus) || [];
    const locationEquipment = this.getLocationSpecificEquipment(location);
    
    // Combine and prioritize equipment
    const recommendations = [...new Set([...focusEquipment, ...locationEquipment])];
    
    // Filter by user preferences if available
    if (userProfile?.preferences?.budget === 'low') {
      return recommendations.filter(eq => !['Treadmill', 'Stationary Bike', 'Weight Machine'].includes(eq));
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Get location-specific equipment recommendations
   */
  private getLocationSpecificEquipment(location: string): string[] {
    const locationEquipment: Record<string, string[]> = {
      'home': ['Body Weight', 'Resistance Bands', 'Dumbbells', 'Yoga Mat'],
      'gym': ['Weight Machine', 'Cable Machine', 'Treadmill', 'Stationary Bike'],
      'outdoor': ['Body Weight', 'Resistance Bands', 'Mountain Bike or Road Bike'],
      'office': ['Body Weight', 'Resistance Bands', 'Yoga Mat'],
      'hotel': ['Body Weight', 'Resistance Bands']
    };

    return locationEquipment[location] || ['Body Weight', 'Resistance Bands'];
  }
} 