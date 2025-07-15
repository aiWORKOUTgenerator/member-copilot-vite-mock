// Main exports for hierarchical focus areas system
export { default as FocusAreasCustomization } from './FocusAreasCustomization';
export { default as HierarchicalAreaSelector } from './HierarchicalAreaSelector';

// Tier-based components
export { 
  PrimaryRegionSelector, 
  SecondaryMuscleSelector, 
  TertiaryAreaSelector 
} from './tiers';

// Shared components
export { 
  AreaSelectionButton, 
  ExpansionControls 
} from './shared';

// Data and logic exports
export {
  // Data structures
  PRIMARY_REGIONS,
  SECONDARY_MUSCLES,
  TERTIARY_AREAS,
  
  // Types
  type AreaOption,
  type SecondaryMuscle,
  type TertiaryArea,
  type PrimaryRegion,
  type PrimaryRegionKey,
  type SecondaryMuscleKey,
  
  // Logic functions
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
  validateHierarchicalSelection,
  
  // Convenience exports
  AreaHierarchy
} from './data'; 