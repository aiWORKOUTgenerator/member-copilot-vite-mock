import { AIServiceComponent } from '../utils/AIServiceBase';
import { AIInteraction, LearningMetrics } from '../types/AIServiceTypes';

/**
 * Manages AI learning from user interactions and feedback
 * Optimizes recommendation weights and learns from user preferences
 */
export class AIServiceLearningEngine extends AIServiceComponent {
  private learningData: {
    recommendationWeights: Map<string, number>;
    userPreferences: Map<string, any>;
    feedbackHistory: Array<{
      timestamp: Date;
      recommendationId: string;
      feedback: 'helpful' | 'not_helpful' | 'partially_helpful';
      context: any;
    }>;
  };

  private metrics: LearningMetrics = {
    totalLearningEvents: 0,
    positiveFeedbackCount: 0,
    negativeFeedbackCount: 0,
    recommendationImprovementRate: 0,
    lastLearningUpdate: new Date()
  };

  constructor() {
    super('AIServiceLearningEngine');
    this.learningData = {
      recommendationWeights: new Map(),
      userPreferences: new Map(),
      feedbackHistory: []
    };
    this.log('info', 'Learning engine initialized');
  }

  /**
   * Update recommendation weights based on user interaction
   */
  updateRecommendationWeights(interaction: AIInteraction): void {
    try {
      this.validateRequired(interaction, 'interaction');
      
      if (!interaction.userFeedback || !interaction.recommendationId) {
        return; // No learning data available
      }

      const recommendationId = interaction.recommendationId;
      const feedback = interaction.userFeedback;
      
      // Get current weight or initialize
      const currentWeight = this.learningData.recommendationWeights.get(recommendationId) || 1.0;
      
      // Update weight based on feedback
      let newWeight = currentWeight;
      const learningRate = 0.1; // Configurable learning rate
      
      switch (feedback) {
        case 'helpful':
          newWeight = Math.min(currentWeight + learningRate, 2.0); // Cap at 2.0
          this.metrics.positiveFeedbackCount++;
          this.log('debug', 'Learning: User found recommendation helpful', {
            recommendationId,
            oldWeight: currentWeight,
            newWeight,
            feedback
          });
          break;
          
        case 'not_helpful':
          newWeight = Math.max(currentWeight - learningRate, 0.1); // Floor at 0.1
          this.metrics.negativeFeedbackCount++;
          this.log('debug', 'Learning: User found recommendation not helpful', {
            recommendationId,
            oldWeight: currentWeight,
            newWeight,
            feedback
          });
          break;
          
        case 'partially_helpful':
          newWeight = currentWeight + (learningRate * 0.5); // Smaller positive adjustment
          this.metrics.positiveFeedbackCount += 0.5;
          this.log('debug', 'Learning: User found recommendation partially helpful', {
            recommendationId,
            oldWeight: currentWeight,
            newWeight,
            feedback
          });
          break;
      }
      
      // Update the weight
      this.learningData.recommendationWeights.set(recommendationId, newWeight);
      
      // Record feedback history
      this.learningData.feedbackHistory.push({
        timestamp: interaction.timestamp,
        recommendationId,
        feedback,
        context: {
          component: interaction.component,
          action: interaction.action
        }
      });
      
      // Update metrics
      this.metrics.totalLearningEvents++;
      this.metrics.lastLearningUpdate = new Date();
      this.updateImprovementRate();
      
      this.log('info', 'Recommendation weights updated', {
        recommendationId,
        feedback,
        weightChange: newWeight - currentWeight,
        totalLearningEvents: this.metrics.totalLearningEvents
      });
      
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to update recommendation weights', { interaction });
    }
  }

  /**
   * Learn from user feedback with additional context
   */
  learnFromUserFeedback(
    feedback: 'helpful' | 'not_helpful' | 'partially_helpful',
    context: {
      recommendationId?: string;
      component?: string;
      userProfile?: any;
      selections?: any;
    }
  ): void {
    // Validate input first - these errors should be thrown directly
    this.validateRequired(feedback, 'feedback');
    this.validateEnum(feedback, ['helpful', 'not_helpful', 'partially_helpful'], 'feedback');
    
    try {
      // Create a synthetic interaction for learning
      const interaction: AIInteraction = {
        id: this.generateId(),
        timestamp: new Date(),
        component: context.component || 'unknown',
        action: 'recommendation_shown',
        recommendationId: context.recommendationId,
        userFeedback: feedback
      };
      
      this.updateRecommendationWeights(interaction);
      
      // Update user preferences based on context
      if (context.userProfile) {
        this.updateUserPreferences(context.userProfile, feedback);
      }
      
      this.log('info', 'Learned from user feedback', {
        feedback,
        context: context.component,
        totalLearningEvents: this.metrics.totalLearningEvents
      });
      
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to learn from user feedback', { feedback, context });
    }
  }

  /**
   * Get learning metrics
   */
  getLearningMetrics(): LearningMetrics {
    return { ...this.metrics }; // Return a copy to prevent external modification
  }

  /**
   * Get recommendation weight for a specific recommendation
   */
  getRecommendationWeight(recommendationId: string): number {
    return this.learningData.recommendationWeights.get(recommendationId) || 1.0;
  }

  /**
   * Get all recommendation weights
   */
  getAllRecommendationWeights(): Map<string, number> {
    return new Map(this.learningData.recommendationWeights); // Return a copy
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): Map<string, any> {
    return new Map(this.learningData.userPreferences); // Return a copy
  }

  /**
   * Get feedback history
   */
  getFeedbackHistory(): Array<{
    timestamp: Date;
    recommendationId: string;
    feedback: 'helpful' | 'not_helpful' | 'partially_helpful';
    context: any;
  }> {
    return [...this.learningData.feedbackHistory]; // Return a copy
  }

  /**
   * Get learning insights for recommendations
   */
  getLearningInsights(): {
    topPerformingRecommendations: Array<{ id: string; weight: number; feedback: number }>;
    needsImprovement: Array<{ id: string; weight: number; feedback: number }>;
    overallSatisfaction: number;
    learningTrend: 'improving' | 'declining' | 'stable';
  } {
    const recommendations = Array.from(this.learningData.recommendationWeights.entries())
      .map(([id, weight]) => {
        const feedback = this.getFeedbackCountForRecommendation(id);
        return { id, weight, feedback };
      })
      .sort((a, b) => b.weight - a.weight);

    const topPerforming = recommendations.slice(0, 5);
    const needsImprovement = recommendations
      .filter(r => r.weight < 1.0 && r.feedback > 0)
      .slice(0, 5);

    const overallSatisfaction = this.metrics.positiveFeedbackCount / 
      Math.max(this.metrics.totalLearningEvents, 1);

    const learningTrend = this.calculateLearningTrend();

    return {
      topPerformingRecommendations: topPerforming,
      needsImprovement,
      overallSatisfaction,
      learningTrend
    };
  }

  /**
   * Reset learning data
   */
  resetLearningData(): void {
    this.learningData = {
      recommendationWeights: new Map(),
      userPreferences: new Map(),
      feedbackHistory: []
    };
    
    this.metrics = {
      totalLearningEvents: 0,
      positiveFeedbackCount: 0,
      negativeFeedbackCount: 0,
      recommendationImprovementRate: 0,
      lastLearningUpdate: new Date()
    };
    
    this.log('info', 'Learning data reset');
  }

  /**
   * Export learning data for analysis
   */
  exportLearningData(): {
    metrics: LearningMetrics;
    recommendationWeights: Record<string, number>;
    userPreferences: Record<string, any>;
    feedbackHistory: Array<{
      timestamp: Date;
      recommendationId: string;
      feedback: 'helpful' | 'not_helpful' | 'partially_helpful';
      context: any;
    }>;
    insights: ReturnType<typeof this.getLearningInsights>;
  } {
    return {
      metrics: this.getLearningMetrics(),
      recommendationWeights: Object.fromEntries(this.learningData.recommendationWeights),
      userPreferences: Object.fromEntries(this.learningData.userPreferences),
      feedbackHistory: this.getFeedbackHistory(),
      insights: this.getLearningInsights()
    };
  }

  /**
   * Update user preferences based on feedback
   */
  private updateUserPreferences(userProfile: any, feedback: 'helpful' | 'not_helpful' | 'partially_helpful'): void {
    try {
      // Extract key preferences from user profile
      const keyPreferences = {
        fitnessLevel: userProfile.fitnessLevel,
        goals: userProfile.goals,
        experience: userProfile.experience,
        preferences: userProfile.preferences
      };
      
      // Store preferences with feedback context
      const preferenceKey = JSON.stringify(keyPreferences);
      const currentPreference = this.learningData.userPreferences.get(preferenceKey) || {
        helpful: 0,
        notHelpful: 0,
        partiallyHelpful: 0,
        total: 0
      };
      
      currentPreference[feedback]++;
      currentPreference.total++;
      
      this.learningData.userPreferences.set(preferenceKey, currentPreference);
      
      this.log('debug', 'User preferences updated', {
        preferenceKey,
        feedback,
        totalPreferences: this.learningData.userPreferences.size
      });
      
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to update user preferences', { userProfile, feedback });
    }
  }

  /**
   * Get feedback count for a specific recommendation
   */
  private getFeedbackCountForRecommendation(recommendationId: string): number {
    return this.learningData.feedbackHistory.filter(
      feedback => feedback.recommendationId === recommendationId
    ).length;
  }

  /**
   * Update improvement rate based on recent feedback
   */
  private updateImprovementRate(): void {
    const recentFeedback = this.learningData.feedbackHistory
      .filter(feedback => {
        const age = Date.now() - feedback.timestamp.getTime();
        return age < 24 * 60 * 60 * 1000; // Last 24 hours
      });
    
    if (recentFeedback.length === 0) {
      this.metrics.recommendationImprovementRate = 0;
      return;
    }
    
    const positiveFeedback = recentFeedback.filter(f => 
      f.feedback === 'helpful' || f.feedback === 'partially_helpful'
    ).length;
    
    this.metrics.recommendationImprovementRate = positiveFeedback / recentFeedback.length;
  }

  /**
   * Calculate learning trend based on recent activity
   */
  private calculateLearningTrend(): 'improving' | 'declining' | 'stable' {
    const recentFeedback = this.learningData.feedbackHistory
      .filter(feedback => {
        const age = Date.now() - feedback.timestamp.getTime();
        return age < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      });
    
    if (recentFeedback.length < 5) {
      return 'stable'; // Not enough data
    }
    
    const positiveFeedback = recentFeedback.filter(f => 
      f.feedback === 'helpful' || f.feedback === 'partially_helpful'
    ).length;
    
    const satisfactionRate = positiveFeedback / recentFeedback.length;
    
    if (satisfactionRate > 0.7) return 'improving';
    if (satisfactionRate < 0.3) return 'declining';
    return 'stable';
  }
} 