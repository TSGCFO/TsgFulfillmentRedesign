# Claude Code MCP Server Configuration Guide

## Overview

This guide provides comprehensive instructions for configuring Claude Code as a Model Context Protocol (MCP) server in your TSG Fulfillment project. MCP allows Claude Code to expose its tools and capabilities to other applications, enabling powerful integrations.

## What is Claude Code as an MCP Server?

When Claude Code runs as an MCP server, it exposes its built-in tools (View, Edit, LS, Bash, etc.) to other MCP clients like Claude Desktop, enabling those clients to perform file operations, code analysis, and system commands through Claude Code's interface.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Basic Setup](#basic-setup)
- [Client Configuration](#client-configuration)
- [Use Cases](#use-cases)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Prerequisites

Before setting up Claude Code as an MCP server, ensure you have:

1. **Claude Code installed**: Latest version with MCP support
2. **MCP Client**: Such as Claude Desktop or another MCP-compatible application
3. **Project Access**: Appropriate permissions for your project directory
4. **Network Configuration**: Ensure the client can communicate with the server

## Basic Setup

### 1. Start Claude Code as MCP Server

```bash
# Navigate to your project directory
cd /path/to/TsgFulfillmentRedesign

# Start Claude Code as an MCP server
claude mcp serve
```

**What this does:**
- Starts Claude Code in MCP server mode
- Exposes Claude's tools via MCP protocol
- Listens for connections from MCP clients
- Provides access to file operations within the project directory

### 2. Server Options

```bash
# Start with specific configuration
claude mcp serve --port 3000

# Start with verbose logging
claude mcp serve --verbose

# Start with restricted access
claude mcp serve --read-only
```

## Client Configuration

### Claude Desktop Configuration

To connect Claude Desktop to your Claude Code MCP server:

1. **Open Claude Desktop Settings**
2. **Navigate to MCP Configuration**
3. **Add Server Configuration:**

```json
{
  "mcpServers": {
    "claude-code-server": {
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {}
    }
  }
}
```

### Alternative Configuration Methods

#### Method 1: Local Development
```json
{
  "mcpServers": {
    "tsg-fulfillment-dev": {
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {
        "PROJECT_PATH": "/path/to/TsgFulfillmentRedesign"
      }
    }
  }
}
```

#### Method 2: Production Environment
```json
{
  "mcpServers": {
    "tsg-fulfillment-prod": {
      "command": "claude",
      "args": ["mcp", "serve", "--read-only"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Use Cases

### 1. Code Analysis from Claude Desktop

Once configured, you can use Claude Desktop to:

```
# Analyze project structure
> What's the architecture of this React application?

# Review specific files
> Review the security implementation in server/routes.ts

# Check for issues
> Are there any TypeScript errors in the client directory?
```

### 2. Cross-Platform Development

```
# From any MCP client
> Read the package.json and suggest dependency updates

# File operations
> Create a new component file based on the existing pattern

# Testing assistance
> Run the test suite and analyze any failures
```

### 3. Documentation Generation

```
# Generate documentation
> Create API documentation based on the route definitions

# Update README
> Update the README with current project structure
```

## Security Considerations

### Important Security Notes

⚠️ **Warning**: Claude Code MCP server provides access to your file system and can execute commands. Only use with trusted MCP clients.

### Best Practices

1. **Directory Restrictions**
   ```bash
   # Run server with restricted access to specific directories
   claude mcp serve --restrict-to client,server,shared,docs
   ```

2. **Read-Only Mode**
   ```bash
   # For analysis-only scenarios
   claude mcp serve --read-only
   ```

3. **Environment Variables**
   ```json
   {
     "env": {
       "CLAUDE_MCP_RESTRICTED": "true",
       "CLAUDE_MCP_NO_EXEC": "true"
     }
   }
   ```

4. **Network Security**
   - Only expose to localhost by default
   - Use authentication when available
   - Monitor client connections

### TSG Fulfillment Specific Security

For your fulfillment services project:

- **Client Data Protection**: Ensure no sensitive client information is exposed
- **Database Access**: Restrict database connection strings and credentials
- **API Keys**: Keep Supabase and other API keys secure
- **Business Logic**: Protect proprietary fulfillment algorithms

## Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if server is running
ps aux | grep "claude mcp serve"

# Restart server with verbose logging
claude mcp serve --verbose
```

#### 2. Permission Denied
```bash
# Check directory permissions
ls -la /path/to/TsgFulfillmentRedesign

# Run with appropriate user permissions
sudo claude mcp serve  # Use with caution
```

#### 3. Client Can't Find Server
```bash
# Verify server is listening
netstat -tlnp | grep claude

# Check client configuration
cat ~/.config/claude-desktop/claude_desktop_config.json
```

### TSG Fulfillment Specific Issues

#### Node.js Dependencies
```bash
# Ensure dependencies are installed
cd /path/to/TsgFulfillmentRedesign
npm install

# Check for missing dependencies
npm audit
```

#### Database Connection
```bash
# Verify Supabase connection
npm run db:check  # If you have this script

# Check environment variables
echo $SUPABASE_URL
```

### Debugging Commands

```bash
# Test MCP server manually
claude mcp serve --test

# Check server status
claude mcp status

# View server logs
tail -f ~/.claude/mcp-server.log
```

## Advanced Configuration

### Custom Environment Setup

Create a dedicated MCP configuration for your TSG Fulfillment project:

```json
{
  "mcpServers": {
    "tsg-fulfillment": {
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {
        "NODE_ENV": "development",
        "PROJECT_NAME": "TSG Fulfillment",
        "ALLOWED_OPERATIONS": "read,write,analyze",
        "RESTRICTED_PATHS": "node_modules,.git,.env"
      }
    }
  }
}
```

### Integration with CI/CD

For GitHub Actions integration:

```yaml
# .github/workflows/mcp-server.yml
name: MCP Server Setup
on: [push, pull_request]

jobs:
  mcp-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Claude Code MCP Server
        run: |
          claude mcp serve --test
          # Your test commands here
```

### Project-Specific Tools

For TSG Fulfillment development:

```bash
# Start server with project-specific tools
claude mcp serve --tools "fulfillment,inventory,shipping"

# Custom command aliases
alias tsg-mcp="claude mcp serve --project=tsg-fulfillment"
```

## Best Practices for TSG Fulfillment

### 1. Development Workflow
- Use MCP server for code reviews and analysis
- Integrate with your existing development tools
- Maintain separation between development and production environments

### 2. Team Collaboration
- Share MCP configurations via `.mcp.json` in your repository
- Document team-specific MCP usage patterns
- Establish security guidelines for MCP usage

### 3. Performance Optimization
- Monitor MCP server resource usage
- Use appropriate caching strategies
- Configure timeout settings for long-running operations

## Next Steps

1. **Test the Configuration**: Start with basic file operations
2. **Integrate with Workflow**: Add MCP to your development process
3. **Security Review**: Ensure all security considerations are addressed
4. **Team Training**: Document usage patterns for your team
5. **Monitor Usage**: Track MCP server performance and usage

## Support and Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/introduction)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [TSG Fulfillment Project README](./README.md)
- [Security Guidelines](./SECURITY.md)

---

*This guide is part of the TSG Fulfillment Services project documentation. For questions or issues, please refer to the project's issue tracker.*