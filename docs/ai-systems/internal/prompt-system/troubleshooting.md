# Internal AI Prompt System Troubleshooting

## Common Issues and Solutions

This document provides solutions for common issues encountered when using the Internal AI Prompt System.

## Error: "this.promptSelector.selectPromptTemplate is not a function"

### Problem
```
TypeError: this.promptSelector.selectPromptTemplate is not a function
```

### Root Cause
The `PromptSelector.selectPromptTemplate` is a static method, but it's being called as an instance method.

### Solution
Update the call to use the static method:

```typescript
// ❌ Wrong - calling as instance method
const template = this.promptSelector.selectPromptTemplate(context);

// ✅ Correct - calling as static method
const template = PromptSelector.selectPromptTemplate(context, recommendations, config);
```

### Files to Update
- `src/services/ai/internal/prompts/DomainPromptGenerator.ts`
- `src/services/ai/internal/strategies/InternalRecommendationStrategy.ts`

## Error: "The requested module does not provide an export named 'DurationAIService'"

### Problem
```
Uncaught SyntaxError: The requested module '/src/services/ai/domains/index.ts' does not provide an export named 'DurationAIService'
```

### Root Cause
Missing exports in the domains index file.

### Solution
Add missing exports to `src/services/ai/domains/index.ts`:

```typescript
export { DurationAIService } from './DurationAIService';
export { EnergyAIService } from './EnergyAIService';
export { SorenessAIService } from './SorenessAIService';
export { FocusAIService } from './FocusAIService';
export { EquipmentAIService } from './EquipmentAIService';
export { CrossComponentAIService } from './CrossComponentAIService';
```

## Error: "this.energyService.analyzeEnergyLevel is not a function"

### Problem
```
TypeError: this.energyService.analyzeEnergyLevel is not a function
```

### Root Cause
Domain services use `analyze()` method, not domain-specific method names.

### Solution
Update method calls to use the correct method name:

```typescript
// ❌ Wrong - using domain-specific method name
const insights = await this.energyService.analyzeEnergyLevel(energyLevel, context);

// ✅ Correct - using standard analyze method
const insights = await this.energyService.analyze(energyLevel, context);
```

### Files to Update
- `src/services/ai/internal/strategies/InternalRecommendationStrategy.ts`
- `src/services/ai/internal/prompts/DomainPromptGenerator.ts`

## Error: "Property 'fitnessLevel' is missing in type 'ProfileData'"

### Problem
```
Property 'fitnessLevel' is missing in type 'ProfileData' but required in type 'UserProfile'
```

### Root Cause
Type mismatch between `ProfileData` and `UserProfile` interfaces.

### Solution
Update the context creation to map fields correctly:

```typescript
private createGlobalContext(context: InternalPromptContext): GlobalAIContext {
  return {
    userProfile: {
      fitnessLevel: context.profile.fitnessLevel,
      goals: [context.profile.primaryGoal], // Convert primaryGoal to goals array
      preferences: {
        workoutStyle: context.profile.preferredActivities || [],
        timePreference: 'morning',
        intensityPreference: 'moderate',
        advancedFeatures: false,
        aiAssistanceLevel: 'moderate'
      },
      // ... rest of the mapping
    }
  };
}
```

## Error: "This comparison appears to be unintentional"

### Problem
```
This comparison appears to be unintentional because the types 'FitnessLevel' and '"new to exercise"' have no overlap.
```

### Root Cause
Comparing `FitnessLevel` enum values with string literals.

### Solution
Update the comparison to use correct enum values:

```typescript
// ❌ Wrong - comparing with string literal
if (fitnessLevel === 'new to exercise') { ... }

// ✅ Correct - using enum values
if (fitnessLevel === 'beginner' || fitnessLevel === 'novice') { ... }
```

## Error: "Invalid context for prompt selection"

### Problem
```
Error: Invalid context for prompt selection
```

### Root Cause
Context validation is failing due to missing required fields.

### Solution
Ensure all required fields are present in the context:

```typescript
// Required profile fields
const requiredProfileFields = [
  'fitnessLevel',
  'experienceLevel', 
  'primaryGoal',
  'preferredActivities',
  'availableEquipment'
];

// Required workout fields
const requiredWorkoutFields = [
  'focus',
  'duration',
  'energyLevel',
  'equipment'
];

// Required preferences fields
const requiredPreferencesFields = [
  'workoutStyle',
  'intensityPreference',
  'aiAssistanceLevel'
];
```

## Error: "No recommendations generated"

### Problem
```
Error: No recommendations generated
```

### Root Cause
Domain services are not returning any insights or all insights are being filtered out.

### Solution
Check domain service integration and confidence thresholds:

```typescript
// Debug domain service calls
const insights = await this.energyService.analyze(energyLevel, globalContext);
console.log('Energy insights:', insights);

// Check confidence threshold
const recommendations = insights
  .filter(insight => insight.confidence >= config.confidenceThreshold)
  .map(insight => ({
    type: 'intensity',
    content: insight.recommendation || insight.message,
    confidence: insight.confidence || 0.7,
    context: insight.metadata || {},
    source: 'profile',
    priority: this.mapConfidenceToPriority(insight.confidence)
  }));
```

## Error: "Workout generation broken after updates"

### Problem
Workout generation stops working after implementing internal AI system.

### Root Cause
Missing utility functions or type mismatches introduced during refactoring.

### Solution
Restore missing utility functions:

```typescript
// Restore error utilities
export const getErrorDetails = (error: any): WorkoutGenerationError => {
  // Implementation
};

// Restore retry utilities
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  baseDelay: number
): Promise<T> => {
  // Implementation
};

// Restore timeout utilities
export const withTimeout = <T>(
  promise: Promise<T>,
  timeout: number,
  message: string
): Promise<T> => {
  // Implementation
};

// Restore progress utilities
export const updateProgressWithDelay = async (
  progress: number,
  delay = 500
): Promise<void> => {
  // Implementation
};

export const simulateAIProgress = async (
  startProgress: number,
  endProgress: number,
  duration: number
): Promise<void> => {
  // Implementation
};
```

## Error: "Type mismatch between InternalContext and InternalPromptContext"

### Problem
Type errors when transforming between different context types.

### Root Cause
Incorrect import or type definition.

### Solution
Update imports and type definitions:

```typescript
// Update import
import { InternalPromptContext } from '../services/ai/internal/types/internal-prompt.types';

// Update function signature
export const transformToInternalContext = (
  request: WorkoutGenerationRequest
): InternalPromptContext => {
  // Implementation
};
```

## Performance Issues

### Problem: Slow workout generation

### Solutions
1. **Enable parallel processing**:
```typescript
const [energyRecs, sorenessRecs, focusRecs] = await Promise.all([
  this.generateEnergyRecommendations(context),
  this.generateSorenessRecommendations(context),
  this.generateFocusRecommendations(context)
]);
```

2. **Optimize domain service calls**:
```typescript
// Cache domain service instances
private energyService = new EnergyAIService();
private sorenessService = new SorenessAIService();
// ... other services
```

3. **Reduce validation overhead**:
```typescript
// Only validate when necessary
if (config?.enableValidation) {
  const validation = ValidationService.validateContext(context, config);
  if (!validation.isValid) {
    throw new Error('Invalid context');
  }
}
```

## Memory Issues

### Problem: Memory leaks during workout generation

### Solutions
1. **Clean up large objects**:
```typescript
// Clean up after use
setState(prev => ({ 
  ...prev, 
  generatedWorkout: workout,
  lastGenerated: new Date()
}));
```

2. **Use abort controllers**:
```typescript
if (abortControllerRef.current?.signal.aborted) {
  throw new Error('Generation was cancelled');
}
```

3. **Limit recommendation arrays**:
```typescript
const finalRecommendations = recommendations
  .slice(0, config.maxRecommendations || 10);
```

## Debugging Tips

### Enable Detailed Logging
```typescript
const result = await recommendationEngine.generateWorkout(context, {
  enableDetailedLogging: true
});
```

### Check AI Logger Output
```typescript
// Look for debug messages in console
aiLogger.debug('DomainPromptGenerator - Prompt generated', {
  templateType: template.useCase,
  recommendationCount: recommendations.length,
  promptLength: personalizedPrompt.length
});
```

### Validate Context Manually
```typescript
// Test context validation
const validation = ValidationService.validateContext(context);
console.log('Validation result:', validation);
```

### Test Domain Services Individually
```typescript
// Test individual domain service
const energyInsights = await energyService.analyze(energyLevel, globalContext);
console.log('Energy insights:', energyInsights);
```

## Prevention Strategies

### 1. Type Safety
- Use TypeScript strict mode
- Define proper interfaces for all data structures
- Validate input data before processing

### 2. Error Boundaries
- Implement comprehensive error handling
- Use fallback mechanisms for critical failures
- Log errors for debugging and monitoring

### 3. Testing
- Write unit tests for all components
- Implement integration tests for workflows
- Test error conditions and edge cases

### 4. Monitoring
- Track performance metrics
- Monitor error rates
- Log important events for debugging