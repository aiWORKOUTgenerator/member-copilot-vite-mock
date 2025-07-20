# Live API Testing Guide - Phase 3D

## **🎯 Overview**

This guide explains how to set up and run live API tests that make actual calls to the OpenAI API. These tests validate that our external services work correctly with real API responses.

## **🔧 Setup Instructions**

### **Step 1: Get OpenAI API Key**

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key or use an existing one
3. Copy the API key (starts with `sk-`)

### **Step 2: Configure Environment**

#### **Option A: Using Setup Script (Recommended)**
```bash
# Run the setup script
npm run setup:live-api

# Follow the prompts to add your API key to .env file
```

#### **Option B: Manual Setup**
```bash
# Create or edit .env file in project root
echo "VITE_OPENAI_API_KEY=your_api_key_here" >> .env
echo "ENABLE_LIVE_API_TESTS=true" >> .env
```

### **Step 3: Verify Setup**

```bash
# Check if environment variables are set
echo $VITE_OPENAI_API_KEY
echo $ENABLE_LIVE_API_TESTS
```

## **🚀 Running Live API Tests**

### **Run All Live API Tests**
```bash
npm run test:live
```

### **Run Specific Test Files**
```bash
# Run only live API integration tests
npm test -- src/services/ai/external/__tests__/LiveAPIIntegration.test.ts

# Run with live API enabled
ENABLE_LIVE_API_TESTS=true npm test -- src/services/ai/external/__tests__/LiveAPIIntegration.test.ts
```

### **Run All External Service Tests**
```bash
npm run test:external
```

### **Run Only Unit Tests (No Live API)**
```bash
npm run test:unit
```

## **📊 Test Categories**

### **1. OpenAI Service Live API Tests**
- **Health Check**: Validates OpenAI service connectivity
- **Simple API Request**: Tests basic API communication
- **Response Validation**: Ensures proper response structure

### **2. OpenAI Strategy Live API Tests**
- **Generate Recommendations**: Tests AI-powered recommendation generation
- **User Preference Analysis**: Tests user preference analysis with AI
- **Context Handling**: Validates context-aware responses

### **3. Workout Generation Service Live API Tests**
- **Complete Workout Generation**: Tests full workout generation pipeline
- **Detailed Workout Generation**: Tests detailed workout with instructions
- **Energy Level Variations**: Tests different energy level scenarios
- **Focus Area Variations**: Tests different focus area scenarios

### **4. Performance and Reliability Tests**
- **Concurrent API Requests**: Tests handling multiple simultaneous requests
- **Caching Behavior**: Validates caching mechanism performance
- **Rate Limiting**: Tests graceful handling of API rate limits
- **Network Timeouts**: Tests timeout handling

## **📈 Test Results and Metrics**

### **Performance Metrics**
Live API tests include timing information:
```
✅ Generate Complete Workout (2,847ms)
✅ Energy Level 3 (1,923ms)
✅ Energy Level 5 (2,156ms)
✅ Energy Level 8 (2,431ms)
```

### **Success/Failure Indicators**
- **✅ PASS**: Test completed successfully
- **❌ FAIL**: Test failed with error details
- **⏭️ SKIP**: Test skipped (API key not available)

### **Error Reporting**
Failed tests include detailed error information:
```
❌ FAIL OpenAI Health Check (5,234ms)
Error details: OpenAI API rate limit exceeded
```

## **🔍 Test Validation**

### **Response Structure Validation**
Tests validate that API responses have the correct structure:

```typescript
// Workout response validation
expect(workout.workout).toBeDefined();
expect(workout.exercises).toBeDefined();
expect(Array.isArray(workout.exercises)).toBe(true);
expect(workout.exercises.length).toBeGreaterThan(0);

// Exercise validation
workout.exercises.forEach(exercise => {
  expect(exercise).toHaveProperty('name');
  expect(exercise).toHaveProperty('duration');
  expect(exercise).toHaveProperty('category');
});
```

### **Content Quality Validation**
Tests ensure generated content is meaningful:
```typescript
// Validate exercise names are not empty
expect(exercise.name.length).toBeGreaterThan(0);

// Validate instructions for detailed workouts
expect(exercise.instructions).toBeDefined();
expect(exercise.instructions.length).toBeGreaterThan(0);
```

## **⚙️ Configuration Options**

### **Environment Variables**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_OPENAI_API_KEY` | OpenAI API key | - | Yes |
| `ENABLE_LIVE_API_TESTS` | Enable live API testing | `false` | No |
| `OPENAI_API_KEY` | Alternative API key variable | - | No |

### **Test Configuration**

| Setting | Value | Description |
|---------|-------|-------------|
| `LIVE_API_TIMEOUT` | 30,000ms | Timeout for API calls |
| `MAX_RETRIES` | 2 | Maximum retry attempts |
| `TEST_USER_PROFILE` | Predefined | Consistent test user data |

## **🛠️ Troubleshooting**

### **Common Issues**

#### **1. API Key Not Found**
```
Error: OpenAI API key not found. Set VITE_OPENAI_API_KEY or OPENAI_API_KEY environment variable.
```
**Solution**: Add your API key to the `.env` file

#### **2. Rate Limiting**
```
Error: OpenAI API rate limit exceeded
```
**Solution**: Wait a few minutes and retry, or upgrade your OpenAI plan

#### **3. Network Timeouts**
```
Error: Request timeout after 30 seconds
```
**Solution**: Check your internet connection or increase timeout

#### **4. Tests Skipped**
```
describe.skip('Live OpenAI API Integration (Live API disabled)')
```
**Solution**: Set `ENABLE_LIVE_API_TESTS=true` in your environment

### **Debug Mode**

Enable verbose logging:
```bash
DEBUG=openai:* npm run test:live
```

## **💰 Cost Considerations**

### **API Usage**
- Each test makes 1-3 API calls
- Full test suite: ~20-30 API calls
- Estimated cost: $0.01-$0.05 per test run

### **Cost Optimization**
- Tests are skipped if API key is not set
- Caching reduces duplicate API calls
- Tests use minimal token counts
- Rate limiting prevents excessive usage

## **🔒 Security Best Practices**

### **API Key Management**
- Never commit API keys to version control
- Use `.env` file for local development
- Use environment variables in CI/CD
- Rotate API keys regularly

### **Test Data**
- Tests use predefined, safe test data
- No sensitive user information in tests
- API responses are validated, not stored

## **📋 Test Maintenance**

### **Regular Validation**
- Run live API tests weekly
- Monitor API response quality
- Update test data as needed
- Review and update timeouts

### **Performance Monitoring**
- Track test execution times
- Monitor API success rates
- Identify performance regressions
- Optimize test scenarios

## **🎯 Success Criteria**

### **Test Coverage**
- ✅ All external services tested
- ✅ All API endpoints validated
- ✅ Error scenarios covered
- ✅ Performance metrics tracked

### **Quality Metrics**
- ✅ Response structure validation
- ✅ Content quality validation
- ✅ Error handling validation
- ✅ Performance benchmarking

### **Reliability Metrics**
- ✅ Consistent test results
- ✅ Graceful error handling
- ✅ Proper timeout management
- ✅ Rate limit handling

## **🚀 Next Steps**

### **Continuous Integration**
- Add live API tests to CI/CD pipeline
- Set up automated testing schedule
- Monitor test results over time
- Alert on test failures

### **Advanced Testing**
- Load testing with multiple concurrent requests
- Stress testing with high-volume scenarios
- Integration testing with other services
- End-to-end workflow testing

---

**📞 Support**: If you encounter issues with live API testing, check the troubleshooting section or review the test logs for detailed error information. 