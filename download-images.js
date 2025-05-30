#!/usr/bin/env node

/**
 * Website Image Downloader
 * 
 * This script scans your codebase for all image URLs and downloads them
 * with proper organization and SEO-friendly naming for Supabase upload.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Create downloads directory
const DOWNLOAD_DIR = path.join(__dirname, 'downloaded-images');
const ORGANIZED_DIR = path.join(__dirname, 'organized-images');

// Ensure directories exist
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(ORGANIZED_DIR)) {
  fs.mkdirSync(ORGANIZED_DIR, { recursive: true });
}

// Create category directories
const categories = ['hero', 'services', 'industries', 'warehouse', 'team', 'logos', 'icons', 'general'];
categories.forEach(category => {
  const categoryDir = path.join(ORGANIZED_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
});

/**
 * Extract all image URLs from the codebase
 */
function extractImageUrls() {
  const imageUrls = new Set();
  const imagePattern = /https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|gif|svg|webp)/gi;
  
  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(imagePattern);
      if (matches) {
        matches.forEach(url => {
          // Clean up the URL (remove trailing quotes, parentheses, etc.)
          const cleanUrl = url.replace(/[);"']+$/, '');
          imageUrls.add(cleanUrl);
        });
      }
    } catch (error) {
      console.warn(`Could not read file: ${filePath}`);
    }
  }
  
  function scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        
        // Skip node_modules and other unnecessary directories
        if (item === 'node_modules' || item === '.git' || item === 'dist') {
          return;
        }
        
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (fullPath.match(/\.(ts|tsx|js|jsx|md)$/)) {
            scanFile(fullPath);
          }
        } catch (error) {
          // Skip files that can't be accessed
        }
      });
    } catch (error) {
      console.warn(`Could not scan directory: ${dirPath}`);
    }
  }
  
  // Scan the entire project
  scanDirectory(__dirname);
  
  return Array.from(imageUrls);
}

/**
 * Generate SEO-friendly filename from URL and context
 */
function generateSeoFilename(url, category = 'general') {
  // Extract meaningful parts from URL
  const urlParts = url.split('/');
  let filename = urlParts[urlParts.length - 1];
  
  // Remove query parameters
  filename = filename.split('?')[0];
  
  // Extract extension
  const extension = filename.split('.').pop() || 'jpg';
  
  // Generate descriptive name based on URL context
  let descriptiveName = filename.replace(/\.(jpg|jpeg|png|gif|svg|webp)$/i, '');
  
  // If filename is not descriptive, generate from URL path
  if (descriptiveName.match(/^(photo|image|img)-?\d*$/i) || descriptiveName.length < 3) {
    // Try to extract meaningful words from the URL path
    const pathParts = url.split('/').slice(3, -1); // Remove protocol and domain
    descriptiveName = pathParts.join('-') + '-' + descriptiveName;
  }
  
  // Clean up the name
  descriptiveName = descriptiveName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50); // Limit length
  
  // Add category prefix and current year
  const year = new Date().getFullYear();
  return `${category}-${descriptiveName}-${year}.${extension}`;
}

/**
 * Categorize image based on URL or content context
 */
function categorizeImage(url) {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('hero') || urlLower.includes('banner') || urlLower.includes('header')) return 'hero';
  if (urlLower.includes('service') || urlLower.includes('fulfillment') || urlLower.includes('logistics')) return 'services';
  if (urlLower.includes('industry') || urlLower.includes('sector') || urlLower.includes('ecommerce') || urlLower.includes('manufacturing')) return 'industries';
  if (urlLower.includes('warehouse') || urlLower.includes('facility') || urlLower.includes('storage')) return 'warehouse';
  if (urlLower.includes('team') || urlLower.includes('staff') || urlLower.includes('people') || urlLower.includes('employee')) return 'team';
  if (urlLower.includes('logo') || urlLower.includes('brand') || urlLower.includes('icon')) return 'logos';
  
  return 'general';
}

/**
 * Download image from URL
 */
function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(outputPath);
        });
        
        fileStream.on('error', reject);
      } else if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirects
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    });
    
    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Main download function
 */
async function downloadAllImages() {
  console.log('Scanning codebase for image URLs...');
  const imageUrls = extractImageUrls();
  
  console.log(`Found ${imageUrls.length} unique image URLs`);
  
  if (imageUrls.length === 0) {
    console.log('No images found in the codebase.');
    return;
  }
  
  // Create download log
  const downloadLog = [];
  const errors = [];
  
  console.log('Starting downloads...');
  
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const category = categorizeImage(url);
    const seoFilename = generateSeoFilename(url, category);
    
    // Paths for both raw and organized downloads
    const rawPath = path.join(DOWNLOAD_DIR, `${String(i + 1).padStart(3, '0')}-${seoFilename}`);
    const organizedPath = path.join(ORGANIZED_DIR, category, seoFilename);
    
    try {
      console.log(`[${i + 1}/${imageUrls.length}] Downloading: ${url}`);
      
      // Download to raw directory
      await downloadImage(url, rawPath);
      
      // Copy to organized directory
      fs.copyFileSync(rawPath, organizedPath);
      
      downloadLog.push({
        originalUrl: url,
        category: category,
        filename: seoFilename,
        rawPath: rawPath,
        organizedPath: organizedPath,
        status: 'success'
      });
      
      console.log(`Downloaded: ${seoFilename}`);
      
    } catch (error) {
      console.error(`Failed to download ${url}: ${error.message}`);
      errors.push({
        url: url,
        error: error.message
      });
      
      downloadLog.push({
        originalUrl: url,
        category: category,
        filename: seoFilename,
        status: 'failed',
        error: error.message
      });
    }
    
    // Small delay to be respectful to servers
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Save download log
  const logPath = path.join(__dirname, 'image-download-log.json');
  fs.writeFileSync(logPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalImages: imageUrls.length,
    successful: downloadLog.filter(item => item.status === 'success').length,
    failed: errors.length,
    images: downloadLog
  }, null, 2));
  
  // Generate report
  console.log('\nDownload Summary:');
  console.log(`Total images found: ${imageUrls.length}`);
  console.log(`Successfully downloaded: ${downloadLog.filter(item => item.status === 'success').length}`);
  console.log(`Failed downloads: ${errors.length}`);
  console.log(`\nImages organized by category in: ${ORGANIZED_DIR}`);
  console.log(`Raw downloads in: ${DOWNLOAD_DIR}`);
  console.log(`Detailed log saved to: ${logPath}`);
  
  if (errors.length > 0) {
    console.log('\nFailed downloads:');
    errors.forEach(error => {
      console.log(`  - ${error.url}: ${error.error}`);
    });
  }
  
  // Generate upload instructions
  generateUploadInstructions(downloadLog);
}

/**
 * Generate instructions for uploading to Supabase
 */
function generateUploadInstructions(downloadLog) {
  const instructionsPath = path.join(__dirname, 'UPLOAD_INSTRUCTIONS.md');
  
  const successfulDownloads = downloadLog.filter(item => item.status === 'success');
  const categorizedImages = {};
  
  successfulDownloads.forEach(item => {
    if (!categorizedImages[item.category]) {
      categorizedImages[item.category] = [];
    }
    categorizedImages[item.category].push(item.filename);
  });
  
  const instructions = `# Image Upload Instructions

## Files Ready for Supabase Upload

Your images have been downloaded and organized with SEO-friendly naming. Here's what to do next:

### 1. Supabase Bucket Setup
- Bucket name: \`images\`
- Make sure the bucket is public for web access

### 2. Upload Structure
Upload the organized images maintaining this folder structure:

${Object.entries(categorizedImages).map(([category, files]) => `
#### ${category}/
${files.map(filename => `- ${filename}`).join('\n')}
`).join('')}

### 3. Manual Upload via Supabase Dashboard
1. Go to your Supabase dashboard > Storage > images bucket
2. Create folders for each category: ${Object.keys(categorizedImages).join(', ')}
3. Upload files from the \`organized-images\` folder to their respective categories

### 4. Batch Upload Commands (if using Supabase CLI)

\`\`\`bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to your project
supabase login

# Upload all categories
${Object.keys(categorizedImages).map(category => 
  `supabase storage cp organized-images/${category}/* supabase://images/${category}/`
).join('\n')}
\`\`\`

### 5. Verify Uploads

After uploading, verify the images are accessible at:
\`https://your-project.supabase.co/storage/v1/object/public/images/category/filename\`

### 6. Update Image Registry

Update the \`IMAGE_REGISTRY\` in \`client/src/lib/images.ts\` to reference your uploaded images.

## Download Summary

- Total images processed: ${downloadLog.length}
- Successfully downloaded: ${successfulDownloads.length}
- Failed downloads: ${downloadLog.filter(item => item.status === 'failed').length}

Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync(instructionsPath, instructions);
  console.log(`Upload instructions saved to: ${instructionsPath}`);
}

// Run the script
downloadAllImages().catch(console.error);