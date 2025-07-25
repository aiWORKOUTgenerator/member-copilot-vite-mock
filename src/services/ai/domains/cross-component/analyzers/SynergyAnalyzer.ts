import { PerWorkoutOptions } from '../../../../../types';
import { GlobalAIContext } from '../../../core/types/AIServiceTypes';
import { SynergyDetectionRule, Synergy } from '../types/synergies.types';

export class SynergyAnalyzer {
  constructor(private readonly rules: SynergyDetectionRule[]) {}

  async findSynergies(options: PerWorkoutOptions, context: GlobalAIContext): Promise<Synergy[]> {
    const synergies: Synergy[] = [];
    
    for (const rule of this.rules) {
      if (rule.condition(options, context)) {
        synergies.push(rule.generateSynergy(options, context));
      }
    }
    
    return this.sortSynergies(synergies);
  }

  /**
   * Sort synergies by confidence level to prioritize more certain combinations
   */
  private sortSynergies(synergies: Synergy[]): Synergy[] {
    return synergies.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Check if a specific component combination has any potential synergies
   */
  hasPotentialSynergy(
    component1: keyof PerWorkoutOptions,
    component2: keyof PerWorkoutOptions
  ): boolean {
    return this.rules.some(rule => {
      const components = new Set(rule.generateSynergy({} as PerWorkoutOptions, {} as GlobalAIContext).components);
      return components.has(component1) && components.has(component2);
    });
  }

  /**
   * Get all components that could potentially synergize with a given component
   */
  getPotentialSynergyComponents(component: keyof PerWorkoutOptions): Set<keyof PerWorkoutOptions> {
    const synergyComponents = new Set<keyof PerWorkoutOptions>();
    
    this.rules.forEach(rule => {
      const components = rule.generateSynergy({} as PerWorkoutOptions, {} as GlobalAIContext).components;
      if (components.includes(component as string)) {
        components.forEach(c => synergyComponents.add(c as keyof PerWorkoutOptions));
      }
    });
    
    synergyComponents.delete(component); // Remove the input component itself
    return synergyComponents;
  }

  /**
   * Get all synergy rules that involve a specific component
   */
  getRulesForComponent(component: keyof PerWorkoutOptions): SynergyDetectionRule[] {
    return this.rules.filter(rule => {
      const components = rule.generateSynergy({} as PerWorkoutOptions, {} as GlobalAIContext).components;
      return components.includes(component as string);
    });
  }

  /**
   * Calculate the synergy strength between two components based on confidence levels
   */
  calculateSynergyStrength(
    component1: keyof PerWorkoutOptions,
    component2: keyof PerWorkoutOptions,
    options: PerWorkoutOptions,
    context: GlobalAIContext
  ): number {
    let totalConfidence = 0;
    let matchingRules = 0;

    this.rules.forEach(rule => {
      if (rule.condition(options, context)) {
        const synergy = rule.generateSynergy(options, context);
        const components = new Set(synergy.components);
        if (components.has(component1) && components.has(component2)) {
          totalConfidence += synergy.confidence;
          matchingRules++;
        }
      }
    });

    return matchingRules > 0 ? totalConfidence / matchingRules : 0;
  }
} 