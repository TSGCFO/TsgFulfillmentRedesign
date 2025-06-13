/**
 * Feature Flags React Context and Hooks
 * 
 * This module provides React context, provider, and hooks for managing
 * feature flags throughout the application. It includes automatic refresh,
 * error handling, and context-aware evaluation.
 */

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback, 
  useMemo,
  useRef,
  ReactNode 
} from 'react';
import { useAuth } from './use-auth';
import { 
  FeatureFlag, 
  type FeatureFlagContext, 
  type FeatureFlagEvaluationResult,
  type Environment 
} from '../../../shared/feature-flags';
import { 
  featureFlagApiClient, 
  LocalStorageCache, 
  FeatureFlagDevTools,
  createFeatureFlagContext,
  validateFeatureFlagResult,
  type BatchFeatureFlagsResponse 
} from '../utils/feature-flags';

/**
 * Feature flag loading state
 */
export type FeatureFlagLoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Feature flag context value interface
 */
export interface FeatureFlagContextValue {
  /** Current feature flag states */
  flags: Record<FeatureFlag, FeatureFlagEvaluationResult>;
  /** Loading state of feature flags */
  loading: FeatureFlagLoadingState;
  /** Error state if feature flag loading failed */
  error: Error | null;
  /** Last time feature flags were updated */
  lastUpdated: Date | null;
  /** Context used for feature flag evaluation */
  context: FeatureFlagContext;
  /** Function to manually refresh feature flags */
  refresh: () => Promise<void>;
  /** Function to check if a specific flag is enabled */
  isEnabled: (flag: FeatureFlag) => boolean;
  /** Function to get full evaluation result for a flag */
  getFlag: (flag: FeatureFlag) => FeatureFlagEvaluationResult | null;
  /** Function to check multiple flags at once */
  areEnabled: (flags: FeatureFlag[]) => Record<FeatureFlag, boolean>;
}

/**
 * Feature flag provider props
 */
export interface FeatureFlagProviderProps {
  children: ReactNode;
  /** Override the default context */
  contextOverrides?: Partial<FeatureFlagContext>;
  /** Refresh interval in milliseconds (default: 5 minutes) */
  refreshInterval?: number;
  /** Maximum retry attempts on failure */
  maxRetries?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Fallback flags to use if API fails */
  fallbackFlags?: Partial<Record<FeatureFlag, boolean>>;
}

/**
 * Default feature flag context value
 */
const defaultContextValue: FeatureFlagContextValue = {
  flags: {} as Record<FeatureFlag, FeatureFlagEvaluationResult>,
  loading: 'idle',
  error: null,
  lastUpdated: null,
  context: createFeatureFlagContext(),
  refresh: async () => {},
  isEnabled: () => false,
  getFlag: () => null,
  areEnabled: () => ({} as Record<FeatureFlag, boolean>)
};

/**
 * Feature flag React context
 */
const FeatureFlagContext = createContext<FeatureFlagContextValue>(defaultContextValue);

/**
 * Feature Flag Provider Component
 * Manages feature flag state and provides it to child components
 */
export function FeatureFlagProvider({
  children,
  contextOverrides,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  maxRetries = 3,
  debug = false,
  fallbackFlags = {}
}: FeatureFlagProviderProps) {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Record<FeatureFlag, FeatureFlagEvaluationResult>>({} as Record<FeatureFlag, FeatureFlagEvaluationResult>);
  const [loading, setLoading] = useState<FeatureFlagLoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Create the evaluation context based on current user and overrides
   */
  const context = useMemo((): FeatureFlagContext => {
    return createFeatureFlagContext({
      userId: user?.id,
      userRole: user?.role,
      clientId: user?.clientId,
      ...contextOverrides
    });
  }, [user, contextOverrides]);

  /**
   * Create fallback flags for when API fails
   */
  const createFallbackFlags = useCallback((): Record<FeatureFlag, FeatureFlagEvaluationResult> => {
    const now = new Date();
    const fallbackResults: Record<FeatureFlag, FeatureFlagEvaluationResult> = {} as Record<FeatureFlag, FeatureFlagEvaluationResult>;

    Object.values(FeatureFlag).forEach(flag => {
      const enabled = fallbackFlags[flag] ?? false;
      fallbackResults[flag] = {
        flag,
        state: {
          enabled,
          source: 'default',
          lastEvaluated: now,
          reason: 'Fallback value used due to API failure',
          dependenciesSatisfied: true
        },
        context,
        dependencyResults: []
      };
    });

    return fallbackResults;
  }, [fallbackFlags, context]);

  /**
   * Fetch feature flags from the API
   */
  const fetchFeatureFlags = useCallback(async (): Promise<void> => {
    if (debug) {
      console.log('[FeatureFlagProvider] Fetching feature flags with context:', context);
    }

    setLoading('loading');
    setError(null);

    try {
      const response = await featureFlagApiClient.fetchFeatureFlags(context);
      
      // Validate the response
      const validatedFlags: Record<FeatureFlag, FeatureFlagEvaluationResult> = {} as Record<FeatureFlag, FeatureFlagEvaluationResult>;
      let hasValidationErrors = false;

      Object.entries(response.flags).forEach(([flagName, result]) => {
        const flag = flagName as FeatureFlag;
        if (validateFeatureFlagResult(result, flag)) {
          validatedFlags[flag] = result;
        } else {
          hasValidationErrors = true;
          console.error(`[FeatureFlagProvider] Validation failed for flag: ${flag}`);
        }
      });

      if (hasValidationErrors && Object.keys(validatedFlags).length === 0) {
        throw new Error('All feature flag results failed validation');
      }

      setFlags(validatedFlags);
      setLastUpdated(new Date());
      setLoading('success');
      setRetryCount(0);

      // Cache successful response
      LocalStorageCache.save(response);

      if (debug) {
        console.log('[FeatureFlagProvider] Successfully loaded feature flags');
        FeatureFlagDevTools.logFeatureFlags(validatedFlags);
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error('[FeatureFlagProvider] Failed to fetch feature flags:', error);

      // Try to load from cache as fallback
      const cachedData = LocalStorageCache.load();
      if (cachedData && Object.keys(cachedData.flags).length > 0) {
        console.warn('[FeatureFlagProvider] Using cached feature flags due to API error');
        setFlags(cachedData.flags);
        setLastUpdated(new Date(cachedData.timestamp));
        setLoading('success');
        setError(error);
      } else {
        // Use fallback flags as last resort
        console.warn('[FeatureFlagProvider] Using fallback feature flags due to API error');
        setFlags(createFallbackFlags());
        setLastUpdated(new Date());
        setLoading('error');
        setError(error);
      }

      // Retry logic
      if (retryCount < maxRetries) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff, max 30s
        if (debug) {
          console.log(`[FeatureFlagProvider] Retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        }
        
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchFeatureFlags();
        }, retryDelay);
      }
    }
  }, [context, retryCount, maxRetries, debug, createFallbackFlags]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async (): Promise<void> => {
    setRetryCount(0);
    await fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  /**
   * Check if a specific flag is enabled
   */
  const isEnabled = useCallback((flag: FeatureFlag): boolean => {
    // Check for development overrides first
    const override = FeatureFlagDevTools.getOverride(flag);
    if (override !== null) {
      return override;
    }

    const result = flags[flag];
    return result?.state.enabled ?? false;
  }, [flags]);

  /**
   * Get full evaluation result for a flag
   */
  const getFlag = useCallback((flag: FeatureFlag): FeatureFlagEvaluationResult | null => {
    return flags[flag] ?? null;
  }, [flags]);

  /**
   * Check multiple flags at once
   */
  const areEnabled = useCallback((flagList: FeatureFlag[]): Record<FeatureFlag, boolean> => {
    const result: Record<FeatureFlag, boolean> = {} as Record<FeatureFlag, boolean>;
    flagList.forEach(flag => {
      result[flag] = isEnabled(flag);
    });
    return result;
  }, [isEnabled]);

  /**
   * Initialize feature flags on mount and context changes
   */
  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  /**
   * Set up automatic refresh interval
   */
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (debug) {
          console.log('[FeatureFlagProvider] Auto-refreshing feature flags');
        }
        fetchFeatureFlags();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [fetchFeatureFlags, refreshInterval, debug]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Context value memoization
   */
  const contextValue = useMemo((): FeatureFlagContextValue => ({
    flags,
    loading,
    error,
    lastUpdated,
    context,
    refresh,
    isEnabled,
    getFlag,
    areEnabled
  }), [flags, loading, error, lastUpdated, context, refresh, isEnabled, getFlag, areEnabled]);

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to access the feature flag context
 * @throws {Error} If used outside of FeatureFlagProvider
 */
export function useFeatureFlags(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);
  if (context === defaultContextValue) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}

/**
 * Hook to check if a specific feature flag is enabled
 * @param flag - The feature flag to check
 * @returns Boolean indicating if the flag is enabled
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}

/**
 * Hook to get a feature flag with loading state
 * @param flag - The feature flag to check
 * @returns Object with enabled state and loading information
 */
export function useFeatureFlagWithLoading(flag: FeatureFlag): {
  enabled: boolean;
  loading: FeatureFlagLoadingState;
  error: Error | null;
  result: FeatureFlagEvaluationResult | null;
} {
  const { isEnabled, loading, error, getFlag } = useFeatureFlags();
  
  return useMemo(() => ({
    enabled: isEnabled(flag),
    loading,
    error,
    result: getFlag(flag)
  }), [flag, isEnabled, loading, error, getFlag]);
}

/**
 * Hook to efficiently check multiple feature flags
 * @param flagList - Array of feature flags to check
 * @returns Object mapping each flag to its enabled state
 */
export function useBatchFeatureFlags(flagList: FeatureFlag[]): {
  flags: Record<FeatureFlag, boolean>;
  loading: FeatureFlagLoadingState;
  error: Error | null;
  allEnabled: boolean;
  anyEnabled: boolean;
} {
  const { areEnabled, loading, error } = useFeatureFlags();
  
  return useMemo(() => {
    const flags = areEnabled(flagList);
    const enabledFlags = Object.values(flags);
    
    return {
      flags,
      loading,
      error,
      allEnabled: enabledFlags.every(Boolean),
      anyEnabled: enabledFlags.some(Boolean)
    };
  }, [flagList, areEnabled, loading, error]);
}

/**
 * Hook for development debugging of feature flags
 * Only works in development mode
 */
export function useFeatureFlagDebug(): {
  logFlags: () => void;
  overrideFlag: (flag: FeatureFlag, enabled: boolean) => void;
  clearOverrides: () => void;
  showDebugPanel: () => void;
} {
  const { flags } = useFeatureFlags();
  
  return useMemo(() => ({
    logFlags: () => FeatureFlagDevTools.logFeatureFlags(flags),
    overrideFlag: FeatureFlagDevTools.overrideFlag,
    clearOverrides: FeatureFlagDevTools.clearOverrides,
    showDebugPanel: FeatureFlagDevTools.showDebugPanel
  }), [flags]);
}