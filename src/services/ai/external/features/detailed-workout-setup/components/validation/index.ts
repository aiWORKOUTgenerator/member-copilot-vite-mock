export { physicalStateSchema, PhysicalStateData } from './physicalStateSchema';
export { VALIDATION_RULES, REQUIRED_FIELDS } from './validationRules';
export { 
  validateAndRecommend, 
  handleValidation,
  type Conflict,
  type AIRecommendation,
  type ValidationHandlersConfig,
  type ValidationHandlersResult
} from './validationHandlers'; 