import { UserProfile } from '../../../types';

// Feature flag configuration types
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  userGroups?: string[]; // Optional: target specific user groups
  overrides?: Record<string, boolean>; // User-specific overrides
  metadata?: {
    experimentId?: string;
    startDate?: Date;
    endDate?: Date;
    owner?: string;
    notes?: string;
  };
}

export interface FeatureFlagAllocation {
  userId: string;
  flagId: string;
  allocated: boolean;
  group: 'control' | 'treatment';
  timestamp: Date;
  reason: 'rollout' | 'override' | 'group_targeting';
}

export interface ABTestResults {
  flagId: string;
  controlGroup: {
    users: number;
    conversionRate: number;
    avgResponseTime: number;
    userSatisfaction: number;
  };
  treatmentGroup: {
    users: number;
    conversionRate: number;
    avgResponseTime: number;
    userSatisfaction: number;
  };
  statisticalSignificance: number;
  winner?: 'control' | 'treatment';
}

// Default feature flags for AI service rollout
const DEFAULT_AI_FLAGS: FeatureFlag[] = [
  {
    id: 'ai_confidence_system',
    name: 'AI Confidence Score System',
    description: 'Enable the new AI confidence calculation system for workout generation',
    enabled: true,
    rolloutPercentage: 100, // Enabled for all users for development and testing
    metadata: {
      experimentId: 'ai_confidence_system_2024',
      startDate: new Date(),
      owner: 'ai_team',
      notes: 'Phase 1 deployment - confidence calculation service integration - ENABLED FOR TESTING'
    }
  },
  {
    id: 'ai_service_unified',
    name: 'Unified AI Service',
    description: 'Use the new unified AI service instead of legacy implementations',
    enabled: true,
    rolloutPercentage: 100, // Enabled for all users for development
    metadata: {
      experimentId: 'ai_service_migration_2024',
      startDate: new Date(),
      owner: 'ai_team',
      notes: 'Quick Workout feature rollout - expanded to 30% based on successful 10% validation'
    }
  },
  {
    id: 'ai_cross_component_analysis',
    name: 'Cross-Component AI Analysis',
    description: 'Enable advanced cross-component conflict detection and optimization',
    enabled: true,
    rolloutPercentage: 40, // Increased from 20% to 40% for Quick Workout cross-component analysis
    metadata: {
      experimentId: 'cross_component_ai_2024',
      startDate: new Date(),
      owner: 'ai_team',
      notes: 'Quick Workout cross-component analysis - expanded rollout to enhance user experience'
    }
  },
  {
    id: 'ai_real_time_insights',
    name: 'Real-time AI Insights',
    description: 'Provide real-time AI insights as users modify workout parameters',
    enabled: true,
    rolloutPercentage: 5, // Conservative rollout for performance-sensitive feature
    metadata: {
      experimentId: 'realtime_ai_2024',
      startDate: new Date(),
      owner: 'ai_team',
      notes: 'Real-time feedback system'
    }
  },
  {
    id: 'ai_learning_system',
    name: 'AI Learning System',
    description: 'Enable AI learning from user interactions and feedback',
    enabled: true,
    rolloutPercentage: 15,
    metadata: {
      experimentId: 'ai_learning_2024',
      startDate: new Date(),
      owner: 'ai_team',
      notes: 'Machine learning adaptation system'
    }
  },
  {
    id: 'openai_workout_generation',
    name: 'OpenAI Workout Generation',
    description: 'Generate personalized workouts using OpenAI',
    enabled: true,
    rolloutPercentage: 100, // Enable for all users
    metadata: {
      experimentId: 'openai_workout_gen_2024',
      startDate: new Date(),
      owner: 'ai_team',
      notes: 'OpenAI-powered workout generation - enabled for all users'
    }
  },
  {
    id: 'openai_enhanced_recommendations',
    name: 'OpenAI Enhanced Recommendations',
    description: 'Enhance AI recommendations with OpenAI insights',
    enabled: true,
    rolloutPercentage: 100, // Enable for all users
    metadata: {
      experimentId: 'openai_recommendations_2024',
      startDate: new Date(),
      owner: 'ai_team',
      notes: 'OpenAI-enhanced recommendation system - enabled for all users'
    }
  },
  {
    id: 'openai_user_analysis',
    name: 'OpenAI User Analysis',
    description: 'Analyze user preferences and patterns using OpenAI',
    enabled: true,
    rolloutPercentage: 100, // Enable for all users
    metadata: {
      experimentId: 'openai_user_analysis_2024',
      startDate: new Date(),
      owner: 'ai_team',
      notes: 'OpenAI-powered user preference analysis - enabled for all users'
    }
  },
  {
    id: 'skip-onboarding-flow',
    name: 'Skip Onboarding for Returning Users',
    description: 'Skip profile and waiver steps for users who completed onboarding',
    enabled: true,
    rolloutPercentage: 25, // Start with 25% of users
    userGroups: ['returning_users', 'power_users'],
    metadata: {
      experimentId: 'onboarding_optimization_2024',
      startDate: new Date(),
      owner: 'ux_team',
      notes: 'Skip onboarding flow for returning users to improve user experience'
    }
  }
];

export class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private allocations: Map<string, FeatureFlagAllocation[]> = new Map();
  private analyticsCallback?: (event: AnalyticsEvent) => void;

  constructor() {
    this.initializeFlags();
  }

  private initializeFlags(): void {
    DEFAULT_AI_FLAGS.forEach(flag => {
      this.flags.set(flag.id, { ...flag });
    });
  }

  // Core feature flag evaluation
  isEnabled = (flagId: string, user: UserProfile): boolean => {
    const flag = this.flags.get(flagId);
    if (!flag?.enabled) {
      return false;
    }

    // Check for user-specific override
    const userId = this.generateUserId(user);
    
    if (flag.overrides?.[userId]) {
      this.recordAllocation(user, flag, flag.overrides[userId], 'override');
      return flag.overrides[userId];
    }

    // Check user group targeting
    if (flag.userGroups && flag.userGroups.length > 0) {
      const userGroups = this.getUserGroups(user);
      const hasTargetGroup = flag.userGroups.some(group => userGroups.includes(group));
      if (!hasTargetGroup) {
        return false;
      }
    }

    // Percentage-based rollout using consistent hashing
    const isAllocated = this.isUserAllocated(user, flag);
    this.recordAllocation(user, flag, isAllocated, 'rollout');
    
    return isAllocated;
  }

  // Check multiple flags at once
  getEnabledFlags = (user: UserProfile, flagIds: string[]): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    flagIds.forEach(flagId => {
      result[flagId] = this.isEnabled(flagId, user);
    });
    
    return result;
  }

  // Get all AI-related flags for a user
  getAIFlags = (user: UserProfile): Record<string, boolean> => {
    const aiFlags = Array.from(this.flags.keys()).filter(id => id.startsWith('ai_') || id.startsWith('openai_'));
    
    const result = this.getEnabledFlags(user, aiFlags);
    
    return result;
  }

  // Administrative methods for managing flags
  updateFlag(flagId: string, updates: Partial<FeatureFlag>): boolean {
    const flag = this.flags.get(flagId);
    if (!flag) {
      return false;
    }

    const updatedFlag = { ...flag, ...updates };
    this.flags.set(flagId, updatedFlag);
    
    // Track flag changes
    this.trackEvent({
      type: 'flag_updated',
      flagId,
      data: { updates },
      timestamp: new Date()
    });

    return true;
  }

  // Gradually increase rollout percentage
  increaseRollout(flagId: string, newPercentage: number): boolean {
    const flag = this.flags.get(flagId);
    if (!flag || newPercentage < flag.rolloutPercentage || newPercentage > 100) {
      return false;
    }

    return this.updateFlag(flagId, { rolloutPercentage: newPercentage });
  }

  // Emergency rollback
  disableFlag(flagId: string): boolean {
    return this.updateFlag(flagId, { enabled: false, rolloutPercentage: 0 });
  }

  // Add user override (useful for testing)
  addUserOverride(flagId: string, userId: string, enabled: boolean): boolean {
    const flag = this.flags.get(flagId);
    if (!flag) {
      return false;
    }

    const overrides = { ...flag.overrides, [userId]: enabled };
    return this.updateFlag(flagId, { overrides });
  }

  // Analytics and monitoring
  getAnalytics(flagId: string): ABTestResults | null {
    const allocations = this.getAllocations(flagId);
    if (allocations.length === 0) {
      return null;
    }

    const controlUsers = allocations.filter(a => a.group === 'control').length;
    const treatmentUsers = allocations.filter(a => a.group === 'treatment').length;

    // In a real implementation, these metrics would come from actual usage data
    return {
      flagId,
      controlGroup: {
        users: controlUsers,
        conversionRate: 0.75, // Placeholder - would be calculated from real data
        avgResponseTime: 120,  // Placeholder
        userSatisfaction: 4.2  // Placeholder
      },
      treatmentGroup: {
        users: treatmentUsers,
        conversionRate: 0.82,  // Placeholder
        avgResponseTime: 95,   // Placeholder
        userSatisfaction: 4.6  // Placeholder
      },
      statisticalSignificance: 0.95,
      winner: treatmentUsers > 50 ? 'treatment' : undefined // Placeholder logic
    };
  }

  // Get allocation history for a user
  getUserAllocations(userId: string): FeatureFlagAllocation[] {
    const userAllocations: FeatureFlagAllocation[] = [];
    this.allocations.forEach(allocations => {
      userAllocations.push(...allocations.filter(a => a.userId === userId));
    });
    return userAllocations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Configuration export/import for different environments
  exportConfiguration(): Record<string, FeatureFlag> {
    const config: Record<string, FeatureFlag> = {};
    this.flags.forEach((flag, id) => {
      config[id] = { ...flag };
    });
    return config;
  }

  importConfiguration(config: Record<string, FeatureFlag>): void {
    Object.entries(config).forEach(([id, flag]) => {
      this.flags.set(id, { ...flag });
    });
  }

  // Set analytics callback for external tracking
  setAnalyticsCallback(callback: (event: AnalyticsEvent) => void): void {
    this.analyticsCallback = callback;
  }

  // Private helper methods
  private isUserAllocated = (user: UserProfile, flag: FeatureFlag): boolean => {
    // Consistent hashing based on user profile data and flag ID
    const userId = this.generateUserId(user);
    const hash = this.hashString(`${userId}:${flag.id}`);
    const percentage = (hash % 100) + 1; // 1-100
    return percentage <= flag.rolloutPercentage;
  }

  private generateUserId = (user: UserProfile): string => {
    // Generate a consistent user ID based on user profile data
    const fitnessLevel = user.fitnessLevel || 'unknown';
    const goals = user.goals?.join(',') || 'no-goals';
    const workoutStyle = user.preferences?.workoutStyle?.join(',') || 'no-style';
    const userData = `${fitnessLevel}-${goals}-${workoutStyle}`;
    const userId = this.hashString(userData).toString();
    
    return userId;
  }

  private hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getUserGroups = (user: UserProfile): string[] => {
    const groups: string[] = [];
    
    // Add groups based on user characteristics
    if (user.fitnessLevel) groups.push(`fitness_${user.fitnessLevel}`);
    if (user.preferences?.advancedFeatures) groups.push('power_users');
    if (user.workoutHistory?.estimatedCompletedWorkouts && user.workoutHistory.estimatedCompletedWorkouts > 50) {
      groups.push('experienced_users');
    }
    if (user.basicLimitations?.injuries && user.basicLimitations.injuries.length > 0) {
      groups.push('users_with_limitations');
    }
    
    return groups;
  }

  private recordAllocation = (
    user: UserProfile, 
    flag: FeatureFlag, 
    allocated: boolean, 
    reason: FeatureFlagAllocation['reason']
  ): void => {
    const userId = this.generateUserId(user);
    const allocation: FeatureFlagAllocation = {
      userId,
      flagId: flag.id,
      allocated,
      group: allocated ? 'treatment' : 'control',
      timestamp: new Date(),
      reason
    };

    if (!this.allocations.has(flag.id)) {
      this.allocations.set(flag.id, []);
    }
    
    // Check if we already have an allocation for this user and flag
    const existing = this.allocations.get(flag.id)!.find(a => a.userId === userId);
    if (!existing) {
      this.allocations.get(flag.id)!.push(allocation);
      
      // Track allocation event
      this.trackEvent({
        type: 'user_allocated',
        flagId: flag.id,
        data: { userId, allocated, group: allocation.group, reason },
        timestamp: new Date()
      });
    }
  }

  private getAllocations = (flagId: string): FeatureFlagAllocation[] => {
    return this.allocations.get(flagId) || [];
  }

  private trackEvent = (event: AnalyticsEvent): void => {
    if (this.analyticsCallback) {
      this.analyticsCallback(event);
    }
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('FeatureFlag Event:', event);
    }
  }
}

// Analytics event types
export interface AnalyticsEvent {
  type: 'flag_updated' | 'user_allocated' | 'flag_evaluated' | 'rollout_increased';
  flagId: string;
  data: Record<string, any>;
  timestamp: Date;
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();

// Export hook for React components
export const useFeatureFlags = () => {
  return {
    isEnabled: (flagId: string, user: UserProfile) => featureFlagService.isEnabled(flagId, user),
    getAIFlags: (user: UserProfile) => featureFlagService.getAIFlags(user),
    getAnalytics: (flagId: string) => featureFlagService.getAnalytics(flagId)
  };
}; 