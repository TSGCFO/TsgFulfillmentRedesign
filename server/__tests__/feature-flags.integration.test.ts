import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { 
  featureFlagMiddleware, 
  requireFeature, 
  ifFeatureEnabled,
  featureFlagLogger,
  featureFlagErrorHandler 
} from '../middleware/feature-flags';
import featureFlagRoutes from '../routes/feature-flags';
import { FeatureFlag } from '../../shared/feature-flags';
import { FeatureFlagManager } from '../../shared/feature-flag-manager';

// Mock the FeatureFlagManager
vi.mock('../../shared/feature-flag-manager');

describe('Feature Flags Backend Integration Tests', () => {
  let app: express.Application;
  let mockFeatureFlagManager: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock manager
    mockFeatureFlagManager = {
      isEnabled: vi.fn(),
      evaluate: vi.fn(),
      getMultiple: vi.fn(),
      getAll: vi.fn(),
      clearCache: vi.fn(),
      getCacheStats: vi.fn(),
    };

    // Mock the getFeatureFlagManager function
    const mockGetFeatureFlagManager = vi.fn().mockReturnValue(mockFeatureFlagManager);
    vi.doMock('../../shared/feature-flag-manager', () => ({
      getFeatureFlagManager: mockGetFeatureFlagManager,
      FeatureFlagManager: {
        getInstance: vi.fn().mockReturnValue(mockFeatureFlagManager)
      }
    }));

    // Create Express app
    app = express();
    app.use(express.json());
    
    // Add feature flag middleware
    app.use(featureFlagMiddleware);
    
    // Add feature flag routes
    app.use('/api/feature-flags', featureFlagRoutes);
    
    // Test routes
    app.get('/test/basic', (req, res) => {
      const isEnabled = req.isFeatureEnabled(FeatureFlag.NEW_DASHBOARD);
      res.json({ 
        message: 'Basic route', 
        featureEnabled: isEnabled,
        context: req.getFeatureFlagContext()
      });
    });

    app.get('/test/multiple', (req, res) => {
      const flags = req.getFeatureFlags([FeatureFlag.NEW_DASHBOARD, FeatureFlag.ENHANCED_SEARCH]);
      res.json({ flags });
    });

    app.get('/test/all', (req, res) => {
      const allFlags = req.getAllFeatureFlags();
      res.json({ allFlags });
    });

    // Protected route requiring feature flag
    app.get('/test/protected', requireFeature(FeatureFlag.DOCUMENT_SIGNING), (req, res) => {
      res.json({ message: 'Access granted to protected feature' });
    });

    // Route with conditional logic
    app.get('/test/conditional', (req, res) => {
      const result = ifFeatureEnabled(
        req,
        FeatureFlag.NEW_DASHBOARD,
        () => ({ version: 'new', features: ['analytics', 'charts'] }),
        () => ({ version: 'old', features: ['basic'] })
      );
      res.json(result);
    });

    // Add error handler
    app.use(featureFlagErrorHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Feature Flag Middleware', () => {
    it('should add feature flag methods to request object', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(true);

      const response = await request(app)
        .get('/test/basic')
        .expect(200);

      expect(response.body).toHaveProperty('featureEnabled', true);
      expect(response.body).toHaveProperty('context');
      expect(response.body.context).toHaveProperty('environment');
      expect(response.body.context).toHaveProperty('metadata');
      expect(mockFeatureFlagManager.isEnabled).toHaveBeenCalledWith(
        FeatureFlag.NEW_DASHBOARD,
        expect.objectContaining({
          environment: expect.any(String),
          metadata: expect.objectContaining({
            path: '/test/basic',
            method: 'GET'
          })
        })
      );
    });

    it('should handle environment headers', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(false);

      await request(app)
        .get('/test/basic')
        .set('x-environment', 'staging')
        .expect(200);

      expect(mockFeatureFlagManager.isEnabled).toHaveBeenCalledWith(
        FeatureFlag.NEW_DASHBOARD,
        expect.objectContaining({
          environment: 'staging'
        })
      );
    });

    it('should handle feature flag evaluation errors gracefully', async () => {
      mockFeatureFlagManager.isEnabled.mockImplementation(() => {
        throw new Error('Feature flag evaluation failed');
      });

      const response = await request(app)
        .get('/test/basic')
        .expect(200);

      expect(response.body.featureEnabled).toBe(false);
    });

    it('should handle multiple feature flags', async () => {
      mockFeatureFlagManager.getMultiple.mockReturnValue({
        [FeatureFlag.NEW_DASHBOARD]: true,
        [FeatureFlag.ENHANCED_SEARCH]: false
      });

      const response = await request(app)
        .get('/test/multiple')
        .expect(200);

      expect(response.body.flags).toEqual({
        [FeatureFlag.NEW_DASHBOARD]: true,
        [FeatureFlag.ENHANCED_SEARCH]: false
      });
    });

    it('should handle all feature flags', async () => {
      const mockFlags = {
        [FeatureFlag.NEW_DASHBOARD]: true,
        [FeatureFlag.ENHANCED_SEARCH]: false,
        [FeatureFlag.PERFORMANCE_CACHING]: true
      };
      mockFeatureFlagManager.getAll.mockReturnValue(mockFlags);

      const response = await request(app)
        .get('/test/all')
        .expect(200);

      expect(response.body.allFlags).toEqual(mockFlags);
    });
  });

  describe('requireFeature Middleware', () => {
    it('should allow access when feature is enabled', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(true);

      const response = await request(app)
        .get('/test/protected')
        .expect(200);

      expect(response.body.message).toBe('Access granted to protected feature');
    });

    it('should return 404 when feature is disabled', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(false);

      const response = await request(app)
        .get('/test/protected')
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });

    it('should handle feature flag evaluation errors', async () => {
      mockFeatureFlagManager.isEnabled.mockImplementation(() => {
        throw new Error('Evaluation error');
      });

      await request(app)
        .get('/test/protected')
        .expect(500);
    });
  });

  describe('ifFeatureEnabled Utility', () => {
    it('should execute enabled callback when feature is enabled', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(true);

      const response = await request(app)
        .get('/test/conditional')
        .expect(200);

      expect(response.body).toEqual({
        version: 'new',
        features: ['analytics', 'charts']
      });
    });

    it('should execute disabled callback when feature is disabled', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(false);

      const response = await request(app)
        .get('/test/conditional')
        .expect(200);

      expect(response.body).toEqual({
        version: 'old',
        features: ['basic']
      });
    });
  });

  describe('Feature Flag API Routes', () => {
    it('should get all feature flags', async () => {
      const mockFlags = {
        [FeatureFlag.NEW_DASHBOARD]: true,
        [FeatureFlag.ENHANCED_SEARCH]: false
      };
      mockFeatureFlagManager.getAll.mockReturnValue(mockFlags);

      const response = await request(app)
        .get('/api/feature-flags')
        .expect(200);

      expect(response.body.flags).toEqual(mockFlags);
    });

    it('should get specific feature flag', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(true);

      const response = await request(app)
        .get(`/api/feature-flags/${FeatureFlag.NEW_DASHBOARD}`)
        .expect(200);

      expect(response.body.enabled).toBe(true);
    });

    it('should handle invalid feature flag names', async () => {
      await request(app)
        .get('/api/feature-flags/INVALID_FLAG')
        .expect(400);
    });

    it('should clear cache', async () => {
      mockFeatureFlagManager.clearCache.mockReturnValue(undefined);

      await request(app)
        .post('/api/feature-flags/cache/clear')
        .expect(200);

      expect(mockFeatureFlagManager.clearCache).toHaveBeenCalled();
    });

    it('should get cache statistics', async () => {
      const mockStats = { size: 5, keys: ['key1', 'key2'] };
      mockFeatureFlagManager.getCacheStats.mockReturnValue(mockStats);

      const response = await request(app)
        .get('/api/feature-flags/cache/stats')
        .expect(200);

      expect(response.body).toEqual(mockStats);
    });
  });

  describe('Context Extraction', () => {
    it('should extract user context from authenticated requests', async () => {
      // Mock authenticated user middleware
      app.use((req, res, next) => {
        (req as any).user = {
          id: 'user123',
          role: 'Admin',
          clientId: 'client456'
        };
        next();
      });

      mockFeatureFlagManager.isEnabled.mockReturnValue(true);

      await request(app)
        .get('/test/basic')
        .expect(200);

      expect(mockFeatureFlagManager.isEnabled).toHaveBeenCalledWith(
        FeatureFlag.NEW_DASHBOARD,
        expect.objectContaining({
          userId: 'user123',
          userRole: 'Admin',
          clientId: 'client456'
        })
      );
    });

    it('should handle client ID from headers', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(true);

      await request(app)
        .get('/test/basic')
        .set('x-client-id', 'header-client-123')
        .expect(200);

      expect(mockFeatureFlagManager.isEnabled).toHaveBeenCalledWith(
        FeatureFlag.NEW_DASHBOARD,
        expect.objectContaining({
          clientId: 'header-client-123'
        })
      );
    });

    it('should include request metadata in context', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(true);

      await request(app)
        .get('/test/basic')
        .set('User-Agent', 'Test Agent')
        .expect(200);

      expect(mockFeatureFlagManager.isEnabled).toHaveBeenCalledWith(
        FeatureFlag.NEW_DASHBOARD,
        expect.objectContaining({
          metadata: expect.objectContaining({
            path: '/test/basic',
            method: 'GET',
            userAgent: 'Test Agent'
          })
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle middleware initialization errors', async () => {
      // Mock getFeatureFlagManager to throw
      vi.doMock('../../shared/feature-flag-manager', () => ({
        getFeatureFlagManager: vi.fn(() => {
          throw new Error('Manager initialization failed');
        })
      }));

      const response = await request(app)
        .get('/test/basic')
        .expect(200);

      // Should fallback gracefully
      expect(response.body.featureEnabled).toBe(false);
    });

    it('should handle missing middleware on protected routes', async () => {
      // Create app without middleware
      const appWithoutMiddleware = express();
      appWithoutMiddleware.get('/test/protected', requireFeature(FeatureFlag.DOCUMENT_SIGNING), (req, res) => {
        res.json({ message: 'Should not reach here' });
      });

      await request(appWithoutMiddleware)
        .get('/test/protected')
        .expect(500);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      mockFeatureFlagManager.isEnabled.mockReturnValue(true);

      const requests = Array.from({ length: 10 }, () =>
        request(app).get('/test/basic').expect(200)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.body.featureEnabled).toBe(true);
      });

      // Should be called for each request
      expect(mockFeatureFlagManager.isEnabled).toHaveBeenCalledTimes(10);
    });
  });
});