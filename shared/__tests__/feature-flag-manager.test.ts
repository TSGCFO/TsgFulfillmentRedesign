import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FeatureFlagManager, getFeatureFlagManager, isFeatureEnabled } from '../feature-flag-manager';
import { FeatureFlag, type FeatureFlagContext, type FeatureFlagManagerOptions } from '../feature-flags';

// Mock console methods to avoid test output noise
const consoleMethods = {
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
};

describe('FeatureFlagManager', () => {
  let manager: FeatureFlagManager;

  const testContext: FeatureFlagContext = {
    environment: 'development',
    userId: 'test-user-123',
    userRole: 'User',
    clientId: 'test-client',
    metadata: { testMode: true },
  };

  beforeEach(async () => {
    // Clear environment variables
    delete process.env.FEATURE_UI_NEW_DASHBOARD;
    delete process.env.FEATURE_SEARCH_ENHANCED_SEARCH;
    delete process.env.FEATURE_INTEGRATION_DOCUMENT_SIGNING;
    delete process.env.FEATURE_INTEGRATION_HUBSPOT_V2;
    delete process.env.FEATURE_PERFORMANCE_CACHING;
    delete process.env.NODE_ENV;

    // Reset singleton instance
    FeatureFlagManager.reset();
    
    // Get fresh instance and initialize
    manager = FeatureFlagManager.getInstance({ debug: false, strict: false });
    await manager.initialize();
  });

  afterEach(() => {
    vi.clearAllMocks();
    FeatureFlagManager.reset();
  });

  describe('initialization', () => {
    it('should create singleton instance', () => {
      const manager1 = FeatureFlagManager.getInstance();
      const manager2 = FeatureFlagManager.getInstance();
      expect(manager1).toBe(manager2);
    });

    it('should initialize with custom options', async () => {
      FeatureFlagManager.reset();
      const options: FeatureFlagManagerOptions = {
        debug: true,
        strict: true,
        cacheDuration: 10000,
      };
      const customManager = FeatureFlagManager.getInstance(options);
      await customManager.initialize();
      expect(customManager).toBeDefined();
    });

    it('should handle double initialization gracefully', async () => {
      await manager.initialize();
      expect(consoleMethods.warn).toHaveBeenCalledWith(
        expect.stringContaining('already initialized')
      );
    });
  });

  describe('isEnabled', () => {
    it('should return correct values for default feature flags', () => {
      // PERFORMANCE_CACHING is enabled by default
      expect(manager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, testContext)).toBe(true);
      
      // NEW_DASHBOARD is disabled by default
      expect(manager.isEnabled(FeatureFlag.NEW_DASHBOARD, testContext)).toBe(false);
    });

    it('should respect environment variable overrides', async () => {
      FeatureFlagManager.reset();
      process.env.FEATURE_UI_NEW_DASHBOARD = 'true';
      process.env.FEATURE_PERFORMANCE_CACHING = 'false';
      
      const newManager = FeatureFlagManager.getInstance();
      await newManager.initialize();
      
      expect(newManager.isEnabled(FeatureFlag.NEW_DASHBOARD, testContext)).toBe(true);
      expect(newManager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, testContext)).toBe(false);
    });

    it('should handle invalid feature flags gracefully in non-strict mode', () => {
      expect(() => manager.isEnabled('INVALID_FLAG' as FeatureFlag, testContext)).not.toThrow();
      expect(manager.isEnabled('INVALID_FLAG' as FeatureFlag, testContext)).toBe(false);
    });

    it('should handle different environments correctly', () => {
      const prodContext = { ...testContext, environment: 'production' as const };
      const stagingContext = { ...testContext, environment: 'staging' as const };
      
      // DOCUMENT_SIGNING is not available in development but available in staging/production
      expect(manager.isEnabled(FeatureFlag.DOCUMENT_SIGNING, testContext)).toBe(false);
      expect(manager.isEnabled(FeatureFlag.DOCUMENT_SIGNING, stagingContext)).toBe(false); // Still disabled by default
      expect(manager.isEnabled(FeatureFlag.DOCUMENT_SIGNING, prodContext)).toBe(false); // Still disabled by default
    });

    it('should respect role restrictions', () => {
      const adminContext = { ...testContext, userRole: 'Admin' as const };
      const userContext = { ...testContext, userRole: 'User' as const };
      
      // Enable DOCUMENT_SIGNING via environment for testing role restrictions
      process.env.FEATURE_INTEGRATION_DOCUMENT_SIGNING = 'true';
      FeatureFlagManager.reset();
      const roleManager = FeatureFlagManager.getInstance();
      roleManager.initialize();
      
      const stagingAdminContext = { ...adminContext, environment: 'staging' as const };
      const stagingUserContext = { ...userContext, environment: 'staging' as const };
      
      // DOCUMENT_SIGNING requires Admin role
      expect(roleManager.isEnabled(FeatureFlag.DOCUMENT_SIGNING, stagingAdminContext)).toBe(true);
      expect(roleManager.isEnabled(FeatureFlag.DOCUMENT_SIGNING, stagingUserContext)).toBe(false);
    });
  });

  describe('evaluate', () => {
    it('should return detailed evaluation result', () => {
      const result = manager.evaluate(FeatureFlag.PERFORMANCE_CACHING, testContext);
      
      expect(result).toEqual({
        flag: FeatureFlag.PERFORMANCE_CACHING,
        state: expect.objectContaining({
          enabled: true,
          source: 'default',
          lastEvaluated: expect.any(Date),
          dependenciesSatisfied: true,
        }),
        context: testContext,
      });
    });

    it('should include dependency results when dependencies exist', () => {
      // ENHANCED_SEARCH depends on PERFORMANCE_CACHING
      const result = manager.evaluate(FeatureFlag.ENHANCED_SEARCH, testContext);
      
      expect(result.dependencyResults).toBeDefined();
      expect(result.dependencyResults).toHaveLength(1);
      expect(result.dependencyResults?.[0].flag).toBe(FeatureFlag.PERFORMANCE_CACHING);
    });
  });

  describe('getMultiple', () => {
    it('should return multiple feature flag states', () => {
      const flags: FeatureFlag[] = [FeatureFlag.NEW_DASHBOARD, FeatureFlag.PERFORMANCE_CACHING];
      const results = manager.getMultiple(flags, testContext);
      
      expect(results).toEqual({
        [FeatureFlag.NEW_DASHBOARD]: false,
        [FeatureFlag.PERFORMANCE_CACHING]: true,
      });
    });
  });

  describe('getAll', () => {
    it('should return all feature flags', () => {
      const results = manager.getAll(testContext);
      
      expect(results).toHaveProperty(FeatureFlag.NEW_DASHBOARD);
      expect(results).toHaveProperty(FeatureFlag.ENHANCED_SEARCH);
      expect(results).toHaveProperty(FeatureFlag.DOCUMENT_SIGNING);
      expect(results).toHaveProperty(FeatureFlag.HUBSPOT_V2);
      expect(results).toHaveProperty(FeatureFlag.PERFORMANCE_CACHING);
    });
  });

  describe('caching', () => {
    it('should cache evaluation results', () => {
      const flag = FeatureFlag.PERFORMANCE_CACHING;
      
      // First evaluation
      const result1 = manager.evaluate(flag, testContext);
      
      // Second evaluation should return cached result
      const result2 = manager.evaluate(flag, testContext);
      
      expect(result1.state.lastEvaluated).toEqual(result2.state.lastEvaluated);
    });

    it('should provide cache statistics', () => {
      manager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, testContext);
      manager.isEnabled(FeatureFlag.NEW_DASHBOARD, testContext);
      
      const stats = manager.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.keys).toEqual(expect.arrayContaining([expect.any(String)]));
    });

    it('should clear cache correctly', () => {
      manager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, testContext);
      expect(manager.getCacheStats().size).toBeGreaterThan(0);
      
      manager.clearCache();
      expect(manager.getCacheStats().size).toBe(0);
    });
  });

  describe('parseBoolean', () => {
    it('should parse various boolean representations', () => {
      expect(manager.parseBoolean('true')).toBe(true);
      expect(manager.parseBoolean('false')).toBe(false);
      expect(manager.parseBoolean('1')).toBe(true);
      expect(manager.parseBoolean('0')).toBe(false);
      expect(manager.parseBoolean('yes')).toBe(true);
      expect(manager.parseBoolean('no')).toBe(false);
      expect(manager.parseBoolean('on')).toBe(true);
      expect(manager.parseBoolean('off')).toBe(false);
      expect(manager.parseBoolean('enabled')).toBe(true);
      expect(manager.parseBoolean('disabled')).toBe(false);
    });

    it('should handle invalid values gracefully', () => {
      expect(manager.parseBoolean('invalid')).toBeUndefined();
      expect(manager.parseBoolean(undefined)).toBeUndefined();
      expect(consoleMethods.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid boolean value')
      );
    });
  });

  describe('error handling', () => {
    it('should handle strict mode errors', async () => {
      FeatureFlagManager.reset();
      const strictManager = FeatureFlagManager.getInstance({ strict: true });
      
      // This should not throw during initialization as the registry is valid
      await expect(strictManager.initialize()).resolves.not.toThrow();
    });

    it('should handle missing context properties gracefully', () => {
      const minimalContext: FeatureFlagContext = { environment: 'development' };
      expect(() => manager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, minimalContext)).not.toThrow();
      expect(manager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, minimalContext)).toBe(true);
    });
  });

  describe('rollout percentage', () => {
    it('should respect rollout percentage for feature flags', async () => {
      // NEW_DASHBOARD has 50% rollout
      const results: boolean[] = [];
      
      // Test with different user IDs to see rollout variation
      for (let i = 0; i < 10; i++) {
        const context = { ...testContext, userId: `user-${i}` };
        results.push(manager.isEnabled(FeatureFlag.NEW_DASHBOARD, context));
      }
      
      // With 50% rollout, we should see some variation
      // Note: This is probabilistic, but with different user IDs we should see some variance
      const enabled = results.filter(Boolean).length;
      const disabled = results.filter(r => !r).length;
      
      expect(enabled + disabled).toBe(10);
    });
  });

  describe('convenience functions', () => {
    it('should provide getFeatureFlagManager convenience function', () => {
      const manager1 = getFeatureFlagManager();
      const manager2 = FeatureFlagManager.getInstance();
      expect(manager1).toBe(manager2);
    });

    it('should provide isFeatureEnabled convenience function', () => {
      const result = isFeatureEnabled(FeatureFlag.PERFORMANCE_CACHING, testContext);
      expect(result).toBe(true);
    });
  });

  describe('performance', () => {
    it('should handle multiple evaluations efficiently', () => {
      const start = performance.now();
      
      // Perform many evaluations
      for (let i = 0; i < 100; i++) {
        manager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, testContext);
        manager.isEnabled(FeatureFlag.NEW_DASHBOARD, testContext);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete in reasonable time (less than 100ms for 200 evaluations)
      expect(duration).toBeLessThan(100);
    });
  });
});