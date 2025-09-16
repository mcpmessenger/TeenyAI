#!/bin/bash

# GitHub Issue Submission Script for WebView Truncation Bug Bounty
# Run with: ./submit-github-issue.sh

echo "🚀 Submitting GitHub Issue for WebView Truncation Bug Bounty..."
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "📥 Install it from: https://cli.github.com/"
    echo ""
    echo "🔧 Alternative: Copy content from GITHUB_ISSUE_TEMPLATE.md manually"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "🔐 Run: gh auth login"
    exit 1
fi

# Create the issue
echo "📝 Creating GitHub issue..."
gh issue create \
  --title "🐛 CRITICAL: WebView Truncation Issue - Bug Bounty" \
  --body-file GITHUB_ISSUE_TEMPLATE.md \
  --label "bug,critical,bug-bounty,webview,rendering" \
  --assignee @me

echo ""
echo "✅ GitHub issue created successfully!"
echo "🔗 View your issue at: https://github.com/[your-username]/TeenyAI/issues"
echo ""
echo "💰 Bug Bounty Details:"
echo "  - Minimum: 500 Street Creds 💪"
echo "  - Recommended: 1,000 - 2,000 Street Creds 🚀"
echo "  - Maximum: 5,000 Street Creds + Legendary Status 🏆 (includes BrowserView migration)"
echo ""
echo "🎯 This is a CRITICAL production-blocking issue!"
