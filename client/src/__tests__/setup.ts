import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Setup file for vitest

// Polyfill IntersectionObserver for jsdom environment
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(globalThis as any).IntersectionObserver =
  (globalThis as any).IntersectionObserver || MockIntersectionObserver;

// Provide dummy Supabase environment variables for tests
process.env.VITE_SUPABASE_URL = 'https://example.com';
process.env.VITE_SUPABASE_ANON_KEY = 'test';

// Simplify Radix Select components during tests
vi.mock('@/components/ui/select', () => {
  return {
    Select: ({ children, onValueChange, ...props }: any) =>
      React.createElement('select', { onChange: onValueChange, ...props }, children),
    SelectTrigger: ({ children }: any) => React.createElement(React.Fragment, null, children),
    SelectContent: ({ children }: any) => React.createElement(React.Fragment, null, children),
    SelectItem: ({ value, children, ...props }: any) =>
      React.createElement('option', { value, ...props }, children),
    SelectValue: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});
