// Targeted debug script for ProfileSection charAt error
// This script will help identify exactly what data is causing the issue

console.log('🎯 Starting targeted ProfileSection debug...');

// Function to intercept and log ProfileSection props
function interceptProfileSectionProps() {
  console.group('🔍 ProfileSection Props Interception');
  
  // Try to find the ProfileSection component in React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    // Look for ProfileSection component
    const renderers = hook.renderers;
    if (renderers && renderers.size > 0) {
      console.log('📊 React renderers found:', renderers);
      
      // Try to find ProfileSection component
      renderers.forEach((renderer, id) => {
        console.log(`🔍 Renderer ${id}:`, renderer);
      });
    }
  }
  
  console.groupEnd();
}

// Function to check specific data that might cause charAt error
function checkProfileDataValues() {
  console.group('📊 Profile Data Value Check');
  
  // Look for specific text patterns that indicate profile data
  const profileDataPatterns = [
    'Experience Level',
    'Workout Intensity', 
    'Preferred Duration',
    'Weekly Commitment',
    'Time Investment',
    'Preferred Activities',
    'Available Training Locations',
    'Available Equipment',
    'Workout Environment',
    'Training Style',
    'Goals & Timeline',
    'Primary Goal',
    'Timeline',
    'Goal Focus',
    'Physical Metrics',
    'Age',
    'Height',
    'Weight',
    'Gender',
    'Health & Safety',
    'Cardiovascular Conditions',
    'Current Injuries'
  ];
  
  profileDataPatterns.forEach(pattern => {
    const elements = document.querySelectorAll('*');
    elements.forEach((el, index) => {
      if (index > 200) return; // Limit search
      
      const text = el.textContent || '';
      if (text.includes(pattern)) {
        console.log(`📍 Found "${pattern}":`, el);
        
        // Check if this element contains undefined values
        if (text.includes('undefined') || text.includes('null')) {
          console.error(`❌ "${pattern}" contains undefined/null:`, el);
        }
      }
    });
  });
  
  console.groupEnd();
}

// Function to specifically check for charAt error conditions
function checkCharAtErrorConditions() {
  console.group('🚨 charAt Error Condition Check');
  
  // Look for any text that might be trying to use charAt
  const allElements = document.querySelectorAll('*');
  let potentialCharAtIssues = [];
  
  allElements.forEach((el, index) => {
    if (index > 300) return; // Limit search
    
    const text = el.textContent || '';
    
    // Check for patterns that might indicate charAt usage
    if (text.includes('Intensity') && (text.includes('undefined') || text.includes('null'))) {
      potentialCharAtIssues.push({
        element: el,
        text: text,
        reason: 'Intensity with undefined/null'
      });
    }
    
    // Check for any text that looks like it should be capitalized but isn't
    if (text.includes('intensity') && text.toLowerCase().includes('intensity')) {
      potentialCharAtIssues.push({
        element: el,
        text: text,
        reason: 'Lowercase intensity (possible charAt failure)'
      });
    }
  });
  
  if (potentialCharAtIssues.length > 0) {
    console.error('❌ Potential charAt issues found:', potentialCharAtIssues);
  } else {
    console.log('✅ No obvious charAt issues found');
  }
  
  console.groupEnd();
}

// Function to check the exact line 139 issue
function checkLine139Issue() {
  console.group('📍 Line 139 Specific Check');
  
  // The error mentions line 139, let's look for any text that might be related
  const intensityElements = document.querySelectorAll('*');
  let intensityIssues = [];
  
  intensityElements.forEach((el, index) => {
    if (index > 200) return;
    
    const text = el.textContent || '';
    
    // Look for workout intensity related text
    if (text.includes('Workout Intensity') || text.includes('workout intensity')) {
      console.log('📍 Found Workout Intensity element:', el);
      console.log('   Text content:', text);
      
      // Check if this element has any undefined values
      if (text.includes('undefined') || text.includes('null') || text.includes('Not calculated')) {
        intensityIssues.push({
          element: el,
          text: text,
          issue: 'Contains undefined/null/Not calculated'
        });
      }
    }
  });
  
  if (intensityIssues.length > 0) {
    console.error('❌ Workout Intensity issues found:', intensityIssues);
  } else {
    console.log('✅ No Workout Intensity issues found');
  }
  
  console.groupEnd();
}

// Function to check React component tree
function checkReactComponentTree() {
  console.group('⚛️ React Component Tree Check');
  
  // Try to find ProfileSection in the component tree
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    // Look for any components with errors
    const renderers = hook.renderers;
    if (renderers && renderers.size > 0) {
      renderers.forEach((renderer, id) => {
        try {
          // Try to get the component tree
          if (renderer.getCurrentFiber) {
            const fiber = renderer.getCurrentFiber();
            if (fiber) {
              console.log('📊 Current fiber:', fiber);
              
              // Look for ProfileSection in the tree
              let current = fiber;
              while (current) {
                if (current.type && current.type.name === 'ProfileSection') {
                  console.log('🎯 Found ProfileSection component:', current);
                  console.log('   Props:', current.memoizedProps);
                  console.log('   State:', current.memoizedState);
                  break;
                }
                current = current.return;
              }
            }
          }
        } catch (error) {
          console.log('⚠️ Could not access renderer:', error);
        }
      });
    }
  }
  
  console.groupEnd();
}

// Main debug function
function runTargetedDebug() {
  console.log('🚀 Starting targeted ProfileSection debug...');
  
  interceptProfileSectionProps();
  checkProfileDataValues();
  checkCharAtErrorConditions();
  checkLine139Issue();
  checkReactComponentTree();
  
  console.log('✅ Targeted debug complete');
  console.log('💡 Check the console output above for specific issues');
}

// Export functions
window.interceptProfileSectionProps = interceptProfileSectionProps;
window.checkProfileDataValues = checkProfileDataValues;
window.checkCharAtErrorConditions = checkCharAtErrorConditions;
window.checkLine139Issue = checkLine139Issue;
window.checkReactComponentTree = checkReactComponentTree;
window.runTargetedDebug = runTargetedDebug;

// Auto-run
if (typeof window !== 'undefined') {
  console.log('🔧 Targeted ProfileSection debug script loaded');
  console.log('💡 Run runTargetedDebug() to start analysis');
} 