# Custom Claude Code Base Prompt Templates

This file contains reusable prompt templates for the custom claude-code-base-action workflow. These templates incorporate TSG brand guidelines and proven patterns from existing workflows.

## Base Template Structure

All prompts should follow this structure for consistency:

```markdown
# [Task Title] - TSG Fulfillment Services

## Context
- Repository: [repository]
- Branch: [branch]
- Environment: [development/staging/production]
- Triggered by: [trigger source]

## TSG Brand Guidelines
- Professional yet approachable tone
- Customer-centric language focusing on solutions
- Use "fulfillment center" not "warehouse"
- Use "team member" not "employee"
- Use "client" not "customer" for B2B

## Task Description
[Specific task details]

## Requirements
[Numbered list of specific requirements]

## Success Criteria
[What constitutes successful completion]
```

## Template Categories

### 1. Code Review Templates

#### Basic Code Review
```markdown
# Code Review - TSG Fulfillment Services

## Context
- Files changed: [file list]
- PR/Issue: [number]
- Author: [username]

## Review Areas
1. **Code Quality** - Check for best practices, clean code principles
2. **Security** - Scan for vulnerabilities, input validation, auth issues
3. **Performance** - Identify bottlenecks, optimization opportunities
4. **TypeScript** - Verify type safety, proper typing patterns
5. **React Patterns** - Component composition, hooks usage, state management
6. **Testing** - Test coverage, test quality, missing test cases
7. **Accessibility** - WCAG compliance, screen reader support
8. **TSG Brand** - Terminology consistency, content guidelines

## Output Format
### 🔴 Critical Issues
[Issues that must be fixed before merge]

### 🟡 Recommendations
[Suggestions for improvement]

### 🟢 Positive Observations
[Well-implemented code or good practices]

### 📊 Summary
- Files reviewed: [count]
- Critical issues: [count]
- Recommendations: [count]
- Overall assessment: [rating]
```

#### Security-Focused Review
```markdown
# Security Code Review - TSG Fulfillment Services

## Security Checklist
1. **Input Validation** - All user inputs properly sanitized
2. **Authentication** - Proper auth token handling, session management
3. **Authorization** - Role-based access controls, permission checks
4. **Data Protection** - Sensitive data encryption, PII handling
5. **API Security** - Rate limiting, CORS configuration, endpoint protection
6. **Dependencies** - No known vulnerabilities, outdated packages
7. **Configuration** - Environment variables, secrets management
8. **Error Handling** - No sensitive data in error messages

## Output Format
### 🚨 Security Vulnerabilities
[High priority security issues]

### ⚠️ Security Concerns
[Medium priority issues requiring attention]

### ✅ Security Best Practices
[Well-implemented security measures]

### 🔒 Recommendations
[Security improvements and hardening suggestions]
```

### 2. Feature Implementation Templates

#### React Component Implementation
```markdown
# React Component Implementation - TSG Fulfillment Services

## Component Requirements
- Name: [ComponentName]
- Purpose: [component purpose]
- Location: [file path]
- Dependencies: [required packages/components]

## Implementation Checklist
1. **Component Structure**
   - TypeScript interface for props
   - Default props where appropriate
   - Proper component composition
   - Error boundaries if needed

2. **Styling**
   - TailwindCSS classes following TSG design system
   - Responsive design (mobile-first)
   - Accessibility features (ARIA labels, focus management)
   - Brand-consistent colors and typography

3. **Functionality**
   - Event handlers and state management
   - Form validation if applicable
   - Loading and error states
   - Performance optimizations (useMemo, useCallback)

4. **Testing**
   - Unit tests with Vitest/Jest
   - Component testing with Testing Library
   - Mock external dependencies
   - Test accessibility features

5. **Documentation**
   - JSDoc comments for props and methods
   - Usage examples in Storybook (if applicable)
   - README updates if needed

## TSG Design Patterns
- Use existing TSG components where possible
- Follow established naming conventions
- Implement consistent spacing and layout
- Ensure brand color compliance
```

#### API Integration Template
```markdown
# API Integration Implementation - TSG Fulfillment Services

## Integration Requirements
- Endpoint: [API endpoint]
- Method: [GET/POST/PUT/DELETE]
- Authentication: [auth method]
- Data format: [JSON/FormData/etc]

## Implementation Checklist
1. **API Client Setup**
   - Base URL configuration
   - Authentication headers
   - Request/response interceptors
   - Error handling middleware

2. **Type Definitions**
   - Request payload interfaces
   - Response data interfaces
   - Error response types
   - Validation schemas (Zod/Yup)

3. **Error Handling**
   - Network error handling
   - HTTP status code handling
   - User-friendly error messages
   - Retry logic for transient failures

4. **State Management**
   - Loading states
   - Error states
   - Data caching strategies
   - Optimistic updates

5. **Testing**
   - Mock API responses
   - Error scenario testing
   - Integration tests
   - Performance testing

## Security Considerations
- Input sanitization
- CORS configuration
- Rate limiting awareness
- Sensitive data handling
```

### 3. Bug Investigation Templates

#### Frontend Bug Investigation
```markdown
# Frontend Bug Investigation - TSG Fulfillment Services

## Bug Report
- Issue: [bug description]
- Reproduction steps: [steps to reproduce]
- Expected behavior: [what should happen]
- Actual behavior: [what actually happens]
- Browser/Device: [environment details]

## Investigation Plan
1. **Code Analysis**
   - Review recent changes to affected components
   - Check for TypeScript errors or warnings
   - Analyze component lifecycle and state changes
   - Review event handlers and side effects

2. **Browser DevTools**
   - Console errors and warnings
   - Network tab for failed requests
   - React DevTools for component state
   - Performance tab for rendering issues

3. **Testing**
   - Reproduce bug in different environments
   - Test with different data sets
   - Verify across multiple browsers
   - Check mobile responsiveness

4. **Root Cause Analysis**
   - Identify the specific code causing the issue
   - Determine if it's a regression or new issue
   - Check for related issues in the codebase
   - Analyze impact on other features

## Fix Implementation
1. Create minimal reproduction case
2. Implement fix with proper testing
3. Verify fix doesn't break other functionality
4. Add tests to prevent regression
5. Update documentation if needed
```

#### Performance Investigation
```markdown
# Performance Investigation - TSG Fulfillment Services

## Performance Metrics
- Target: [performance goal]
- Current: [current metrics]
- Threshold: [acceptable limits]
- Tools: [measurement tools]

## Investigation Areas
1. **Bundle Analysis**
   - Bundle size and composition
   - Unused dependencies
   - Code splitting opportunities
   - Dynamic imports usage

2. **Runtime Performance**
   - Component render times
   - JavaScript execution time
   - Memory usage patterns
   - Event handler efficiency

3. **Network Performance**
   - API response times
   - Image optimization
   - Caching strategies
   - CDN usage

4. **Core Web Vitals**
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)
   - Time to Interactive (TTI)

## Optimization Strategies
- Code splitting and lazy loading
- Image optimization and compression
- API response caching
- Component memoization
- Virtual scrolling for large lists
- Service worker implementation
```

### 4. Documentation Templates

#### API Documentation
```markdown
# API Documentation Update - TSG Fulfillment Services

## Documentation Requirements
1. **Endpoint Documentation**
   - Clear endpoint descriptions
   - Request/response examples
   - Parameter definitions
   - Error code explanations

2. **Authentication**
   - Auth flow diagrams
   - Token management
   - Permission levels
   - Security considerations

3. **Integration Examples**
   - Code samples in multiple languages
   - SDK usage examples
   - Common use cases
   - Troubleshooting guide

4. **OpenAPI Specification**
   - Complete schema definitions
   - Validation rules
   - Response models
   - Error schemas

## TSG Documentation Standards
- Clear, jargon-free language
- Step-by-step instructions
- Visual aids where helpful
- Regular review and updates
```

#### Code Documentation
```markdown
# Code Documentation Update - TSG Fulfillment Services

## Documentation Checklist
1. **Component Documentation**
   - JSDoc comments for all components
   - Props interface documentation
   - Usage examples
   - Best practices

2. **Function Documentation**
   - Parameter descriptions
   - Return value explanations
   - Side effects noted
   - Examples provided

3. **Architecture Documentation**
   - System overview diagrams
   - Data flow explanations
   - Technology stack details
   - Deployment procedures

4. **Development Guide**
   - Setup instructions
   - Development workflow
   - Testing procedures
   - Contribution guidelines

## Quality Standards
- Consistent formatting
- Accurate and up-to-date
- Beginner-friendly explanations
- Code examples that work
```

### 5. Deployment and DevOps Templates

#### Deployment Automation
```markdown
# Deployment Automation - TSG Fulfillment Services

## Deployment Requirements
- Environment: [staging/production]
- Platform: [deployment platform]
- Strategy: [blue-green/rolling/etc]
- Rollback plan: [rollback strategy]

## Automation Checklist
1. **Pre-deployment**
   - Run all tests
   - Build optimization
   - Security scanning
   - Dependency checks

2. **Deployment Process**
   - Environment preparation
   - Database migrations
   - Application deployment
   - Health checks

3. **Post-deployment**
   - Smoke tests
   - Performance monitoring
   - Error tracking
   - User notification

4. **Monitoring**
   - Application metrics
   - Error rates
   - Performance indicators
   - User activity

## TSG Deployment Standards
- Zero-downtime deployments
- Automated rollback triggers
- Comprehensive monitoring
- Incident response procedures
```

## MCP Server Configuration Templates

### Sequential Thinking Configuration
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "timeout": 120000,
      "env": {
        "THINKING_DEPTH": "advanced",
        "MAX_ITERATIONS": "50"
      }
    }
  }
}
```

### Filesystem Configuration
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "timeout": 60000,
      "env": {
        "ALLOWED_DIRECTORIES": "${{ github.workspace }}",
        "ENABLE_WRITE": "true",
        "MAX_FILE_SIZE": "100MB",
        "RECURSIVE_OPERATIONS": "true"
      }
    }
  }
}
```

### Web Search Configuration
```json
{
  "mcpServers": {
    "web-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-web-search"],
      "timeout": 45000,
      "env": {
        "BRAVE_API_KEY": "${{ secrets.BRAVE_API_KEY }}",
        "MAX_RESULTS": "50",
        "SEARCH_TIMEOUT": "30000"
      }
    }
  }
}
```

## Usage Instructions

1. **Select appropriate template** based on task type
2. **Customize variables** in brackets [like this]
3. **Add specific requirements** for your use case
4. **Include TSG brand guidelines** where applicable
5. **Configure MCP servers** based on needed capabilities
6. **Test with smaller scope** before full implementation

## Best Practices

- Start with simpler templates and add complexity as needed
- Always include TSG brand guidelines in customer-facing changes
- Use sequential thinking for complex architectural decisions
- Include comprehensive testing requirements
- Document any deviations from standard patterns
- Regular template updates based on learnings and changes