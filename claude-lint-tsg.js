#!/usr/bin/env node
/**
 * TSG Fulfillment Services Content Linter
 * 
 * This script provides comprehensive content linting for TSG Fulfillment Services website
 * using Claude AI. It analyzes content across the site to find issues like:
 * 
 * - Spelling and grammar mistakes
 * - Inaccurate company information
 * - Inconsistent terminology and branding
 * - Missing or incorrect contact details
 * - Content that doesn't align with company positioning
 * 
 * Usage:
 *   node claude-lint-tsg.js          - Run a full content analysis once
 *   node claude-lint-tsg.js --watch  - Run in watch mode, analyzing files as they change
 * 
 * The script examines:
 * - React components with text content
 * - Marketing copy and descriptions
 * - Contact information and business details
 * - Service descriptions and company positioning
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ignore = require('ignore');
const chokidar = require('chokidar');

// TSG Fulfillment Services company information for accuracy checking
const TSG_COMPANY_INFO = {
  name: "TSG Fulfillment Services Inc.",
  address: {
    street: "6750 Langstaff Road, Unit 1-2",
    city: "Vaughan",
    province: "ON",
    postalCode: "L4H 5K2",
    country: "Canada"
  },
  businessHours: "Monday to Friday: 9:00 AM – 5:00 PM",
  positioning: {
    type: "Boutique Fulfillment Center",
    uniqueValue: "highly customized services tailored to each client",
    approach: "client-centered pricing and services"
  },
  services: [
    "warehousing solutions",
    "logistics services", 
    "fulfillment services",
    "e-commerce fulfillment",
    "retail fulfillment"
  ]
};

// Get project root directory
let projectRoot;
try {
  projectRoot = execSync('git rev-parse --show-toplevel').toString().trim();
  process.chdir(projectRoot);
} catch (error) {
  console.log("Git not detected, using current directory as project root");
  projectRoot = process.cwd();
}

// Create a prompt for Claude focused on TSG content accuracy
const claudePrompt = `You are a professional content editor and proofreader specializing in business websites. Analyze the following content for TSG Fulfillment Services Inc. and identify any issues with accuracy, grammar, spelling, and brand consistency.

COMPANY INFORMATION TO VERIFY AGAINST:
${JSON.stringify(TSG_COMPANY_INFO, null, 2)}

CONTENT TO ANALYZE:
\${CONTENT_FILES}

CHANGED FILES (Recent modifications):
\${CHANGED_FILES}

Based on this information, identify:

1. CRITICAL CONTENT ISSUES:
   - Incorrect company name, address, or contact information
   - Misspelled words or grammatical errors
   - Inaccurate service descriptions
   - Wrong business hours or location details
   - Inconsistent company positioning or branding

2. IMPORTANT CONTENT ISSUES:
   - Terminology inconsistencies across pages
   - Missing key differentiators (boutique fulfillment center)
   - Unclear or confusing service descriptions
   - Poor readability or flow
   - Missing calls-to-action or contact information

3. MINOR CONTENT ISSUES:
   - Style inconsistencies (capitalization, punctuation)
   - Redundant or repetitive content
   - Opportunities for better SEO keywords
   - Minor formatting improvements

For each issue found, format your response exactly as follows:
FILENAME:LINE_NUMBER
ISSUE: Brief description of the content problem
FIX: Specific recommendation on how to fix it
SEVERITY: [Critical/High/Medium/Low]
CATEGORY: [Accuracy/Grammar/Spelling/Branding/SEO/Style]
AUTO_FIX: [If available, provide exact text replacement to fix the issue]
---

When providing AUTO_FIX, make sure it's precise text that can be automatically applied. For complex content changes, leave the AUTO_FIX field empty.

Sort issues by severity, then by filename and line number. Focus only on actual content issues - do not include compliments or unrelated technical comments.`;

// Extract content from React components and pages
function extractContentFromFiles() {
  try {
    // Find all React component files and pages
    const contentFiles = [
      './client/src/components/**/*.tsx',
      './client/src/pages/**/*.tsx',
      './client/src/**/*.tsx'
    ];
    
    let extractedContent = "WEBSITE CONTENT ANALYSIS:\n\n";
    
    // Use glob to find files
    const glob = require('glob');
    const allFiles = new Set();
    
    for (const pattern of contentFiles) {
      const files = glob.sync(pattern, { ignore: ['**/node_modules/**'] });
      files.forEach(file => allFiles.add(file));
    }
    
    for (const file of allFiles) {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      const fileName = path.relative('.', file);
      
      extractedContent += `--- ${fileName} ---\n`;
      
      // Extract text content from JSX/TSX files
      const textContent = extractTextFromJSX(content);
      if (textContent.trim()) {
        extractedContent += textContent + "\n\n";
      } else {
        extractedContent += "No significant text content found.\n\n";
      }
    }
    
    return extractedContent;
  } catch (error) {
    return `Error extracting content: ${error.message}`;
  }
}

// Extract readable text from JSX/TSX content
function extractTextFromJSX(content) {
  let textContent = "";
  
  try {
    // Remove imports and other non-content code
    let cleanContent = content
      .replace(/^import\s+.*$/gm, '') // Remove import statements
      .replace(/^export\s+.*$/gm, '') // Remove export statements
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/className=["'][^"']*["']/g, '') // Remove className attributes
      .replace(/style=\{[^}]*\}/g, '') // Remove style objects
      .replace(/\{[^}]*\}/g, ' '); // Remove other JSX expressions
    
    // Extract text content between JSX tags
    const textRegex = />([^<>{]+)</g;
    let match;
    
    while ((match = textRegex.exec(cleanContent)) !== null) {
      const text = match[1].trim();
      if (text && text.length > 2 && !text.match(/^[a-zA-Z]+$/)) { // Skip single words and variable names
        textContent += text + "\n";
      }
    }
    
    // Extract alt text and titles
    const altRegex = /alt=["']([^"']+)["']/g;
    while ((match = altRegex.exec(content)) !== null) {
      textContent += `ALT TEXT: ${match[1]}\n`;
    }
    
    const titleRegex = /title=["']([^"']+)["']/g;
    while ((match = titleRegex.exec(content)) !== null) {
      textContent += `TITLE: ${match[1]}\n`;
    }
    
    // Extract string literals that might be content
    const stringRegex = /["']([^"']{10,})["']/g;
    while ((match = stringRegex.exec(content)) !== null) {
      const text = match[1].trim();
      if (text && !text.includes('class') && !text.includes('src') && !text.includes('href')) {
        textContent += `STRING: ${text}\n`;
      }
    }
    
    return textContent;
  } catch (error) {
    return `Error parsing JSX content: ${error.message}`;
  }
}

// Get recently changed files content
function getChangedFilesContent() {
  try {
    // Get list of changed files from git
    const changedFiles = execSync('git diff --name-only HEAD~5').toString().trim().split('\n');
    if (!changedFiles[0]) return "No recently changed files detected.";
    
    let content = "RECENTLY CHANGED FILES CONTENT:\n\n";
    
    for (const file of changedFiles) {
      if (!file || !fs.existsSync(file) || !file.match(/\.(tsx?|jsx?)$/)) continue;
      
      content += `--- ${file} ---\n`;
      const fileContent = fs.readFileSync(file, 'utf8');
      const textContent = extractTextFromJSX(fileContent);
      content += textContent || "No text content found.\n";
      content += "\n";
    }
    
    return content;
  } catch (error) {
    return `Error getting changed files: ${error.message}`;
  }
}

// Setup gitignore patterns
function getIgnorer() {
  let ig = ignore();
  if (fs.existsSync('.gitignore')) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
    ig = ignore().add(gitignoreContent);
  }
  ig.add(['node_modules', '.git', 'dist', 'build', '.claude-temp-prompt.txt', '*.min.js']);
  return ig;
}

// Check if Claude CLI is available
function checkClaudeCli() {
  try {
    execSync('claude --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Run Claude analysis
async function runContentAnalysis() {
  console.log("Analyzing TSG Fulfillment Services website content...");
  console.log("Extracting text content from components and pages...");
  
  const contentFiles = extractContentFromFiles();
  const changedFiles = getChangedFilesContent();
  
  // Build final prompt
  const finalPrompt = claudePrompt
    .replace('${CONTENT_FILES}', contentFiles)
    .replace('${CHANGED_FILES}', changedFiles);
  
  // Write prompt to temp file
  fs.writeFileSync('.claude-temp-prompt.txt', finalPrompt);
  
  // Run Claude CLI analysis
  try {
    console.log("Checking content accuracy against TSG company information...");
    
    if (checkClaudeCli()) {
      console.log("Sending content to Claude for analysis...");
      
      const result = execSync('claude -p ".claude-temp-prompt.txt"', { 
        timeout: 120000,
        stdio: ['ignore', 'pipe', 'pipe']
      }).toString();
      
      const timestamp = new Date().toLocaleTimeString();
      console.log(`\n=== TSG CONTENT ANALYSIS RESULTS (${timestamp}) ===\n`);
      console.log(result);
      console.log('\n=== END OF CONTENT ANALYSIS ===\n');
    } else {
      console.log("Claude CLI not found. Please install Claude CLI first.");
      console.log("Prompt saved to .claude-temp-prompt.txt for manual analysis.");
    }
  } catch (error) {
    console.error("Error during content analysis:", error.message);
  } finally {
    console.log("Content analysis complete. Check results above for any issues.");
  }
}

// Watch mode for continuous content monitoring
function watchMode() {
  const ig = getIgnorer();
  console.log("Starting TSG content watcher...");
  console.log("Monitoring for content changes (press Ctrl+C to exit)...");
  
  const watcher = chokidar.watch('./client/src', {
    ignored: path => {
      const relativePath = path.startsWith('./') ? path.substring(2) : path;
      return ig.ignores(relativePath) || !/\.(tsx?|jsx?)$/.test(path);
    },
    persistent: true,
    ignoreInitial: true
  });
  
  let debounceTimer;
  
  watcher.on('all', (event, filePath) => {
    if (event === 'add' || event === 'change') {
      console.log(`\nContent file changed: ${filePath}`);
      
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log("Running content analysis...");
        runContentAnalysis();
      }, 2000);
    }
  });
  
  console.log("Watching for content changes in TSG website files...");
}

// Main execution
if (process.argv.includes('--watch') || process.argv.includes('-w')) {
  watchMode();
} else {
  runContentAnalysis().catch(console.error);
}