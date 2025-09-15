#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting AI Browser development environment...');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  No .env file found. Run "node scripts/setup.js" first.');
  process.exit(1);
}

// Start Vite dev server
console.log('📦 Starting Vite development server...');
const vite = spawn('npm', ['run', 'dev:vite'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit then start Electron
setTimeout(() => {
  console.log('⚡ Starting Electron...');
  const electron = spawn('npm', ['run', 'dev:electron'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    vite.kill();
    electron.kill();
    process.exit(0);
  });

  electron.on('close', () => {
    console.log('🔚 Electron closed, shutting down Vite...');
    vite.kill();
    process.exit(0);
  });
}, 3000);

vite.on('close', () => {
  console.log('🔚 Vite closed');
});