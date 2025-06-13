import { describe, it, expect } from 'vitest';
import {
  FEATURE_FLAG_REGISTRY,
  getFeatureFlagConfig,
  getFeatureFlagsForEnvironment,
  getFeatureFlagsByOwner,
  getFeatureFlagsWithDependencies,
  validateFeatureFlagRegistry,
  ALL_FEATURE_FLAGS,
  FEATURE_FLAG_ENV_KEYS
} from '../feature-flag-registry';
import { FeatureFlag, Environment } from '../feature-flags';

describe('FeatureFlagRegistry', () => {
  describe('FEATURE_FLAG_REGISTRY', () => {
    it('should contain all defined feature flags', () => {
      const registryKeys = Object.keys(FEATURE_FLAG_REGISTRY);
      const enumValues = Object.values(FeatureFlag);
      
      expect(registryKeys).toEqual(expect.arrayContaining(enumValues));
      expect(registryKeys).toHaveLength(enumValues.length);
    });

    it('should have valid configuration for each feature flag', () => {
      Object.entries(FEATURE_FLAG_REGISTRY).forEach(([flag, config]) => {
        expect(config.name).toBe(flag);
        expect(config.key).toBeDefined();
        expect(typeof config.key).toBe('string');
        expect(config.description).toBeDefined();
        expect(typeof config.description).toBe('string');
        expect(typeof config.defaultValue).toBe('boolean');
        expect(Array.isArray(config.environments)).toBe(true);
        expect(config.environments.length).toBeGreaterThan(0);
        expect(typeof config.owner).toBe('string');
        expect(config.owner).toBeTruthy();
      });
    });

    it('should have unique environment variable keys', () => {
      const envKeys = Object.values(FEATURE_FLAG_REGISTRY).map(config => config.key);
      const uniqueKeys = new Set(envKeys);
      expect(envKeys).toHaveLength(uniqueKeys.size);
    });
  });

  describe('getFeatureFlagConfig', () => {
    it('should return correct configuration for valid flags', () => {
      const config = getFeatureFlagConfig(FeatureFlag.NEW_DASHBOARD);
      expect(config).toBeDefined();
      expect(config.name).toBe(FeatureFlag.NEW_DASHBOARD);
      expect(config.key).toBe('FEATURE_UI_NEW_DASHBOARD');
    });

    it('should throw error for invalid flags', () => {
      expect(() => getFeatureFlagConfig('INVALID_FLAG' as FeatureFlag))
        .toThrow('Feature flag configuration not found for: INVALID_FLAG');
    });
  });

  describe('getFeatureFlagsForEnvironment', () => {
    it('should return flags available in development environment', () => {
      const devFlags = getFeatureFlagsForEnvironment('development');
      expect(devFlags).toContain(FeatureFlag.NEW_DASHBOARD);
      expect(devFlags).toContain(FeatureFlag.PERFORMANCE_CACHING);
    });

    it('should exclude flags not available in specific environments', () => {
      const devFlags = getFeatureFlagsForEnvironment('development');
      // DOCUMENT_SIGNING is only available in staging and production
      expect(devFlags).not.toContain(FeatureFlag.DOCUMENT_SIGNING);
    });
  });

  describe('getFeatureFlagsByOwner', () => {
    it('should return flags owned by specific teams', () => {
      const frontendFlags = getFeatureFlagsByOwner('Frontend Team');
      expect(frontendFlags).toContain(FeatureFlag.NEW_DASHBOARD);
      
      const infrastructureFlags = getFeatureFlagsByOwner('Infrastructure Team');
      expect(infrastructureFlags).toContain(FeatureFlag.PERFORMANCE_CACHING);
    });

    it('should return empty array for non-existent owners', () => {
      const flags = getFeatureFlagsByOwner('Non-existent Team');
      expect(flags).toEqual([]);
    });
  });

  describe('getFeatureFlagsWithDependencies', () => {
    it('should return flags that have dependencies', () => {
      const flagsWithDeps = getFeatureFlagsWithDependencies();
      expect(flagsWithDeps).toContain(FeatureFlag.ENHANCED_SEARCH);
      expect(flagsWithDeps).toContain(FeatureFlag.HUBSPOT_V2);
    });

    it('should not include flags without dependencies', () => {
      const flagsWithDeps = getFeatureFlagsWithDependencies();
      expect(flagsWithDeps).not.toContain(FeatureFlag.PERFORMANCE_CACHING);
    });
  });

  describe('validateFeatureFlagRegistry', () => {
    it('should validate current registry without errors', () => {
      const errors = validateFeatureFlagRegistry();
      expect(errors).toEqual([]);
    });
  });

  describe('ALL_FEATURE_FLAGS', () => {
    it('should contain all feature flag enum values', () => {
      const enumValues = Object.values(FeatureFlag);
      expect(ALL_FEATURE_FLAGS).toEqual(expect.arrayContaining(enumValues));
      expect(ALL_FEATURE_FLAGS).toHaveLength(enumValues.length);
    });
  });

  describe('FEATURE_FLAG_ENV_KEYS', () => {
    it('should map feature flags to their environment variable keys', () => {
      expect(FEATURE_FLAG_ENV_KEYS[FeatureFlag.NEW_DASHBOARD]).toBe('FEATURE_UI_NEW_DASHBOARD');
      expect(FEATURE_FLAG_ENV_KEYS[FeatureFlag.PERFORMANCE_CACHING]).toBe('FEATURE_PERFORMANCE_CACHING');
    });

    it('should contain keys for all feature flags', () => {
      const flagKeys = Object.keys(FEATURE_FLAG_ENV_KEYS);
      const enumValues = Object.values(FeatureFlag);
      expect(flagKeys).toEqual(expect.arrayContaining(enumValues));
    });
  });
});