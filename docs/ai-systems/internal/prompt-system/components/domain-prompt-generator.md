# DomainPromptGenerator Component

## Overview

The `DomainPromptGenerator` is responsible for creating personalized prompts by integrating domain-specific recommendations into selected templates. It leverages all domain services to generate context-aware, personalized workout prompts.

## Class Definition

```typescript
export class DomainPromptGenerator {
  private energyService: EnergyAIService;
  private sorenessService: SorenessAIService;
  private focusService: FocusAIService;
  private durationService: DurationAIService;
  private equipmentService: EquipmentAIService;
  private crossComponentService: CrossComponentAIService;

  constructor();
  
  generatePrompt(
    context: InternalPromptContext,
    config?: InternalPromptConfig
  ): Promise<string>;
}
```

## Key Methods

### generatePrompt()

The main method for generating personalized prompts using domain services.

```typescript
async generatePrompt(
  context: InternalPromptContext,
  config?: InternalPromptConfig
): Promise<string>
```

**Parameters:**
- `context`: The internal prompt context containing profile and workout data
- `config`: Configuration options for prompt generation

**Returns:**
- `string`: Personalized prompt ready for workout generation

**Process Flow:**
1. Generates domain-specific recommendations using all domain services
2. Selects appropriate prompt template using `PromptSelector`
3. Generates personalized prompt with template variable substitution
4. Adds personalized sections with user context and recommendations
5. Returns the final personalized prompt

## Domain Service Integration

### Energy Recommendations
```typescript
private async generateEnergyRecommendations(
  context: InternalPromptContext
): Promise<InternalRecommendation[]>
```
- Analyzes energy level from workout context
- Uses `EnergyAIService.analyze()` for insights
- Maps `AIInsight[]` to `InternalRecommendation[]`

### Soreness Recommendations
```typescript
private async generateSorenessRecommendations(
  context: InternalPromptContext
): Promise<InternalRecommendation[]>
```
- Considers current soreness levels and areas
- Uses `SorenessAIService.analyze()` for recovery insights
- Only generates recommendations if soreness data is present

### Focus Recommendations
```typescript
private async generateFocusRecommendations(
  context: InternalPromptContext
): Promise<InternalRecommendation[]>
```
- Analyzes workout focus areas and goals
- Uses `FocusAIService.analyze()` for focus optimization
- Provides recommendations for target muscle groups

### Duration Recommendations
```typescript
private async generateDurationRecommendations(
  context: InternalPromptContext
): Promise<InternalRecommendation[]>
```
- Optimizes workout duration based on context
- Uses `DurationAIService.analyze()` for time management
- Considers user preferences and constraints

### Equipment Recommendations
```typescript
private async generateEquipmentRecommendations(
  context: InternalPromptContext
): Promise<InternalRecommendation[]>
```
- Analyzes available equipment and alternatives
- Uses `EquipmentAIService.analyze()` for equipment optimization
- Provides substitution recommendations

### Cross-Component Recommendations
```typescript
private async generateCrossComponentRecommendations(
  context: InternalPromptContext
): Promise<InternalRecommendation[]>
```
- Analyzes interactions between different workout components
- Uses `CrossComponentAIService.analyzeInteractions()` for holistic analysis
- Identifies potential conflicts and synergies

## Template Processing

### Template Selection
Uses `PromptSelector.selectPromptTemplate()` to choose the best template based on:
- User experience level
- Workout focus type
- Intensity level
- Recovery needs
- Equipment focus
- Complexity level

### Variable Substitution
```typescript
private async generatePersonalizedPrompt(
  template: PromptTemplate,
  context: InternalPromptContext,
  recommendations: InternalRecommendation[]
): Promise<string>
```

**Template Variables:**
- `{focus}`: Workout focus area
- `{duration}`: Workout duration in minutes
- `{energy}`: Energy level rating
- `{equipment}`: Available equipment list

### Personalized Sections
```typescript
private async addPersonalizedSections(
  prompt: string,
  context: InternalPromptContext,
  recommendations: InternalRecommendation[]
): Promise<string>
```

**Added Sections:**
- User goals and objectives
- Injuries to avoid
- High-priority recommendations
- Personalized context notes

## Context Creation

### GlobalAIContext Creation
```typescript
private createGlobalContext(context: InternalPromptContext): GlobalAIContext
```

**Maps InternalPromptContext to GlobalAIContext:**
- Profile data with fitness level and goals
- Workout preferences and limitations
- Equipment and location constraints
- Learning profile and preferences

### Confidence Mapping
```typescript
private mapConfidenceToPriority(confidence?: number): 'high' | 'medium' | 'low'
```

**Mapping Logic:**
- `confidence >= 0.8`: High priority
- `confidence >= 0.6`: Medium priority
- `confidence < 0.6`: Low priority

## Error Handling

### Domain Service Failures
- Graceful handling of individual domain service failures
- Continues processing with available services
- Logs errors for debugging and monitoring

### Template Processing Errors
- Fallback to default templates on selection failures
- Variable substitution error handling
- Validation of final prompt output

### Error Logging
```typescript
aiLogger.error({
  error: error instanceof Error ? error : new Error(String(error)),
  context: 'prompt generation',
  component: 'DomainPromptGenerator',
  severity: 'high',
  userImpact: true
});
```

## Usage Examples

### Basic Prompt Generation
```typescript
const generator = new DomainPromptGenerator();
const context = transformToInternalContext(request);

const prompt = await generator.generatePrompt(context, {
  confidenceThreshold: 0.7,
  maxRecommendations: 10
});
```

### With Custom Configuration
```typescript
const prompt = await generator.generatePrompt(context, {
  enableDetailedAnalysis: true,
  prioritizeUserPreferences: true,
  safetyChecks: true,
  maxRecommendations: 15,
  confidenceThreshold: 0.8
});
```

## Performance Considerations

### Parallel Processing
- All domain service calls run in parallel using `Promise.all()`
- Template selection and processing happen concurrently
- Variable substitution is optimized for speed

### Caching Opportunities
- Domain service results can be cached
- Template selection results are reusable
- Context creation can be optimized

### Memory Management
- Large recommendation arrays are processed efficiently
- Context objects are cleaned up after use
- Template strings are optimized for memory usage

## Integration Points

### PromptSelector Integration
- Uses static `PromptSelector.selectPromptTemplate()` method
- Passes context and recommendations for template selection
- Handles template enhancement with recommendations

### Validation Service Integration
- Relies on `ValidationService` for context validation
- Validates recommendations before processing
- Ensures data integrity throughout generation

### AI Logger Integration
- Comprehensive logging of generation process
- Error tracking and debugging information
- Performance metrics and monitoring

## Testing

### Unit Tests
- Individual domain service integration testing
- Template processing and variable substitution
- Error handling and fallback mechanisms

### Integration Tests
- End-to-end prompt generation
- Domain service coordination
- Template selection and enhancement

### Performance Tests
- Large context handling
- Multiple domain service coordination
- Memory usage optimization