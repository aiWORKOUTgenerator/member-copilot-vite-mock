import { OpenAIService } from '../OpenAIService';
import { OpenAIConfig, OpenAIMessage, OpenAIResponse, ExternalAIError } from '../types/external-ai.types';

// Mock the config module
jest.mock('../config/openai.config');

describe('OpenAIService', () => {
  let service: OpenAIService;
  const mockConfig: OpenAIConfig = {
    apiKey: 'test-key',
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7
  };

  beforeEach(() => {
    service = new OpenAIService(mockConfig);
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should initialize with provided config', () => {
    expect(service).toBeDefined();
  });

  it('should handle makeRequest correctly', async () => {
    const messages: OpenAIMessage[] = [
      { role: 'user', content: 'Test message' }
    ];

    const mockResponse: OpenAIResponse = {
      choices: [
        {
          message: { role: 'assistant', content: 'Test response' },
          finish_reason: 'stop',
          index: 0
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      },
      model: 'gpt-4',
      created: Date.now()
    };

    // Mock the request handler's executeRequest method
    const mockExecuteRequest = jest.spyOn(
      service['requestHandler'],
      'executeRequest'
    ).mockImplementation(() => Promise.resolve(mockResponse));

    const result = await service.makeRequest(messages);

    expect(mockExecuteRequest).toHaveBeenCalledWith(messages, expect.any(Object));
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors correctly', async () => {
    const messages: OpenAIMessage[] = [
      { role: 'user', content: 'Test message' }
    ];

    const testError = new Error('Test error');
    const transformedError: ExternalAIError = {
      type: 'api_error',
      message: 'Test error',
      details: testError
    };

    // Mock the request handler to throw an error
    jest.spyOn(service['requestHandler'], 'executeRequest')
      .mockImplementation(() => Promise.reject(testError));

    // Mock the error handler
    const mockHandleError = jest.spyOn(service['errorHandler'], 'handleError')
      .mockImplementation(() => {});

    // Mock createExternalAIError
    jest.spyOn(service['errorHandler'], 'createExternalAIError')
      .mockImplementation(() => transformedError);

    await expect(service.makeRequest(messages)).rejects.toEqual(transformedError);
    expect(mockHandleError).toHaveBeenCalledWith(testError);
  });

  it('should use cache when available', async () => {
    const messages: OpenAIMessage[] = [
      { role: 'user', content: 'Test message' }
    ];
    const cacheKey = 'test-cache-key';

    const mockResponse: OpenAIResponse = {
      choices: [
        {
          message: { role: 'assistant', content: 'Cached response' },
          finish_reason: 'stop',
          index: 0
        }
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      },
      model: 'gpt-4',
      created: Date.now()
    };

    // Mock cache hit
    jest.spyOn(service['cacheManager'], 'getCachedResponse')
      .mockImplementation(() => mockResponse);

    // Mock request handler to verify it's not called
    const mockExecuteRequest = jest.spyOn(
      service['requestHandler'],
      'executeRequest'
    ).mockImplementation(() => Promise.resolve(mockResponse));

    const result = await service.makeRequest(messages, { cacheKey });

    expect(result).toEqual(mockResponse);
    expect(mockExecuteRequest).not.toHaveBeenCalled();
  });
}); 