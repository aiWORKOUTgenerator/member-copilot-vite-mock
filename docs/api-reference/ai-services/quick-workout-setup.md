# QuickWorkoutSetup Feature API Reference

## 📋 **Overview**

The QuickWorkoutSetup feature is the flagship implementation of the feature-first architecture, providing AI-powered quick workout generation with duration-specific optimization. This feature demonstrates complete workflow integration, intelligent caching, and sophisticated error handling patterns.

## 🎯 **Feature Architecture**

```
quick-workout-setup/
├── QuickWorkoutFeature.ts     # Main orchestrator and public API
├── workflow/                  # Workflow components
│   ├── DurationStrategy.ts    # Duration selection and optimization logic
│   ├── PromptSelector.ts      # Context-aware prompt selection
│   └── ResponseProcessor.ts   # AI response processing and normalization
├── prompts/                   # Feature-specific prompts
│   ├── duration-configs/      # Duration-specific prompt configurations
│   └── shared-templates.ts    # Common prompt templates
├── types/                     # Feature-specific TypeScript definitions
├── helpers/                   # Feature-specific utility functions
├── constants/                 # Feature constants and configurations
└── __tests__/                # Comprehensive feature testing
```

## 🚀 **Core API**

### **QuickWorkoutFeature Class**

```typescript
class QuickWorkoutFeature {
  constructor(dependencies: QuickWorkoutFeatureDependencies)
  
  // Primary Methods
  generateWorkout(params: QuickWorkoutParams, userProfile?: UserProfile): Promise<QuickWorkoutResult>
  optimizeDuration(baseParams: QuickWorkoutParams, constraints?: DurationConstraints): Promise<DurationOptimization>
  
  // Feature Metadata
  getCapabilities(): FeatureCapabilities
  getHealthStatus(): Promise<FeatureHealthStatus>
  getMetrics(): FeatureMetrics
}
```

### **Dependencies Interface**

```typescript
interface QuickWorkoutFeatureDependencies {
  openAIService: OpenAIService;           // Required: AI service for generation
  durationStrategy?: DurationStrategy;    // Optional: Custom duration strategy
  promptSelector?: PromptSelector;        // Optional: Custom prompt selector
  responseProcessor?: ResponseProcessor;  // Optional: Custom response processor
}
```

## 🎯 **Primary Method: generateWorkout**

### **Method Signature**

```typescript
async generateWorkout(
  params: QuickWorkoutParams, 
  userProfile?: UserProfile
): Promise<QuickWorkoutResult>
```

### **Parameters**

```typescript
interface QuickWorkoutParams {
  // Core Parameters
  duration: number;                    // Workout duration in minutes (5-45)
  fitnessLevel: 'new to exercise' | 'some experience' | 'advanced athlete';
  focus: string;                       // Workout focus (e.g., 'Quick Sweat', 'Strength')
  energyLevel: number;                 // Energy level 1-10
  
  // Optional Parameters
  equipment?: string[];                // Available equipment
  sorenessAreas?: string[];           // Areas of soreness to avoid
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  workoutLocation?: 'home' | 'gym' | 'outdoor';
  previousWorkouts?: WorkoutHistory[]; // Recent workout history
  
  // Advanced Parameters
  intensityPreference?: 'low' | 'moderate' | 'high';
  restPreference?: 'minimal' | 'standard' | 'extended';
  variationPreference?: 'simple' | 'varied' | 'complex';
}

interface UserProfile {
  id: string;
  fitnessGoals: string[];
  preferences: UserPreferences;
  limitations: HealthLimitation[];
  workoutHistory: WorkoutHistory[];
}
```

### **Return Value**

```typescript
interface QuickWorkoutResult {
  // Generated Workout
  workout: GeneratedWorkout;
  
  // Duration Analysis
  durationOptimization: DurationOptimization;
  
  // Feature Metadata
  metadata: QuickWorkoutMetadata;
  
  // Quality Metrics
  qualityScore: number;               // 0-100 quality assessment
  confidence: number;                 // 0-1 generation confidence
  
  // Processing Information
  processingTime: number;             // Generation time in milliseconds
  cacheHit: boolean;                  // Whether result was cached
  aiModelUsed: string;               // AI model version used
  
  // Recommendations
  recommendations: WorkoutRecommendation[];
  nextWorkoutSuggestions: NextWorkoutSuggestion[];
}

interface GeneratedWorkout {
  id: string;
  name: string;
  description: string;
  totalDuration: number;             // Total workout time in seconds
  phases: WorkoutPhase[];            // Warmup, main workout, cooldown
  equipment: string[];               // Equipment used
  difficulty: string;                // Calculated difficulty level
  calories: number;                  // Estimated calories burned
  notes: string[];                   // Safety notes and tips
}
```

### **Basic Usage Examples**

```typescript
import { QuickWorkoutFeature } from '@/services/ai/external/features/quick-workout-setup';
import { OpenAIService } from '@/services/ai/external/shared/core';

// Initialize the feature
const openAIService = new OpenAIService();
const quickWorkout = new QuickWorkoutFeature({ openAIService });

// Basic workout generation
const basicResult = await quickWorkout.generateWorkout({
  duration: 30,
  fitnessLevel: 'some experience',
  focus: 'Strength Building',
  energyLevel: 7
});

console.log('Generated workout:', basicResult.workout.name);
console.log('Total exercises:', basicResult.workout.phases.length);
console.log('Quality score:', basicResult.qualityScore);
```

### **Advanced Usage with Equipment and Constraints**

```typescript
// Advanced workout with equipment and soreness considerations
const advancedResult = await quickWorkout.generateWorkout({
  duration: 45,
  fitnessLevel: 'advanced athlete',
  focus: 'Full Body HIIT',
  energyLevel: 8,
  equipment: ['dumbbells', 'resistance-bands', 'yoga-mat'],
  sorenessAreas: ['lower-back', 'shoulders'],
  timeOfDay: 'morning',
  workoutLocation: 'home',
  intensityPreference: 'high',
  restPreference: 'minimal'
});

// Access detailed workout phases
advancedResult.workout.phases.forEach((phase, index) => {
  console.log(`Phase ${index + 1}: ${phase.name}`);
  console.log(`Duration: ${phase.duration}s`);
  console.log(`Exercises: ${phase.exercises.length}`);
  
  phase.exercises.forEach(exercise => {
    console.log(`  - ${exercise.name}: ${exercise.reps || exercise.duration}`);
  });
});

// Check duration optimization
const optimization = advancedResult.durationOptimization;
console.log('Duration adjustments:', optimization.adjustments);
console.log('Efficiency score:', optimization.efficiencyScore);
```

### **Integration with User Profile**

```typescript
// Generate workout with complete user profile
const userProfile: UserProfile = {
  id: 'user-123',
  fitnessGoals: ['weight-loss', 'strength-building', 'endurance'],
  preferences: {
    preferredWorkoutTypes: ['strength', 'hiit'],
    dislikedExercises: ['burpees', 'mountain-climbers'],
    preferredDuration: 30,
    preferredIntensity: 'moderate'
  },
  limitations: [
    { type: 'injury', area: 'knee', severity: 'minor' },
    { type: 'equipment', limitation: 'no-jumping' }
  ],
  workoutHistory: [
    { date: new Date(), type: 'strength', duration: 45, satisfaction: 8 },
    { date: new Date(), type: 'cardio', duration: 30, satisfaction: 6 }
  ]
};

const profileBasedResult = await quickWorkout.generateWorkout({
  duration: 30,
  fitnessLevel: 'some experience',
  focus: 'Personalized Strength',
  energyLevel: 7
}, userProfile);

// Feature automatically considers user preferences and limitations
console.log('Workout adapted for user limitations:', 
  profileBasedResult.metadata.adaptations);
```

## 🔧 **Duration Optimization**

### **optimizeDuration Method**

The feature provides intelligent duration optimization based on energy, soreness, and user context:

```typescript
async optimizeDuration(
  baseParams: QuickWorkoutParams, 
  constraints?: DurationConstraints
): Promise<DurationOptimization>

interface DurationConstraints {
  minDuration?: number;        // Minimum acceptable duration
  maxDuration?: number;        // Maximum acceptable duration
  timeConstraints?: string[];  // External time constraints
  energyThreshold?: number;    // Energy level thresholds
}

interface DurationOptimization {
  originalDuration: number;
  optimizedDuration: number;
  adjustments: DurationAdjustment[];
  reasoning: string;
  efficiencyScore: number;     // 0-100 optimization efficiency
  confidence: number;          // 0-1 optimization confidence
}
```

**Duration Optimization Examples:**

```typescript
// Basic duration optimization
const optimization = await quickWorkout.optimizeDuration({
  duration: 30,
  fitnessLevel: 'some experience',
  focus: 'Quick Sweat',
  energyLevel: 4,  // Low energy
  sorenessAreas: ['legs', 'core']
});

console.log(`Optimized from ${optimization.originalDuration} to ${optimization.optimizedDuration} minutes`);
console.log('Reasoning:', optimization.reasoning);
// Output: "Reduced duration due to low energy (4/10) and significant soreness areas"

// Constrained optimization
const constrainedOptimization = await quickWorkout.optimizeDuration({
  duration: 45,
  fitnessLevel: 'advanced athlete',
  focus: 'Strength Building',
  energyLevel: 9
}, {
  minDuration: 30,
  maxDuration: 40,
  timeConstraints: ['lunch-break']
});
```

## 📊 **Feature Capabilities and Health**

### **getCapabilities(): FeatureCapabilities**

```typescript
const capabilities = quickWorkout.getCapabilities();

console.log('Feature capabilities:', capabilities);
// Output:
// {
//   name: 'QuickWorkoutSetup',
//   version: '1.0.0',
//   supportedDurations: [5, 10, 15, 20, 30, 45],
//   supportedFitnessLevels: ['new to exercise', 'some experience', 'advanced athlete'],
//   capabilities: [
//     'duration-specific-optimization',
//     'context-aware-prompts',
//     'workout-structure-normalization',
//     'equipment-integration',
//     'fitness-level-adaptation'
//   ],
//   maxConcurrentRequests: 10,
//   averageResponseTime: 2500,
//   cacheHitRate: 85
// }
```

### **getHealthStatus(): Promise<FeatureHealthStatus>**

```typescript
const health = await quickWorkout.getHealthStatus();

console.log('Feature health:', health);
// Output:
// {
//   healthy: true,
//   lastCheck: Date,
//   responseTime: 1800,
//   details: {
//     aiServiceConnected: true,
//     cacheWorking: true,
//     promptsLoaded: true,
//     dependenciesHealthy: true
//   },
//   issues: []
// }
```

### **getMetrics(): FeatureMetrics**

```typescript
const metrics = quickWorkout.getMetrics();

console.log('Feature metrics:', metrics);
// Output:
// {
//   totalRequests: 1547,
//   successfulRequests: 1523,
//   failedRequests: 24,
//   successRate: 98.4,
//   averageResponseTime: 2341,
//   cacheHits: 1312,
//   cacheHitRate: 84.8,
//   averageQualityScore: 87.3,
//   topFocusAreas: ['Quick Sweat', 'Strength Building', 'Full Body'],
//   topDurations: [30, 20, 15]
// }
```

## 🔄 **Workflow Integration**

### **WorkflowOrchestrator Integration**

The QuickWorkoutSetup feature integrates seamlessly with the WorkflowOrchestrator:

```typescript
import { WorkflowOrchestrator } from '@/services/ai/external/shared/core/orchestration';

const orchestrator = new WorkflowOrchestrator();

// Register the feature
orchestrator.registerFeature('quick-workout-setup', quickWorkout);

// Create a workflow that uses the feature
const workflowConfig = {
  id: 'personalized-quick-workout',
  name: 'Personalized Quick Workout Generation',
  steps: [
    {
      id: 'generate-workout',
      name: 'Generate Base Workout',
      type: 'feature',
      feature: 'quick-workout-setup',
      operation: 'generateWorkout',
      params: {
        duration: 30,
        fitnessLevel: 'some experience',
        focus: 'Full Body',
        energyLevel: 7
      }
    }
  ]
};

const workflowResult = await orchestrator.executeWorkflow(workflowConfig);
console.log('Workflow workout:', workflowResult.steps[0].result.workout);
```

### **FeatureBus Integration**

```typescript
import { FeatureBus } from '@/services/ai/external/shared/core/orchestration';

const featureBus = new FeatureBus();

// Register request handler
featureBus.registerRequestHandler(
  'quick-workout-setup', 
  'generateWorkout', 
  async (params) => {
    return await quickWorkout.generateWorkout(params);
  }
);

// Subscribe to workout events
featureBus.subscribe('workout-requested', async (request) => {
  const workout = await quickWorkout.generateWorkout(request.params);
  
  await featureBus.publish('workout-generated', {
    requestId: request.id,
    workout: workout.workout,
    metadata: workout.metadata
  });
});

// Request workout from another feature
const workout = await featureBus.request('quick-workout-setup', 'generateWorkout', {
  duration: 20,
  fitnessLevel: 'new to exercise',
  focus: 'Beginner Friendly',
  energyLevel: 6
});
```

## ⚡ **Performance Optimization**

### **Intelligent Caching**

The feature implements sophisticated caching strategies:

```typescript
// Cache configuration (automatically applied)
const CACHE_STRATEGIES = {
  // High cache probability for common parameters
  highCacheProbability: {
    durations: [15, 20, 30],           // Most common durations
    fitnessLevels: ['some experience'], // Most common level
    focuses: ['Quick Sweat', 'Strength Building']
  },
  
  // Cache TTL based on parameter volatility
  cacheTTL: {
    stable: 3600000,      // 1 hour for stable parameters
    dynamic: 1800000,     // 30 min for dynamic parameters
    personalized: 900000  // 15 min for user-specific
  }
};

// Check cache performance
const metrics = quickWorkout.getMetrics();
console.log(`Cache hit rate: ${metrics.cacheHitRate}%`);
console.log(`Average response time: ${metrics.averageResponseTime}ms`);
```

### **Concurrent Request Handling**

```typescript
// Feature supports concurrent requests with intelligent queuing
const concurrentRequests = Array.from({ length: 5 }, (_, i) => 
  quickWorkout.generateWorkout({
    duration: 20 + i * 5,
    fitnessLevel: 'some experience',
    focus: 'Concurrent Test',
    energyLevel: 7
  })
);

const results = await Promise.all(concurrentRequests);
console.log('All workouts generated concurrently:', results.length);
```

## 🧪 **Testing Integration**

### **Unit Testing**

```typescript
import { QuickWorkoutFeature } from '@/services/ai/external/features/quick-workout-setup';
import { MockOpenAIService } from '@/services/ai/external/__tests__/mocks';

describe('QuickWorkoutSetup Feature', () => {
  let feature: QuickWorkoutFeature;
  let mockOpenAI: MockOpenAIService;
  
  beforeEach(() => {
    mockOpenAI = new MockOpenAIService();
    feature = new QuickWorkoutFeature({ openAIService: mockOpenAI });
  });
  
  test('should generate workout with basic parameters', async () => {
    const result = await feature.generateWorkout({
      duration: 30,
      fitnessLevel: 'some experience',
      focus: 'Strength',
      energyLevel: 7
    });
    
    expect(result.workout).toBeDefined();
    expect(result.workout.totalDuration).toBeGreaterThan(0);
    expect(result.qualityScore).toBeGreaterThan(70);
  });
  
  test('should optimize duration based on energy level', async () => {
    const optimization = await feature.optimizeDuration({
      duration: 45,
      fitnessLevel: 'some experience',
      focus: 'HIIT',
      energyLevel: 3  // Low energy
    });
    
    expect(optimization.optimizedDuration).toBeLessThan(45);
    expect(optimization.reasoning).toContain('low energy');
  });
});
```

### **Integration Testing**

```typescript
describe('QuickWorkoutSetup Integration', () => {
  test('should integrate with WorkflowOrchestrator', async () => {
    const orchestrator = new WorkflowOrchestrator();
    orchestrator.registerFeature('quick-workout', feature);
    
    const workflow = {
      id: 'test-workflow',
      steps: [{
        id: 'generate',
        type: 'feature',
        feature: 'quick-workout',
        operation: 'generateWorkout',
        params: { duration: 20, fitnessLevel: 'new to exercise', focus: 'Beginner', energyLevel: 5 }
      }]
    };
    
    const result = await orchestrator.executeWorkflow(workflow);
    expect(result.success).toBe(true);
    expect(result.steps[0].result.workout).toBeDefined();
  });
});
```

## 🎯 **Error Handling**

### **Feature-Level Error Handling**

```typescript
try {
  const result = await quickWorkout.generateWorkout({
    duration: 30,
    fitnessLevel: 'some experience',
    focus: 'Strength',
    energyLevel: 7
  });
} catch (error) {
  if (error instanceof QuickWorkoutError) {
    switch (error.type) {
      case 'AI_SERVICE_UNAVAILABLE':
        // Handle AI service issues
        console.log('AI service unavailable, using fallback');
        break;
      case 'INVALID_PARAMETERS':
        // Handle parameter validation issues
        console.log('Invalid parameters:', error.details);
        break;
      case 'GENERATION_TIMEOUT':
        // Handle timeout issues
        console.log('Generation timed out, retrying...');
        break;
    }
  }
}
```

### **Graceful Degradation**

```typescript
// Feature automatically handles degraded scenarios
const result = await quickWorkout.generateWorkout({
  duration: 30,
  fitnessLevel: 'some experience',
  focus: 'Strength',
  energyLevel: 7
});

// Check if result used fallback mechanisms
if (result.metadata.fallbackUsed) {
  console.log('Used fallback generation:', result.metadata.fallbackType);
  console.log('Fallback reason:', result.metadata.fallbackReason);
}
```

## 🔗 **Extension Points**

### **Custom Duration Strategy**

```typescript
import { DurationStrategy } from '@/services/ai/external/features/quick-workout-setup/workflow';

class CustomDurationStrategy extends DurationStrategy {
  selectStrategy(duration: number, context: WorkflowContext): DurationConfig {
    // Custom logic for duration selection
    if (context.userProfile?.preferences.preferredIntensity === 'low') {
      return this.getLowIntensityConfig(duration);
    }
    
    return super.selectStrategy(duration, context);
  }
}

// Use custom strategy
const customFeature = new QuickWorkoutFeature({
  openAIService,
  durationStrategy: new CustomDurationStrategy()
});
```

### **Custom Response Processing**

```typescript
import { ResponseProcessor } from '@/services/ai/external/features/quick-workout-setup/workflow';

class CustomResponseProcessor extends ResponseProcessor {
  protected async processResponse(
    response: string, 
    context: WorkflowContext
  ): Promise<GeneratedWorkout> {
    const workout = await super.processResponse(response, context);
    
    // Add custom post-processing
    workout.customField = this.addCustomEnhancements(workout);
    
    return workout;
  }
}
```

## 📞 **Support and Examples**

- **[Feature Development Guide](../../tutorials/feature-development.md)** - Creating new features
- **[Workflow Integration](../../integration/advanced/workflow-patterns.md)** - Advanced workflow patterns
- **[Performance Optimization](../../production/performance/feature-optimization.md)** - Feature-specific optimization
- **[Testing Strategies](../../testing/examples/feature-testing.md)** - Comprehensive testing approaches

---

**The QuickWorkoutSetup feature demonstrates the full power of the feature-first architecture with production-ready patterns and comprehensive integration capabilities.** 