import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for Employee Portal E2E tests...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Set up test data
    await setupTestData(page);
    
    // Create test user authentication state
    await createTestAuthState(page);
    
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any) {
  console.log('📊 Setting up test data...');
  
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  
  // Wait for server to be ready
  let retries = 0;
  const maxRetries = 10;
  
  while (retries < maxRetries) {
    try {
      await page.goto(`${baseURL}/health`);
      break;
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw new Error('Server is not ready after maximum retries');
      }
      console.log(`⏳ Waiting for server to be ready... (attempt ${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Create test user via API if needed
  try {
    const response = await page.request.post(`${baseURL}/api/test/setup`, {
      data: {
        user: {
          username: 'test_employee',
          password: 'test_password123',
          email: 'test@employee.com',
          role: 'sales_rep'
        },
        employee: {
          employeeId: 'TEST001',
          firstName: 'Test',
          lastName: 'Employee',
          department: 'Sales',
          position: 'Sales Representative',
          email: 'test.employee@tsg.com'
        }
      }
    });

    if (!response.ok()) {
      console.warn('⚠️ Test user creation failed, assuming user already exists');
    } else {
      console.log('✅ Test user created successfully');
    }
  } catch (error) {
    console.warn('⚠️ Test data setup API not available, assuming data exists');
  }

  // Create test quote requests, quotes, etc. if needed
  await createTestQuoteRequests(page, baseURL);
  await createTestMaterials(page, baseURL);
}

async function createTestQuoteRequests(page: any, baseURL: string) {
  const testQuoteRequests = [
    {
      name: 'John Test Client',
      email: 'john@testclient.com',
      company: 'Test Client Corp',
      phone: '555-0123',
      message: 'Need fulfillment services for our e-commerce business',
      servicesRequested: { fulfillment: true, warehousing: false },
      urgency: 'high',
      status: 'new'
    },
    {
      name: 'Jane Test Customer',
      email: 'jane@testcustomer.com',
      company: 'Test Customer LLC',
      phone: '555-0456',
      message: 'Looking for warehousing solutions',
      servicesRequested: { fulfillment: false, warehousing: true },
      urgency: 'medium',
      status: 'new'
    }
  ];

  for (const request of testQuoteRequests) {
    try {
      await page.request.post(`${baseURL}/api/test/quote-requests`, { data: request });
    } catch (error) {
      console.warn('⚠️ Failed to create test quote request:', error);
    }
  }
}

async function createTestMaterials(page: any, baseURL: string) {
  const testMaterials = [
    {
      materialName: 'Test Bubble Wrap',
      materialCode: 'TBW001',
      description: 'Test bubble wrap for packaging',
      vendorId: 1,
      unitPrice: 12.50,
      unitOfMeasure: 'rolls',
      reorderLevel: 50,
      reorderQuantity: 200,
      currentStock: 25 // Below reorder level
    },
    {
      materialName: 'Test Cardboard Boxes',
      materialCode: 'TCB002',
      description: 'Test cardboard boxes for shipping',
      vendorId: 1,
      unitPrice: 2.25,
      unitOfMeasure: 'pieces',
      reorderLevel: 100,
      reorderQuantity: 500,
      currentStock: 150 // Above reorder level
    }
  ];

  for (const material of testMaterials) {
    try {
      await page.request.post(`${baseURL}/api/test/materials`, { data: material });
    } catch (error) {
      console.warn('⚠️ Failed to create test material:', error);
    }
  }
}

async function createTestAuthState(page: any) {
  console.log('🔐 Creating test authentication state...');
  
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  
  // Login as test user
  await page.goto(`${baseURL}/employee/login`);
  
  // Fill login form
  await page.fill('[data-testid="username-input"]', 'test_employee');
  await page.fill('[data-testid="password-input"]', 'test_password123');
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login
  try {
    await page.waitForURL(`${baseURL}/employee`, { timeout: 10000 });
    
    // Save authentication state
    await page.context().storageState({ path: 'tests/config/auth-state.json' });
    console.log('✅ Authentication state saved');
  } catch (error) {
    console.warn('⚠️ Failed to create auth state, tests will login individually');
  }
}

export default globalSetup;