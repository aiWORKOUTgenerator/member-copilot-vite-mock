# Internal AI Prompt System Architecture

## System Overview

The Internal AI Prompt System provides a complete workout generation solution using internal AI services. It operates independently of external APIs while maintaining the ability to integrate with external AI when available.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Internal AI Prompt System                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Profile Data  │  │  Workout Data   │  │ Preferences  │ │
│  │   Integration   │  │  Integration    │  │ Integration  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│           │                     │                    │       │
│           └─────────────────────┼────────────────────┘       │
│                                 │                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              InternalPromptContext                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                 │                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              RecommendationEngine                       │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐ │ │
│  │  │Recommendation   │  │DomainPrompt     │  │Fallback  │ │ │
│  │  │Strategy         │  │Generator        │  │Generator │ │ │
│  │  └─────────────────┘  └─────────────────┘  └──────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                 │                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Domain Services Integration                │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│  │  │  Energy  │ │ Soreness │ │  Focus   │ │ Duration │   │ │
│  │  │  AI      │ │   AI     │ │   AI     │ │   AI     │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│  │  ┌──────────┐ ┌──────────┐                              │ │
│  │  │Equipment │ │  Cross   │                              │ │
│  │  │   AI     │ │Component │                              │ │
│  │  └──────────┘ └──────────┘                              │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Data Integration Layer

#### ProfilePromptBuilder
- Transforms `ProfileData` into `InternalPromptContext`
- Handles experience level mapping and fitness level calculation
- Integrates with `UserProfileTransformer` for enhanced data processing

#### WorkoutPromptBuilder
- Transforms `PerWorkoutOptions` into workout context
- Handles equipment selection and focus area determination
- Integrates with domain services for enhanced analysis

#### Context Transformation
- `transformToInternalContext()`: Converts `WorkoutGenerationRequest` to `InternalPromptContext`
- Ensures type safety and data consistency
- Provides default values for missing fields

### 2. Recommendation Engine

#### InternalRecommendationStrategy
- Generates recommendations using domain services
- Maps `AIInsight[]` to `InternalRecommendation[]`
- Handles confidence scoring and priority assignment

#### DomainPromptGenerator
- Creates personalized prompts using domain service insights
- Integrates recommendations into prompt templates
- Handles template variable substitution

#### PromptSelector
- Selects appropriate prompt templates based on context
- Uses validation service to ensure context validity
- Enhances templates with domain-specific recommendations

### 3. Fallback System

#### InternalFallbackGenerator
- Provides pure internal workout generation
- Creates workout templates without external AI
- Maintains quality through rule-based generation

## Data Flow

### 1. Context Initialization
```
WorkoutGenerationRequest → transformToInternalContext() → InternalPromptContext
```

### 2. Recommendation Generation
```
InternalPromptContext → InternalRecommendationStrategy → InternalRecommendation[]
```

### 3. Prompt Generation
```
InternalPromptContext + InternalRecommendation[] → DomainPromptGenerator → string
```

### 4. Workout Generation
```
InternalPromptContext + string → InternalFallbackGenerator → WorkoutTemplate
```

## Integration Points

### Domain Services
Each domain service provides:
- `analyze()` method for domain-specific analysis
- Returns `AIInsight[]` with recommendations and confidence scores
- Integrates with `GlobalAIContext` for comprehensive analysis

### Validation System
- `ValidationService.validateContext()`: Validates internal prompt context
- `ValidationService.validateRecommendations()`: Validates generated recommendations
- Ensures data integrity throughout the system

### Progress Tracking
- Realistic progress simulation during generation
- Parallel execution of AI analysis and progress updates
- Abort controller support for cancellation

## Configuration

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

### WorkoutGenerationOptions
```typescript
interface WorkoutGenerationOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  useExternalAI?: boolean;
  fallbackToInternal?: boolean;
  enableDetailedLogging?: boolean;
}
```

## Error Handling

### Error Types
- `INVALID_CONTEXT`: Context validation failures
- `ANALYSIS_FAILED`: Domain service analysis failures
- `TIMEOUT`: Analysis timeout exceeded
- `VALIDATION_ERROR`: Recommendation validation failures

### Recovery Strategies
- Automatic fallback to internal generation
- Retry logic with exponential backoff
- Graceful degradation when domain services fail

## Performance Considerations

### Parallel Execution
- Domain service analysis runs in parallel
- Progress simulation runs alongside AI generation
- Context validation happens early to fail fast

### Caching
- Domain service results can be cached
- Context transformation results cached
- Template selection optimized for common patterns

### Memory Management
- Large context objects cleaned up after use
- Session history trimmed to prevent memory bloat
- Abort controllers prevent memory leaks

## Security and Safety

### Input Validation
- Comprehensive validation of all input data
- Type safety enforced throughout the system
- Sanitization of user-provided content

### Error Boundaries
- Graceful handling of domain service failures
- Fallback mechanisms for critical failures
- Detailed logging for debugging and monitoring