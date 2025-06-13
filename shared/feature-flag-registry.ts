/**
 * Feature Flag Registry
 * 
 * This module contains the centralized registry of all feature flags
 * available in the system. Each flag is configured with its metadata,
 * environment availability, dependencies, and ownership information.
 */

import { FeatureFlag, FeatureFlagConfig, Environment } from './feature-flags';

/**
 * Centralized registry containing all feature flag configurations
 * This registry serves as the single source of truth for feature flag metadata
 */
export const FEATURE_FLAG_REGISTRY: Record<FeatureFlag, FeatureFlagConfig> = {
  /**
   * NEW_DASHBOARD - Enhanced employee portal dashboard
   * Enables the redesigned dashboard with improved analytics and user experience
   */
  [FeatureFlag.NEW_DASHBOARD]: {
    name: FeatureFlag.NEW_DASHBOARD,
    key: 'FEATURE_UI_NEW_DASHBOARD',
    description: 'Enable the new enhanced employee portal dashboard with improved analytics, modern UI components, and better user experience',
    defaultValue: false,
    environments: ['development', 'staging', 'production'],
    owner: 'Frontend Team',
    minimumRole: 'User',
    rolloutPercentage: 50, // Gradual rollout at 50%
  },

  /**
   * ENHANCED_SEARCH - Advanced search functionality
   * Provides enhanced search capabilities across all portal sections
   */
  [FeatureFlag.ENHANCED_SEARCH]: {
    name: FeatureFlag.ENHANCED_SEARCH,
    key: 'FEATURE_SEARCH_ENHANCED_SEARCH',
    description: 'Enable enhanced search functionality with filters, auto-complete, and advanced query capabilities across employee portal',
    defaultValue: false,
    environments: ['development', 'staging', 'production'],
    owner: 'Backend Team',
    minimumRole: 'User',
    dependencies: [FeatureFlag.PERFORMANCE_CACHING], // Requires caching for optimal performance
  },

  /**
   * DOCUMENT_SIGNING - DocuSign integration for contract management
   * Enables digital document signing capabilities through DocuSign API
   */
  [FeatureFlag.DOCUMENT_SIGNING]: {
    name: FeatureFlag.DOCUMENT_SIGNING,
    key: 'FEATURE_INTEGRATION_DOCUMENT_SIGNING',
    description: 'Enable DocuSign integration for digital contract signing, quote approvals, and document management workflows',
    defaultValue: false,
    environments: ['staging', 'production'], // Not available in development
    owner: 'Integration Team',
    minimumRole: 'Admin', // Restricted to Admin+ users
    clientSpecific: true, // Can be enabled for specific clients
  },

  /**
   * HUBSPOT_V2 - Upgraded HubSpot integration
   * Enables the new HubSpot API v2 integration with enhanced features
   */
  [FeatureFlag.HUBSPOT_V2]: {
    name: FeatureFlag.HUBSPOT_V2,
    key: 'FEATURE_INTEGRATION_HUBSPOT_V2',
    description: 'Enable HubSpot API v2 integration with improved contact management, deal tracking, and automated workflows',
    defaultValue: false,
    environments: ['development', 'staging', 'production'],
    owner: 'Integration Team',
    minimumRole: 'Admin',
    dependencies: [FeatureFlag.PERFORMANCE_CACHING], // Requires caching for API optimization
  },

  /**
   * PERFORMANCE_CACHING - Advanced caching system
   * Enables Redis-based caching for improved application performance
   */
  [FeatureFlag.PERFORMANCE_CACHING]: {
    name: FeatureFlag.PERFORMANCE_CACHING,
    key: 'FEATURE_PERFORMANCE_CACHING',
    description: 'Enable Redis-based caching system for database queries, API responses, and computed data to improve application performance',
    defaultValue: true, // Enabled by default for performance benefits
    environments: ['development', 'staging', 'production'],
    owner: 'Infrastructure Team',
    minimumRole: 'User', // Available to all users
  },
};

/**
 * Helper function to get a feature flag configuration by name
 * @param flag - The feature flag to retrieve
 * @returns The feature flag configuration
 * @throws Error if the flag is not found in the registry
 */
export function getFeatureFlagConfig(flag: FeatureFlag): FeatureFlagConfig {
  const config = FEATURE_FLAG_REGISTRY[flag];
  if (!config) {
    throw new Error(`Feature flag configuration not found for: ${flag}`);
  }
  return config;
}

/**
 * Helper function to get all feature flags available in a specific environment
 * @param environment - The environment to filter by
 * @returns Array of feature flags available in the specified environment
 */
export function getFeatureFlagsForEnvironment(environment: Environment): FeatureFlag[] {
  return Object.values(FEATURE_FLAG_REGISTRY)
    .filter(config => config.environments.includes(environment))
    .map(config => config.name);
}

/**
 * Helper function to get all feature flags owned by a specific team
 * @param owner - The team/owner to filter by
 * @returns Array of feature flags owned by the specified team
 */
export function getFeatureFlagsByOwner(owner: string): FeatureFlag[] {
  return Object.values(FEATURE_FLAG_REGISTRY)
    .filter(config => config.owner === owner)
    .map(config => config.name);
}

/**
 * Helper function to get all feature flags that have dependencies
 * @returns Array of feature flags that depend on other flags
 */
export function getFeatureFlagsWithDependencies(): FeatureFlag[] {
  return Object.values(FEATURE_FLAG_REGISTRY)
    .filter(config => config.dependencies && config.dependencies.length > 0)
    .map(config => config.name);
}

/**
 * Helper function to validate the feature flag registry
 * Checks for circular dependencies and missing dependency references
 * @returns Array of validation errors, empty if registry is valid
 */
export function validateFeatureFlagRegistry(): string[] {
  const errors: string[] = [];
  const allFlags = Object.keys(FEATURE_FLAG_REGISTRY) as FeatureFlag[];

  // Check for missing dependency references
  Object.values(FEATURE_FLAG_REGISTRY).forEach(config => {
    if (config.dependencies) {
      config.dependencies.forEach(dep => {
        if (!allFlags.includes(dep)) {
          errors.push(`Feature flag ${config.name} depends on non-existent flag: ${dep}`);
        }
      });
    }
  });

  // Check for circular dependencies (basic check)
  const checkCircularDependency = (flag: FeatureFlag, visited: Set<FeatureFlag>, path: FeatureFlag[]): boolean => {
    if (visited.has(flag)) {
      errors.push(`Circular dependency detected: ${path.join(' -> ')} -> ${flag}`);
      return true;
    }

    visited.add(flag);
    path.push(flag);

    const config = FEATURE_FLAG_REGISTRY[flag];
    if (config.dependencies) {
      for (const dep of config.dependencies) {
        if (checkCircularDependency(dep, new Set(visited), [...path])) {
          return true;
        }
      }
    }

    return false;
  };

  allFlags.forEach(flag => {
    checkCircularDependency(flag, new Set(), []);
  });

  return errors;
}

/**
 * Export all available feature flags as a constant array
 * Useful for iteration and validation purposes
 */
export const ALL_FEATURE_FLAGS: FeatureFlag[] = Object.values(FeatureFlag);

/**
 * Export environment variable keys for all feature flags
 * Useful for documentation and environment setup
 */
export const FEATURE_FLAG_ENV_KEYS: Record<FeatureFlag, string> = Object.fromEntries(
  Object.entries(FEATURE_FLAG_REGISTRY).map(([flag, config]) => [flag, config.key])
) as Record<FeatureFlag, string>;