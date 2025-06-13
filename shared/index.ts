/**
 * Feature Flag System - Main Export
 * 
 * This is the main entry point for the feature flag system.
 * Import from this file to access all feature flag functionality.
 */

// Import types for internal use
import type { FeatureFlagManagerOptions } from './feature-flags';
import { FeatureFlagManager, getFeatureFlagManager } from './feature-flag-manager';

// Export all types and interfaces
export {
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

// Export registry and helper functions
export {
  FEATURE_FLAG_REGISTRY,
  FEATURE_FLAG_ENV_KEYS,
  ALL_FEATURE_FLAGS,
  getFeatureFlagConfig,
  getFeatureFlagsForEnvironment,
  getFeatureFlagsByOwner,
  getFeatureFlagsWithDependencies,
  validateFeatureFlagRegistry
} from './feature-flag-registry';

// Export manager and convenience functions
export {
  FeatureFlagManager,
  getFeatureFlagManager,
  isFeatureEnabled
} from './feature-flag-manager';

// Export test utilities (for development/testing)
export {
  runFeatureFlagValidation,
  quickValidation
} from './feature-flag-test';

/**
 * Quick setup function for easy initialization
 * @param options - Optional configuration for the feature flag manager
 * @returns Promise that resolves when the system is ready
 */
export async function initializeFeatureFlags(options?: FeatureFlagManagerOptions): Promise<FeatureFlagManager> {
  const manager = getFeatureFlagManager(options);
  await manager.initialize();
  return manager;
}

/**
 * Default export - the FeatureFlagManager class
 */
export { FeatureFlagManager as default } from './feature-flag-manager';