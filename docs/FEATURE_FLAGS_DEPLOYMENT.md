# Feature Flags Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Production Deployment](#production-deployment)
4. [Configuration Management](#configuration-management)
5. [Monitoring & Observability](#monitoring--observability)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)
8. [Backup & Recovery](#backup--recovery)
9. [Deployment Checklist](#deployment-checklist)

## Overview

This guide covers deploying the feature flags system to production environments, including configuration management, security considerations, and monitoring setup.

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Application   │    │   Environment   │
│                 │    │   Servers       │    │   Variables     │
│ • SSL Term.     │◄──►│                 │◄──►│                 │
│ • Rate Limiting │    │ • Feature Flags │    │ • Config Store  │
│ • Health Checks │    │ • Cache Layer   │    │ • Secrets Mgmt  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Environment Setup

### Development Environment

```bash
# .env.development
NODE_ENV=development

# Feature flag overrides for development
FEATURE_UI_NEW_DASHBOARD=true
FEATURE_SEARCH_ENHANCED_SEARCH=true
FEATURE_INTEGRATION_DOCUMENT_SIGNING=false
FEATURE_INTEGRATION_HUBSPOT_V2=false
FEATURE_PERFORMANCE_CACHING=true

# Debug settings
FEATURE_FLAGS_DEBUG=true
FEATURE_FLAGS_STRICT=false
FEATURE_FLAGS_CACHE_DURATION=60000
```

### Staging Environment

```bash
# .env.staging
NODE_ENV=staging

# Conservative feature enablement for staging
FEATURE_UI_NEW_DASHBOARD=true
FEATURE_SEARCH_ENHANCED_SEARCH=false
FEATURE_INTEGRATION_DOCUMENT_SIGNING=true
FEATURE_INTEGRATION_HUBSPOT_V2=false
FEATURE_PERFORMANCE_CACHING=true

# Production-like settings
FEATURE_FLAGS_DEBUG=false
FEATURE_FLAGS_STRICT=true
FEATURE_FLAGS_CACHE_DURATION=300000
```

### Production Environment

```bash
# .env.production
NODE_ENV=production

# Carefully controlled production flags
FEATURE_UI_NEW_DASHBOARD=false
FEATURE_SEARCH_ENHANCED_SEARCH=false
FEATURE_INTEGRATION_DOCUMENT_SIGNING=true
FEATURE_INTEGRATION_HUBSPOT_V2=true
FEATURE_PERFORMANCE_CACHING=true

# Production settings
FEATURE_FLAGS_DEBUG=false
FEATURE_FLAGS_STRICT=true
FEATURE_FLAGS_CACHE_DURATION=600000
```

## Production Deployment

### Prerequisites

1. **Environment Variables Setup**
   ```bash
   # Verify all required environment variables are set
   ./scripts/verify-env.sh production
   ```

2. **Database Migrations** (if applicable)
   ```bash
   npm run db:migrate
   ```

3. **Dependencies Installation**
   ```bash
   npm ci --production
   ```

### Deployment Steps

#### 1. Pre-deployment Validation

```bash
#!/bin/bash
# scripts/pre-deploy-validation.sh

set -e

echo "🔍 Running pre-deployment validation..."

# Test feature flag registry
npm run test:feature-flags:registry

# Validate environment configuration
npm run validate:env

# Check for circular dependencies
npm run test:feature-flags:dependencies

# Run integration tests
npm run test:integration

echo "✅ Pre-deployment validation passed"
```

#### 2. Deploy Application

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Deploying feature flags system..."

# Build application
npm run build

# Deploy to production servers
./scripts/deploy-to-servers.sh

# Health check
./scripts/health-check.sh

echo "✅ Deployment completed successfully"
```

#### 3. Post-deployment Verification

```bash
#!/bin/bash
# scripts/post-deploy-verification.sh

set -e

echo "🔍 Running post-deployment verification..."

# Test feature flag API endpoints
curl -f "$PRODUCTION_URL/api/feature-flags/health" || exit 1

# Verify all flags are accessible
./scripts/verify-flags.sh

# Run smoke tests
npm run test:e2e:smoke

echo "✅ Post-deployment verification passed"
```

## Configuration Management

### Environment-Specific Configurations

#### Development
```typescript
// config/development.ts
export const featureFlagConfig = {
  debug: true,
  strict: false,
  cacheDuration: 1 * 60 * 1000, // 1 minute
  enableAllFlags: true, // Override for development
  logLevel: 'debug',
  apiTimeout: 5000,
};
```

#### Production
```typescript
// config/production.ts
export const featureFlagConfig = {
  debug: false,
  strict: true,
  cacheDuration: 10 * 60 * 1000, // 10 minutes
  enableAllFlags: false,
  logLevel: 'error',
  apiTimeout: 3000,
};
```

### Configuration Validation

```typescript
// scripts/validate-config.ts
import { validateFeatureFlagRegistry } from '../shared/feature-flag-registry';

export function validateConfiguration() {
  console.log('🔍 Validating feature flag configuration...');
  
  // Validate registry
  const errors = validateFeatureFlagRegistry();
  if (errors.length > 0) {
    console.error('❌ Registry validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  // Validate environment variables
  const requiredEnvVars = [
    'NODE_ENV',
    'FEATURE_PERFORMANCE_CACHING',
    // Add other required vars
  ];
  
  const missingVars = requiredEnvVars.filter(key => !process.env[key]);
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingVars.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ Configuration validation passed');
}
```

### Secrets Management

#### Using Azure Key Vault
```typescript
// config/secrets.ts
import { SecretClient } from '@azure/keyvault-secrets';

export async function loadFeatureFlagSecrets() {
  const client = new SecretClient(
    process.env.AZURE_KEYVAULT_URL!,
    credential
  );
  
  const secrets = await Promise.all([
    client.getSecret('feature-ui-new-dashboard'),
    client.getSecret('feature-integration-document-signing'),
    // Add other sensitive feature flags
  ]);
  
  return secrets.reduce((acc, secret) => {
    acc[secret.name!] = secret.value;
    return acc;
  }, {} as Record<string, string>);
}
```

#### Using AWS Parameter Store
```typescript
// config/aws-params.ts
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';

export async function loadFeatureFlagParameters() {
  const client = new SSMClient({ region: process.env.AWS_REGION });
  
  const params = await client.send(new GetParametersCommand({
    Names: [
      '/app/feature-flags/new-dashboard',
      '/app/feature-flags/document-signing',
      // Add other parameters
    ],
    WithDecryption: true
  }));
  
  return params.Parameters?.reduce((acc, param) => {
    const key = param.Name!.split('/').pop()!;
    acc[key] = param.Value!;
    return acc;
  }, {} as Record<string, string>) || {};
}
```

## Monitoring & Observability

### Metrics Collection

```typescript
// monitoring/metrics.ts
import { metrics } from '@opentelemetry/api-metrics';

const meter = metrics.getMeter('feature-flags');

// Counters
const flagEvaluationCounter = meter.createCounter('feature_flag_evaluations_total', {
  description: 'Total number of feature flag evaluations'
});

const flagErrorCounter = meter.createCounter('feature_flag_errors_total', {
  description: 'Total number of feature flag evaluation errors'
});

// Histograms
const evaluationDuration = meter.createHistogram('feature_flag_evaluation_duration', {
  description: 'Duration of feature flag evaluations in milliseconds'
});

// Gauges
const cacheSize = meter.createGauge('feature_flag_cache_size', {
  description: 'Current size of feature flag cache'
});

export function recordFlagEvaluation(flag: string, enabled: boolean, duration: number) {
  flagEvaluationCounter.add(1, { flag, enabled: enabled.toString() });
  evaluationDuration.record(duration, { flag });
}

export function recordFlagError(flag: string, error: string) {
  flagErrorCounter.add(1, { flag, error_type: error });
}

export function updateCacheMetrics(size: number) {
  cacheSize.record(size);
}
```

### Health Checks

```typescript
// monitoring/health.ts
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  timestamp: string;
}

export async function performFeatureFlagHealthCheck(): Promise<HealthCheck> {
  try {
    const manager = FeatureFlagManager.getInstance();
    const stats = manager.getCacheStats();
    
    // Check if manager is responsive
    const testContext = { environment: 'production' as const };
    const testResult = manager.isEnabled(FeatureFlag.PERFORMANCE_CACHING, testContext);
    
    return {
      name: 'feature-flags',
      status: 'healthy',
      message: `Cache size: ${stats.size}, Test evaluation: ${testResult}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      name: 'feature-flags',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
```

### Logging Setup

```typescript
// monitoring/logging.ts
import winston from 'winston';

export const featureFlagLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'feature-flags' },
  transports: [
    new winston.transports.File({ filename: 'logs/feature-flags-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/feature-flags-combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  featureFlagLogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export function logFlagEvaluation(flag: string, context: any, result: any) {
  featureFlagLogger.info('Feature flag evaluated', {
    flag,
    context: {
      environment: context.environment,
      userId: context.userId ? '[REDACTED]' : undefined,
      userRole: context.userRole
    },
    result: {
      enabled: result.enabled,
      source: result.source,
      reason: result.reason
    }
  });
}
```

## Security Considerations

### Access Control

```typescript
// security/access-control.ts
export function validateFeatureFlagAccess(
  user: User,
  flag: FeatureFlag,
  operation: 'read' | 'write'
): boolean {
  // Admin operations require SuperAdmin role
  if (operation === 'write') {
    return user.role === 'SuperAdmin';
  }
  
  // Read access restrictions by flag
  const restrictedFlags = [
    FeatureFlag.DOCUMENT_SIGNING,
    FeatureFlag.HUBSPOT_V2
  ];
  
  if (restrictedFlags.includes(flag)) {
    return ['Admin', 'SuperAdmin'].includes(user.role);
  }
  
  return true; // All users can read general flags
}
```

### Rate Limiting

```typescript
// security/rate-limiting.ts
import rateLimit from 'express-rate-limit';

export const featureFlagRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many feature flag requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  }
});
```

### Input Validation

```typescript
// security/validation.ts
import { z } from 'zod';

const featureFlagSchema = z.object({
  flag: z.enum(Object.values(FeatureFlag) as [string, ...string[]]),
  context: z.object({
    environment: z.enum(['development', 'staging', 'production']),
    userId: z.string().optional(),
    userRole: z.enum(['User', 'Admin', 'SuperAdmin']).optional(),
    clientId: z.string().optional()
  })
});

export function validateFeatureFlagRequest(data: unknown) {
  return featureFlagSchema.parse(data);
}
```

## Performance Optimization

### Caching Strategy

```typescript
// performance/caching.ts
import Redis from 'ioredis';

export class DistributedFeatureFlagCache {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: 'feature-flags:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }
  
  async get(key: string): Promise<any> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttlMs: number): Promise<void> {
    try {
      await this.redis.setex(key, Math.ceil(ttlMs / 1000), JSON.stringify(value));
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }
  
  async clear(): Promise<void> {
    try {
      const keys = await this.redis.keys('*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }
}
```

### Connection Pooling

```typescript
// performance/connection-pool.ts
export class FeatureFlagConnectionPool {
  private pool: Pool;
  
  constructor() {
    this.pool = new Pool({
      min: 2,
      max: 10,
      acquireTimeoutMillis: 3000,
      createTimeoutMillis: 5000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
      create: () => this.createConnection(),
      destroy: (connection) => this.destroyConnection(connection),
      validate: (connection) => this.validateConnection(connection)
    });
  }
  
  async acquire(): Promise<Connection> {
    return this.pool.acquire();
  }
  
  async release(connection: Connection): Promise<void> {
    return this.pool.release(connection);
  }
}
```

## Backup & Recovery

### Configuration Backup

```bash
#!/bin/bash
# scripts/backup-config.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/feature-flags"
mkdir -p $BACKUP_DIR

echo "📦 Creating feature flag configuration backup..."

# Backup registry
cp shared/feature-flag-registry.ts "$BACKUP_DIR/registry_$DATE.ts"

# Backup environment configurations
for env in development staging production; do
  if [ -f ".env.$env" ]; then
    cp ".env.$env" "$BACKUP_DIR/env_${env}_$DATE"
  fi
done

# Create manifest
cat > "$BACKUP_DIR/manifest_$DATE.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "$(git rev-parse HEAD)",
  "environment": "$NODE_ENV",
  "files": [
    "registry_$DATE.ts",
    "env_development_$DATE",
    "env_staging_$DATE",
    "env_production_$DATE"
  ]
}
EOF

echo "✅ Backup created: $BACKUP_DIR/manifest_$DATE.json"
```

### Recovery Procedures

```bash
#!/bin/bash
# scripts/recover-config.sh

BACKUP_MANIFEST=$1

if [ -z "$BACKUP_MANIFEST" ]; then
  echo "Usage: $0 <backup_manifest.json>"
  exit 1
fi

echo "🔄 Recovering feature flag configuration from $BACKUP_MANIFEST..."

BACKUP_DIR=$(dirname "$BACKUP_MANIFEST")
TIMESTAMP=$(basename "$BACKUP_MANIFEST" .json | cut -d'_' -f2-)

# Restore registry
cp "$BACKUP_DIR/registry_$TIMESTAMP.ts" shared/feature-flag-registry.ts

# Restore environment files
for env in development staging production; do
  if [ -f "$BACKUP_DIR/env_${env}_$TIMESTAMP" ]; then
    cp "$BACKUP_DIR/env_${env}_$TIMESTAMP" ".env.$env"
  fi
done

echo "✅ Configuration recovered from backup"
echo "⚠️  Please restart the application to apply changes"
```

## Deployment Checklist

### Pre-Deployment

- [ ] **Environment Validation**
  - [ ] All required environment variables are set
  - [ ] Feature flag registry passes validation
  - [ ] No circular dependencies detected
  - [ ] Environment-specific configurations are correct

- [ ] **Testing**
  - [ ] Unit tests pass
  - [ ] Integration tests pass
  - [ ] E2E tests pass
  - [ ] Load testing completed (if applicable)

- [ ] **Security Review**
  - [ ] Access controls properly configured
  - [ ] Rate limiting enabled
  - [ ] Input validation implemented
  - [ ] Secrets properly managed

- [ ] **Documentation**
  - [ ] Deployment runbook updated
  - [ ] Configuration changes documented
  - [ ] Rollback procedures documented

### Deployment

- [ ] **Backup**
  - [ ] Current configuration backed up
  - [ ] Database backup created (if applicable)
  - [ ] Previous deployment artifacts preserved

- [ ] **Deploy**
  - [ ] Application deployed to all servers
  - [ ] Health checks passing
  - [ ] Feature flag API responding
  - [ ] Cache functioning properly

- [ ] **Verification**
  - [ ] All feature flags accessible
  - [ ] Expected flags enabled/disabled
  - [ ] No errors in logs
  - [ ] Performance metrics normal

### Post-Deployment

- [ ] **Monitoring**
  - [ ] Alerts configured
  - [ ] Metrics collection active
  - [ ] Health checks scheduled
  - [ ] Log aggregation working

- [ ] **Documentation**
  - [ ] Deployment recorded
  - [ ] Team notified
  - [ ] Runbook updated
  - [ ] Lessons learned documented

### Rollback Plan

If issues are detected:

1. **Immediate**: Disable problematic feature flags via environment variables
2. **Short-term**: Revert to previous application version
3. **Long-term**: Fix issues and redeploy

```bash
# Emergency feature flag disable
export FEATURE_UI_NEW_DASHBOARD=false
# Restart application to pick up changes
pm2 restart all
```

---

*Last updated: January 2025*