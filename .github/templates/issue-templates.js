const fs = require('fs');

const generateIssueContent = (template, data) => {
  const { hash, author, date, message, changedFiles, linesAdded, linesDeleted, priority } = data;
  
  const priorityEmoji = {
    critical: "🚨",
    high: "⚠️", 
    medium: "📝",
    low: "📋"
  }[priority] || "📋";

  const title = `@claude ${priorityEmoji} [AUTO] ${message}`;

  const templates = {
    'seo-focused': () => `@claude Please review commit \`${hash}\` for SEO impact and provide optimization recommendations.

## SEO Impact Analysis Required

### Commit Details
- **Hash:** \`${hash}\`
- **Author:** ${author}
- **Date:** ${date}
- **Changes:** +${linesAdded}/-${linesDeleted} lines

### SEO Checklist
- [ ] **Meta Tags:** Verify title and description tags
- [ ] **Structured Data:** Validate JSON-LD schema markup
- [ ] **Sitemap:** Check XML sitemap generation
- [ ] **Robots.txt:** Ensure proper crawler directives
- [ ] **Core Web Vitals:** Monitor performance impact
- [ ] **Mobile Usability:** Test responsive behavior
- [ ] **Image SEO:** Verify alt tags and optimization
- [ ] **Internal Linking:** Check navigation structure

### Files Modified
\`\`\`
${changedFiles}
\`\`\`

### Action Items
- [ ] Run SEO audit tools
- [ ] Test search console integration
- [ ] Verify structured data with Google's tool
- [ ] Check pagespeed insights scores`,

    'security-audit': () => `@claude Please conduct a security review of commit \`${hash}\` and identify any potential vulnerabilities or security concerns.

## Security Review Required

### Security Assessment
- **Risk Level:** ${priority}
- **Commit:** \`${hash}\`
- **Author:** ${author}

### Security Checklist
- [ ] **Dependency Scan:** Check for vulnerable packages
- [ ] **Code Review:** Manual security code review
- [ ] **Authentication:** Verify auth mechanisms
- [ ] **Input Validation:** Check user input handling
- [ ] **Data Exposure:** Ensure no sensitive data leaks
- [ ] **HTTPS:** Verify secure connections
- [ ] **Headers:** Check security headers
- [ ] **Secrets:** Scan for hardcoded credentials

### Files Modified
\`\`\`
${changedFiles}
\`\`\`

### Security Tools
- [ ] Run SAST (Static Application Security Testing)
- [ ] Perform dependency vulnerability scan
- [ ] Check for secrets in code`,

    'performance-review': () => `@claude Please analyze commit \`${hash}\` for performance impact and provide optimization recommendations.

## Performance Impact Review

### Performance Analysis
- **Scope:** ${linesAdded} added, ${linesDeleted} removed lines
- **Commit:** \`${hash}\`
- **Author:** ${author}

### Performance Checklist
- [ ] **Bundle Size:** Check JavaScript bundle impact
- [ ] **Core Web Vitals:** Monitor LCP, FID, CLS
- [ ] **Image Optimization:** Verify image compression
- [ ] **Caching:** Check cache strategies
- [ ] **CDN:** Ensure proper CDN usage
- [ ] **Database:** Monitor query performance
- [ ] **Memory Usage:** Check for memory leaks
- [ ] **Load Testing:** Verify under load

### Files Modified
\`\`\`
${changedFiles}
\`\`\`

### Performance Tools
- [ ] Run Lighthouse audit
- [ ] Check WebPageTest results
- [ ] Monitor real user metrics`,

    'default': () => `@claude Please review commit \`${hash}\` and provide feedback on code quality, implementation, and any potential improvements.

## Code Review Required

### Change Summary
- **Priority:** ${priority}
- **Commit:** \`${hash}\`
- **Author:** ${author}
- **Date:** ${date}
- **Impact:** +${linesAdded}/-${linesDeleted} lines

### Review Checklist
- [ ] **Code Quality:** Review code standards compliance
- [ ] **Testing:** Ensure adequate test coverage
- [ ] **Documentation:** Update relevant documentation
- [ ] **Breaking Changes:** Document any breaking changes
- [ ] **Performance:** Check for performance regressions
- [ ] **Security:** Basic security review
- [ ] **Browser Testing:** Cross-browser compatibility

### Files Modified
\`\`\`
${changedFiles}
\`\`\`

### Next Steps
- [ ] Assign reviewer
- [ ] Schedule testing
- [ ] Update documentation`
  };

  const bodyContent = (templates[template] || templates.default)();
  
  const labels = {
    'seo-focused': 'seo,auto-generated,needs-review',
    'security-audit': 'security,auto-generated,needs-review,urgent',
    'performance-review': 'performance,auto-generated,needs-review',
    'default': 'review-needed,auto-generated'
  }[template] || 'review-needed,auto-generated';

  return {
    title,
    body: bodyContent,
    labels: labels.split(',')
  };
};

module.exports = { generateIssueContent };