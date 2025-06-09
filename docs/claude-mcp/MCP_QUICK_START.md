# Quick Start: Claude Code MCP Server

## 5-Minute Setup Guide

This quick start guide gets you up and running with Claude Code as an MCP server in under 5 minutes.

## Step 1: Start the MCP Server

```bash
# Navigate to your TSG Fulfillment project
cd /path/to/TsgFulfillmentRedesign

# Start Claude Code as MCP server
claude mcp serve
```

You should see output like:
```
Claude Code MCP Server starting...
Listening on port 3000
Ready for connections
```

## Step 2: Configure Claude Desktop

1. Open Claude Desktop
2. Go to Settings → MCP Servers
3. Add this configuration:

```json
{
  "command": "claude",
  "args": ["mcp", "serve"],
  "env": {}
}
```

## Step 3: Test the Connection

In Claude Desktop, try these commands:

```
> What files are in this project?
> Show me the package.json file
> Analyze the project structure
```

## Common Commands

### File Operations
```
> Read the README.md file
> List all TypeScript files
> Show me the client/src directory structure
```

### Code Analysis
```
> Review the main React components
> Check for TypeScript errors
> Analyze the server routes
```

### Development Tasks
```
> Run the build process
> Check for lint errors
> Show me recent git commits
```

## Troubleshooting

**Server won't start?**
```bash
# Check if Claude Code is installed
claude --version

# Try with verbose output
claude mcp serve --verbose
```

**Client can't connect?**
```bash
# Verify server is running
ps aux | grep "claude mcp"

# Check the port
netstat -tlnp | grep 3000
```

## Next Steps

- Read the full [MCP Server Guide](./MCP_SERVER_GUIDE.md)
- Configure project-specific settings
- Set up team access and security

---

Need help? Check the [troubleshooting section](./MCP_SERVER_GUIDE.md#troubleshooting) in the full guide.