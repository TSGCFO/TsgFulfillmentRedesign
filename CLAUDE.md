# TSG Fulfillment Services Content Standards

## Brand Voice
- Professional yet approachable tone
- Customer-centric language focusing on solutions
- Clear, concise communication without jargon
- Empathetic and supportive messaging

## Content Guidelines
- Use active voice for clarity and engagement
- Avoid unsubstantiated superlatives
- Include specific examples and data points
- Maintain consistent terminology:
  - "fulfillment center" not "warehouse"
  - "team member" not "employee"
  - "client" not "customer" for B2B

## SEO Requirements
- Primary keywords: "fulfillment services", "order fulfillment", "3PL"
- Meta descriptions: 150-160 characters, include primary keyword 
- Heading structure: One H1 per page, logical H2-H6 hierarchy 
- Image alt text: Descriptive, include relevant keywords naturally 

## Technical Content
- Error messages: User-friendly, actionable, include error codes
- Loading states: Informative messages, estimated wait times
- Form labels: Clear, accessible, include helper text
- Success messages: Positive reinforcement, next steps

## MCP (Model Context Protocol) Configuration

This project supports Claude Code as an MCP server for enhanced development capabilities.

### Quick Commands
- `claude mcp serve` - Start Claude Code as MCP server
- `./scripts/start-mcp-server.sh` - Start with project-specific configuration
- `./scripts/start-mcp-server.sh production` - Start in read-only mode

### Documentation
- [MCP Server Guide](./MCP_SERVER_GUIDE.md) - Comprehensive setup and configuration
- [Quick Start Guide](./MCP_QUICK_START.md) - 5-minute setup
- [Integration Examples](./MCP_INTEGRATION_EXAMPLES.md) - Practical usage examples

### Security Notes
- MCP server runs with appropriate access controls
- Production mode uses read-only access by default
- Sensitive directories are restricted (.env, node_modules, .git)