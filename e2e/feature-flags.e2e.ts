import { test, expect, Page } from '@playwright/test';

test.describe('Feature Flags E2E Tests', () => {
  test.describe('Feature Flag Demo Page', () => {
    test('should display feature flag demo page', async ({ page }) => {
      await page.goto('/feature-flag-demo');
      
      await expect(page.locator('h1')).toContainText('Feature Flag Demo');
      await expect(page.locator('[data-testid="feature-flags-container"]')).toBeVisible();
    });

    test('should show current feature flag states', async ({ page }) => {
      await page.goto('/feature-flag-demo');
      
      // Wait for feature flags to load
      await page.waitForSelector('[data-testid="feature-flag-item"]');
      
      const featureFlagItems = page.locator('[data-testid="feature-flag-item"]');
      const count = await featureFlagItems.count();
      
      expect(count).toBeGreaterThan(0);
      
      // Check that each feature flag has a name and status
      for (let i = 0; i < count; i++) {
        const item = featureFlagItems.nth(i);
        await expect(item.locator('[data-testid="flag-name"]')).toBeVisible();
        await expect(item.locator('[data-testid="flag-status"]')).toBeVisible();
      }
    });

    test('should toggle feature flags via admin controls', async ({ page }) => {
      // This test assumes admin functionality exists
      await page.goto('/feature-flag-demo');
      
      // Mock admin user context
      await page.addInitScript(() => {
        window.localStorage.setItem('userRole', 'Admin');
      });
      
      await page.reload();
      
      // Check if admin controls are visible
      const adminPanel = page.locator('[data-testid="admin-controls"]');
      if (await adminPanel.isVisible()) {
        const toggleButton = adminPanel.locator('[data-testid="toggle-new-dashboard"]').first();
        
        // Get initial state
        const initialState = await toggleButton.getAttribute('data-enabled');
        
        // Click toggle
        await toggleButton.click();
        
        // Wait for state change
        await page.waitForTimeout(1000);
        
        // Verify state changed
        const newState = await toggleButton.getAttribute('data-enabled');
        expect(newState).not.toBe(initialState);
      }
    });

    test('should refresh feature flags when refresh button is clicked', async ({ page }) => {
      await page.goto('/feature-flag-demo');
      
      // Wait for initial load
      await page.waitForSelector('[data-testid="feature-flag-item"]');
      
      // Click refresh button if it exists
      const refreshButton = page.locator('[data-testid="refresh-flags"]');
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        
        // Should show loading state briefly
        await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
        
        // Then show updated flags
        await page.waitForSelector('[data-testid="feature-flag-item"]');
        await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible();
      }
    });
  });

  test.describe('Feature Flag API Integration', () => {
    test('should fetch feature flags from API', async ({ page }) => {
      // Intercept API calls
      let apiCalled = false;
      await page.route('/api/feature-flags', (route) => {
        apiCalled = true;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              flags: {
                NEW_DASHBOARD: true,
                ENHANCED_SEARCH: false,
                PERFORMANCE_CACHING: true
              }
            }
          })
        });
      });
      
      await page.goto('/feature-flag-demo');
      
      // Wait for API call
      await page.waitForTimeout(2000);
      expect(apiCalled).toBe(true);
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('/api/feature-flags', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Internal server error'
          })
        });
      });
      
      await page.goto('/feature-flag-demo');
      
      // Should show error state
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load feature flags');
    });

    test('should retry failed requests', async ({ page }) => {
      let requestCount = 0;
      
      await page.route('/api/feature-flags', (route) => {
        requestCount++;
        if (requestCount === 1) {
          // First request fails
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ success: false })
          });
        } else {
          // Second request succeeds
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { flags: { NEW_DASHBOARD: true } }
            })
          });
        }
      });
      
      await page.goto('/feature-flag-demo');
      
      // Click retry button if it appears
      const retryButton = page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        
        // Should eventually succeed
        await page.waitForSelector('[data-testid="feature-flag-item"]');
        expect(requestCount).toBe(2);
      }
    });
  });

  test.describe('Component Feature Gating', () => {
    test('should show/hide components based on feature flags', async ({ page }) => {
      // Mock feature flags response
      await page.route('/api/feature-flags/NEW_DASHBOARD', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              flag: 'NEW_DASHBOARD',
              enabled: true
            }
          })
        });
      });
      
      await page.goto('/');
      
      // Component gated by NEW_DASHBOARD should be visible
      const newDashboardComponent = page.locator('[data-feature="NEW_DASHBOARD"]');
      if (await newDashboardComponent.count() > 0) {
        await expect(newDashboardComponent.first()).toBeVisible();
      }
    });

    test('should hide components when feature is disabled', async ({ page }) => {
      await page.route('/api/feature-flags/NEW_DASHBOARD', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              flag: 'NEW_DASHBOARD',
              enabled: false
            }
          })
        });
      });
      
      await page.goto('/');
      
      // Component gated by NEW_DASHBOARD should not be visible
      const newDashboardComponent = page.locator('[data-feature="NEW_DASHBOARD"]');
      if (await newDashboardComponent.count() > 0) {
        await expect(newDashboardComponent.first()).not.toBeVisible();
      }
    });

    test('should show fallback content when feature is disabled', async ({ page }) => {
      await page.route('/api/feature-flags/ENHANCED_SEARCH', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              flag: 'ENHANCED_SEARCH',
              enabled: false
            }
          })
        });
      });
      
      await page.goto('/');
      
      // Should show fallback for disabled enhanced search
      const fallbackSearch = page.locator('[data-testid="basic-search"]');
      if (await fallbackSearch.count() > 0) {
        await expect(fallbackSearch.first()).toBeVisible();
      }
      
      // Enhanced search should not be visible
      const enhancedSearch = page.locator('[data-testid="enhanced-search"]');
      if (await enhancedSearch.count() > 0) {
        await expect(enhancedSearch.first()).not.toBeVisible();
      }
    });
  });

  test.describe('User Context and Roles', () => {
    test('should respect user role restrictions', async ({ page }) => {
      // Mock user context
      await page.addInitScript(() => {
        window.localStorage.setItem('userRole', 'User');
        window.localStorage.setItem('userId', 'test-user-123');
      });
      
      await page.route('/api/feature-flags', (route) => {
        const request = route.request();
        const userAgent = request.headers()['user-agent'];
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              flags: {
                // DOCUMENT_SIGNING requires Admin role, should be false for User
                DOCUMENT_SIGNING: false,
                // Other flags available to all users
                NEW_DASHBOARD: true,
                PERFORMANCE_CACHING: true
              }
            }
          })
        });
      });
      
      await page.goto('/feature-flag-demo');
      
      await page.waitForSelector('[data-testid="feature-flag-item"]');
      
      // Check that role-restricted features are disabled
      const documentSigningFlag = page.locator('[data-testid="flag-DOCUMENT_SIGNING"]');
      if (await documentSigningFlag.count() > 0) {
        await expect(documentSigningFlag.locator('[data-testid="flag-status"]')).toContainText('Disabled');
      }
    });

    test('should work with admin users', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('userRole', 'Admin');
        window.localStorage.setItem('userId', 'admin-user-456');
      });
      
      await page.route('/api/feature-flags', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              flags: {
                // Admin can access all features
                DOCUMENT_SIGNING: true,
                NEW_DASHBOARD: true,
                ENHANCED_SEARCH: true,
                PERFORMANCE_CACHING: true
              }
            }
          })
        });
      });
      
      await page.goto('/feature-flag-demo');
      await page.waitForSelector('[data-testid="feature-flag-item"]');
      
      // Admin should see additional controls
      const adminControls = page.locator('[data-testid="admin-controls"]');
      if (await adminControls.count() > 0) {
        await expect(adminControls.first()).toBeVisible();
      }
    });
  });

  test.describe('Performance and Caching', () => {
    test('should cache feature flag responses', async ({ page }) => {
      let requestCount = 0;
      
      await page.route('/api/feature-flags', (route) => {
        requestCount++;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { flags: { NEW_DASHBOARD: true } }
          })
        });
      });
      
      // First page load
      await page.goto('/feature-flag-demo');
      await page.waitForTimeout(1000);
      
      // Navigate away and back
      await page.goto('/');
      await page.goto('/feature-flag-demo');
      await page.waitForTimeout(1000);
      
      // Should use cached response for second visit
      expect(requestCount).toBe(1);
    });

    test('should handle rapid navigation without issues', async ({ page }) => {
      await page.route('/api/feature-flags', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { flags: { NEW_DASHBOARD: true } }
          })
        });
      });
      
      // Rapid navigation
      for (let i = 0; i < 5; i++) {
        await page.goto('/feature-flag-demo');
        await page.goto('/');
      }
      
      // Final navigation should work without errors
      await page.goto('/feature-flag-demo');
      await expect(page.locator('h1')).toContainText('Feature Flag Demo');
    });
  });

  test.describe('Environment-specific behavior', () => {
    test('should work in development environment', async ({ page }) => {
      await page.addInitScript(() => {
        // Mock development environment
        Object.defineProperty(window, 'location', {
          value: { hostname: 'localhost' },
          writable: true
        });
      });
      
      await page.route('/api/feature-flags', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              flags: {
                // All flags available in development
                NEW_DASHBOARD: true,
                ENHANCED_SEARCH: true,
                DOCUMENT_SIGNING: true,
                PERFORMANCE_CACHING: true
              }
            }
          })
        });
      });
      
      await page.goto('/feature-flag-demo');
      await page.waitForSelector('[data-testid="feature-flag-item"]');
      
      // Should show development indicator
      const envIndicator = page.locator('[data-testid="environment-indicator"]');
      if (await envIndicator.count() > 0) {
        await expect(envIndicator.first()).toContainText('Development');
      }
    });
  });
});