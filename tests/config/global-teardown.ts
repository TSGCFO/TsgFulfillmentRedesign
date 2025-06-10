import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for Employee Portal E2E tests...');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Clean up test data
    await cleanupTestData(page);
    
    // Clean up auth state file
    await cleanupAuthState();
    
    // Clean up test artifacts
    await cleanupTestArtifacts();
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

async function cleanupTestData(page: any) {
  console.log('🗑️ Cleaning up test data...');
  
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  
  try {
    // Check if cleanup API is available
    const response = await page.request.delete(`${baseURL}/api/test/cleanup`);
    
    if (response.ok()) {
      console.log('✅ Test data cleaned up successfully');
    } else {
      console.warn('⚠️ Test data cleanup API returned error, manual cleanup may be needed');
    }
  } catch (error) {
    console.warn('⚠️ Test data cleanup API not available, manual cleanup may be needed');
  }
}

async function cleanupAuthState() {
  console.log('🔐 Cleaning up authentication state...');
  
  const authStatePath = 'tests/config/auth-state.json';
  
  try {
    if (fs.existsSync(authStatePath)) {
      fs.unlinkSync(authStatePath);
      console.log('✅ Authentication state file removed');
    }
  } catch (error) {
    console.warn('⚠️ Failed to remove authentication state file:', error);
  }
}

async function cleanupTestArtifacts() {
  console.log('📁 Cleaning up test artifacts...');
  
  // Clean up temporary files and directories
  const artifactPaths = [
    'test-results',
    'screenshots',
    'videos',
    'traces'
  ];
  
  for (const artifactPath of artifactPaths) {
    try {
      if (fs.existsSync(artifactPath)) {
        // Only clean up if it's a test run (not CI where we want to keep artifacts)
        if (!process.env.CI) {
          fs.rmSync(artifactPath, { recursive: true, force: true });
          console.log(`✅ Cleaned up ${artifactPath}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to clean up ${artifactPath}:`, error);
    }
  }
  
  // Clean up any temporary files created during testing
  const tempFiles = [
    'temp-test-data.json',
    'test-uploads',
    '.test-cache'
  ];
  
  for (const tempFile of tempFiles) {
    try {
      if (fs.existsSync(tempFile)) {
        if (fs.lstatSync(tempFile).isDirectory()) {
          fs.rmSync(tempFile, { recursive: true, force: true });
        } else {
          fs.unlinkSync(tempFile);
        }
        console.log(`✅ Cleaned up ${tempFile}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to clean up ${tempFile}:`, error);
    }
  }
}

export default globalTeardown;