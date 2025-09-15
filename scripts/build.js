#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const buildType = process.argv[2] || 'desktop';
const platform = process.argv[3] || process.platform;

console.log(`🔨 Building AI Browser for: ${buildType} (${platform})`);

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('build')) {
    fs.rmSync('build', { recursive: true });
  }
  if (fs.existsSync('release')) {
    fs.rmSync('release', { recursive: true });
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });

  // Build based on type
  switch (buildType) {
    case 'desktop':
      console.log('🖥️  Building Electron desktop app...');
      execSync('npm run build', { stdio: 'inherit' });
      
      // Platform-specific packaging
      switch (platform) {
        case 'win32':
        case 'windows':
          execSync('npm run package:win', { stdio: 'inherit' });
          break;
        case 'darwin':
        case 'mac':
          execSync('npm run package:mac', { stdio: 'inherit' });
          break;
        case 'linux':
          execSync('npm run package:linux', { stdio: 'inherit' });
          break;
        default:
          execSync('npm run package', { stdio: 'inherit' });
      }
      break;
    
    case 'dev':
      console.log('🚀 Starting development server...');
      execSync('npm run dev', { stdio: 'inherit' });
      break;
    
    default:
      throw new Error(`Unknown build type: ${buildType}`);
  }

  if (buildType === 'desktop') {
    console.log('\n✅ Build completed successfully!');
    console.log('📁 Installers created in: ./release/');
    
    // List created files
    if (fs.existsSync('release')) {
      const files = fs.readdirSync('release');
      console.log('\n📦 Created installers:');
      files.forEach(file => {
        const stats = fs.statSync(path.join('release', file));
        const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
        console.log(`   ${file} (${sizeMB} MB)`);
      });
    }
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}