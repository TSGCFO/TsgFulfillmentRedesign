# Employee Portal Testing Suite

This directory contains comprehensive tests for the Employee Portal feature implementation, covering unit tests, integration tests, API tests, and end-to-end tests.

## Test Structure

```
tests/
├── config/           # Test configuration files
├── mocks/           # Mock data and services
├── setup/           # Test setup and utilities
└── utils/           # Test helper functions
```

## Test Types

### 1. Unit Tests
- **Location**: `server/__tests__/`, `client/src/**/__tests__/`
- **Framework**: Vitest + React Testing Library
- **Coverage**: Individual components, hooks, services, and utilities

#### Backend Unit Tests:
- `server/__tests__/auth.test.ts` - Authentication middleware
- `server/__tests__/services/hubspot.test.ts` - HubSpot integration service
- `server/__tests__/services/docusign.test.ts` - DocuSign integration service

#### Frontend Unit Tests:
- `client/src/hooks/__tests__/use-employee-auth.test.tsx` - Authentication hook
- `client/src/components/employee/__tests__/Layout.test.tsx` - Layout component
- `client/src/pages/employee/__tests__/Login.test.tsx` - Login page
- `client/src/pages/employee/__tests__/Dashboard.test.tsx` - Dashboard page

### 2. API Tests
- **Location**: `server/__tests__/routes/employee.test.ts`
- **Framework**: Vitest + Supertest
- **Coverage**: All Employee Portal API endpoints

### 3. Integration Tests
- **Location**: `server/__tests__/integration.test.ts`
- **Framework**: Vitest + Test Database
- **Coverage**: Database operations, data integrity, and complex workflows

### 4. End-to-End Tests
- **Location**: `e2e/employee-portal.e2e.ts`
- **Framework**: Playwright
- **Coverage**: Complete user workflows and cross-browser compatibility

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Set up test database (if running integration tests)
npm run test:db:setup
```

### Unit and Integration Tests
```bash
# Run all unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test auth.test.ts

# Run tests for specific component
npm run test -- --testNamePattern="Authentication"
```

### API Tests
```bash
# Run API tests specifically
npm run test:api

# Run API tests with verbose output
npm run test:api -- --verbose
```

### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Run E2E tests on specific browser
npm run test:e2e -- --project=chromium

# Run E2E tests with UI
npm run test:e2e:ui
```

### All Tests
```bash
# Run complete test suite
npm run test:all

# Run tests in CI mode
npm run test:ci
```

## Test Configuration

### Vitest Configuration
- **File**: `tests/config/vitest.config.ts`
- **Setup**: `tests/setup/test-setup.ts`
- **Coverage**: 80% threshold for branches, functions, lines, and statements

### Playwright Configuration
- **File**: `tests/config/playwright.config.ts`
- **Setup**: `tests/config/global-setup.ts`
- **Teardown**: `tests/config/global-teardown.ts`

## Test Data and Mocks

### Mock API Responses
- **File**: `tests/mocks/api-responses.ts`
- **Purpose**: Consistent mock data for all API endpoints
- **Usage**: Import specific response types for different test scenarios

### Mock Services
- **File**: `tests/mocks/services.ts`
- **Purpose**: Mock implementations of HubSpot, DocuSign, and storage services
- **Usage**: Use `setupServiceMocks()` to get all mocked services

### Test Helpers
- **File**: `tests/utils/test-helpers.ts`
- **Purpose**: Utility functions for common testing operations
- **Includes**:
  - Mock data generators
  - Test component wrappers
  - Assertion helpers
  - Mock setup and cleanup functions

## Test Scenarios Covered

### Authentication Flow
- ✅ Successful login with valid credentials
- ✅ Failed login with invalid credentials
- ✅ Session management and token validation
- ✅ Role-based access control
- ✅ Automatic logout on token expiration

### Quote Request Management
- ✅ Viewing and filtering quote requests
- ✅ Assigning quote requests to employees
- ✅ Creating quotes from quote requests
- ✅ HubSpot synchronization

### Quote and Contract Management
- ✅ Creating and updating quotes
- ✅ Sending contracts for signature
- ✅ DocuSign integration workflow
- ✅ Contract status tracking

### Material and Inventory Management
- ✅ Viewing materials inventory
- ✅ Adding new materials
- ✅ Low stock detection and alerts
- ✅ Creating purchase orders

### Dashboard and Metrics
- ✅ Dashboard metrics display
- ✅ Recent activity tracking
- ✅ Real-time data updates
- ✅ Navigation between sections

### Error Handling
- ✅ API error responses
- ✅ Network connectivity issues
- ✅ Invalid form submissions
- ✅ Session expiration handling

### Accessibility and Responsive Design
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Mobile viewport testing
- ✅ ARIA labels and roles

## Coverage Requirements

### Minimum Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
- **HTML Report**: `coverage/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **JSON Report**: `coverage/coverage-final.json`

## Debugging Tests

### Enable Console Logs
```typescript
import { enableConsoleLogs } from '@tests/utils/test-helpers';

test('debug test', () => {
  enableConsoleLogs();
  // Your test code here
});
```

### Run Single Test
```bash
# Run specific test with full output
npm run test -- --testNamePattern="should login successfully" --verbose
```

### Debug E2E Tests
```bash
# Run E2E tests with browser visible
npm run test:e2e:headed

# Run E2E tests with debugging tools
npm run test:e2e -- --debug
```

## CI/CD Integration

### GitHub Actions
The test suite is configured to run in GitHub Actions with:
- Parallel test execution
- Cross-browser E2E testing
- Coverage reporting
- Test result artifacts

### Test Database
- Uses separate test database: `tsg_test`
- Automatically cleaned up after each test run
- Migrations applied before integration tests

## Best Practices

### Writing Tests
1. **Use descriptive test names** that explain what is being tested
2. **Follow AAA pattern** (Arrange, Act, Assert)
3. **Mock external dependencies** to isolate units under test
4. **Test both success and failure scenarios**
5. **Clean up after tests** to prevent side effects

### Mock Data
1. **Use consistent mock data** across all tests
2. **Create realistic test scenarios** that match production data
3. **Keep mocks simple** and focused on test requirements
4. **Update mocks** when API contracts change

### Test Maintenance
1. **Run tests frequently** during development
2. **Update tests** when features change
3. **Review test coverage** regularly
4. **Remove obsolete tests** for deprecated features

## Troubleshooting

### Common Issues

#### Tests Failing Due to Missing Environment Variables
```bash
# Ensure test environment variables are set
export TEST_DATABASE_URL="postgresql://test:test@localhost:5432/tsg_test"
export NODE_ENV="test"
```

#### E2E Tests Timing Out
- Increase timeouts in `playwright.config.ts`
- Check if development server is running
- Verify test data is properly set up

#### Integration Tests Failing
- Ensure test database is running and accessible
- Check if migrations have been applied
- Verify database permissions

#### Coverage Thresholds Not Met
- Identify untested code areas with `npm run test:coverage`
- Add tests for missing coverage
- Update thresholds if necessary (with justification)

### Getting Help
- Check test output for specific error messages
- Review test configuration files for setup issues
- Consult the main project documentation
- Review similar test implementations for patterns