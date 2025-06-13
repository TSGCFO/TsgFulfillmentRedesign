/**
 * Feature Flag Manager
 * 
 * This module contains the core FeatureFlagManager class that handles
 * feature flag evaluation, caching, dependency resolution, and context-aware
 * decision making. It implements the singleton pattern to ensure consistent
 * state across the application.
 */

import {
  FeatureFlag,
  FeatureFlagConfig,
  FeatureFlagContext,
  FeatureFlagState,
  FeatureFlagEvaluationResult,
  FeatureFlagManagerOptions,
  FeatureFlagError,
  FeatureFlagDependencyError,
  FeatureFlagConfigError,
  Environment,
  UserRole
} from './feature-flags';

import { FEATURE_FLAG_REGISTRY, getFeatureFlagConfig } from './feature-flag-registry';

/**
 * Core Feature Flag Manager implementing singleton pattern
 * Handles all feature flag operations including evaluation, caching, and dependency resolution
 */
export class FeatureFlagManager {
  private static instance: FeatureFlagManager | null = null;
  private readonly cache = new Map<string, { state: FeatureFlagState; expiresAt: number }>();
  private readonly options: Required<FeatureFlagManagerOptions>;
  private initialized = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(options: FeatureFlagManagerOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      cacheDuration: options.cacheDuration ?? 5 * 60 * 1000, // 5 minutes
      strict: options.strict ?? true,
      logger: options.logger ?? this.defaultLogger
    };

    this.log('info', 'FeatureFlagManager initialized', { options: this.options });
  }

  /**
   * Get or create the singleton instance
   */
  public static getInstance(options?: FeatureFlagManagerOptions): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager(options);
    }
    return FeatureFlagManager.instance;
  }

  /**
   * Initialize the feature flag manager
   * Validates the registry and sets up initial state
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      this.log('warn', 'FeatureFlagManager already initialized');
      return;
    }

    this.log('info', 'Initializing FeatureFlagManager...');

    try {
      // Validate the feature flag registry
      this.validateRegistry();

      // Initialize all feature flags
      await this.initializeFeatureStates();

      this.initialized = true;
      this.log('info', 'FeatureFlagManager initialization complete');
    } catch (error) {
      this.log('error', 'Failed to initialize FeatureFlagManager', error);
      if (this.options.strict) {
        throw error;
      }
    }
  }

  /**
   * Check if a feature flag is enabled for the given context
   */
  public isEnabled(flag: FeatureFlag, context: FeatureFlagContext): boolean {
    try {
      const result = this.evaluate(flag, context);
      return result.state.enabled;
    } catch (error) {
      this.log('error', `Error checking feature flag ${flag}`, error);
      if (this.options.strict) {
        throw error;
      }
      // Return default value on error in non-strict mode
      return this.getDefaultValue(flag);
    }
  }

  /**
   * Evaluate a feature flag and return detailed result
   */
  public evaluate(flag: FeatureFlag, context: FeatureFlagContext): FeatureFlagEvaluationResult {
    this.ensureInitialized();

    const cacheKey = this.getCacheKey(flag, context);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      this.log('debug', `Cache hit for feature flag ${flag}`, { cacheKey });
      return {
        flag,
        state: cached,
        context,
      };
    }

    const config = getFeatureFlagConfig(flag);
    const state = this.evaluateFeatureFlag(config, context);
    
    // Cache the result
    this.setCache(cacheKey, state);

    // Build evaluation result with dependencies
    const result: FeatureFlagEvaluationResult = {
      flag,
      state,
      context,
    };

    // Evaluate dependencies if present
    if (config.dependencies && config.dependencies.length > 0) {
      result.dependencyResults = config.dependencies.map(dep => 
        this.evaluate(dep, context)
      );
    }

    this.log('debug', `Feature flag ${flag} evaluated`, { result });

    return result;
  }

  /**
   * Get multiple feature flags at once
   */
  public getMultiple(flags: FeatureFlag[], context: FeatureFlagContext): Record<FeatureFlag, boolean> {
    const results: Record<FeatureFlag, boolean> = {} as Record<FeatureFlag, boolean>;
    
    flags.forEach(flag => {
      results[flag] = this.isEnabled(flag, context);
    });

    return results;
  }

  /**
   * Get all feature flags for a specific context
   */
  public getAll(context: FeatureFlagContext): Record<FeatureFlag, boolean> {
    const allFlags = Object.values(FeatureFlag);
    return this.getMultiple(allFlags, context);
  }

  /**
   * Clear the cache (useful for testing or forced refresh)
   */
  public clearCache(): void {
    this.cache.clear();
    this.log('info', 'Feature flag cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Parse environment variable to boolean
   * Supports various formats: true/false, 1/0, yes/no, on/off, enabled/disabled
   */
  public parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const normalized = value.toString().toLowerCase().trim();

    // Handle common boolean representations
    const truthyValues = ['true', '1', 'yes', 'on', 'enabled', 'enable'];
    const falsyValues = ['false', '0', 'no', 'off', 'disabled', 'disable'];

    if (truthyValues.includes(normalized)) {
      return true;
    }

    if (falsyValues.includes(normalized)) {
      return false;
    }

    this.log('warn', `Invalid boolean value: ${value}. Returning undefined.`);
    return undefined;
  }

  /**
   * Evaluate a single feature flag based on config and context
   */
  private evaluateFeatureFlag(config: FeatureFlagConfig, context: FeatureFlagContext): FeatureFlagState {
    const now = new Date();
    let enabled = config.defaultValue;
    let source: FeatureFlagState['source'] = 'default';
    let reason: string | undefined;

    // Check environment availability
    if (!config.environments.includes(context.environment)) {
      return {
        enabled: false,
        source: 'default',
        lastEvaluated: now,
        reason: `Feature not available in ${context.environment} environment`,
        dependenciesSatisfied: false
      };
    }

    // Check environment variable override
    const envValue = this.parseBoolean(process.env[config.key]);
    if (envValue !== undefined) {
      enabled = envValue;
      source = 'environment';
      reason = `Set via environment variable ${config.key}`;
    }

    // Check role restrictions
    if (config.minimumRole && context.userRole) {
      const hasRequiredRole = this.hasRequiredRole(context.userRole, config.minimumRole);
      if (!hasRequiredRole) {
        enabled = false;
        source = 'role_restricted';
        reason = `User role ${context.userRole} does not meet minimum requirement: ${config.minimumRole}`;
      }
    }

    // Check dependencies
    const dependenciesSatisfied = this.checkDependencies(config, context);
    if (!dependenciesSatisfied && enabled) {
      enabled = false;
      source = 'dependency_disabled';
      reason = `Dependencies not satisfied: ${config.dependencies?.join(', ')}`;
    }

    // Check rollout percentage
    if (enabled && config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
      const userHash = this.getUserHash(context.userId || 'anonymous', config.name);
      const inRollout = userHash < config.rolloutPercentage;
      if (!inRollout) {
        enabled = false;
        source = 'rollout';
        reason = `User not in ${config.rolloutPercentage}% rollout`;
      }
    }

    return {
      enabled,
      source,
      lastEvaluated: now,
      reason,
      dependenciesSatisfied
    };
  }

  /**
   * Check if user has required role
   */
  private hasRequiredRole(userRole: UserRole, minimumRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      'User': 1,
      'Admin': 2,
      'SuperAdmin': 3
    };

    return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
  }

  /**
   * Check if all dependencies are satisfied
   */
  private checkDependencies(config: FeatureFlagConfig, context: FeatureFlagContext): boolean {
    if (!config.dependencies || config.dependencies.length === 0) {
      return true;
    }

    return config.dependencies.every(dep => {
      try {
        return this.isEnabled(dep, context);
      } catch (error) {
        this.log('warn', `Error checking dependency ${dep} for ${config.name}`, error);
        return false;
      }
    });
  }

  /**
   * Generate cache key for a feature flag and context
   */
  private getCacheKey(flag: FeatureFlag, context: FeatureFlagContext): string {
    const keyParts = [
      flag,
      context.environment,
      context.userId || 'anonymous',
      context.userRole || 'none',
      context.clientId || 'none'
    ];
    return keyParts.join(':');
  }

  /**
   * Get from cache if not expired
   */
  private getFromCache(key: string): FeatureFlagState | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.state;
    }
    if (cached) {
      this.cache.delete(key); // Remove expired entry
    }
    return null;
  }

  /**
   * Set cache with expiration
   */
  private setCache(key: string, state: FeatureFlagState): void {
    this.cache.set(key, {
      state,
      expiresAt: Date.now() + this.options.cacheDuration
    });
  }

  /**
   * Generate consistent hash for user and feature flag
   */
  private getUserHash(userId: string, featureFlag: string): number {
    const str = `${userId}:${featureFlag}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100; // Return 0-99
  }

  /**
   * Validate the feature flag registry
   */
  private validateRegistry(): void {
    const errors: string[] = [];

    // Check for duplicate environment variable keys
    const envKeys = new Set<string>();
    Object.values(FEATURE_FLAG_REGISTRY).forEach(config => {
      if (envKeys.has(config.key)) {
        errors.push(`Duplicate environment variable key: ${config.key}`);
      }
      envKeys.add(config.key);
    });

    // Validate dependencies exist
    Object.values(FEATURE_FLAG_REGISTRY).forEach(config => {
      if (config.dependencies) {
        config.dependencies.forEach(dep => {
          if (!(dep in FEATURE_FLAG_REGISTRY)) {
            errors.push(`Feature flag ${config.name} depends on non-existent flag: ${dep}`);
          }
        });
      }
    });

    if (errors.length > 0) {
      const errorMessage = `Feature flag registry validation failed:\n${errors.join('\n')}`;
      throw new FeatureFlagConfigError(errorMessage);
    }
  }

  /**
   * Initialize feature states
   */
  private async initializeFeatureStates(): Promise<void> {
    const flags = Object.keys(FEATURE_FLAG_REGISTRY) as FeatureFlag[];
    
    this.log('info', `Initializing ${flags.length} feature flags...`);

    // Log environment variable status
    flags.forEach(flag => {
      const config = FEATURE_FLAG_REGISTRY[flag];
      const envValue = process.env[config.key];
      const parsedValue = this.parseBoolean(envValue);
      
      this.log('debug', `Feature flag ${flag}`, {
        envKey: config.key,
        envValue,
        parsedValue,
        defaultValue: config.defaultValue
      });
    });
  }

  /**
   * Get default value for a feature flag
   */
  private getDefaultValue(flag: FeatureFlag): boolean {
    const config = FEATURE_FLAG_REGISTRY[flag];
    return config?.defaultValue ?? false;
  }

  /**
   * Ensure manager is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new FeatureFlagError('FeatureFlagManager not initialized. Call initialize() first.');
    }
  }

  /**
   * Default logger implementation
   */
  private defaultLogger = (level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void => {
    if (level === 'debug' && !this.options.debug) {
      return; // Skip debug logs if debug mode is disabled
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [FeatureFlagManager] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  };

  /**
   * Internal logging helper
   */
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    this.options.logger(level, message, data);
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  public static reset(): void {
    FeatureFlagManager.instance = null;
  }
}

/**
 * Convenience function to get the singleton instance
 */
export function getFeatureFlagManager(options?: FeatureFlagManagerOptions): FeatureFlagManager {
  return FeatureFlagManager.getInstance(options);
}

/**
 * Convenience function to quickly check if a feature is enabled
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  context: FeatureFlagContext
): boolean {
  const manager = getFeatureFlagManager();
  return manager.isEnabled(flag, context);
}

/**
 * Export the manager class as default
 */
export default FeatureFlagManager;