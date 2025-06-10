import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMPLOYEE_LOGIN_URL = `${BASE_URL}/employee/login`;
const EMPLOYEE_DASHBOARD_URL = `${BASE_URL}/employee`;

// Test credentials
const TEST_EMPLOYEE = {
  username: 'test_employee',
  password: 'test_password123',
  firstName: 'Test',
  lastName: 'Employee',
  department: 'Sales',
  position: 'Sales Representative'
};

// Helper functions
async function loginAsEmployee(page: Page) {
  await page.goto(EMPLOYEE_LOGIN_URL);
  await page.fill('[data-testid="username-input"]', TEST_EMPLOYEE.username);
  await page.fill('[data-testid="password-input"]', TEST_EMPLOYEE.password);
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login and redirect
  await page.waitForURL(EMPLOYEE_DASHBOARD_URL);
}

async function createMockQuoteRequest(page: Page) {
  // Navigate to quote requests page and create a mock request
  await page.goto(`${BASE_URL}/employee/quote-requests`);
  
  // This would normally be created via the main website contact form
  // For testing, we'll assume it exists or create via API
  return {
    id: 1,
    name: 'John Test Client',
    email: 'john@testclient.com',
    company: 'Test Client Corp',
    status: 'new',
    urgency: 'high'
  };
}

test.describe('Employee Portal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any necessary test data
    await page.goto(BASE_URL);
  });

  test.describe('Authentication Flow', () => {
    test('should allow employee to login and access dashboard', async ({ page }) => {
      await page.goto(EMPLOYEE_LOGIN_URL);

      // Verify login page elements
      await expect(page.locator('[data-testid="employee-portal-title"]')).toContainText('Employee Portal');
      await expect(page.locator('[data-testid="username-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

      // Perform login
      await loginAsEmployee(page);

      // Verify successful login and dashboard access
      await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('Dashboard');
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText(`Welcome back, ${TEST_EMPLOYEE.firstName}`);
    });

    test('should display error message for invalid credentials', async ({ page }) => {
      await page.goto(EMPLOYEE_LOGIN_URL);
      
      await page.fill('[data-testid="username-input"]', 'invalid_user');
      await page.fill('[data-testid="password-input"]', 'wrong_password');
      await page.click('[data-testid="login-button"]');

      // Verify error message appears
      await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-toast"]')).toContainText('Invalid credentials');

      // Verify user remains on login page
      await expect(page.url()).toBe(EMPLOYEE_LOGIN_URL);
    });

    test('should redirect authenticated user away from login page', async ({ page }) => {
      // Login first
      await loginAsEmployee(page);

      // Try to access login page again
      await page.goto(EMPLOYEE_LOGIN_URL);

      // Should be redirected to dashboard
      await expect(page.url()).toBe(EMPLOYEE_DASHBOARD_URL);
    });

    test('should logout successfully', async ({ page }) => {
      await loginAsEmployee(page);

      // Click logout button
      await page.click('[data-testid="logout-button"]');

      // Verify redirect to login page
      await page.waitForURL(EMPLOYEE_LOGIN_URL);
      await expect(page.locator('[data-testid="employee-portal-title"]')).toBeVisible();
    });
  });

  test.describe('Dashboard Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEmployee(page);
    });

    test('should display dashboard metrics', async ({ page }) => {
      await page.goto(EMPLOYEE_DASHBOARD_URL);

      // Verify metric cards are visible
      await expect(page.locator('[data-testid="assigned-quotes-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-contracts-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-requests-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="low-stock-metric"]')).toBeVisible();

      // Verify metric values are displayed
      await expect(page.locator('[data-testid="assigned-quotes-value"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-contracts-value"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-requests-value"]')).toBeVisible();
      await expect(page.locator('[data-testid="low-stock-value"]')).toBeVisible();
    });

    test('should display recent activity', async ({ page }) => {
      await page.goto(EMPLOYEE_DASHBOARD_URL);

      // Verify recent activity section
      await expect(page.locator('[data-testid="recent-activity-title"]')).toContainText('Recent Activity');
      await expect(page.locator('[data-testid="recent-activity-list"]')).toBeVisible();
    });

    test('should navigate to different sections from dashboard', async ({ page }) => {
      await page.goto(EMPLOYEE_DASHBOARD_URL);

      // Test navigation to quote requests
      await page.click('[data-testid="nav-quote-requests"]');
      await expect(page.url()).toContain('/employee/quote-requests');

      // Test navigation back to dashboard
      await page.click('[data-testid="nav-dashboard"]');
      await expect(page.url()).toBe(EMPLOYEE_DASHBOARD_URL);

      // Test navigation to quotes
      await page.click('[data-testid="nav-quotes"]');
      await expect(page.url()).toContain('/employee/quotes');

      // Test navigation to materials
      await page.click('[data-testid="nav-materials"]');
      await expect(page.url()).toContain('/employee/materials');
    });
  });

  test.describe('Quote Request Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEmployee(page);
    });

    test('should display and filter quote requests', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/quote-requests`);

      // Verify page title and elements
      await expect(page.locator('[data-testid="quote-requests-title"]')).toContainText('Quote Requests');
      await expect(page.locator('[data-testid="quote-requests-table"]')).toBeVisible();

      // Test filtering by status
      await page.selectOption('[data-testid="status-filter"]', 'new');
      await page.waitForResponse(response => 
        response.url().includes('/api/employee/quote-requests') && response.status() === 200
      );

      // Test filtering by assignment
      await page.selectOption('[data-testid="assignment-filter"]', 'unassigned');
      await page.waitForResponse(response => 
        response.url().includes('/api/employee/quote-requests') && response.status() === 200
      );
    });

    test('should assign quote request to employee', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/quote-requests`);

      // Find first unassigned quote request
      const firstRow = page.locator('[data-testid="quote-request-row"]').first();
      await expect(firstRow).toBeVisible();

      // Click assign button
      await firstRow.locator('[data-testid="assign-button"]').click();

      // Select employee from dropdown
      await page.selectOption('[data-testid="employee-select"]', TEST_EMPLOYEE.username);
      await page.click('[data-testid="confirm-assign-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Quote request assigned successfully');

      // Verify status change in table
      await expect(firstRow.locator('[data-testid="status-badge"]')).toContainText('assigned');
    });

    test('should view quote request details', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/quote-requests`);

      // Click on first quote request to view details
      const firstRow = page.locator('[data-testid="quote-request-row"]').first();
      await firstRow.click();

      // Verify detail modal opens
      await expect(page.locator('[data-testid="quote-request-detail-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-email"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-company"]')).toBeVisible();
      await expect(page.locator('[data-testid="services-requested"]')).toBeVisible();

      // Close modal
      await page.click('[data-testid="close-modal-button"]');
      await expect(page.locator('[data-testid="quote-request-detail-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Quote Creation and Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEmployee(page);
    });

    test('should create new quote from quote request', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/quote-requests`);

      // Find assigned quote request and create quote
      const assignedRow = page.locator('[data-testid="quote-request-row"]')
        .filter({ has: page.locator('[data-testid="status-badge"]:has-text("assigned")') })
        .first();

      await assignedRow.locator('[data-testid="create-quote-button"]').click();

      // Verify quote creation form
      await expect(page.locator('[data-testid="quote-creation-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-info-section"]')).toBeVisible();

      // Fill out quote form
      await page.check('[data-testid="service-fulfillment"]');
      await page.check('[data-testid="service-warehousing"]');
      await page.fill('[data-testid="base-price"]', '1000');
      await page.fill('[data-testid="additional-services"]', '500');

      // Submit quote
      await page.click('[data-testid="create-quote-button"]');

      // Verify success message and redirect
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Quote created successfully');
      await page.waitForURL(url => url.includes('/employee/quotes'));
    });

    test('should update quote status and pricing', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/quotes`);

      // Find draft quote and edit it
      const draftQuote = page.locator('[data-testid="quote-row"]')
        .filter({ has: page.locator('[data-testid="status-badge"]:has-text("draft")') })
        .first();

      await draftQuote.locator('[data-testid="edit-quote-button"]').click();

      // Update pricing
      await page.fill('[data-testid="total-amount"]', '1800');
      await page.selectOption('[data-testid="quote-status"]', 'sent');

      // Save changes
      await page.click('[data-testid="save-quote-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Quote updated successfully');

      // Verify status change in table
      await expect(draftQuote.locator('[data-testid="status-badge"]')).toContainText('sent');
    });

    test('should send contract for signature', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/quotes`);

      // Find accepted quote
      const acceptedQuote = page.locator('[data-testid="quote-row"]')
        .filter({ has: page.locator('[data-testid="status-badge"]:has-text("accepted")') })
        .first();

      await acceptedQuote.locator('[data-testid="send-contract-button"]').click();

      // Verify contract form
      await expect(page.locator('[data-testid="contract-form"]')).toBeVisible();

      // Fill contract details
      await page.selectOption('[data-testid="contract-template"]', 'standard-fulfillment');
      await page.fill('[data-testid="signer-name"]', 'John Doe');
      await page.fill('[data-testid="signer-email"]', 'john@client.com');
      await page.fill('[data-testid="signer-company"]', 'Client Corp');

      // Send contract
      await page.click('[data-testid="send-contract-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Contract sent successfully');

      // Verify contract appears in contracts list
      await page.goto(`${BASE_URL}/employee/contracts`);
      await expect(page.locator('[data-testid="contract-row"]').first()).toBeVisible();
    });
  });

  test.describe('Material and Inventory Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEmployee(page);
    });

    test('should display materials inventory', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/materials`);

      // Verify page elements
      await expect(page.locator('[data-testid="materials-title"]')).toContainText('Materials Inventory');
      await expect(page.locator('[data-testid="materials-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-material-button"]')).toBeVisible();

      // Verify table headers
      await expect(page.locator('[data-testid="material-code-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="material-name-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-stock-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="reorder-level-header"]')).toBeVisible();
    });

    test('should add new material', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/materials`);

      // Click add material button
      await page.click('[data-testid="add-material-button"]');

      // Verify material form
      await expect(page.locator('[data-testid="material-form"]')).toBeVisible();

      // Fill material details
      await page.fill('[data-testid="material-name"]', 'Test Material');
      await page.fill('[data-testid="material-code"]', 'TM001');
      await page.fill('[data-testid="description"]', 'A test material for E2E testing');
      await page.selectOption('[data-testid="vendor-select"]', '1'); // Assuming vendor exists
      await page.fill('[data-testid="unit-price"]', '25.50');
      await page.selectOption('[data-testid="unit-of-measure"]', 'pieces');
      await page.fill('[data-testid="reorder-level"]', '100');
      await page.fill('[data-testid="reorder-quantity"]', '500');
      await page.fill('[data-testid="current-stock"]', '150');

      // Submit form
      await page.click('[data-testid="save-material-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Material created successfully');

      // Verify material appears in table
      await expect(page.locator('[data-testid="material-row"]')
        .filter({ has: page.locator('text=Test Material') })).toBeVisible();
    });

    test('should identify and display low stock items', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/materials`);

      // Filter for low stock items
      await page.check('[data-testid="low-stock-filter"]');

      // Verify low stock items are highlighted
      const lowStockRows = page.locator('[data-testid="low-stock-row"]');
      await expect(lowStockRows.first()).toBeVisible();

      // Verify reorder suggestion
      await expect(page.locator('[data-testid="reorder-suggestion"]').first()).toBeVisible();
    });

    test('should create purchase order for low stock items', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/materials`);

      // Find low stock item and create purchase order
      const lowStockRow = page.locator('[data-testid="low-stock-row"]').first();
      await lowStockRow.locator('[data-testid="create-po-button"]').click();

      // Verify purchase order form
      await expect(page.locator('[data-testid="purchase-order-form"]')).toBeVisible();

      // Form should be pre-filled with material details
      await expect(page.locator('[data-testid="selected-materials"]')).toBeVisible();

      // Fill additional details
      await page.fill('[data-testid="po-notes"]', 'Automated reorder for low stock items');

      // Submit purchase order
      await page.click('[data-testid="create-po-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('Purchase order created successfully');

      // Navigate to purchase orders to verify creation
      await page.goto(`${BASE_URL}/employee/purchase-orders`);
      await expect(page.locator('[data-testid="po-row"]').first()).toBeVisible();
    });
  });

  test.describe('Contract Management', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEmployee(page);
    });

    test('should display contracts with status filtering', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/contracts`);

      // Verify page elements
      await expect(page.locator('[data-testid="contracts-title"]')).toContainText('Contracts');
      await expect(page.locator('[data-testid="contracts-table"]')).toBeVisible();

      // Test status filtering
      await page.selectOption('[data-testid="contract-status-filter"]', 'sent');
      await page.waitForResponse(response => 
        response.url().includes('/api/employee/contracts') && response.status() === 200
      );

      // Verify filtered results
      const contractRows = page.locator('[data-testid="contract-row"]');
      const statusBadges = contractRows.locator('[data-testid="status-badge"]');
      await expect(statusBadges.first()).toContainText('sent');
    });

    test('should view contract details and download documents', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/contracts`);

      // Click on first contract
      const firstContract = page.locator('[data-testid="contract-row"]').first();
      await firstContract.click();

      // Verify contract detail modal
      await expect(page.locator('[data-testid="contract-detail-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="contract-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-information"]')).toBeVisible();
      await expect(page.locator('[data-testid="contract-value"]')).toBeVisible();

      // Test document download (if available)
      const downloadButton = page.locator('[data-testid="download-contract-button"]');
      if (await downloadButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await downloadButton.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.pdf');
      }

      // Close modal
      await page.click('[data-testid="close-modal-button"]');
      await expect(page.locator('[data-testid="contract-detail-modal"]')).not.toBeVisible();
    });
  });

  test.describe('Search and Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEmployee(page);
    });

    test('should search across different sections', async ({ page }) => {
      // Test search in quote requests
      await page.goto(`${BASE_URL}/employee/quote-requests`);
      await page.fill('[data-testid="search-input"]', 'John');
      await page.waitForResponse(response => 
        response.url().includes('/api/employee/quote-requests') && response.status() === 200
      );

      // Verify search results
      const searchResults = page.locator('[data-testid="quote-request-row"]');
      await expect(searchResults.first()).toContainText('John');

      // Test search in quotes
      await page.goto(`${BASE_URL}/employee/quotes`);
      await page.fill('[data-testid="search-input"]', 'QUO-');
      await page.waitForResponse(response => 
        response.url().includes('/api/employee/quotes') && response.status() === 200
      );

      // Verify quote search results
      const quoteResults = page.locator('[data-testid="quote-row"]');
      await expect(quoteResults.first()).toContainText('QUO-');
    });

    test('should handle empty search results gracefully', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/quote-requests`);
      
      // Search for something that doesn't exist
      await page.fill('[data-testid="search-input"]', 'NonExistentSearchTerm');
      await page.waitForResponse(response => 
        response.url().includes('/api/employee/quote-requests') && response.status() === 200
      );

      // Verify empty state message
      await expect(page.locator('[data-testid="empty-state-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="empty-state-message"]')).toContainText('No quote requests found');
    });
  });

  test.describe('Responsive Design and Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEmployee(page);
    });

    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(EMPLOYEE_DASHBOARD_URL);

      // Verify mobile navigation menu
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();

      // Test navigation on mobile
      await page.click('[data-testid="mobile-nav-quote-requests"]');
      await expect(page.url()).toContain('/employee/quote-requests');
    });

    test('should be keyboard accessible', async ({ page }) => {
      await page.goto(EMPLOYEE_LOGIN_URL);

      // Test keyboard navigation through login form
      await page.keyboard.press('Tab'); // Focus username input
      await page.keyboard.type(TEST_EMPLOYEE.username);
      
      await page.keyboard.press('Tab'); // Focus password input
      await page.keyboard.type(TEST_EMPLOYEE.password);
      
      await page.keyboard.press('Tab'); // Focus login button
      await page.keyboard.press('Enter'); // Submit form

      // Verify successful login
      await page.waitForURL(EMPLOYEE_DASHBOARD_URL);
      await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto(EMPLOYEE_DASHBOARD_URL);

      // Check for proper ARIA labels
      await expect(page.locator('[role="main"]')).toBeVisible();
      await expect(page.locator('[role="navigation"]')).toBeVisible();
      await expect(page.locator('[aria-label="Dashboard metrics"]')).toBeVisible();
      await expect(page.locator('[aria-label="Navigation menu"]')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEmployee(page);
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error by intercepting requests
      await page.route('**/api/employee/quote-requests', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' })
        });
      });

      await page.goto(`${BASE_URL}/employee/quote-requests`);

      // Verify error message is displayed
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load quote requests');
    });

    test('should handle network connectivity issues', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/quote-requests`);

      // Simulate network failure
      await page.context().setOffline(true);

      // Attempt to perform an action
      await page.click('[data-testid="refresh-button"]');

      // Verify offline message
      await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

      // Restore connectivity
      await page.context().setOffline(false);
      await page.click('[data-testid="refresh-button"]');

      // Verify data loads after reconnection
      await expect(page.locator('[data-testid="quote-requests-table"]')).toBeVisible();
    });

    test('should handle session expiration', async ({ page }) => {
      await page.goto(EMPLOYEE_DASHBOARD_URL);

      // Mock expired token response
      await page.route('**/api/employee/**', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Token expired' })
        });
      });

      // Attempt to navigate to a protected route
      await page.goto(`${BASE_URL}/employee/quote-requests`);

      // Verify redirect to login page
      await page.waitForURL(EMPLOYEE_LOGIN_URL);
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });
  });

  test.describe('Performance and Loading States', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsEmployee(page);
    });

    test('should display loading states during data fetching', async ({ page }) => {
      // Delay API responses to test loading states
      await page.route('**/api/employee/quote-requests', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        route.continue();
      });

      await page.goto(`${BASE_URL}/employee/quote-requests`);

      // Verify loading skeleton appears
      await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();

      // Wait for data to load
      await expect(page.locator('[data-testid="quote-requests-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="loading-skeleton"]')).not.toBeVisible();
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      await page.goto(`${BASE_URL}/employee/quote-requests`);

      // Test pagination with large dataset
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      await expect(page.locator('[data-testid="page-size-selector"]')).toBeVisible();

      // Change page size
      await page.selectOption('[data-testid="page-size-selector"]', '50');
      await page.waitForResponse(response => 
        response.url().includes('/api/employee/quote-requests') && response.status() === 200
      );

      // Verify table updates
      await expect(page.locator('[data-testid="quote-request-row"]')).toHaveCount(50);
    });
  });
});