# QuickWorkoutSetup - Duration-Specific Workout Generation

A systematic approach to workout generation that uses duration-specific prompts for optimal results.

## 🎯 Problem Solved

The original single prompt tried to handle 5-45 minute workouts, causing issues like:
- 45-minute workouts generating only 4 exercises
- Conflicting "quick" terminology biasing toward short workouts  
- Excessive complexity for simple 5-minute desk breaks
- One-size-fits-all approach creating suboptimal results

## 🏗️ Architecture

### Directory Structure
```
QuickWorkoutSetup/
├── duration-constants.ts        # Exercise counts & time allocations per duration
├── shared-templates.ts          # Reusable prompt components
├── 5min-quick-break.prompts.ts  # Desk break specialization (4 exercises)
├── 10min-mini-session.prompts.ts # Short effective sessions (6 exercises) 
├── 15min-express.prompts.ts     # Balanced workouts (8 exercises)
├── 20min-focused.prompts.ts     # Full structure (10 exercises)
├── 30min-complete.prompts.ts    # Comprehensive (14 exercises)
├── 45min-extended.prompts.ts    # Maximum variety (20 exercises)
├── index.ts                     # Smart prompt selection logic
└── README.md                    # This file
```

## 📊 Duration Specifications

| Duration | Name | Exercise Count | Complexity | Use Case |
|----------|------|----------------|------------|----------|
| 5 min    | Quick Break | 4 (1+2+1) | Minimal | Desk breaks, energy boosts |
| 10 min   | Mini Session | 6 (2+3+1) | Simple | Quick effective sessions |
| 15 min   | Express | 8 (2+4+2) | Standard | Efficient balanced workouts |
| 20 min   | Focused | 10 (3+5+2) | Standard | Full structured experience |
| 30 min   | Complete | 14 (3+8+3) | Comprehensive | Complete workout experience |
| 45 min   | Extended | 20 (4+12+4) | Advanced | Maximum variety & challenge |

## 🚀 Usage

### Basic Selection
```typescript
import { selectDurationSpecificPrompt } from './QuickWorkoutSetup';

// Automatically selects optimal prompt for duration
const prompt = selectDurationSpecificPrompt(45, 'advanced athlete', [], 'Strength');
```

### Validation & Info
```typescript
import { validateDurationSupport, getPromptInfo } from './QuickWorkoutSetup';

// Check if duration is supported
const validation = validateDurationSupport(25);
// { supported: false, recommendation: "Consider using 30-minute workout...", closestSupported: 30 }

// Get configuration details  
const info = getPromptInfo(45);
// { duration: 45, hasSpecificPrompt: true, exerciseCount: {...}, complexity: 'advanced' }
```

## 🎨 Key Features

### Duration-Specific Optimization
- **5-minute**: Ultra-focused, office-friendly, no equipment
- **45-minute**: Comprehensive, 20 exercises, full variable set

### Variable Scaling
- **Core variables** (5 vars): energy, focus, equipment, fitness, soreness
- **Standard variables** (+3): primary goal, location, time of day  
- **Enhanced variables** (+3): age, injuries, space limitations
- **Full variables** (+3): cardiovascular, previous workout, activities

### Exercise Structure Scaling
- **Minimal**: 6 fields per exercise (id, name, description, duration, equipment, form)
- **Advanced**: 15+ fields with modifications, muscles, difficulty adjustments

## 🔄 Migration Path

1. **Phase 1** ✅: Create 5min and 45min prompts (done)
2. **Phase 2** ✅: Add remaining duration prompts (10, 15, 20, 30 min) (done)
3. **Phase 3**: Update existing code to use `selectDurationSpecificPrompt`
4. **Phase 4**: Deprecate original complex prompt

## 🎯 Benefits

### For Users
- More appropriate exercise counts for each duration
- Better workout quality and flow
- Duration-specific optimizations
- Reduced token costs (smaller prompts)

### For Developers  
- Easier to maintain and update individual prompts
- Clear separation of concerns
- Better debugging and testing
- Scalable architecture for future durations

## 🔧 Extension Points

### Adding New Durations
1. Add config to `duration-constants.ts`
2. Create new prompt file: `XXmin-name.prompts.ts`  
3. Import and register in `index.ts`
4. Test with `validateDurationSupport()`

### Customizing Complexity
Modify `shared-templates.ts` to adjust:
- Variable requirements per complexity level
- Exercise field requirements  
- Prompt structure templates

## 🧪 Testing

```typescript
// Test prompt selection
const prompt5 = selectDurationSpecificPrompt(5);
const prompt45 = selectDurationSpecificPrompt(45);

console.log(prompt5.variables.length); // ~5 core variables
console.log(prompt45.variables.length); // ~13 full variables

// Test supported durations UI
const supported = getSupportedDurations();
// [{ duration: 5, name: "Quick Break", exerciseCount: 4 }, ...]
``` 