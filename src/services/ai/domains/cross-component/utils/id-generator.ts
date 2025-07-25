export class IdGenerator {
  static generateConflictId(type: string): string {
    return `conflict_${type}_${this.generateUniqueId()}`;
  }

  static generateSynergyId(type: string): string {
    return `synergy_${type}_${this.generateUniqueId()}`;
  }

  static generateInsightId(type: string): string {
    return `cross_component_${type}_${this.generateUniqueId()}`;
  }

  private static generateUniqueId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
} 