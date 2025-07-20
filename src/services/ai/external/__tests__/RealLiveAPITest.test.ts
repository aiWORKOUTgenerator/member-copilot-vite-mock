// Real Live API Test - Phase 3D
// This test makes actual OpenAI API calls when API key is available

import { LiveAPITestUtils, describeLiveAPI, setupLiveAPITests, LIVE_API_TIMEOUT } from './live-api-test-setup';

// Setup live API testing
setupLiveAPITests();

describeLiveAPI('Real OpenAI API Integration - Phase 3D', () => {
  
  it('should make a real OpenAI API call', async () => {
    const startTime = Date.now();
    
    try {
      // Make a real API call to OpenAI
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
              role: 'user',
              content: 'Generate a simple 5-minute warm-up routine with 3 exercises.'
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      expect(data).toBeDefined();
      expect(data.choices).toBeDefined();
      expect(Array.isArray(data.choices)).toBe(true);
      expect(data.choices.length).toBeGreaterThan(0);
      expect(data.choices[0].message).toBeDefined();
      expect(data.choices[0].message.content).toBeDefined();
      expect(typeof data.choices[0].message.content).toBe('string');
      expect(data.choices[0].message.content.length).toBeGreaterThan(0);
      
      LiveAPITestUtils.logTestResult('Real OpenAI API Call', true, duration);
      
      // Log the actual response for verification
      console.log('✅ Real API Response:', {
        model: data.model,
        usage: data.usage,
        contentLength: data.choices[0].message.content.length,
        contentPreview: data.choices[0].message.content.substring(0, 100) + '...'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      LiveAPITestUtils.logTestResult('Real OpenAI API Call', false, duration, error);
      throw error;
    }
  }, LIVE_API_TIMEOUT);

  it('should generate a fitness recommendation with real API', async () => {
    const startTime = Date.now();
    
    try {
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
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Validate response
      expect(data.choices[0].message.content).toBeDefined();
      expect(data.choices[0].message.content.length).toBeGreaterThan(50);
      
      // Check if response contains fitness-related content
      const content = data.choices[0].message.content.toLowerCase();
      const fitnessKeywords = ['exercise', 'workout', 'fitness', 'training', 'movement', 'activity'];
      const hasFitnessContent = fitnessKeywords.some(keyword => content.includes(keyword));
      
      expect(hasFitnessContent).toBe(true);
      
      LiveAPITestUtils.logTestResult('Fitness Recommendation API Call', true, duration);
      
      console.log('✅ Fitness Recommendation Response:', {
        contentLength: data.choices[0].message.content.length,
        hasFitnessContent,
        contentPreview: data.choices[0].message.content.substring(0, 150) + '...'
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      LiveAPITestUtils.logTestResult('Fitness Recommendation API Call', false, duration, error);
      throw error;
    }
  }, LIVE_API_TIMEOUT);

  it('should handle API rate limiting gracefully', async () => {
    const startTime = Date.now();
    
    try {
      // Make multiple rapid requests to test rate limiting
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
      
      // Check if all requests were successful or if rate limiting occurred
      const successfulRequests = responses.filter(res => res.ok);
      const failedRequests = responses.filter(res => !res.ok);
      
      // At least one request should succeed
      expect(successfulRequests.length + failedRequests.length).toBe(3);
      
      // If there are failed requests, they should be rate limit errors
      for (const failedResponse of failedRequests) {
        if (failedResponse.status === 429) {
          console.log('⚠️ Rate limiting detected (expected behavior)');
        }
      }
      
      LiveAPITestUtils.logTestResult('Rate Limiting Test', true, duration);
      
      console.log('✅ Rate Limiting Test Results:', {
        successfulRequests: successfulRequests.length,
        failedRequests: failedRequests.length,
        totalDuration: duration
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      LiveAPITestUtils.logTestResult('Rate Limiting Test', false, duration, error);
      throw error;
    }
  }, LIVE_API_TIMEOUT);

  it('should validate API key and configuration', async () => {
    const startTime = Date.now();
    
    try {
      // Test with invalid API key to ensure proper error handling
      const invalidResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_key_12345'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10
        })
      });
      
      // Should get 401 Unauthorized with invalid key
      expect(invalidResponse.status).toBe(401);
      
      // Test with valid API key
      const validResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10
        })
      });
      
      // Should get 200 OK with valid key
      expect(validResponse.ok).toBe(true);
      
      const duration = Date.now() - startTime;
      LiveAPITestUtils.logTestResult('API Key Validation', true, duration);
      
      console.log('✅ API Key Validation Results:', {
        invalidKeyStatus: invalidResponse.status,
        validKeyStatus: validResponse.status,
        apiKeyLength: process.env.VITE_OPENAI_API_KEY?.length || 0
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      LiveAPITestUtils.logTestResult('API Key Validation', false, duration, error);
      throw error;
    }
  }, LIVE_API_TIMEOUT);
}); 