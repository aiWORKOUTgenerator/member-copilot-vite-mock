// OpenAI Request Handler - Manages API communication
import { OpenAIConfig, OpenAIResponse, OpenAIMessage } from '../types/external-ai.types';
import { OPENAI_SERVICE_CONSTANTS } from '../constants/openai-service-constants';

export interface RequestOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  timeout?: number;
}

export interface StreamOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export class OpenAIRequestHandler {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
  }

  async executeRequest(
    messages: OpenAIMessage[],
    options: RequestOptions = {}
  ): Promise<OpenAIResponse> {
    const requestBody = this.buildRequestBody(messages, options);
    const timeout = options.timeout ?? OPENAI_SERVICE_CONSTANTS.DEFAULT_TIMEOUT_MS;
    
    return this.makeAPICall(requestBody, timeout);
  }

  async executeStreamRequest(
    messages: OpenAIMessage[],
    onChunk: (chunk: string) => void,
    options: StreamOptions = {}
  ): Promise<void> {
    const requestBody = this.buildRequestBody(messages, { ...options, stream: true });
    
    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await this.processStreamResponse(response, onChunk);
  }

  private buildRequestBody(
    messages: OpenAIMessage[],
    options: RequestOptions & { stream?: boolean } = {}
  ): Record<string, unknown> {
    return {
      model: options.model ?? this.config.model,
      messages,
      max_tokens: options.maxTokens ?? this.config.maxTokens,
      temperature: options.temperature ?? this.config.temperature,
      stream: options.stream ?? false
    };
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`
    };

    if (this.config.organizationId) {
      headers['OpenAI-Organization'] = this.config.organizationId;
    }

    return headers;
  }

  private async makeAPICall(
    requestBody: Record<string, unknown>,
    timeout: number
  ): Promise<OpenAIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`OpenAI API request timed out after ${timeout}ms`);
      controller.abort();
    }, timeout);

    try {
      console.log('Making OpenAI API request:', {
        url: `${this.config.baseURL}/chat/completions`,
        model: requestBody.model,
        maxTokens: requestBody.max_tokens,
        timeout: timeout
      });

      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('OpenAI API request successful');
      return result;
    } catch (error) {
      console.error('OpenAI API request failed:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async processStreamResponse(
    response: Response,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    const decoder = new TextDecoder();
    const buffer = '';

    try {
      await this.processStreamLoop(reader, decoder, buffer, onChunk);
    } finally {
      reader.releaseLock();
    }
  }

  private async processStreamLoop(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder,
    initialBuffer: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    let buffer = initialBuffer;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (this.shouldProcessStreamLine(line)) {
          const content = this.extractContentFromStreamLine(line);
          if (content) {
            onChunk(content);
          }
        }
      }
    }
  }

  private shouldProcessStreamLine(line: string): boolean {
    return line.startsWith(OPENAI_SERVICE_CONSTANTS.STREAM_DATA_PREFIX);
  }

  private extractContentFromStreamLine(line: string): string | null {
    const data = line.slice(OPENAI_SERVICE_CONSTANTS.STREAM_DATA_PREFIX.length);
    if (data === OPENAI_SERVICE_CONSTANTS.STREAM_DONE_MARKER) {
      return null;
    }

    try {
      const parsed = JSON.parse(data);
      return parsed.choices?.[0]?.delta?.content ?? null;
    } catch {
      // Ignore parsing errors for streaming
      return null;
    }
  }
} 