// Validate feature flags
// Run with: node validate-feature-flags.js

console.log('🧪 Validating QuickWorkout Feature Flags...');

// Mock the environment
process.env.VITE_OPENAI_API_KEY = 'test-key';

// Import the necessary modules using ES modules
import { getQuickWorkoutSystemPreference, isNewQuickWorkoutFeatureForced, isLegacyQuickWorkoutDisabled } from './src/services/ai/external/config/openai.config.js';

async function validateFeatureFlags() {
  try {
    console.log('🔍 Checking feature flags...');
    
    const forceNew = isNewQuickWorkoutFeatureForced();
    const legacyDisabled = isLegacyQuickWorkoutDisabled();
    const systemPreference = getQuickWorkoutSystemPreference();
    
    console.log('🔍 Feature flag results:', {
      forceNew,
      legacyDisabled,
      systemPreference
    });
    
    if (systemPreference === 'new') {
      console.log('✅ SUCCESS: System preference is "new" - QuickWorkoutSetup feature should be used');
    } else {
      console.log(`❌ FAILURE: System preference is "${systemPreference}" - should be "new"`);
    }
    
    if (forceNew && legacyDisabled) {
      console.log('✅ SUCCESS: Both flags are set correctly');
    } else {
      console.log('❌ FAILURE: Feature flags are not set correctly');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the validation
validateFeatureFlags().then(() => {
  console.log('🧪 Feature flag validation completed');
  process.exit(0);
}).catch((error) => {
  console.error('🧪 Feature flag validation failed:', error);
  process.exit(1);
}); 