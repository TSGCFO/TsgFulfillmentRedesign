# MCP Testing Guide for Claude Code Actions

## Quick Testing Commands

After implementing MCP configuration in your workflow, use these commands to test the functionality:

### 1. Check MCP Status
```
@claude /mcp
```
Shows all available MCP servers and their status.

### 2. List Available Tools
```
@claude What MCP tools do you have access to?
```
Gets a complete list of MCP tools and capabilities.

### 3. Test Sequential Thinking
```
@claude Use sequential thinking to analyze our TSG Fulfillment project architecture
```
Tests the enhanced reasoning capabilities.

### 4. Test Filesystem Operations
```
@claude Use the filesystem server to explore our client directory structure
```
Tests advanced file operations with security restrictions.

### 5. Complex Analysis
```
@claude Think deeply about how to improve our React component architecture, then use the filesystem tools to implement the changes
```
Combines multiple MCP capabilities for complex tasks.

## Expected Behavior

### With MCP Configuration:
- ✅ Enhanced reasoning capabilities via sequential thinking
- ✅ Advanced file operations with directory restrictions
- ✅ More sophisticated code analysis
- ✅ Better architectural recommendations

### Without MCP Configuration:
- ⚠️ Basic Claude Code functionality only
- ⚠️ Standard file operations
- ⚠️ No enhanced reasoning tools

## Troubleshooting

### If MCP tools aren't working:

1. **Check allowed_tools**: Ensure MCP tools are listed in `allowed_tools`
2. **Verify mcp_config**: Check JSON syntax in `mcp_config`
3. **Review permissions**: Ensure workflow has required permissions
4. **Check server installation**: NPX should install MCP servers automatically

### Debug Commands:
```
@claude /mcp status
@claude Show me the current MCP configuration
@claude Test if sequential thinking is working
```

## Implementation Status Checklist

- [ ] Updated workflow with `mcp_config` parameter
- [ ] Added MCP tools to `allowed_tools`
- [ ] Tested basic MCP functionality
- [ ] Verified sequential thinking works
- [ ] Confirmed filesystem operations are secure
- [ ] Documented team usage guidelines

## Security Notes

- Filesystem access is restricted to specified directories only
- No sensitive data is included in MCP configuration
- All API keys and secrets use GitHub Secrets
- MCP servers run in isolated environment within GitHub Actions

## Performance Impact

- Minimal performance impact during action startup
- MCP servers are installed on-demand via NPX
- No persistent state between workflow runs
- Clean environment for each execution