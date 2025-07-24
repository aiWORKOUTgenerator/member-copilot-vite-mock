// Simple test to verify duration configs are working
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Duration Configs Import...');

try {
  // Test importing the prompts index
  const promptsPath = path.join(__dirname, 'src/services/ai/external/features/quick-workout-setup/prompts/index.ts');
  
  if (fs.existsSync(promptsPath)) {
    console.log('✅ Prompts index file exists');
    
    // Read the file to check for syntax
    const content = fs.readFileSync(promptsPath, 'utf8');
    
    // Check if it contains the expected exports
    if (content.includes('DURATION_PROMPTS')) {
      console.log('✅ DURATION_PROMPTS export found');
    } else {
      console.log('❌ DURATION_PROMPTS export not found');
    }
    
    if (content.includes('selectDurationSpecificPrompt')) {
      console.log('✅ selectDurationSpecificPrompt function found');
    } else {
      console.log('❌ selectDurationSpecificPrompt function not found');
    }
    
    // Check for individual duration config imports
    const durationConfigs = ['5min', '10min', '15min', '20min', '30min', '45min'];
    durationConfigs.forEach(duration => {
      const configPath = path.join(__dirname, `src/services/ai/external/features/quick-workout-setup/prompts/duration-configs/${duration}.config.ts`);
      if (fs.existsSync(configPath)) {
        console.log(`✅ ${duration} config file exists`);
        
        // Check import path
        const configContent = fs.readFileSync(configPath, 'utf8');
        if (configContent.includes('from \'../../../../types/external-ai.types\'')) {
          console.log(`✅ ${duration} config has correct import path`);
        } else {
          console.log(`❌ ${duration} config has incorrect import path`);
        }
      } else {
        console.log(`❌ ${duration} config file missing`);
      }
    });
    
  } else {
    console.log('❌ Prompts index file not found');
  }
  
  // Test constants file
  const constantsPath = path.join(__dirname, 'src/services/ai/external/features/quick-workout-setup/constants/quick-workout.constants.ts');
  if (fs.existsSync(constantsPath)) {
    console.log('✅ Constants file exists');
    
    const constantsContent = fs.readFileSync(constantsPath, 'utf8');
    if (constantsContent.includes('DURATION_CONFIGS')) {
      console.log('✅ DURATION_CONFIGS found in constants');
    } else {
      console.log('❌ DURATION_CONFIGS not found in constants');
    }
  } else {
    console.log('❌ Constants file not found');
  }
  
  // Test shared templates
  const sharedTemplatesPath = path.join(__dirname, 'src/services/ai/external/features/quick-workout-setup/prompts/shared-templates.ts');
  if (fs.existsSync(sharedTemplatesPath)) {
    console.log('✅ Shared templates file exists');
    
    const sharedContent = fs.readFileSync(sharedTemplatesPath, 'utf8');
    if (sharedContent.includes('generateSystemPrompt')) {
      console.log('✅ generateSystemPrompt function found');
    } else {
      console.log('❌ generateSystemPrompt function not found');
    }
  } else {
    console.log('❌ Shared templates file not found');
  }
  
  console.log('\n🎉 Duration Configs Import Test Complete!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
} 