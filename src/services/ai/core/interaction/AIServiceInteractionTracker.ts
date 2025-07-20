import { AIServiceComponent } from '../utils/AIServiceBase';
import { AIInteraction, InteractionStats } from '../types/AIServiceTypes';

/**
 * Manages AI service interaction tracking and session history
 * Provides analytics and statistics for user interactions
 */
export class AIServiceInteractionTracker extends AIServiceComponent {
  private sessionHistory: AIInteraction[] = [];
  private maxHistorySize: number = 1000;
  private stats: InteractionStats = {
    totalInteractions: 0,
    interactionsByType: {},
    averageResponseTime: 0,
    userSatisfactionRate: 0
  };

  constructor(maxHistorySize: number = 1000) {
    super('AIServiceInteractionTracker');
    this.maxHistorySize = maxHistorySize;
    this.log('info', 'Interaction tracker initialized', { maxHistorySize });
  }

  /**
   * Record a new interaction in the session history
   */
  recordInteraction(interaction: AIInteraction): void {
    try {
      this.validateRequired(interaction, 'interaction');
      this.validateRequired(interaction.id, 'interaction.id');
      this.validateRequired(interaction.timestamp, 'interaction.timestamp');
      this.validateRequired(interaction.component, 'interaction.component');
      this.validateRequired(interaction.action, 'interaction.action');

      // Add to session history
      this.sessionHistory.push(interaction);
      
      // Update statistics
      this.updateStats(interaction);
      
      // Limit session history size
      this.limitSessionHistory();
      
      this.log('debug', 'Interaction recorded', {
        id: interaction.id,
        component: interaction.component,
        action: interaction.action,
        historySize: this.sessionHistory.length
      });
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), 'Failed to record interaction', { interaction });
      // Re-throw validation errors so tests can catch them
      throw error;
    }
  }

  /**
   * Get the current session history
   */
  getSessionHistory(): AIInteraction[] {
    return [...this.sessionHistory]; // Return a copy to prevent external modification
  }

  /**
   * Clear the session history
   */
  clearSessionHistory(): void {
    this.sessionHistory = [];
    this.resetStats();
    this.log('info', 'Session history cleared');
  }

  /**
   * Get interaction statistics
   */
  getInteractionStats(): InteractionStats {
    return { ...this.stats }; // Return a copy to prevent external modification
  }

  /**
   * Get interactions by type
   */
  getInteractionsByType(type: string): AIInteraction[] {
    return this.sessionHistory.filter(interaction => interaction.action === type);
  }

  /**
   * Get recent interactions (last N interactions)
   */
  getRecentInteractions(count: number = 10): AIInteraction[] {
    return this.sessionHistory.slice(-count);
  }

  /**
   * Get interactions within a time range
   */
  getInteractionsInTimeRange(startTime: Date, endTime: Date): AIInteraction[] {
    return this.sessionHistory.filter(interaction => 
      interaction.timestamp >= startTime && interaction.timestamp <= endTime
    );
  }

  /**
   * Get user feedback statistics
   */
  getUserFeedbackStats(): {
    totalFeedback: number;
    helpful: number;
    notHelpful: number;
    partiallyHelpful: number;
    satisfactionRate: number;
  } {
    const feedbackInteractions = this.sessionHistory.filter(
      interaction => interaction.userFeedback
    );

    const helpful = feedbackInteractions.filter(
      interaction => interaction.userFeedback === 'helpful'
    ).length;
    
    const notHelpful = feedbackInteractions.filter(
      interaction => interaction.userFeedback === 'not_helpful'
    ).length;
    
    const partiallyHelpful = feedbackInteractions.filter(
      interaction => interaction.userFeedback === 'partially_helpful'
    ).length;

    const totalFeedback = feedbackInteractions.length;
    const satisfactionRate = totalFeedback > 0 
      ? (helpful + (partiallyHelpful * 0.5)) / totalFeedback 
      : 0;

    return {
      totalFeedback,
      helpful,
      notHelpful,
      partiallyHelpful,
      satisfactionRate
    };
  }

  /**
   * Get performance metrics from interactions
   */
  getPerformanceMetrics(): {
    averageExecutionTime: number;
    averageMemoryUsage: number;
    cacheHitRate: number;
    errorRate: number;
  } {
    const performanceInteractions = this.sessionHistory.filter(
      interaction => interaction.performanceMetrics
    );

    if (performanceInteractions.length === 0) {
      return {
        averageExecutionTime: 0,
        averageMemoryUsage: 0,
        cacheHitRate: 0,
        errorRate: 0
      };
    }

    const totalExecutionTime = performanceInteractions.reduce(
      (sum, interaction) => sum + (interaction.performanceMetrics?.executionTime || 0), 0
    );
    
    const totalMemoryUsage = performanceInteractions.reduce(
      (sum, interaction) => sum + (interaction.performanceMetrics?.memoryUsage || 0), 0
    );
    
    const cacheHits = performanceInteractions.filter(
      interaction => interaction.performanceMetrics?.cacheHit
    ).length;
    
    const errors = this.sessionHistory.filter(
      interaction => interaction.action === 'error_occurred'
    ).length;

    return {
      averageExecutionTime: totalExecutionTime / performanceInteractions.length,
      averageMemoryUsage: totalMemoryUsage / performanceInteractions.length,
      cacheHitRate: cacheHits / performanceInteractions.length,
      errorRate: errors / this.sessionHistory.length
    };
  }

  /**
   * Export session data for analytics
   */
  exportSessionData(): {
    sessionId: string;
    startTime: Date;
    endTime: Date;
    totalInteractions: number;
    stats: InteractionStats;
    performanceMetrics: ReturnType<typeof this.getPerformanceMetrics>;
    userFeedback: ReturnType<typeof this.getUserFeedbackStats>;
    interactions: AIInteraction[];
  } {
    if (this.sessionHistory.length === 0) {
      throw new Error('No session data to export');
    }

    const startTime = this.sessionHistory[0].timestamp;
    const endTime = this.sessionHistory[this.sessionHistory.length - 1].timestamp;
    const sessionId = this.generateId();

    return {
      sessionId,
      startTime,
      endTime,
      totalInteractions: this.sessionHistory.length,
      stats: this.getInteractionStats(),
      performanceMetrics: this.getPerformanceMetrics(),
      userFeedback: this.getUserFeedbackStats(),
      interactions: this.getSessionHistory()
    };
  }

  /**
   * Limit session history size to prevent memory issues
   */
  private limitSessionHistory(): void {
    if (this.sessionHistory.length > this.maxHistorySize) {
      // Keep only the most recent interactions
      const keepCount = Math.floor(this.maxHistorySize * 0.5); // Keep 50% of max size
      this.sessionHistory = this.sessionHistory.slice(-keepCount);
      
      this.log('info', 'Session history limited', {
        newSize: this.sessionHistory.length,
        maxSize: this.maxHistorySize,
        removedCount: this.maxHistorySize - keepCount
      });
    }
  }

  /**
   * Update statistics based on new interaction
   */
  private updateStats(interaction: AIInteraction): void {
    // Update total interactions
    this.stats.totalInteractions++;

    // Update interactions by type
    const actionType = interaction.action;
    this.stats.interactionsByType[actionType] = (this.stats.interactionsByType[actionType] || 0) + 1;

    // Update average response time
    if (interaction.performanceMetrics?.executionTime) {
      const currentTotal = this.stats.averageResponseTime * (this.stats.totalInteractions - 1);
      this.stats.averageResponseTime = (currentTotal + interaction.performanceMetrics.executionTime) / this.stats.totalInteractions;
    }

    // Update user satisfaction rate
    if (interaction.userFeedback) {
      const feedbackStats = this.getUserFeedbackStats();
      this.stats.userSatisfactionRate = feedbackStats.satisfactionRate;
    }
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      totalInteractions: 0,
      interactionsByType: {},
      averageResponseTime: 0,
      userSatisfactionRate: 0
    };
  }
} 