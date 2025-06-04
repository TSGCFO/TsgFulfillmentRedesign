# Test Guide

This document explains how to run the automated tests for this project.

## Prerequisites

- **Node.js 18 or newer** – the server tests use the built-in `fetch` API which is available starting in Node 18.
- Install project dependencies with `npm install` if you haven't already.

## Running the Tests

Execute the following command from the repository root:

```bash
npm run test
```

This command runs the test suite using [Vitest](https://vitest.dev/). It will execute all tests in both the server and client directories.

To generate a coverage report run:

```bash
npx vitest run --coverage
```

The global report should show at least **98%** coverage for lines, branches, functions and statements.

## Test Structure

### Client Tests
- **Hook Tests** (`client/src/hooks/__tests__/`):
  - `use-intersection-observer.test.tsx` - Tests intersection observer state management and cleanup
  - `use-mobile.test.tsx` - Tests mobile viewport detection and event listener cleanup
  - `use-toast.test.tsx` - Tests toast notification creation, dismissal, and reducer logic
  - `use-seo.test.tsx` - Tests SEO meta tag management (existing)

- **Component Tests** (`client/src/components/__tests__/`):
  - `Navbar.test.tsx` - Tests navigation component functionality (existing)
  - `quote-form.test.tsx` - Tests quote form validation and submission (existing)

### Server Tests
- **Core Server Tests** (`server/__tests__/`):
  - `index.test.ts` - Tests server initialization, analytics seeding, and error handling
  - `routes.test.ts` - Tests all API endpoints including CRUD operations and analytics routes
  - `storage.test.ts` - Tests in-memory storage operations for quotes, inventory, shipments, and analytics
  - `vite.test.ts` - Tests Vite development utilities and static file serving (skipped in CI environments)
  - `integration.test.tsx` - Full integration tests (existing)

## Interpreting Results

- When all tests pass, the command exits with code `0` and displays success messages for each suite.
- If any test fails, Vitest reports the failing test name along with an error stack trace.
- The final exit code reflects whether the suite succeeded or failed, which is useful for CI pipelines.
- Some tests may be skipped in certain environments (e.g., Vite tests are skipped when build dependencies are unavailable).
