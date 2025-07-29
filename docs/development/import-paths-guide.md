# Import Paths Guide

## 🎯 **Overview**

This guide provides the correct import paths for all major types and services across the codebase. Following these patterns ensures consistency and prevents import errors.

## 📁 **Core Type Definitions**

### **External AI Types**
**Location**: `src/services/ai/external/types/external-ai.types.ts`

**Contains**: `GeneratedWorkout`, `Exercise`, `WorkoutPhase`, `ExternalAIError`, etc.

**Import Patterns by Location**:
```typescript
// From src/types/*.ts
import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';

// From src/hooks/*.ts  
import { GeneratedWorkout } from '../services/ai/external/types/external-ai.types';

// From src/services/ai/external/*.ts (root level)
import { GeneratedWorkout } from './types/external-ai.types';

// From src/services/ai/external/features/quick-workout-setup/workflow/*.ts
import { GeneratedWorkout } from '../../../types/external-ai.types';

// From src/services/ai/external/shared/**/*.ts
import { GeneratedWorkout } from '../../types/external-ai.types';

// From src/services/ai/core/**/*.ts
import { GeneratedWorkout } from '../../external/types/external-ai.types';

// From src/components/**/*.ts
import { GeneratedWorkout } from '../../services/ai/external/types/external-ai.types';
// OR (depending on depth):
import { GeneratedWorkout } from '../../../services/ai/external/types/external-ai.types';
```

### **User Types**
**Location**: `src/types/user.ts`

**Contains**: `UserProfile`, `ProfileData`, `FitnessLevel`, etc.

**Import Patterns**:
```typescript
// From src/services/ai/**/*.ts (5 levels deep)
import { UserProfile } from '../../../../../types/user';

// From src/hooks/*.ts
import { UserProfile } from '../types/user';

// From src/components/**/*.ts
import { UserProfile } from '../../types/user';
```

### **Workout Generation Types**
**Location**: `src/types/workout-generation.types.ts`

**Contains**: `WorkoutGenerationRequest`, `WorkoutGenerationState`, etc.

**Import Patterns**:
```typescript
// From src/services/ai/**/*.ts (5 levels deep)
import { WorkoutGenerationRequest } from '../../../../../types/workout-generation.types';

// From src/hooks/*.ts
import { WorkoutGenerationRequest } from '../types/workout-generation.types';

// From src/components/**/*.ts
import { WorkoutGenerationRequest } from '../../types/workout-generation.types';
```

## 🏗️ **Service Imports**

### **Internal AI Services**
**Location**: `src/services/ai/internal/`

**Import Patterns**:
```typescript
// From src/hooks/*.ts
import { AIService } from '../services/ai/internal/core/AIService';

// From src/components/**/*.ts
import { AIService } from '../../services/ai/internal/core/AIService';

// From src/services/ai/external/**/*.ts
import { AIService } from '../../internal/core/AIService';
```

### **External AI Services**
**Location**: `src/services/ai/external/`

**Import Patterns**:
```typescript
// From src/hooks/*.ts
import { OpenAIStrategy } from '../services/ai/external/strategies/OpenAIStrategy';

// From src/components/**/*.ts
import { OpenAIStrategy } from '../../services/ai/external/strategies/OpenAIStrategy';

// From src/services/ai/internal/**/*.ts
import { OpenAIStrategy } from '../../external/strategies/OpenAIStrategy';
```

### **Domain Services**
**Location**: `src/services/ai/domains/`

**Import Patterns**:
```typescript
// From src/services/ai/internal/**/*.ts
import { EnergyAIService } from '../domains/EnergyAIService';

// From src/services/ai/external/**/*.ts
import { EnergyAIService } from '../../domains/EnergyAIService';

// From src/hooks/*.ts
import { EnergyAIService } from '../services/ai/domains/EnergyAIService';
```

## 🚨 **Common Import Mistakes to Avoid**

### **❌ Wrong Patterns**
```typescript
// ❌ WRONG: Using shared types path
import { GeneratedWorkout } from '../shared/types/external-ai.types';

// ❌ WRONG: Using core types path
import { GeneratedWorkout } from '../../core/types/external-ai.types';

// ❌ WRONG: Too many levels up
import { UserProfile } from '../../../../../../types/user';

// ❌ WRONG: Wrong service path
import { AIService } from '../internal/AIService';
```

### **✅ Correct Patterns**
```typescript
// ✅ CORRECT: Direct path to types
import { GeneratedWorkout } from '../types/external-ai.types';

// ✅ CORRECT: Proper service path
import { AIService } from '../internal/core/AIService';

// ✅ CORRECT: Correct level count
import { UserProfile } from '../../../../../types/user';
```

## 🔧 **Path Calculation Guide**

### **How to Calculate Relative Paths**

1. **Count the directory levels** from your file to the target
2. **Use `../` for each level up**
3. **Use `./` for same directory**
4. **Use directory names for going down**

**Example**: From `src/services/ai/external/features/quick-workout-setup/workflow/parsing/strategies/StringJSONStrategy.ts` to `src/types/user.ts`

- Current: 6 levels deep (`src/services/ai/external/features/quick-workout-setup/workflow/parsing/strategies/`)
- Target: 2 levels deep (`src/types/`)
- Path: `../../../../../../../types/user` (6 levels up, then down to types)

### **Quick Reference by File Depth**

| File Location | Levels Deep | Path to src/types/ | Path to src/services/ai/ |
|---------------|-------------|-------------------|--------------------------|
| `src/types/*.ts` | 2 | `./` | `../services/ai/` |
| `src/hooks/*.ts` | 2 | `../types/` | `../services/ai/` |
| `src/components/*.ts` | 2 | `../types/` | `../services/ai/` |
| `src/services/ai/external/*.ts` | 3 | `../../types/` | `./` |
| `src/services/ai/external/features/*.ts` | 4 | `../../../types/` | `../` |
| `src/services/ai/external/features/quick-workout-setup/*.ts` | 5 | `../../../../types/` | `../../` |
| `src/services/ai/external/features/quick-workout-setup/workflow/*.ts` | 6 | `../../../../../types/` | `../../../` |

## 📋 **Import Path Checklist**

### **Before Adding New Imports**

- [ ] **Verify the target file exists** at the expected location
- [ ] **Count directory levels** from current file to target
- [ ] **Use the correct relative path** based on the calculation
- [ ] **Test the import** to ensure it resolves correctly
- [ ] **Check for TypeScript errors** after adding the import

### **When Moving Files**

- [ ] **Update all import paths** in the moved file
- [ ] **Update all files** that import from the moved file
- [ ] **Run TypeScript compilation** to catch any missed paths
- [ ] **Test the functionality** to ensure nothing is broken

## 🛠️ **Tools and Commands**

### **Find Import Issues**
```bash
# Search for common wrong patterns
grep -r "from.*shared/types/external-ai.types" src/
grep -r "from.*core/types/external-ai.types" src/
grep -r "from.*../../../../../../" src/

# Check TypeScript compilation
npm run type-check
```

### **Validate Import Paths**
```bash
# Run TypeScript compiler to catch import errors
npx tsc --noEmit

# Check for unused imports
npx eslint src/ --ext .ts,.tsx --rule 'import/no-unused-modules: error'
```

## 📚 **Related Documentation**

- [AI Systems Overview](../ai-systems/README.md) - Understanding the AI architecture
- [Domain Services API](../api-reference/ai-services/domain-services-api.md) - Service method signatures
- [Common Integration Errors](../ai-systems/internal/domain-services/common-integration-errors.md) - Avoiding import mistakes
- [Development Setup](../quickstart/development-setup.md) - Setting up the development environment

## 🎯 **Best Practices**

1. **Always use relative paths** - Avoid absolute paths for better portability
2. **Test imports immediately** - Don't wait to discover import errors
3. **Use TypeScript's auto-import** - Let the IDE suggest correct paths
4. **Keep imports organized** - Group related imports together
5. **Document complex paths** - Add comments for non-obvious import paths
6. **Regular path audits** - Periodically check for outdated import patterns

---

**Remember**: When in doubt, use TypeScript's auto-import feature or refer to this guide for the correct path patterns. 