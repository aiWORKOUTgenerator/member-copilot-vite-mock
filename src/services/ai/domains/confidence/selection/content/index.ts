// Educational Content System Exports

// Insight Templates
export * from './InsightTemplates';

// Suggestion Database
export * from './SuggestionDatabase';

// Educational Content
export * from './EducationalContent';

// Re-export main functions for convenience
export {
  selectInsightTemplate
} from './InsightTemplates';

export {
  getApplicableSuggestions,
  getFactorSuggestions,
  getQuickFixSuggestions
} from './SuggestionDatabase';

export {
  getApplicableEducationalContent,
  getCategoryEducationalContent,
  getLowScoreEducationalContent,
  getBeginnerEducationalContent
} from './EducationalContent'; 