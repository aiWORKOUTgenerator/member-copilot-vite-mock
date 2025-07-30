// Selection Analysis - Main exports
export { SelectionAnalyzer } from './SelectionAnalyzer';
export { SelectionAnalysisFactory } from './SelectionAnalysisFactory';

// Individual analyzers
export { GoalAlignmentAnalyzer } from './analyzers/GoalAlignmentAnalyzer';
export { IntensityMatchAnalyzer } from './analyzers/IntensityMatchAnalyzer';
export { DurationFitAnalyzer } from './analyzers/DurationFitAnalyzer';
export { RecoveryRespectAnalyzer } from './analyzers/RecoveryRespectAnalyzer';
export { EquipmentOptimizationAnalyzer } from './analyzers/EquipmentOptimizationAnalyzer';

// Types
export type {
  SelectionAnalysis,
  SelectionAnalysisContext,
  SelectionAnalysisConfig,
  SelectionAnalysisError,
  SelectionAnalysisValidationResult,
  FactorAnalysis,
  AnalysisInsight,
  ImprovementSuggestion,
  EducationalContent,
  SelectionAnalyzer as ISelectionAnalyzer
} from './types/selection-analysis.types';

export { DEFAULT_SELECTION_ANALYSIS_CONFIG } from './types/selection-analysis.types'; 