#!/usr/bin/env node

/**
 * QuickWorkoutSetup System Manager
 * 
 * This script helps you safely test and transition between the legacy and new
 * QuickWorkoutSetup systems using feature flags.
 * 
 * Usage:
 *   node scripts/quickworkout-system-manager.js status
 *   node scripts/quickworkout-system-manager.js test-new
 *   node scripts/quickworkout-system-manager.js test-legacy
 *   node scripts/quickworkout-system-manager.js disable-legacy
 *   node scripts/quickworkout-system-manager.js enable-hybrid
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration file path
const CONFIG_PATH = path.join(__dirname, '../src/services/ai/external/config/openai.config.ts');

// Available commands
const COMMANDS = {
  status: 'Show current system status and configuration',
  testNew: 'Force new system only (disable legacy)',
  testLegacy: 'Force legacy system only (disable new)',
  disableLegacy: 'Disable legacy system permanently',
  enableHybrid: 'Enable hybrid mode (default)',
  validate: 'Validate current configuration',
  help: 'Show this help message'
};

function showHelp() {
  console.log('\n🎯 QuickWorkoutSetup System Manager\n');
  console.log('Available commands:');
  Object.entries(COMMANDS).forEach(([cmd, desc]) => {
    console.log(`  ${cmd.padEnd(15)} - ${desc}`);
  });
  console.log('\nExamples:');
  console.log('  node scripts/quickworkout-system-manager.js status');
  console.log('  node scripts/quickworkout-system-manager.js test-new');
  console.log('  node scripts/quickworkout-system-manager.js disable-legacy');
}

function readConfig() {
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    return content;
  } catch (error) {
    console.error('❌ Error reading config file:', error.message);
    process.exit(1);
  }
}

function writeConfig(content) {
  try {
    fs.writeFileSync(CONFIG_PATH, content, 'utf8');
    console.log('✅ Configuration updated successfully');
  } catch (error) {
    console.error('❌ Error writing config file:', error.message);
    process.exit(1);
  }
}

function updateFeatureFlags(disableLegacy, forceNew) {
  const content = readConfig();
  
  // Update the feature flags
  let updatedContent = content.replace(
    /disable_legacy_quickworkout:\s*(true|false)/,
    `disable_legacy_quickworkout: ${disableLegacy}`
  );
  
  updatedContent = updatedContent.replace(
    /force_new_quickworkout_feature:\s*(true|false)/,
    `force_new_quickworkout_feature: ${forceNew}`
  );
  
  writeConfig(updatedContent);
}

function showStatus() {
  const content = readConfig();
  
  // Extract current settings
  const disableLegacy = content.includes('disable_legacy_quickworkout: true');
  const forceNew = content.includes('force_new_quickworkout_feature: true');
  
  console.log('\n🎯 QuickWorkoutSetup System Status\n');
  console.log('Current Configuration:');
  console.log(`  Legacy System Disabled: ${disableLegacy ? '✅ Yes' : '❌ No'}`);
  console.log(`  New System Forced:      ${forceNew ? '✅ Yes' : '❌ No'}`);
  
  // Determine current mode
  let mode;
  if (forceNew) {
    mode = '🆕 NEW SYSTEM ONLY';
  } else if (disableLegacy) {
    mode = '🆕 NEW SYSTEM ONLY (legacy disabled)';
  } else {
    mode = '🔄 HYBRID MODE';
  }
  
  console.log(`\nCurrent Mode: ${mode}`);
  
  // Show recommendations
  console.log('\nRecommendations:');
  if (forceNew && !disableLegacy) {
    console.log('  ⚠️  Consider setting disable_legacy_quickworkout to true for consistency');
  }
  if (disableLegacy && !forceNew) {
    console.log('  ⚠️  Legacy is disabled but new system is not forced - this may cause issues');
  }
  if (!disableLegacy && !forceNew) {
    console.log('  ✅ Hybrid mode is safe for testing');
  }
  
  console.log('\nNext Steps:');
  console.log('  1. Test the current configuration');
  console.log('  2. Monitor for any issues');
  console.log('  3. Use "test-new" to force new system only');
  console.log('  4. Use "disable-legacy" when ready to remove legacy code');
}

function validateConfig() {
  const content = readConfig();
  
  console.log('\n🔍 Validating QuickWorkoutSetup Configuration\n');
  
  // Check for required imports
  const hasFeatureFlags = content.includes('disable_legacy_quickworkout') && 
                         content.includes('force_new_quickworkout_feature');
  
  if (!hasFeatureFlags) {
    console.log('❌ Feature flags not found in configuration');
    return false;
  }
  
  // Check for validation functions
  const hasValidation = content.includes('validateQuickWorkoutSetupConfig');
  
  if (!hasValidation) {
    console.log('❌ Validation functions not found');
    return false;
  }
  
  console.log('✅ Configuration appears valid');
  return true;
}

// Main command handler
function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  switch (command) {
    case 'status':
      showStatus();
      break;
      
    case 'test-new':
      console.log('\n🆕 Forcing new QuickWorkoutSetup system only...');
      updateFeatureFlags(true, true);
      console.log('✅ New system is now forced. Test your application.');
      break;
      
    case 'test-legacy':
      console.log('\n🔄 Forcing legacy QuickWorkoutSetup system only...');
      updateFeatureFlags(false, false);
      console.log('✅ Legacy system is now forced. Test your application.');
      break;
      
    case 'disable-legacy':
      console.log('\n🚫 Disabling legacy QuickWorkoutSetup system...');
      updateFeatureFlags(true, false);
      console.log('✅ Legacy system disabled. New system will be used when applicable.');
      console.log('⚠️  Monitor for any issues before removing legacy code.');
      break;
      
    case 'enable-hybrid':
      console.log('\n🔄 Enabling hybrid mode (default)...');
      updateFeatureFlags(false, false);
      console.log('✅ Hybrid mode enabled. System will choose best approach automatically.');
      break;
      
    case 'validate':
      validateConfig();
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      showHelp();
      break;
  }
}

// Run the script
main(); 