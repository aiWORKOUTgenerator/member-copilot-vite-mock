import { OpenAIService } from '../OpenAIService';
import { 
  OpenAIConfig, 
  OpenAIMessage, 
  OpenAIResponse, 
  PromptTemplate 
} from '../types/external-ai.types';

// Mock the config module
jest.mock('../config/openai.config');

describe('OpenAIService Integration', () => {
  let service: OpenAIService;
  const config: OpenAIConfig = {
    apiKey: 'test-key',
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    baseURL: 'https://api.openai.com/v1'
  };

  beforeEach(() => {
    service = new OpenAIService(config);
  });

  it('should handle makeRequest with caching', async () => {
    const messages: OpenAIMessage[] = [
      { role: 'user', content: 'Test message' }
    ];
    const cacheKey = 'test-cache-key';

    // First request - should fail with invalid API key
    await expect(service.makeRequest(messages, { cacheKey }))
      .rejects
      .toMatchObject({
        type: 'authentication',
        message: expect.stringContaining('API key')
      });
  });

  it('should handle generateFromTemplate', async () => {
    const template: PromptTemplate = {
      id: 'test-template',
      name: 'Test Template',
      description: 'Test template for integration testing',
      template: 'Hello {{name}}, how are you feeling about {{activity}}?',
      variables: [
        {
          name: 'name',
          type: 'string',
          description: 'User name',
          required: true
        },
        {
          name: 'activity',
          type: 'string',
          description: 'Activity name',
          required: true
        }
      ],
      examples: [],
      version: '1.0'
    };

    const variables = {
      name: 'John',
      activity: 'running'
    };

    // Should fail with invalid API key
    await expect(service.generateFromTemplate(template, variables))
      .rejects
      .toMatchObject({
        type: 'authentication',
        message: expect.stringContaining('API key')
      });
  });

  it('should handle errors gracefully', async () => {
    const messages: OpenAIMessage[] = [
      { role: 'user', content: 'Test message' }
    ];

    // Invalid API key should throw an error
    const invalidService = new OpenAIService({
      ...config,
      apiKey: 'invalid-key'
    });

    await expect(invalidService.makeRequest(messages))
      .rejects
      .toMatchObject({
        type: 'authentication',
        message: expect.stringContaining('API key')
      });
  });

  it('should handle rate limiting', async () => {
    const messages: OpenAIMessage[] = [
      { role: 'user', content: 'Test message' }
    ];

    // Make multiple requests in quick succession
    const requests = Array.from({ length: 5 }, () => 
      service.makeRequest(messages)
    );

    const results = await Promise.allSettled(requests);
    
    // All requests should fail with invalid API key
    expect(results.every(r => r.status === 'rejected')).toBe(true);
    
    // All errors should be authentication errors
    const rejectedResults = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
    rejectedResults.forEach(result => {
      expect(result.reason).toMatchObject({
        type: 'authentication',
        message: expect.stringContaining('API key')
      });
    });
  });

  it('should track metrics correctly', async () => {
    const messages: OpenAIMessage[] = [
      { role: 'user', content: 'Test message' }
    ];

    // Make a few requests that will fail with invalid API key
    const requests = [
      service.makeRequest(messages).catch(() => {}),
      service.makeRequest(messages).catch(() => {}),
      service.makeRequest(messages).catch(() => {})
    ];

    // Wait for all requests to complete
    await Promise.all(requests);

    // Wait for error handling to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const metrics = service.getMetrics();
    expect(metrics).toMatchObject({
      requestCount: expect.any(Number),
      averageResponseTime: expect.any(Number),
      errorRate: expect.any(Number),
      tokenUsage: {
        prompt: expect.any(Number),
        completion: expect.any(Number),
        total: expect.any(Number)
      },
      costEstimate: expect.any(Number),
      cacheHitRate: expect.any(Number)
    });

    expect(metrics.requestCount).toBeGreaterThanOrEqual(3);
    expect(metrics.errorRate).toBe(1); // All requests should fail
  });
}); 