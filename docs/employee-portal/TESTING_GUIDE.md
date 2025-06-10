# Employee Portal Testing Guide

## Overview

This guide provides comprehensive testing procedures for the Employee Portal, covering unit tests, integration tests, end-to-end tests, and manual testing procedures.

## Test Environment Setup

### Prerequisites

1. **Local Development Environment**
   ```bash
   # Install dependencies
   npm install
   
   # Copy test environment file
   cp .env.test.example .env.test
   ```

2. **Test Database**
   ```bash
   # Create test database
   createdb tsg_test
   
   # Run migrations
   DATABASE_URL=postgresql://user:pass@localhost/tsg_test npm run db:push
   
   # Seed test data
   npm run seed:test
   ```

3. **Mock Services**
   - HubSpot API Mock
   - DocuSign API Mock
   - Supabase Storage Mock

## Unit Testing

### Backend Unit Tests

#### Service Tests

**HubSpot Service Tests**
```typescript
// server/services/employee-portal/__tests__/hubspot.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HubSpotService } from '../hubspot.service';

describe('HubSpotService', () => {
  let service: HubSpotService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    service = new HubSpotService();
  });
  
  describe('syncQuoteInquiryToDeal', () => {
    it('should create a new deal in HubSpot', async () => {
      // Arrange
      const mockDealResponse = { id: '12345', properties: {} };
      vi.spyOn(service['client'].crm.deals.basicApi, 'create')
        .mockResolvedValue(mockDealResponse);
      
      // Act
      const result = await service.syncQuoteInquiryToDeal(1);
      
      // Assert
      expect(result).toEqual(mockDealResponse);
      expect(service['client'].crm.deals.basicApi.create).toHaveBeenCalledWith({
        properties: expect.objectContaining({
          dealname: expect.stringContaining('Quote Request'),
          pipeline: 'default',
          dealstage: 'appointmentscheduled'
        })
      });
    });
    
    it('should handle API errors gracefully', async () => {
      // Arrange
      vi.spyOn(service['client'].crm.deals.basicApi, 'create')
        .mockRejectedValue(new Error('API Error'));
      
      // Act & Assert
      await expect(service.syncQuoteInquiryToDeal(1))
        .rejects.toThrow('API Error');
    });
  });
});
```

**DocuSign Service Tests**
```typescript
// server/services/employee-portal/__tests__/docusign.service.test.ts
describe('DocuSignService', () => {
  describe('downloadAndStoreEnvelope', () => {
    it('should download and store contract in Supabase', async () => {
      // Test implementation
    });
    
    it('should handle webhook events correctly', async () => {
      // Test implementation
    });
  });
});
```

#### Route Handler Tests

```typescript
// server/routes/__tests__/employee-portal.routes.test.ts
import request from 'supertest';
import { app } from '../../app';

describe('Employee Portal Routes', () => {
  describe('GET /api/employee/quote-inquiries', () => {
    it('should return quote inquiries for authenticated user', async () => {
      const response = await request(app)
        .get('/api/employee/quote-inquiries')
        .set('Cookie', 'session=valid-session-cookie')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('inquiry');
      expect(response.body[0]).toHaveProperty('quoteRequest');
    });
    
    it('should filter by status parameter', async () => {
      const response = await request(app)
        .get('/api/employee/quote-inquiries?status=new')
        .set('Cookie', 'session=valid-session-cookie')
        .expect(200);
      
      response.body.forEach(item => {
        expect(item.inquiry.status).toBe('new');
      });
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      await request(app)
        .get('/api/employee/quote-inquiries')
        .expect(401);
    });
  });
});
```

### Frontend Unit Tests

#### Component Tests

```typescript
// client/src/components/employee-portal/__tests__/QuoteInquiries.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuoteInquiries } from '../QuoteInquiries';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false }
  }
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('QuoteInquiries Component', () => {
  it('should display loading state initially', () => {
    render(<QuoteInquiries />, { wrapper });
    expect(screen.getByText('Loading inquiries...')).toBeInTheDocument();
  });
  
  it('should display quote inquiries after loading', async () => {
    // Mock API response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          inquiry: { id: 1, status: 'new' },
          quoteRequest: { companyName: 'Test Company' }
        }
      ]
    });
    
    render(<QuoteInquiries />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });
  });
  
  it('should filter inquiries by status', async () => {
    render(<QuoteInquiries />, { wrapper });
    
    const statusFilter = screen.getByLabelText('Status');
    fireEvent.change(statusFilter, { target: { value: 'contacted' } });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=contacted')
      );
    });
  });
});
```

#### Hook Tests

```typescript
// client/src/hooks/__tests__/usePermissions.test.ts
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';

describe('usePermissions Hook', () => {
  it('should return correct permissions for admin role', () => {
    const { result } = renderHook(() => 
      usePermissions({ role: 'admin' })
    );
    
    expect(result.current.canViewAllInquiries).toBe(true);
    expect(result.current.canApproveOrders).toBe(true);
    expect(result.current.canManageUsers).toBe(true);
  });
  
  it('should return limited permissions for employee role', () => {
    const { result } = renderHook(() => 
      usePermissions({ role: 'employee' })
    );
    
    expect(result.current.canViewAllInquiries).toBe(false);
    expect(result.current.canApproveOrders).toBe(false);
    expect(result.current.canEditAssignedInquiries).toBe(true);
  });
});
```

## Integration Testing

### API Integration Tests

```typescript
// tests/integration/quote-inquiry-flow.test.ts
describe('Quote Inquiry Flow', () => {
  it('should create inquiry and sync with HubSpot', async () => {
    // 1. Create quote request
    const quoteRequest = await createQuoteRequest({
      companyName: 'Test Company',
      services: ['warehousing']
    });
    
    // 2. Create inquiry from request
    const inquiry = await createQuoteInquiry({
      quoteRequestId: quoteRequest.id,
      priority: 'high'
    });
    
    // 3. Verify HubSpot sync
    const hubspotDeal = await getHubSpotDeal(inquiry.hubspotDealId);
    expect(hubspotDeal).toBeDefined();
    expect(hubspotDeal.properties.dealname).toContain('Test Company');
    
    // 4. Assign to sales member
    await assignInquiry(inquiry.id, salesMember.id);
    
    // 5. Verify assignment
    const updated = await getInquiry(inquiry.id);
    expect(updated.assignedTo).toBe(salesMember.id);
    expect(updated.status).toBe('contacted');
  });
});
```

### Database Integration Tests

```typescript
// tests/integration/database.test.ts
describe('Database Operations', () => {
  it('should maintain referential integrity', async () => {
    // Create related entities
    const vendor = await createVendor({ name: 'Test Vendor' });
    const material = await createMaterial({ sku: 'TEST-001' });
    const price = await createMaterialPrice({
      materialId: material.id,
      vendorId: vendor.id,
      price: '10.00'
    });
    
    // Delete vendor
    await deleteVendor(vendor.id);
    
    // Verify cascade behavior
    const prices = await getMaterialPrices(material.id);
    expect(prices).toHaveLength(0);
  });
  
  it('should enforce unique constraints', async () => {
    await createMaterial({ sku: 'UNIQUE-001' });
    
    await expect(
      createMaterial({ sku: 'UNIQUE-001' })
    ).rejects.toThrow('duplicate key value');
  });
});
```

## End-to-End Testing

### Playwright Test Suite

```typescript
// e2e/employee-portal.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Employee Portal E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#email', 'test@tsgfulfillment.com');
    await page.fill('#password', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/employee');
  });
  
  test('complete quote inquiry workflow', async ({ page }) => {
    // Navigate to inquiries
    await page.click('text=Quote Inquiries');
    await expect(page).toHaveURL('/employee/inquiries');
    
    // View inquiry details
    await page.click('tr:first-child button[aria-label="View"]');
    await expect(page.locator('.modal')).toBeVisible();
    
    // Assign inquiry
    await page.click('button:has-text("Assign")');
    await page.selectOption('#sales-member', 'John Smith');
    await expect(page.locator('.toast')).toHaveText('Inquiry assigned successfully');
    
    // Update status
    await page.selectOption('#status', 'contacted');
    await page.click('button:has-text("Save")');
    await expect(page.locator('.toast')).toHaveText('Inquiry updated successfully');
  });
  
  test('material inventory management', async ({ page }) => {
    // Navigate to materials
    await page.click('text=Materials');
    
    // Check low stock indicator
    const lowStockItems = page.locator('.low-stock-indicator');
    await expect(lowStockItems).toHaveCount(3);
    
    // Record usage
    await page.click('tr:first-child button:has-text("Use")');
    await page.fill('#quantity', '10');
    await page.fill('#usage-notes', 'Used for order #12345');
    await page.click('button:has-text("Record Usage")');
    
    // Verify inventory updated
    await expect(page.locator('tr:first-child .quantity')).toHaveText('65');
  });
  
  test('create purchase order', async ({ page }) => {
    // Navigate to purchase orders
    await page.click('text=Purchase Orders');
    await page.click('button:has-text("New Order")');
    
    // Fill order details
    await page.selectOption('#vendor', 'ABC Packaging');
    await page.fill('#expected-date', '2024-02-01');
    
    // Add items
    await page.click('button:has-text("Add Item")');
    await page.selectOption('#material-1', 'Packaging Tape');
    await page.fill('#quantity-1', '100');
    await page.fill('#unit-price-1', '5.00');
    
    // Submit order
    await page.click('button:has-text("Create Order")');
    await expect(page).toHaveURL(/\/employee\/purchase-orders\/PO-/);
  });
});
```

### Visual Regression Tests

```typescript
// e2e/visual-regression.spec.ts
test.describe('Visual Regression', () => {
  test('dashboard layout', async ({ page }) => {
    await page.goto('/employee');
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('quote inquiries table', async ({ page }) => {
    await page.goto('/employee/inquiries');
    await page.waitForSelector('table');
    await expect(page.locator('table')).toHaveScreenshot('inquiries-table.png');
  });
});
```

## Manual Testing Procedures

### Test Scenarios

#### 1. Quote Inquiry Management

**Test Case: QI-001 - Create and Assign Inquiry**
- **Preconditions**: Logged in as manager
- **Steps**:
  1. Navigate to Quote Inquiries
  2. Click "Create Inquiry"
  3. Select existing quote request
  4. Set priority to "High"
  5. Add notes
  6. Click "Create"
  7. Assign to sales team member
- **Expected Results**:
  - Inquiry created successfully
  - HubSpot deal created
  - Assignment email sent
  - Status updated to "contacted"

#### 2. Contract Management

**Test Case: CM-001 - DocuSign Integration**
- **Preconditions**: DocuSign webhook configured
- **Steps**:
  1. Send contract via DocuSign
  2. Sign contract as recipient
  3. Wait for webhook
  4. Navigate to Contracts
  5. Search for contract
- **Expected Results**:
  - Contract appears in list
  - PDF accessible via Supabase
  - Metadata correctly populated

#### 3. Inventory Management

**Test Case: IM-001 - Low Stock Alert**
- **Preconditions**: Material below reorder point
- **Steps**:
  1. Navigate to Materials
  2. View low stock items
  3. Click "Create PO" for item
  4. Verify pre-filled data
- **Expected Results**:
  - Low stock badge visible
  - Reorder quantity pre-filled
  - Vendor suggestions shown

### Cross-Browser Testing

Test on the following browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Key areas to test:
- Layout responsiveness
- JavaScript functionality
- File upload/download
- Session management

### Performance Testing

#### Load Testing Script

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function() {
  // Login
  let loginRes = http.post('https://test.tsgfulfillment.com/api/auth/login', {
    email: 'test@example.com',
    password: 'password'
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
  
  let cookies = loginRes.cookies;
  
  // Get quote inquiries
  let inquiriesRes = http.get('https://test.tsgfulfillment.com/api/employee/quote-inquiries', {
    cookies: cookies
  });
  
  check(inquiriesRes, {
    'inquiries loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

## Test Data Management

### Test Data Setup

```sql
-- tests/fixtures/test-data.sql

-- Create test users
INSERT INTO users (email, password_hash, role) VALUES
  ('admin@test.com', '$2b$12$...', 'admin'),
  ('manager@test.com', '$2b$12$...', 'manager'),
  ('employee@test.com', '$2b$12$...', 'employee');

-- Create test sales team
INSERT INTO sales_team_members (full_name, email, hubspot_owner_id) VALUES
  ('Test Admin', 'admin@test.com', 'test-001'),
  ('Test Manager', 'manager@test.com', 'test-002'),
  ('Test Employee', 'employee@test.com', 'test-003');

-- Create test materials
INSERT INTO materials (sku, name, category, reorder_point, reorder_quantity) VALUES
  ('TEST-TAPE-001', 'Test Tape', 'Packaging', 10, 50),
  ('TEST-BOX-001', 'Test Box', 'Boxes', 20, 100);

-- Create test inventory
INSERT INTO material_inventory (material_id, current_quantity, location) 
SELECT id, 5, 'Test Location' FROM materials WHERE sku = 'TEST-TAPE-001';
```

### Test Data Cleanup

```typescript
// tests/helpers/cleanup.ts
export async function cleanupTestData() {
  await db.delete(purchaseOrderItems).where(/* test data condition */);
  await db.delete(purchaseOrders).where(/* test data condition */);
  await db.delete(materialUsage).where(/* test data condition */);
  await db.delete(materialInventory).where(/* test data condition */);
  // ... continue for all tables
}
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost/test
      
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Reporting

### Coverage Requirements

- Overall: 80%
- Critical paths: 95%
- New code: 90%

### Test Reports

Generate reports using:
```bash
# Unit test coverage
npm run test:unit -- --coverage

# E2E test report
npm run test:e2e -- --reporter=html

# Performance test report
k6 run --out json=results.json tests/performance/load-test.js
```

## Troubleshooting Tests

### Common Issues

1. **Flaky Tests**
   - Add explicit waits
   - Mock external dependencies
   - Use stable test data

2. **Database State**
   - Reset between tests
   - Use transactions
   - Isolate test data

3. **API Mocking**
   - Use MSW for consistent mocks
   - Record and replay real responses
   - Version mock data

### Debug Mode

```bash
# Run tests in debug mode
DEBUG=true npm run test

# Playwright debug mode
PWDEBUG=1 npm run test:e2e

# Node inspect
node --inspect-brk node_modules/.bin/vitest
```