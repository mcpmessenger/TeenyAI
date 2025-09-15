#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up AI Browser development environment...');

// Create necessary directories
const dirs = [
  'assets',
  'src/backend',
  'src/services',
  'tests'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create basic icon files (placeholder)
const iconSizes = [16, 32, 48, 64, 128, 256, 512];
const iconDir = 'assets';

if (!fs.existsSync(path.join(iconDir, 'icon.png'))) {
  console.log('📝 Creating placeholder icon files...');
  console.log('   Note: Replace these with your actual app icons');
  
  // Create a simple text file as placeholder
  fs.writeFileSync(path.join(iconDir, 'icon.png'), '# Replace with actual 512x512 PNG icon');
  fs.writeFileSync(path.join(iconDir, 'icon.ico'), '# Replace with actual ICO file for Windows');
  fs.writeFileSync(path.join(iconDir, 'icon.icns'), '# Replace with actual ICNS file for macOS');
}

// Create environment file
if (!fs.existsSync('.env')) {
  const envContent = `# AI Browser Environment Variables
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
BACKEND_PORT=8000
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@localhost:5432/ai_browser

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1
`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ Created .env file (remember to add your API keys)');
}

// Create .gitignore
if (!fs.existsSync('.gitignore')) {
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
build/
dist/
release/
*.tgz

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
.nyc_output/

# Playwright
test-results/
playwright-report/
playwright/.cache/

# Temporary
tmp/
temp/
`;
  
  fs.writeFileSync('.gitignore', gitignoreContent);
  console.log('✅ Created .gitignore file');
}

console.log('\n🎉 Setup complete! Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Add your OpenAI API key to .env file');
console.log('3. Replace placeholder icons in assets/ folder');
console.log('4. Start development: npm run dev');
console.log('\n📚 Available commands:');
console.log('  npm run dev          - Start development server');
console.log('  npm run build        - Build for production');
console.log('  npm run package      - Create installer for current platform');
console.log('  npm run package:win  - Create Windows installer');
console.log('  npm run package:mac  - Create macOS installer');
console.log('  npm run package:linux - Create Linux AppImage');