# Internal AI Prompt System API Reference

## Overview

This document provides a complete API reference for the Internal AI Prompt System components and utilities.

## Core Types

### InternalPromptContext

```typescript
interface InternalPromptContext {
  profile: {
    fitnessLevel: FitnessLevel;
    experienceLevel: string;
    primaryGoal: string;
    injuries: string[];
    preferredActivities: string[];
    availableEquipment: string[];
    availableLocations: string[];
    calculatedWorkoutIntensity?: WorkoutIntensity;
  };
  workout: {
    focus: WorkoutFocus;
    duration: number;
    energyLevel: number;
    intensity?: WorkoutIntensity;
    equipment: string[];
    areas?: string[];
    soreness?: {
      rating: number;
      areas?: string[];
    };
  };
  preferences: {
    workoutStyle: string[];
    timePreference: string;
    intensityPreference: string;
    advancedFeatures: boolean;
    aiAssistanceLevel: 'low' | 'moderate' | 'high';
  };
}
```

### InternalRecommendation

```typescript
interface InternalRecommendation {
  type: 'exercise' | 'intensity' | 'duration' | 'equipment' | 'focus' | 'general';
  content: string;
  confidence: number;
  context?: string;
  source: 'profile' | 'workout' | 'combined';
  priority: 'high' | 'medium' | 'low';
}
```

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

### InternalPromptResult

```typescript
interface InternalPromptResult {
  recommendations: InternalRecommendation[];
  analysis: {
    profileScore: number;
    workoutScore: number;
    combinedScore: number;
    confidenceLevel: number;
    processingTime: number;
  };
  context: InternalPromptContext;
  variables: InternalPromptVariables;
  config: InternalPromptConfig;
}
```

## Core Classes

### RecommendationEngine

#### Constructor
```typescript
constructor()
```

#### Methods

##### generateWorkout()
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
- `context`: Internal prompt context containing profile and workout data
- `config`: Configuration options for generation

**Returns:**
- `template`: Generated workout template
- `recommendations`: Array of internal recommendations
- `prompt`: Personalized prompt used for generation

##### generateRecommendations()
```typescript
async generateRecommendations(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): Promise<InternalRecommendation[]>
```

**Parameters:**
- `context`: Internal prompt context
- `config`: Configuration options

**Returns:**
- Array of internal recommendations

##### generatePrompt()
```typescript
async generatePrompt(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): Promise<string>
```

**Parameters:**
- `context`: Internal prompt context
- `config`: Configuration options

**Returns:**
- Personalized prompt string

##### analyzeContext()
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

**Parameters:**
- `context`: Internal prompt context
- `config`: Configuration options

**Returns:**
- Comprehensive analysis with recommendations and insights

### DomainPromptGenerator

#### Constructor
```typescript
constructor()
```

#### Methods

##### generatePrompt()
```typescript
async generatePrompt(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): Promise<string>
```

**Parameters:**
- `context`: Internal prompt context
- `config`: Configuration options

**Returns:**
- Personalized prompt string

### InternalRecommendationStrategy

#### Constructor
```typescript
constructor()
```

#### Methods

##### generateRecommendations()
```typescript
async generateRecommendations(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): Promise<InternalRecommendation[]>
```

**Parameters:**
- `context`: Internal prompt context
- `config`: Configuration options

**Returns:**
- Array of internal recommendations

##### validate()
```typescript
validate(recommendations: InternalRecommendation[]): boolean
```

**Parameters:**
- `recommendations`: Array of recommendations to validate

**Returns:**
- Boolean indicating if recommendations are valid

##### prioritize()
```typescript
prioritize(recommendations: InternalRecommendation[]): InternalRecommendation[]
```

**Parameters:**
- `recommendations`: Array of recommendations to prioritize

**Returns:**
- Prioritized array of recommendations

### PromptSelector

#### Static Methods

##### selectPromptTemplate()
```typescript
static selectPromptTemplate(
  context: InternalPromptContext,
  recommendations: InternalRecommendation[],
  config?: InternalPromptConfig
): PromptTemplate
```

**Parameters:**
- `context`: Internal prompt context
- `recommendations`: Array of recommendations
- `config`: Configuration options

**Returns:**
- Selected prompt template

### InternalFallbackGenerator

#### Constructor
```typescript
constructor()
```

#### Methods

##### generateWorkout()
```typescript
async generateWorkout(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): Promise<WorkoutTemplate>
```

**Parameters:**
- `context`: Internal prompt context
- `config`: Configuration options

**Returns:**
- Generated workout template

## Utility Functions

### transformToInternalContext()

```typescript
export const transformToInternalContext = (
  request: WorkoutGenerationRequest
): InternalPromptContext
```

**Parameters:**
- `request`: Workout generation request

**Returns:**
- Transformed internal prompt context

### getErrorDetails()

```typescript
export const getErrorDetails = (error: any): WorkoutGenerationError
```

**Parameters:**
- `error`: Error object

**Returns:**
- Detailed error information

### retryWithBackoff()

```typescript
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  baseDelay: number
): Promise<T>
```

**Parameters:**
- `fn`: Function to retry
- `maxAttempts`: Maximum number of retry attempts
- `baseDelay`: Base delay between retries

**Returns:**
- Result of the function call

### withTimeout()

```typescript
export const withTimeout = <T>(
  promise: Promise<T>,
  timeout: number,
  message: string
): Promise<T>
```

**Parameters:**
- `promise`: Promise to wrap with timeout
- `timeout`: Timeout duration in milliseconds
- `message`: Error message for timeout

**Returns:**
- Promise with timeout

### updateProgressWithDelay()

```typescript
export const updateProgressWithDelay = async (
  progress: number,
  delay = 500
): Promise<void>
```

**Parameters:**
- `progress`: Progress percentage (0-100)
- `delay`: Delay before updating progress

**Returns:**
- Promise that resolves after delay

### simulateAIProgress()

```typescript
export const simulateAIProgress = async (
  startProgress: number,
  endProgress: number,
  duration: number
): Promise<void>
```

**Parameters:**
- `startProgress`: Starting progress percentage
- `endProgress`: Ending progress percentage
- `duration`: Total duration for progress simulation

**Returns:**
- Promise that resolves when simulation completes

## Validation Service

### ValidationService

#### Static Methods

##### validateContext()
```typescript
static validateContext(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): ValidationResult
```

**Parameters:**
- `context`: Internal prompt context to validate
- `config`: Configuration options

**Returns:**
- Validation result with issues and summary

##### validateRecommendations()
```typescript
static validateRecommendations(
  recommendations: InternalRecommendation[]
): ValidationResult
```

**Parameters:**
- `recommendations`: Array of recommendations to validate

**Returns:**
- Validation result with issues and summary

##### validateProfileData()
```typescript
static validateProfileData(data: ProfileData): ValidationResult
```

**Parameters:**
- `data`: Profile data to validate

**Returns:**
- Validation result with issues and summary

##### validateWorkoutData()
```typescript
static validateWorkoutData(data: PerWorkoutOptions): ValidationResult
```

**Parameters:**
- `data`: Workout data to validate

**Returns:**
- Validation result with issues and summary

## Configuration Options

### WorkoutGenerationOptions

```typescript
interface WorkoutGenerationOptions {
  timeout?: number;                    // Generation timeout in milliseconds
  retryAttempts?: number;              // Number of retry attempts
  retryDelay?: number;                 // Base delay between retries
  useExternalAI?: boolean;             // Use external AI if available
  fallbackToInternal?: boolean;        // Fallback to internal generation
  enableDetailedLogging?: boolean;     // Enable detailed logging
}
```

### Default Values

```typescript
const defaultConfig: InternalPromptConfig = {
  enableDetailedAnalysis: true,
  prioritizeUserPreferences: true,
  safetyChecks: true,
  maxRecommendations: 10,
  confidenceThreshold: 0.7,
  analysisTimeout: 30000
};

const defaultWorkoutOptions: WorkoutGenerationOptions = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  useExternalAI: true,
  fallbackToInternal: true,
  enableDetailedLogging: false
};
```

## Error Types

### InternalPromptError

```typescript
type InternalPromptError = 
  | { type: 'INVALID_CONTEXT'; message: string; details?: any }
  | { type: 'ANALYSIS_FAILED'; message: string; details?: any }
  | { type: 'TIMEOUT'; message: string; details?: any }
  | { type: 'VALIDATION_ERROR'; message: string; details?: any };
```

### WorkoutGenerationError

```typescript
interface WorkoutGenerationError {
  type: 'GENERATION_ERROR' | 'VALIDATION_ERROR' | 'TIMEOUT_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: string | null;
  timestamp: Date;
  retryable: boolean;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}
```

### ValidationIssue

```typescript
interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  context?: string;
  recommendation?: string;
}
```

## Usage Examples

### Basic Workout Generation

```typescript
import { RecommendationEngine } from '../services/ai/internal/RecommendationEngine';
import { transformToInternalContext } from '../utils/contextTransformers';

const engine = new RecommendationEngine();
const context = transformToInternalContext(request);

const result = await engine.generateWorkout(context, {
  useExternalAI: false,
  fallbackToInternal: true,
  confidenceThreshold: 0.7,
  maxRecommendations: 10
});

console.log('Generated workout:', result.template);
console.log('Recommendations:', result.recommendations);
console.log('Prompt:', result.prompt);
```

### Recommendations Only

```typescript
const recommendations = await engine.generateRecommendations(context, {
  maxRecommendations: 5,
  confidenceThreshold: 0.8
});

console.log('Recommendations:', recommendations);
```

### Context Analysis

```typescript
const analysis = await engine.analyzeContext(context, {
  enableDetailedAnalysis: true
});

console.log('Suggested intensity:', analysis.analysis.intensity.suggested);
console.log('Complexity level:', analysis.analysis.complexity.level);
console.log('Suggested duration:', analysis.analysis.duration.suggested);
console.log('Focus areas:', analysis.analysis.focus.areas);
```

### Custom Domain Prompt Generation

```typescript
import { DomainPromptGenerator } from '../services/ai/internal/prompts/DomainPromptGenerator';

const generator = new DomainPromptGenerator();
const prompt = await generator.generatePrompt(context, {
  confidenceThreshold: 0.7,
  maxRecommendations: 10
});

console.log('Generated prompt:', prompt);
```

### Error Handling

```typescript
try {
  const result = await engine.generateWorkout(context, config);
  // Handle success
} catch (error) {
  const errorDetails = getErrorDetails(error);
  console.error('Generation failed:', errorDetails);
  
  if (errorDetails.retryable) {
    // Implement retry logic
    const retryResult = await retryWithBackoff(
      () => engine.generateWorkout(context, config),
      3,
      1000
    );
  }
}
```

### Progress Tracking

```typescript
const handleProgressUpdate = (progress: number) => {
  setState(prev => ({ ...prev, generationProgress: progress }));
};

// Update progress with delay
await updateProgressWithDelay(50, 300);

// Simulate AI progress
await simulateAIProgress(30, 80, 5000);
```

## Performance Considerations

### Parallel Processing
- Domain service analysis runs in parallel using `Promise.all()`
- Progress simulation runs alongside AI generation
- Context validation happens early to fail fast

### Caching
- Domain service results can be cached
- Context transformation results are reusable
- Template selection is optimized for common patterns

### Memory Management
- Large context objects are cleaned up after use
- Recommendation arrays are limited by configuration
- Abort controllers prevent memory leaks

## Best Practices

### 1. Error Handling
- Always wrap API calls in try-catch blocks
- Use retry logic for transient failures
- Implement fallback mechanisms

### 2. Performance
- Use parallel processing where possible
- Cache frequently used data
- Monitor memory usage

### 3. Type Safety
- Use TypeScript strict mode
- Validate input data before processing
- Define proper interfaces for all data structures

### 4. Testing
- Write unit tests for all components
- Implement integration tests for workflows
- Test error conditions and edge cases