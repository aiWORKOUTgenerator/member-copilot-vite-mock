import { TransformationContext } from './TransformationContext';

export abstract class DataTransformerBase<InputType, OutputType> {
  protected context: TransformationContext;
  protected debugMode: boolean;

  constructor(debugMode = false) {
    this.debugMode = debugMode;
    this.context = new TransformationContext();
  }

  abstract transform(input: InputType): OutputType;

  protected log(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[DataTransformer] ${message}`, data || '');
    }
  }

  protected validateInput(input: InputType): boolean {
    if (!input) {
      this.log('Invalid input: Input is null or undefined');
      return false;
    }
    return true;
  }

  protected handleError(error: Error): never {
    this.log('Transformation error:', error);
    throw error;
  }

  public getContext(): TransformationContext {
    return this.context;
  }
} 