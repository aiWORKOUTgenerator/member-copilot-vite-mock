# Internal Prompt System Integration

## Overview

The Internal AI Prompt System integrates seamlessly with the refactored `useWorkoutGeneration` hook to provide a hybrid AI approach that combines internal analysis with external AI enhancement. This integration ensures reliability, performance, and quality in workout generation.

## Integration Architecture

### Hook Integration Flow

```typescript
// useWorkoutGeneration.ts integration
const generateWorkout = async (request: WorkoutGenerationRequest) => {
  // 1. Transform external request to internal context
  const internalContext = transformToInternalContext(request);
  
  // 2. Generate internal recommendations and prompt
  const internalResult = await recommendationEngine.generateWorkout(
    internalContext,
    {
      useExternalAI,
      fallbackToInternal,
      confidenceThreshold: 0.7,
      maxRecommendations: 10
    }
  );
  
  // 3. Use internal insights for external AI enhancement
  if (useExternalAI) {
    const externalWorkout = await openAIStrategy.generateWorkout({
      ...request,
      recommendations: internalResult.recommendations,  // Internal insights
      enhancedPrompt: internalResult.prompt             // Internal prompt
    });
    return externalWorkout;
  }
  
  // 4. Fallback to internal template
  return internalResult.template as GeneratedWorkout;
};
```

### Context Transformation

The system automatically transforms external requests to internal format:

```typescript
// transformToInternalContext utility
export const transformToInternalContext = (
  request: WorkoutGenerationRequest
): InternalPromptContext => {
  return {
    userProfile: {
      fitnessLevel: request.profileData.experienceLevel,
      goals: [request.profileData.primaryGoal],
      preferences: request.profileData.preferences || {}
    },
    workoutOptions: {
      duration: request.workoutFocusData.customization_duration,
      focus: request.workoutFocusData.customization_focus,
      energy: request.workoutFocusData.customization_energy,
      equipment: request.workoutFocusData.customization_equipment,
      soreness: request.workoutFocusData.customization_soreness
    },
    additionalContext: request.additionalContext || {}
  };
};
```

## Domain Service Integration

### Service Orchestration

The `RecommendationEngine` orchestrates all domain services in parallel:

```typescript
// RecommendationEngine.ts
export class RecommendationEngine {
  async generateWorkout(
    context: InternalPromptContext,
    options: RecommendationOptions
  ): Promise<RecommendationResult> {
    // Run all domain services in parallel
    const [
      energyAnalysis,
      sorenessAnalysis,
      focusAnalysis,
      durationAnalysis,
      equipmentAnalysis,
      crossComponentAnalysis
    ] = await Promise.all([
      this.energyAIService.analyze(context),
      this.sorenessAIService.analyze(context),
      this.focusAIService.analyze(context),
      this.durationAIService.analyze(context),
      this.equipmentAIService.analyze(context),
      this.crossComponentAIService.analyze(context)
    ]);

    // Combine insights into recommendations
    const recommendations = this.combineInsights([
      energyAnalysis,
      sorenessAnalysis,
      focusAnalysis,
      durationAnalysis,
      equipmentAnalysis,
      crossComponentAnalysis
    ]);

    // Generate enhanced prompt
    const prompt = this.generateEnhancedPrompt(context, recommendations);

    // Create workout template
    const template = this.createWorkoutTemplate(context, recommendations);

    return {
      recommendations,
      prompt,
      template
    };
  }
}
```

### Domain Service Analysis

Each domain service provides specialized analysis:

#### EnergyAIService
```typescript
// Analyzes energy levels and intensity preferences
const energyAnalysis = await energyAIService.analyze(context);
// Returns: { intensity: 'moderate', recommendations: [...], confidence: 0.85 }
```

#### SorenessAIService
```typescript
// Considers current soreness and recovery needs
const sorenessAnalysis = await sorenessAIService.analyze(context);
// Returns: { sorenessAreas: [...], modifications: [...], confidence: 0.9 }
```

#### FocusAIService
```typescript
// Analyzes workout focus areas and goals
const focusAnalysis = await focusAIService.analyze(context);
// Returns: { focusAreas: [...], exerciseTypes: [...], confidence: 0.88 }
```

#### DurationAIService
```typescript
// Optimizes workout duration based on context
const durationAnalysis = await durationAIService.analyze(context);
// Returns: { optimalDuration: 45, phaseBreakdown: {...}, confidence: 0.82 }
```

#### EquipmentAIService
```typescript
// Recommends equipment usage and alternatives
const equipmentAnalysis = await equipmentAIService.analyze(context);
// Returns: { recommendedEquipment: [...], alternatives: [...], confidence: 0.87 }
```

#### CrossComponentAIService
```typescript
// Analyzes interactions between components
const crossComponentAnalysis = await crossComponentAIService.analyze(context);
// Returns: { interactions: [...], conflicts: [...], confidence: 0.83 }
```

## Progress Integration

### Realistic Progress Simulation

The system provides realistic progress updates during AI operations:

```typescript
// Progress simulation during internal AI phase
const internalPhasePromise = recommendationEngine.generateWorkout(
  internalContext,
  options
);

// Simulate progress alongside AI operations
const progressPromise = simulateAIProgress(
  handleProgressUpdate,
  10,    // Start at 10%
  40,    // End at 40%
  3000   // Duration: 3 seconds
);

// Wait for both to complete
const [internalResult] = await Promise.all([
  internalPhasePromise,
  progressPromise
]);
```

### Progress Stages

| Stage | Progress Range | Duration | Description |
|-------|----------------|----------|-------------|
| Context Transformation | 0-10% | <1s | Convert external to internal format |
| Internal AI Analysis | 10-40% | 3-5s | Domain service analysis |
| External AI Enhancement | 50-90% | 5-10s | OpenAI enhancement |
| Finalization | 90-100% | <1s | State updates and metadata |

## Error Handling Integration

### Fallback Hierarchy

The integration provides multiple fallback layers:

```typescript
try {
  // 1. Try external AI with internal insights
  if (useExternalAI) {
    const externalWorkout = await openAIStrategy.generateWorkout({
      ...request,
      recommendations: internalResult.recommendations,
      enhancedPrompt: internalResult.prompt
    });
    return externalWorkout;
  }
} catch (error) {
  // 2. Fallback to internal template
  if (fallbackToInternal) {
    return internalResult.template as GeneratedWorkout;
  }
  
  // 3. Fallback to static generation
  return generateFallbackWorkout(request.userProfile, request.workoutFocusData);
}
```

### Error Recovery

Each domain service includes error recovery:

```typescript
// Domain service with error recovery
class EnergyAIService {
  async analyze(context: InternalPromptContext): Promise<EnergyAnalysis> {
    try {
      return await this.performAnalysis(context);
    } catch (error) {
      // Return default analysis on error
      return {
        intensity: 'moderate',
        recommendations: this.getDefaultRecommendations(),
        confidence: 0.5,
        error: error.message
      };
    }
  }
}
```

## Configuration Integration

### Hook Configuration Options

The internal prompt system respects hook configuration:

```typescript
interface WorkoutGenerationOptions {
  timeout?: number;                    // Affects all AI operations
  retryAttempts?: number;              // Retry failed operations
  retryDelay?: number;                 // Delay between retries
  useExternalAI?: boolean;             // Use external AI enhancement
  fallbackToInternal?: boolean;        // Fallback to internal AI
  enableDetailedLogging?: boolean;     // Enable detailed logging
}
```

### Service-Specific Configuration

Each domain service can be configured:

```typescript
// Configure domain services
const recommendationEngine = new RecommendationEngine({
  energyAIService: {
    confidenceThreshold: 0.7,
    maxRecommendations: 5
  },
  focusAIService: {
    confidenceThreshold: 0.8,
    maxRecommendations: 8
  },
  // ... other services
});
```

## Performance Integration

### Parallel Processing

All domain services run in parallel for optimal performance:

```typescript
// Parallel execution of domain services
const domainServices = [
  energyAIService.analyze(context),
  sorenessAIService.analyze(context),
  focusAIService.analyze(context),
  durationAIService.analyze(context),
  equipmentAIService.analyze(context),
  crossComponentAIService.analyze(context)
];

const results = await Promise.all(domainServices);
```

### Caching Integration

Domain service results can be cached:

```typescript
// Cache domain service results
const cacheKey = generateCacheKey(context);
let analysis = cache.get(cacheKey);

if (!analysis) {
  analysis = await recommendationEngine.generateWorkout(context, options);
  cache.set(cacheKey, analysis);
}
```

## Testing Integration

### Unit Testing

Test domain service integration:

```typescript
// Test domain service integration
describe('RecommendationEngine Integration', () => {
  it('should generate recommendations from all domain services', async () => {
    const engine = new RecommendationEngine();
    const context = createTestContext();
    
    const result = await engine.generateWorkout(context, {});
    
    expect(result.recommendations).toBeDefined();
    expect(result.prompt).toBeDefined();
    expect(result.template).toBeDefined();
  });
});
```

### Integration Testing

Test full workflow integration:

```typescript
// Test full workflow integration
describe('useWorkoutGeneration Integration', () => {
  it('should use internal AI insights for external AI', async () => {
    const { result } = renderHook(() => useWorkoutGeneration());
    
    const workout = await result.current.generateWorkout(testRequest, {
      useExternalAI: true,
      fallbackToInternal: true
    });
    
    expect(workout).toBeDefined();
    expect(workout.confidence).toBeGreaterThan(0.7);
  });
});
```

## Monitoring Integration

### Performance Metrics

Track internal AI performance:

```typescript
// Track domain service performance
const metrics = {
  domainServiceTimes: {},
  totalInternalTime: 0,
  successRate: 0,
  errorRate: 0
};

// Measure each domain service
const startTime = performance.now();
const energyAnalysis = await energyAIService.analyze(context);
metrics.domainServiceTimes.energy = performance.now() - startTime;
```

### Health Monitoring

Monitor domain service health:

```typescript
// Monitor domain service health
const healthChecks = {
  energyAIService: await energyAIService.healthCheck(),
  sorenessAIService: await sorenessAIService.healthCheck(),
  focusAIService: await focusAIService.healthCheck(),
  // ... other services
};

const overallHealth = Object.values(healthChecks).every(h => h.status === 'healthy');
```

## Future Enhancements

### Planned Improvements

1. **Machine Learning Integration**: ML models for better recommendations
2. **Real-time Updates**: Live progress updates from domain services
3. **Advanced Caching**: Intelligent caching of frequently used data
4. **Performance Optimization**: Further optimization of generation speed

### Scalability Considerations

1. **Service Discovery**: Dynamic service registration and discovery
2. **Load Balancing**: Distribution of workload across services
3. **Horizontal Scaling**: Support for multiple instances
4. **Database Integration**: Persistent storage for recommendations

## Related Documentation
- [useWorkoutGeneration Hook](../api-reference/ai-services/hook-apis.md)
- [Domain Services API](../api-reference/ai-services/domain-services-api.md)
- [Workout Generation Workflow](../workflows/workout-generation/workout-generation-workflow.md)
- [Performance Guide](../performance/workout-generation-performance.md)
- [Migration Guide](../migration-guides/useWorkoutGeneration-migration.md)