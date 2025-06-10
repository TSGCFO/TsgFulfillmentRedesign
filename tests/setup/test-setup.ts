// Global test setup for Vitest
import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Extend expect with jest-dom matchers
import { expect } from 'vitest';

// Mock global objects
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock URL constructor
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

// Mock fetch globally
global.fetch = vi.fn();

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_API_URL = 'http://localhost:3000/api';
process.env.TEST_DATABASE_URL = 'postgresql://test:test@localhost:5432/tsg_test';

// Global setup
beforeAll(() => {
  // Set up any global test state
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  // Clean up any global test state
  console.log('✅ Test suite completed');
});

// Test cleanup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorageMock.clear.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  
  sessionStorageMock.clear.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
});

afterEach(() => {
  // Clean up DOM after each test
  cleanup();
  
  // Reset all mocks after each test
  vi.resetAllMocks();
});

// Custom console methods for testing
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Suppress console.error and console.warn in tests unless needed
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Error boundary for testing
export class TestErrorBoundary extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestErrorBoundary';
  }
}

// Helper to restore console methods when needed for debugging
export const enableConsoleLogs = () => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = console.log;
};

// Helper to silence console methods
export const silenceConsoleLogs = () => {
  console.error = vi.fn();
  console.warn = vi.fn();
  console.log = vi.fn();
};