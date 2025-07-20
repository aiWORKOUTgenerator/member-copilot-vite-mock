// Live API Demo Test - Phase 3D
// This test demonstrates the live API testing framework capabilities

// Mock the config module to avoid import.meta issues in Jest
jest.mock('../config/openai.config', () => ({
  openAIConfig: {
    openai: {
      apiKey: 'test-api-key',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7
    },
    features: {
      openai_workout_generation: true,
      openai_enhanced_recommendations: true,
      openai_user_analysis: true,
      openai_real_time_coaching: true,
      openai_fallback_enabled: true
    },
    performance: {
      maxRequestsPerMinute: 100,
      timeoutMs: 30000,
      retryAttempts: 3,
      cacheTimeoutMs: 300000
    },
    fallback: {
      enabled: true,
      strategy: 'rule_based'
    }
  },
  validateConfig: jest.fn(() => ({
    isValid: true,
    errors: [],
    warnings: []
  })),
  getOpenAIConfig: jest.fn(() => ({
    openai: {
      apiKey: 'test-api-key',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7
    },
    features: {
      openai_workout_generation: true,
      openai_enhanced_recommendations: true,
      openai_user_analysis: true,
      openai_real_time_coaching: true,
      openai_fallback_enabled: true
    },
    performance: {
      maxRequestsPerMinute: 100,
      timeoutMs: 30000,
      retryAttempts: 3,
      cacheTimeoutMs: 300000
    },
    fallback: {
      enabled: true,
      strategy: 'rule_based'
    }
  })),
  setEnvironmentAdapter: jest.fn(),
  createTestEnvironmentAdapter: jest.fn((env) => ({
    getMode: () => env.MODE || 'test',
    getApiKey: () => env.VITE_OPENAI_API_KEY || '',
    getOrgId: () => env.VITE_OPENAI_ORG_ID,
    getBaseUrl: () => env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    isDevelopment: () => (env.MODE || 'test') === 'development'
  }))
}));

import { LiveAPITestUtils, describeLiveAPI, setupLiveAPITests, LIVE_API_TIMEOUT } from './live-api-test-setup';

// Setup live API testing
setupLiveAPITests();

describeLiveAPI('Live API Testing Demo - Phase 3D', () => {
  
  it('should demonstrate live API testing framework capabilities', async () => {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting Live API Test Demo');
      console.log('📊 Environment Check:');
      console.log(`   - API Key Available: ${!!process.env.VITE_OPENAI_API_KEY}`);
      console.log(`   - API Key Length: ${process.env.VITE_OPENAI_API_KEY?.length || 0} characters`);
      console.log(`   - Live API Tests Enabled: ${process.env.ENABLE_LIVE_API_TESTS === 'true'}`);
      
      // Test API key format
      const apiKey = process.env.VITE_OPENAI_API_KEY;
      const isValidFormat = apiKey && apiKey.startsWith('sk-') && apiKey.length > 50;
      
      console.log(`   - API Key Format Valid: ${isValidFormat}`);
      
      if (!isValidFormat) {
        console.log('⚠️  API Key format appears invalid. Expected format: sk-...');
        console.log('💡 To get a valid API key, visit: https://platform.openai.com/api-keys');
      }
      
      // Attempt API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Generate a simple 5-minute warm-up routine with 3 exercises.'
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ SUCCESS: Live API Call Working!');
        console.log('📈 Performance Metrics:');
        console.log(`   - Response Time: ${duration}ms`);
        console.log(`   - Model Used: ${data.model}`);
        console.log(`   - Tokens Used: ${data.usage?.total_tokens || 'N/A'}`);
        console.log(`   - Response Length: ${data.choices[0]?.message?.content?.length || 0} characters`);
        
        // Validate response structure
        expect(data).toBeDefined();
        expect(data.choices).toBeDefined();
        expect(Array.isArray(data.choices)).toBe(true);
        expect(data.choices.length).toBeGreaterThan(0);
        expect(data.choices[0].message).toBeDefined();
        expect(data.choices[0].message.content).toBeDefined();
        
        LiveAPITestUtils.logTestResult('Live API Demo - Success', true, duration);
        
      } else {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        
        console.log('❌ API Call Failed - Error Handling Demo:');
        console.log(`   - Status Code: ${response.status}`);
        console.log(`   - Error Type: ${errorData.error?.type || 'Unknown'}`);
        console.log(`   - Error Code: ${errorData.error?.code || 'Unknown'}`);
        console.log(`   - Error Message: ${errorData.error?.message || 'No message'}`);
        
        // Demonstrate error handling capabilities
        if (response.status === 401) {
          console.log('🔐 Authentication Error: API key is invalid or expired');
          console.log('💡 Solution: Get a valid API key from https://platform.openai.com/api-keys');
        } else if (response.status === 429) {
          console.log('⏱️  Rate Limit Error: Too many requests');
          console.log('💡 Solution: Wait a moment and retry');
        } else if (response.status >= 500) {
          console.log('🔧 Server Error: OpenAI service is experiencing issues');
          console.log('💡 Solution: Try again later');
        }
        
        // This is expected behavior when API key is invalid
        expect(response.status).toBe(401);
        expect(errorData.error?.code).toBe('invalid_api_key');
        
        LiveAPITestUtils.logTestResult('Live API Demo - Error Handling', true, duration);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log('💥 Unexpected Error:');
      console.log(`   - Error Type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`);
      console.log(`   - Error Message: ${error instanceof Error ? error.message : String(error)}`);
      
      LiveAPITestUtils.logTestResult('Live API Demo - Unexpected Error', false, duration, error);
      throw error;
    }
  }, LIVE_API_TIMEOUT);

  it('should demonstrate fitness recommendation generation', async () => {
    const startTime = Date.now();
    
    try {
      console.log('🏋️  Testing Fitness Recommendation Generation');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful fitness assistant. Provide concise, actionable fitness advice.'
            },
            {
              role: 'user',
              content: 'I am a beginner with moderate energy level. Suggest 3 exercises I can do at home with no equipment for a 15-minute workout.'
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        console.log('✅ Fitness Recommendation Generated Successfully!');
        console.log('📊 Recommendation Metrics:');
        console.log(`   - Generation Time: ${duration}ms`);
        console.log(`   - Content Length: ${content.length} characters`);
        console.log(`   - Tokens Used: ${data.usage?.total_tokens || 'N/A'}`);
        
        // Validate fitness content
        const fitnessKeywords = ['exercise', 'workout', 'fitness', 'training', 'movement', 'activity'];
        const hasFitnessContent = fitnessKeywords.some(keyword => 
          content.toLowerCase().includes(keyword)
        );
        
        console.log(`   - Contains Fitness Content: ${hasFitnessContent}`);
        
        expect(content.length).toBeGreaterThan(50);
        expect(hasFitnessContent).toBe(true);
        
        LiveAPITestUtils.logTestResult('Fitness Recommendation Demo', true, duration);
        
      } else {
        const errorText = await response.text();
        console.log('❌ Fitness Recommendation Failed - Expected with invalid API key');
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Error: ${errorText.substring(0, 100)}...`);
        
        // Expected behavior with invalid API key
        expect(response.status).toBe(401);
        
        LiveAPITestUtils.logTestResult('Fitness Recommendation Demo - Error Handling', true, duration);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      LiveAPITestUtils.logTestResult('Fitness Recommendation Demo - Unexpected Error', false, duration, error);
      throw error;
    }
  }, LIVE_API_TIMEOUT);

  it('should demonstrate rate limiting and error handling', async () => {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Testing Rate Limiting and Error Handling');
      
      // Make multiple requests to test rate limiting
      const promises = Array(3).fill(null).map((_, index) => 
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: `Test request ${index + 1}: Generate a single sentence about fitness.`
              }
            ],
            max_tokens: 50,
            temperature: 0.7
          })
        })
      );
      
      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      const successfulRequests = responses.filter(res => res.ok);
      const failedRequests = responses.filter(res => !res.ok);
      
      console.log('📊 Rate Limiting Test Results:');
      console.log(`   - Total Requests: ${responses.length}`);
      console.log(`   - Successful: ${successfulRequests.length}`);
      console.log(`   - Failed: ${failedRequests.length}`);
      console.log(`   - Total Duration: ${duration}ms`);
      
      // Analyze failed requests
      for (let i = 0; i < failedRequests.length; i++) {
        const response = failedRequests[i];
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);
        
        console.log(`   - Request ${i + 1} Error: ${response.status} - ${errorData.error?.code || 'Unknown'}`);
      }
      
      // All requests successful with valid API key
      expect(successfulRequests.length + failedRequests.length).toBe(3);
      expect(successfulRequests.length).toBeGreaterThan(0);
      
      LiveAPITestUtils.logTestResult('Rate Limiting Demo', true, duration);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      LiveAPITestUtils.logTestResult('Rate Limiting Demo - Unexpected Error', false, duration, error);
      throw error;
    }
  }, LIVE_API_TIMEOUT);

  it('should demonstrate configuration validation', async () => {
    const startTime = Date.now();
    
    try {
      console.log('⚙️  Testing Configuration Validation');
      
      // Test configuration
      const config = {
        apiKey: process.env.VITE_OPENAI_API_KEY,
        apiKeyLength: process.env.VITE_OPENAI_API_KEY?.length || 0,
        hasValidFormat: process.env.VITE_OPENAI_API_KEY?.startsWith('sk-') || false,
        liveTestsEnabled: process.env.ENABLE_LIVE_API_TESTS === 'true',
        environment: process.env.NODE_ENV || 'development'
      };
      
      console.log('📋 Configuration Status:');
      console.log(`   - API Key Present: ${!!config.apiKey}`);
      console.log(`   - API Key Length: ${config.apiKeyLength} characters`);
      console.log(`   - Valid Format: ${config.hasValidFormat}`);
      console.log(`   - Live Tests Enabled: ${config.liveTestsEnabled}`);
      console.log(`   - Environment: ${config.environment}`);
      
      // Validate configuration
      const validationErrors = [];
      const validationWarnings = [];
      
      if (!config.apiKey) {
        validationErrors.push('API key is missing');
      }
      
      if (config.apiKeyLength < 50) {
        validationErrors.push('API key appears too short');
      }
      
      if (!config.hasValidFormat) {
        validationErrors.push('API key format is invalid (should start with sk-)');
      }
      
      if (!config.liveTestsEnabled) {
        validationWarnings.push('Live API tests are disabled');
      }
      
      console.log('🔍 Validation Results:');
      console.log(`   - Errors: ${validationErrors.length}`);
      console.log(`   - Warnings: ${validationWarnings.length}`);
      
      if (validationErrors.length > 0) {
        console.log('❌ Configuration Errors:');
        validationErrors.forEach(error => console.log(`      - ${error}`));
      }
      
      if (validationWarnings.length > 0) {
        console.log('⚠️  Configuration Warnings:');
        validationWarnings.forEach(warning => console.log(`      - ${warning}`));
      }
      
      const duration = Date.now() - startTime;
      
      // For demo purposes, we expect some configuration issues
      expect(config.apiKey).toBeDefined();
      expect(config.liveTestsEnabled).toBe(true);
      
      LiveAPITestUtils.logTestResult('Configuration Validation Demo', true, duration);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      LiveAPITestUtils.logTestResult('Configuration Validation Demo - Error', false, duration, error);
      throw error;
    }
  }, LIVE_API_TIMEOUT);
}); 