# Feature Flags System Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Usage Examples](#usage-examples)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The Feature Flags System is a comprehensive solution for managing feature toggles across the employee portal application. It enables teams to:

- **Gradually roll out features** to specific user segments
- **Test in production** with controlled exposure
- **Quickly disable problematic features** without code deployment
- **A/B test different implementations** 
- **Manage environment-specific features**
- **Control access based on user roles**

### Key Benefits

- ✅ **Zero-downtime deployments** - Deploy code with features disabled, enable when ready
- ✅ **Risk mitigation** - Instantly disable problematic features
- ✅ **Gradual rollouts** - Control feature exposure percentage
- ✅ **Environment control** - Different behavior per environment
- ✅ **Role-based access** - Restrict features by user role
- ✅ **Dependency management** - Ensure prerequisite features are enabled

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Shared        │
│                 │    │                 │    │                 │
│ • React Hooks   │◄──►│ • Express       │◄──►│ • Type Defs     │
│ • Components    │    │   Middleware    │    │ • Manager       │
│ • Context       │    │ • API Routes    │    │ • Registry      │
│                 │    │ • Utils         │    │ • Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Classes

- **`FeatureFlagManager`** - Singleton manager for flag evaluation and caching
- **`FeatureFlagRegistry`** - Centralized configuration store
- **`FeatureWrapper`** - React component for conditional rendering
- **`useFeatureFlags`** - React hook for accessing flags

## Getting Started

### 1. Backend Setup

First, initialize the feature flag manager in your server:

```typescript
// server/index.ts
import { FeatureFlagManager } from '../shared/feature-flag-manager';
import { featureFlagMiddleware } from './middleware/feature-flags';

const app = express();

// Initialize feature flag system
const featureFlagManager = FeatureFlagManager.getInstance({
  debug: process.env.NODE_ENV === 'development',
  strict: process.env.NODE_ENV === 'production'
});

await featureFlagManager.initialize();

// Add middleware
app.use(featureFlagMiddleware);
```

### 2. Frontend Setup

Wrap your app with the feature flag provider:

```tsx
// client/src/App.tsx
import { FeatureFlagProvider } from './hooks/use-feature-flags';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FeatureFlagProvider>
        <YourAppContent />
      </FeatureFlagProvider>
    </QueryClientProvider>
  );
}
```

### 3. Environment Variables

Set up your environment variables:

```bash
# .env
NODE_ENV=development

# Feature flag overrides
FEATURE_UI_NEW_DASHBOARD=true
FEATURE_SEARCH_ENHANCED_SEARCH=false
FEATURE_PERFORMANCE_CACHING=true
```

## Usage Examples

### Backend Usage

#### Route Protection

```typescript
import { requireFeature } from '../middleware/feature-flags';

// Protect entire route
app.get('/api/new-dashboard', 
  requireFeature(FeatureFlag.NEW_DASHBOARD),
  (req, res) => {
    res.json({ message: 'New dashboard data' });
  }
);
```

#### Conditional Logic

```typescript
import { ifFeatureEnabled } from '../middleware/feature-flags';

app.get('/api/search', (req, res) => {
  const results = ifFeatureEnabled(
    req,
    FeatureFlag.ENHANCED_SEARCH,
    () => performEnhancedSearch(req.query),
    () => performBasicSearch(req.query)
  );
  
  res.json(results);
});
```

#### Manual Checking

```typescript
app.get('/api/data', (req, res) => {
  const enableNewDashboard = req.isFeatureEnabled(FeatureFlag.NEW_DASHBOARD);
  const enableCaching = req.isFeatureEnabled(FeatureFlag.PERFORMANCE_CACHING);
  
  const data = await getData();
  
  if (enableCaching) {
    // Cache the data
    await cacheData(data);
  }
  
  res.json({
    data,
    features: {
      newDashboard: enableNewDashboard,
      caching: enableCaching
    }
  });
});
```

### Frontend Usage

#### Component Wrapping

```tsx
import { FeatureWrapper } from '../components/FeatureWrapper';

function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <FeatureWrapper feature={FeatureFlag.NEW_DASHBOARD}>
        <NewDashboardComponent />
      </FeatureWrapper>
      
      <FeatureWrapper 
        feature={FeatureFlag.NEW_DASHBOARD}
        fallback={<OldDashboardComponent />}
      >
        <NewDashboardComponent />
      </FeatureWrapper>
    </div>
  );
}
```

#### Hooks Usage

```tsx
import { useFeatureFlags } from '../hooks/use-feature-flags';

function SearchComponent() {
  const { data: flags, isLoading } = useFeatureFlags();
  
  if (isLoading) return <div>Loading...</div>;
  
  const enableEnhancedSearch = flags?.[FeatureFlag.ENHANCED_SEARCH];
  
  return (
    <div>
      {enableEnhancedSearch ? (
        <EnhancedSearchBox />
      ) : (
        <BasicSearchBox />
      )}
    </div>
  );
}
```

#### Multiple Flags

```tsx
function NavigationMenu() {
  const { data: flags } = useFeatureFlags();
  
  const showDashboard = flags?.[FeatureFlag.NEW_DASHBOARD];
  const showSearch = flags?.[FeatureFlag.ENHANCED_SEARCH];
  const showAdmin = flags?.[FeatureFlag.DOCUMENT_SIGNING];
  
  return (
    <nav>
      <a href="/">Home</a>
      {showDashboard && <a href="/dashboard">Dashboard</a>}
      {showSearch && <a href="/search">Search</a>}
      {showAdmin && <a href="/admin">Admin</a>}
    </nav>
  );
}
```

## Configuration

### Adding New Feature Flags

1. **Define the flag** in `shared/feature-flags.ts`:

```typescript
export enum FeatureFlag {
  // Existing flags...
  MY_NEW_FEATURE = 'MY_NEW_FEATURE'
}
```

2. **Register the flag** in `shared/feature-flag-registry.ts`:

```typescript
export const FEATURE_FLAG_REGISTRY: Record<FeatureFlag, FeatureFlagConfig> = {
  // Existing flags...
  [FeatureFlag.MY_NEW_FEATURE]: {
    name: FeatureFlag.MY_NEW_FEATURE,
    key: 'FEATURE_MY_NEW_FEATURE',
    description: 'Enable my new awesome feature',
    defaultValue: false,
    environments: ['development', 'staging', 'production'],
    owner: 'My Team',
    minimumRole: 'User',
    rolloutPercentage: 50,
  }
};
```

3. **Use the flag** in your code following the examples above.

### Flag Configuration Options

```typescript
interface FeatureFlagConfig {
  name: FeatureFlag;           // Flag identifier
  key: string;                 // Environment variable key
  description: string;         // Human-readable description
  defaultValue: boolean;       // Default state when no override
  environments: Environment[]; // Available environments
  dependencies?: FeatureFlag[]; // Required dependencies
  owner: string;               // Team/person responsible
  minimumRole?: UserRole;      // Minimum user role required
  clientSpecific?: boolean;    // Can be enabled per client
  rolloutPercentage?: number;  // Percentage of users (0-100)
}
```

## API Reference

### REST Endpoints

#### Get All Feature Flags
```http
GET /api/feature-flags
```

Response:
```json
{
  "success": true,
  "data": {
    "flags": {
      "NEW_DASHBOARD": true,
      "ENHANCED_SEARCH": false
    },
    "context": {
      "environment": "development",
      "hasUser": true,
      "hasRole": true
    }
  }
}
```

#### Get Specific Feature Flag
```http
GET /api/feature-flags/{flag}
```

Response:
```json
{
  "success": true,
  "data": {
    "flag": "NEW_DASHBOARD",
    "enabled": true,
    "state": {
      "source": "environment",
      "reason": "Set via environment variable",
      "lastEvaluated": "2025-01-15T10:30:00Z",
      "dependenciesSatisfied": true
    }
  }
}
```

#### Batch Request
```http
POST /api/feature-flags/batch
Content-Type: application/json

{
  "flags": ["NEW_DASHBOARD", "ENHANCED_SEARCH"]
}
```

#### Clear Cache (Admin Only)
```http
DELETE /api/feature-flags/cache
```

### Manager Methods

```typescript
// Get singleton instance
const manager = FeatureFlagManager.getInstance();

// Initialize (required before use)
await manager.initialize();

// Check if flag is enabled
const isEnabled = manager.isEnabled(flag, context);

// Get detailed evaluation
const result = manager.evaluate(flag, context);

// Get multiple flags
const flags = manager.getMultiple([flag1, flag2], context);

// Get all flags
const allFlags = manager.getAll(context);

// Clear cache
manager.clearCache();

// Get cache stats
const stats = manager.getCacheStats();
```

## Testing

### Unit Testing

```typescript
import { FeatureFlagManager } from '../feature-flag-manager';

describe('Feature Flags', () => {
  beforeEach(async () => {
    FeatureFlagManager.reset();
    const manager = FeatureFlagManager.getInstance();
    await manager.initialize();
  });

  it('should respect environment overrides', () => {
    process.env.FEATURE_UI_NEW_DASHBOARD = 'true';
    
    const manager = FeatureFlagManager.getInstance();
    const context = { environment: 'development' };
    
    expect(manager.isEnabled(FeatureFlag.NEW_DASHBOARD, context)).toBe(true);
  });
});
```

### Integration Testing

```typescript
import request from 'supertest';
import { app } from '../server';

describe('Feature Flag API', () => {
  it('should return feature flags', async () => {
    const response = await request(app)
      .get('/api/feature-flags')
      .expect(200);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.flags).toBeDefined();
  });
});
```

### E2E Testing

```typescript
import { test, expect } from '@playwright/test';

test('feature gated component', async ({ page }) => {
  await page.route('/api/feature-flags/NEW_DASHBOARD', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { flag: 'NEW_DASHBOARD', enabled: true }
      })
    });
  });
  
  await page.goto('/dashboard');
  await expect(page.locator('[data-feature="NEW_DASHBOARD"]')).toBeVisible();
});
```

## Best Practices

### 1. Flag Naming

```typescript
// ✅ Good: Descriptive and consistent
NEW_DASHBOARD
ENHANCED_SEARCH  
DOCUMENT_SIGNING

// ❌ Bad: Vague or inconsistent
FEATURE_A
enableNewThing
dashboard_v2
```

### 2. Environment Variables

```bash
# ✅ Good: Consistent prefix
FEATURE_UI_NEW_DASHBOARD=true
FEATURE_SEARCH_ENHANCED_SEARCH=false
FEATURE_INTEGRATION_DOCUMENT_SIGNING=false

# ❌ Bad: Inconsistent naming
NEW_DASHBOARD_ENABLED=true
ENABLE_SEARCH=false
DOC_SIGN=false
```

### 3. Dependencies

```typescript
// ✅ Good: Clear dependency chain
[FeatureFlag.ENHANCED_SEARCH]: {
  dependencies: [FeatureFlag.PERFORMANCE_CACHING],
  // ...
}

// ❌ Bad: Circular dependencies
[FeatureFlag.FEATURE_A]: {
  dependencies: [FeatureFlag.FEATURE_B],
}
[FeatureFlag.FEATURE_B]: {
  dependencies: [FeatureFlag.FEATURE_A], // Circular!
}
```

### 4. Gradual Rollouts

```typescript
// Start with small percentage
rolloutPercentage: 5,

// Gradually increase
rolloutPercentage: 25,
rolloutPercentage: 50,
rolloutPercentage: 100,
```

### 5. Flag Lifecycle

1. **Development** - Create flag, set to false by default
2. **Testing** - Enable in development/staging environments
3. **Rollout** - Gradually increase rollout percentage
4. **Full Release** - Set to 100% rollout
5. **Cleanup** - Remove flag after full adoption

## Troubleshooting

### Common Issues

#### 1. Flag Not Working

**Symptoms**: Feature flag appears enabled but feature not showing

**Solutions**:
- Check environment variable spelling
- Verify middleware is installed
- Check console for errors
- Verify flag is in registry

```bash
# Check current environment variables
env | grep FEATURE_

# Test API endpoint
curl http://localhost:3000/api/feature-flags/NEW_DASHBOARD
```

#### 2. Cache Issues

**Symptoms**: Changes not reflecting immediately

**Solutions**:
- Clear feature flag cache
- Check cache duration settings
- Restart application

```typescript
// Clear cache programmatically
const manager = FeatureFlagManager.getInstance();
manager.clearCache();
```

#### 3. Performance Issues

**Symptoms**: Slow page loads with many feature flags

**Solutions**:
- Use batch requests for multiple flags
- Implement proper caching
- Consider server-side rendering

```tsx
// ✅ Good: Batch request
const { data: flags } = useFeatureFlags();

// ❌ Bad: Multiple individual requests
const flag1 = useFeatureFlag(FeatureFlag.FEATURE_1);
const flag2 = useFeatureFlag(FeatureFlag.FEATURE_2);
```

#### 4. Role/Permission Issues

**Symptoms**: Admin features not available to admin users

**Solutions**:
- Check authentication middleware
- Verify role extraction logic
- Check minimum role requirements

```typescript
// Debug user context
console.log('User context:', req.getFeatureFlagContext());
```

### Debug Tools

#### Enable Debug Mode

```typescript
const manager = FeatureFlagManager.getInstance({
  debug: true, // Enable detailed logging
  strict: false // Don't throw on errors
});
```

#### Health Check

```bash
curl http://localhost:3000/api/feature-flags/health
```

#### Cache Statistics

```bash
curl http://localhost:3000/api/feature-flags/cache/stats
```

### Support

For additional support:

1. Check the [deployment guide](./FEATURE_FLAGS_DEPLOYMENT.md)
2. Review [best practices](./FEATURE_FLAGS_BEST_PRACTICES.md)  
3. Search existing issues in the repository
4. Create a new issue with detailed reproduction steps

---

*Last updated: January 2025*