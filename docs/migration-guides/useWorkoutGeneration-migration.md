# useWorkoutGeneration Migration Guide

## Overview

This guide helps you migrate from the previous version of `useWorkoutGeneration` to the new hybrid AI system. The refactored hook introduces significant improvements in reliability, performance, and user experience.

## Breaking Changes

### 1. Interface Changes

#### Before (Un-refactored Version)
```typescript
interface UseWorkoutGenerationReturn {
  isGenerating: boolean;
  generatedWorkout: GeneratedWorkout | null;
  error: string | null;
  generationProgress: number;
  lastGenerated: Date | null;
  retryCount: number;
  lastError: WorkoutGenerationError | null;
  generateWorkout: (request: WorkoutGenerationRequest) => Promise<GeneratedWorkout | null>;
  regenerateWorkout: () => Promise<GeneratedWorkout | null>;
  clearWorkout: () => void;
  retryGeneration: () => Promise<GeneratedWorkout | null>;
  canRegenerate: boolean;
  hasError: boolean;
}
```

#### After (Refactored Version)
```typescript
interface UseWorkoutGenerationReturn {
  state: WorkoutGenerationState;  // New state object
  status: WorkoutGenerationStatus; // New status enum
  generateWorkout: (request: WorkoutGenerationRequest, options?: WorkoutGenerationOptions) => Promise<GeneratedWorkout | null>;
  regenerateWorkout: (options?: WorkoutGenerationOptions) => Promise<GeneratedWorkout | null>;
  clearWorkout: () => void;
  retryGeneration: () => Promise<GeneratedWorkout | null>;
  canRegenerate: boolean;
  hasError: boolean;
  isGenerating: boolean;
}
```

### 2. New Configuration Options

#### Before
```typescript
// No configuration options
const workout = await generateWorkout(request);
```

#### After
```typescript
// New WorkoutGenerationOptions parameter
const workout = await generateWorkout(request, {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  useExternalAI: true,
  fallbackToInternal: true,
  enableDetailedLogging: false
});
```

### 3. State Management Changes

#### Before
```typescript
const { isGenerating, generatedWorkout, error } = useWorkoutGeneration();
```

#### After
```typescript
const { state, status, generateWorkout } = useWorkoutGeneration();
const { isGenerating, generatedWorkout, error } = state;
```

## Migration Steps

### Step 1: Update Import and Hook Usage

#### Before
```typescript
import { useWorkoutGeneration } from '../hooks/useWorkoutGeneration';

const MyComponent = () => {
  const { 
    isGenerating, 
    generatedWorkout, 
    error, 
    generateWorkout 
  } = useWorkoutGeneration();
  
  // Component logic
};
```

#### After
```typescript
import { useWorkoutGeneration } from '../hooks/useWorkoutGeneration';

const MyComponent = () => {
  const { 
    state, 
    status, 
    generateWorkout 
  } = useWorkoutGeneration();
  
  // Destructure from state object
  const { isGenerating, generatedWorkout, error } = state;
  
  // Component logic
};
```

### Step 2: Update Progress Tracking

#### Before
```typescript
{isGenerating && (
  <div>
    <div>Generating workout...</div>
    <ProgressBar value={generationProgress} />
  </div>
)}
```

#### After
```typescript
{state.isGenerating && (
  <div>
    <div>Status: {status}</div>
    <div>Progress: {state.generationProgress}%</div>
    <ProgressBar value={state.generationProgress} />
  </div>
)}
```

### Step 3: Update Error Handling

#### Before
```typescript
{error && (
  <div className="error">
    {error}
    <button onClick={retryGeneration}>Retry</button>
  </div>
)}
```

#### After
```typescript
{state.error && (
  <div className="error">
    {state.error}
    {state.lastError?.retryable && (
      <button onClick={retryGeneration}>Retry</button>
    )}
    {state.lastError?.fallbackAvailable && (
      <div>Fallback workout available</div>
    )}
  </div>
)}
```

### Step 4: Add Configuration Options (Optional)

#### Before
```typescript
const handleGenerate = async () => {
  const workout = await generateWorkout(request);
  // Handle result
};
```

#### After
```typescript
const handleGenerate = async () => {
  const workout = await generateWorkout(request, {
    timeout: 30000,
    retryAttempts: 3,
    useExternalAI: true,
    fallbackToInternal: true
  });
  // Handle result
};
```

## New Features to Leverage

### 1. Enhanced Progress Tracking

#### Before
```typescript
// Basic progress tracking
{isGenerating && <div>Generating...</div>}
```

#### After
```typescript
// Detailed progress with status
{state.isGenerating && (
  <div>
    <div>Status: {status}</div>
    <div>Progress: {state.generationProgress}%</div>
    <ProgressBar value={state.generationProgress} />
    {state.generationProgress < 30 && <div>Preparing your workout...</div>}
    {state.generationProgress >= 30 && state.generationProgress < 50 && <div>Analyzing your preferences...</div>}
    {state.generationProgress >= 50 && state.generationProgress < 70 && <div>Selecting optimal exercises...</div>}
    {state.generationProgress >= 70 && state.generationProgress < 85 && <div>Personalizing recommendations...</div>}
    {state.generationProgress >= 85 && state.generationProgress < 95 && <div>Adding finishing touches...</div>}
    {state.generationProgress >= 95 && <div>Almost ready!</div>}
  </div>
)}
```

### 2. Advanced Error Handling

#### Before
```typescript
// Basic error display
{error && <div className="error">{error}</div>}
```

#### After
```typescript
// Enhanced error handling with recovery options
{state.error && (
  <div className="error">
    <div>{state.error}</div>
    {state.lastError?.retryable && (
      <button onClick={retryGeneration}>
        Retry ({state.lastError.retryAfter}s)
      </button>
    )}
    {state.lastError?.fallbackAvailable && (
      <div>Fallback workout will be generated automatically</div>
    )}
    {state.lastError?.recoverySuggestion && (
      <div className="suggestion">
        {state.lastError.recoverySuggestion}
      </div>
    )}
  </div>
)}
```

### 3. Configuration-Based Generation

#### Before
```typescript
// Single generation path
const workout = await generateWorkout(request);
```

#### After
```typescript
// Configurable generation with fallbacks
const workout = await generateWorkout(request, {
  // Performance options
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  
  // AI strategy options
  useExternalAI: true,      // Use external AI for best results
  fallbackToInternal: true, // Fallback to internal AI if external fails
  
  // Debugging options
  enableDetailedLogging: process.env.NODE_ENV === 'development'
});
```

## Common Migration Patterns

### Pattern 1: Simple Component Migration

#### Before
```typescript
const WorkoutGenerator = () => {
  const { isGenerating, generatedWorkout, error, generateWorkout } = useWorkoutGeneration();
  
  const handleGenerate = async () => {
    const workout = await generateWorkout(request);
    if (workout) {
      setWorkout(workout);
    }
  };
  
  return (
    <div>
      {isGenerating && <div>Generating...</div>}
      {error && <div>Error: {error}</div>}
      <button onClick={handleGenerate} disabled={isGenerating}>
        Generate Workout
      </button>
    </div>
  );
};
```

#### After
```typescript
const WorkoutGenerator = () => {
  const { state, status, generateWorkout } = useWorkoutGeneration();
  const { isGenerating, generatedWorkout, error } = state;
  
  const handleGenerate = async () => {
    const workout = await generateWorkout(request, {
      useExternalAI: true,
      fallbackToInternal: true
    });
    if (workout) {
      setWorkout(workout);
    }
  };
  
  return (
    <div>
      {isGenerating && (
        <div>
          <div>Status: {status}</div>
          <div>Progress: {state.generationProgress}%</div>
        </div>
      )}
      {error && <div>Error: {error}</div>}
      <button onClick={handleGenerate} disabled={isGenerating}>
        Generate Workout
      </button>
    </div>
  );
};
```

### Pattern 2: Advanced Component with Retry Logic

#### Before
```typescript
const AdvancedWorkoutGenerator = () => {
  const { 
    isGenerating, 
    error, 
    generateWorkout, 
    retryGeneration 
  } = useWorkoutGeneration();
  
  return (
    <div>
      {isGenerating && <div>Generating workout...</div>}
      {error && (
        <div>
          <div>Error: {error}</div>
          <button onClick={retryGeneration}>Retry</button>
        </div>
      )}
    </div>
  );
};
```

#### After
```typescript
const AdvancedWorkoutGenerator = () => {
  const { 
    state, 
    status, 
    generateWorkout, 
    retryGeneration 
  } = useWorkoutGeneration();
  const { isGenerating, error, lastError } = state;
  
  return (
    <div>
      {isGenerating && (
        <div>
          <div>Status: {status}</div>
          <div>Progress: {state.generationProgress}%</div>
          <ProgressBar value={state.generationProgress} />
        </div>
      )}
      {error && (
        <div>
          <div>Error: {error}</div>
          {lastError?.retryable && (
            <button onClick={retryGeneration}>
              Retry ({lastError.retryAfter}s)
            </button>
          )}
          {lastError?.fallbackAvailable && (
            <div>Fallback workout will be generated automatically</div>
          )}
        </div>
      )}
    </div>
  );
};
```

## Testing Migration

### Update Test Files

#### Before
```typescript
// Test file
const { result } = renderHook(() => useWorkoutGeneration());

expect(result.current.isGenerating).toBe(false);
expect(result.current.generatedWorkout).toBeNull();
```

#### After
```typescript
// Test file
const { result } = renderHook(() => useWorkoutGeneration());

expect(result.current.state.isGenerating).toBe(false);
expect(result.current.state.generatedWorkout).toBeNull();
expect(result.current.status).toBe('idle');
```

### Test Configuration Options

```typescript
// Test with configuration options
const workout = await result.current.generateWorkout(request, {
  useExternalAI: false,
  fallbackToInternal: true,
  enableDetailedLogging: true
});
```

## Troubleshooting Migration Issues

### Issue 1: TypeScript Errors
**Problem**: TypeScript errors after migration
**Solution**: Update type imports and ensure all state properties are accessed from the `state` object

### Issue 2: Missing Progress Updates
**Problem**: Progress bar not updating
**Solution**: Use `state.generationProgress` instead of the old `generationProgress` property

### Issue 3: Error Handling Not Working
**Problem**: Error handling broken after migration
**Solution**: Update error handling to use `state.error` and `state.lastError`

### Issue 4: Retry Logic Not Working
**Problem**: Retry buttons not functioning
**Solution**: Check that `lastError?.retryable` is true before showing retry button

## Benefits of Migration

### 1. Improved Reliability
- **Multiple Fallback Layers**: External AI → Internal AI → Static Fallback
- **Enhanced Error Recovery**: Automatic retry with exponential backoff
- **Graceful Degradation**: System continues working even if external AI fails

### 2. Better User Experience
- **Realistic Progress**: Simulated progress updates during AI operations
- **Detailed Status**: Clear status messages and progress indicators
- **Error Transparency**: Specific error messages with recovery suggestions

### 3. Enhanced Performance
- **Parallel Processing**: Internal analysis runs alongside progress simulation
- **Optimized Workflows**: Early validation and fail-fast mechanisms
- **Caching Opportunities**: Internal recommendations can be cached

### 4. Developer Experience
- **Type Safety**: Comprehensive TypeScript interfaces
- **Configuration Options**: Fine-grained control over generation behavior
- **Debugging Support**: Detailed logging and error tracking

## Related Documentation
- [Hook APIs](../api-reference/ai-services/hook-apis.md)
- [Internal AI Prompt System](../ai-systems/internal/prompt-system/)
- [Workout Generation Workflow](../workflows/workout-generation/workout-generation-workflow.md)
- [Performance Guide](../performance/workout-generation-performance.md)