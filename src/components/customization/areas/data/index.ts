// 3-Tier Hierarchical Focus Areas - Data & Logic Exports
// Clean interface for components to import area data and hierarchy functions

// Import data for local use and re-export
import {
  PRIMARY_REGIONS,
  SECONDARY_MUSCLES,
  TERTIARY_AREAS,
  type AreaOption,
  type SecondaryMuscle,
  type TertiaryArea,
  type PrimaryRegion,
  type PrimaryRegionKey,
  type SecondaryMuscleKey
} from './areaHierarchyData';

// Re-export data types and constants
export {
  PRIMARY_REGIONS,
  SECONDARY_MUSCLES,
  TERTIARY_AREAS,
  type AreaOption,
  type SecondaryMuscle,
  type TertiaryArea,
  type PrimaryRegion,
  type PrimaryRegionKey,
  type SecondaryMuscleKey
};

// Import logic functions for local use and re-export
import {
  getAllSelectableOptions,
  findOptionInfo,
  getParentKey,
  getChildrenKeys,
  getAllDescendants,
  getAllAncestors,
  hasTertiaryChildren,
  hasSecondaryChildren,
  getSecondaryMuscles,
  getTertiaryAreas,
  buildHierarchicalPath,
  validateHierarchicalSelection
} from './areaSelectionLogic';

// Re-export logic functions
export {
  getAllSelectableOptions,
  findOptionInfo,
  getParentKey,
  getChildrenKeys,
  getAllDescendants,
  getAllAncestors,
  hasTertiaryChildren,
  hasSecondaryChildren,
  getSecondaryMuscles,
  getTertiaryAreas,
  buildHierarchicalPath,
  validateHierarchicalSelection
};

// Convenience re-exports for common operations
export const AreaHierarchy = {
  // Data access
  data: {
    PRIMARY_REGIONS,
    SECONDARY_MUSCLES,
    TERTIARY_AREAS
  },
  
  // Navigation functions
  navigation: {
    getAllSelectableOptions,
    findOptionInfo,
    getParentKey,
    getChildrenKeys,
    getAllDescendants,
    getAllAncestors,
    buildHierarchicalPath
  },
  
  // Validation functions
  validation: {
    validateHierarchicalSelection,
    hasTertiaryChildren,
    hasSecondaryChildren
  },
  
  // Utility functions
  utils: {
    getSecondaryMuscles,
    getTertiaryAreas
  }
}; 