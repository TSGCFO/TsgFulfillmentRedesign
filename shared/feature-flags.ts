/**
 * Feature Flag Type Definitions
 * 
 * This module contains all the TypeScript interfaces and types used
 * throughout the feature flag system. These definitions ensure type
 * safety and consistency across both frontend and backend implementations.
 */

/**
 * Enum defining all available feature flags in the system
 * Each flag represents a specific functionality that can be toggled
 */
export enum FeatureFlag {
  NEW_DASHBOARD = 'NEW_DASHBOARD',
  ENHANCED_SEARCH = 'ENHANCED_SEARCH',
  DOCUMENT_SIGNING = 'DOCUMENT_SIGNING',
  HUBSPOT_V2 = 'HUBSPOT_V2',
  PERFORMANCE_CACHING = 'PERFORMANCE_CACHING'
}

/**
 * Supported environments for feature flag deployment
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * User roles that can be used in feature flag contexts
 */
export type UserRole = 'SuperAdmin' | 'Admin' | 'User';

/**
 * Configuration interface for individual feature flags
 * Defines the complete structure of a feature flag's metadata and behavior
 */
export interface FeatureFlagConfig {
  /** Unique identifier for the feature flag */
  name: FeatureFlag;
  
  /** Environment variable key used to control this flag */
  key: string;
  
  /** Human-readable description of what this feature flag controls */
  description: string;
  
  /** Default state when no environment variable is set */
  defaultValue: boolean;
  
  /** List of environments where this flag is available */
  environments: Environment[];
  
  /** Optional list of other feature flags this one depends on */
  dependencies?: FeatureFlag[];
  
  /** Owner or team responsible for this feature flag */
  owner: string;
  
  /** Optional minimum user role required to access this feature */
  minimumRole?: UserRole;
  
  /** Optional client-specific enablement */
  clientSpecific?: boolean;
  
  /** Optional percentage rollout (0-100) */
  rolloutPercentage?: number;
}

/**
 * Context information used to evaluate feature flags
 * Provides runtime information about the user and environment
 */
export interface FeatureFlagContext {
  /** Current environment (development, staging, production) */
  environment: Environment;
  
  /** Optional user ID for user-specific feature flags */
  userId?: string;
  
  /** Optional user role for role-based feature flags */
  userRole?: UserRole;
  
  /** Optional client ID for client-specific feature flags */
  clientId?: string;
  
  /** Optional additional metadata for complex feature flag logic */
  metadata?: Record<string, any>;
}

/**
 * Current state of a feature flag after evaluation
 * Contains both the resolved value and metadata about how it was determined
 */
export interface FeatureFlagState {
  /** The resolved boolean value of the feature flag */
  enabled: boolean;
  
  /** Source of the flag value (environment, default, dependency, etc.) */
  source: 'environment' | 'default' | 'dependency_disabled' | 'role_restricted' | 'rollout';
  
  /** Timestamp when this state was last evaluated */
  lastEvaluated: Date;
  
  /** Optional reason for the current state (useful for debugging) */
  reason?: string;
  
  /** Whether this flag's dependencies are satisfied */
  dependenciesSatisfied: boolean;
}

/**
 * Complete feature flag evaluation result
 * Combines the flag state with additional debugging information
 */
export interface FeatureFlagEvaluationResult {
  /** The feature flag that was evaluated */
  flag: FeatureFlag;
  
  /** Current state of the feature flag */
  state: FeatureFlagState;
  
  /** Context used for evaluation */
  context: FeatureFlagContext;
  
  /** Optional list of dependency evaluation results */
  dependencyResults?: FeatureFlagEvaluationResult[];
}

/**
 * Configuration options for the FeatureFlagManager
 */
export interface FeatureFlagManagerOptions {
  /** Whether to log debug information during evaluation */
  debug?: boolean;
  
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;
  
  /** Whether to throw errors on invalid configurations */
  strict?: boolean;
  
  /** Custom logger function */
  logger?: (level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) => void;
}

/**
 * Error types specific to feature flag operations
 */
export class FeatureFlagError extends Error {
  constructor(
    message: string,
    public readonly flag?: FeatureFlag,
    public readonly context?: FeatureFlagContext
  ) {
    super(message);
    this.name = 'FeatureFlagError';
  }
}

export class FeatureFlagDependencyError extends FeatureFlagError {
  constructor(
    flag: FeatureFlag,
    missingDependencies: FeatureFlag[],
    context?: FeatureFlagContext
  ) {
    super(
      `Feature flag ${flag} has unsatisfied dependencies: ${missingDependencies.join(', ')}`,
      flag,
      context
    );
    this.name = 'FeatureFlagDependencyError';
  }
}

export class FeatureFlagConfigError extends FeatureFlagError {
  constructor(message: string, flag?: FeatureFlag) {
    super(message, flag);
    this.name = 'FeatureFlagConfigError';
  }
}