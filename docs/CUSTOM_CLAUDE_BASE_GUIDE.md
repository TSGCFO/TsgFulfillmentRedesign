# Custom Claude Code Base Workflow Guide

This guide explains how to use the custom claude-code-base-action workflows that bypass the restrictions of the standard claude-code-action.

## Overview

The custom workflows provide:
- **Unrestricted filesystem access** - No directory limitations
- **Full tool access** - All Bash commands, GitHub API, MCP servers
- **Extended permissions** - Complete repository, deployment, and organizational access
- **Advanced MCP servers** - Sequential thinking, filesystem, web search, memory, database
- **Flexible triggers** - Manual dispatch, custom phrases, scheduled execution, push-based
- **Custom environment variables** - Project-specific configuration

## Available Workflows

### 1. Main Custom Workflow (`claude-code-base-custom.yml`)

**File**: `.github/workflows/claude-code-base-custom.yml`

**Trigger Methods**:
- **Manual Dispatch**: GitHub Actions UI with custom inputs
- **Custom Comment Triggers**: `@claude-custom` in issue comments
- **PR Review Triggers**: `@claude-enhanced` in PR review comments  
- **Scheduled Execution**: Weekly Monday 9 AM UTC
- **Push Triggers**: Automatic on development/staging branch pushes

**Key Features**:
- Maximum GitHub permissions (contents, PRs, issues, actions, deployments, etc.)
- Comprehensive MCP server configuration
- Custom context gathering and prompt building
- Post-execution testing and validation
- Execution artifact archiving

### 2. Usage Examples (`claude-base-examples.yml`)

**File**: `.github/workflows/claude-base-examples.yml`

**Demonstrates**:
- Simple code analysis
- PR code review with context
- Feature implementation with full access
- Security audit with web search
- Documentation updates with memory
- Bug investigation and fixing

## Usage Instructions

### Manual Dispatch (Recommended for Testing)

1. Go to **Actions** tab in GitHub
2. Select **"Custom Claude Code Base Workflow"**
3. Click **"Run workflow"**
4. Fill in the parameters:
   - **Task Type**: Choose from predefined options
   - **Task Instructions**: Describe what you want Claude to do
   - **Target Files**: Optional file/directory focus
   - **Max Turns**: Conversation limit (default: 15)
   - **Enable Filesystem Write**: Allow file modifications
   - **Enable Web Search**: Enable web search capabilities

**Example Manual Dispatch**:
```
Task Type: feature-implementation
Task Instructions: Create a new analytics dashboard component with charts showing user engagement metrics. Include TypeScript types, comprehensive tests, and Storybook stories.
Target Files: client/src/components/analytics/
Max Turns: 20
Enable Filesystem Write: ✓
Enable Web Search: ✓
```

### Comment-Based Triggers

#### Issue Comments (`@claude-custom`)
```
@claude-custom Analyze the entire codebase for performance bottlenecks and provide optimization recommendations. Focus on database queries, API calls, and frontend rendering.
```

#### PR Review Comments (`@claude-enhanced`)
```
@claude-enhanced Review this payment processing implementation for security vulnerabilities. Check for proper input validation, encryption, and PCI compliance.
```

### Push-Based Triggers

Automatically triggered when pushing to `development` or `staging` branches with changes to:
- `**.md` files
- `**.json` files  
- `**.yml`/`**.yaml` files

### Scheduled Execution

Runs weekly for automated analysis:
- Code quality assessment
- Security vulnerability scanning
- Performance optimization opportunities
- Documentation gap analysis

## Configuration Options

### MCP Server Configuration

The workflow includes these MCP servers by default:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "timeout": 300000,
      "env": {
        "MAX_DEPTH": "20",
        "ENABLE_REFLECTION": "true"
      }
    },
    "filesystem": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "timeout": 120000,
      "env": {
        "ALLOWED_DIRECTORIES": "/github/workspace",
        "ENABLE_WRITE": "true",
        "MAX_FILE_SIZE": "50MB"
      }
    },
    "web-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-web-search"], 
      "timeout": 60000,
      "env": {
        "BRAVE_API_KEY": "${{ secrets.BRAVE_API_KEY }}",
        "MAX_RESULTS": "20"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "timeout": 30000,
      "env": {
        "MEMORY_BANK_SIZE": "500",
        "PERSISTENCE": "session"
      }
    }
  }
}
```

### Environment Variables

The workflow sets these custom environment variables:

```yaml
claude_env: |
  ENVIRONMENT: development
  TSG_BRAND_MODE: enabled
  ADVANCED_FEATURES: true
  FILESYSTEM_UNRESTRICTED: true
  WEB_SEARCH_ENABLED: ${{ github.event.inputs.enable_web_search }}
  TASK_TYPE: ${{ needs.detect-trigger.outputs.task_type }}
  TRIGGER_SOURCE: ${{ needs.detect-trigger.outputs.custom_trigger }}
  DEBUG_MODE: true
```

### Tool Access

Full unrestricted tool access:

```yaml
allowed_tools: |
  Bash(*),
  View,GlobTool,GrepTool,BatchTool,
  mcp__github__*,
  mcp__github_file_ops__*,
  mcp__sequential-thinking__*,
  mcp__filesystem__*,
  mcp__web-search__*,
  mcp__memory__*
```

## Comparison: Standard vs Custom Workflow

| Feature | Standard claude-code-action | Custom claude-code-base |
|---------|----------------------------|-------------------------|
| **Filesystem Access** | Limited to specific directories | Full workspace access |
| **Tool Restrictions** | Filtered Bash commands only | Unrestricted tool access |
| **Triggers** | @claude comments only | Multiple trigger methods |
| **Permissions** | Minimal GitHub permissions | Maximum permissions |
| **Timeouts** | 30-60 minutes standard | Configurable up to 60+ minutes |
| **MCP Servers** | Basic configuration | Advanced with custom env vars |
| **Environment Variables** | Limited configuration | Full custom environment |
| **Context Gathering** | Fixed patterns | Custom context building |
| **Execution Control** | Linear workflow | Flexible multi-stage execution |

## Security Considerations

⚠️ **Important Security Notes**:

1. **High Privilege Access**: Custom workflows run with maximum permissions
2. **Filesystem Write Access**: Can modify any file in the repository
3. **Network Access**: Can make external API calls and web searches
4. **Secrets Access**: Has access to all repository secrets
5. **Deployment Permissions**: Can trigger deployments and releases

**Recommended Safety Measures**:
- Test workflows on feature branches first
- Review execution logs carefully
- Monitor for unexpected changes
- Use manual dispatch for sensitive operations
- Implement additional approval workflows for production

## Troubleshooting

### Common Issues

**1. Workflow Not Triggering**
- Check trigger conditions in workflow file
- Verify custom trigger phrases are exact matches
- Ensure required secrets are configured

**2. MCP Server Timeouts**
- Increase timeout values in mcp_config
- Check server installation and dependencies
- Verify environment variables are correct

**3. Permission Errors**
- Ensure workflow has required permissions
- Check if custom PAT token is configured
- Verify repository settings allow Actions

**4. Execution Failures**
- Review execution logs in Actions tab
- Check for missing dependencies or setup steps
- Validate prompt format and requirements

### Debug Mode

Enable debug mode by setting:
```yaml
claude_env: |
  DEBUG_MODE: true
  VERBOSE_LOGGING: true
```

This provides:
- Detailed execution logging
- Step-by-step progress tracking
- Enhanced error reporting
- Context information display

## Best Practices

### Prompt Engineering
- Be specific about requirements and constraints
- Include expected output format
- Provide context about the codebase
- Reference TSG brand guidelines when relevant
- Set clear success criteria

### Resource Management
- Set appropriate timeout limits
- Use targeted file/directory scope when possible
- Limit conversation turns for routine tasks
- Monitor execution time and costs

### Quality Assurance
- Include testing requirements in prompts
- Request code review and validation
- Specify documentation updates needed
- Ask for error handling and edge cases

### Maintenance
- Regularly review and update workflows
- Monitor execution logs for issues
- Update MCP server configurations
- Keep prompt templates current

## Example Use Cases

### 1. Large Feature Implementation
```yaml
Task Type: feature-implementation
Instructions: |
  Implement a complete user authentication system including:
  - JWT token-based authentication
  - User registration and login forms
  - Password reset functionality
  - Role-based access control
  - Session management
  - Security middleware
  - Comprehensive test suite
```

### 2. Comprehensive Security Audit
```yaml
Task Type: security-audit
Instructions: |
  Conduct a full security audit covering:
  - OWASP Top 10 vulnerabilities
  - Authentication and authorization systems
  - Data encryption and storage
  - API security and rate limiting
  - Input validation and sanitization
  - Dependency vulnerability scanning
```

### 3. Performance Optimization
```yaml
Task Type: general
Instructions: |
  Analyze and optimize application performance:
  - Database query optimization
  - Frontend bundle size reduction
  - API response time improvements
  - Memory usage optimization
  - Caching strategy implementation
  - Performance monitoring setup
```

### 4. Documentation Overhaul
```yaml
Task Type: documentation
Instructions: |
  Complete documentation update including:
  - API documentation with examples
  - Component library documentation
  - Developer setup guide
  - Deployment procedures
  - Troubleshooting guides
  - Architecture overview
```

## Advanced Configuration

### Custom MCP Server Configuration

Create custom MCP configuration files:

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${{ secrets.DATABASE_URL }}",
        "POOL_SIZE": "10",
        "QUERY_TIMEOUT": "30000"
      },
      "timeout": 60000
    },
    "custom-tools": {
      "command": "node",
      "args": ["./custom-mcp-server.js"],
      "env": {
        "API_KEY": "${{ secrets.CUSTOM_API_KEY }}"
      },
      "timeout": 30000
    }
  }
}
```

### Branch-Specific Configuration

Configure different behavior per branch:

```yaml
- name: Set environment based on branch
  run: |
    if [[ "${{ github.ref_name }}" == "main" ]]; then
      echo "ENVIRONMENT=production" >> $GITHUB_ENV
      echo "SAFETY_MODE=strict" >> $GITHUB_ENV
    elif [[ "${{ github.ref_name }}" == "staging" ]]; then
      echo "ENVIRONMENT=staging" >> $GITHUB_ENV
      echo "SAFETY_MODE=moderate" >> $GITHUB_ENV
    else
      echo "ENVIRONMENT=development" >> $GITHUB_ENV
      echo "SAFETY_MODE=permissive" >> $GITHUB_ENV
    fi
```

### Custom Notification Integration

Add Slack or Teams notifications:

```yaml
- name: Notify on completion
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: |
      Claude Code Base execution completed
      Status: ${{ steps.claude-execution.outputs.conclusion }}
      Branch: ${{ github.ref_name }}
      Trigger: ${{ needs.detect-trigger.outputs.custom_trigger }}
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Support and Resources

- **Workflow Files**: `.github/workflows/claude-code-base-custom.yml`
- **Prompt Templates**: `.github/prompts/custom-claude-base-prompts.md`
- **Usage Examples**: `.github/workflows/claude-base-examples.yml`
- **Execution Logs**: Available in GitHub Actions artifacts
- **Claude Code Documentation**: [https://docs.anthropic.com/claude-code](https://docs.anthropic.com/claude-code)

For issues or questions:
1. Check execution logs in GitHub Actions
2. Review this documentation
3. Test with manual dispatch first
4. Create an issue in the repository for support