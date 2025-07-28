import React, { useState, useEffect } from 'react';
import LogViewer from './LogViewer';
import PerformanceDashboard from './PerformanceDashboard';
import FeatureFlagDashboard from './FeatureFlagDashboard';
import AIDevToolsSuite from './AIDevToolsSuite';
import { aiLogger } from '../../services/ai/logging/AILogger';

const AIDevToolsDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'logs' | 'performance' | 'flags' | 'suite'>('overview');
  const [showSuite, setShowSuite] = useState(false);

  // Generate sample data for demonstration
  useEffect(() => {
    const generateSampleData = () => {
      // Generate sample logs
      const sampleLogs = [
        {
          level: 'info' as const,
          message: 'AI Service initialized successfully',
          data: { component: 'AIService', context: 'initialization', type: 'service_start' }
        },
        {
          level: 'debug' as const,
          message: 'Processing workout generation request',
          data: { component: 'WorkoutGenerator', context: 'generation', type: 'request' }
        },
        {
          level: 'warn' as const,
          message: 'High response time detected',
          data: { component: 'PerformanceMonitor', context: 'monitoring', type: 'performance' }
        },
        {
          level: 'error' as const,
          message: 'Failed to connect to OpenAI API',
          data: { component: 'OpenAIService', context: 'api_call', type: 'connection_error' }
        },
        {
          level: 'info' as const,
          message: 'Feature flag updated: enhanced_logging',
          data: { component: 'FeatureFlags', context: 'management', type: 'flag_update' }
        }
      ];

      // Log each sample with a delay to simulate real-time streaming
      sampleLogs.forEach((log, index) => {
        setTimeout(() => {
          aiLogger[log.level](log.message, log.data);
        }, index * 2000); // 2 second intervals
      });

      // Generate performance alerts (reduced frequency)
      setTimeout(() => {
        aiLogger.warn('Performance degradation detected', {
          component: 'PerformanceMonitor',
          context: 'monitoring',
          type: 'performance_alert',
          details: {
            responseTime: 2500,
            threshold: 2000,
            impact: 'high'
          }
        });
      }, 15000); // Increased from 8000

      setTimeout(() => {
        aiLogger.error({
          error: new Error('API rate limit exceeded'),
          context: 'api_call',
          component: 'OpenAIService',
          severity: 'high',
          userImpact: true,
          timestamp: new Date().toISOString()
        });
      }, 25000); // Increased from 12000
    };

    // Start generating data after a short delay
    const timer = setTimeout(generateSampleData, 1000);

    return () => clearTimeout(timer);
  }, []);

  const sections = [
    {
      id: 'overview',
      name: 'Overview',
      icon: '🏠',
      description: 'Sprint 6 AIDevTools Integration Overview'
    },
    {
      id: 'logs',
      name: 'Log Viewer',
      icon: '📋',
      description: 'Real-time log streaming with advanced filtering'
    },
    {
      id: 'performance',
      name: 'Performance Dashboard',
      icon: '📊',
      description: 'Performance monitoring and alerting'
    },
    {
      id: 'flags',
      name: 'Feature Flags',
      icon: '🚩',
      description: 'Feature flag management and A/B testing'
    },
    {
      id: 'suite',
      name: 'AIDevTools Suite',
      icon: '🔧',
      description: 'Unified debugging interface'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Sprint 6: Advanced AIDevTools Integration
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive debugging suite for AI-powered workout generation with real-time monitoring, 
                performance tracking, and feature flag management.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Log Viewer</h3>
                <p className="text-gray-600 mb-4">
                  Advanced log streaming with filtering, search, and export capabilities for comprehensive debugging.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Live log streaming with &lt;100ms latency</li>
                  <li>• Advanced filtering by level, component, context</li>
                  <li>• Search functionality with highlighting</li>
                  <li>• Export capabilities (JSON, CSV)</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Real-time performance monitoring with metrics, alerts, and historical data visualization.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time performance metrics</li>
                  <li>• Historical data visualization</li>
                  <li>• Performance alerts and recommendations</li>
                  <li>• Customizable time ranges</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl mb-4">🚩</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Flag Management</h3>
                <p className="text-gray-600 mb-4">
                  Intuitive interface for managing feature flags with A/B testing and rollout management.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Flag creation and management</li>
                  <li>• Real-time analytics and usage tracking</li>
                  <li>• A/B testing capabilities</li>
                  <li>• Gradual rollout management</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl mb-4">🏥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Monitoring</h3>
                <p className="text-gray-600 mb-4">
                  Comprehensive health monitoring system for AI service status and component health.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Component-level health tracking</li>
                  <li>• Automated alerting with severity levels</li>
                  <li>• Historical health data</li>
                  <li>• Integration with monitoring systems</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Context Inspector</h3>
                <p className="text-gray-600 mb-4">
                  Interactive tool for inspecting and debugging complex AI context state.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time state inspection</li>
                  <li>• Interactive state modification</li>
                  <li>• State history with replay</li>
                  <li>• State comparison and diff</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-3xl mb-4">🔧</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unified Suite</h3>
                <p className="text-gray-600 mb-4">
                  Integrated debugging suite that brings all tools together in a cohesive interface.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tabbed interface for all tools</li>
                  <li>• Collapsible floating window</li>
                  <li>• Cross-tool data sharing</li>
                  <li>• Development-only visibility</li>
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveSection('logs')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Logs
                </button>
                <button
                  onClick={() => setActiveSection('performance')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Check Performance
                </button>
                <button
                  onClick={() => setActiveSection('flags')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Manage Flags
                </button>
                <button
                  onClick={() => setShowSuite(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Open AIDevTools Suite
                </button>
              </div>
            </div>
          </div>
        );

      case 'logs':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Log Viewer Demo</h2>
              <p className="text-gray-600 mb-4">
                This demo shows the enhanced log viewer with real-time streaming, advanced filtering, and export capabilities.
                Sample logs are being generated automatically to demonstrate the features.
              </p>
            </div>
            <LogViewer />
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Performance Dashboard Demo</h2>
              <p className="text-gray-600 mb-4">
                This demo shows the performance monitoring dashboard with real-time metrics, alerts, and historical data visualization.
                Mock performance data is being generated to demonstrate the features.
              </p>
            </div>
            <PerformanceDashboard />
          </div>
        );

      case 'flags':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Feature Flag Dashboard Demo</h2>
              <p className="text-gray-600 mb-4">
                This demo shows the feature flag management interface with flag creation, analytics, and A/B testing capabilities.
                Existing flags from the system are displayed with mock analytics data.
              </p>
            </div>
            <FeatureFlagDashboard />
          </div>
        );

      case 'suite':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">AIDevTools Suite Demo</h2>
              <p className="text-gray-600 mb-4">
                This demo shows the unified AIDevTools Suite that integrates all debugging tools in a single interface.
                The suite appears as a floating window that can be collapsed and expanded.
              </p>
              <button
                onClick={() => setShowSuite(!showSuite)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {showSuite ? 'Hide' : 'Show'} AIDevTools Suite
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {renderSection()}
        </div>

        {/* Footer */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sprint 6 Implementation Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-gray-700">Task 1: Real-time Log Viewer</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-gray-700">Task 2: Performance Dashboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-gray-700">Task 3: Feature Flag Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-gray-700">Task 4: Health Monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-gray-700">Task 5: Context Inspector</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm text-gray-700">Unified AIDevTools Suite</span>
            </div>
          </div>
        </div>
      </div>

      {/* AIDevTools Suite */}
      <AIDevToolsSuite
        isVisible={showSuite}
        onClose={() => setShowSuite(false)}
      />
    </div>
  );
};

export default AIDevToolsDemo; 