# DataTransformer System

## Overview

The DataTransformer system provides a unified approach to transforming data between different formats for different use cases:

- **PromptVariableComposer**: Transforms ProfileData to flat PromptVariables for AI generation
- **UserProfileTransformer**: Transforms ProfileData to structured UserProfile objects for app logic

## Architecture

```
ProfileData → [DataTransformer] → Different Output Formats
                ├── PromptVariableComposer → PromptVariables (for AI)
                └── UserProfileTransformer → UserProfile (for app logic)
```

## Key Features

### ✅ **Integrated Infrastructure**
- **Shared Validation**: Uses existing `ProfileDataValidator` for consistent validation
- **Shared Constants**: Leverages `DefaultValues` and `ValidationRules` for configuration
- **Shared Utilities**: Uses `ArrayTransformUtils` for data processing
- **Shared Types**: Maintains type consistency across all transformers

### ✅ **Configuration-Driven**
- **Centralized Defaults**: All default values in `DefaultValues.ts`
- **Centralized Rules**: All validation rules in `ValidationRules.ts`
- **Centralized Mappings**: All derived value calculations in `DERIVED_VALUE_MAPS`

### ✅ **Type Safety**
- **Local Types**: UserProfile types defined within DataTransformer system
- **Consistent Interfaces**: All transformers follow the same patterns
- **Full TypeScript Support**: Complete type safety throughout

## Usage Examples

### For AI Generation (PromptVariables)

```typescript
import { PromptVariableComposer } from './DataTransformer';

const composer = new PromptVariableComposer();
const promptVariables = composer.transformToPromptVariables(profileData, workoutData);
// Returns flat key-value pairs optimized for AI prompts
```

### For App Logic (UserProfile)

```typescript
import { UserProfileTransformer } from './DataTransformer';

// Direct transformer usage (recommended)
const transformer = new UserProfileTransformer();
const userProfile = transformer.transform(profileData);
// Returns structured UserProfile object for app logic
```

## Migration Guide

### Replace Legacy Profile Transformers

**Before:**
```typescript
import { profileTransformers } from '../utils/profileTransformers';

const userProfile = profileTransformers.convertProfileToUserProfileSimple(profileData);
```

**After:**
```typescript
import { UserProfileTransformer } from './DataTransformer';

const transformer = new UserProfileTransformer();
const userProfile = transformer.transform(profileData);
```

### Modern Transformer Classes

- `UserProfileTransformer` - Full conversion with validation
- `ProfileDataTransformer` - Profile data transformation
- `WorkoutFocusTransformer` - Workout focus data transformation
- `PromptVariableComposer` - Prompt variable composition

## Infrastructure Integration

### Validation Pipeline
```typescript
// Uses existing validation infrastructure
const validation = validateProfileData(profileData);
if (!validation.isValid) {
  throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`);
}
```

### Derived Value Calculations
```typescript
// Uses existing derived value maps
const fitnessLevel = DERIVED_VALUE_MAPS.calculateFitnessLevel(
  profileData.experienceLevel,
  profileData.physicalActivity
);

const workoutIntensity = DERIVED_VALUE_MAPS.calculateWorkoutIntensity(
  profileData.intensityLevel,
  profileData.timeCommitment
);
```

### Array Processing
```typescript
// Uses existing array utilities
const validatedActivities = validatePreferredActivities(profileData.preferredActivities);
const validatedLocations = validateAvailableLocations(profileData.availableLocations);
const validatedInjuries = validateInjuries(profileData.injuries);
```

## Benefits

1. **✅ Single Source of Truth** - All transformations in DataTransformer directory
2. **✅ Clear Separation** - Different transformers for different purposes
3. **✅ Type Safety** - Full TypeScript support with proper type mapping
4. **✅ Validation** - Built-in validation using existing infrastructure
5. **✅ Easy Migration** - Drop-in replacement for existing code
6. **✅ Architectural Consistency** - Everything follows the same patterns
7. **✅ Configuration-Driven** - Centralized defaults and rules
8. **✅ Performance** - Singleton instances and shared utilities
9. **✅ Maintainability** - Reduced duplication and centralized logic

## Type Mapping

### Experience Level Mapping
- `'New to Exercise'` → `'beginner'`
- `'Some Experience'` → `'intermediate'`
- `'Advanced Athlete'` → `'advanced'`

### Age Range Mapping
- `'18-25'` → `22`
- `'26-35'` → `31`
- `'36-45'` → `41`
- `'46-55'` → `51`
- `'56-65'` → `61`
- `'65+'` → `70`

## Error Handling

The transformers include comprehensive error handling and validation:

```typescript
try {
  const transformer = new UserProfileTransformer();
  const userProfile = transformer.transform(profileData);
  // Use userProfile
} catch (error) {
  console.error('Transformation failed:', error);
  // Handle error or use fallback
  const fallbackProfile = new UserProfileTransformer().transform({});
}
```

## Recent Cleanup (Legacy Removal)

### Removed Legacy Utilities
The following legacy utility files have been removed to simplify the architecture:

- ❌ `utils/UserProfileUtils.ts` - Legacy wrapper functions
- ❌ `utils/FieldMappingUtils.ts` - Legacy formatting utilities  
- ❌ `utils/DebugUtils.ts` - Development-only debug functions
- ❌ `constants/FieldMappings.ts` - Legacy constant mappings

### Modern Replacement
All functionality is now provided through modern transformer classes:

- ✅ `UserProfileTransformer` - Direct transformer usage
- ✅ `ProfileDataTransformer` - Profile data transformation
- ✅ `WorkoutFocusTransformer` - Workout focus transformation
- ✅ `PromptVariableComposer` - Prompt variable composition

## Architecture Benefits

### Before (Previous Implementation)
- ❌ Hardcoded mappings in transformer
- ❌ Duplicate validation logic
- ❌ External type dependencies
- ❌ Inconsistent patterns
- ❌ Difficult to maintain
- ❌ Legacy utility functions

### After (Current Implementation)
- ✅ Configuration-driven mappings
- ✅ Shared validation infrastructure
- ✅ Local type definitions
- ✅ Consistent patterns
- ✅ Easy to maintain and extend
- ✅ Modern transformer classes only 