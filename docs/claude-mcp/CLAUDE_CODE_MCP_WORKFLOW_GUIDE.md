# Claude Code MCP Configuration Guide for GitHub Actions

## Important Clarification

**Claude Code cannot run as both the main GitHub Action process AND as an MCP server simultaneously.** However, Claude Code Actions already has robust MCP integration capabilities built-in.

## Current MCP Architecture in Claude Code Actions

Claude Code Actions automatically provides:

1. **Built-in MCP Servers**:
   - GitHub MCP server for API operations
   - File operations server for advanced file manipulation

2. **Custom MCP Server Support**: Via the `mcp_config` parameter

## How to Configure Additional MCP Servers

### Option 1: Basic MCP Configuration

Add the `mcp_config` parameter to your workflow:

```yaml
name: Claude Code with MCP
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]

jobs:
  claude:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'issues' && (contains(github.event.issue.body, '@claude') || contains(github.event.issue.title, '@claude')))
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Run Claude Code with MCP
        uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          allowed_tools: Bash(*),Bash(git status),Bash(git log),Bash(git show),Bash(git blame),Bash(git reflog),Bash(git stash list),Bash(git ls-files),Bash(git branch),Bash(git tag),Bash(git diff),View,GlobTool,GrepTool,BatchTool,mcp__github__*,mcp__sequential-thinking__*,mcp__filesystem__*
          mcp_config: |
            {
              "mcpServers": {
                "sequential-thinking": {
                  "command": "npx",
                  "args": [
                    "-y",
                    "@modelcontextprotocol/server-sequential-thinking"
                  ]
                },
                "filesystem": {
                  "command": "npx", 
                  "args": [
                    "-y",
                    "@modelcontextprotocol/server-filesystem"
                  ],
                  "env": {
                    "ALLOWED_DIRECTORIES": "/home/runner/work/TsgFulfillmentRedesign/TsgFulfillmentRedesign"
                  }
                }
              }
            }
```

### Option 2: Enhanced MCP Configuration with Custom Servers

```yaml
      - name: Run Claude Code with Enhanced MCP
        uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          allowed_tools: Bash(*),Bash(git status),Bash(git log),Bash(git show),Bash(git blame),Bash(git reflog),Bash(git stash list),Bash(git ls-files),Bash(git branch),Bash(git tag),Bash(git diff),View,GlobTool,GrepTool,BatchTool,mcp__github__*,mcp__sequential-thinking__*,mcp__filesystem__*,mcp__database__*,mcp__web-search__*,mcp__github_file_ops__*
          mcp_config: |
            {
              "mcpServers": {
                "sequential-thinking": {
                  "command": "npx",
                  "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
                },
                "filesystem": {
                  "command": "npx",
                  "args": ["-y", "@modelcontextprotocol/server-filesystem"],
                  "env": {
                    "ALLOWED_DIRECTORIES": "/home/runner/work/TsgFulfillmentRedesign/TsgFulfillmentRedesign/client,/home/runner/work/TsgFulfillmentRedesign/TsgFulfillmentRedesign/server,/home/runner/work/TsgFulfillmentRedesign/TsgFulfillmentRedesign/shared"
                  }
                },
                "database": {
                  "command": "npx",
                  "args": ["-y", "@modelcontextprotocol/server-postgres"],
                  "env": {
                    "DATABASE_URL": "${{ secrets.DATABASE_URL }}"
                  }
                }
              }
            }
```

## Key Configuration Elements

### 1. Tool Allowlisting

MCP tools must be explicitly allowed in the `allowed_tools` parameter:

- `mcp__server-name__tool-name` - for specific tools
- `mcp__server-name__*` - for all tools from a server

### 2. Security Considerations

- Use GitHub Secrets for sensitive data (API keys, database URLs)
- Restrict filesystem access to project directories only
- Limit MCP server capabilities based on your needs

### 3. Available MCP Servers

Popular MCP servers you can add:

- `@modelcontextprotocol/server-sequential-thinking` - Enhanced reasoning
- `@modelcontextprotocol/server-filesystem` - Advanced file operations  
- `@modelcontextprotocol/server-postgres` - Database operations
- `@modelcontextprotocol/server-web-search` - Web search capabilities

## Testing Your MCP Configuration

After implementing the configuration, test with these commands:

```txt
@claude /mcp
@claude What MCP tools do you have access to?
@claude Use sequential thinking to analyze our project structure
@claude Use the filesystem server to explore our codebase
```

## Benefits of MCP Integration

1. **Enhanced Reasoning**: Sequential thinking for complex problems
2. **Advanced File Operations**: More sophisticated file manipulation
3. **Database Integration**: Direct database queries and analysis
4. **Extensibility**: Easy to add more capabilities as needed

## Troubleshooting

### Common Issues

1. **Tool Not Allowed**: Add the MCP tool to `allowed_tools`
2. **Server Failed to Start**: Check the server configuration and dependencies
3. **Permission Denied**: Ensure proper GitHub Action permissions
4. **Environment Variables**: Use GitHub Secrets for sensitive data

### Debug Commands

```txt
@claude /mcp status
@claude What MCP servers are running?
@claude Test the sequential thinking capability
```

## Alternative: External MCP Server Setup

If you specifically need Claude Code's capabilities exposed as an MCP server to external clients, you would need to:

1. Create a separate MCP server that wraps Claude Code functionality
2. Deploy it as a standalone service
3. Configure other applications to connect to it

This is a more complex setup that goes beyond the GitHub Actions workflow scope.

## Conclusion

While Claude Code cannot run as both the main process AND an MCP server simultaneously, the built-in MCP configuration provides powerful capabilities to extend Claude's functionality within GitHub Actions workflows.

The recommended approach is to use the `mcp_config` parameter to add specialized MCP servers that complement Claude Code's existing capabilities.
