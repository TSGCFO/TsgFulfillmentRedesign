import { vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data generators
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'sales_rep',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockEmployee = (overrides: Partial<any> = {}) => ({
  id: 1,
  userId: 1,
  employeeId: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  department: 'Sales',
  position: 'Sales Representative',
  email: 'john.doe@tsg.com',
  phone: '555-0123',
  isActive: true,
  permissions: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockQuoteRequest = (overrides: Partial<any> = {}) => ({
  id: 1,
  name: 'John Smith',
  email: 'john.smith@client.com',
  company: 'Client Corp',
  phone: '555-0456',
  message: 'Need fulfillment services',
  servicesRequested: { fulfillment: true, warehousing: false },
  urgency: 'medium',
  status: 'new',
  assignedTo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockQuote = (overrides: Partial<any> = {}) => ({
  id: 1,
  quoteRequestId: 1,
  quoteNumber: 'QUO-2025-001',
  clientName: 'John Smith',
  clientEmail: 'john.smith@client.com',
  clientCompany: 'Client Corp',
  servicesQuoted: { fulfillment: true, warehousing: false },
  pricingData: { basePrice: 1000, additionalServices: 500, total: 1500 },
  totalAmount: 1500,
  createdBy: 1,
  assignedTo: 1,
  status: 'draft',
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockContract = (overrides: Partial<any> = {}) => ({
  id: 1,
  quoteId: 1,
  contractNumber: 'CON-2025-001',
  clientName: 'John Smith',
  clientEmail: 'john.smith@client.com',
  clientCompany: 'Client Corp',
  docusignEnvelopeId: 'envelope-123',
  contractValue: 1500,
  status: 'sent',
  signedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockVendor = (overrides: Partial<any> = {}) => ({
  id: 1,
  vendorName: 'Test Vendor Inc',
  vendorCode: 'TV001',
  contactPerson: 'Jane Vendor',
  email: 'jane@testvendor.com',
  phone: '555-VENDOR',
  address: '123 Vendor St, Vendor City, VC 12345',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockMaterial = (overrides: Partial<any> = {}) => ({
  id: 1,
  materialName: 'Test Material',
  materialCode: 'TM001',
  description: 'A test material',
  vendorId: 1,
  unitPrice: 25.50,
  unitOfMeasure: 'pieces',
  reorderLevel: 100,
  reorderQuantity: 500,
  currentStock: 150,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockPurchaseOrder = (overrides: Partial<any> = {}) => ({
  id: 1,
  poNumber: 'PO-2025-001',
  vendorId: 1,
  requestedBy: 1,
  totalAmount: 3000,
  status: 'pending',
  orderDate: new Date(),
  expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  notes: 'Test purchase order',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockPurchaseOrderItem = (overrides: Partial<any> = {}) => ({
  id: 1,
  purchaseOrderId: 1,
  materialId: 1,
  quantity: 200,
  unitPrice: 15.00,
  totalPrice: 3000,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockHubSpotSyncLog = (overrides: Partial<any> = {}) => ({
  id: 1,
  operation: 'deal_sync' as const,
  hubspotId: 'deal-12345',
  localId: 1,
  direction: 'to_hubspot' as const,
  status: 'success' as const,
  syncData: { dealName: 'Test Deal', dealValue: 5000 },
  responseData: { id: 'deal-12345', properties: {} },
  errorMessage: null,
  createdAt: new Date(),
  ...overrides
});

// Mock storage functions
export const createMockStorage = () => ({
  // User operations
  getUserByUsername: vi.fn(),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),

  // Employee operations
  getEmployeeByUserId: vi.fn(),
  getEmployeeById: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),

  // Quote request operations
  getQuoteRequests: vi.fn(),
  getQuoteRequest: vi.fn(),
  createQuoteRequest: vi.fn(),
  updateQuoteRequest: vi.fn(),
  getQuoteRequestCount: vi.fn(),

  // Quote operations
  getQuotes: vi.fn(),
  getQuoteById: vi.fn(),
  createQuote: vi.fn(),
  updateQuote: vi.fn(),
  getQuoteCount: vi.fn(),

  // Contract operations
  getContracts: vi.fn(),
  getContract: vi.fn(),
  createContract: vi.fn(),
  updateContract: vi.fn(),
  getContractCount: vi.fn(),

  // Vendor operations
  getVendors: vi.fn(),
  getVendor: vi.fn(),
  createVendor: vi.fn(),
  updateVendor: vi.fn(),

  // Material operations
  getMaterials: vi.fn(),
  getMaterial: vi.fn(),
  createMaterial: vi.fn(),
  updateMaterial: vi.fn(),
  getLowStockMaterials: vi.fn(),
  getMaterialCount: vi.fn(),

  // Purchase order operations
  getPurchaseOrders: vi.fn(),
  getPurchaseOrderById: vi.fn(),
  createPurchaseOrder: vi.fn(),
  updatePurchaseOrder: vi.fn(),
  createPurchaseOrderItem: vi.fn(),

  // Activity operations
  getRecentActivity: vi.fn(),
  createActivity: vi.fn()
});

// Mock HubSpot service
export const createMockHubSpotService = () => ({
  syncQuoteRequestToDeal: vi.fn(),
  syncDealFromHubSpot: vi.fn(),
  createOrUpdateContact: vi.fn(),
  getDeal: vi.fn(),
  updateDeal: vi.fn(),
  createDeal: vi.fn()
});

// Mock DocuSign service
export const createMockDocuSignService = () => ({
  sendContractForSignature: vi.fn(),
  handleWebhook: vi.fn(),
  getEnvelopeStatus: vi.fn(),
  downloadSignedDocument: vi.fn()
});

// React Query test provider
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0
    },
    mutations: {
      retry: false
    }
  }
});

// Test wrapper component
export const QueryWrapper: React.FC<{ children: React.ReactNode; client?: QueryClient }> = ({ 
  children, 
  client = createQueryClient() 
}) => (
  <QueryClientProvider client={client}>
    {children}
  </QueryClientProvider>
);

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options: {
    queryClient?: QueryClient;
    initialEntries?: string[];
  } = {}
) => {
  const { queryClient = createQueryClient() } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient
  };
};

// Authentication test helpers
export const mockAuthToken = 'mock.jwt.token';

export const createMockAuthContext = (overrides: Partial<any> = {}) => ({
  user: createMockUser(),
  employee: createMockEmployee(),
  token: mockAuthToken,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  ...overrides
});

// API response helpers
export const createSuccessResponse = (data: any) => ({
  ok: true,
  status: 200,
  json: async () => ({ data })
});

export const createErrorResponse = (message: string, status = 400) => ({
  ok: false,
  status,
  json: async () => ({ message })
});

// Mock fetch responses
export const mockFetchSuccess = (data: any) => {
  global.fetch = vi.fn().mockResolvedValue(createSuccessResponse(data));
};

export const mockFetchError = (message: string, status = 400) => {
  global.fetch = vi.fn().mockResolvedValue(createErrorResponse(message, status));
};

export const mockFetchNetworkError = () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
};

// Date helpers
export const createDateInPast = (daysAgo: number) => 
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

export const createDateInFuture = (daysFromNow: number) => 
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

// Wait helpers for async operations
export const waitForNextTick = () => new Promise(resolve => process.nextTick(resolve));

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Form data helpers
export const createFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  return formData;
};

// URL helpers
export const createSearchParams = (params: Record<string, string>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value);
  });
  return searchParams;
};

// Validation helpers
export const expectToBeCalledWith = (mockFn: any, expectedArgs: any[]) => {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
};

export const expectToHaveBeenCalledTimes = (mockFn: any, times: number) => {
  expect(mockFn).toHaveBeenCalledTimes(times);
};

// Error message helpers
export const expectErrorMessage = (container: any, message: string) => {
  expect(container).toHaveTextContent(message);
};

export const expectSuccessMessage = (container: any, message: string) => {
  expect(container).toHaveTextContent(message);
};

// Loading state helpers
export const expectLoadingState = (container: any) => {
  expect(container.querySelector('[data-testid="loading-skeleton"]')).toBeInTheDocument();
};

export const expectNotLoadingState = (container: any) => {
  expect(container.querySelector('[data-testid="loading-skeleton"]')).not.toBeInTheDocument();
};

// Table helpers
export const expectTableRowCount = (container: any, count: number) => {
  const rows = container.querySelectorAll('[data-testid*="-row"]');
  expect(rows).toHaveLength(count);
};

export const expectTableToContainText = (container: any, text: string) => {
  const table = container.querySelector('[data-testid*="-table"]');
  expect(table).toHaveTextContent(text);
};

// Modal helpers
export const expectModalToBeVisible = (container: any, modalTestId: string) => {
  expect(container.querySelector(`[data-testid="${modalTestId}"]`)).toBeInTheDocument();
};

export const expectModalToBeHidden = (container: any, modalTestId: string) => {
  expect(container.querySelector(`[data-testid="${modalTestId}"]`)).not.toBeInTheDocument();
};

// Navigation helpers
export const expectToBeOnPage = (location: any, expectedPath: string) => {
  expect(location.pathname).toBe(expectedPath);
};

// Clean up helpers
export const cleanupMocks = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};

export const restoreAllMocks = () => {
  vi.restoreAllMocks();
};

// Database test helpers (for integration tests)
export const createTestDatabase = async () => {
  // This would be implemented based on your database setup
  // For now, returning a mock implementation
  return {
    query: vi.fn(),
    transaction: vi.fn(),
    close: vi.fn()
  };
};

export const clearTestDatabase = async (db: any) => {
  // Clear all test data
  await db.query('TRUNCATE TABLE hubspot_sync_log, purchase_order_items, purchase_orders, materials, vendors, contracts, quotes, quote_requests, employees, users RESTART IDENTITY CASCADE');
};

// Performance test helpers
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

export const expectExecutionTimeUnder = async (fn: () => Promise<any>, maxMs: number) => {
  const duration = await measureExecutionTime(fn);
  expect(duration).toBeLessThan(maxMs);
};