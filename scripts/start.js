#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runStartup() {
  console.log('🚀 Starting TSG Fulfillment application...');
  
  try {
    // Run database migrations in production
    if (process.env.NODE_ENV === 'production') {
      console.log('📦 Running database migrations...');
      await execAsync('npm run db:push');
      console.log('✅ Database migrations completed');
    }
    
    // Start the application
    console.log('🌟 Starting web server...');
    const { spawn } = await import('child_process');
    const server = spawn('node', ['dist/index.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });
    
    server.on('exit', (code) => {
      console.log(`🔄 Server exited with code ${code}`);
      process.exit(code);
    });
    
  } catch (error) {
    console.error('❌ Startup error:', error);
    process.exit(1);
  }
}

runStartup();