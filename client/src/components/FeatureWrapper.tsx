/**
 * Feature Flag Wrapper Components
 * 
 * This module provides React components for conditional rendering based on
 * feature flags, including error boundaries and loading states.
 */

import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { FeatureFlag } from '../../../shared/feature-flags';
import { 
  useFeatureFlag, 
  useFeatureFlagWithLoading, 
  useBatchFeatureFlags,
  type FeatureFlagLoadingState 
} from '../hooks/use-feature-flags';

/**
 * Props for the FeatureWrapper component
 */
export interface FeatureWrapperProps {
  /** The feature flag to check */
  feature: FeatureFlag;
  /** Content to render when the feature is enabled */
  children: ReactNode;
  /** Optional content to render when the feature is disabled */
  fallback?: ReactNode;
  /** Optional loading component while feature flag is being fetched */
  loading?: ReactNode;
  /** Whether to invert the flag check (render when disabled) */
  invert?: boolean;
  /** Optional className to apply to the wrapper */
  className?: string;
  /** Optional data attributes for testing */
  'data-testid'?: string;
}

/**
 * FeatureWrapper Component
 * Conditionally renders children based on a feature flag's state
 */
export function FeatureWrapper({
  feature,
  children,
  fallback = null,
  loading = null,
  invert = false,
  className,
  'data-testid': testId
}: FeatureWrapperProps) {
  const { enabled, loading: loadingState, error } = useFeatureFlagWithLoading(feature);

  // Show loading state if provided and currently loading
  if (loadingState === 'loading' && loading) {
    return (
      <div className={className} data-testid={testId} data-feature-loading={feature}>
        {loading}
      </div>
    );
  }

  // Determine if content should be shown based on flag state and invert option
  const shouldShow = invert ? !enabled : enabled;

  if (shouldShow) {
    return (
      <div className={className} data-testid={testId} data-feature-enabled={feature}>
        {children}
      </div>
    );
  }

  // Show fallback if provided
  if (fallback) {
    return (
      <div className={className} data-testid={testId} data-feature-disabled={feature}>
        {fallback}
      </div>
    );
  }

  // Return null if no fallback and feature is disabled
  return null;
}

/**
 * Props for the FeatureToggle component
 */
export interface FeatureToggleProps {
  /** The feature flag to check */
  feature: FeatureFlag;
  /** Content to render when the feature is enabled */
  enabled: ReactNode;
  /** Content to render when the feature is disabled */
  disabled: ReactNode;
  /** Optional loading component while feature flag is being fetched */
  loading?: ReactNode;
  /** Optional className to apply to the wrapper */
  className?: string;
  /** Optional data attributes for testing */
  'data-testid'?: string;
}

/**
 * FeatureToggle Component
 * Toggles between two different pieces of content based on a feature flag
 */
export function FeatureToggle({
  feature,
  enabled,
  disabled,
  loading = null,
  className,
  'data-testid': testId
}: FeatureToggleProps) {
  const { enabled: isEnabled, loading: loadingState } = useFeatureFlagWithLoading(feature);

  // Show loading state if provided and currently loading
  if (loadingState === 'loading' && loading) {
    return (
      <div className={className} data-testid={testId} data-feature-loading={feature}>
        {loading}
      </div>
    );
  }

  return (
    <div className={className} data-testid={testId} data-feature-toggle={feature}>
      {isEnabled ? enabled : disabled}
    </div>
  );
}

/**
 * Props for the MultiFeatureWrapper component
 */
export interface MultiFeatureWrapperProps {
  /** Array of feature flags that must all be enabled */
  features: FeatureFlag[];
  /** Content to render when all features are enabled */
  children: ReactNode;
  /** Optional content to render when any feature is disabled */
  fallback?: ReactNode;
  /** Optional loading component while feature flags are being fetched */
  loading?: ReactNode;
  /** Whether all flags must be enabled (AND) or just one (OR) */
  mode?: 'all' | 'any';
  /** Optional className to apply to the wrapper */
  className?: string;
  /** Optional data attributes for testing */
  'data-testid'?: string;
}

/**
 * MultiFeatureWrapper Component
 * Conditionally renders children based on multiple feature flags
 */
export function MultiFeatureWrapper({
  features,
  children,
  fallback = null,
  loading = null,
  mode = 'all',
  className,
  'data-testid': testId
}: MultiFeatureWrapperProps) {
  const { flags, loading: loadingState, allEnabled, anyEnabled } = useBatchFeatureFlags(features);

  // Show loading state if provided and currently loading
  if (loadingState === 'loading' && loading) {
    return (
      <div className={className} data-testid={testId} data-multi-feature-loading>
        {loading}
      </div>
    );
  }

  // Determine if content should be shown based on mode
  const shouldShow = mode === 'all' ? allEnabled : anyEnabled;

  if (shouldShow) {
    return (
      <div 
        className={className} 
        data-testid={testId} 
        data-multi-feature-enabled={features.join(',')}
      >
        {children}
      </div>
    );
  }

  // Show fallback if provided
  if (fallback) {
    return (
      <div 
        className={className} 
        data-testid={testId} 
        data-multi-feature-disabled={features.join(',')}
      >
        {fallback}
      </div>
    );
  }

  // Return null if no fallback and features are disabled
  return null;
}

/**
 * Props for the FeatureBoundary error boundary
 */
export interface FeatureBoundaryProps {
  /** Content to render */
  children: ReactNode;
  /** Optional fallback content when feature flag system fails */
  fallback?: ReactNode;
  /** Optional callback when an error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional className to apply to the wrapper */
  className?: string;
  /** Optional data attributes for testing */
  'data-testid'?: string;
}

/**
 * State for the FeatureBoundary error boundary
 */
interface FeatureBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Default fallback component for feature boundary errors
 */
const DefaultFeatureBoundaryFallback = ({ error }: { error: Error | null }) => (
  <div 
    className="p-4 border border-red-200 bg-red-50 rounded-md"
    role="alert"
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <svg 
          className="h-5 w-5 text-red-400" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">
          Feature Flag System Error
        </h3>
        <div className="mt-2 text-sm text-red-700">
          <p>
            There was an issue with the feature flag system. 
            {import.meta.env.DEV && error && (
              <>
                <br />
                <code className="text-xs">{error.message}</code>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * FeatureBoundary Component
 * Error boundary specifically for feature flag-related errors
 */
export class FeatureBoundary extends Component<FeatureBoundaryProps, FeatureBoundaryState> {
  constructor(props: FeatureBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FeatureBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console in development
    if (import.meta.env.DEV) {
      console.error('[FeatureBoundary] Error caught in feature flag boundary:', error, errorInfo);
    }

    // Call the optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      const fallback = this.props.fallback || <DefaultFeatureBoundaryFallback error={this.state.error} />;
      
      return (
        <div 
          className={this.props.className} 
          data-testid={this.props['data-testid']}
          data-feature-boundary-error="true"
        >
          {fallback}
        </div>
      );
    }

    return (
      <div 
        className={this.props.className} 
        data-testid={this.props['data-testid']}
      >
        {this.props.children}
      </div>
    );
  }
}

/**
 * Props for the LazyFeatureWrapper component
 */
export interface LazyFeatureWrapperProps {
  /** The feature flag to check */
  feature: FeatureFlag;
  /** Lazy-loaded component to render when feature is enabled */
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  /** Props to pass to the lazy component */
  componentProps?: Record<string, any>;
  /** Optional content to render when the feature is disabled */
  fallback?: ReactNode;
  /** Optional loading component while lazy component is loading */
  loading?: ReactNode;
  /** Optional className to apply to the wrapper */
  className?: string;
  /** Optional data attributes for testing */
  'data-testid'?: string;
}

/**
 * LazyFeatureWrapper Component
 * Combines feature flag checking with React.lazy for code splitting
 */
export function LazyFeatureWrapper({
  feature,
  component: LazyComponent,
  componentProps = {},
  fallback = null,
  loading = <div>Loading...</div>,
  className,
  'data-testid': testId
}: LazyFeatureWrapperProps) {
  const isEnabled = useFeatureFlag(feature);

  if (!isEnabled) {
    return fallback ? (
      <div className={className} data-testid={testId} data-lazy-feature-disabled={feature}>
        {fallback}
      </div>
    ) : null;
  }

  return (
    <div className={className} data-testid={testId} data-lazy-feature-enabled={feature}>
      <Suspense fallback={loading}>
        <LazyComponent {...componentProps} />
      </Suspense>
    </div>
  );
}

/**
 * Hook for creating feature-flag aware render functions
 */
export function useFeatureRender(feature: FeatureFlag) {
  const isEnabled = useFeatureFlag(feature);
  
  return React.useCallback(
    (enabledContent: ReactNode, disabledContent?: ReactNode) => {
      return isEnabled ? enabledContent : (disabledContent || null);
    },
    [isEnabled]
  );
}

/**
 * Higher-order component for feature flag wrapping
 */
export function withFeatureFlag<P extends object>(
  feature: FeatureFlag,
  fallback?: ReactNode
) {
  return function FeatureHOC(Component: React.ComponentType<P>) {
    const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
      const isEnabled = useFeatureFlag(feature);
      
      if (!isEnabled) {
        return fallback ? <>{fallback}</> : null;
      }
      
      return <Component {...(props as P)} ref={ref} />;
    });
    
    WrappedComponent.displayName = `withFeatureFlag(${Component.displayName || Component.name})`;
    
    return WrappedComponent;
  };
}