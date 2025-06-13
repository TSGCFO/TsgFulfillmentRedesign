/**
 * Feature Flag API Routes
 * 
 * This module provides REST API endpoints for feature flag operations,
 * allowing frontend applications to query feature flag states and
 * enabling dynamic feature toggling based on request context.
 */

import { Router, Request, Response } from 'express';
import { 
  FeatureFlag, 
  FeatureFlagContext, 
  FeatureFlagError,
  FeatureFlagEvaluationResult 
} from '../../shared/feature-flags';
import { getFeatureFlagManager } from '../../shared/feature-flag-manager';

const router = Router();

/**
 * Response interface for feature flag API endpoints
 */
interface FeatureFlagResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Create a standardized API response
 */
function createResponse(
  success: boolean, 
  data?: any, 
  error?: string, 
  message?: string
): FeatureFlagResponse {
  return {
    success,
    data,
    error,
    message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Validate feature flag parameter
 */
function validateFeatureFlag(flagParam: string): FeatureFlag | null {
  const flag = flagParam.toUpperCase() as FeatureFlag;
  return Object.values(FeatureFlag).includes(flag) ? flag : null;
}

/**
 * GET /api/feature-flags
 * Returns all feature flags and their states for the current request context
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.getAllFeatureFlags) {
      res.status(500).json(createResponse(
        false,
        null,
        'MIDDLEWARE_NOT_INITIALIZED',
        'Feature flag middleware not properly initialized'
      ));
      return;
    }

    const context = req.getFeatureFlagContext();
    const featureFlags = req.getAllFeatureFlags();
    
    // Add context information for debugging (but not sensitive data)
    const responseData = {
      flags: featureFlags,
      context: {
        environment: context.environment,
        hasUser: !!context.userId,
        hasRole: !!context.userRole,
        hasClient: !!context.clientId
      },
      totalFlags: Object.keys(featureFlags).length,
      enabledFlags: Object.values(featureFlags).filter(Boolean).length
    };

    console.info('Feature flags requested', {
      path: req.path,
      environment: context.environment,
      userId: context.userId ? '[REDACTED]' : undefined,
      userRole: context.userRole,
      flagCount: Object.keys(featureFlags).length
    });

    res.json(createResponse(true, responseData));
  } catch (error) {
    console.error('Error fetching all feature flags:', error);
    
    if (error instanceof FeatureFlagError) {
      res.status(400).json(createResponse(
        false,
        null,
        'FEATURE_FLAG_ERROR',
        'Error evaluating feature flags'
      ));
      return;
    }

    res.status(500).json(createResponse(
      false,
      null,
      'INTERNAL_ERROR',
      'An internal server error occurred'
    ));
  }
});

/**
 * GET /api/feature-flags/:flag
 * Returns the state of a specific feature flag
 */
router.get('/:flag', async (req: Request, res: Response) => {
  try {
    const flagParam = req.params.flag;
    const flag = validateFeatureFlag(flagParam);

    if (!flag) {
      res.status(400).json(createResponse(
        false,
        null,
        'INVALID_FLAG',
        `Invalid feature flag: ${flagParam}. Must be one of: ${Object.values(FeatureFlag).join(', ')}`
      ));
      return;
    }

    if (!req.isFeatureEnabled || !req.getFeatureFlagContext) {
      res.status(500).json(createResponse(
        false,
        null,
        'MIDDLEWARE_NOT_INITIALIZED',
        'Feature flag middleware not properly initialized'
      ));
      return;
    }

    const context = req.getFeatureFlagContext();
    const manager = getFeatureFlagManager();
    
    // Get detailed evaluation result
    const evaluationResult = manager.evaluate(flag, context);
    
    const responseData = {
      flag,
      enabled: evaluationResult.state.enabled,
      state: {
        source: evaluationResult.state.source,
        reason: evaluationResult.state.reason,
        lastEvaluated: evaluationResult.state.lastEvaluated,
        dependenciesSatisfied: evaluationResult.state.dependenciesSatisfied
      },
      context: {
        environment: context.environment,
        hasUser: !!context.userId,
        hasRole: !!context.userRole,
        hasClient: !!context.clientId
      },
      dependencies: evaluationResult.dependencyResults?.map(dep => ({
        flag: dep.flag,
        enabled: dep.state.enabled,
        source: dep.state.source
      }))
    };

    console.info(`Feature flag ${flag} requested`, {
      enabled: evaluationResult.state.enabled,
      source: evaluationResult.state.source,
      environment: context.environment,
      userId: context.userId ? '[REDACTED]' : undefined,
      userRole: context.userRole
    });

    res.json(createResponse(true, responseData));
  } catch (error) {
    console.error(`Error fetching feature flag ${req.params.flag}:`, error);
    
    if (error instanceof FeatureFlagError) {
      res.status(400).json(createResponse(
        false,
        null,
        'FEATURE_FLAG_ERROR',
        `Error evaluating feature flag: ${error.message}`
      ));
      return;
    }

    res.status(500).json(createResponse(
      false,
      null,
      'INTERNAL_ERROR',
      'An internal server error occurred'
    ));
  }
});

/**
 * POST /api/feature-flags/batch
 * Returns multiple specific feature flags in a single request
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { flags } = req.body;

    if (!Array.isArray(flags)) {
      res.status(400).json(createResponse(
        false,
        null,
        'INVALID_INPUT',
        'Request body must contain a "flags" array'
      ));
      return;
    }

    if (flags.length === 0) {
      res.status(400).json(createResponse(
        false,
        null,
        'EMPTY_FLAGS',
        'Flags array cannot be empty'
      ));
      return;
    }

    if (flags.length > 50) {
      res.status(400).json(createResponse(
        false,
        null,
        'TOO_MANY_FLAGS',
        'Cannot request more than 50 flags at once'
      ));
      return;
    }

    // Validate all flags
    const validatedFlags: FeatureFlag[] = [];
    const invalidFlags: string[] = [];

    flags.forEach((flagParam: string) => {
      const flag = validateFeatureFlag(flagParam);
      if (flag) {
        validatedFlags.push(flag);
      } else {
        invalidFlags.push(flagParam);
      }
    });

    if (invalidFlags.length > 0) {
      res.status(400).json(createResponse(
        false,
        null,
        'INVALID_FLAGS',
        `Invalid feature flags: ${invalidFlags.join(', ')}`
      ));
      return;
    }

    if (!req.getFeatureFlags || !req.getFeatureFlagContext) {
      res.status(500).json(createResponse(
        false,
        null,
        'MIDDLEWARE_NOT_INITIALIZED',
        'Feature flag middleware not properly initialized'
      ));
      return;
    }

    const context = req.getFeatureFlagContext();
    const flagStates = req.getFeatureFlags(validatedFlags);

    const responseData = {
      flags: flagStates,
      context: {
        environment: context.environment,
        hasUser: !!context.userId,
        hasRole: !!context.userRole,
        hasClient: !!context.clientId
      },
      requestedCount: validatedFlags.length,
      enabledCount: Object.values(flagStates).filter(Boolean).length
    };

    console.info('Batch feature flags requested', {
      flags: validatedFlags,
      environment: context.environment,
      userId: context.userId ? '[REDACTED]' : undefined,
      userRole: context.userRole
    });

    res.json(createResponse(true, responseData));
  } catch (error) {
    console.error('Error fetching batch feature flags:', error);
    
    if (error instanceof FeatureFlagError) {
      res.status(400).json(createResponse(
        false,
        null,
        'FEATURE_FLAG_ERROR',
        'Error evaluating feature flags'
      ));
      return;
    }

    res.status(500).json(createResponse(
      false,
      null,
      'INTERNAL_ERROR',
      'An internal server error occurred'
    ));
  }
});

/**
 * GET /api/feature-flags/health
 * Health check endpoint for the feature flag system
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const manager = getFeatureFlagManager();
    const cacheStats = manager.getCacheStats();
    
    const healthData = {
      status: 'healthy',
      middlewareInitialized: typeof req.isFeatureEnabled === 'function',
      cacheSize: cacheStats.size,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    res.json(createResponse(true, healthData));
  } catch (error) {
    console.error('Feature flag health check failed:', error);
    
    res.status(503).json(createResponse(
      false,
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'HEALTH_CHECK_FAILED',
      'Feature flag system health check failed'
    ));
  }
});

/**
 * DELETE /api/feature-flags/cache
 * Clear the feature flag cache (admin only)
 */
router.delete('/cache', async (req: Request, res: Response) => {
  try {
    if (!req.getFeatureFlagContext) {
      res.status(500).json(createResponse(
        false,
        null,
        'MIDDLEWARE_NOT_INITIALIZED',
        'Feature flag middleware not properly initialized'
      ));
      return;
    }

    const context = req.getFeatureFlagContext();
    
    // Only allow SuperAdmin or Admin users to clear cache
    if (!context.userRole || !['SuperAdmin', 'Admin'].includes(context.userRole)) {
      res.status(403).json(createResponse(
        false,
        null,
        'INSUFFICIENT_PERMISSIONS',
        'Admin privileges required to clear cache'
      ));
      return;
    }

    const manager = getFeatureFlagManager();
    const oldCacheStats = manager.getCacheStats();
    
    manager.clearCache();
    
    console.info('Feature flag cache cleared', {
      clearedBy: context.userId,
      userRole: context.userRole,
      previousCacheSize: oldCacheStats.size
    });

    res.json(createResponse(
      true,
      {
        previousCacheSize: oldCacheStats.size,
        clearedAt: new Date().toISOString()
      },
      undefined,
      'Cache cleared successfully'
    ));
  } catch (error) {
    console.error('Error clearing feature flag cache:', error);
    
    res.status(500).json(createResponse(
      false,
      null,
      'INTERNAL_ERROR',
      'An internal server error occurred'
    ));
  }
});

export default router;