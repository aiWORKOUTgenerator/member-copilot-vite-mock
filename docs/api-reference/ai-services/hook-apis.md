# Hook APIs

## useWorkoutGeneration Hook

### Overview
The `useWorkoutGeneration` hook has been refactored to support a **hybrid AI approach** combining internal and external AI services. This provides robust workout generation with multiple fallback layers and enhanced error recovery.

### Key Features
- **Dual AI Strategy**: Internal AI analysis + External AI enhancement
- **Context Transformation**: Automatic conversion between external and internal formats
- **Enhanced Fallback**: Multiple layers of error recovery
- **Progress Simulation**: Realistic progress tracking during AI operations
- **Retry Logic**: Exponential backoff with configurable attempts
- **Abort Support**: Cancellation support for long-running operations

### Interface

```typescript
export interface UseWorkoutGenerationReturn {
  // State
  state: WorkoutGenerationState;
  status: WorkoutGenerationStatus;
  
  // Actions
  generateWorkout: (request: WorkoutGenerationRequest, options?: WorkoutGenerationOptions) => Promise<GeneratedWorkout | null>;
  regenerateWorkout: (options?: WorkoutGenerationOptions) => Promise<GeneratedWorkout | null>;
  clearWorkout: () => void;
  retryGeneration: () => Promise<GeneratedWorkout | null>;
  
  // Utilities
  canRegenerate: boolean;
  hasError: boolean;
  isGenerating: boolean;
}
```

### State Types

#### WorkoutGenerationState
```typescript
interface WorkoutGenerationState {
  status: WorkoutGenerationStatus;           // 'idle' | 'generating' | 'complete' | 'error'
  generationProgress: number;                // 0-100 progress tracking
  error: string | null;                      // Error messages
  retryCount: number;                        // Retry attempt tracking
  lastError: WorkoutGenerationError | null;  // Detailed error information
  generatedWorkout: GeneratedWorkout | null; // Final workout result
  lastGenerated: Date | null;                // Timestamp of last generation
}
```

#### WorkoutGenerationStatus
```typescript
type WorkoutGenerationStatus = 'idle' | 'generating' | 'complete' | 'error';
```

### Configuration Options

#### WorkoutGenerationOptions
```typescript
interface WorkoutGenerationOptions {
  timeout?: number;                    // Generation timeout (default: 30000ms)
  retryAttempts?: number;              // Retry attempts (default: 3)
  retryDelay?: number;                 // Base delay between retries (default: 1000ms)
  useExternalAI?: boolean;             // Use external AI if available (default: true)
  fallbackToInternal?: boolean;        // Fallback to internal generation (default: true)
  enableDetailedLogging?: boolean;     // Enable detailed logging (default: false)
}
```

### Usage Examples

#### Basic Usage
```typescript
import { useWorkoutGeneration } from '../hooks/useWorkoutGeneration';

const MyComponent = () => {
  const { 
    state, 
    status, 
    generateWorkout, 
    regenerateWorkout, 
    isGenerating, 
    hasError 
  } = useWorkoutGeneration();

  const handleGenerate = async () => {
    const workout = await generateWorkout(request);
    if (workout) {
      console.log('Workout generated:', workout.title);
    }
  };

  return (
    <div>
      {isGenerating && <div>Progress: {state.generationProgress}%</div>}
      {hasError && <div>Error: {state.error}</div>}
      <button onClick={handleGenerate} disabled={isGenerating}>
        Generate Workout
      </button>
    </div>
  );
};
```

#### With Custom Configuration
```typescript
const handleGenerateWithOptions = async () => {
  const workout = await generateWorkout(request, {
    timeout: 60000,              // 60 second timeout
    retryAttempts: 5,            // 5 retry attempts
    retryDelay: 2000,            // 2 second base delay
    useExternalAI: true,         // Use external AI
    fallbackToInternal: true,    // Fallback to internal AI
    enableDetailedLogging: true  // Enable detailed logging
  });
};
```

#### Regeneration
```typescript
const handleRegenerate = async () => {
  const workout = await regenerateWorkout({
    useExternalAI: false,  // Force internal AI only
    enableDetailedLogging: true
  });
};
```

### Workflow Process

#### Phase 1: Internal AI Analysis (10-40%)
1. **Context Transformation**: Convert request to internal format
2. **Recommendation Generation**: Use domain services (Energy, Soreness, Focus, etc.)
3. **Prompt Generation**: Create personalized prompts using internal insights
4. **Template Creation**: Generate base workout template

#### Phase 2: External AI Enhancement (50-90%)
1. **Enhanced Generation**: Use OpenAI with internal recommendations
2. **Progress Simulation**: Realistic progress updates during external AI call
3. **Fallback Handling**: Graceful degradation if external AI fails

#### Phase 3: Finalization (90-100%)
1. **State Updates**: Update React state with final workout
2. **Metadata Enhancement**: Add timestamps, confidence scores, tags
3. **Error Recovery**: Attempt fallback generation if needed

### Error Handling

#### Error Types
```typescript
interface WorkoutGenerationError {
  code: 'GENERATION_FAILED' | 'TIMEOUT_ERROR' | 'NETWORK_ERROR' | 'RATE_LIMITED' | 'SERVICE_UNAVAILABLE';
  message: string;
  details?: any;
  retryable: boolean;
  retryAfter?: number;
  fallbackAvailable?: boolean;
}
```

#### Error Recovery
```typescript
const handleError = async () => {
  if (state.lastError?.retryable) {
    // Automatic retry with exponential backoff
    const workout = await retryGeneration();
  } else if (state.lastError?.fallbackAvailable) {
    // Fallback workout will be generated automatically
    console.log('Fallback workout generated');
  }
};
```

### Performance Characteristics

#### Timing Estimates
- **Internal AI Phase**: 3-5 seconds (10-40% progress)
- **External AI Phase**: 5-10 seconds (50-90% progress)
- **Fallback Generation**: <1 second (immediate to 100%)

#### Progress Simulation
```typescript
// Realistic progress updates
await simulateAIProgress(handleProgressUpdate, 10, 40, 3000);  // Internal phase
await simulateAIProgress(handleProgressUpdate, 50, 90, 5000);  // External phase
```

### Integration with Internal AI System

#### Domain Services
The hook leverages the Internal AI Prompt System:
- **EnergyAIService**: Analyzes energy levels and provides insights
- **SorenessAIService**: Handles soreness areas and recommendations  
- **FocusAIService**: Manages focus areas and exercise suggestions
- **DurationAIService**: Optimizes workout duration
- **EquipmentAIService**: Analyzes equipment preferences
- **CrossComponentAIService**: Manages relationships between components

#### Context Transformation
```typescript
// Automatic transformation from external to internal format
const internalContext = transformToInternalContext(request);
```

### Best Practices

#### 1. Error Handling
```typescript
try {
  const workout = await generateWorkout(request);
  // Handle success
} catch (error) {
  // Error is automatically handled by the hook
  console.error('Generation failed:', error);
}
```

#### 2. Progress Tracking
```typescript
{state.isGenerating && (
  <div>
    <ProgressBar value={state.generationProgress} />
    <div>Status: {status}</div>
  </div>
)}
```

#### 3. Configuration
```typescript
// Use appropriate timeouts for your use case
const options = {
  timeout: 30000,        // 30 seconds for normal usage
  retryAttempts: 3,      // 3 attempts for transient failures
  useExternalAI: true,   // Enable external AI for best results
  fallbackToInternal: true // Always have a fallback
};
```

#### 4. Abort Support
```typescript
// The hook automatically handles abort controllers
// Users can cancel long-running operations
const { clearWorkout } = useWorkoutGeneration();

const handleCancel = () => {
  clearWorkout(); // This will abort any ongoing generation
};
```

### Migration from Previous Version

#### Breaking Changes
1. **State Structure**: `state` object now contains all state properties
2. **Status Enum**: New `status` enum for detailed state management
3. **Configuration**: New `WorkoutGenerationOptions` parameter
4. **Progress Tracking**: New `generationProgress` property

#### Migration Steps
```typescript
// Before
const { isGenerating, generatedWorkout, error } = useWorkoutGeneration();

// After
const { state, status, generateWorkout } = useWorkoutGeneration();
const { isGenerating, generatedWorkout, error } = state;
```

### Related Documentation
- [Internal AI Prompt System](../ai-systems/internal/prompt-system/)
- [Domain Services API](./domain-services-api.md)
- [Workout Generation Workflow](../workflows/workout-generation/workout-generation-workflow.md)
- [Migration Guide](../migration-guides/useWorkoutGeneration-migration.md)