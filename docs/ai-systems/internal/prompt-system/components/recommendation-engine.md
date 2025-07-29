# RecommendationEngine Component

## Overview

The `RecommendationEngine` is the central orchestrator for the Internal AI Prompt System. It coordinates the generation of recommendations, prompts, and workout templates using internal AI services.

## Class Definition

```typescript
export class RecommendationEngine {
  private recommendationStrategy: InternalRecommendationStrategy;
  private promptGenerator: DomainPromptGenerator;
  private fallbackGenerator: InternalFallbackGenerator;

  constructor();
  
  generateWorkout(
    context: InternalPromptContext,
    config?: InternalPromptConfig & {
      useExternalAI?: boolean;
      fallbackToInternal?: boolean;
    }
  ): Promise<{
    template: WorkoutTemplate;
    recommendations: InternalRecommendation[];
    prompt: string;
  }>;
}
```

## Key Methods

### generateWorkout()

The main method for generating complete workouts using internal AI services.

```typescript
async generateWorkout(
  context: InternalPromptContext,
  config?: InternalPromptConfig & {
    useExternalAI?: boolean;
    fallbackToInternal?: boolean;
  }
): Promise<{
  template: WorkoutTemplate;
  recommendations: InternalRecommendation[];
  prompt: string;
}>
```

**Parameters:**
- `context`: The internal prompt context containing profile and workout data
- `config`: Configuration options including external AI usage and fallback settings

**Returns:**
- `template`: Generated workout template
- `recommendations`: Array of internal recommendations
- `prompt`: Personalized prompt used for generation

**Process Flow:**
1. Validates the input context
2. Generates recommendations using `InternalRecommendationStrategy`
3. Validates the generated recommendations
4. Generates personalized prompt using `DomainPromptGenerator`
5. Creates workout template using `InternalFallbackGenerator`
6. Returns complete workout package

### generateRecommendations()

Generates recommendations only, without creating a workout template.

```typescript
async generateRecommendations(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): Promise<InternalRecommendation[]>
```

### generatePrompt()

Generates a personalized prompt only, without recommendations or template.

```typescript
async generatePrompt(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): Promise<string>
```

### analyzeContext()

Performs comprehensive context analysis and provides detailed insights.

```typescript
async analyzeContext(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): Promise<{
  recommendations: InternalRecommendation[];
  analysis: {
    intensity: { suggested: string; confidence: number };
    complexity: { level: string; confidence: number };
    duration: { suggested: number; confidence: number };
    focus: { areas: string[]; confidence: number };
  };
}>
```

## Integration with Domain Services

The RecommendationEngine integrates with all domain services through the `InternalRecommendationStrategy`:

- **EnergyAIService**: Analyzes energy levels and intensity preferences
- **SorenessAIService**: Considers current soreness and recovery needs
- **FocusAIService**: Analyzes workout focus areas and goals
- **DurationAIService**: Optimizes workout duration based on context
- **EquipmentAIService**: Recommends equipment usage and alternatives
- **CrossComponentAIService**: Analyzes interactions between different components

## Error Handling

### Validation Errors
- Context validation failures are caught and logged
- Invalid recommendations trigger fallback mechanisms
- Configuration errors are handled gracefully

### Fallback Mechanisms
- Automatic fallback to internal generation when external AI fails
- Retry logic for transient failures
- Graceful degradation when domain services are unavailable

### Error Logging
```typescript
aiLogger.error({
  error: error instanceof Error ? error : new Error(String(error)),
  context: 'workout generation',
  component: 'RecommendationEngine',
  severity: 'high',
  userImpact: true
});
```

## Configuration Options

### InternalPromptConfig
```typescript
interface InternalPromptConfig {
  enableDetailedAnalysis?: boolean;
  prioritizeUserPreferences?: boolean;
  safetyChecks?: boolean;
  maxRecommendations?: number;
  confidenceThreshold?: number;
  analysisTimeout?: number;
}
```

### External AI Integration
```typescript
{
  useExternalAI?: boolean;        // Whether to use external AI
  fallbackToInternal?: boolean;   // Fallback to internal generation
}
```

## Usage Examples

### Basic Workout Generation
```typescript
const engine = new RecommendationEngine();
const context = transformToInternalContext(request);

const result = await engine.generateWorkout(context, {
  useExternalAI: false,
  fallbackToInternal: true,
  confidenceThreshold: 0.7,
  maxRecommendations: 10
});
```

### Recommendations Only
```typescript
const recommendations = await engine.generateRecommendations(context, {
  maxRecommendations: 5,
  confidenceThreshold: 0.8
});
```

### Context Analysis
```typescript
const analysis = await engine.analyzeContext(context, {
  enableDetailedAnalysis: true
});

console.log('Suggested intensity:', analysis.analysis.intensity.suggested);
console.log('Complexity level:', analysis.analysis.complexity.level);
```

## Performance Considerations

### Parallel Processing
- Domain service analysis runs in parallel
- Recommendation generation is optimized for speed
- Context validation happens early to fail fast

### Caching
- Recommendation results can be cached
- Context analysis results are reusable
- Template generation is optimized

### Memory Management
- Large context objects are cleaned up after use
- Recommendation arrays are limited by configuration
- Error objects are properly handled to prevent leaks

## Testing

### Unit Tests
- Individual method testing
- Error condition testing
- Configuration validation testing

### Integration Tests
- End-to-end workout generation
- Domain service integration
- Fallback mechanism testing

### Performance Tests
- Large context handling
- Concurrent request processing
- Memory usage monitoring