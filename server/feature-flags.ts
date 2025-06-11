/**
 * Feature Flag System for TSG Fulfillment
 * 
 * Supports multiple control mechanisms:
 * 1. Environment variables (simplest)
 * 2. Database flags (most flexible)
 * 3. User/role-specific rollouts (gradual deployment)
 */

import { storage } from "./storage";

export interface FeatureFlagContext {
  userId?: number;
  userRole?: string;
  username?: string;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  enabledForRoles?: string[];
  enabledForUsers?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private lastRefresh: number = 0;
  private cacheTimeout: number = 30 * 1000; // 30 seconds

  constructor() {
    // Initialize with default flags
    this.initializeDefaultFlags();
  }

  private initializeDefaultFlags() {
    // Employee Portal Feature Flags
    this.flags.set('employee_portal', {
      name: 'employee_portal',
      enabled: this.getEnvFlag('EMPLOYEE_PORTAL_ENABLED', false),
      description: 'Main employee portal access',
      rolloutPercentage: 0,
      enabledForRoles: [],
      enabledForUsers: []
    });

    this.flags.set('employee_user_management', {
      name: 'employee_user_management',
      enabled: this.getEnvFlag('EMPLOYEE_USER_MANAGEMENT_ENABLED', false),
      description: 'User management within employee portal',
      rolloutPercentage: 0,
      enabledForRoles: [],
      enabledForUsers: []
    });

    this.flags.set('employee_customer_inquiries', {
      name: 'employee_customer_inquiries',
      enabled: this.getEnvFlag('EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED', false),
      description: 'Customer inquiries management',
      rolloutPercentage: 0,
      enabledForRoles: [],
      enabledForUsers: []
    });

    this.flags.set('employee_auth', {
      name: 'employee_auth',
      enabled: this.getEnvFlag('EMPLOYEE_AUTH_ENABLED', false),
      description: 'Employee authentication system',
      rolloutPercentage: 0,
      enabledForRoles: [],
      enabledForUsers: []
    });
  }

  private getEnvFlag(envVar: string, defaultValue: boolean): boolean {
    const value = process.env[envVar];
    if (value === 'true') return true;
    if (value === 'false') return false;
    return defaultValue;
  }

  /**
   * Check if a feature flag is enabled for a given context
   */
  async isEnabled(flagName: string, context?: FeatureFlagContext): Promise<boolean> {
    await this.refreshFlags();
    
    const flag = this.flags.get(flagName);
    if (!flag) {
      console.warn(`Feature flag '${flagName}' not found, defaulting to false`);
      return false;
    }

    // If flag is globally disabled, return false
    if (!flag.enabled) {
      return false;
    }

    // If no context provided, return global flag state
    if (!context) {
      return flag.enabled;
    }

    // Check user-specific overrides first
    if (context.username && flag.enabledForUsers?.includes(context.username)) {
      return true;
    }

    // Check role-specific overrides
    if (context.userRole && flag.enabledForRoles?.includes(context.userRole)) {
      return true;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage && flag.rolloutPercentage > 0 && context.userId) {
      const userHash = this.hashUserId(context.userId, flagName);
      const percentage = (userHash % 100) + 1;
      return percentage <= flag.rolloutPercentage;
    }

    // Default to global flag state
    return flag.enabled;
  }

  /**
   * Enable a feature flag
   */
  async enableFlag(flagName: string, options?: {
    rolloutPercentage?: number;
    roles?: string[];
    users?: string[];
  }): Promise<void> {
    const flag = this.flags.get(flagName) || {
      name: flagName,
      enabled: false,
      rolloutPercentage: 0,
      enabledForRoles: [],
      enabledForUsers: []
    };

    flag.enabled = true;
    flag.updatedAt = new Date();

    if (options?.rolloutPercentage !== undefined) {
      flag.rolloutPercentage = Math.max(0, Math.min(100, options.rolloutPercentage));
    }

    if (options?.roles) {
      flag.enabledForRoles = [...new Set([...(flag.enabledForRoles || []), ...options.roles])];
    }

    if (options?.users) {
      flag.enabledForUsers = [...new Set([...(flag.enabledForUsers || []), ...options.users])];
    }

    this.flags.set(flagName, flag);
    await this.persistFlag(flag);
  }

  /**
   * Disable a feature flag
   */
  async disableFlag(flagName: string): Promise<void> {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.enabled = false;
      flag.updatedAt = new Date();
      this.flags.set(flagName, flag);
      await this.persistFlag(flag);
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    await this.refreshFlags();
    return Array.from(this.flags.values());
  }

  /**
   * Get feature flags for a specific context
   */
  async getFlagsForContext(context: FeatureFlagContext): Promise<Record<string, boolean>> {
    const flags: Record<string, boolean> = {};
    
    for (const flagName of this.flags.keys()) {
      flags[flagName] = await this.isEnabled(flagName, context);
    }

    return flags;
  }

  private hashUserId(userId: number, flagName: string): number {
    // Simple hash function for consistent user assignment
    const str = `${userId}-${flagName}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async refreshFlags(): Promise<void> {
    const now = Date.now();
    if (now - this.lastRefresh < this.cacheTimeout) {
      return;
    }

    try {
      // Try to load flags from database
      const dbFlags = await this.loadFlagsFromDatabase();
      dbFlags.forEach(flag => {
        this.flags.set(flag.name, flag);
      });
      this.lastRefresh = now;
    } catch (error) {
      console.warn('Failed to load feature flags from database, using cache:', error);
    }
  }

  private async loadFlagsFromDatabase(): Promise<FeatureFlag[]> {
    // This would load from your database
    // For now, return empty array since we haven't created the table yet
    try {
      // TODO: Implement database loading when feature_flags table is created
      return [];
    } catch (error) {
      return [];
    }
  }

  private async persistFlag(flag: FeatureFlag): Promise<void> {
    try {
      // TODO: Implement database persistence when feature_flags table is created
      console.log(`Feature flag '${flag.name}' updated:`, flag);
    } catch (error) {
      console.warn('Failed to persist feature flag to database:', error);
    }
  }
}

// Singleton instance
export const featureFlagService = new FeatureFlagService();

/**
 * Express middleware to check feature flags
 */
export function requireFeatureFlag(flagName: string) {
  return async (req: any, res: any, next: any) => {
    const context: FeatureFlagContext = {
      userId: req.user?.id,
      userRole: req.user?.role,
      username: req.user?.username
    };

    const isEnabled = await featureFlagService.isEnabled(flagName, context);
    
    if (!isEnabled) {
      return res.status(404).json({ 
        error: "Feature not available",
        code: "FEATURE_DISABLED",
        feature: flagName
      });
    }

    next();
  };
}

/**
 * Utility function to check flags in route handlers
 */
export async function checkFeatureFlag(flagName: string, context?: FeatureFlagContext): Promise<boolean> {
  return featureFlagService.isEnabled(flagName, context);
}