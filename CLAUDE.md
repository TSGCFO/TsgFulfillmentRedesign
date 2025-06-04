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

## MCP Configuration

This project supports enhanced Claude Code capabilities via MCP (Model Context Protocol) servers:

### Available MCP Servers:
- **Sequential Thinking**: Enhanced reasoning for complex architectural decisions
- **Filesystem**: Secure file operations with directory restrictions
- **GitHub**: Advanced GitHub API operations

### Quick Commands:
- `@claude /mcp` - Check MCP status
- `@claude What MCP tools do you have access to?` - List available tools
- `@claude Use sequential thinking to analyze...` - Enhanced reasoning
- `@claude Use filesystem tools to explore...` - Advanced file ops

### Configuration Files:
- `CLAUDE_CODE_MCP_WORKFLOW_GUIDE.md` - Complete setup guide
- `MCP_TESTING_GUIDE.md` - Testing and troubleshooting
- `.github/workflows/claude-mcp-example.yml` - Example workflow