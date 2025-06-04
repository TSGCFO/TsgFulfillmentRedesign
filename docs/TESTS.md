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

## Interpreting Results

- When all tests pass, the command exits with code `0` and displays success messages for each suite.
- If any test fails, Vitest reports the failing test name along with an error stack trace.
- The final exit code reflects whether the suite succeeded or failed, which is useful for CI pipelines.
