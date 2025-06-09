# Custom Claude Code Base Action Guide

This guide provides comprehensive documentation for using the custom claude-code-base-action workflow system that bypasses restrictions of the standard claude-code-action while maintaining all the benefits.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Usage](#usage)
- [Configuration](#configuration)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Migration Guide](#migration-guide)

## Overview

### What is Custom Claude Code Base?

The Custom Claude Code Base workflow provides direct access to `claude-code-base-action` with enhanced capabilities that bypass the limitations of the standard `claude-code-action` wrapper.

### Key Benefits

| Feature | Standard Claude Code Action | Custom Claude Code Base |
|---------|----------------------------|-------------------------|
| **Trigger Methods** | `@claude` comments only | Multiple triggers: manual dispatch, custom phrases, scheduled, push-based |
| **Tool Access** | Filtered bash commands | Unrestricted `Bash(*)` access |
| **MCP Servers** | Basic configuration | Advanced MCP with custom timeouts and environments |
| **Permissions** | Limited GitHub permissions | Maximum permissions (deployments, security, packages) |
| **Timeouts** | Fixed timeouts | Configurable 1-60+ minute timeouts |
| **Environment Variables** | Basic GitHub context | Custom TSG-specific environment configuration |
| **Branch Management** | Automatic branch creation | Custom branch targeting and management |

## Architecture

### Component Overview

```
Custom Claude Code Base System
├── Main Workflow (claude-code-base-custom.yml)
│   ├── Multiple Trigger Support
│   ├── Dynamic MCP Configuration  
│   ├── Environment-Specific Settings
│   └── Post-Execution Validation
├── Usage Examples (claude-base-examples.yml)
│   ├── Simple Analysis
│   ├── Code Review
│   ├── Feature Implementation
│   ├── Security Audit
│   ├── Documentation Update
│   └── Bug Investigation
├── Prompt Templates (custom-claude-base-prompts.md)
│   ├── Code Review Templates
│   ├── Feature Implementation Templates
│   ├── Bug Investigation Templates
│   └── Documentation Templates
└── This Documentation Guide
```

### MCP Server Integration

The system supports advanced MCP (Model Context Protocol) server configurations:

#### Default Available Servers
- **GitHub API** (`mcp__github__*`) - Built into claude-code-base-action
- **File Operations** (`mcp__github_file_ops__*`) - Built into claude-code-base-action

#### Additional Configurable Servers
- **Sequential Thinking** (`mcp__sequential-thinking__*`) - Enhanced reasoning capabilities
- **Filesystem** (`mcp__filesystem__*`) - Advanced file operations with unrestricted access
- **Web Search** (`mcp__web-search__*`) - Real-time web search and research
- **Memory** (`mcp__memory__*`) - Session memory for complex multi-step tasks
- **Database** (`mcp__database__*`) - Direct database operations and queries

## Usage

### 1. Manual Dispatch (Recommended for Development)

Navigate to Actions → "Custom Claude Code Base Workflow" → "Run workflow"

**Input Parameters:**
```yaml
Task Type: feature-implementation  # Choose from dropdown
Prompt: "Add a new analytics dashboard component to track quote conversion rates"
Timeout: 30                        # Minutes (1-60)
Advanced MCP: true                 # Enable all MCP servers
Branch: feature/analytics          # Target branch (optional)
Environment: development           # dev/staging/production
```

### 2. Custom Comment Triggers

Use alternative trigger phrases that bypass the `@claude` restriction:

```markdown
@claude-custom Implement user authentication with JWT tokens

@claude-enhanced Review the security implications of the new API endpoints

@claude-base Create comprehensive tests for the quote submission form
```

### 3. Scheduled Execution

The workflow automatically runs weekly (Mondays 9 AM UTC) for maintenance tasks:
- Security updates check
- Performance optimization review
- Recent changes analysis
- Documentation updates

### 4. Push-Based Triggers

Automatically triggers on pushes to:
- `development` branch
- `staging` branch
- When changes occur in `client/`, `server/`, or workflow directories

## Configuration

### Environment-Specific Settings

#### Development Environment
```yaml
Environment: development
Features:
  - Full MCP server access
  - Unrestricted tool permissions
  - Extended timeouts
  - Debug logging enabled
  - Write access to all directories
```

#### Staging Environment  
```yaml
Environment: staging
Features:
  - Production-like restrictions
  - Read-only database access
  - Moderate timeouts
  - Limited write permissions
  - Performance monitoring
```

#### Production Environment
```yaml
Environment: production
Features:
  - Maximum security restrictions
  - Read-only filesystem access
  - Conservative timeouts
  - Audit logging enabled
  - No experimental MCP servers
```

### MCP Server Configuration

#### Sequential Thinking (Advanced Reasoning)
```json
{
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
```

**Use Cases:**
- Complex architectural decisions
- Multi-step problem solving
- Code refactoring planning
- Security analysis

#### Filesystem (Enhanced File Operations)
```json
{
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
```

**Use Cases:**
- Large file operations
- Directory restructuring
- Batch file processing
- Template generation

#### Web Search (Real-time Research)
```json
{
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
```

**Use Cases:**
- Best practices research
- Dependency version checking
- Security vulnerability research
- Technology trend analysis

### Custom Environment Variables

The system provides TSG-specific environment variables:

```yaml
NODE_ENV: development
TSG_ENVIRONMENT: development
GITHUB_ACTOR: username
GITHUB_EVENT: workflow_dispatch
TASK_TYPE: feature-implementation
REPOSITORY_NAME: TSGCFO/TsgFulfillmentRedesign
BRANCH_NAME: feature/analytics
WORKSPACE_PATH: /home/runner/work/TsgFulfillmentRedesign/TsgFulfillmentRedesign
API_BASE_URL: https://api-dev.tsgfulfillment.com
DEBUG: true
LOG_LEVEL: debug
```

## Examples

### Example 1: Simple Code Analysis
```yaml
# Trigger: Manual dispatch
Task Type: simple-analysis
Prompt: "Analyze the client/src directory structure and provide insights about the React application architecture"
Timeout: 10 minutes
Advanced MCP: false
```

**Expected Output:**
- Component organization analysis
- Architecture recommendations
- Best practices assessment
- Improvement suggestions

### Example 2: Feature Implementation
```yaml
# Trigger: @claude-custom comment
Comment: "@claude-custom Implement a new QuickQuote button component for service pages"
```

**Workflow Actions:**
1. Creates reusable QuickQuoteButton component
2. Integrates with existing ServicesSection
3. Applies TSG brand styling
4. Adds responsive design
5. Writes TypeScript types
6. Creates unit tests
7. Updates documentation

### Example 3: Security Audit
```yaml
# Trigger: Scheduled (weekly)
Task Type: security-audit
Environment: production
```

**Audit Areas:**
- Vulnerability scanning
- Authentication review
- Authorization patterns
- Sensitive data exposure
- API endpoint security
- Dependency analysis

### Example 4: Performance Optimization
```yaml
# Trigger: Push to development branch
Automatic Analysis: React bundle optimization
```

**Optimization Focus:**
- Bundle size analysis
- Code splitting opportunities
- Runtime performance
- Core Web Vitals
- API response optimization

## Troubleshooting

### Common Issues

#### 1. MCP Server Timeout
```yaml
Error: MCP server 'sequential-thinking' timed out
Solution: Increase timeout in mcp_config or reduce task complexity
```

#### 2. Permission Denied
```yaml
Error: Write permission denied to file
Solution: Check file permissions and environment settings
```

#### 3. Tool Not Allowed
```yaml
Error: Tool 'Bash(npm install)' not in allowed_tools
Solution: Add specific tool to allowed_tools list or use Bash(*)
```

#### 4. Branch Not Found
```yaml
Error: Branch 'feature/new-feature' does not exist
Solution: Create branch first or use existing branch name
```

### Debugging Steps

1. **Check Workflow Logs**
   - Navigate to Actions tab
   - Find the failed workflow run
   - Examine step-by-step execution logs

2. **Validate Configuration**
   - Verify YAML syntax
   - Check secret availability
   - Confirm MCP server configuration

3. **Test with Simpler Configuration**
   - Reduce MCP servers to minimum
   - Lower timeout values
   - Use basic tool permissions

4. **Environment-Specific Issues**
   - Switch to development environment
   - Enable debug logging
   - Check environment variable values

### Performance Optimization

#### Reduce Execution Time
```yaml
# Minimal configuration for faster execution
allowed_tools: "View,GlobTool,GrepTool"
mcp_config: ""  # No MCP servers
timeout_minutes: "5"
```

#### Maximum Capabilities
```yaml
# Full configuration for complex tasks
allowed_tools: "Bash(*),View,GlobTool,GrepTool,BatchTool,mcp__*"
mcp_config: |
  {
    "mcpServers": {
      "sequential-thinking": { /* full config */ },
      "filesystem": { /* full config */ },
      "web-search": { /* full config */ },
      "memory": { /* full config */ },
      "database": { /* full config */ }
    }
  }
timeout_minutes: "60"
```

## Security Considerations

### Permissions Management

#### Development Environment
- **Full access** for rapid development
- **All tools enabled** for flexibility
- **Extended timeouts** for complex tasks
- **Debug logging** for troubleshooting

#### Production Environment
- **Read-only access** by default
- **Restricted tool set** for safety
- **Conservative timeouts** for stability
- **Audit logging** for compliance

### Secret Management

#### Required Secrets
```yaml
ANTHROPIC_API_KEY: Claude API access
P_A_T: GitHub Personal Access Token (enhanced permissions)
BRAVE_API_KEY: Web search capabilities (optional)
DATABASE_URL: Database access (if using database MCP)
```

#### Secret Security
- Use GitHub repository secrets
- Rotate keys regularly
- Monitor usage patterns
- Audit access logs

### Tool Restrictions

#### Safe Tools (Always Allowed)
```yaml
View, GlobTool, GrepTool, BatchTool
mcp__github__* (read operations)
mcp__sequential-thinking__*
```

#### Restricted Tools (Environment Dependent)
```yaml
Bash(*) - Full bash access
mcp__filesystem__* - File system modifications
mcp__database__* - Database operations
mcp__github_file_ops__* - Repository modifications
```

### Audit and Monitoring

#### Logging Configuration
```yaml
# Enable comprehensive logging
claude_env: |
  LOG_LEVEL: debug
  AUDIT_ENABLED: true
  SECURITY_MONITORING: true
```

#### Monitoring Points
- Tool usage patterns
- File modification tracking
- API endpoint access
- Error rates and types
- Execution duration trends

## Migration Guide

### From Standard Claude Code Action

#### Step 1: Assessment
1. **Identify current restrictions** affecting your workflows
2. **List required capabilities** not available in standard action
3. **Plan migration timeline** and testing approach

#### Step 2: Configuration Migration
```yaml
# Old configuration (claude-code-action)
uses: anthropics/claude-code-action@beta
with:
  anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
  github_token: ${{ secrets.GITHUB_TOKEN }}

# New configuration (claude-code-base-action)
uses: anthropics/claude-code-base-action@beta
with:
  prompt_file: '/tmp/claude-prompts/claude-prompt.txt'
  anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
  timeout_minutes: "30"
  allowed_tools: "Bash(*),View,GlobTool,GrepTool,mcp__*"
```

#### Step 3: Trigger Migration
```yaml
# Old: Comment-only triggers
if: contains(github.event.comment.body, '@claude')

# New: Multiple trigger options
on:
  workflow_dispatch:     # Manual execution
  issue_comment:         # Custom trigger phrases
  schedule:              # Automated execution
  push:                  # Branch-based triggers
```

#### Step 4: Testing Strategy
1. **Start with examples workflow** to validate configuration
2. **Test in development environment** with minimal permissions
3. **Gradually increase capabilities** as confidence builds
4. **Monitor performance and security** during transition

### Rollback Plan

If issues arise during migration:

1. **Keep existing workflows** active during transition
2. **Use branch-specific triggers** to test custom workflows
3. **Maintain parallel execution** until fully validated
4. **Document any configuration changes** for easy reversal

## Best Practices

### Workflow Design
- **Start simple** and add complexity gradually
- **Use environment-specific configurations** appropriately
- **Include comprehensive error handling**
- **Implement proper timeout management**

### Security
- **Principle of least privilege** for tool permissions
- **Environment-appropriate restrictions**
- **Regular security audits** of configurations
- **Monitor and log all operations**

### Performance  
- **Choose appropriate MCP servers** for each task
- **Optimize timeout values** based on task complexity
- **Use caching strategies** where possible
- **Monitor resource usage** and adjust accordingly

### Maintenance
- **Regular workflow testing** with example scenarios
- **Keep MCP servers updated** to latest versions
- **Review and update prompt templates** based on learnings
- **Document any customizations** for team knowledge sharing

## Support and Resources

### Internal Resources
- **Prompt Templates**: `.github/prompts/custom-claude-base-prompts.md`
- **Usage Examples**: `.github/workflows/claude-base-examples.yml`
- **TSG Guidelines**: `CLAUDE.md` (root directory)

### External Resources
- **Claude Code Base Action**: [GitHub Repository](https://github.com/anthropics/claude-code-base-action)
- **MCP Specification**: [Model Context Protocol](https://modelcontextprotocol.io/)
- **Anthropic Documentation**: [Claude API Docs](https://docs.anthropic.com/)

### Getting Help
1. **Review this documentation** and existing examples
2. **Test with simpler configurations** to isolate issues
3. **Check GitHub Actions logs** for detailed error information
4. **Create issues** in the repository for team support

## Changelog

### Version 1.0 (Initial Release)
- Complete custom claude-code-base-action implementation
- Multiple trigger mechanism support
- Advanced MCP server configurations
- Comprehensive prompt templates
- Full documentation and examples

### Future Enhancements
- Additional MCP server integrations
- Enhanced security and audit features
- Performance optimization tools
- Advanced workflow orchestration
- Custom TSG-specific MCP servers