const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Ensuring build files exist...');

const buildDir = path.join(__dirname, '..', 'build');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('📁 Created build directory');
}

// Check if main.js exists, if not compile it
const mainJsPath = path.join(buildDir, 'main.js');
if (!fs.existsSync(mainJsPath)) {
  console.log('🔨 Compiling main.ts...');
  try {
    execSync('npx tsc src/main/main.ts --outDir build --target es2020 --module commonjs', { stdio: 'inherit' });
    console.log('✅ main.ts compiled successfully');
  } catch (error) {
    console.error('❌ Failed to compile main.ts:', error.message);
    process.exit(1);
  }
}

// Check if utils.js exists, if not compile it
const utilsJsPath = path.join(buildDir, 'utils.js');
if (!fs.existsSync(utilsJsPath)) {
  console.log('🔨 Compiling utils.ts...');
  try {
    execSync('npx tsc src/main/utils.ts --outDir build --target es2020 --module commonjs', { stdio: 'inherit' });
    console.log('✅ utils.ts compiled successfully');
  } catch (error) {
    console.error('❌ Failed to compile utils.ts:', error.message);
    process.exit(1);
  }
}

// Copy backend files if they exist
const srcBackendPath = path.join(__dirname, '..', 'src', 'backend');
const destBackendPath = path.join(buildDir, 'backend');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  if (fs.existsSync(src)) {
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      
      if (fs.statSync(srcFile).isDirectory()) {
        copyDirectory(srcFile, destFile);
      } else {
        fs.copyFileSync(srcFile, destFile);
      }
    });
    console.log('✅ Backend files copied successfully');
  }
}

copyDirectory(srcBackendPath, destBackendPath);

// Verify all required files exist
if (!fs.existsSync(mainJsPath)) {
  console.error('❌ main.js still missing after compilation');
  process.exit(1);
}

if (!fs.existsSync(utilsJsPath)) {
  console.error('❌ utils.js still missing after compilation');
  process.exit(1);
}

console.log('✅ All required build files exist');
console.log('📂 main.js:', fs.existsSync(mainJsPath));
console.log('📂 utils.js:', fs.existsSync(utilsJsPath));
console.log('📂 backend/:', fs.existsSync(destBackendPath));
