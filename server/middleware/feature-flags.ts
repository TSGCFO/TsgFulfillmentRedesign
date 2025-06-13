/**
 * Feature Flag Express Middleware
 * 
 * This module provides Express middleware integration for the feature flag system,
 * including request augmentation, route protection, and conditional logic utilities.
 */

import { Request, Response, NextFunction } from 'express';
import { 
  FeatureFlag, 
  FeatureFlagContext, 
  Environment, 
  UserRole,
  FeatureFlagError 
} from '../../shared/feature-flags';
import { getFeatureFlagManager } from '../../shared/feature-flag-manager';

/**
 * Extended Request interface with feature flag methods
 */
declare global {
  namespace Express {
    interface Request {
      /** Check if a feature flag is enabled for the current request context */
      isFeatureEnabled: (flag: FeatureFlag) => boolean;
      
      /** Get the feature flag context for the current request */
      getFeatureFlagContext: () => FeatureFlagContext;
      
      /** Get multiple feature flags at once */
      getFeatureFlags: (flags: FeatureFlag[]) => Record<FeatureFlag, boolean>;
      
      /** Get all feature flags for the current context */
      getAllFeatureFlags: () => Record<FeatureFlag, boolean>;
    }
  }
}

/**
 * Extract environment from request or use NODE_ENV
 */
function getEnvironmentFromRequest(req: Request): Environment {
  // Check for explicit environment header (useful for testing)
  const envHeader = req.headers['x-environment'] as Environment;
  if (envHeader && ['development', 'staging', 'production'].includes(envHeader)) {
    return envHeader;
  }
  
  // Fallback to NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  switch (nodeEnv) {
    case 'production':
      return 'production';
    case 'staging':
      return 'staging';
    default:
      return 'development';
  }
}

/**
 * Extract user role from request (assumes authentication middleware has set user info)
 */
function getUserRoleFromRequest(req: Request): UserRole | undefined {
  // Check various common authentication patterns
  const user = (req as any).user || (req as any).auth?.user;
  
  if (user) {
    // Handle different role property names
    const role = user.role || user.userRole || user.permission || user.level;
    
    if (role && ['SuperAdmin', 'Admin', 'User'].includes(role)) {
      return role as UserRole;
    }
  }
  
  return undefined;
}

/**
 * Extract user ID from request
 */
function getUserIdFromRequest(req: Request): string | undefined {
  const user = (req as any).user || (req as any).auth?.user;
  return user?.id || user?.userId || user?.sub;
}

/**
 * Extract client ID from request (useful for multi-tenant applications)
 */
function getClientIdFromRequest(req: Request): string | undefined {
  // Check headers first
  const clientId = req.headers['x-client-id'] as string;
  if (clientId) return clientId;
  
  // Check user context
  const user = (req as any).user || (req as any).auth?.user;
  return user?.clientId || user?.tenantId || user?.organizationId;
}

/**
 * Create feature flag context from Express request
 */
function createContextFromRequest(req: Request): FeatureFlagContext {
  return {
    environment: getEnvironmentFromRequest(req),
    userId: getUserIdFromRequest(req),
    userRole: getUserRoleFromRequest(req),
    clientId: getClientIdFromRequest(req),
    metadata: {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Main feature flag middleware that augments Express requests
 * with feature flag functionality
 */
export function featureFlagMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const manager = getFeatureFlagManager();
    const context = createContextFromRequest(req);
    
    // Add feature flag methods to request object
    req.isFeatureEnabled = (flag: FeatureFlag): boolean => {
      try {
        return manager.isEnabled(flag, context);
      } catch (error) {
        console.error(`Error checking feature flag ${flag}:`, error);
        return false; // Fail safely
      }
    };
    
    req.getFeatureFlagContext = (): FeatureFlagContext => context;
    
    req.getFeatureFlags = (flags: FeatureFlag[]): Record<FeatureFlag, boolean> => {
      try {
        return manager.getMultiple(flags, context);
      } catch (error) {
        console.error('Error getting multiple feature flags:', error);
        // Return all flags as disabled on error
        return flags.reduce((acc, flag) => {
          acc[flag] = false;
          return acc;
        }, {} as Record<FeatureFlag, boolean>);
      }
    };
    
    req.getAllFeatureFlags = (): Record<FeatureFlag, boolean> => {
      try {
        return manager.getAll(context);
      } catch (error) {
        console.error('Error getting all feature flags:', error);
        // Return empty object on error
        return {} as Record<FeatureFlag, boolean>;
      }
    };
    
    next();
  } catch (error) {
    console.error('Feature flag middleware error:', error);
    // Continue without feature flag functionality rather than breaking the request
    req.isFeatureEnabled = () => false;
    req.getFeatureFlagContext = () => ({ environment: 'development' });
    req.getFeatureFlags = () => ({} as Record<FeatureFlag, boolean>);
    req.getAllFeatureFlags = () => ({} as Record<FeatureFlag, boolean>);
    next();
  }
}

/**
 * Route-level decorator for requiring specific feature flags
 * Returns 404 when feature is disabled to avoid revealing feature existence
 */
export function requireFeature(flag: FeatureFlag) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.isFeatureEnabled) {
        console.error('Feature flag middleware not initialized');
        res.status(500).json({
          error: 'Server configuration error',
          message: 'Feature flag system not properly initialized'
        });
        return;
      }
      
      const isEnabled = req.isFeatureEnabled(flag);
      
      if (!isEnabled) {
        // Log for debugging but don't expose feature flag names in response
        console.info(`Feature ${flag} disabled for request ${req.method} ${req.path}`, {
          context: req.getFeatureFlagContext(),
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        // Return 404 to avoid revealing that the feature exists
        res.status(404).json({
          error: 'Not Found',
          message: 'The requested resource was not found'
        });
        return;
      }
      
      // Feature is enabled, continue to next middleware/handler
      next();
    } catch (error) {
      console.error(`Error in requireFeature middleware for ${flag}:`, error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred while processing your request'
      });
      return;
    }
  };
}

/**
 * Utility function for conditional logic based on feature flags
 * Usage: const result = ifFeatureEnabled(req, FeatureFlag.NEW_DASHBOARD, () => newLogic(), () => oldLogic());
 */
export function ifFeatureEnabled<T>(
  req: Request,
  flag: FeatureFlag,
  enabledCallback: () => T,
  disabledCallback?: () => T
): T {
  try {
    if (!req.isFeatureEnabled) {
      console.warn('Feature flag middleware not initialized, defaulting to disabled');
      return disabledCallback ? disabledCallback() : undefined as T;
    }
    
    const isEnabled = req.isFeatureEnabled(flag);
    
    if (isEnabled) {
      return enabledCallback();
    } else {
      return disabledCallback ? disabledCallback() : undefined as T;
    }
  } catch (error) {
    console.error(`Error in ifFeatureEnabled for ${flag}:`, error);
    return disabledCallback ? disabledCallback() : undefined as T;
  }
}

/**
 * Middleware factory for feature flag logging
 * Logs feature flag usage for analytics and debugging
 */
export function featureFlagLogger(options: { logLevel?: 'debug' | 'info' } = {}) {
  const logLevel = options.logLevel || 'debug';
  
  return (req: Request, res: Response, next: NextFunction): void => {
    if (typeof req.isFeatureEnabled === 'function' && logLevel === 'debug') {
      const context = req.getFeatureFlagContext();
      console.log(`Feature flag context for ${req.method} ${req.path}:`, {
        userId: context.userId,
        userRole: context.userRole,
        environment: context.environment,
        clientId: context.clientId
      });
    }
    next();
  };
}

/**
 * Error handler specifically for feature flag related errors
 */
export function featureFlagErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof FeatureFlagError) {
    console.error('Feature flag error:', {
      message: error.message,
      flag: error.flag,
      context: error.context,
      path: req.path,
      method: req.method
    });
    
    // Don't expose internal feature flag details to clients
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'A configuration error occurred'
    });
    return;
  }
  
  // Not a feature flag error, pass to next error handler
  next(error);
}