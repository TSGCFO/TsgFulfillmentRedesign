#!/bin/bash
set -e

# Analyze commit and determine if issue should be created
MESSAGE="$1"
CHANGED_FILES="$2"
LINES_ADDED="$3"
LINES_DELETED="$4"

echo "Analyzing commit: $MESSAGE"
echo "Changed files: $CHANGED_FILES"
echo "Lines: +$LINES_ADDED -$LINES_DELETED"

# Initialize variables
SHOULD_CREATE="false"
ISSUE_TYPE="maintenance"
PRIORITY="low"
TEMPLATE="standard"

# Check commit message patterns
if [[ "$MESSAGE" =~ ^(feat|feature): ]]; then
    SHOULD_CREATE="true"
    ISSUE_TYPE="feature"
    PRIORITY="medium"
    TEMPLATE="standard"
elif [[ "$MESSAGE" =~ ^(fix|bugfix): ]]; then
    SHOULD_CREATE="true"
    ISSUE_TYPE="bugfix"
    PRIORITY="high"
    TEMPLATE="standard"
elif [[ "$MESSAGE" =~ ^(security|sec): ]] || [[ "$MESSAGE" =~ (vulnerabilit|exploit|auth|login) ]]; then
    SHOULD_CREATE="true"
    ISSUE_TYPE="security"
    PRIORITY="critical"
    TEMPLATE="security-audit"
elif [[ "$MESSAGE" =~ (seo|SEO|search|optimization) ]] || [[ "$CHANGED_FILES" =~ (sitemap|robots\.txt|meta|schema) ]]; then
    SHOULD_CREATE="true"
    ISSUE_TYPE="seo"
    PRIORITY="medium"
    TEMPLATE="seo-focused"
elif [[ "$MESSAGE" =~ (perf|performance|speed|optimization) ]] || [[ "$CHANGED_FILES" =~ (webpack|vite|bundle|performance) ]]; then
    SHOULD_CREATE="true"
    ISSUE_TYPE="performance"
    PRIORITY="medium"
    TEMPLATE="performance-review"
fi

# Check file-based triggers
if [[ "$CHANGED_FILES" =~ (package\.json|yarn\.lock|Dockerfile|docker-compose) ]]; then
    SHOULD_CREATE="true"
    ISSUE_TYPE="infrastructure"
    PRIORITY="medium"
fi

# Check for large changes
if [ "$LINES_ADDED" -gt 200 ] || [ "$LINES_DELETED" -gt 100 ]; then
    SHOULD_CREATE="true"
    ISSUE_TYPE="major-change"
    PRIORITY="high"
fi

echo "should_create=$SHOULD_CREATE" >> $GITHUB_OUTPUT
echo "issue_type=$ISSUE_TYPE" >> $GITHUB_OUTPUT
echo "priority=$PRIORITY" >> $GITHUB_OUTPUT
echo "template=$TEMPLATE" >> $GITHUB_OUTPUT

echo "Decision: Create=$SHOULD_CREATE, Type=$ISSUE_TYPE, Priority=$PRIORITY, Template=$TEMPLATE"