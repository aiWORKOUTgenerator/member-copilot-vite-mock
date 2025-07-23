import { UserProfileTransformer } from '../transformers/UserProfileTransformer';
import { ProfileData } from '../../../../../components/Profile/types/profile.types';
import { UserProfile } from '../types/user.types';
import { validateProfileData } from '../validators/ProfileDataValidator';
import { DEFAULT_VALUES } from '../constants/DefaultValues';

// Singleton instance for performance
const userProfileTransformer = new UserProfileTransformer();

/**
 * Convenience function to transform ProfileData to UserProfile
 * This replaces the old profileTransformers.convertProfileToUserProfile() pattern
 * 
 * Uses existing DataTransformer infrastructure for validation and transformation.
 */
export function convertProfileToUserProfile(profileData: ProfileData): UserProfile {
  console.log('🔄 UserProfileUtils: Converting ProfileData to UserProfile');
  
  try {
    // Use existing validation infrastructure
    const validation = validateProfileData(profileData);
    if (!validation.isValid) {
      throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`);
    }

    const userProfile = userProfileTransformer.transform(profileData);
    
    if (!userProfileTransformer.validate(userProfile)) {
      throw new Error('UserProfile validation failed');
    }
    
    console.log('✅ UserProfileUtils: ProfileData converted successfully');
    return userProfile;
    
  } catch (error) {
    console.error('❌ UserProfileUtils: Failed to convert ProfileData to UserProfile:', error);
    throw error;
  }
}

/**
 * Convenience function for simple conversion (backward compatibility)
 * This maintains the same interface as the old profileTransformers.convertProfileToUserProfileSimple()
 */
export function convertProfileToUserProfileSimple(profileData: ProfileData): UserProfile {
  return convertProfileToUserProfile(profileData);
}

/**
 * Batch convert multiple ProfileData objects to UserProfile objects
 */
export function convertProfilesToUserProfiles(profileDataArray: ProfileData[]): UserProfile[] {
  return profileDataArray.map(profileData => convertProfileToUserProfile(profileData));
}

/**
 * Validate ProfileData before conversion using existing validation infrastructure
 */
export function validateProfileDataForConversion(profileData: ProfileData): boolean {
  if (!profileData) {
    console.error('❌ UserProfileUtils: ProfileData is null or undefined');
    return false;
  }
  
  const validation = validateProfileData(profileData);
  if (!validation.isValid) {
    console.error('❌ UserProfileUtils: ProfileData validation failed:', validation.errors);
    return false;
  }
  
  console.log('✅ UserProfileUtils: ProfileData validation passed');
  return true;
}

/**
 * Create a default UserProfile for fallback scenarios using existing defaults
 */
export function createDefaultUserProfile(): UserProfile {
  return userProfileTransformer.transform({
    experienceLevel: 'Some Experience',
    primaryGoal: 'General Health',
    preferredActivities: ['Walking/Power Walking'],
    availableEquipment: ['Body Weight'],
    availableLocations: ['Home'],
    injuries: ['No Injuries'],
    intensityLevel: 'moderately',
    physicalActivity: 'moderate',
    preferredDuration: '30-45 min',
    timeCommitment: '3-4',
    goalTimeline: '3 months',
    age: '26-35',
    gender: 'prefer-not-to-say',
    height: '170cm',
    weight: '70 kg',
    hasCardiovascularConditions: 'No'
  });
} 