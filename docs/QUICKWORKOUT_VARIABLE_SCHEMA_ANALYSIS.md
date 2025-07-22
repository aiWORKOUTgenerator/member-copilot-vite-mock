# 🔍 QuickWorkout Variable Schema Analysis & Design

## Epic 1 Findings: Schema Gap Analysis

### ❌ **Problem Statement**
The new QuickWorkoutSetup feature expects 9 derived variables that the legacy PromptDataTransformer doesn't compute:

```
Missing required variables: hasSoreness, sorenessCount, hasEquipment, equipmentCount, 
isMinimal, isSimple, isStandard, isAdvanced, durationAdjusted
```

### 📊 **Story 1.1: Variable Requirements Audit**

#### Current State: PromptDataTransformer Variables
```typescript
// ✅ Variables currently provided by PromptDataTransformer
const currentVariables = {
  // Raw data arrays/objects
  sorenessAreas: string[],      // e.g., ["lower back", "shoulders"]
  equipment: string[],          // e.g., ["Dumbbells", "Resistance Bands"]
  experienceLevel: string,      // e.g., "Some Experience"
  duration: number,             // e.g., 30
  
  // Other profile data...
  fitnessLevel: string,
  primaryGoal: string,
  energyLevel: number,
  focus: string,
  // ... 15+ other variables
};
```

#### New System Required: Missing Derived Variables
```typescript
// ❌ Variables expected by QuickWorkoutFeature but NOT computed by PromptDataTransformer
const missingVariables = {
  // 1. Soreness-derived variables
  hasSoreness: boolean,         // true if sorenessAreas.length > 0
  sorenessCount: number,        // sorenessAreas.length
  
  // 2. Equipment-derived variables  
  hasEquipment: boolean,        // true if equipment.length > 0
  equipmentCount: number,       // equipment.length
  
  // 3. Experience level complexity flags
  isMinimal: boolean,           // complexity === 'minimal'
  isSimple: boolean,            // complexity === 'simple'
  isStandard: boolean,          // complexity === 'standard'  
  isAdvanced: boolean,          // complexity === 'advanced'
  
  // 4. Duration adjustment flag
  durationAdjusted: boolean,    // true if duration was modified
};
```

### 🧮 **Story 1.2: Transformation Logic Design**

#### Algorithm 1: Soreness Variables
```typescript
static computeSorenessVariables(sorenessAreas: string[] | any): {
  hasSoreness: boolean;
  sorenessCount: number;
} {
  // Handle both array and object formats from different data sources
  const areas = Array.isArray(sorenessAreas) ? sorenessAreas : 
    typeof sorenessAreas === 'object' ? Object.keys(sorenessAreas) : [];
  
  return {
    hasSoreness: areas.length > 0,
    sorenessCount: areas.length
  };
}
```

#### Algorithm 2: Equipment Variables
```typescript
static computeEquipmentVariables(equipment: string[] | any): {
  hasEquipment: boolean;
  equipmentCount: number;
} {
  // Handle array or fallback to bodyweight
  const equipmentArray = Array.isArray(equipment) ? equipment : ['Body Weight'];
  // Exclude 'Body Weight' from count since it's default
  const realEquipment = equipmentArray.filter(item => item !== 'Body Weight');
  
  return {
    hasEquipment: realEquipment.length > 0,
    equipmentCount: realEquipment.length
  };
}
```

#### Algorithm 3: Experience Level Complexity Flags
```typescript
static computeExperienceLevelFlags(experienceLevel: string, duration: number): {
  isMinimal: boolean;
  isSimple: boolean; 
  isStandard: boolean;
  isAdvanced: boolean;
} {
  // Map duration to complexity level (from duration-constants.ts)
  const complexityFromDuration = getComplexityFromDuration(duration);
  
  // Map experience level to complexity preference  
  const complexityFromExperience = mapExperienceToComplexity(experienceLevel);
  
  // Use the more conservative of the two
  const finalComplexity = Math.min(complexityFromDuration, complexityFromExperience);
  
  return {
    isMinimal: finalComplexity === 'minimal',
    isSimple: finalComplexity === 'simple',
    isStandard: finalComplexity === 'standard',
    isAdvanced: finalComplexity === 'advanced'
  };
}

// Duration → Complexity mapping (from DURATION_CONFIGS)
function getComplexityFromDuration(duration: number): string {
  if (duration <= 5) return 'minimal';
  if (duration <= 10) return 'simple'; 
  if (duration <= 20) return 'standard';
  if (duration <= 30) return 'comprehensive';
  return 'advanced';
}

// Experience Level → Complexity preference mapping
function mapExperienceToComplexity(experienceLevel: string): string {
  const mapping = {
    'new to exercise': 'simple',      // Max out at simple for safety
    'some experience': 'standard',    // Can handle standard complexity
    'advanced athlete': 'advanced'    // Can handle any complexity
  };
  return mapping[experienceLevel.toLowerCase()] || 'standard';
}
```

#### Algorithm 4: Duration Adjustment Flag
```typescript
static computeDurationAdjustment(requestedDuration: number, actualDuration: number): {
  durationAdjusted: boolean;
  originalDuration?: number;
  adjustmentReason?: string;
} {
  const isAdjusted = requestedDuration !== actualDuration;
  
  return {
    durationAdjusted: isAdjusted,
    ...(isAdjusted && {
      originalDuration: requestedDuration,
      adjustmentReason: `Adjusted from ${requestedDuration} to ${actualDuration} minutes for optimal workout structure`
    })
  };
}
```

### 🔧 **Integration Design**

#### Method: computeDerivedVariables()
```typescript
// Add to PromptDataTransformer class
static computeDerivedVariables(
  variables: Record<string, any>,
  originalDuration?: number
): Record<string, any> {
  
  // 1. Compute soreness variables
  const sorenessVars = this.computeSorenessVariables(variables.sorenessAreas);
  
  // 2. Compute equipment variables  
  const equipmentVars = this.computeEquipmentVariables(variables.equipment);
  
  // 3. Compute experience level flags
  const experienceVars = this.computeExperienceLevelFlags(
    variables.experienceLevel, 
    variables.duration
  );
  
  // 4. Compute duration adjustment
  const durationVars = this.computeDurationAdjustment(
    originalDuration || variables.duration,
    variables.duration
  );
  
  return {
    ...sorenessVars,
    ...equipmentVars, 
    ...experienceVars,
    ...durationVars
  };
}
```

#### Updated transformToPromptVariables()
```typescript
static transformToPromptVariables(
  profileData: ProfileData,
  workoutFocusData: PerWorkoutOptions,
  additionalContext?: Record<string, any>
): Record<string, any> {
  // Existing logic...
  const result = { /* existing variable computation */ };
  
  // 🆕 ADD: Compute derived variables
  const derivedVariables = this.computeDerivedVariables(
    result, 
    workoutFocusData.customization_duration
  );
  
  return {
    ...result,
    ...derivedVariables
  };
}
```

### ✅ **Validation & Testing Strategy**

#### Unit Tests for Each Algorithm
```typescript
describe('PromptDataTransformer - Derived Variables', () => {
  it('should compute soreness variables correctly', () => {
    expect(computeSorenessVariables(['back', 'shoulders'])).toEqual({
      hasSoreness: true,
      sorenessCount: 2
    });
    
    expect(computeSorenessVariables([])).toEqual({
      hasSoreness: false, 
      sorenessCount: 0
    });
  });
  
  it('should compute equipment variables correctly', () => {
    expect(computeEquipmentVariables(['Dumbbells', 'Body Weight'])).toEqual({
      hasEquipment: true,
      equipmentCount: 1  // Body Weight doesn't count
    });
  });
  
  it('should compute experience flags correctly', () => {
    expect(computeExperienceLevelFlags('new to exercise', 5)).toEqual({
      isMinimal: true,
      isSimple: false,
      isStandard: false, 
      isAdvanced: false
    });
  });
});
```

### 🎯 **Success Criteria**

1. ✅ All 9 missing variables documented with correct types
2. ✅ Transformation algorithms designed for each variable
3. ✅ Integration approach planned for PromptDataTransformer
4. ✅ Edge cases identified (empty arrays, null values)
5. ✅ Backward compatibility maintained
6. ✅ Test strategy defined

### 📋 **Next Steps: Epic 2 Implementation**

1. **Story 2.1**: Implement `computeDerivedVariables()` method
2. **Story 2.2**: Add comprehensive tests
3. **Epic 3**: End-to-end validation and deployment

---

*Epic 1 Complete: Schema gap identified and transformation logic designed* ✨ 