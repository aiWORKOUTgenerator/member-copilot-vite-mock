import { PerWorkoutOptions } from '../../../../types';
import { GlobalAIContext } from '../../core/types/AIServiceTypes';
import { AIInsight } from '../../../../types/insights';
import { CrossComponentConflict } from './types/conflicts.types';
import { Synergy } from './types/synergies.types';
import { createAnalyzers, Analyzers } from './analyzers';

export class CrossComponentAIService {
  private readonly analyzers: Analyzers;

  constructor() {
    this.analyzers = createAnalyzers();
  }

  /**
   * Analyze all interactions between components
   */
  async analyzeInteractions(
    options: PerWorkoutOptions,
    context: GlobalAIContext
  ): Promise<{
    conflicts: CrossComponentConflict[];
    synergies: Synergy[];
    recommendations: AIInsight[];
  }> {
    const [conflicts, synergies] = await Promise.all([
      this.detectConflicts(options, context),
      this.findSynergies(options, context)
    ]);

    const recommendations = this.analyzers.optimizationAnalyzer.generateRecommendations(
      conflicts,
      synergies,
      options,
      context
    );

    return {
      conflicts,
      synergies,
      recommendations
    };
  }

  /**
   * Detect conflicts between different workout parameters
   */
  async detectConflicts(
    options: PerWorkoutOptions,
    context: GlobalAIContext
  ): Promise<CrossComponentConflict[]> {
    return this.analyzers.conflictAnalyzer.detectConflicts(options, context);
  }

  /**
   * Find synergies between different workout parameters
   */
  async findSynergies(
    options: PerWorkoutOptions,
    context: GlobalAIContext
  ): Promise<Synergy[]> {
    return this.analyzers.synergyAnalyzer.findSynergies(options, context);
  }

  /**
   * Validate configuration for conflicts and issues
   */
  async validateConfiguration(
    options: PerWorkoutOptions,
    context: GlobalAIContext
  ): Promise<{
    isValid: boolean;
    criticalIssues: CrossComponentConflict[];
    warnings: CrossComponentConflict[];
    suggestions: AIInsight[];
  }> {
    const conflicts = await this.detectConflicts(options, context);
    const optimizationInsights = this.analyzers.optimizationAnalyzer.generateOptimizationInsights(options, context);

    const criticalIssues = conflicts.filter(c => c.severity === 'critical');
    const warnings = conflicts.filter(c => c.severity === 'high' || c.severity === 'medium');

    return {
      isValid: criticalIssues.length === 0,
      criticalIssues,
      warnings,
      suggestions: optimizationInsights
    };
  }

  /**
   * Get component dependencies for analysis
   */
  getComponentDependencies(): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();

    dependencies.set('customization_energy', ['customization_focus', 'customization_duration']);
    dependencies.set('customization_focus', ['customization_equipment', 'customization_areas']);
    dependencies.set('customization_duration', ['customization_energy', 'customization_focus']);
    dependencies.set('customization_equipment', ['customization_focus', 'customization_duration']);
    dependencies.set('customization_areas', ['customization_soreness', 'customization_focus']);
    dependencies.set('customization_soreness', ['customization_areas', 'customization_focus']);
    dependencies.set('customization_injury', ['customization_focus', 'customization_duration', 'customization_areas']);
    dependencies.set('customization_trainingLoad', ['customization_focus', 'customization_duration', 'customization_energy']);

    return dependencies;
  }

  /**
   * Analyze the impact of changing a specific component
   */
  async analyzeComponentChange(
    component: keyof PerWorkoutOptions,
    newValue: unknown,
    currentOptions: PerWorkoutOptions,
    context: GlobalAIContext
  ): Promise<{
    impacts: Array<{
      affectedComponent: string;
      impactType: 'positive' | 'negative' | 'neutral';
      description: string;
      confidence: number;
    }>;
    recommendations: AIInsight[];
  }> {
    // Create new options with the changed value
    const newOptions = { ...currentOptions, [component]: newValue };

    // Get conflicts before and after the change
    const [oldConflicts, newConflicts] = await Promise.all([
      this.detectConflicts(currentOptions, context),
      this.detectConflicts(newOptions, context)
    ]);

    // Compare conflict states
    const impacts = this.compareConflictStates(oldConflicts, newConflicts);

    // Generate recommendations based on the change
    const recommendations = this.analyzers.optimizationAnalyzer.generateRecommendations(
      newConflicts,
      [], // No synergies considered for change impact
      newOptions,
      context
    );

    return {
      impacts,
      recommendations
    };
  }

  /**
   * Compare conflict states to determine impact
   */
  private compareConflictStates(
    currentConflicts: CrossComponentConflict[],
    newConflicts: CrossComponentConflict[]
  ): Array<{
    affectedComponent: string;
    impactType: 'positive' | 'negative' | 'neutral';
    description: string;
    confidence: number;
  }> {
    const impacts: Array<{
      affectedComponent: string;
      impactType: 'positive' | 'negative' | 'neutral';
      description: string;
      confidence: number;
    }> = [];

    // Find resolved conflicts (positive impact)
    const resolvedConflicts = currentConflicts.filter(
      oldConflict => !newConflicts.some(newConflict => newConflict.id === oldConflict.id)
    );

    resolvedConflicts.forEach(conflict => {
      impacts.push({
        affectedComponent: conflict.components[0],
        impactType: 'positive',
        description: `Resolved: ${conflict.description}`,
        confidence: conflict.confidence
      });
    });

    // Find new conflicts (negative impact)
    const newConflictsOnly = newConflicts.filter(
      conflict => !currentConflicts.some(oldConflict => oldConflict.id === conflict.id)
    );

    newConflictsOnly.forEach(conflict => {
      impacts.push({
        affectedComponent: conflict.components[0],
        impactType: 'negative',
        description: `New issue: ${conflict.description}`,
        confidence: conflict.confidence
      });
    });

    // If no changes, mark as neutral
    if (impacts.length === 0) {
      impacts.push({
        affectedComponent: 'general',
        impactType: 'neutral',
        description: 'No significant changes to conflict status',
        confidence: 0.5
      });
    }

    return impacts;
  }
} 