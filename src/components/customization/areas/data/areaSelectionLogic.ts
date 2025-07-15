// Helper functions for working with the 3-tier hierarchical area data structure
// Extracted from notepad - provides navigation and relationship logic

import { 
  PRIMARY_REGIONS, 
  SECONDARY_MUSCLES, 
  TERTIARY_AREAS,
  AreaOption,
  PrimaryRegionKey,
  SecondaryMuscleKey
} from './areaHierarchyData';

/**
 * Gets all selectable options from all three tiers
 * @returns Array of all selectable options with their level information
 */
export const getAllSelectableOptions = (): AreaOption[] => {
  const options: AreaOption[] = [];
  
  // Add primary regions
  PRIMARY_REGIONS.forEach(primary => {
    options.push({ 
      label: primary.label, 
      value: primary.value, 
      level: 'primary' 
    });
  });
  
  // Add secondary muscles
  Object.values(SECONDARY_MUSCLES).flat().forEach(secondary => {
    options.push({ 
      label: secondary.label, 
      value: secondary.value, 
      level: 'secondary' 
    });
  });
  
  // Add tertiary areas
  Object.values(TERTIARY_AREAS).flat().forEach(tertiary => {
    options.push({ 
      label: tertiary.label, 
      value: tertiary.value, 
      level: 'tertiary' 
    });
  });
  
  return options;
};

/**
 * Finds information about a specific option value
 * @param value The value to search for
 * @returns The option info or undefined if not found
 */
export const findOptionInfo = (value: string): AreaOption | undefined => {
  const allOptions = getAllSelectableOptions();
  return allOptions.find(option => option.value === value);
};

/**
 * Gets the parent key for a given value and level
 * @param value The child value to find parent for
 * @param level The level of the child value
 * @returns The parent key or undefined if no parent
 */
export const getParentKey = (
  value: string, 
  level: 'primary' | 'secondary' | 'tertiary'
): string | undefined => {
  if (level === 'primary') return undefined;
  
  if (level === 'secondary') {
    // Find which primary region contains this secondary muscle
    for (const [primaryKey, secondaries] of Object.entries(SECONDARY_MUSCLES)) {
      if (secondaries.some(secondary => secondary.value === value)) {
        return primaryKey;
      }
    }
  }
  
  if (level === 'tertiary') {
    // Find which secondary muscle contains this tertiary area
    for (const [secondaryKey, tertiaries] of Object.entries(TERTIARY_AREAS)) {
      if (tertiaries.some(tertiary => tertiary.value === value)) {
        return secondaryKey;
      }
    }
  }
  
  return undefined;
};

/**
 * Gets the direct children keys for a given value and level
 * @param value The parent value to find children for
 * @param level The level of the parent value
 * @returns Array of direct children keys or undefined if no children
 */
export const getChildrenKeys = (
  value: string, 
  level: 'primary' | 'secondary' | 'tertiary'
): string[] | undefined => {
  if (level === 'primary') {
    return (SECONDARY_MUSCLES as Record<string, { value: string; label: string }[]>)[value]?.map(
      (secondary) => secondary.value
    );
  }
  
  if (level === 'secondary') {
    return (TERTIARY_AREAS as Record<string, { value: string; label: string }[]>)[value]?.map(
      (tertiary) => tertiary.value
    );
  }
  
  // Tertiary level has no children
  return undefined;
};

/**
 * Gets all descendants (children and grandchildren) for a given value and level
 * @param value The ancestor value to find descendants for
 * @param level The level of the ancestor value
 * @returns Array of all descendant keys
 */
export const getAllDescendants = (
  value: string, 
  level: 'primary' | 'secondary' | 'tertiary'
): string[] => {
  const descendants: string[] = [];
  
  if (level === 'primary') {
    // Get all secondary and tertiary descendants
    const secondaries = (SECONDARY_MUSCLES as Record<string, { value: string; label: string }[]>)[value] || [];
    secondaries.forEach((secondary) => {
      descendants.push(secondary.value);
      
      const tertiaries = (TERTIARY_AREAS as Record<string, { value: string; label: string }[]>)[secondary.value] || [];
      tertiaries.forEach((tertiary) => {
        descendants.push(tertiary.value);
      });
    });
  } else if (level === 'secondary') {
    // Get all tertiary descendants
    const tertiaries = (TERTIARY_AREAS as Record<string, { value: string; label: string }[]>)[value] || [];
    tertiaries.forEach((tertiary) => {
      descendants.push(tertiary.value);
    });
  }
  
  return descendants;
};

/**
 * Gets all ancestors (parent and grandparent) for a given value and level
 * @param value The descendant value to find ancestors for
 * @param level The level of the descendant value
 * @returns Array of ancestor keys from immediate parent to root
 */
export const getAllAncestors = (
  value: string, 
  level: 'primary' | 'secondary' | 'tertiary'
): string[] => {
  const ancestors: string[] = [];
  
  if (level === 'tertiary') {
    // Get secondary parent
    const secondaryParent = getParentKey(value, 'tertiary');
    if (secondaryParent) {
      ancestors.push(secondaryParent);
      
      // Get primary grandparent
      const primaryGrandparent = getParentKey(secondaryParent, 'secondary');
      if (primaryGrandparent) {
        ancestors.push(primaryGrandparent);
      }
    }
  } else if (level === 'secondary') {
    // Get primary parent
    const primaryParent = getParentKey(value, 'secondary');
    if (primaryParent) {
      ancestors.push(primaryParent);
    }
  }
  
  return ancestors;
};

/**
 * Checks if a value has tertiary children
 * @param value The value to check
 * @returns True if the value has tertiary children
 */
export const hasTertiaryChildren = (value: string): boolean => {
  return value in TERTIARY_AREAS && TERTIARY_AREAS[value as SecondaryMuscleKey]?.length > 0;
};

/**
 * Checks if a value has secondary children
 * @param value The value to check
 * @returns True if the value has secondary children
 */
export const hasSecondaryChildren = (value: string): boolean => {
  return value in SECONDARY_MUSCLES && SECONDARY_MUSCLES[value as PrimaryRegionKey]?.length > 0;
};

/**
 * Gets the secondary muscles for a primary region
 * @param primaryValue The primary region value
 * @returns Array of secondary muscles or empty array
 */
export const getSecondaryMuscles = (primaryValue: string) => {
  return SECONDARY_MUSCLES[primaryValue as PrimaryRegionKey] || [];
};

/**
 * Gets the tertiary areas for a secondary muscle
 * @param secondaryValue The secondary muscle value
 * @returns Array of tertiary areas or empty array
 */
export const getTertiaryAreas = (secondaryValue: string) => {
  return TERTIARY_AREAS[secondaryValue as SecondaryMuscleKey] || [];
};

/**
 * Builds a hierarchical path string for an area
 * @param value The area value
 * @param level The level of the area
 * @returns Hierarchical path string (e.g., "Upper Body > Chest > Upper Chest")
 */
export const buildHierarchicalPath = (
  value: string, 
  level: 'primary' | 'secondary' | 'tertiary'
): string => {
  const option = findOptionInfo(value);
  if (!option) return value;
  
  const ancestors = getAllAncestors(value, level);
  const path = [];
  
  // Build path from root to current
  if (ancestors.length > 0) {
    // Add ancestors in reverse order (root first)
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const ancestor = findOptionInfo(ancestors[i]);
      if (ancestor) {
        path.push(ancestor.label);
      }
    }
  }
  
  // Add current option
  path.push(option.label);
  
  return path.join(' > ');
};

/**
 * Validates if a selection is valid within the hierarchical structure
 * @param value The value to validate
 * @param selectedValues Array of currently selected values
 * @returns Validation result with any warnings or conflicts
 */
export const validateHierarchicalSelection = (
  value: string, 
  selectedValues: string[]
): { 
  isValid: boolean; 
  warnings: string[]; 
  conflicts: string[] 
} => {
  const warnings: string[] = [];
  const conflicts: string[] = [];
  const option = findOptionInfo(value);
  
  if (!option) {
    return { isValid: false, warnings: ['Unknown area selected'], conflicts: [] };
  }
  
  // Check for parent-child conflicts
  const ancestors = getAllAncestors(value, option.level);
  const descendants = getAllDescendants(value, option.level);
  
  // Check if selecting a parent when child is already selected
  const conflictingChildren = descendants.filter(desc => selectedValues.includes(desc));
  if (conflictingChildren.length > 0) {
    warnings.push(`Selecting ${option.label} while specific areas are already selected`);
  }
  
  // Check if selecting a child when parent is already selected
  const conflictingParents = ancestors.filter(anc => selectedValues.includes(anc));
  if (conflictingParents.length > 0) {
    conflicts.push(`${option.label} conflicts with broader area selection`);
  }
  
  return { 
    isValid: conflicts.length === 0, 
    warnings, 
    conflicts 
  };
}; 