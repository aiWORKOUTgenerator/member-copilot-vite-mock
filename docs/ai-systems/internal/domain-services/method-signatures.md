# Domain Services Method Signatures (CRITICAL)

## 🚨 **CRITICAL: Correct Method Usage**

This document contains the exact method signatures for all domain services. Using incorrect method names or parameters is the most common cause of integration errors.

## 📋 **Service Overview**

All domain services follow the same pattern and are accessed through the `AIService` class:

```typescript
import { AIService } from '@/services/ai/internal/core/AIService';

const aiService = new AIService();
```

## 🎯 **Method Signatures**

### **EnergyAIService**

```typescript
// ✅ CORRECT: Analyze energy level and provide insights
const energyAnalysis = await aiService.analyzeEnergyLevel(
  energyLevel: number,           // 1-10 scale
  userProfile: UserProfile,      // Complete user profile
  context?: EnergyContext        // Optional context
): Promise<EnergyAnalysis>

// ✅ CORRECT: Get energy-based recommendations
const energyRecommendations = await aiService.getEnergyRecommendations(
  energyLevel: number,           // 1-10 scale
  userProfile: UserProfile,      // Complete user profile
  workoutType?: string           // Optional workout type
): Promise<EnergyRecommendation[]>
```

### **SorenessAIService**

```typescript
// ✅ CORRECT: Analyze soreness areas and provide insights
const sorenessAnalysis = await aiService.analyzeSorenessAreas(
  sorenessAreas: string[],       // Array of sore body parts
  userProfile: UserProfile,      // Complete user profile
  context?: SorenessContext      // Optional context
): Promise<SorenessAnalysis>

// ✅ CORRECT: Get soreness-based recommendations
const sorenessRecommendations = await aiService.getSorenessRecommendations(
  sorenessAreas: string[],       // Array of sore body parts
  userProfile: UserProfile,      // Complete user profile
  workoutType?: string           // Optional workout type
): Promise<SorenessRecommendation[]>
```

### **FocusAIService**

```typescript
// ✅ CORRECT: Analyze focus areas and provide insights
const focusAnalysis = await aiService.analyzeFocusAreas(
  focusAreas: string[],          // Array of focus areas
  userProfile: UserProfile,      // Complete user profile
  context?: FocusContext         // Optional context
): Promise<FocusAnalysis>

// ✅ CORRECT: Get focus-based recommendations
const focusRecommendations = await aiService.getFocusRecommendations(
  focusAreas: string[],          // Array of focus areas
  userProfile: UserProfile,      // Complete user profile
  workoutType?: string           // Optional workout type
): Promise<FocusRecommendation[]>
```

### **DurationAIService**

```typescript
// ✅ CORRECT: Analyze duration preferences and provide insights
const durationAnalysis = await aiService.analyzeDurationPreferences(
  duration: number,              // Duration in minutes
  userProfile: UserProfile,      // Complete user profile
  context?: DurationContext      // Optional context
): Promise<DurationAnalysis>

// ✅ CORRECT: Get duration-based recommendations
const durationRecommendations = await aiService.getDurationRecommendations(
  duration: number,              // Duration in minutes
  userProfile: UserProfile,      // Complete user profile
  workoutType?: string           // Optional workout type
): Promise<DurationRecommendation[]>
```

### **EquipmentAIService**

```typescript
// ✅ CORRECT: Analyze equipment preferences and provide insights
const equipmentAnalysis = await aiService.analyzeEquipmentPreferences(
  equipment: string[],           // Array of available equipment
  userProfile: UserProfile,      // Complete user profile
  context?: EquipmentContext     // Optional context
): Promise<EquipmentAnalysis>

// ✅ CORRECT: Get equipment-based recommendations
const equipmentRecommendations = await aiService.getEquipmentRecommendations(
  equipment: string[],           // Array of available equipment
  userProfile: UserProfile,      // Complete user profile
  workoutType?: string           // Optional workout type
): Promise<EquipmentRecommendation[]>
```

### **CrossComponentAIService**

```typescript
// ✅ CORRECT: Analyze cross-component relationships
const crossComponentAnalysis = await aiService.analyzeCrossComponentRelationships(
  components: ComponentData[],   // Array of component data
  userProfile: UserProfile,      // Complete user profile
  context?: CrossComponentContext // Optional context
): Promise<CrossComponentAnalysis>

// ✅ CORRECT: Get cross-component recommendations
const crossComponentRecommendations = await aiService.getCrossComponentRecommendations(
  components: ComponentData[],   // Array of component data
  userProfile: UserProfile,      // Complete user profile
  workoutType?: string           // Optional workout type
): Promise<CrossComponentRecommendation[]>
```

## ❌ **Common Mistakes to Avoid**

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

### **Wrong Parameter Types**
```typescript
// ❌ WRONG: Wrong parameter types
await aiService.analyzeEnergyLevel("high")           // Should be number (1-10)
await aiService.analyzeSorenessAreas("back")         // Should be string[]
await aiService.analyzeFocusAreas("strength")        // Should be string[]
await aiService.analyzeDurationPreferences("30min")  // Should be number
await aiService.analyzeEquipmentPreferences("dumbbells") // Should be string[]
```

### **Missing Required Parameters**
```typescript
// ❌ WRONG: Missing required userProfile parameter
await aiService.analyzeEnergyLevel(5)                // Missing userProfile
await aiService.getSorenessRecommendations(["back"]) // Missing userProfile
await aiService.analyzeFocusAreas(["strength"])      // Missing userProfile
```

## ✅ **Correct Usage Examples**

### **Complete Energy Analysis**
```typescript
const energyAnalysis = await aiService.analyzeEnergyLevel(
  7, // energy level
  {
    fitnessLevel: 'intermediate',
    experienceLevel: 'Some Experience',
    primaryGoal: 'strength',
    // ... other profile data
  },
  {
    timeOfDay: 'morning',
    previousWorkout: 'yesterday'
  }
);

console.log('Energy insights:', energyAnalysis.insights);
console.log('Recommendations:', energyAnalysis.recommendations);
```

### **Soreness-Based Recommendations**
```typescript
const sorenessRecommendations = await aiService.getSorenessRecommendations(
  ['lower back', 'shoulders'], // soreness areas
  userProfile,
  'strength' // workout type
);

sorenessRecommendations.forEach(rec => {
  console.log(`Recommendation: ${rec.suggestion}`);
  console.log(`Reason: ${rec.reasoning}`);
});
```

### **Focus Area Analysis**
```typescript
const focusAnalysis = await aiService.analyzeFocusAreas(
  ['upper body', 'core'], // focus areas
  userProfile
);

console.log('Focus insights:', focusAnalysis.insights);
console.log('Exercise suggestions:', focusAnalysis.exerciseSuggestions);
```

## 🔧 **Integration with React Components**

### **Using with GlobalAIContext**
```typescript
import { useGlobalAIContext } from '@/contexts/AIContext';

const MyComponent = () => {
  const { aiService } = useGlobalAIContext();
  
  const handleEnergyAnalysis = async () => {
    const analysis = await aiService.analyzeEnergyLevel(
      8,
      userProfile
    );
    // Handle analysis results
  };
  
  return (
    // Component JSX
  );
};
```

### **Error Handling**
```typescript
try {
  const analysis = await aiService.analyzeEnergyLevel(
    energyLevel,
    userProfile
  );
  // Handle success
} catch (error) {
  console.error('Energy analysis failed:', error);
  // Handle error gracefully
}
```

## 📊 **Return Type Definitions**

### **Analysis Results**
```typescript
interface EnergyAnalysis {
  insights: string[];
  recommendations: EnergyRecommendation[];
  confidence: number; // 0-1
  metadata: {
    analysisType: 'energy';
    timestamp: Date;
    processingTime: number;
  };
}

interface EnergyRecommendation {
  suggestion: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  applicableWorkoutTypes: string[];
}
```

---

**Remember**: Always use the exact method names and parameter types shown above. The most common integration errors come from using incorrect method names or parameter types.