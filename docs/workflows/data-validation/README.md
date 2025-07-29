# Data Validation Workflows

This directory contains workflows related to input validation and data integrity processes. The validation system has been consolidated to provide a unified, flexible approach to data validation and transformation.

## Available Workflows

### [Consolidated Validation](./consolidated-validation-workflow.md)
**NEW** - Unified validation approach using UserProfileTransformer with flexible validation rules and robust parsing utilities.

### [Profile Validation](./profile-validation-workflow.md)
**UPDATED** - User profile consistency and completeness checks using the consolidated UserProfileTransformer approach.

### [Input Validation](./input-validation-workflow.md)
Cross-component validation and data verification.

### [Data Sanitization](./data-sanitization-workflow.md)
Input cleaning and normalization processes.

### [Constraint Checking](./constraint-checking-workflow.md)
Business rule validation and enforcement.

### [Safety Validation](./safety-validation-workflow.md)
Exercise safety verification and risk assessment.

## Key Changes

### Consolidated Approach
- **Single Source of Truth:** UserProfileTransformer for all profile transformations
- **Flexible Validation:** Non-blocking validation with graceful error handling
- **Robust Parsing:** Automatic parsing of various data formats
- **Consistent Output:** Unified UserProfile format across the system

### Validation Improvements
- **Flexible Format Support:** Accepts various weight/height formats
- **Non-Blocking Errors:** Validation warnings don't stop processing
- **Fallback Values:** Sensible defaults for missing or invalid data
- **Better User Experience:** Fewer crashes, more robust data handling 