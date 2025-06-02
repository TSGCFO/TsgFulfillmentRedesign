#!/usr/bin/env node

/**
 * Supabase Image Upload Script
 * 
 * This script programmatically uploads organized images to your Supabase storage bucket
 * with proper folder structure and metadata.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const BUCKET_NAME = 'images';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and either SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Create bucket if it doesn't exist
 */
async function ensureBucketExists() {
  console.log('Checking if bucket exists...');
  
  const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
  
  if (error && error.message.includes('not found')) {
    console.log(`Bucket "${BUCKET_NAME}" not found. Attempting to create...`);
    
    const { data: createData, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (createError) {
      console.error('Failed to create bucket:', createError.message);
      console.log('\nOptions to fix this:');
      console.log('1. Create the bucket manually in Supabase dashboard: Storage > Create bucket > "images"');
      console.log('2. Use your service role key instead of anon key');
      console.log('3. Ask your admin to create the bucket and grant upload permissions');
      return false;
    }
    
    console.log('Bucket created successfully');
  } else if (error) {
    console.error('Error checking bucket:', error.message);
    console.log('This might be a permissions issue. Consider using the service role key.');
    return false;
  } else {
    console.log('Bucket already exists');
  }
  
  return true;
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Upload a single file to Supabase storage
 */
async function uploadFile(localPath, remotePath) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const mimeType = getMimeType(localPath);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(remotePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true // Overwrite if exists
      });
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get file size in a readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Upload all images from organized directory
 */
async function uploadAllImages() {
  const organizedDir = path.join(__dirname, 'organized-images');
  
  if (!fs.existsSync(organizedDir)) {
    console.error('Organized images directory not found. Please run download-images.js first.');
    return;
  }
  
  // Since bucket already exists, skip creation check
  console.log('Assuming bucket "images" already exists...');
  
  console.log('Starting image upload process...');
  
  const uploadLog = [];
  let totalUploaded = 0;
  let totalFailed = 0;
  let totalSize = 0;
  
  // Get all categories (subdirectories)
  const categories = fs.readdirSync(organizedDir).filter(item => {
    return fs.statSync(path.join(organizedDir, item)).isDirectory();
  });
  
  console.log(`Found categories: ${categories.join(', ')}`);
  
  for (const category of categories) {
    const categoryPath = path.join(organizedDir, category);
    const files = fs.readdirSync(categoryPath).filter(file => {
      return file.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
    });
    
    console.log(`\nUploading ${files.length} images from ${category}/`);
    
    for (const file of files) {
      const localPath = path.join(categoryPath, file);
      const remotePath = `${category}/${file}`;
      const fileStats = fs.statSync(localPath);
      
      console.log(`  Uploading: ${remotePath} (${formatFileSize(fileStats.size)})`);
      
      const result = await uploadFile(localPath, remotePath);
      
      const logEntry = {
        category,
        filename: file,
        localPath,
        remotePath,
        size: fileStats.size,
        sizeFormatted: formatFileSize(fileStats.size),
        status: result.success ? 'success' : 'failed',
        error: result.error || null,
        timestamp: new Date().toISOString()
      };
      
      uploadLog.push(logEntry);
      
      if (result.success) {
        console.log(`    ✓ Uploaded successfully`);
        totalUploaded++;
        totalSize += fileStats.size;
      } else {
        console.log(`    ✗ Upload failed: ${result.error}`);
        totalFailed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Save upload log
  const logPath = path.join(__dirname, 'supabase-upload-log.json');
  fs.writeFileSync(logPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: uploadLog.length,
      successful: totalUploaded,
      failed: totalFailed,
      totalSize: totalSize,
      totalSizeFormatted: formatFileSize(totalSize)
    },
    uploads: uploadLog
  }, null, 2));
  
  // Generate URL verification list
  const verificationUrls = uploadLog
    .filter(entry => entry.status === 'success')
    .map(entry => ({
      filename: entry.filename,
      category: entry.category,
      url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${entry.remotePath}`
    }));
  
  const urlsPath = path.join(__dirname, 'uploaded-image-urls.json');
  fs.writeFileSync(urlsPath, JSON.stringify(verificationUrls, null, 2));
  
  // Generate updated image registry
  generateImageRegistry(uploadLog.filter(entry => entry.status === 'success'));
  
  console.log('\n=== UPLOAD SUMMARY ===');
  console.log(`Total files processed: ${uploadLog.length}`);
  console.log(`Successfully uploaded: ${totalUploaded}`);
  console.log(`Failed uploads: ${totalFailed}`);
  console.log(`Total size uploaded: ${formatFileSize(totalSize)}`);
  console.log(`\nDetailed log saved to: ${logPath}`);
  console.log(`Image URLs saved to: ${urlsPath}`);
  
  if (totalFailed > 0) {
    console.log('\nFailed uploads:');
    uploadLog.filter(entry => entry.status === 'failed').forEach(entry => {
      console.log(`  - ${entry.remotePath}: ${entry.error}`);
    });
  }
  
  console.log('\nYour images are now available via Supabase CDN at:');
  console.log(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/category/filename`);
}

/**
 * Generate updated IMAGE_REGISTRY for the codebase
 */
function generateImageRegistry(successfulUploads) {
  const registryPath = path.join(__dirname, 'updated-image-registry.ts');
  
  let registryContent = `// Updated IMAGE_REGISTRY based on uploaded images
// Copy this content to client/src/lib/images.ts

export const IMAGE_REGISTRY = {\n`;

  successfulUploads.forEach(upload => {
    const key = upload.filename
      .replace(/\.(jpg|jpeg|png|gif|svg|webp)$/i, '')
      .replace(/^[^-]*-/, ''); // Remove category prefix
    
    registryContent += `  '${key}': '${upload.remotePath}',\n`;
  });

  registryContent += `} as const;\n`;

  fs.writeFileSync(registryPath, registryContent);
  console.log(`Updated image registry saved to: ${registryPath}`);
}

/**
 * Verify uploaded images
 */
async function verifyUploads() {
  console.log('Verifying uploaded images...');
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list('', {
      limit: 1000,
      offset: 0
    });
  
  if (error) {
    console.error('Failed to list files:', error.message);
    return;
  }
  
  console.log(`Found ${data.length} files in bucket`);
  
  // List files by category
  const categories = ['hero', 'services', 'industries', 'warehouse', 'team', 'logos', 'icons', 'general'];
  
  for (const category of categories) {
    const { data: categoryData, error: categoryError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(category, {
        limit: 100,
        offset: 0
      });
    
    if (!categoryError && categoryData) {
      console.log(`${category}/: ${categoryData.length} files`);
    }
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'upload':
    uploadAllImages().catch(console.error);
    break;
  case 'verify':
    verifyUploads().catch(console.error);
    break;
  case 'bucket':
    ensureBucketExists().catch(console.error);
    break;
  default:
    console.log(`
Supabase Image Upload Tool

Usage:
  node upload-to-supabase.js upload  - Upload all organized images
  node upload-to-supabase.js verify  - Verify uploaded files
  node upload-to-supabase.js bucket  - Check/create bucket

Environment Variables Required:
  SUPABASE_URL - Your Supabase project URL
  SUPABASE_SERVICE_KEY - Your Supabase service role key (or anon key)

Example:
  SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_KEY=your-key node upload-to-supabase.js upload
`);
}