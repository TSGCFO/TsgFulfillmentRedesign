/**
 * Server-side Feature Flag Utilities
 * 
 * This module provides server-specific utility functions for feature flag operations,
 * including initialization, health checks, logging, and monitoring helpers.
 */

import { 
  FeatureFlag, 
  FeatureFlagContext, 
  Environment, 
  UserRole,
  FeatureFlagError 
} from '../../shared/feature-flags';
import { getFeatureFlagManager, FeatureFlagManager } from '../../shared/feature-flag-manager';

/**
 * Configuration options for server-side feature flag utilities
 */
export interface ServerFeatureFlagConfig {
  /** Whether to enable detailed logging */
  enableLogging?: boolean;
  
  /** Whether to enable debug mode */
  debug?: boolean;
  
  /** Cache duration in milliseconds */
  cacheDuration?: number;
  
  /** Whether to run in strict mode */
  strict?: boolean;
  
  /** Custom logger function */
  logger?: (level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) => void;
}

/**
 * Health check result interface
 */
export interface FeatureFlagHealthCheck {
  healthy: boolean;
  initialized: boolean;
  cacheSize: number;
  environment: Environment;
  totalFlags: number;
  errors: string[];
  timestamp: string;
}

/**
 * Feature flag usage statistics
 */
export interface FeatureFlagStats {
  totalEvaluations: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
  lastEvaluation: string | null;
  topFlags: Array<{ flag: FeatureFlag; count: number }>;
}

/**
 * Internal statistics tracking
 */
class FeatureFlagStatsTracker {
  private stats: FeatureFlagStats = {
    totalEvaluations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errorCount: 0,
    lastEvaluation: null,
    topFlags: []
  };
  
  private flagCounts = new Map<FeatureFlag, number>();

  recordEvaluation(flag: FeatureFlag, fromCache: boolean = false): void {
    this.stats.totalEvaluations++;
    this.stats.lastEvaluation = new Date().toISOString();
    
    if (fromCache) {
      this.stats.cacheHits++;
    } else {
      this.stats.cacheMisses++;
    }
    
    // Track flag usage
    const currentCount = this.flagCounts.get(flag) || 0;
    this.flagCounts.set(flag, currentCount + 1);
    
    // Update top flags (keep top 10)
    this.updateTopFlags();
  }

  recordError(): void {
    this.stats.errorCount++;
  }

  getStats(): FeatureFlagStats {
    return { ...this.stats };
  }

  reset(): void {
    this.stats = {
      totalEvaluations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errorCount: 0,
      lastEvaluation: null,
      topFlags: []
    };
    this.flagCounts.clear();
  }

  private updateTopFlags(): void {
    this.stats.topFlags = Array.from(this.flagCounts.entries())
      .map(([flag, count]) => ({ flag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

// Global stats tracker instance
const statsTracker = new FeatureFlagStatsTracker();

/**
 * Initialize the feature flag system for server startup
 */
export async function initializeFeatureFlags(config: ServerFeatureFlagConfig = {}): Promise<void> {
  const logger = config.logger || console.log;
  
  try {
    logger('info', 'Initializing server-side feature flag system...');
    
    const manager = getFeatureFlagManager({
      debug: config.debug ?? false,
      cacheDuration: config.cacheDuration ?? 5 * 60 * 1000,
      strict: config.strict ?? true,
      logger: config.logger
    });

    await manager.initialize();
    
    logger('info', 'Feature flag system initialized successfully');
    
    // Log current environment and flag states for debugging
    if (config.enableLogging || config.debug) {
      logInitialFeatureFlagStates(manager, logger);
    }
    
  } catch (error) {
    logger('error', 'Failed to initialize feature flag system', error);
    
    if (config.strict !== false) {
      throw new FeatureFlagError('Feature flag system initialization failed');
    }
  }
}

/**
 * Log initial feature flag states for debugging
 */
function logInitialFeatureFlagStates(
  manager: FeatureFlagManager, 
  logger: (level: string, message: string, data?: any) => void
): void {
  const environment = (process.env.NODE_ENV || 'development') as Environment;
  
  // Create a basic context for initial logging
  const context: FeatureFlagContext = {
    environment,
    userId: 'system',
    userRole: 'SuperAdmin'
  };

  const allFlags = manager.getAll(context);
  const enabledFlags = Object.entries(allFlags).filter(([_, enabled]) => enabled);
  const disabledFlags = Object.entries(allFlags).filter(([_, enabled]) => !enabled);

  logger('info', `Feature flag states for ${environment} environment:`, {
    total: Object.keys(allFlags).length,
    enabled: enabledFlags.length,
    disabled: disabledFlags.length,
    enabledFlags: enabledFlags.map(([flag]) => flag),
    disabledFlags: disabledFlags.map(([flag]) => flag)
  });
}

/**
 * Perform health check on the feature flag system
 */
export function performHealthCheck(): FeatureFlagHealthCheck {
  const errors: string[] = [];
  let healthy = true;
  let initialized = false;
  let cacheSize = 0;
  
  try {
    const manager = getFeatureFlagManager();
    
    // Check if manager is initialized by trying a simple operation
    const environment = (process.env.NODE_ENV || 'development') as Environment;
    const testContext: FeatureFlagContext = { environment };
    
    try {
      manager.getAll(testContext);
      initialized = true;
    } catch (error) {
      errors.push('Manager not initialized');
      healthy = false;
    }
    
    // Get cache statistics
    try {
      const cacheStats = manager.getCacheStats();
      cacheSize = cacheStats.size;
    } catch (error) {
      errors.push('Cannot access cache statistics');
    }
    
  } catch (error) {
    errors.push(`Manager instance error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    healthy = false;
  }

  const totalFlags = Object.keys(FeatureFlag).length;

  return {
    healthy,
    initialized,
    cacheSize,
    environment: (process.env.NODE_ENV || 'development') as Environment,
    totalFlags,
    errors,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get feature flag usage statistics
 */
export function getFeatureFlagStats(): FeatureFlagStats {
  return statsTracker.getStats();
}

/**
 * Reset feature flag statistics
 */
export function resetFeatureFlagStats(): void {
  statsTracker.reset();
}

/**
 * Enhanced feature flag checker with logging and stats tracking
 */
export function checkFeatureFlag(
  flag: FeatureFlag, 
  context: FeatureFlagContext,
  options: { enableLogging?: boolean; trackStats?: boolean } = {}
): boolean {
  const { enableLogging = false, trackStats = true } = options;
  
  try {
    const manager = getFeatureFlagManager();
    const cacheStats = manager.getCacheStats();
    const beforeCacheSize = cacheStats.size;
    
    const result = manager.isEnabled(flag, context);
    
    // Check if this was a cache hit
    const afterCacheSize = manager.getCacheStats().size;
    const fromCache = afterCacheSize === beforeCacheSize;
    
    if (trackStats) {
      statsTracker.recordEvaluation(flag, fromCache);
    }
    
    if (enableLogging) {
      console.info(`Feature flag ${flag} evaluated: ${result}`, {
        flag,
        enabled: result,
        context: {
          environment: context.environment,
          userId: context.userId ? '[REDACTED]' : undefined,
          userRole: context.userRole
        },
        fromCache
      });
    }
    
    return result;
  } catch (error) {
    if (trackStats) {
      statsTracker.recordError();
    }
    
    console.error(`Error checking feature flag ${flag}:`, error);
    return false; // Fail safely
  }
}

/**
 * Create a server-side context from basic parameters
 */
export function createServerContext(
  userId?: string,
  userRole?: UserRole,
  clientId?: string,
  additionalMetadata?: Record<string, any>
): FeatureFlagContext {
  const environment = (process.env.NODE_ENV || 'development') as Environment;
  
  return {
    environment,
    userId,
    userRole,
    clientId,
    metadata: {
      source: 'server',
      timestamp: new Date().toISOString(),
      ...additionalMetadata
    }
  };
}

/**
 * Bulk feature flag evaluation for server operations
 */
export function evaluateMultipleFlags(
  flags: FeatureFlag[],
  context: FeatureFlagContext,
  options: { enableLogging?: boolean; trackStats?: boolean } = {}
): Record<FeatureFlag, boolean> {
  const results: Record<FeatureFlag, boolean> = {} as Record<FeatureFlag, boolean>;
  
  flags.forEach(flag => {
    results[flag] = checkFeatureFlag(flag, context, options);
  });
  
  return results;
}

/**
 * Clear feature flag cache with logging
 */
export function clearFeatureFlagCache(reason?: string): void {
  try {
    const manager = getFeatureFlagManager();
    const oldStats = manager.getCacheStats();
    
    manager.clearCache();
    
    console.info('Feature flag cache cleared', {
      reason: reason || 'Manual clear',
      previousCacheSize: oldStats.size,
      clearedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing feature flag cache:', error);
  }
}

/**
 * Validate server environment for feature flags
 */
export function validateServerEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (!nodeEnv || !['development', 'staging', 'production'].includes(nodeEnv)) {
    errors.push('NODE_ENV must be set to development, staging, or production');
  }
  
  // Check for any feature flag environment variables
  const featureFlagEnvVars = Object.keys(process.env).filter(key => 
    key.startsWith('FEATURE_') || key.startsWith('FF_')
  );
  
  if (featureFlagEnvVars.length > 0) {
    console.info(`Found ${featureFlagEnvVars.length} feature flag environment variables:`, 
      featureFlagEnvVars);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Monitor feature flag performance
 */
export function startFeatureFlagMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
  return setInterval(() => {
    const healthCheck = performHealthCheck();
    const stats = getFeatureFlagStats();
    
    console.info('Feature flag system status:', {
      healthy: healthCheck.healthy,
      cacheSize: healthCheck.cacheSize,
      totalEvaluations: stats.totalEvaluations,
      cacheHitRate: stats.totalEvaluations > 0 
        ? (stats.cacheHits / stats.totalEvaluations * 100).toFixed(2) + '%'
        : 'N/A',
      errors: stats.errorCount,
      topFlags: stats.topFlags.slice(0, 3) // Top 3 most used flags
    });
    
    if (!healthCheck.healthy) {
      console.warn('Feature flag system health check failed:', healthCheck.errors);
    }
  }, intervalMs);
}

/**
 * Stop feature flag monitoring
 */
export function stopFeatureFlagMonitoring(timer: NodeJS.Timeout): void {
  clearInterval(timer);
  console.info('Feature flag monitoring stopped');
}