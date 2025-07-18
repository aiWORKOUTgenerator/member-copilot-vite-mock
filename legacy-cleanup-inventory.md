# Legacy Code Cleanup & Equipment Naming Convention Finalization - Inventory

## 📋 **Legacy Code Inventory**

### **1. Legacy AI Recommendation Engine (Lines 521-653 in migrationUtils.ts)**
- **File**: `src/utils/migrationUtils.ts`
- **Lines**: 521-653
- **Status**: DEPRECATED - marked for removal
- **Dependencies**: 
  - `src/components/DetailedWorkoutContainer.tsx`
  - `src/components/customization/focus/FocusCustomization.tsx`
  - `src/components/customization/areas/FocusAreasCustomization.tsx`
  - `src/services/ai/migration/AILogicExtractor.ts`

### **2. Deprecated Hook (Lines 170-177 in usePersistedState.ts)**
- **File**: `src/hooks/usePersistedState.ts`
- **Lines**: 170-177
- **Status**: DEPRECATED - marked for removal
- **Dependencies**: None found (all components use useEnhancedPersistedState)

### **3. Backward Compatibility Methods in Domain Services**
- **Files**: All domain services in `src/services/ai/domains/`
- **Status**: DEPRECATED - marked for removal
- **Methods**: `generateInsights()` methods that return empty arrays

## 📋 **Equipment Naming Inconsistencies**

### **Current Standard**: `'Body Weight'` (with space)
### **Incorrect Variants Found**:
- `'Body Weight only'` (in dynamic-equipment-sprint-plan.md)
- `'bodyweight'` (lowercase, no space)
- `'Bodyweight-only'` (hyphenated)

### **Files Requiring Equipment Name Updates**:
1. `src/services/ai/migration/AILogicExtractor.ts` - Line 429
2. `dynamic-equipment-sprint-plan.md` - Multiple instances
3. Test files with incorrect equipment names

## 📋 **Import Dependencies to Update**

### **AI Service Imports**:
- `src/components/DetailedWorkoutContainer.tsx` - Line 12
- `src/components/customization/focus/FocusCustomization.tsx` - Line 11
- `src/components/customization/areas/FocusAreasCustomization.tsx` - Line 7

### **Hook Imports**:
- All components already use `useEnhancedPersistedState` ✅

## 📋 **Test Failures to Address**

### **1. EquipmentAIService Test Failures**:
- **Issue**: `Cannot read properties of undefined (reading 'filter')`
- **Location**: `src/services/ai/domains/EquipmentAIService.ts:118`
- **Root Cause**: `partialSelections` is undefined

### **2. Profile Component Test Failures**:
- **Issue**: `Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined`
- **Location**: `src/components/Profile/__tests__/ProfileDataFlow.test.tsx:33`
- **Root Cause**: Missing component export

### **3. AI Validation Suite Test Failures**:
- **Issues**: 
  - Equipment naming inconsistencies
  - Memory usage thresholds exceeded
  - Recommendation text mismatches

## 📋 **Files Requiring Updates**

### **High Priority (Legacy Removal)**:
1. `src/utils/migrationUtils.ts` - Remove aiRecommendationEngine
2. `src/hooks/usePersistedState.ts` - Remove deprecated hook
3. `src/services/ai/domains/*.ts` - Remove backward compatibility methods

### **Medium Priority (Import Updates)**:
1. `src/components/DetailedWorkoutContainer.tsx`
2. `src/components/customization/focus/FocusCustomization.tsx`
3. `src/components/customization/areas/FocusAreasCustomization.tsx`

### **Low Priority (Equipment Naming)**:
1. `src/services/ai/migration/AILogicExtractor.ts`
2. `dynamic-equipment-sprint-plan.md`
3. Test files with equipment name inconsistencies

## 📋 **Risk Assessment**

### **High Risk**:
- Removing legacy AI engine without proper migration
- Breaking existing functionality during cleanup

### **Medium Risk**:
- Equipment naming updates affecting user data
- Test failures during cleanup process

### **Low Risk**:
- Documentation updates
- Comment cleanup

## 📋 **Success Criteria**

### **Technical**:
- [ ] Zero build errors
- [ ] All tests passing
- [ ] No console warnings about deprecated code
- [ ] Consistent equipment naming across codebase

### **Functional**:
- [ ] All existing functionality preserved
- [ ] No breaking changes for end users
- [ ] Improved performance (reduced bundle size)

### **Code Quality**:
- [ ] No unused imports
- [ ] Clean, maintainable code
- [ ] Proper documentation
- [ ] Consistent naming conventions 