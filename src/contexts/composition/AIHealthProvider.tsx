import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { aiContextMonitor } from '../../services/ai/monitoring/AIContextMonitor';
import { aiLogger } from '../../services/ai/logging/AILogger';
import { AIServiceHealthStatus } from '../../types/ai-context.types';
import { checkEnvironmentConfiguration } from '../../services/ai/external/config/openai.config';

// Health Context Types
interface HealthMetrics {
  responseTime: number;
  errorRate: number;
  uptime: number;
  lastError: string | null;
  lastCheck: string;
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  context?: Record<string, unknown>;
}

interface HealthCheck {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  details: Record<string, unknown>;
}

interface InitializationInfo {
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
  attempts: number;
  lastError: string | null;
}

interface EnvironmentStatus {
  isConfigured: boolean;
  hasApiKey: boolean;
  isDevelopment: boolean;
  issues: string[];
  recommendations: string[];
}

interface AIHealthContextValue {
  // Health Status
  isHealthy: () => boolean;
  getHealthStatus: () => AIServiceHealthStatus;
  getPerformanceMetrics: () => HealthMetrics;
  
  // Environment
  environmentStatus: EnvironmentStatus;
  validateEnvironment: () => Promise<void>;
  
  // Health Monitoring
  monitorHealth: () => void;
  checkComponentHealth: (component: string) => HealthCheck;
  
  // Alerts
  alerts: HealthAlert[];
  addAlert: (alert: Omit<HealthAlert, 'id' | 'timestamp' | 'acknowledged'>) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
  
  // Development Tools
  initializationInfo: InitializationInfo;
  exportDebugInfo: () => {
    metrics: HealthMetrics;
    alerts: HealthAlert[];
    checks: HealthCheck[];
    environment: EnvironmentStatus;
    initialization: InitializationInfo;
  };
}

// Create the context
const AIHealthContext = createContext<AIHealthContextValue | undefined>(undefined);

// Provider component
export const AIHealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Health state
  const [metrics, setMetrics] = useState<HealthMetrics>({
    responseTime: 0,
    errorRate: 0,
    uptime: 0,
    lastError: null,
    lastCheck: new Date().toISOString()
  });
  
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [environment, setEnvironment] = useState<EnvironmentStatus>({
    isConfigured: false,
    hasApiKey: false,
    isDevelopment: false,
    issues: [],
    recommendations: []
  });
  
  const [initializationInfo, setInitializationInfo] = useState<InitializationInfo>({
    startTime: null,
    endTime: null,
    duration: null,
    attempts: 0,
    lastError: null
  });

  // Health status calculation
  const isHealthy = useCallback(() => {
    return aiContextMonitor.isHealthy() && environment.issues.length === 0;
  }, [environment.issues.length]);

  const getHealthStatus = useCallback((): AIServiceHealthStatus => {
    const monitorMetrics = aiContextMonitor.getMetrics();
    const healthy = isHealthy();
    return {
      status: healthy ? 'healthy' : 'unhealthy',
      uptime: monitorMetrics.uptime,
      responseTime: monitorMetrics.averageResponseTime,
      errorRate: monitorMetrics.errorRate,
      lastError: monitorMetrics.lastError ? monitorMetrics.lastError.toISOString() : undefined,
      details: {
        metrics: monitorMetrics,
        environment,
        checks: checks.reduce((acc, check) => ({
          ...acc,
          [check.component]: check.status
        }), {})
      }
    };
  }, [environment, checks, isHealthy]);

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => metrics, [metrics]);

  // Environment validation - Fixed to use proper environment checking
  const validateEnvironment = useCallback(async () => {
    try {
      // Use the existing environment configuration function that handles browser environment properly
      const envStatus = checkEnvironmentConfiguration();
      
      setEnvironment({
        isConfigured: envStatus.isConfigured,
        hasApiKey: envStatus.hasApiKey,
        isDevelopment: envStatus.isDevelopment,
        issues: envStatus.issues,
        recommendations: envStatus.recommendations
      });
      
      aiContextMonitor.updateEnvironmentStatus(envStatus.issues, envStatus.recommendations);
      
      // Update status based on environment validation
      if (envStatus.isConfigured) {
        aiContextMonitor.recordStatusChange('ready');
      } else {
        aiContextMonitor.recordStatusChange('degraded');
      }
    } catch (error) {
      // Prevent error-triggered re-renders by not updating state on error
      aiLogger.error({
        error: error instanceof Error ? error : new Error(String(error)),
        context: 'environment validation',
        component: 'AIHealthProvider',
        severity: 'high',
        userImpact: true
      });
    }
  }, []);

  // Health monitoring - Stabilized dependencies
  const monitorHealth = useCallback(() => {
    const now = new Date();
    const monitorMetrics = aiContextMonitor.getMetrics();
    
    // Update local metrics based on monitor data
    const newMetrics = {
      responseTime: monitorMetrics.averageResponseTime,
      errorRate: monitorMetrics.errorRate,
      uptime: monitorMetrics.uptime,
      lastError: monitorMetrics.lastError ? monitorMetrics.lastError.toISOString() : null,
      lastCheck: now.toISOString()
    };
    
    setMetrics(newMetrics);
    
    // Record health check via performance monitoring
    aiContextMonitor.recordPerformance('health_check', 0);
  }, []);

  // Component health checks
  const checkComponentHealth = useCallback((component: string): HealthCheck => {
    const check = checks.find(c => c.component === component);
    if (check) return check;
    
    const newCheck: HealthCheck = {
      component,
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      details: {}
    };
    
    setChecks(prev => [...prev, newCheck]);
    return newCheck;
  }, [checks]);

  // Alert management
  const addAlert = useCallback((alert: Omit<HealthAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAlert: HealthAlert = {
      ...alert,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    
    setAlerts(prev => [...prev, newAlert]);
    
    aiLogger.warn(`Health Alert: ${alert.message}`, {
      type: alert.type,
      context: alert.context
    });
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Development tools
  const exportDebugInfo = useCallback(() => ({
    metrics,
    alerts,
    checks,
    environment,
    initialization: initializationInfo
  }), [metrics, alerts, checks, environment, initializationInfo]);

  // Initialize monitoring - Fixed dependencies and error handling
  useEffect(() => {
    let isMounted = true;
    
    const initializeMonitoring = async () => {
      if (!isMounted) return;
      
      // Record initial status in AIContextMonitor
      aiContextMonitor.recordStatusChange('initializing');
      
      setInitializationInfo(prev => ({
        ...prev,
        startTime: new Date().toISOString(),
        attempts: prev.attempts + 1
      }));
      
      try {
        await validateEnvironment();
      } catch (error) {
        if (isMounted) {
          setInitializationInfo(prev => ({
            ...prev,
            lastError: error instanceof Error ? error.message : String(error)
          }));
        }
      }
    };
    
    initializeMonitoring();
    
    const monitorInterval = setInterval(() => {
      if (isMounted) {
        monitorHealth();
      }
    }, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(monitorInterval);
    };
  }, []); // Empty dependency array - functions are stable

  // Record initialization completion
  useEffect(() => {
    if (environment.isConfigured) {
      const endTime = new Date().toISOString();
      setInitializationInfo(prev => ({
        ...prev,
        endTime,
        duration: prev.startTime ? new Date(endTime).getTime() - new Date(prev.startTime).getTime() : null
      }));
    }
  }, [environment.isConfigured]);

  // Context value
  const value: AIHealthContextValue = {
    // Health Status
    isHealthy,
    getHealthStatus,
    getPerformanceMetrics,
    
    // Environment
    environmentStatus: environment,
    validateEnvironment,
    
    // Health Monitoring
    monitorHealth,
    checkComponentHealth,
    
    // Alerts
    alerts,
    addAlert,
    acknowledgeAlert,
    clearAlerts,
    
    // Development Tools
    initializationInfo,
    exportDebugInfo
  };

  return (
    <AIHealthContext.Provider value={value}>
      {children}
    </AIHealthContext.Provider>
  );
};

// Hook
export const useAIHealth = (): AIHealthContextValue => {
  const context = useContext(AIHealthContext);
  if (context === undefined) {
    throw new Error('useAIHealth must be used within an AIHealthProvider');
  }
  return context;
}; 