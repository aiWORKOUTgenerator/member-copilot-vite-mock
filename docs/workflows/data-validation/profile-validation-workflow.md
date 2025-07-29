# Profile Validation Workflow

## Overview

The profile validation workflow ensures user profile data maintains consistency and accuracy throughout the system. This workflow validates profile updates, maintains data integrity, and ensures profile information meets all business requirements. The workflow has been updated to use the consolidated `UserProfileTransformer` approach with flexible validation rules.

## Architecture

### Consolidated Profile Transformation
- **Primary Transformer:** `UserProfileTransformer` - Single source of truth for profile transformations
- **Validation Approach:** Flexible validation with graceful error handling
- **Data Flow:** ProfileData → Validation → UserProfile → AI Services

### Key Components
- `UserProfileTransformer` - Main transformation engine
- `validateProfileData` - Flexible validation with warnings
- `DERIVED_VALUE_MAPS` - Parsing utilities for various data formats
- `ValidationRules` - Configurable validation rules

## Workflow Stages

### 1. Profile Data Collection
- **Trigger:** Profile update request
- **Component:** Profile components (ProfilePage, WorkoutFocusPage, etc.)
- **Inputs:** Profile data, update context
- **Process:** Gather profile information
- **Outputs:** Complete profile data

### 2. Flexible Schema Validation
- **Trigger:** Profile data collected
- **Component:** `validateProfileData`
- **Inputs:** Profile data, flexible validation rules
- **Process:** Validate data structure with graceful handling
- **Outputs:** Validation results (warnings, not failures)

### 3. Robust Data Parsing
- **Trigger:** Schema validation complete
- **Component:** `DERIVED_VALUE_MAPS` parsing utilities
- **Inputs:** Raw profile data (various formats)
- **Process:** Parse weight, height, age with fallback handling
- **Outputs:** Normalized numeric values

### 4. UserProfile Transformation
- **Trigger:** Data parsing complete
- **Component:** `UserProfileTransformer`
- **Inputs:** Parsed profile data
- **Process:** Transform to structured UserProfile
- **Outputs:** Complete UserProfile object

### 5. Consistency Check
- **Trigger:** UserProfile transformation complete
- **Component:** `UserProfileTransformer.validate()`
- **Inputs:** Transformed UserProfile
- **Process:** Check data consistency
- **Outputs:** Consistency status

## Error Handling

### Validation Warnings (Non-Blocking)
- Schema violations → Logged as warnings, transformation continues
- Format issues → Automatic parsing with fallback values
- Missing fields → Default values applied

### Service Failures
- Validation service errors → Graceful degradation
- Rule engine failures → Continue with basic validation
- Data access errors → Fallback to cached data

### Recovery Actions
- **Default Value Substitution:** Missing fields get sensible defaults
- **Format Parsing:** Various weight/height formats handled automatically
- **Partial Profile Acceptance:** Continue with available data
- **Fallback Profiles:** Safe default UserProfile when transformation fails

## Flexible Validation Rules

### Weight Validation
```typescript
// Accepts multiple formats
weight: {
  required: true,
  format: /^(\d+\s*(lbs|kg)?)$/  // "200", "200 lbs", "70 kg"
}
```

### Height Validation
```typescript
// Accepts multiple formats
height: {
  required: true,
  format: /^(\d+'?\d*\"?|\d+cm?)$/  // "170", "5'8\"", "170cm"
}
```

### Parsing Utilities
- `parseWeight()` - Handles lbs, kg, or plain numbers
- `parseHeight()` - Handles imperial, metric, or plain numbers
- `parseAgeRange()` - Converts age ranges to numeric values

## Cross-References

### Upstream Dependencies
- [Data Sanitization](./data-sanitization-workflow.md) - Clean profile data
- [Input Validation](./input-validation-workflow.md) - Validated inputs

### Downstream Consumers
- [Energy Assessment](../user-interactions/energy-assessment-workflow.md) - Validated profile data
- [Fitness Level Assessment](../user-interactions/fitness-level-assessment-workflow.md) - Profile consistency
- [Safety Validation](./safety-validation-workflow.md) - Profile safety checks

### Related Workflows
- [Metrics Collection](../monitoring-observability/metrics-collection-workflow.md) - Profile accuracy metrics
- [Constraint Checking](./constraint-checking-workflow.md) - Profile constraints

### Integration Points
- **Data Flow**: Profile Update → Flexible Validation → UserProfile Transformation → AI Services
- **Event Triggers**: Profile changes trigger validation
- **Fallback Chain**: Full Validation → Partial Validation → Default Values → Reject Update

## Metrics & Monitoring

### Key Performance Indicators
- Validation success rate (including warnings)
- Transformation success rate
- Parsing accuracy rate
- Update processing time

### Logging Points
- Profile data collection
- Validation warnings (non-blocking)
- Data parsing results
- Transformation completion
- Consistency checks

## Testing Strategy

### Unit Tests
- Schema validation (flexible rules)
- Data parsing utilities
- Transformation logic
- Consistency checking

### Integration Tests
- End-to-end validation
- Cross-field consistency
- Update processing
- Fallback scenarios

### Profile Tests
- Edge cases with various formats
- Update scenarios
- Migration validation
- Error recovery

## Migration Notes

### From Legacy ProfileTransformers
- **Before:** Multiple transformation utilities with strict validation
- **After:** Single `UserProfileTransformer` with flexible validation
- **Benefits:** Consistent behavior, better error handling, unified approach

### Validation Changes
- **Before:** Strict format requirements causing failures
- **After:** Flexible formats with automatic parsing
- **Benefits:** Better user experience, fewer crashes, robust data handling 