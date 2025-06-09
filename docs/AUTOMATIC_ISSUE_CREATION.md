# Automatic GitHub Issue Creation

This system automatically creates GitHub issues based on commit patterns, file changes, and repository activity to ensure proper code review and quality assurance.

## Features

- **Smart Triggering**: Creates issues based on commit messages, file patterns, and change magnitude
- **Multiple Templates**: Different issue templates for various scenarios (SEO, security, performance, etc.)
- **Priority Classification**: Automatically assigns priority levels based on change impact
- **Customizable Rules**: Fully configurable through JSON configuration
- **Team Integration**: Supports Slack, email, and project management tool notifications

## Setup

### 1. Enable Workflow

The workflow files are already created in `.github/workflows/`:
- `auto-issue-creation.yml` - Basic automatic issue creation
- `smart-issue-automation.yml` - Advanced smart automation with templates

### 2. Configure Permissions

Ensure your repository has the following permissions enabled:
- Issues: Write
- Contents: Read
- Pull Requests: Write (if using PR features)

### 3. Customize Configuration

Edit `.github/issue-automation-config.json` to customize behavior:

```json
{
  "enabled": true,
  "settings": {
    "minChangedFiles": 1,
    "minLinesChanged": 10,
    "excludeBranches": ["dependabot/*", "renovate/*"],
    "autoAssign": true
  }
}
```

## Trigger Patterns

### Commit Message Patterns

Issues are automatically created for commits matching these patterns:

- `feat:` or `feature:` - Feature implementation
- `fix:` or `bugfix:` - Bug fixes
- `security:` or `sec:` - Security-related changes
- `seo:` or `SEO:` - SEO optimization
- `perf:` or `performance:` - Performance improvements
- `breaking:` or `BREAKING:` - Breaking changes

### File Pattern Triggers

Specific file changes trigger specialized issues:

- `package.json`, `yarn.lock` - Dependency updates
- `Dockerfile`, `docker-compose.yml` - Infrastructure changes
- `*.yml`, `*.yaml` - CI/CD configuration
- `sitemap.*`, `robots.txt` - SEO-related files
- `*.test.*`, `*.spec.*` - Testing files

### Size Thresholds

Large code changes automatically trigger review issues:

- **Major Change**: 200+ lines added or 100+ lines deleted
- **Massive Change**: 500+ lines added or 300+ lines deleted

## Issue Templates

### Standard Template
Basic code review checklist for general changes.

### SEO-Focused Template
Specialized checklist for SEO impact assessment:
- Meta tag verification
- Structured data validation
- Sitemap checking
- Core Web Vitals monitoring

### Security Audit Template
Comprehensive security review checklist:
- Dependency vulnerability scan
- Authentication mechanism review
- Input validation check
- Secrets scanning

### Performance Review Template
Performance impact assessment:
- Bundle size analysis
- Core Web Vitals monitoring
- Database query optimization
- Load testing verification

## Customization Examples

### Adding Custom Triggers

Edit the configuration to add new patterns:

```json
{
  "triggers": {
    "commitPatterns": {
      "docs|documentation": {
        "priority": "low",
        "template": "documentation",
        "labels": ["documentation", "auto-generated"]
      }
    }
  }
}
```

### Custom Issue Template

Add new templates to the configuration:

```json
{
  "templates": {
    "custom-review": {
      "title": "🔧 [AUTO] Custom Review: {message}",
      "sections": ["summary", "custom-checklist", "validation"]
    }
  }
}
```

### Branch Exclusions

Exclude specific branches from automation:

```json
{
  "settings": {
    "excludeBranches": [
      "dependabot/*",
      "renovate/*", 
      "temp/*",
      "draft/*"
    ]
  }
}
```

## Manual Triggering

Force issue creation manually using workflow dispatch:

1. Go to Actions tab in GitHub
2. Select "Smart Issue Automation"
3. Click "Run workflow"
4. Choose options:
   - Force create: `true`
   - Template: Select desired template

## Integration Options

### Slack Notifications

Configure Slack webhooks for high-priority issues:

```json
{
  "notifications": {
    "slack": {
      "enabled": true,
      "webhook": "YOUR_SLACK_WEBHOOK_URL",
      "channels": {
        "critical": "#alerts",
        "high": "#development"
      }
    }
  }
}
```

### Project Management Tools

Connect with Jira or Linear:

```json
{
  "integrations": {
    "jira": {
      "enabled": true,
      "createTickets": true,
      "projectKey": "DEV"
    }
  }
}
```

## Best Practices

### Commit Message Format

Use conventional commit format for better automation:

```
feat: add user authentication system
fix: resolve login session timeout issue
security: update dependencies with vulnerabilities
seo: optimize meta tags and structured data
perf: improve database query performance
```

### Code Review Workflow

1. Commit triggers automatic issue creation
2. Review the generated checklist
3. Complete applicable items
4. Assign team members for specialized reviews
5. Close issue when review is complete

### Issue Management

- Use labels for filtering and organization
- Set up GitHub Projects for tracking
- Configure milestone automation for releases
- Enable issue templates for manual creation

## Troubleshooting

### Issues Not Creating

Check these common issues:

1. **Permissions**: Ensure workflow has Issues: Write permission
2. **Branch Filters**: Verify branch isn't in exclusion list
3. **Minimum Thresholds**: Check if changes meet minimum requirements
4. **Configuration**: Validate JSON syntax in config file

### Duplicate Issues

Prevent duplicates by:

1. Adjusting trigger sensitivity
2. Using more specific commit patterns
3. Implementing issue deduplication logic
4. Setting appropriate time windows

### Performance Impact

Optimize workflow performance:

1. Limit file analysis depth
2. Use efficient commit message parsing
3. Cache configuration between runs
4. Implement early exit conditions

## Security Considerations

- Never include sensitive data in issue bodies
- Use secrets for webhook URLs and API keys
- Restrict workflow permissions to minimum required
- Regular audit of generated issues for data exposure

## Example Workflow Output

When you commit with message `feat: implement user dashboard`, the system creates:

**Issue Title**: ✨ [AUTO] Feature Implementation: implement user dashboard

**Issue Body**:
- Commit details and file changes
- Feature-specific checklist
- Testing requirements
- Documentation needs
- Performance considerations

**Labels**: enhancement, auto-generated, needs-review

**Assignee**: Commit author

This automation ensures consistent code review processes and helps maintain high code quality standards across your repository.