import { VALIDATION_RULES } from '../constants/ValidationRules';
import { DEFAULT_VALUES } from '../constants/DefaultValues';
import type {
  PreferredActivity,
  AvailableLocation,
  Injury
} from '../types/profile.types';

/**
 * Ensures value is an array, with proper typing
 */
export function ensureArray<T>(value: T | T[] | undefined, defaultValue: T[]): T[] {
  if (!value) return defaultValue;
  return Array.isArray(value) ? value : [value];
}

/**
 * Filters empty values from arrays
 */
export function filterEmptyValues<T>(arr: T[]): T[] {
  return arr.filter(item => {
    if (item === null || item === undefined) return false;
    if (typeof item === 'string') return item.trim().length > 0;
    if (Array.isArray(item)) return item.length > 0;
    return true;
  });
}

/**
 * Deduplicates array values
 */
export function deduplicate<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Normalizes array values to lowercase for comparison
 */
export function normalizeArrayValues(arr: string[]): string[] {
  return arr.map(item => {
    if (typeof item !== 'string') return String(item);
    return item.trim().toLowerCase();
  });
}

/**
 * Merges arrays with deduplication
 */
export function mergeArrays<T>(...arrays: T[][]): T[] {
  return deduplicate(arrays.flat());
}

/**
 * Validates and transforms preferred activities
 */
export function validatePreferredActivities(activities: string[] | undefined): PreferredActivity[] {
  const validActivities = VALIDATION_RULES.preferredActivities.validValues;
  const defaultActivities = DEFAULT_VALUES.profile.preferredActivities;

  if (!Array.isArray(activities) || activities.length === 0) {
    return defaultActivities;
  }

  // Filter to only valid activities
  const validatedActivities = activities.filter(activity => 
    validActivities.includes(activity as PreferredActivity)
  ) as PreferredActivity[];

  return validatedActivities.length > 0 ? validatedActivities : defaultActivities;
}

/**
 * Validates and transforms available locations
 */
export function validateAvailableLocations(locations: string[] | undefined): AvailableLocation[] {
  const validLocations = VALIDATION_RULES.availableLocations.validValues;
  const defaultLocations = DEFAULT_VALUES.profile.availableLocations;

  if (!Array.isArray(locations) || locations.length === 0) {
    return defaultLocations;
  }

  // Filter to only valid locations
  const validatedLocations = locations.filter(location => 
    validLocations.includes(location as AvailableLocation)
  ) as AvailableLocation[];

  return validatedLocations.length > 0 ? validatedLocations : defaultLocations;
}

/**
 * Validates and transforms injuries
 */
export function validateInjuries(injuries: string[] | undefined): Injury[] {
  const validInjuries = VALIDATION_RULES.injuries.validValues;
  const defaultInjuries = DEFAULT_VALUES.profile.injuries;

  if (!Array.isArray(injuries) || injuries.length === 0) {
    return defaultInjuries;
  }

  // Filter to only valid injuries
  const validatedInjuries = injuries.filter(injury => 
    validInjuries.includes(injury as Injury)
  ) as Injury[];

  return validatedInjuries.length > 0 ? validatedInjuries : defaultInjuries;
}

/**
 * Validates and transforms equipment based on location
 */
export function validateEquipment(equipment: string[] | undefined, locations: AvailableLocation[]): string[] {
  if (!Array.isArray(equipment) || equipment.length === 0) {
    return DEFAULT_VALUES.profile.availableEquipment;
  }

  // Filter out empty values and normalize
  const normalizedEquipment = filterEmptyValues(equipment)
    .map(item => String(item).trim());

  // Always include body weight equipment
  return deduplicate([
    'Body Weight',
    ...normalizedEquipment
  ]);
} 