/**
 * Feature Flag Service
 * 
 * Provides server-side feature flag management with environment variable support
 */

interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage?: number;
  enabledForRoles?: string[];
  enabledForUsers?: string[];
  description?: string;
}

interface User {
  id: number;
  username: string;
  role: string;
}

class FeatureFlagService {
  private flags: Map<string, FeatureFlagConfig> = new Map();

  constructor() {
    this.initializeFlags();
  }

  /**
   * Initialize flags from environment variables
   */
  private initializeFlags() {
    const flagDefinitions = [
      {
        name: 'employee_portal',
        envVar: 'EMPLOYEE_PORTAL_ENABLED',
        description: 'Main employee portal access'
      },
      {
        name: 'employee_auth',
        envVar: 'EMPLOYEE_AUTH_ENABLED',
        description: 'Employee authentication system'
      },
      {
        name: 'employee_user_management',
        envVar: 'EMPLOYEE_USER_MANAGEMENT_ENABLED',
        description: 'User management within employee portal'
      },
      {
        name: 'employee_customer_inquiries',
        envVar: 'EMPLOYEE_CUSTOMER_INQUIRIES_ENABLED',
        description: 'Customer inquiries management'
      }
    ];

    flagDefinitions.forEach(({ name, envVar, description }) => {
      const enabled = process.env[envVar] === 'true';
      this.flags.set(name, {
        enabled,
        description,
        rolloutPercentage: enabled ? 100 : 0,
        enabledForRoles: [],
        enabledForUsers: []
      });
    });

    console.log('Feature flags initialized:', Object.fromEntries(
      Array.from(this.flags.entries()).map(([name, config]) => [name, config.enabled])
    ));
  }

  /**
   * Check if a flag is enabled for a specific user
   */
  isEnabled(flagName: string, user?: User): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) return false;

    // If flag is globally disabled, return false
    if (!flag.enabled) return false;

    // If no user provided, return global flag status
    if (!user) return flag.enabled;

    // Check user-specific enablement
    if (flag.enabledForUsers?.includes(user.username)) {
      return true;
    }

    // Check role-specific enablement
    if (flag.enabledForRoles?.includes(user.role)) {
      return true;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage > 0) {
      // Use user ID for consistent rollout (same user always gets same result)
      const hash = this.hashUserId(user.id);
      const percentage = hash % 100;
      return percentage < flag.rolloutPercentage;
    }

    return flag.enabled;
  }

  /**
   * Get all flags for a user
   */
  getFlagsForUser(user?: User): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    
    Array.from(this.flags.keys()).forEach(flagName => {
      result[flagName] = this.isEnabled(flagName, user);
    });

    return result;
  }

  /**
   * Get all flag configurations (admin only)
   */
  getAllFlags(): Array<{ name: string } & FeatureFlagConfig> {
    return Array.from(this.flags.entries()).map(([name, config]) => ({
      name,
      ...config
    }));
  }

  /**
   * Enable a flag with optional configuration
   */
  async enableFlag(
    flagName: string, 
    options: {
      rolloutPercentage?: number;
      roles?: string[];
      users?: string[];
    } = {}
  ): Promise<void> {
    const flag = this.flags.get(flagName);
    if (!flag) {
      throw new Error(`Feature flag '${flagName}' not found`);
    }

    const updatedFlag: FeatureFlagConfig = {
      ...flag,
      enabled: true,
      rolloutPercentage: options.rolloutPercentage ?? flag.rolloutPercentage,
      enabledForRoles: options.roles ?? flag.enabledForRoles,
      enabledForUsers: options.users ?? flag.enabledForUsers
    };

    this.flags.set(flagName, updatedFlag);
    
    console.log(`Feature flag '${flagName}' enabled:`, {
      rolloutPercentage: updatedFlag.rolloutPercentage,
      roles: updatedFlag.enabledForRoles,
      users: updatedFlag.enabledForUsers
    });
  }

  /**
   * Disable a flag
   */
  async disableFlag(flagName: string): Promise<void> {
    const flag = this.flags.get(flagName);
    if (!flag) {
      throw new Error(`Feature flag '${flagName}' not found`);
    }

    this.flags.set(flagName, {
      ...flag,
      enabled: false
    });

    console.log(`Feature flag '${flagName}' disabled`);
  }

  /**
   * Simple hash function for consistent user-based rollouts
   */
  private hashUserId(userId: number): number {
    let hash = 0;
    const str = userId.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();