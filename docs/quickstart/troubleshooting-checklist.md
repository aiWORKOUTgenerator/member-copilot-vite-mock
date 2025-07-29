# Troubleshooting Checklist

## 🚨 **Quick Problem Solving**

### **Common Development Issues**

#### **AI Service Integration Problems**
- [ ] Check method signatures in [Domain Services API](../api-reference/ai-services/domain-services-api.md)
- [ ] Verify GlobalAIContext is properly initialized
- [ ] Check feature flags configuration
- [ ] Validate API keys and environment variables

#### **Component Issues**
- [ ] Check component prop interfaces
- [ ] Verify React hook dependencies
- [ ] Validate state management patterns
- [ ] Check for TypeScript type errors

#### **Workflow Problems**
- [ ] Verify workflow step dependencies
- [ ] Check data validation rules
- [ ] Validate user journey flow
- [ ] Check error handling patterns

#### **Build & Deployment Issues**
- [ ] Check environment configuration
- [ ] Verify feature flag settings
- [ ] Validate API endpoints
- [ ] Check monitoring and logging

### **AI Agent Specific Issues**

#### **Method Signature Errors**
- [ ] Use correct method names from domain services
- [ ] Verify parameter types and structure
- [ ] Check return type expectations
- [ ] Validate async/await patterns

#### **Context Integration Issues**
- [ ] Ensure GlobalAIContext is available
- [ ] Check context provider hierarchy
- [ ] Validate context state updates
- [ ] Verify context consumption patterns

#### **Feature Flag Problems**
- [ ] Check feature flag configuration
- [ ] Verify flag evaluation logic
- [ ] Validate fallback behavior
- [ ] Check flag propagation

### **Performance Issues**

#### **AI Service Performance**
- [ ] Check caching configuration
- [ ] Verify rate limiting settings
- [ ] Monitor API response times
- [ ] Check memory usage patterns

#### **Component Performance**
- [ ] Check React rendering optimization
- [ ] Verify hook dependency arrays
- [ ] Monitor state update frequency
- [ ] Check bundle size impact

### **Testing Issues**

#### **Unit Test Problems**
- [ ] Check mock configurations
- [ ] Verify test data structure
- [ ] Validate assertion patterns
- [ ] Check test isolation

#### **Integration Test Issues**
- [ ] Verify test environment setup
- [ ] Check API mocking
- [ ] Validate workflow testing
- [ ] Check test data cleanup

### **Emergency Procedures**

#### **Critical System Issues**
1. **Check system health**: [Health Monitoring](../deployment/monitoring/health-checking-workflow.md)
2. **Review error logs**: [Error Tracking](../deployment/monitoring/error-tracking-workflow.md)
3. **Validate feature flags**: [Feature Flag Management](../deployment/feature-flags/feature-flag-management.md)
4. **Check performance metrics**: [Performance Monitoring](../deployment/monitoring/performance-monitoring-workflow.md)

#### **AI Service Failures**
1. **Switch to fallback mode**: [Failover Strategies](../ai-systems/integration-patterns/failover-strategies.md)
2. **Check external API status**: [External AI Monitoring](../ai-systems/external/integration/error-handling.md)
3. **Validate internal services**: [Internal AI Health](../ai-systems/internal/troubleshooting/method-signature-errors.md)
4. **Review caching behavior**: [Caching System](../ai-systems/internal/core-services/caching-system.md)

---

**Still stuck?** Check the detailed troubleshooting guides in each section or review the [development setup](./development-setup.md) for environment issues.