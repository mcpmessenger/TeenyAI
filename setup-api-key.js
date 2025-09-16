#!/usr/bin/env node

/**
 * API Key Setup Helper
 * Run with: node setup-api-key.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔑 TeenyAI API Key Setup Helper\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('OPENAI_API_KEY=')) {
    console.log('✅ OPENAI_API_KEY is already configured');
    console.log('💡 If you\'re still having issues, try restarting the application');
  } else {
    console.log('⚠️  OPENAI_API_KEY not found in .env file');
  }
} else {
  console.log('❌ .env file not found');
  console.log('📝 Creating .env file...');
  
  const envTemplate = `# TeenyAI Configuration
# Set your API key here
OPENAI_API_KEY=your_openai_api_key_here

# Alternative providers (uncomment to use)
# CLAUDE_API_KEY=your_claude_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here

# AI Provider (optional, defaults to openai)
# AI_PROVIDER=openai
`;

  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env file created successfully');
    console.log('📝 Please edit .env file and add your actual API key');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
}

console.log('\n🔧 Quick Setup Commands:');
console.log('1. Edit .env file: notepad .env');
console.log('2. Add your API key: OPENAI_API_KEY=sk-your-actual-key-here');
console.log('3. Save and restart: npm run dev');
console.log('\n💡 For more help, check KNOWN_ISSUES.md');
