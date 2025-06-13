#!/bin/bash
set -e

# Generate issue content based on template
TEMPLATE="$1"
HASH="$2"
AUTHOR="$3"
DATE="$4"
MESSAGE="$5"
CHANGED_FILES="$6"
LINES_ADDED="$7"
LINES_DELETED="$8"
PRIORITY="$9"

# Priority emoji
case $PRIORITY in
    critical) EMOJI="🚨" ;;
    high) EMOJI="⚠️" ;;
    medium) EMOJI="📝" ;;
    *) EMOJI="📋" ;;
esac

TITLE="@claude $EMOJI [AUTO] $MESSAGE"

case $TEMPLATE in
    "seo-focused")
        BODY="@claude Please review commit \`$HASH\` for SEO impact and provide optimization recommendations.

## SEO Impact Analysis Required

### Commit Details
- **Hash:** \`$HASH\`
- **Author:** $AUTHOR
- **Date:** $DATE
- **Changes:** +$LINES_ADDED/-$LINES_DELETED lines

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
$CHANGED_FILES
\`\`\`

### Action Items
- [ ] Run SEO audit tools
- [ ] Test search console integration
- [ ] Verify structured data with Google's tool
- [ ] Check pagespeed insights scores"
        LABELS="seo,auto-generated,needs-review"
        ;;
        
    "security-audit")
        BODY="@claude Please conduct a security review of commit \`$HASH\` and identify any potential vulnerabilities or security concerns.

## Security Review Required

### Security Assessment
- **Risk Level:** $PRIORITY
- **Commit:** \`$HASH\`
- **Author:** $AUTHOR

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
$CHANGED_FILES
\`\`\`

### Security Tools
- [ ] Run SAST (Static Application Security Testing)
- [ ] Perform dependency vulnerability scan
- [ ] Check for secrets in code"
        LABELS="security,auto-generated,needs-review,urgent"
        ;;
        
    "performance-review")
        BODY="@claude Please analyze commit \`$HASH\` for performance impact and provide optimization recommendations.

## Performance Impact Review

### Performance Analysis
- **Scope:** $LINES_ADDED added, $LINES_DELETED removed lines
- **Commit:** \`$HASH\`
- **Author:** $AUTHOR

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
$CHANGED_FILES
\`\`\`

### Performance Tools
- [ ] Run Lighthouse audit
- [ ] Check WebPageTest results
- [ ] Monitor real user metrics"
        LABELS="performance,auto-generated,needs-review"
        ;;
        
    *)
        BODY="@claude Please review commit \`$HASH\` and provide feedback on code quality, implementation, and any potential improvements.

## Code Review Required

### Change Summary
- **Priority:** $PRIORITY
- **Commit:** \`$HASH\`
- **Author:** $AUTHOR
- **Date:** $DATE
- **Impact:** +$LINES_ADDED/-$LINES_DELETED lines

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
$CHANGED_FILES
\`\`\`

### Next Steps
- [ ] Assign reviewer
- [ ] Schedule testing
- [ ] Update documentation"
        LABELS="review-needed,auto-generated"
        ;;
esac

echo "title=$TITLE" >> $GITHUB_OUTPUT
echo "labels=$LABELS" >> $GITHUB_OUTPUT

# Write body to file for GitHub Actions
echo "$BODY" > /tmp/issue_body.txt

echo "body_file=/tmp/issue_body.txt" >> $GITHUB_OUTPUT