// Debug script to test quickWorkout validation
// Run this in browser console on the quickWorkout page

console.log('=== QUICK WORKOUT VALIDATION DEBUG ===');

// Test the validation logic directly
function testValidation() {
  console.log('\n1. Testing Initial State:');
  
  // Simulate initial state
  const initialState = {
    workoutFocus: '',
    workoutDuration: 0,
    energyLevel: 0,
    sorenessLevel: 0
  };
  
  console.log('Initial state:', initialState);
  
  // Test validation logic
  const requiredFields = {
    workoutFocus: initialState.workoutFocus !== '',
    workoutDuration: typeof initialState.workoutDuration === 'number' && initialState.workoutDuration >= 5 && initialState.workoutDuration <= 45,
    energyLevel: typeof initialState.energyLevel === 'number' && initialState.energyLevel >= 1 && initialState.energyLevel <= 5,
    sorenessLevel: typeof initialState.sorenessLevel === 'number' && initialState.sorenessLevel >= 1 && initialState.sorenessLevel <= 10
  };
  
  console.log('Required fields validation:', requiredFields);
  console.log('Is form valid (initial):', Object.values(requiredFields).every(isValid => isValid));
  
  console.log('\n2. Testing Valid State:');
  
  // Simulate valid state
  const validState = {
    workoutFocus: 'Quick Sweat',
    workoutDuration: 20,
    energyLevel: 3,
    sorenessLevel: 2
  };
  
  console.log('Valid state:', validState);
  
  const validRequiredFields = {
    workoutFocus: validState.workoutFocus !== '',
    workoutDuration: typeof validState.workoutDuration === 'number' && validState.workoutDuration >= 5 && validState.workoutDuration <= 45,
    energyLevel: typeof validState.energyLevel === 'number' && validState.energyLevel >= 1 && validState.energyLevel <= 5,
    sorenessLevel: typeof validState.sorenessLevel === 'number' && validState.sorenessLevel >= 1 && validState.sorenessLevel <= 10
  };
  
  console.log('Required fields validation:', validRequiredFields);
  console.log('Is form valid (valid state):', Object.values(validRequiredFields).every(isValid => isValid));
  
  console.log('\n3. Testing Edge Cases:');
  
  // Test edge cases
  const edgeCases = [
    { name: 'Min duration', workoutDuration: 5, expected: true },
    { name: 'Max duration', workoutDuration: 45, expected: true },
    { name: 'Below min duration', workoutDuration: 4, expected: false },
    { name: 'Above max duration', workoutDuration: 46, expected: false },
    { name: 'Min energy', energyLevel: 1, expected: true },
    { name: 'Max energy', energyLevel: 5, expected: true },
    { name: 'Below min energy', energyLevel: 0, expected: false },
    { name: 'Above max energy', energyLevel: 6, expected: false },
    { name: 'Min soreness', sorenessLevel: 1, expected: true },
    { name: 'Max soreness', sorenessLevel: 10, expected: true },
    { name: 'Below min soreness', sorenessLevel: 0, expected: false },
    { name: 'Above max soreness', sorenessLevel: 11, expected: false }
  ];
  
  edgeCases.forEach(testCase => {
    const testState = {
      workoutFocus: 'Quick Sweat',
      workoutDuration: testCase.workoutDuration || 20,
      energyLevel: testCase.energyLevel || 3,
      sorenessLevel: testCase.sorenessLevel || 2
    };
    
    const testFields = {
      workoutFocus: testState.workoutFocus !== '',
      workoutDuration: typeof testState.workoutDuration === 'number' && testState.workoutDuration >= 5 && testState.workoutDuration <= 45,
      energyLevel: typeof testState.energyLevel === 'number' && testState.energyLevel >= 1 && testState.energyLevel <= 5,
      sorenessLevel: typeof testState.sorenessLevel === 'number' && testState.sorenessLevel >= 1 && testState.sorenessLevel <= 10
    };
    
    const isValid = Object.values(testFields).every(isValid => isValid);
    const passed = isValid === testCase.expected;
    
    console.log(`${testCase.name}: ${passed ? '✅ PASS' : '❌ FAIL'} (expected: ${testCase.expected}, got: ${isValid})`);
  });
}

// Test current form state if available
function testCurrentFormState() {
  console.log('\n4. Testing Current Form State:');
  
  try {
    // Try to access React component state
    const formElements = document.querySelectorAll('button[disabled]');
    const submitButton = Array.from(formElements).find(btn => btn.textContent.includes('Generate Quick Workout'));
    
    if (submitButton) {
      console.log('Submit button found:', submitButton);
      console.log('Submit button disabled:', submitButton.disabled);
    }
    
    // Try to find form values
    const focusButtons = document.querySelectorAll('[data-testid="focus-option"], .bg-blue-100');
    const durationButtons = document.querySelectorAll('[data-testid="duration-option"], .bg-blue-100');
    
    console.log('Focus buttons found:', focusButtons.length);
    console.log('Duration buttons found:', durationButtons.length);
    
    // Check for selected values
    const selectedFocus = document.querySelector('.bg-blue-500, .bg-emerald-500');
    const selectedDuration = document.querySelector('.bg-blue-500, .bg-emerald-500');
    
    console.log('Selected focus element:', selectedFocus);
    console.log('Selected duration element:', selectedDuration);
    
  } catch (error) {
    console.log('Could not access current form state:', error);
  }
}

// Run the tests
testValidation();
testCurrentFormState();

console.log('\n=== DEBUG COMPLETE ===');
console.log('Copy this output and share it to identify the exact issue.'); 