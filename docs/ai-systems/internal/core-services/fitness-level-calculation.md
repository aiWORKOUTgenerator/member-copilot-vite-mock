# Fitness Level Calculation Algorithm

## Overview and Purpose

The Fitness Level Calculation Algorithm is a sophisticated two-variable system that determines a user's fitness level by combining their self-reported experience level with their current physical activity patterns. This algorithm provides more accurate fitness assessments than single-variable approaches by considering both theoretical knowledge and practical application.

**Purpose**: To accurately categorize users into appropriate fitness levels for workout generation, ensuring that AI-generated workouts match the user's actual capabilities and experience.

## Input Parameters

### Experience Level
- **Type**: `string`
- **Valid Values**: 
  - `"New to Exercise"`
  - `"Some Experience"`
  - `"Advanced Athlete"`
- **Source**: User self-assessment during profile creation
- **Business Context**: Represents theoretical knowledge and familiarity with exercise concepts

### Physical Activity Level
- **Type**: `string`
- **Valid Values**:
  - `"sedentary"` - Little to no physical activity
  - `"light"` - Occasional light activity
  - `"moderate"` - Regular moderate activity
  - `"very"` - High activity levels
  - `"extremely"` - Very high activity levels
  - `"varies"` - Inconsistent activity patterns
- **Source**: User self-assessment during profile creation
- **Business Context**: Represents current practical application of fitness knowledge

## Output Mapping Table

| Experience Level | Physical Activity | Fitness Level | Rationale |
|------------------|-------------------|---------------|-----------|
| New to Exercise | sedentary | **beginner** | No experience + low activity = true beginner |
| New to Exercise | light | **beginner** | No experience + minimal activity = beginner |
| New to Exercise | moderate | **novice** | No experience + regular activity = developing novice |
| New to Exercise | very | **novice** | No experience + high activity = active novice |
| New to Exercise | extremely | **novice** | No experience + very high activity = very active novice |
| Some Experience | sedentary | **novice** | Some knowledge + low activity = rusty novice |
| Some Experience | light | **novice** | Some knowledge + minimal activity = novice |
| Some Experience | moderate | **intermediate** | Some knowledge + regular activity = developing intermediate |
| Some Experience | very | **intermediate** | Some knowledge + high activity = active intermediate |
| Some Experience | extremely | **advanced** | Some knowledge + very high activity = advanced |
| Advanced Athlete | any | **advanced** | High knowledge + any activity = advanced |
| any | varies | **adaptive** | Inconsistent patterns require adaptive approach |

## Edge Cases and Fallbacks

### Special Cases
1. **"varies" Physical Activity**: Automatically returns `"adaptive"` regardless of experience level
   - **Rationale**: Inconsistent patterns require adaptive workout generation
   - **Implementation**: Early return before main logic

2. **Missing Parameters**: Returns `"intermediate"` as default fallback
   - **Rationale**: Middle ground provides safe workout generation
   - **Implementation**: Final fallback after all other checks

### Input Validation
- **Null/Undefined Values**: Treated as missing parameters
- **Invalid Experience Levels**: Falls back to `"intermediate"`
- **Invalid Activity Levels**: Falls back to `"intermediate"`
- **Case Sensitivity**: Algorithm expects exact string matches

## Examples of Calculations

### Example 1: True Beginner
```typescript
calculateFitnessLevel("New to Exercise", "sedentary")
// Returns: "beginner"
// Rationale: No theoretical knowledge + no practical activity
```

### Example 2: Active Novice
```typescript
calculateFitnessLevel("New to Exercise", "moderate")
// Returns: "novice"
// Rationale: No theoretical knowledge + regular practical activity
```

### Example 3: Knowledgeable but Inactive
```typescript
calculateFitnessLevel("Some Experience", "sedentary")
// Returns: "novice"
// Rationale: Some theoretical knowledge + no practical activity
```

### Example 4: Developing Intermediate
```typescript
calculateFitnessLevel("Some Experience", "moderate")
// Returns: "intermediate"
// Rationale: Some theoretical knowledge + regular practical activity
```

### Example 5: Advanced from Activity
```typescript
calculateFitnessLevel("Some Experience", "extremely")
// Returns: "advanced"
// Rationale: Some theoretical knowledge + very high practical activity
```

### Example 6: Adaptive Pattern
```typescript
calculateFitnessLevel("Advanced Athlete", "varies")
// Returns: "adaptive"
// Rationale: Inconsistent activity patterns override experience level
```

## Integration Points in the Codebase

### Primary Implementation
- **File**: `src/utils/fitnessLevelCalculator.ts`
- **Function**: `calculateFitnessLevel(experienceLevel: string, physicalActivity: string): FitnessLevel`
- **Export**: Named export for direct import

### Usage in Profile Creation
- **File**: `src/components/Profile/steps/ExperienceStep.tsx`
- **Purpose**: Calculates and stores `calculatedFitnessLevel` in profile data
- **Integration**: Called during profile form submission

### Usage in Workout Generation
- **File**: `src/hooks/useWorkoutGeneration.ts`
- **Purpose**: Creates accurate UserProfile for AI service
- **Integration**: Called during workout generation request processing

### Type Definitions
- **File**: `src/types/user.ts`
- **Type**: `FitnessLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'adaptive'`
- **Usage**: Type safety across the application

### Related Calculations
- **File**: `src/utils/fitnessLevelCalculator.ts`
- **Function**: `calculateWorkoutIntensity(fitnessLevel: FitnessLevel, intensityLevel: string)`
- **Purpose**: Determines workout intensity based on calculated fitness level

## Business Logic Rationale

### Why Two-Variable System?
1. **Accuracy**: Single-variable systems (experience only) miss practical application
2. **Real-World Alignment**: Knowledge without practice ≠ fitness capability
3. **Safety**: Prevents overestimation of user capabilities
4. **Personalization**: Enables more targeted workout generation

### Fitness Level Progression Logic
1. **Beginner**: No knowledge + no activity = requires basic instruction
2. **Novice**: Some knowledge OR some activity = developing capabilities
3. **Intermediate**: Knowledge + regular activity = established capabilities
4. **Advanced**: High knowledge OR very high activity = sophisticated capabilities
5. **Adaptive**: Inconsistent patterns = requires flexible approach

### Safety Considerations
- **Conservative Approach**: Algorithm tends toward lower fitness levels when uncertain
- **Fallback Strategy**: Defaults to "intermediate" for edge cases
- **Validation**: Input validation prevents invalid calculations
- **Documentation**: Clear mapping table enables predictable behavior

### Performance Implications
- **Fast Calculation**: Simple string comparisons and conditional logic
- **Caching Strategy**: Results cached in profile data to avoid recalculation
- **Memory Efficient**: No complex data structures or external dependencies
- **Deterministic**: Same inputs always produce same outputs

## Maintenance and Updates

### When to Modify
- New experience levels added to the system
- New physical activity levels identified
- Business requirements change for fitness level definitions
- Safety concerns arise with current mappings

### Testing Strategy
- Unit tests for all input combinations
- Edge case testing for invalid inputs
- Integration tests with workout generation
- Performance testing for high-frequency usage

### Documentation Updates
- Update this document when algorithm changes
- Maintain mapping table accuracy
- Document new edge cases or business rules
- Update integration points list as needed