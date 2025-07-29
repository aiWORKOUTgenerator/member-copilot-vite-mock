# Common Integration Errors

## 🚨 **Avoid These Common Mistakes**

This document lists the most frequent integration errors and how to fix them.

## ❌ **Method Name Errors**

### **Wrong Method Names**
```typescript
// ❌ WRONG: These method names don't exist
await aiService.analyzeEnergy()           // Should be analyzeEnergyLevel
await aiService.getSorenessInsights()     // Should be analyzeSorenessAreas
await aiService.focusAnalysis()           // Should be analyzeFocusAreas
await aiService.durationInsights()        // Should be analyzeDurationPreferences
await aiService.equipmentAnalysis()       // Should be analyzeEquipmentPreferences
await aiService.crossComponentInsights()  // Should be analyzeCrossComponentRelationships
```

**Fix**: Use the exact method names from [Method Signatures](./method-signatures.md)

### **Wrong Parameter Order**
```typescript
// ❌ WRONG: Wrong parameter order
await aiService.analyzeEnergyLevel(userProfile, 5)  // Should be (energyLevel, userProfile)
await aiService.analyzeSorenessAreas(userProfile, ["back"]) // Should be (sorenessAreas, userProfile)
```

**Fix**: Always use the correct parameter order: `(primaryData, userProfile, context?)`

## ❌ **Parameter Type Errors**

### **Wrong Data Types**
```typescript
// ❌ WRONG: Wrong parameter types
await aiService.analyzeEnergyLevel("high")           // Should be number (1-10)
await aiService.analyzeSorenessAreas("back")         // Should be string[]
await aiService.analyzeFocusAreas("strength")        // Should be string[]
await aiService.analyzeDurationPreferences("30min")  // Should be number
await aiService.analyzeEquipmentPreferences("dumbbells") // Should be string[]
```

**Fix**: Use correct data types:
- Energy level: `number` (1-10)
- Soreness areas: `string[]`
- Focus areas: `string[]`
- Duration: `number` (minutes)
- Equipment: `string[]`

### **Missing Required Parameters**
```typescript
// ❌ WRONG: Missing required userProfile parameter
await aiService.analyzeEnergyLevel(5)                // Missing userProfile
await aiService.getSorenessRecommendations(["back"]) // Missing userProfile
await aiService.analyzeFocusAreas(["strength"])      // Missing userProfile
```

**Fix**: Always provide the complete userProfile parameter

## ❌ **Context Integration Errors**

### **Wrong Context Usage**
```typescript
// ❌ WRONG: Using context incorrectly
await aiService.analyzeEnergyLevel(5, userProfile, "morning") // Should be object
await aiService.analyzeSorenessAreas(["back"], userProfile, "2 days") // Should be object
```

**Fix**: Use proper context objects:
```typescript
// ✅ CORRECT: Proper context usage
await aiService.analyzeEnergyLevel(5, userProfile, { timeOfDay: "morning" })
await aiService.analyzeSorenessAreas(["back"], userProfile, { sorenessDuration: "2 days" })
```

### **Missing GlobalAIContext**
```typescript
// ❌ WRONG: Not using GlobalAIContext
const aiService = new AIService(); // Don't create new instances

const MyComponent = () => {
  // This won't work properly
  const aiService = new AIService();
  // ...
};
```

**Fix**: Always use GlobalAIContext:
```typescript
// ✅ CORRECT: Using GlobalAIContext
import { useGlobalAIContext } from '@/contexts/AIContext';

const MyComponent = () => {
  const { aiService } = useGlobalAIContext();
  // ...
};
```

## ❌ **UserProfile Errors**

### **Incomplete UserProfile**
```typescript
// ❌ WRONG: Incomplete user profile
const userProfile = {
  fitnessLevel: 'intermediate'
  // Missing other required fields
};

await aiService.analyzeEnergyLevel(5, userProfile);
```

**Fix**: Provide complete user profile:
```typescript
// ✅ CORRECT: Complete user profile
const userProfile = {
  fitnessLevel: 'intermediate',
  experienceLevel: 'Some Experience',
  primaryGoal: 'strength',
  energyLevel: 5,
  focus: 'upper body',
  equipment: ['Dumbbells'],
  sorenessAreas: [],
  duration: 30,
  // ... other required fields
};
```

### **Wrong UserProfile Field Types**
```typescript
// ❌ WRONG: Wrong field types
const userProfile = {
  fitnessLevel: 'intermediate', // Should be specific enum value
  experienceLevel: 'some experience', // Should be exact string
  energyLevel: '5', // Should be number
  equipment: 'dumbbells', // Should be string[]
};
```

**Fix**: Use correct field types:
```typescript
// ✅ CORRECT: Proper field types
const userProfile = {
  fitnessLevel: 'intermediate', // 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'adaptive'
  experienceLevel: 'Some Experience', // 'New to Exercise' | 'Some Experience' | 'Advanced Athlete'
  energyLevel: 5, // number (1-10)
  equipment: ['Dumbbells'], // string[]
};
```

## ❌ **Error Handling Errors**

### **No Error Handling**
```typescript
// ❌ WRONG: No error handling
const analysis = await aiService.analyzeEnergyLevel(5, userProfile);
// If this fails, the app crashes
```

**Fix**: Always handle errors:
```typescript
// ✅ CORRECT: Proper error handling
try {
  const analysis = await aiService.analyzeEnergyLevel(5, userProfile);
  // Handle success
} catch (error) {
  console.error('Energy analysis failed:', error);
  // Handle error gracefully
}
```

### **Generic Error Handling**
```typescript
// ❌ WRONG: Generic error handling
try {
  const analysis = await aiService.analyzeEnergyLevel(5, userProfile);
} catch (error) {
  console.error('Something went wrong'); // Too generic
}
```

**Fix**: Use specific error handling:
```typescript
// ✅ CORRECT: Specific error handling
try {
  const analysis = await aiService.analyzeEnergyLevel(5, userProfile);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid input parameters:', error.message);
  } else if (error instanceof ServiceError) {
    console.error('AI service error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## ❌ **Performance Errors**

### **No Loading States**
```typescript
// ❌ WRONG: No loading state
const MyComponent = () => {
  const [result, setResult] = useState(null);
  
  const handleAnalysis = async () => {
    const analysis = await aiService.analyzeEnergyLevel(5, userProfile);
    setResult(analysis); // User doesn't know it's loading
  };
};
```

**Fix**: Add loading states:
```typescript
// ✅ CORRECT: With loading state
const MyComponent = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const analysis = await aiService.analyzeEnergyLevel(5, userProfile);
      setResult(analysis);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading && <div>Analyzing...</div>}
      {result && <div>{/* Display results */}</div>}
    </div>
  );
};
```

### **No Caching**
```typescript
// ❌ WRONG: No caching, calls API every time
const MyComponent = () => {
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    // This runs on every render
    aiService.analyzeEnergyLevel(5, userProfile).then(setResult);
  });
};
```

**Fix**: Use proper caching:
```typescript
// ✅ CORRECT: With caching
const MyComponent = () => {
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    // Only runs when dependencies change
    aiService.analyzeEnergyLevel(5, userProfile).then(setResult);
  }, [userProfile]); // Only re-run when userProfile changes
};
```

## ❌ **Async/Await Errors**

### **Missing Await**
```typescript
// ❌ WRONG: Missing await
const handleAnalysis = () => {
  const analysis = aiService.analyzeEnergyLevel(5, userProfile); // Missing await
  setResult(analysis); // This will be a Promise, not the result
};
```

**Fix**: Always use await with async functions:
```typescript
// ✅ CORRECT: Proper async/await
const handleAnalysis = async () => {
  const analysis = await aiService.analyzeEnergyLevel(5, userProfile);
  setResult(analysis); // This will be the actual result
};
```

### **Wrong Promise Handling**
```typescript
// ❌ WRONG: Wrong promise handling
const handleAnalysis = () => {
  aiService.analyzeEnergyLevel(5, userProfile)
    .then(analysis => setResult(analysis))
    .catch(error => console.error(error)); // Missing error handling
};
```

**Fix**: Use proper promise handling or async/await:
```typescript
// ✅ CORRECT: Proper promise handling
const handleAnalysis = () => {
  aiService.analyzeEnergyLevel(5, userProfile)
    .then(analysis => setResult(analysis))
    .catch(error => {
      console.error('Analysis failed:', error);
      setError(error.message);
    });
};
```

## 🔧 **Debugging Tips**

### **Check Method Signatures**
1. Always refer to [Method Signatures](./method-signatures.md)
2. Verify parameter types and order
3. Ensure all required parameters are provided

### **Validate UserProfile**
1. Check that all required fields are present
2. Verify field types match expected types
3. Ensure enum values are exact matches

### **Test with Simple Cases**
1. Start with minimal parameters
2. Add complexity gradually
3. Test each service individually

### **Use Console Logging**
```typescript
const handleAnalysis = async () => {
  console.log('Input parameters:', { energyLevel, userProfile });
  
  try {
    const analysis = await aiService.analyzeEnergyLevel(energyLevel, userProfile);
    console.log('Analysis result:', analysis);
    setResult(analysis);
  } catch (error) {
    console.error('Analysis failed:', error);
    console.error('Error details:', error.message, error.stack);
  }
};
```

---

**Remember**: When in doubt, check the [Method Signatures](./method-signatures.md) file for the exact API usage.