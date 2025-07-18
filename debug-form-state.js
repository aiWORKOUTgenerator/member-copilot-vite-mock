// Comprehensive debug script to trace form state and validation
// Run this in browser console on the Quick Workout page

console.log('=== COMPREHENSIVE FORM STATE DEBUG ===');

// 1. Test the validation logic in isolation
function testValidationLogic() {
  console.log('\n1. VALIDATION LOGIC TEST:');
  
  // Test cases that should be invalid
  const invalidCases = [
    { name: 'Empty initial state', workoutFocus: '', workoutDuration: 0, energyLevel: 0, sorenessLevel: 0 },
    { name: 'Only focus selected', workoutFocus: 'Quick Sweat', workoutDuration: 0, energyLevel: 0, sorenessLevel: 0 },
    { name: 'Focus + duration', workoutFocus: 'Quick Sweat', workoutDuration: 20, energyLevel: 0, sorenessLevel: 0 },
    { name: 'Missing soreness', workoutFocus: 'Quick Sweat', workoutDuration: 20, energyLevel: 3, sorenessLevel: 0 }
  ];
  
  // Test cases that should be valid
  const validCases = [
    { name: 'All fields valid', workoutFocus: 'Quick Sweat', workoutDuration: 20, energyLevel: 3, sorenessLevel: 2 },
    { name: 'Minimum values', workoutFocus: 'Energizing Boost', workoutDuration: 5, energyLevel: 1, sorenessLevel: 1 },
    { name: 'Maximum values', workoutFocus: 'Gentle Recovery & Mobility', workoutDuration: 45, energyLevel: 5, sorenessLevel: 10 }
  ];
  
  function validateState(state) {
    const requiredFields = {
      workoutFocus: state.workoutFocus !== '',
      workoutDuration: typeof state.workoutDuration === 'number' && state.workoutDuration >= 5 && state.workoutDuration <= 45,
      energyLevel: typeof state.energyLevel === 'number' && state.energyLevel >= 1 && state.energyLevel <= 5,
      sorenessLevel: typeof state.sorenessLevel === 'number' && state.sorenessLevel >= 1 && state.sorenessLevel <= 10
    };
    
    return {
      fields: requiredFields,
      isValid: Object.values(requiredFields).every(isValid => isValid)
    };
  }
  
  console.log('Invalid cases (should all be FALSE):');
  invalidCases.forEach(testCase => {
    const result = validateState(testCase);
    console.log(`  ${testCase.name}: ${result.isValid ? '❌ FAIL (should be false)' : '✅ PASS'}`);
    if (result.isValid) {
      console.log('    Fields:', result.fields);
    }
  });
  
  console.log('\nValid cases (should all be TRUE):');
  validCases.forEach(testCase => {
    const result = validateState(testCase);
    console.log(`  ${testCase.name}: ${result.isValid ? '✅ PASS' : '❌ FAIL (should be true)'}`);
    if (!result.isValid) {
      console.log('    Fields:', result.fields);
    }
  });
}

// 2. Inspect current DOM state
function inspectDOMState() {
  console.log('\n2. DOM STATE INSPECTION:');
  
  // Look for the submit button
  const submitButton = document.querySelector('button[type="submit"]') || 
                      Array.from(document.querySelectorAll('button')).find(btn => 
                        btn.textContent?.includes('Generate Quick Workout'));
  
  if (submitButton) {
    console.log('Submit button found:', submitButton);
    console.log('Submit button disabled:', submitButton.disabled);
    console.log('Submit button classes:', submitButton.className);
    console.log('Submit button text:', submitButton.textContent);
  } else {
    console.log('❌ Submit button not found');
  }
  
  // Look for selected focus options
  const focusOptions = document.querySelectorAll('[data-testid*="focus"], .focus-option, button[class*="bg-blue"], button[class*="bg-emerald"]');
  console.log('Focus option buttons found:', focusOptions.length);
  
  const selectedFocus = Array.from(focusOptions).find(btn => 
    btn.className.includes('bg-blue-500') || 
    btn.className.includes('bg-emerald-500') ||
    btn.getAttribute('aria-selected') === 'true'
  );
  
  if (selectedFocus) {
    console.log('Selected focus:', selectedFocus.textContent?.trim());
    console.log('Selected focus classes:', selectedFocus.className);
  } else {
    console.log('No selected focus found');
  }
  
  // Look for selected duration options
  const durationOptions = document.querySelectorAll('[data-testid*="duration"], .duration-option, button[class*="bg-blue"], button[class*="bg-emerald"]');
  console.log('Duration option buttons found:', durationOptions.length);
  
  const selectedDuration = Array.from(durationOptions).find(btn => 
    btn.className.includes('bg-blue-500') || 
    btn.className.includes('bg-emerald-500') ||
    btn.getAttribute('aria-selected') === 'true'
  );
  
  if (selectedDuration) {
    console.log('Selected duration:', selectedDuration.textContent?.trim());
    console.log('Selected duration classes:', selectedDuration.className);
  } else {
    console.log('No selected duration found');
  }
  
  // Look for rating scale values
  const ratingButtons = document.querySelectorAll('button[class*="rating"], button[class*="scale"]');
  console.log('Rating buttons found:', ratingButtons.length);
  
  const selectedRatings = Array.from(ratingButtons).filter(btn => 
    btn.className.includes('bg-blue-500') || 
    btn.className.includes('bg-emerald-500') ||
    btn.getAttribute('aria-selected') === 'true'
  );
  
  console.log('Selected ratings:', selectedRatings.map(btn => btn.textContent?.trim()));
}

// 3. Try to access React state (if possible)
function inspectReactState() {
  console.log('\n3. REACT STATE INSPECTION:');
  
  try {
    // Try to find React component instances
    const reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalInstance) {
      console.log('React instance found, but state inspection requires React DevTools');
    }
    
    // Try to trigger a state change by clicking elements
    console.log('Attempting to trigger state logging...');
    
    // Add event listeners to buttons to log when they're clicked
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button, index) => {
      if (!button.hasAttribute('data-debug-listener')) {
        button.setAttribute('data-debug-listener', 'true');
        button.addEventListener('click', () => {
          console.log(`Button clicked: "${button.textContent?.trim()}" (index: ${index})`);
          
          // Log state after a short delay to allow React to update
          setTimeout(() => {
            console.log('State should have updated - checking DOM...');
            inspectDOMState();
          }, 100);
        });
      }
    });
    
    console.log('Added click listeners to', buttons.length, 'buttons');
    
  } catch (error) {
    console.log('Could not inspect React state:', error.message);
  }
}

// 4. Monitor for console errors
function monitorConsoleErrors() {
  console.log('\n4. CONSOLE ERROR MONITORING:');
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Override console methods to capture errors
  console.error = function(...args) {
    console.log('🚨 CONSOLE ERROR DETECTED:', ...args);
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    console.log('⚠️ CONSOLE WARNING DETECTED:', ...args);
    originalWarn.apply(console, args);
  };
  
  console.log('Console error monitoring enabled');
  
  // Restore original methods after 30 seconds
  setTimeout(() => {
    console.error = originalError;
    console.warn = originalWarn;
    console.log('Console error monitoring disabled');
  }, 30000);
}

// 5. Test form interaction simulation
function simulateFormInteraction() {
  console.log('\n5. FORM INTERACTION SIMULATION:');
  
  // Try to simulate selecting each option
  const focusButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent?.includes('Quick Sweat') || 
    btn.textContent?.includes('Energizing Boost') ||
    btn.textContent?.includes('Stress Reduction')
  );
  
  if (focusButtons.length > 0) {
    console.log('Found focus buttons:', focusButtons.length);
    console.log('Clicking first focus button...');
    focusButtons[0].click();
    
    setTimeout(() => {
      console.log('Focus button clicked, checking state...');
      inspectDOMState();
    }, 200);
  }
  
  // Try to find and click duration buttons
  const durationButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent?.includes('20 min') || 
    btn.textContent?.includes('15 min') ||
    btn.textContent?.includes('10 min')
  );
  
  if (durationButtons.length > 0) {
    setTimeout(() => {
      console.log('Clicking duration button...');
      durationButtons[0].click();
      
      setTimeout(() => {
        console.log('Duration button clicked, checking state...');
        inspectDOMState();
      }, 200);
    }, 500);
  }
}

// Run all tests
console.log('Starting comprehensive form debug...');
testValidationLogic();
inspectDOMState();
inspectReactState();
monitorConsoleErrors();
simulateFormInteraction();

console.log('\n=== DEBUG INSTRUCTIONS ===');
console.log('1. The validation logic test shows if the logic itself is correct');
console.log('2. DOM inspection shows what elements are currently selected');
console.log('3. React state inspection adds click listeners to monitor changes');
console.log('4. Console error monitoring will catch any React/JS errors');
console.log('5. Form interaction simulation will try to click buttons automatically');
console.log('\nNow try manually selecting options and watch the console output!');
console.log('The button should enable when all 4 fields have valid values.'); 