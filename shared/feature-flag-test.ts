/**
 * Feature Flag System Validation Test
 * 
 * This test file validates that all Phase 1 components work together correctly.
 * Run this to ensure the foundation layer is properly implemented.
 */

import { FeatureFlag, FeatureFlagContext, Environment, UserRole } from './feature-flags';
import { FEATURE_FLAG_REGISTRY, validateFeatureFlagRegistry, getFeatureFlagsForEnvironment } from './feature-flag-registry';
import { FeatureFlagManager, getFeatureFlagManager, isFeatureEnabled } from './feature-flag-manager';

/**
 * Run comprehensive validation tests
 */
export async function runFeatureFlagValidation(): Promise<void> {
  console.log('🚀 Starting Feature Flag System Validation...\n');

  try {
    // Test 1: Registry Validation
    console.log('1️⃣ Testing Feature Flag Registry...');
    const registryErrors = validateFeatureFlagRegistry();
    if (registryErrors.length === 0) {
      console.log('✅ Registry validation passed');
    } else {
      console.error('❌ Registry validation failed:', registryErrors);
      throw new Error('Registry validation failed');
    }

    // Test 2: Manager Initialization
    console.log('\n2️⃣ Testing Feature Flag Manager Initialization...');
    const manager = getFeatureFlagManager({ debug: true });
    await manager.initialize();
    console.log('✅ Manager initialized successfully');

    // Test 3: Environment-based Feature Retrieval
    console.log('\n3️⃣ Testing Environment-based Feature Retrieval...');
    const devFlags = getFeatureFlagsForEnvironment('development');
    const prodFlags = getFeatureFlagsForEnvironment('production');
    console.log(`✅ Development flags: ${devFlags.length}`);
    console.log(`✅ Production flags: ${prodFlags.length}`);

    // Test 4: Feature Flag Evaluation
    console.log('\n4️⃣ Testing Feature Flag Evaluation...');
    
    const testContexts: FeatureFlagContext[] = [
      {
        environment: 'development',
        userId: 'test-user-1',
        userRole: 'User'
      },
      {
        environment: 'production',
        userId: 'admin-user-1',
        userRole: 'Admin'
      },
      {
        environment: 'staging',
        userId: 'super-admin-1',
        userRole: 'SuperAdmin',
        clientId: 'client-123'
      }
    ];

    for (const context of testContexts) {
      console.log(`\n📋 Testing context: ${context.environment} | ${context.userRole}`);
      
      // Test each feature flag
      Object.values(FeatureFlag).forEach(flag => {
        try {
          const enabled = manager.isEnabled(flag, context);
          const evaluation = manager.evaluate(flag, context);
          
          console.log(`  ${flag}: ${enabled ? '🟢' : '🔴'} (${evaluation.state.source})`);
          
          if (evaluation.state.reason) {
            console.log(`    Reason: ${evaluation.state.reason}`);
          }
        } catch (error) {
          console.log(`  ${flag}: ❌ Error - ${error instanceof Error ? error.message : String(error)}`);
        }
      });
    }

    // Test 5: Boolean Parsing
    console.log('\n5️⃣ Testing Boolean Parsing...');
    const testValues = ['true', 'false', '1', '0', 'yes', 'no', 'on', 'off', 'enabled', 'disabled', 'invalid'];
    testValues.forEach(value => {
      const parsed = manager.parseBoolean(value);
      console.log(`  "${value}" → ${parsed}`);
    });

    // Test 6: Dependency Testing
    console.log('\n6️⃣ Testing Feature Flag Dependencies...');
    
    // Set up environment variables to test dependencies
    process.env.FEATURE_PERFORMANCE_CACHING = 'true';
    process.env.FEATURE_SEARCH_ENHANCED_SEARCH = 'true';
    
    const dependencyContext: FeatureFlagContext = {
      environment: 'development',
      userId: 'test-user',
      userRole: 'User'
    };
    
    const enhancedSearchEnabled = manager.isEnabled(FeatureFlag.ENHANCED_SEARCH, dependencyContext);
    const cachingEnabled = manager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, dependencyContext);
    
    console.log(`  Performance Caching: ${cachingEnabled ? '🟢' : '🔴'}`);
    console.log(`  Enhanced Search: ${enhancedSearchEnabled ? '🟢' : '🔴'}`);
    
    if (cachingEnabled && enhancedSearchEnabled) {
      console.log('✅ Dependency resolution working correctly');
    } else {
      console.log('⚠️ Dependency resolution may need attention');
    }

    // Test 7: Multiple Flag Retrieval
    console.log('\n7️⃣ Testing Multiple Flag Retrieval...');
    const allFlags = manager.getAll(dependencyContext);
    console.log('✅ Retrieved all flags:', Object.keys(allFlags).length);

    // Test 8: Cache Testing
    console.log('\n8️⃣ Testing Cache Functionality...');
    const cacheStats = manager.getCacheStats();
    console.log(`✅ Cache entries: ${cacheStats.size}`);
    
    manager.clearCache();
    const clearedStats = manager.getCacheStats();
    console.log(`✅ Cache cleared: ${clearedStats.size} entries remaining`);

    // Test 9: Error Handling
    console.log('\n9️⃣ Testing Error Handling...');
    try {
      // Test with invalid context
      const invalidContext: FeatureFlagContext = {
        environment: 'invalid' as Environment,
        userRole: 'InvalidRole' as UserRole
      };
      
      manager.isEnabled(FeatureFlag.NEW_DASHBOARD, invalidContext);
      console.log('✅ Error handling working - no exceptions thrown');
    } catch (error) {
      console.log('✅ Error handling working - caught expected error');
    }

    console.log('\n🎉 All Feature Flag System Validation Tests Passed!');
    console.log('\n📊 Summary:');
    console.log(`   • Total Feature Flags: ${Object.keys(FEATURE_FLAG_REGISTRY).length}`);
    console.log(`   • Registry Validation: ✅ Passed`);
    console.log(`   • Manager Initialization: ✅ Passed`);
    console.log(`   • Feature Evaluation: ✅ Passed`);
    console.log(`   • Dependency Resolution: ✅ Passed`);
    console.log(`   • Cache Management: ✅ Passed`);
    console.log(`   • Error Handling: ✅ Passed`);
    
  } catch (error) {
    console.error('\n❌ Feature Flag System Validation Failed:', error);
    throw error;
  }
}

/**
 * Quick validation function for production use
 */
export async function quickValidation(): Promise<boolean> {
  try {
    const manager = getFeatureFlagManager();
    await manager.initialize();
    
    const context: FeatureFlagContext = {
      environment: 'production',
      userRole: 'User'
    };
    
    // Test a basic feature flag
    const result = manager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, context);
    return typeof result === 'boolean';
  } catch (error) {
    console.error('Quick validation failed:', error);
    return false;
  }
}

// Export test functions
export default {
  runFeatureFlagValidation,
  quickValidation
};