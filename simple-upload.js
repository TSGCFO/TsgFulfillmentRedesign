#!/usr/bin/env node

/**
 * Simple Supabase Image Upload Script
 * 
 * This script uploads images directly to an existing Supabase bucket
 * without checking bucket existence or permissions.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const BUCKET_NAME = 'images';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
        upsert: true
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
async function uploadImages() {
  const organizedDir = path.join(__dirname, 'organized-images');
  
  if (!fs.existsSync(organizedDir)) {
    console.error('No organized-images directory found. Please run the download script first.');
    return;
  }
  
  console.log('Starting upload to existing Supabase bucket...');
  
  const uploadLog = [];
  let totalUploaded = 0;
  let totalFailed = 0;
  let totalSize = 0;
  
  // Get all categories (subdirectories)
  const categories = fs.readdirSync(organizedDir).filter(item => {
    const itemPath = path.join(organizedDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  if (categories.length === 0) {
    console.log('No category folders found in organized-images directory.');
    return;
  }
  
  console.log(`Found categories: ${categories.join(', ')}`);
  
  for (const category of categories) {
    const categoryPath = path.join(organizedDir, category);
    const files = fs.readdirSync(categoryPath).filter(file => {
      return file.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
    });
    
    if (files.length === 0) {
      console.log(`No images found in ${category}/ folder`);
      continue;
    }
    
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
        status: result.success ? 'success' : 'failed',
        error: result.error || null,
        timestamp: new Date().toISOString()
      };
      
      uploadLog.push(logEntry);
      
      if (result.success) {
        console.log(`    ✓ Success`);
        totalUploaded++;
        totalSize += fileStats.size;
      } else {
        console.log(`    ✗ Failed: ${result.error}`);
        totalFailed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Save results
  const logPath = path.join(__dirname, 'upload-results.json');
  fs.writeFileSync(logPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: uploadLog.length,
      successful: totalUploaded,
      failed: totalFailed,
      totalSize: formatFileSize(totalSize)
    },
    uploads: uploadLog
  }, null, 2));
  
  // Generate URL list for successful uploads
  const successfulUploads = uploadLog.filter(entry => entry.status === 'success');
  if (successfulUploads.length > 0) {
    const urlList = successfulUploads.map(entry => ({
      filename: entry.filename,
      category: entry.category,
      url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${entry.remotePath}`
    }));
    
    fs.writeFileSync(path.join(__dirname, 'uploaded-urls.json'), JSON.stringify(urlList, null, 2));
  }
  
  console.log('\n=== UPLOAD SUMMARY ===');
  console.log(`Total files: ${uploadLog.length}`);
  console.log(`Successful: ${totalUploaded}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Total size: ${formatFileSize(totalSize)}`);
  console.log(`\nResults saved to: ${logPath}`);
  
  if (totalFailed > 0) {
    console.log('\nFailed uploads:');
    uploadLog.filter(entry => entry.status === 'failed').forEach(entry => {
      console.log(`  - ${entry.remotePath}: ${entry.error}`);
    });
  }
  
  if (totalUploaded > 0) {
    console.log(`\nImages are now available at: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/category/filename`);
  }
}

// Run the upload
uploadImages().catch(console.error);