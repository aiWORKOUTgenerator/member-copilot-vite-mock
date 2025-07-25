import { ConflictAnalyzer } from './ConflictAnalyzer';
import { SynergyAnalyzer } from './SynergyAnalyzer';
import { OptimizationAnalyzer } from './OptimizationAnalyzer';
import { allConflictRules } from '../rules/conflicts';
import { allSynergyRules } from '../rules/synergies';

/**
 * Factory function to create all analyzers with their respective rules
 */
export function createAnalyzers() {
  return {
    conflictAnalyzer: new ConflictAnalyzer(allConflictRules),
    synergyAnalyzer: new SynergyAnalyzer(allSynergyRules),
    optimizationAnalyzer: new OptimizationAnalyzer()
  };
}

export type Analyzers = ReturnType<typeof createAnalyzers>;

export {
  ConflictAnalyzer,
  SynergyAnalyzer,
  OptimizationAnalyzer
}; 