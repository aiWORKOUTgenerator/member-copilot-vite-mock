// Debug script for QuickWorkoutSetup feature
// Run with: node debug-quickworkout.js

console.log('🧪 Testing QuickWorkoutSetup Feature Debug...');

// Mock the environment
process.env.VITE_OPENAI_API_KEY = 'test-key';

// Import the necessary modules using ES modules
import { OpenAIStrategy } from './src/services/ai/external/OpenAIStrategy.js';
import { OpenAIService } from './src/services/ai/external/OpenAIService.js';

async function testQuickWorkoutFeature() {
  try {
    console.log('🔍 Creating OpenAIStrategy...');
    
    // Create OpenAIService (this will trigger constructor debugging)
    const openAIService = new OpenAIService();
    
    // Create OpenAIStrategy (this will trigger feature initialization)
    const strategy = new OpenAIStrategy(openAIService);
    
    console.log('🔍 Testing workout generation...');
    
    // Create a mock request
    const mockRequest = {
      workoutType: 'quick',
      userProfile: {
        fitnessLevel: 'intermediate',
        goals: ['general_fitness'],
        preferences: {
          workoutStyle: ['balanced'],
          timePreference: 'morning',
          intensityPreference: 'moderate',
          advancedFeatures: false,
          aiAssistanceLevel: 'moderate'
        },
        basicLimitations: {
          injuries: [],
          availableEquipment: ['Body Weight'],
          availableLocations: ['Home']
        }
      },
      preferences: {
        duration: 30, // 30-minute workout
        focus: 'Quick Sweat',
        intensity: 'moderate',
        equipment: ['Body Weight'],
        location: 'home'
      },
      workoutFocusData: {
        customization_energy: 7,
        customization_soreness: {}
      }
    };
    
    console.log('🔍 Generating workout with 30-minute duration...');
    
    // This should trigger all the debug logging
    const result = await strategy.generateWorkout(mockRequest);
    
    console.log('✅ Workout generated successfully!');
    console.log('🔍 Result summary:', {
      hasWorkout: !!result,
      workoutType: result?.constructor?.name,
      totalDuration: result?.totalDuration,
      exerciseCount: result?.mainWorkout?.exercises?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testQuickWorkoutFeature().then(() => {
  console.log('🧪 Debug test completed');
  process.exit(0);
}).catch((error) => {
  console.error('🧪 Debug test failed:', error);
  process.exit(1);
}); 