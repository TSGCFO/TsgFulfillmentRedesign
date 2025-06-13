# Feature Flags Best Practices Guide

## Table of Contents

1. [Overview](#overview)
2. [Flag Lifecycle Management](#flag-lifecycle-management)
3. [Naming Conventions](#naming-conventions)
4. [Development Practices](#development-practices)
5. [Testing Strategies](#testing-strategies)
6. [Performance Guidelines](#performance-guidelines)
7. [Security Best Practices](#security-best-practices)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Team Collaboration](#team-collaboration)
10. [Common Anti-Patterns](#common-anti-patterns)

## Overview

This guide outlines best practices for using the feature flags system effectively, maintaining code quality, and ensuring reliable deployments.

### Core Principles

1. **Simplicity First** - Keep flag logic simple and readable
2. **Short Lifespan** - Flags should be temporary, not permanent
3. **Clear Ownership** - Every flag should have a designated owner
4. **Gradual Rollout** - Use percentage-based rollouts
5. **Fail Safe** - Always default to safe behavior

## Flag Lifecycle Management

### 1. Planning Phase

Before creating a feature flag, consider:

```typescript
// ✅ Good: Clear plan and purpose
interface FeatureFlagPlan {
  name: string;                    // ENHANCED_SEARCH
  purpose: string;                 // "Gradual rollout of new search functionality"
  owner: string;                   // "Search Team"
  environments: Environment[];     // ["development", "staging", "production"]
  rolloutPlan: {
    week1: { percentage: 5 };
    week2: { percentage: 25 };
    week3: { percentage: 50 };
    week4: { percentage: 100 };
  };
  removalDate: string;            // "2025-03-01"
  dependencies: FeatureFlag[];    // [PERFORMANCE_CACHING]
  successMetrics: string[];       // ["search_success_rate", "response_time"]
}
```

### 2. Creation Phase

```typescript
// ✅ Good: Well-structured flag
[FeatureFlag.ENHANCED_SEARCH]: {
  name: FeatureFlag.ENHANCED_SEARCH,
  key: 'FEATURE_SEARCH_ENHANCED_SEARCH',
  description: 'Enable enhanced search with filters and auto-complete. Requires PERFORMANCE_CACHING for optimal performance.',
  defaultValue: false,
  environments: ['development', 'staging', 'production'],
  owner: 'Search Team',
  minimumRole: 'User',
  dependencies: [FeatureFlag.PERFORMANCE_CACHING],
  rolloutPercentage: 0, // Start disabled
},

// ❌ Bad: Vague and poorly planned
[FeatureFlag.NEW_FEATURE]: {
  name: FeatureFlag.NEW_FEATURE,
  key: 'NEW_FEATURE',
  description: 'New feature',
  defaultValue: true, // Dangerous default
  environments: ['production'], // Missing other environments
  owner: '', // No owner
  // Missing dependencies, rollout plan
}
```

### 3. Rollout Phase

```bash
# Week 1: Start with team members
FEATURE_SEARCH_ENHANCED_SEARCH=true # For dev/staging
# Set rolloutPercentage: 5 in production

# Week 2: Early adopters
# Set rolloutPercentage: 25

# Week 3: Wider audience
# Set rolloutPercentage: 50

# Week 4: Full rollout
# Set rolloutPercentage: 100
```

### 4. Monitoring Phase

Track key metrics during rollout:

```typescript
// monitoring/feature-metrics.ts
interface FeatureMetrics {
  flagName: string;
  rolloutPercentage: number;
  activeUsers: number;
  errorRate: number;
  performanceImpact: number;
  userFeedback: number;
  businessMetrics: Record<string, number>;
}

// Example success criteria
const successCriteria = {
  errorRate: { max: 0.1 }, // Less than 0.1%
  performanceImpact: { max: 50 }, // Less than 50ms additional latency
  userFeedback: { min: 4.0 }, // Minimum 4.0/5.0 rating
};
```

### 5. Cleanup Phase

Remove flags after successful rollout:

```typescript
// 1. Set flag to 100% rollout
rolloutPercentage: 100

// 2. Monitor for 1-2 weeks
// 3. Remove flag entirely and clean up code

// Before cleanup
if (featureFlags.isEnabled(FeatureFlag.ENHANCED_SEARCH)) {
  return enhancedSearch();
} else {
  return basicSearch();
}

// After cleanup - just the new implementation
return enhancedSearch();
```

## Naming Conventions

### Flag Names

```typescript
// ✅ Good: Clear, descriptive names
FeatureFlag.NEW_DASHBOARD           // UI changes
FeatureFlag.ENHANCED_SEARCH         // Feature improvements
FeatureFlag.DOCUMENT_SIGNING        // New functionality
FeatureFlag.PERFORMANCE_CACHING     // Technical improvements
FeatureFlag.HUBSPOT_V2             // Integration updates

// ❌ Bad: Vague or confusing names
FeatureFlag.FEATURE_A
FeatureFlag.NEW_THING
FeatureFlag.TEMP_FIX
FeatureFlag.EXPERIMENT_123
```

### Environment Variable Keys

```bash
# ✅ Good: Consistent pattern
FEATURE_{CATEGORY}_{FEATURE_NAME}

FEATURE_UI_NEW_DASHBOARD=true
FEATURE_SEARCH_ENHANCED_SEARCH=false
FEATURE_INTEGRATION_DOCUMENT_SIGNING=true
FEATURE_PERFORMANCE_CACHING=true

# ❌ Bad: Inconsistent naming
NEW_DASHBOARD_ENABLED=true
ENABLE_SEARCH=false
DOC_SIGN=true
CACHE_ON=true
```

### Code Organization

```typescript
// ✅ Good: Organized by domain
export enum FeatureFlag {
  // UI Features
  NEW_DASHBOARD = 'NEW_DASHBOARD',
  ENHANCED_SEARCH = 'ENHANCED_SEARCH',
  
  // Integrations
  DOCUMENT_SIGNING = 'DOCUMENT_SIGNING',
  HUBSPOT_V2 = 'HUBSPOT_V2',
  
  // Performance
  PERFORMANCE_CACHING = 'PERFORMANCE_CACHING',
}

// ❌ Bad: Random order
export enum FeatureFlag {
  HUBSPOT_V2 = 'HUBSPOT_V2',
  NEW_DASHBOARD = 'NEW_DASHBOARD',
  PERFORMANCE_CACHING = 'PERFORMANCE_CACHING',
  DOCUMENT_SIGNING = 'DOCUMENT_SIGNING',
}
```

## Development Practices

### 1. Keep Flag Logic Simple

```typescript
// ✅ Good: Simple, clear logic
function SearchComponent() {
  const { data: flags } = useFeatureFlags();
  
  if (flags?.[FeatureFlag.ENHANCED_SEARCH]) {
    return <EnhancedSearch />;
  }
  
  return <BasicSearch />;
}

// ❌ Bad: Complex nested logic
function SearchComponent() {
  const { data: flags } = useFeatureFlags();
  
  if (flags?.[FeatureFlag.ENHANCED_SEARCH]) {
    if (flags?.[FeatureFlag.ADVANCED_FILTERS]) {
      if (flags?.[FeatureFlag.AI_SUGGESTIONS]) {
        return <AIEnhancedSearchWithFilters />;
      } else {
        return <EnhancedSearchWithFilters />;
      }
    } else {
      return <BasicEnhancedSearch />;
    }
  }
  
  return <BasicSearch />;
}
```

### 2. Use Wrapper Components

```tsx
// ✅ Good: Clean component wrapping
<FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
  <NewDashboard />
</FeatureWrapper>

<FeatureWrapper 
  feature={FeatureFlag.ENHANCED_SEARCH}
  fallback={<BasicSearch />}
>
  <EnhancedSearch />
</FeatureWrapper>

// ❌ Bad: Inline conditionals everywhere
{flags?.[FeatureFlag.NEW_DASHBOARD] && <NewDashboard />}
{!flags?.[FeatureFlag.NEW_DASHBOARD] && <OldDashboard />}
```

### 3. Minimize Flag Dependencies

```typescript
// ✅ Good: Minimal dependencies
[FeatureFlag.ENHANCED_SEARCH]: {
  dependencies: [FeatureFlag.PERFORMANCE_CACHING], // Only essential dependency
}

// ❌ Bad: Too many dependencies
[FeatureFlag.ENHANCED_SEARCH]: {
  dependencies: [
    FeatureFlag.PERFORMANCE_CACHING,
    FeatureFlag.NEW_DASHBOARD,
    FeatureFlag.USER_ANALYTICS,
    FeatureFlag.ADVANCED_LOGGING,
  ], // Creates complex dependency chain
}
```

### 4. Document Flag Impact

```typescript
/**
 * Enhanced Search Feature Flag
 * 
 * @description Enables the new search functionality with filters and autocomplete
 * @owner Search Team
 * @rolloutPlan Gradual rollout over 4 weeks starting 2025-01-15
 * @dependencies PERFORMANCE_CACHING (required for optimal performance)
 * @metrics search_success_rate, avg_response_time, user_satisfaction
 * @removalDate 2025-03-01
 * 
 * Impact:
 * - Frontend: New SearchBox component, additional API calls
 * - Backend: New search endpoints, increased database load
 * - Performance: ~50ms additional latency, requires caching
 */
[FeatureFlag.ENHANCED_SEARCH]: {
  // Configuration...
}
```

## Testing Strategies

### 1. Test Both Paths

```typescript
// ✅ Good: Test enabled and disabled states
describe('SearchComponent', () => {
  it('should render enhanced search when flag is enabled', async () => {
    mockFeatureFlags({ [FeatureFlag.ENHANCED_SEARCH]: true });
    
    render(<SearchComponent />);
    
    expect(screen.getByTestId('enhanced-search')).toBeInTheDocument();
    expect(screen.queryByTestId('basic-search')).not.toBeInTheDocument();
  });

  it('should render basic search when flag is disabled', async () => {
    mockFeatureFlags({ [FeatureFlag.ENHANCED_SEARCH]: false });
    
    render(<SearchComponent />);
    
    expect(screen.getByTestId('basic-search')).toBeInTheDocument();
    expect(screen.queryByTestId('enhanced-search')).not.toBeInTheDocument();
  });
});
```

### 2. Test Dependencies

```typescript
describe('Feature Dependencies', () => {
  it('should disable enhanced search when caching is disabled', () => {
    const context = { environment: 'production' as const };
    
    // Mock caching disabled
    process.env.FEATURE_PERFORMANCE_CACHING = 'false';
    process.env.FEATURE_SEARCH_ENHANCED_SEARCH = 'true';
    
    const manager = FeatureFlagManager.getInstance();
    
    // Enhanced search should be disabled due to dependency
    expect(manager.isEnabled(FeatureFlag.ENHANCED_SEARCH, context)).toBe(false);
  });
});
```

### 3. Integration Testing

```typescript
describe('Feature Flag API Integration', () => {
  it('should handle flag toggles correctly', async () => {
    // Test with flag disabled
    mockFeatureFlag(FeatureFlag.NEW_DASHBOARD, false);
    
    let response = await request(app).get('/api/dashboard');
    expect(response.body.version).toBe('legacy');
    
    // Test with flag enabled
    mockFeatureFlag(FeatureFlag.NEW_DASHBOARD, true);
    
    response = await request(app).get('/api/dashboard');
    expect(response.body.version).toBe('new');
  });
});
```

## Performance Guidelines

### 1. Batch Flag Requests

```typescript
// ✅ Good: Single batch request
const { data: flags } = useFeatureFlags();
const showDashboard = flags?.[FeatureFlag.NEW_DASHBOARD];
const showSearch = flags?.[FeatureFlag.ENHANCED_SEARCH];

// ❌ Bad: Multiple individual requests
const { data: dashboardFlag } = useFeatureFlag(FeatureFlag.NEW_DASHBOARD);
const { data: searchFlag } = useFeatureFlag(FeatureFlag.ENHANCED_SEARCH);
```

### 2. Cache Appropriately

```typescript
// ✅ Good: Appropriate cache duration
const productionConfig = {
  cacheDuration: 10 * 60 * 1000, // 10 minutes for production
};

const developmentConfig = {
  cacheDuration: 1 * 60 * 1000, // 1 minute for development
};

// ❌ Bad: No caching or excessive caching
const badConfig = {
  cacheDuration: 0, // No caching - too many requests
  // or
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours - changes not reflected
};
```

### 3. Minimize Evaluation Complexity

```typescript
// ✅ Good: Simple evaluation
const isEnabled = manager.isEnabled(flag, context);

// ❌ Bad: Complex runtime computation
const isEnabled = manager.isEnabled(flag, {
  ...context,
  customAttributes: {
    timeOfDay: new Date().getHours(), // Computed every time
    randomValue: Math.random(), // Non-deterministic
    complexCalculation: performExpensiveCalculation(), // Slow
  }
});
```

## Security Best Practices

### 1. Protect Sensitive Flags

```typescript
// ✅ Good: Role-based restrictions
[FeatureFlag.DOCUMENT_SIGNING]: {
  minimumRole: 'Admin', // Restrict to admin users
  environments: ['staging', 'production'], // Not available in dev
  clientSpecific: true, // Can be enabled per client
}

// ❌ Bad: No restrictions
[FeatureFlag.ADMIN_PANEL]: {
  minimumRole: 'User', // Available to all users - dangerous!
}
```

### 2. Validate Inputs

```typescript
// ✅ Good: Input validation
export function validateFeatureFlagRequest(req: Request): FeatureFlagContext {
  const schema = z.object({
    environment: z.enum(['development', 'staging', 'production']),
    userId: z.string().optional(),
    userRole: z.enum(['User', 'Admin', 'SuperAdmin']).optional(),
  });
  
  return schema.parse(req.body);
}

// ❌ Bad: No validation
export function getFeatureFlagContext(req: Request): FeatureFlagContext {
  return req.body; // Dangerous - no validation
}
```

### 3. Sanitize Logs

```typescript
// ✅ Good: Sanitized logging
logger.info('Feature flag evaluated', {
  flag: flagName,
  enabled: result.enabled,
  userId: context.userId ? '[REDACTED]' : undefined,
  environment: context.environment,
});

// ❌ Bad: Exposed sensitive data
logger.info('Feature flag evaluated', {
  flag: flagName,
  context: context, // May contain sensitive user data
});
```

## Monitoring & Analytics

### 1. Track Key Metrics

```typescript
interface FeatureFlagMetrics {
  // Usage metrics
  evaluationCount: number;
  enabledPercentage: number;
  userAdoption: number;
  
  // Performance metrics
  evaluationLatency: number;
  cacheHitRate: number;
  errorRate: number;
  
  // Business metrics
  conversionRate?: number;
  userSatisfaction?: number;
  revenueImpact?: number;
}
```

### 2. Set Up Alerts

```typescript
// monitoring/alerts.ts
export const featureFlagAlerts = {
  highErrorRate: {
    condition: 'error_rate > 1%',
    action: 'disable_flag_and_alert_team',
  },
  lowAdoption: {
    condition: 'adoption_rate < 5% after 7 days',
    action: 'alert_product_team',
  },
  performanceImpact: {
    condition: 'response_time > baseline + 100ms',
    action: 'alert_engineering_team',
  },
};
```

## Team Collaboration

### 1. Clear Ownership

```typescript
interface FeatureFlagOwnership {
  flag: FeatureFlag;
  owner: string;              // Primary owner
  stakeholders: string[];     // Secondary stakeholders
  reviewers: string[];        // Code reviewers
  rolloutApprovers: string[]; // Production rollout approvers
}
```

### 2. Documentation Standards

```markdown
## Feature Flag: ENHANCED_SEARCH

**Owner**: Search Team (@search-team)
**Status**: Rolling out (Week 2 of 4)
**Current Rollout**: 25% of users

### Description
Enhanced search functionality with filters, auto-complete, and improved relevance.

### Dependencies
- PERFORMANCE_CACHING (required)

### Rollout Plan
- Week 1: 5% (completed ✅)
- Week 2: 25% (in progress 🟡)
- Week 3: 50% (planned)
- Week 4: 100% (planned)

### Success Metrics
- Search success rate: Target >85% (currently 87% ✅)
- Response time: Target <200ms (currently 145ms ✅)
- User satisfaction: Target >4.0/5 (currently 4.2/5 ✅)

### Rollback Plan
If metrics drop below targets:
1. Reduce rollout percentage immediately
2. Investigate and fix issues
3. Resume gradual rollout

### Removal Date
Target: 2025-03-01 (2 weeks after 100% rollout)
```

## Common Anti-Patterns

### 1. Permanent Flags

```typescript
// ❌ Anti-pattern: Flags that never get removed
[FeatureFlag.LEGACY_SUPPORT]: {
  description: 'Support for legacy API',
  defaultValue: true,
  // This flag has been here for 2+ years and shows no signs of removal
}

// ✅ Better: Configuration or environment variable
const SUPPORT_LEGACY_API = process.env.SUPPORT_LEGACY_API === 'true';
```

### 2. Complex Flag Logic

```typescript
// ❌ Anti-pattern: Complex nested flags
if (flags.A && (flags.B || flags.C) && !flags.D && user.role === 'admin') {
  // Very hard to test and understand
}

// ✅ Better: Single flag with clear purpose
if (flags.ADMIN_ADVANCED_FEATURES) {
  // Clear and testable
}
```

### 3. Feature Flag Sprawl

```typescript
// ❌ Anti-pattern: Too many flags
if (flags.BUTTON_COLOR_RED) { /* ... */ }
if (flags.BUTTON_SIZE_LARGE) { /* ... */ }
if (flags.BUTTON_BORDER_THICK) { /* ... */ }

// ✅ Better: Single flag for related changes
if (flags.NEW_BUTTON_DESIGN) { /* ... */ }
```

### 4. Testing in Production Only

```typescript
// ❌ Anti-pattern: Only testing in production
[FeatureFlag.RISKY_FEATURE]: {
  environments: ['production'], // No testing in dev/staging
  rolloutPercentage: 50, // Rolling out without proper testing
}

// ✅ Better: Test in all environments
[FeatureFlag.NEW_FEATURE]: {
  environments: ['development', 'staging', 'production'],
  // Test thoroughly before production rollout
}
```

### 5. No Monitoring

```typescript
// ❌ Anti-pattern: Deploy and forget
// No metrics, no monitoring, no success criteria

// ✅ Better: Comprehensive monitoring
const flagMonitoring = {
  metrics: ['error_rate', 'performance', 'adoption'],
  alerts: ['high_error_rate', 'low_adoption'],
  dashboards: ['real_time', 'weekly_summary'],
  reviews: ['daily_during_rollout', 'weekly_post_rollout'],
};
```

---

## Quick Reference

### Flag Creation Checklist

- [ ] Clear name and description
- [ ] Designated owner
- [ ] Appropriate default value (usually false)
- [ ] Correct environments
- [ ] Minimal dependencies
- [ ] Rollout plan defined
- [ ] Success metrics identified
- [ ] Removal date planned

### Code Review Checklist

- [ ] Both enabled/disabled paths tested
- [ ] Simple, readable flag logic
- [ ] No complex nested conditions
- [ ] Proper error handling
- [ ] Documentation updated
- [ ] No sensitive data in logs

### Rollout Checklist

- [ ] Start with small percentage (5-10%)
- [ ] Monitor key metrics
- [ ] Have rollback plan ready
- [ ] Gradually increase percentage
- [ ] Document any issues
- [ ] Plan cleanup after 100%

---

*Last updated: January 2025*