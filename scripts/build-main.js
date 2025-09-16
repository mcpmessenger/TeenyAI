const fs = require('fs');
const path = require('path');

console.log('🔧 Building main process...');

try {
  // Ensure build directory exists
  const buildDir = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
    console.log('📁 Created build directory');
  }

  // Copy main.js from src/main to build directory
  const srcMainPath = path.join(__dirname, '..', 'src', 'main', 'main.js');
  const destMainPath = path.join(buildDir, 'main.js');

  console.log('📂 Source path:', srcMainPath);
  console.log('📂 Destination path:', destMainPath);
  console.log('📂 Source exists:', fs.existsSync(srcMainPath));

  if (fs.existsSync(srcMainPath)) {
    fs.copyFileSync(srcMainPath, destMainPath);
    console.log('✅ Main process built successfully');
  } else {
    console.error('❌ Main process source file not found:', srcMainPath);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Build error:', error);
  process.exit(1);
}

// Copy utils.js if it exists
const buildDir = path.join(__dirname, '..', 'build');
const srcUtilsPath = path.join(__dirname, '..', 'src', 'main', 'utils.js');
const destUtilsPath = path.join(buildDir, 'utils.js');

if (fs.existsSync(srcUtilsPath)) {
  fs.copyFileSync(srcUtilsPath, destUtilsPath);
  console.log('✅ Utils copied successfully');
}

// Copy backend directory if it exists
const srcBackendPath = path.join(__dirname, '..', 'src', 'backend');
const destBackendPath = path.join(buildDir, 'backend');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
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
}

if (fs.existsSync(srcBackendPath)) {
  copyDirectory(srcBackendPath, destBackendPath);
  console.log('✅ Backend files copied successfully');
}

console.log('🎉 Main process build complete!');
