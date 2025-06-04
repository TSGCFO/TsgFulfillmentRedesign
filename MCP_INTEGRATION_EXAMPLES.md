# MCP Integration Examples for TSG Fulfillment

## Overview

This document provides practical examples of how to use Claude Code as an MCP server within your TSG Fulfillment project workflow.

## Claude Desktop Integration Examples

### 1. Project Analysis

**Scenario**: Understanding the codebase structure

```
> Analyze the TSG Fulfillment project structure and explain the main components

> What are the key React components in the client directory?

> Show me the server-side API routes and their functions

> How is the database schema organized in this project?
```

**Expected Output**: Claude will analyze your project files and provide insights about:
- Frontend React components and their relationships
- Backend API structure and routes
- Database schema and models
- Build and deployment configuration

### 2. Code Review and Quality

**Scenario**: Reviewing code quality and identifying issues

```
> Review the security implementation in the authentication modules

> Check for TypeScript errors across the entire project

> Analyze the test coverage and suggest improvements

> Look for potential performance issues in the React components
```

**Expected Output**: Detailed analysis of:
- Security vulnerabilities or best practices
- TypeScript compilation issues
- Missing or insufficient tests
- Performance optimization opportunities

### 3. Development Assistance

**Scenario**: Getting help with development tasks

```
> Help me create a new fulfillment service component following the existing patterns

> Generate API documentation for the existing routes

> Create a deployment checklist based on the current project structure

> Suggest improvements for the CI/CD pipeline
```

**Expected Output**: Practical development assistance including:
- Code generation following project conventions
- Documentation generation
- Deployment and operations guidance
- Development workflow improvements

## VS Code Integration (via Extensions)

### Setup for VS Code

If you're using VS Code with MCP-compatible extensions:

```json
// .vscode/settings.json
{
  "mcp.servers": {
    "tsg-fulfillment": {
      "command": "claude",
      "args": ["mcp", "serve"],
      "workingDirectory": "${workspaceFolder}"
    }
  }
}
```

### Example Commands in VS Code

```
> Explain this function (with cursor on a specific function)

> Refactor this component to use TypeScript strict mode

> Generate unit tests for the selected code

> Find all usages of this API endpoint
```

## Command Line Integration

### Using MCP Server from Terminal

```bash
# Start the MCP server
./scripts/start-mcp-server.sh development

# In another terminal, connect via MCP client
mcp-client connect claude-code-server
```

### Scripted Development Tasks

```bash
# Example: Automated code review script
#!/bin/bash
echo "Starting code review via MCP..."
mcp-client ask "Review all TypeScript files for potential issues"
mcp-client ask "Check test coverage and suggest improvements"
mcp-client ask "Analyze bundle size and optimization opportunities"
```

## Team Workflow Examples

### 1. Code Review Process

**Before submitting a PR:**

```
> Review my changes for the new inventory management feature

> Check if I've followed the TSG coding standards

> Suggest any additional tests I should write

> Verify that the documentation is up to date
```

### 2. Onboarding New Team Members

**For new developers:**

```
> Explain the overall architecture of this fulfillment system

> What are the main development tools and commands I need to know?

> Show me examples of how to add a new API endpoint

> How does the authentication and authorization work?
```

### 3. Debugging and Troubleshooting

**When encountering issues:**

```
> I'm getting a TypeScript error in the checkout component. Can you help?

> The build is failing with a dependency issue. What's wrong?

> Performance seems slow on the inventory page. Can you analyze why?

> The tests are failing after my recent changes. What do I need to fix?
```

## Advanced Integration Patterns

### 1. Custom MCP Tools

Create project-specific MCP tools for TSG Fulfillment:

```json
// .mcp.json
{
  "mcpServers": {
    "tsg-fulfillment-tools": {
      "command": "node",
      "args": ["./scripts/mcp-tools.js"],
      "env": {
        "PROJECT_TYPE": "fulfillment",
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

### 2. Automated Quality Gates

```bash
# Pre-commit hook using MCP
#!/bin/bash
# .git/hooks/pre-commit

echo "Running MCP-powered quality checks..."

# Start MCP server if not running
if ! pgrep -f "claude mcp serve" > /dev/null; then
    claude mcp serve &
    MCP_PID=$!
    sleep 2
fi

# Run quality checks
mcp-client ask "Check this commit for code quality issues"
mcp-client ask "Verify all tests pass"
mcp-client ask "Check for security vulnerabilities"

# Clean up
if [ ! -z "$MCP_PID" ]; then
    kill $MCP_PID
fi
```

### 3. Documentation Generation

```bash
# Generate documentation using MCP
#!/bin/bash

echo "Generating project documentation..."

mcp-client ask "Generate API documentation from the route definitions"
mcp-client ask "Create component documentation for all React components"
mcp-client ask "Update the README with current project structure"
mcp-client ask "Generate deployment documentation"
```

## Security Examples

### Safe Operations

```
> Analyze the codebase for potential security vulnerabilities (read-only)

> Review environment variable usage for security best practices

> Check for any hardcoded secrets or credentials

> Validate input sanitization in the API endpoints
```

### Restricted Access Example

```json
// Production MCP configuration with restrictions
{
  "mcpServers": {
    "tsg-fulfillment-prod": {
      "command": "claude",
      "args": ["mcp", "serve", "--read-only", "--restrict-to", "client,server,docs"],
      "env": {
        "NODE_ENV": "production",
        "RESTRICTED_ACCESS": "true"
      }
    }
  }
}
```

## Performance Examples

### Optimization Analysis

```
> Analyze the bundle size and suggest optimizations

> Review the database queries for performance issues

> Check for memory leaks in the React components

> Suggest caching strategies for the API endpoints
```

### Load Testing Integration

```bash
# Use MCP for load testing analysis
mcp-client ask "Analyze the server performance under load"
mcp-client ask "Suggest improvements for high-traffic scenarios"
mcp-client ask "Review the database indexing strategy"
```

## Monitoring and Maintenance

### Health Checks

```
> Check the overall health of the application

> Review recent error logs and suggest fixes

> Analyze the dependency vulnerabilities

> Verify the backup and recovery procedures
```

### Automated Maintenance

```bash
# Weekly maintenance script
#!/bin/bash

echo "Running weekly MCP maintenance..."

mcp-client ask "Check for outdated dependencies"
mcp-client ask "Analyze code quality metrics"
mcp-client ask "Review security updates needed"
mcp-client ask "Suggest cleanup tasks"
```

## Integration Best Practices

### 1. Context Management

- Always provide clear context about what you're working on
- Use specific file paths and line numbers when asking for help
- Include relevant error messages or symptoms

### 2. Security Considerations

- Use read-only mode for analysis tasks
- Restrict server access to necessary directories only
- Never expose sensitive credentials through MCP

### 3. Performance Optimization

- Close MCP connections when not needed
- Use appropriate timeouts for long-running operations
- Monitor resource usage during MCP operations

### 4. Team Collaboration

- Share MCP configurations through version control
- Document team-specific MCP usage patterns
- Train team members on effective MCP usage

---

*These examples are designed specifically for the TSG Fulfillment project. Adapt them based on your specific workflow and requirements.*