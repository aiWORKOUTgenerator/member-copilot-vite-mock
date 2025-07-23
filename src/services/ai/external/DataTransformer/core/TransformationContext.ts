export class TransformationContext {
  private state: Map<string, any>;
  private errors: string[];

  constructor() {
    this.state = new Map();
    this.errors = [];
  }

  setState(key: string, value: any): void {
    this.state.set(key, value);
  }

  getState(key: string): any {
    return this.state.get(key);
  }

  addError(error: string): void {
    this.errors.push(error);
  }

  getErrors(): string[] {
    return [...this.errors];
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  clear(): void {
    this.state.clear();
    this.errors = [];
  }

  getFullState(): Record<string, any> {
    return Object.fromEntries(this.state);
  }
} 