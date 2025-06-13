/**
 * Feature Flag Demo Page
 * 
 * This page demonstrates the usage of the feature flag system
 * and serves as a testing ground for feature flag functionality.
 */

import React, { useState } from 'react';
import { FeatureFlag } from '../../../shared/feature-flags';
import { 
  useFeatureFlag, 
  useFeatureFlags, 
  useFeatureFlagWithLoading,
  useBatchFeatureFlags,
  useFeatureFlagDebug 
} from '../hooks/use-feature-flags';
import { 
  FeatureWrapper, 
  FeatureToggle, 
  MultiFeatureWrapper,
  LazyFeatureWrapper,
  useFeatureRender,
  withFeatureFlag 
} from '../components/FeatureWrapper';

// Example lazy component for testing
const LazyTestComponent = React.lazy(() => Promise.resolve({
  default: () => (
    <div style={{ padding: '16px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Lazy Loaded Component</h4>
      <p style={{ margin: 0, color: '#1e40af' }}>This component was loaded only when the feature flag was enabled!</p>
    </div>
  )
}));

// Simple example button for demonstration
const ExampleButton = ({ children, enabled }: { children: React.ReactNode; enabled: boolean }) => (
  <button
    disabled={!enabled}
    style={{
      padding: '8px 16px',
      background: enabled ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' : '#f3f4f6',
      color: enabled ? 'white' : '#6b7280',
      border: enabled ? 'none' : '1px solid #d1d5db',
      borderRadius: '4px',
      cursor: enabled ? 'pointer' : 'not-allowed'
    }}
  >
    {enabled ? '✨ ' : ''}{children}
  </button>
);

/**
 * Component to display feature flag status
 */
function FeatureFlagStatus({ flag, title }: { flag: FeatureFlag; title: string }) {
  const { enabled, loading, error, result } = useFeatureFlagWithLoading(flag);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px', 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px',
      marginBottom: '8px'
    }}>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>{title}</h4>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>{flag}</p>
        {result && (
          <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af' }}>
            Source: {result.state.source} | Updated: {result.state.lastEvaluated.toLocaleString()}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {loading === 'loading' && (
          <span style={{ 
            padding: '2px 8px', 
            backgroundColor: '#f3f4f6', 
            border: '1px solid #d1d5db', 
            borderRadius: '12px', 
            fontSize: '12px' 
          }}>
            Loading...
          </span>
        )}
        {error && (
          <span style={{ 
            padding: '2px 8px', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '12px', 
            fontSize: '12px',
            color: '#dc2626'
          }}>
            Error
          </span>
        )}
        <span style={{ 
          padding: '2px 8px', 
          backgroundColor: enabled ? '#dcfce7' : '#f9fafb', 
          border: `1px solid ${enabled ? '#86efac' : '#e5e7eb'}`, 
          borderRadius: '12px', 
          fontSize: '12px',
          color: enabled ? '#166534' : '#6b7280'
        }}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  );
}

/**
 * Component to demonstrate batch feature flag usage
 */
function BatchFeatureFlagExample() {
  const { flags, loading, error, allEnabled, anyEnabled } = useBatchFeatureFlags([
    FeatureFlag.NEW_DASHBOARD,
    FeatureFlag.ENHANCED_SEARCH,
    FeatureFlag.DOCUMENT_SIGNING
  ]);

  return (
    <div style={{ 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px', 
      padding: '16px',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Batch Feature Flags</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
        Check multiple feature flags simultaneously
      </p>
      
      <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Loading State:</span>
          <span style={{ 
            padding: '2px 8px', 
            backgroundColor: '#f9fafb', 
            border: '1px solid #e5e7eb', 
            borderRadius: '4px', 
            fontSize: '12px' 
          }}>
            {loading}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>All Enabled:</span>
          <span style={{ 
            padding: '2px 8px', 
            backgroundColor: allEnabled ? '#dcfce7' : '#f9fafb', 
            border: `1px solid ${allEnabled ? '#86efac' : '#e5e7eb'}`, 
            borderRadius: '4px', 
            fontSize: '12px',
            color: allEnabled ? '#166534' : '#6b7280'
          }}>
            {allEnabled ? 'Yes' : 'No'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Any Enabled:</span>
          <span style={{ 
            padding: '2px 8px', 
            backgroundColor: anyEnabled ? '#dcfce7' : '#f9fafb', 
            border: `1px solid ${anyEnabled ? '#86efac' : '#e5e7eb'}`, 
            borderRadius: '4px', 
            fontSize: '12px',
            color: anyEnabled ? '#166534' : '#6b7280'
          }}>
            {anyEnabled ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <p style={{ margin: 0, color: '#dc2626' }}>Error: {error.message}</p>
        </div>
      )}
      
      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
      
      <div style={{ display: 'grid', gap: '4px' }}>
        {Object.entries(flags).map(([flag, enabled]) => (
          <div key={flag} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
            <span>{flag}:</span>
            <span style={{ 
              padding: '2px 8px', 
              backgroundColor: enabled ? '#dcfce7' : '#f9fafb', 
              border: `1px solid ${enabled ? '#86efac' : '#e5e7eb'}`, 
              borderRadius: '4px', 
              fontSize: '12px',
              color: enabled ? '#166534' : '#6b7280'
            }}>
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Component to demonstrate development tools
 */
function FeatureFlagDevTools() {
  const { logFlags, overrideFlag, clearOverrides, showDebugPanel } = useFeatureFlagDebug();
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag>(FeatureFlag.NEW_DASHBOARD);
  const [overrideValue, setOverrideValue] = useState(true);

  const buttonStyle = {
    padding: '6px 12px',
    backgroundColor: '#f9fafb',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  };

  return (
    <div style={{ 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px', 
      padding: '16px',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Development Tools</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
        Tools for debugging and testing feature flags (Development only)
      </p>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button onClick={logFlags} style={buttonStyle}>
          Log All Flags
        </button>
        <button onClick={showDebugPanel} style={buttonStyle}>
          Show Debug Panel
        </button>
        <button onClick={clearOverrides} style={buttonStyle}>
          Clear Overrides
        </button>
      </div>
      
      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
      
      <div>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
          Override Flag (Development Only)
        </h5>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
          <select 
            value={selectedFlag} 
            onChange={(e) => setSelectedFlag(e.target.value as FeatureFlag)}
            style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px 8px', fontSize: '12px' }}
          >
            {Object.values(FeatureFlag).map(flag => (
              <option key={flag} value={flag}>{flag}</option>
            ))}
          </select>
          <select
            value={overrideValue.toString()}
            onChange={(e) => setOverrideValue(e.target.value === 'true')}
            style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
          <button 
            onClick={() => overrideFlag(selectedFlag, overrideValue)}
            style={buttonStyle}
          >
            Override
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '10px', color: '#6b7280' }}>
          Overrides are stored in sessionStorage and require a page reload to take effect.
        </p>
      </div>
    </div>
  );
}

/**
 * Main Feature Flag Demo Page Component
 */
export default function FeatureFlagDemo() {
  const { flags, loading, error, lastUpdated, refresh, context } = useFeatureFlags();
  const renderWithFeature = useFeatureRender(FeatureFlag.ENHANCED_SEARCH);
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Feature Flag System Demo</h1>
        <p style={{ color: '#6b7280' }}>
          This page demonstrates the feature flag system integration and provides examples
          of how to use feature flags in React components.
        </p>
      </div>

      {/* System Status */}
      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>System Status</h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
          Current state of the feature flag system
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>Loading State</h4>
            <span style={{ 
              padding: '4px 12px', 
              backgroundColor: loading === 'success' ? '#dcfce7' : '#f9fafb', 
              border: `1px solid ${loading === 'success' ? '#86efac' : '#e5e7eb'}`, 
              borderRadius: '4px',
              fontSize: '14px',
              color: loading === 'success' ? '#166534' : '#6b7280'
            }}>
              {loading}
            </span>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>Last Updated</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>Context</h4>
            <pre style={{ 
              fontSize: '10px', 
              backgroundColor: '#f3f4f6', 
              padding: '8px', 
              borderRadius: '4px', 
              overflow: 'auto',
              margin: 0
            }}>
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>Actions</h4>
            <button 
              onClick={refresh} 
              style={{ 
                padding: '6px 12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Refresh Flags
            </button>
          </div>
        </div>
        
        {error && (
          <div style={{ 
            marginTop: '16px',
            padding: '12px', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px'
          }}>
            <p style={{ margin: 0, color: '#dc2626' }}>Error: {error.message}</p>
          </div>
        )}
      </div>

      {/* Individual Feature Flag Status */}
      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Feature Flag Status</h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
          Current status of all available feature flags
        </p>
        
        <div>
          <FeatureFlagStatus flag={FeatureFlag.NEW_DASHBOARD} title="New Dashboard" />
          <FeatureFlagStatus flag={FeatureFlag.ENHANCED_SEARCH} title="Enhanced Search" />
          <FeatureFlagStatus flag={FeatureFlag.DOCUMENT_SIGNING} title="Document Signing" />
          <FeatureFlagStatus flag={FeatureFlag.HUBSPOT_V2} title="HubSpot V2 Integration" />
          <FeatureFlagStatus flag={FeatureFlag.PERFORMANCE_CACHING} title="Performance Caching" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Batch Feature Flags */}
        <BatchFeatureFlagExample />

        {/* Development Tools */}
        <FeatureFlagDevTools />
      </div>

      {/* Component Examples */}
      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Component Examples</h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
          Examples of how to use feature flags in React components
        </p>
        
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* FeatureWrapper Example */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>FeatureWrapper Example</h4>
            <FeatureWrapper
              feature={FeatureFlag.NEW_DASHBOARD}
              fallback={
                <div style={{ padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <p style={{ margin: 0 }}>New Dashboard is disabled. This is the fallback content.</p>
                </div>
              }
            >
              <div style={{ padding: '16px', backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#166534', fontWeight: '600' }}>New Dashboard Enabled!</h5>
                <p style={{ margin: 0, color: '#166534' }}>This content is only shown when the NEW_DASHBOARD flag is enabled.</p>
              </div>
            </FeatureWrapper>
          </div>

          {/* FeatureToggle Example */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>FeatureToggle Example</h4>
            <FeatureToggle
              feature={FeatureFlag.ENHANCED_SEARCH}
              enabled={
                <div style={{ padding: '16px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '8px' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#1e40af', fontWeight: '600' }}>Enhanced Search Active</h5>
                  <p style={{ margin: 0, color: '#1e40af' }}>You're seeing the enhanced search interface.</p>
                </div>
              }
              disabled={
                <div style={{ padding: '16px', backgroundColor: '#fed7aa', border: '1px solid #fb923c', borderRadius: '8px' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#c2410c', fontWeight: '600' }}>Basic Search</h5>
                  <p style={{ margin: 0, color: '#c2410c' }}>You're seeing the basic search interface.</p>
                </div>
              }
            />
          </div>

          {/* MultiFeatureWrapper Example */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>MultiFeatureWrapper Example (All Mode)</h4>
            <MultiFeatureWrapper
              features={[FeatureFlag.NEW_DASHBOARD, FeatureFlag.ENHANCED_SEARCH]}
              mode="all"
              fallback={
                <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: '#dc2626' }}>Both NEW_DASHBOARD and ENHANCED_SEARCH must be enabled to see this content.</p>
                </div>
              }
            >
              <div style={{ padding: '16px', backgroundColor: '#faf5ff', border: '1px solid #c084fc', borderRadius: '8px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#7c3aed', fontWeight: '600' }}>Advanced Features Unlocked!</h5>
                <p style={{ margin: 0, color: '#7c3aed' }}>Both required feature flags are enabled.</p>
              </div>
            </MultiFeatureWrapper>
          </div>

          {/* LazyFeatureWrapper Example */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>LazyFeatureWrapper Example</h4>
            <LazyFeatureWrapper
              feature={FeatureFlag.PERFORMANCE_CACHING}
              component={LazyTestComponent}
              fallback={
                <div style={{ padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <p style={{ margin: 0 }}>Performance caching is disabled. Lazy component not loaded.</p>
                </div>
              }
              loading={
                <div style={{ padding: '16px', backgroundColor: '#fefce8', border: '1px solid #fde047', borderRadius: '8px' }}>
                  <p style={{ margin: 0 }}>Loading lazy component...</p>
                </div>
              }
            />
          </div>

          {/* useFeatureRender Hook Example */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>useFeatureRender Hook Example</h4>
            {renderWithFeature(
              <div style={{ padding: '16px', backgroundColor: '#e0e7ff', border: '1px solid #6366f1', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#4338ca' }}>Enhanced search is enabled via useFeatureRender hook!</p>
              </div>,
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#374151' }}>Enhanced search is disabled.</p>
              </div>
            )}
          </div>

          {/* Example Button with Feature Flag */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>Button Example with Feature Flag</h4>
            <FeatureWrapper
              feature={FeatureFlag.ENHANCED_SEARCH}
              fallback={<ExampleButton enabled={false}>Enhanced features disabled</ExampleButton>}
            >
              <ExampleButton enabled={true}>Enhanced Button Active</ExampleButton>
            </FeatureWrapper>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '16px'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>Code Examples</h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
          Copy these examples to use feature flags in your components
        </p>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>Hook Usage</h4>
            <pre style={{ 
              fontSize: '12px', 
              backgroundColor: '#f3f4f6', 
              padding: '16px', 
              borderRadius: '8px', 
              overflow: 'auto',
              margin: 0
            }}>
{`// Check individual flag
const isNewDashboardEnabled = useFeatureFlag(FeatureFlag.NEW_DASHBOARD);

// Get flag with loading state
const { enabled, loading, error } = useFeatureFlagWithLoading(FeatureFlag.NEW_DASHBOARD);

// Check multiple flags
const { flags, allEnabled, anyEnabled } = useBatchFeatureFlags([
  FeatureFlag.NEW_DASHBOARD,
  FeatureFlag.ENHANCED_SEARCH
]);`}
            </pre>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>Component Usage</h4>
            <pre style={{ 
              fontSize: '12px', 
              backgroundColor: '#f3f4f6', 
              padding: '16px', 
              borderRadius: '8px', 
              overflow: 'auto',
              margin: 0
            }}>
{`// Simple wrapper
<FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
  <NewDashboardComponent />
</FeatureWrapper>

// Toggle between components
<FeatureToggle 
  feature={FeatureFlag.ENHANCED_SEARCH}
  enabled={<EnhancedSearchForm />}
  disabled={<BasicSearchForm />}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}