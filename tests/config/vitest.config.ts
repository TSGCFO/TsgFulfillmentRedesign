/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Setup files
    setupFiles: [
      './tests/setup/test-setup.ts'
    ],
    
    // Global test configuration
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.test.{js,ts,tsx}',
        '**/*.spec.{js,ts,tsx}',
        'vite.config.ts',
        'vitest.config.ts',
        'playwright.config.ts',
        '**/coverage/**'
      ],
      include: [
        'client/src/**/*.{js,jsx,ts,tsx}',
        'server/**/*.{js,ts}',
        'shared/**/*.{js,ts}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Test patterns
    include: [
      '**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      'e2e/**',
      'tests/config/**'
    ],
    
    // Test timeout
    testTimeout: 10000,
    
    // Hook timeout
    hookTimeout: 10000,
    
    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        useAtomics: true
      }
    },
    
    // Reporter configuration
    reporter: [
      'verbose',
      'json',
      'html'
    ],
    
    outputFile: {
      json: './test-results/vitest-results.json',
      html: './test-results/vitest-report.html'
    },
    
    // Watch mode options
    watch: false,
    
    // Environment variables
    env: {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:3000/api',
      TEST_DATABASE_URL: 'postgresql://test:test@localhost:5432/tsg_test'
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../client/src'),
      '@server': path.resolve(__dirname, '../../server'),
      '@shared': path.resolve(__dirname, '../../shared'),
      '@tests': path.resolve(__dirname, '../')
    }
  },
  
  // Define global constants
  define: {
    'import.meta.vitest': undefined
  }
});