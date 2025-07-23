// Direct test of QuickWorkoutFeature
// Run with: node test-quickworkout-direct.js

console.log('🧪 Testing QuickWorkoutFeature Directly...');

// Mock the environment
process.env.VITE_OPENAI_API_KEY = 'test-key';

// Import the necessary modules using ES modules
import { QuickWorkoutFeature } from './src/services/ai/external/features/quick-workout-setup/QuickWorkoutFeature.js';
import { OpenAIService } from './src/services/ai/external/OpenAIService.js';

async function testQuickWorkoutFeatureDirectly() {
  try {
    console.log('🔍 Creating OpenAIService...');
    const openAIService = new OpenAIService();
    
    console.log('🔍 Creating QuickWorkoutFeature...');
    const feature = new QuickWorkoutFeature({
      openAIService: openAIService
    });
    
    console.log('🔍 Testing 30-minute workout generation...');
    
    // Create test parameters
    const params = {
      duration: 30,
      fitnessLevel: 'some experience',
      focus: 'Quick Sweat',
      energyLevel: 7,
      sorenessAreas: [],
      equipment: ['Body Weight'],
      location: 'home',
      intensity: 'moderate'
    };
    
    const userProfile = {
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
    };
    
    console.log('🔍 Generating workout...');
    const result = await feature.generateWorkout(params, userProfile);
    
    console.log('✅ Workout generated successfully!');
    console.log('🔍 Result summary:', {
      hasWorkout: !!result.workout,
      workoutType: result.workout?.constructor?.name,
      totalDuration: result.workout?.totalDuration,
      exerciseCount: result.workout?.mainWorkout?.exercises?.length || 0,
      warmupCount: result.workout?.warmup?.exercises?.length || 0,
      cooldownCount: result.workout?.cooldown?.exercises?.length || 0
    });
    
    // Check if we got the expected 14 exercises for 30 minutes
    const totalExercises = (result.workout?.warmup?.exercises?.length || 0) + 
                          (result.workout?.mainWorkout?.exercises?.length || 0) + 
                          (result.workout?.cooldown?.exercises?.length || 0);
    
    console.log(`🔍 Total exercises: ${totalExercises} (expected: 14 for 30min)`);
    
    if (totalExercises === 14) {
      console.log('✅ SUCCESS: Got exactly 14 exercises for 30-minute workout!');
    } else {
      console.log(`⚠️ WARNING: Expected 14 exercises, got ${totalExercises}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testQuickWorkoutFeatureDirectly().then(() => {
  console.log('🧪 Direct test completed');
  process.exit(0);
}).catch((error) => {
  console.error('🧪 Direct test failed:', error);
  process.exit(1);
}); 