# 🚀 TeenyAI Installer Deployment Guide

This guide shows you how to build and share TeenyAI installers with your team members.

## 📋 Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Verify your environment:**
   - Node.js 18+ installed
   - npm or yarn package manager
   - Git (for version control)

## 🛠 Building Installers

### Quick Start (All Platforms)
```bash
# Build installers for all platforms
npm run package:all
```

### Platform-Specific Builds

#### Windows (.exe installer + portable)
```bash
npm run package:win
```
**Output:** `release/TeenyAI Setup 1.0.0.exe` + `release/TeenyAI 1.0.0.exe` (portable)

#### macOS (.dmg + .zip)
```bash
npm run package:mac
```
**Output:** `release/TeenyAI-1.0.0.dmg` + `release/TeenyAI-1.0.0-mac.zip`

#### Linux (.AppImage + .deb)
```bash
npm run package:linux
```
**Output:** `release/TeenyAI-1.0.0.AppImage` + `release/TeenyAI-1.0.0.deb`

## 📁 Output Locations

All installers are generated in the `release/` folder:

```
release/
├── TeenyAI Setup 1.0.0.exe          # Windows installer
├── TeenyAI 1.0.0.exe                # Windows portable
├── TeenyAI-1.0.0.dmg                # macOS disk image
├── TeenyAI-1.0.0-mac.zip            # macOS zip
├── TeenyAI-1.0.0.AppImage           # Linux AppImage
└── TeenyAI-1.0.0.deb                # Linux Debian package
```

## 📤 Sharing with Your Team

### Option 1: File Sharing Services
1. **Google Drive / Dropbox:**
   - Upload the installer files
   - Share the folder link with your team
   - Team members download and run the installer

2. **OneDrive / iCloud:**
   - Upload to cloud storage
   - Share with specific people or generate a public link

### Option 2: GitHub Releases
1. **Create a GitHub Release:**
   ```bash
   # Tag your version
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Upload installers:**
   - Go to GitHub → Releases → Create new release
   - Attach all installer files
   - Team members download from the release page

### Option 3: AWS S3 (Advanced)
1. **Upload to S3:**
   ```bash
   aws s3 cp release/ s3://your-bucket/teenyai/ --recursive
   ```

2. **Generate signed URLs:**
   - Create time-limited download links
   - Share URLs with your team

## 🔄 Auto-Updates (Future Enhancement)

To enable automatic updates, add these dependencies:

```bash
npm install electron-updater
```

Then configure in your main process:
```javascript
const { autoUpdater } = require('electron-updater');

// Check for updates
autoUpdater.checkForUpdatesAndNotify();
```

## 🧹 Cleanup Commands

```bash
# Clean all build artifacts
npm run clean

# Clean specific folders
npm run clean:build    # Remove build/ folder
npm run clean:release  # Remove release/ folder
```

## 🐛 Troubleshooting

### Build Issues
- **"Module not found":** Run `npm install` to ensure all dependencies are installed
- **"Permission denied":** On macOS/Linux, you may need to run with `sudo` for some operations
- **"Out of memory":** Increase Node.js memory limit: `NODE_OPTIONS="--max-old-space-size=4096"`

### Installer Issues
- **Windows:** If Windows Defender blocks the installer, add an exception or sign the executable
- **macOS:** If Gatekeeper blocks the app, right-click → "Open" or disable Gatekeeper temporarily
- **Linux:** Make AppImage executable: `chmod +x TeenyAI-1.0.0.AppImage`

## 📝 Version Management

Update version in `package.json` before building:
```json
{
  "version": "1.0.1"
}
```

Then rebuild:
```bash
npm run package:all
```

## 🎯 Best Practices

1. **Test installers** on target platforms before sharing
2. **Version your releases** using semantic versioning (1.0.0, 1.0.1, etc.)
3. **Keep release notes** documenting changes
4. **Sign your installers** for better security (requires certificates)
5. **Use CI/CD** for automated builds (GitHub Actions, etc.)

---

## 🚀 Quick Commands Reference

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production

# Packaging
npm run package:win           # Windows installer
npm run package:mac           # macOS installer  
npm run package:linux         # Linux installer
npm run package:all           # All platforms

# Cleanup
npm run clean                 # Clean everything
npm run clean:release         # Clean release folder only
```

Happy shipping! 🎉
