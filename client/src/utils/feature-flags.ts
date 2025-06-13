/**
 * Feature Flags Frontend Utilities
 * 
 * This module provides utilities for interacting with the feature flag backend API,
 * including caching, synchronization, and development helpers.
 */

import {
  FeatureFlag,
  type FeatureFlagContext,
  type FeatureFlagEvaluationResult,
  type FeatureFlagState,
  type Environment
} from '../../../shared/feature-flags';

/**
 * Configuration for the feature flag API client
 */
export interface FeatureFlagApiConfig {
  /** Base URL for the API */
  baseUrl?: string;
  /** Timeout for API requests in milliseconds */
  timeout?: number;
  /** Enable local storage caching */
  enableCache?: boolean;
  /** Cache duration in milliseconds */
  cacheDuration?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Response from the batch feature flags API endpoint
 */
export interface BatchFeatureFlagsResponse {
  flags: Record<FeatureFlag, FeatureFlagEvaluationResult>;
  timestamp: string;
  context: FeatureFlagContext;
}

/**
 * Cached feature flag data structure
 */
interface CachedFeatureFlagData {
  flags: Record<FeatureFlag, FeatureFlagEvaluationResult>;
  timestamp: number;
  context: FeatureFlagContext;
}

/**
 * Default configuration for the feature flag API client
 */
const DEFAULT_CONFIG: Required<FeatureFlagApiConfig> = {
  baseUrl: '/api',
  timeout: 5000,
  enableCache: true,
  cacheDuration: 5 * 60 * 1000, // 5 minutes
  debug: import.meta.env.DEV
};

/**
 * Feature Flag API Client
 * Handles communication with the backend feature flag endpoints
 */
export class FeatureFlagApiClient {
  private config: Required<FeatureFlagApiConfig>;
  private cache = new Map<string, CachedFeatureFlagData>();

  constructor(config: FeatureFlagApiConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (this.config.debug) {
      console.log('[FeatureFlagApiClient] Initialized with config:', this.config);
    }
  }

  /**
   * Fetches all feature flags from the backend API
   */
  async fetchFeatureFlags(context?: Partial<FeatureFlagContext>): Promise<BatchFeatureFlagsResponse> {
    const cacheKey = this.getCacheKey(context);
    
    // Check cache first
    if (this.config.enableCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        if (this.config.debug) {
          console.log('[FeatureFlagApiClient] Returning cached data for:', cacheKey);
        }
        return {
          flags: cached.flags,
          timestamp: new Date(cached.timestamp).toISOString(),
          context: cached.context
        };
      }
    }

    try {
      const url = new URL(`${this.config.baseUrl}/feature-flags`, window.location.origin);
      
      // Add context as query parameters
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.set(key, String(value));
          }
        });
      }

      if (this.config.debug) {
        console.log('[FeatureFlagApiClient] Fetching from:', url.toString());
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Feature flags API error: ${response.status} ${response.statusText}`);
      }

      const data: BatchFeatureFlagsResponse = await response.json();

      // Cache the response
      if (this.config.enableCache) {
        this.setCachedData(cacheKey, {
          flags: data.flags,
          timestamp: Date.now(),
          context: data.context
        });
      }

      if (this.config.debug) {
        console.log('[FeatureFlagApiClient] Received data:', data);
      }

      return data;
    } catch (error) {
      if (this.config.debug) {
        console.error('[FeatureFlagApiClient] Error fetching feature flags:', error);
      }

      // Try to return cached data as fallback
      if (this.config.enableCache) {
        const cached = this.getCachedData(cacheKey, true);
        if (cached) {
          console.warn('[FeatureFlagApiClient] Using stale cached data due to API error');
          return {
            flags: cached.flags,
            timestamp: new Date(cached.timestamp).toISOString(),
            context: cached.context
          };
        }
      }

      throw error;
    }
  }

  /**
   * Fetches a single feature flag from the backend API
   */
  async fetchFeatureFlag(
    flag: FeatureFlag, 
    context?: Partial<FeatureFlagContext>
  ): Promise<FeatureFlagEvaluationResult> {
    try {
      const url = new URL(`${this.config.baseUrl}/feature-flags/${flag}`, window.location.origin);
      
      // Add context as query parameters
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.set(key, String(value));
          }
        });
      }

      if (this.config.debug) {
        console.log('[FeatureFlagApiClient] Fetching single flag from:', url.toString());
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Feature flag API error: ${response.status} ${response.statusText}`);
      }

      const data: FeatureFlagEvaluationResult = await response.json();

      if (this.config.debug) {
        console.log('[FeatureFlagApiClient] Received single flag data:', data);
      }

      return data;
    } catch (error) {
      if (this.config.debug) {
        console.error('[FeatureFlagApiClient] Error fetching single feature flag:', error);
      }
      throw error;
    }
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache.clear();
    if (this.config.debug) {
      console.log('[FeatureFlagApiClient] Cache cleared');
    }
  }

  /**
   * Gets a cache key for the given context
   */
  private getCacheKey(context?: Partial<FeatureFlagContext>): string {
    if (!context) return 'default';
    return JSON.stringify(context);
  }

  /**
   * Gets cached data if it exists and is not expired
   */
  private getCachedData(cacheKey: string, allowStale = false): CachedFeatureFlagData | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.config.cacheDuration;
    if (isExpired && !allowStale) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached;
  }

  /**
   * Sets cached data
   */
  private setCachedData(cacheKey: string, data: CachedFeatureFlagData): void {
    this.cache.set(cacheKey, data);
  }
}

/**
 * Default API client instance
 */
export const featureFlagApiClient = new FeatureFlagApiClient();

/**
 * Local storage utilities for offline caching
 */
export const LocalStorageCache = {
  /**
   * Storage key for feature flags
   */
  STORAGE_KEY: 'feature-flags-cache',

  /**
   * Saves feature flags to local storage
   */
  save(data: BatchFeatureFlagsResponse): void {
    try {
      const cacheData = {
        ...data,
        cachedAt: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[LocalStorageCache] Failed to save to localStorage:', error);
    }
  },

  /**
   * Loads feature flags from local storage
   */
  load(): BatchFeatureFlagsResponse | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      // Check if data is stale (older than 1 hour)
      const isStale = Date.now() - parsed.cachedAt > 60 * 60 * 1000;
      if (isStale) {
        this.clear();
        return null;
      }

      // Remove the cachedAt property before returning
      const { cachedAt, ...data } = parsed;
      return data;
    } catch (error) {
      console.warn('[LocalStorageCache] Failed to load from localStorage:', error);
      this.clear();
      return null;
    }
  },

  /**
   * Clears feature flags from local storage
   */
  clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('[LocalStorageCache] Failed to clear localStorage:', error);
    }
  }
};

/**
 * Development and debugging helpers
 */
export const FeatureFlagDevTools = {
  /**
   * Logs current feature flag states to console
   */
  logFeatureFlags(flags: Record<FeatureFlag, FeatureFlagEvaluationResult>): void {
    console.group('🚩 Feature Flags Status');
    Object.entries(flags).forEach(([flag, result]) => {
      const status = result.state.enabled ? '✅ ENABLED' : '❌ DISABLED';
      const source = result.state.source.toUpperCase();
      console.log(`${flag}: ${status} (${source})`);
      if (result.state.reason) {
        console.log(`  └─ ${result.state.reason}`);
      }
    });
    console.groupEnd();
  },

  /**
   * Creates a temporary override for a feature flag (development only)
   */
  overrideFlag(flag: FeatureFlag, enabled: boolean): void {
    if (!import.meta.env.DEV) {
      console.warn('[FeatureFlagDevTools] Flag overrides only work in development mode');
      return;
    }

    const overrideKey = `ff-override-${flag}`;
    sessionStorage.setItem(overrideKey, enabled.toString());
    console.log(`🚩 Feature flag ${flag} overridden to: ${enabled}`);
    console.log('Reload the page to apply the override');
  },

  /**
   * Gets a development override for a feature flag
   */
  getOverride(flag: FeatureFlag): boolean | null {
    if (!import.meta.env.DEV) return null;

    const overrideKey = `ff-override-${flag}`;
    const override = sessionStorage.getItem(overrideKey);
    return override ? override === 'true' : null;
  },

  /**
   * Clears all development overrides
   */
  clearOverrides(): void {
    if (!import.meta.env.DEV) return;

    Object.values(FeatureFlag).forEach(flag => {
      const overrideKey = `ff-override-${flag}`;
      sessionStorage.removeItem(overrideKey);
    });
    console.log('🚩 All feature flag overrides cleared');
  },

  /**
   * Shows a UI panel for managing feature flags (development only)
   */
  showDebugPanel(): void {
    if (!import.meta.env.DEV) {
      console.warn('[FeatureFlagDevTools] Debug panel only available in development mode');
      return;
    }

    // This could be enhanced with a proper UI component
    console.log('🚩 Feature Flag Debug Panel');
    console.log('Available commands:');
    console.log('- FeatureFlagDevTools.overrideFlag(flag, boolean)');
    console.log('- FeatureFlagDevTools.clearOverrides()');
    console.log('- FeatureFlagDevTools.logFeatureFlags(flags)');
  }
};

/**
 * Gets the current environment
 */
export function getCurrentEnvironment(): Environment {
  const env = import.meta.env.MODE;
  switch (env) {
    case 'development':
      return 'development';
    case 'staging':
      return 'staging';
    case 'production':
      return 'production';
    default:
      return 'development';
  }
}

/**
 * Creates a feature flag context from current environment and user
 */
export function createFeatureFlagContext(
  overrides?: Partial<FeatureFlagContext>
): FeatureFlagContext {
  return {
    environment: getCurrentEnvironment(),
    ...overrides
  };
}

/**
 * Validates feature flag evaluation result
 */
export function validateFeatureFlagResult(
  result: any,
  flag: FeatureFlag
): result is FeatureFlagEvaluationResult {
  if (!result || typeof result !== 'object') {
    console.error(`[FeatureFlagValidation] Invalid result for ${flag}:`, result);
    return false;
  }

  if (result.flag !== flag) {
    console.error(`[FeatureFlagValidation] Flag mismatch for ${flag}:`, result.flag);
    return false;
  }

  if (!result.state || typeof result.state.enabled !== 'boolean') {
    console.error(`[FeatureFlagValidation] Invalid state for ${flag}:`, result.state);
    return false;
  }

  return true;
}