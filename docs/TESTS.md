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


## Test Suites

### Server Tests

- **`server/__tests__/index.test.ts`** - Integration tests for the main server entry point, verifying:
  - Analytics initialization and setup
  - Server listening on port 5000
  - Error propagation through Express middleware
- **`server/__tests__/routes.test.ts`** - API route functionality tests
- **`server/__tests__/storage.test.ts`** - Storage layer tests
- **`server/__tests__/integration.test.tsx`** - Full integration tests with React components

### Client Tests

- **`client/src/__tests__/`** - Component and utility tests
- **`client/src/components/__tests__/`** - UI component tests
- **`client/src/hooks/__tests__/`** - Custom hook tests
- **`client/src/lib/__tests__/`** - Library utility tests
=======
## End-to-End Tests

End-to-end tests live in the `e2e` directory and are powered by [Playwright](https://playwright.dev/).

### Prerequisites for E2E Tests

Before running e2e tests, you need to install the browser executables:

```bash
npx playwright install
```

**Note:** The first time you run e2e tests, you may encounter an error about missing browser executables. Run the install command above to resolve this.

### Running E2E Tests

Run them with:

```bash
npm run e2e
```

This uses the configuration defined in `playwright.config.ts`.

### E2E Test Configuration

The Playwright configuration (`playwright.config.ts`) includes:
- Test directory: `e2e/`
- Test file pattern: `**/*.e2e.ts`
- Base URL: `http://localhost:5000`
- Reporters: list and HTML (HTML report saved but not auto-opened)

### E2E Test Development

E2E tests should:
- Use the `.e2e.ts` file extension
- Be placed in the `e2e/` directory
- Target the local development server at `http://localhost:5000`
- Follow Playwright testing patterns and best practices

## Interpreting Results

- When all tests pass, the command exits with code `0` and displays success messages for each suite.
- If any test fails, Vitest reports the failing test name along with an error stack trace.
- The final exit code reflects whether the suite succeeded or failed, which is useful for CI pipelines.
