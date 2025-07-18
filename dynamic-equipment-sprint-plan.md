# Sprint Plan: Dynamic Equipment Filtering by Location

## 🎯 **Overview**

Implement intelligent equipment filtering that dynamically presents relevant equipment options based on the user's selected training locations. This creates a more intuitive and personalized experience while maintaining the MVP's simplicity.

## 🔄 **Current State Analysis**

### **Existing Structure:**
- Static equipment options in `PreferencesStep.tsx`
- Equipment validation in `equipmentValidation.ts`
- Equipment filtering logic in `equipmentRecommendations.ts`
- Type definitions in `profile.types.ts`

### **Current Issues:**
- Equipment options are static and not context-aware
- Users can select equipment that doesn't match their locations
- No intelligent filtering based on location constraints
- Redundant options (e.g., "Gym Membership" and individual gym equipment)

## 🏗️ **Implementation Strategy**

### **Phase 1: Location-Based Equipment Mapping (Day 1)**

#### **1.1 Create Equipment-Location Mapping System**
```typescript
// src/utils/locationEquipmentMapping.ts
export interface LocationEquipmentMap {
  location: string;
  equipment: string[];
  description: string;
  defaultEquipment: string[];
}

export const LOCATION_EQUIPMENT_MAPPING: Record<string, LocationEquipmentMap> = {
  'Gym': {
    location: 'Gym',
    equipment: [
      'Free Weights (Dumbbells, Barbells)',
      'Strength Machines',
      'Cardio Machines (Treadmill, Elliptical, Bike)',
      'Functional Training Area (Kettlebells, Resistance Bands, TRX)',
      'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)',
      'Pool (If available)'
    ],
    description: 'Full commercial gym with comprehensive equipment',
    defaultEquipment: ['Free Weights (Dumbbells, Barbells)', 'Cardio Machines (Treadmill, Elliptical, Bike)']
  },
  'Home Gym': {
    location: 'Home Gym',
    equipment: [
      'Dumbbells / Free Weights',
      'Resistance Bands',
      'Kettlebells',
      'Cardio Machine (Treadmill, Bike)',
      'Yoga Mat & Stretching Space'
    ],
    description: 'Dedicated home workout space with equipment',
    defaultEquipment: ['Dumbbells / Free Weights', 'Resistance Bands']
  },
  'Home': {
    location: 'Home',
    equipment: [
      'Body Weight',
      'Resistance Bands',
      'Yoga Mat'
    ],
    description: 'Limited space with minimal equipment',
    defaultEquipment: ['Body Weight']
  },
  'Parks/Outdoor Spaces': {
    location: 'Parks/Outdoor Spaces',
    equipment: [
      'Body Weight',
      'Resistance Bands',
      'Yoga Mat',
      'Mountain Bike or Road Bike'
    ],
    description: 'Outdoor training with portable equipment',
    defaultEquipment: ['Body Weight']
  },
  'Swimming Pool': {
    location: 'Swimming Pool',
    equipment: [
      'No equipment required'
    ],
    description: 'Water-based training',
    defaultEquipment: ['No equipment required']
  },
  'Running Track': {
    location: 'Running Track',
    equipment: [
      'Body Weight'
    ],
    description: 'Track-based training',
    defaultEquipment: ['Body Weight']
  }
};
```

#### **1.2 Update Equipment Types**
```typescript
// src/components/Profile/types/profile.types.ts
export type AvailableEquipment = 
  // Gym Equipment
  | 'Free Weights (Dumbbells, Barbells)'
  | 'Strength Machines'
  | 'Cardio Machines (Treadmill, Elliptical, Bike)'
  | 'Functional Training Area (Kettlebells, Resistance Bands, TRX)'
  | 'Stretching & Mobility Zone (Yoga Mats, Foam Rollers)'
  | 'Pool (If available)'
  // Home Gym Equipment
  | 'Dumbbells / Free Weights'
  | 'Resistance Bands'
  | 'Kettlebells'
  | 'Cardio Machine (Treadmill, Bike)'
  | 'Yoga Mat & Stretching Space'
  // Home Equipment
  | 'Body Weight'
  | 'Yoga Mat'
  // Outdoor Equipment
  | 'Mountain Bike or Road Bike'
  // Specialized
  | 'No equipment required';
```

### **Phase 2: Dynamic Equipment Logic (Day 2)**

#### **2.1 Create Equipment Filtering Service**
```typescript
// src/utils/dynamicEquipmentService.ts
export class DynamicEquipmentService {
  static getAvailableEquipmentForLocations(locations: string[]): AvailableEquipment[] {
    const allEquipment = new Set<AvailableEquipment>();
    
    locations.forEach(location => {
      const locationMap = LOCATION_EQUIPMENT_MAPPING[location];
      if (locationMap) {
        locationMap.equipment.forEach(equipment => 
          allEquipment.add(equipment as AvailableEquipment)
        );
      }
    });
    
    return Array.from(allEquipment);
  }
  
  static getDefaultEquipmentForLocations(locations: string[]): AvailableEquipment[] {
    const defaultEquipment = new Set<AvailableEquipment>();
    
    locations.forEach(location => {
      const locationMap = LOCATION_EQUIPMENT_MAPPING[location];
      if (locationMap) {
        locationMap.defaultEquipment.forEach(equipment => 
          defaultEquipment.add(equipment as AvailableEquipment)
        );
      }
    });
    
    return Array.from(defaultEquipment);
  }
  
  static validateEquipmentForLocations(
    equipment: AvailableEquipment[], 
    locations: string[]
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const availableEquipment = this.getAvailableEquipmentForLocations(locations);
    const errors: string[] = [];
    const warnings: string[] = [];
    
    equipment.forEach(eq => {
      if (!availableEquipment.includes(eq)) {
        errors.push(`${eq} is not available for your selected locations`);
      }
    });
    
    if (equipment.length === 0) {
      errors.push('Please select at least one equipment option');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
```

#### **2.2 Update Equipment Options Configuration**
```typescript
// src/config/equipmentOptions.ts
export const createEquipmentOptions = (locations: string[]): OptionConfig[] => {
  const availableEquipment = DynamicEquipmentService.getAvailableEquipmentForLocations(locations);
  
  return availableEquipment.map(equipment => ({
    value: equipment,
    label: equipment,
    description: getEquipmentDescription(equipment),
    metadata: {
      category: getEquipmentCategory(equipment),
      difficulty: getEquipmentDifficulty(equipment),
      spaceRequired: getEquipmentSpaceRequirement(equipment)
    }
  }));
};

const getEquipmentDescription = (equipment: AvailableEquipment): string => {
  const descriptions: Record<AvailableEquipment, string> = {
    'Free Weights (Dumbbells, Barbells)': 'Versatile weight training equipment for strength building',
    'Strength Machines': 'Guided machines for targeted muscle development',
    'Cardio Machines (Treadmill, Elliptical, Bike)': 'Equipment for cardiovascular training',
    // ... add all descriptions
  };
  return descriptions[equipment] || 'Equipment for training';
};
```

### **Phase 3: UI Component Updates (Day 3)**

#### **3.1 Update PreferencesStep Component**
```typescript
// src/components/Profile/components/steps/PreferencesStep.tsx
const PreferencesStep: React.FC<StepProps> = ({ 
  profileData, 
  onArrayToggle,
  getFieldError
}) => {
  // Dynamic equipment options based on selected locations
  const equipmentOptions = React.useMemo(() => {
    return createEquipmentOptions(profileData.availableLocations);
  }, [profileData.availableLocations]);
  
  // Auto-select default equipment when locations change
  React.useEffect(() => {
    if (profileData.availableLocations.length > 0 && profileData.availableEquipment.length === 0) {
      const defaultEquipment = DynamicEquipmentService.getDefaultEquipmentForLocations(
        profileData.availableLocations
      );
      defaultEquipment.forEach(equipment => {
        onArrayToggle('availableEquipment', equipment);
      });
    }
  }, [profileData.availableLocations, profileData.availableEquipment.length, onArrayToggle]);
  
  // Clear equipment when locations are cleared
  React.useEffect(() => {
    if (profileData.availableLocations.length === 0) {
      // Clear equipment selection when no locations are selected
      profileData.availableEquipment.forEach(equipment => {
        onArrayToggle('availableEquipment', equipment);
      });
    }
  }, [profileData.availableLocations.length, profileData.availableEquipment, onArrayToggle]);
  
  return (
    // ... existing JSX with updated equipment section
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-md shadow-sm">
          Available Equipment
        </div>
        {profileData.availableLocations.length > 0 && (
          <span className="text-sm text-gray-600">
            Based on your selected locations
          </span>
        )}
      </div>
      
      {profileData.availableLocations.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Please select training locations first to see relevant equipment options.
          </p>
        </div>
      ) : (
        <OptionGrid
          options={equipmentOptions}
          selectedValues={profileData.availableEquipment}
          onSelect={(value: string) => onArrayToggle('availableEquipment', value)}
          multiple={true}
          columns={3}
          variant="default"
          useTooltips={true}
          className="[&_button]:w-full"
          error={getFieldError ? getFieldError('availableEquipment') : undefined}
          aria-label="Select your available equipment"
        />
      )}
    </div>
  );
};
```

#### **3.2 Add Equipment Validation**
```typescript
// src/components/Profile/hooks/useProfileValidation.ts
const validateEquipment = (equipment: string[], locations: string[]): string | undefined => {
  if (locations.length === 0) {
    return 'Please select training locations first';
  }
  
  const validation = DynamicEquipmentService.validateEquipmentForLocations(
    equipment as AvailableEquipment[], 
    locations
  );
  
  if (!validation.isValid) {
    return validation.errors[0];
  }
  
  return undefined;
};
```

### **Phase 4: AI Service Integration (Day 4)**

#### **4.1 Update UserProfileEnhancer**
```typescript
// src/services/ai/core/UserProfileEnhancer.ts
private static buildBasicLimitations(profileData: ProfileData): UserBasicLimitations {
  // Validate equipment against locations
  const equipmentValidation = DynamicEquipmentService.validateEquipmentForLocations(
    profileData.availableEquipment as AvailableEquipment[],
    profileData.availableLocations
  );
  
  // Filter out invalid equipment
  const validEquipment = equipmentValidation.isValid 
    ? profileData.availableEquipment 
    : DynamicEquipmentService.getDefaultEquipmentForLocations(profileData.availableLocations);
  
  return {
    injuries: profileData.injuries.filter(injury => injury !== 'No Injuries'),
    availableEquipment: validEquipment,
    availableLocations: profileData.availableLocations
  };
}
```

#### **4.2 Update Equipment Recommendations**
```typescript
// src/utils/equipmentRecommendations.ts
export function filterAvailableEquipment(
  workoutFocus: string,
  availableEquipment: string[],
  availableLocations?: string[]
): string[] {
  // If locations are provided, validate equipment against them
  if (availableLocations && availableLocations.length > 0) {
    const validEquipment = DynamicEquipmentService.validateEquipmentForLocations(
      availableEquipment as AvailableEquipment[],
      availableLocations
    );
    
    if (!validEquipment.isValid) {
      // Use default equipment for selected locations
      return DynamicEquipmentService.getDefaultEquipmentForLocations(availableLocations);
    }
  }
  
  // Existing logic for workout focus filtering
  const workoutOptions = WORKOUT_EQUIPMENT_OPTIONS[workoutFocus]?.equipment || [];
  
  if (!workoutOptions.length || !availableEquipment?.length) {
    return ['Body Weight'];
  }
  
  const matchingEquipment = workoutOptions.filter(equipment => 
    availableEquipment.includes(equipment)
  );
  
      return matchingEquipment.length ? matchingEquipment : ['Body Weight'];
}
```

### **Phase 5: Testing & Validation (Day 5)**

#### **5.1 Unit Tests**
```typescript
// src/utils/__tests__/dynamicEquipmentService.test.ts
describe('DynamicEquipmentService', () => {
  test('getAvailableEquipmentForLocations returns correct equipment for gym', () => {
    const equipment = DynamicEquipmentService.getAvailableEquipmentForLocations(['Gym']);
    expect(equipment).toContain('Free Weights (Dumbbells, Barbells)');
    expect(equipment).toContain('Strength Machines');
  });
  
  test('validateEquipmentForLocations detects invalid equipment', () => {
    const result = DynamicEquipmentService.validateEquipmentForLocations(
      ['Strength Machines'],
      ['Home']
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Strength Machines is not available for your selected locations');
  });
});
```

#### **5.2 Integration Tests**
```typescript
// src/components/Profile/__tests__/PreferencesStep.test.tsx
test('equipment options update when locations change', () => {
  const { rerender } = render(<PreferencesStep {...props} />);
  
  // Initially no equipment options shown
  expect(screen.queryByText('Free Weights (Dumbbells, Barbells)')).not.toBeInTheDocument();
  
  // Update locations to include gym
  rerender(<PreferencesStep {...props} profileData={{...props.profileData, availableLocations: ['Gym']}} />);
  
  // Equipment options should now include gym equipment
  expect(screen.getByText('Free Weights (Dumbbells, Barbells)')).toBeInTheDocument();
});
```

## 🎯 **Success Criteria**

### **Functional Requirements:**
- [ ] Equipment options dynamically update based on location selection
- [ ] Default equipment is auto-selected when locations are chosen
- [ ] Invalid equipment is prevented or flagged
- [ ] Equipment validation works with AI services
- [ ] UI provides clear feedback about location-equipment relationships

### **User Experience:**
- [ ] Intuitive flow: locations first, then relevant equipment
- [ ] Clear visual indicators of location-equipment relationships
- [ ] Helpful error messages for invalid selections
- [ ] Smooth transitions when locations change

### **Technical Requirements:**
- [ ] Type safety maintained throughout
- [ ] Performance optimized for dynamic updates
- [ ] Comprehensive test coverage
- [ ] Backward compatibility with existing data

## 🚀 **Deployment Considerations**

### **Data Migration:**
- Handle existing users with invalid equipment-location combinations
- Provide migration script to update existing profiles
- Graceful fallback to default equipment for invalid combinations

### **Feature Flags:**
- Consider gradual rollout of dynamic filtering
- Add analytics to track user behavior changes
- Plan for rollback if issues arise

### **Monitoring:**
- Track equipment selection patterns
- Monitor validation error rates
- Measure user satisfaction with new flow

## 📝 **Implementation Notes**

### **Key Benefits:**
1. **Reduced Cognitive Load**: Users only see relevant options
2. **Improved Accuracy**: Equipment selections match actual capabilities
3. **Better Workouts**: AI services receive validated equipment data
4. **Enhanced UX**: Intuitive progression from location to equipment

### **Risk Mitigation:**
1. **Backward Compatibility**: Handle existing invalid data gracefully
2. **Performance**: Optimize dynamic option generation
3. **User Education**: Clear messaging about the new flow
4. **Testing**: Comprehensive validation of all location-equipment combinations

This implementation provides a significant UX improvement while maintaining the simplicity and effectiveness of the MVP approach. 