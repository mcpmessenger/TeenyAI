# 🔄 Auto-Updater Setup Guide

This guide explains how to set up automatic updates for TeenyAI using electron-updater with AWS S3 and GitHub Releases support.

## 🚀 Features

- **Automatic Updates**: Check for updates on startup (production only)
- **Multiple Sources**: AWS S3 (primary) and GitHub Releases (fallback)
- **User Control**: Manual update checking and installation
- **Progress Tracking**: Download progress and status updates
- **Cross-Platform**: Windows, macOS, and Linux support

## 📋 Prerequisites

1. **AWS Account** (for S3 updates)
2. **GitHub Repository** (for releases)
3. **Environment Variables** configured

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root:

```bash
# AWS S3 Configuration (Primary)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=teenyai-updates
AWS_REGION=us-east-1

# GitHub Configuration (Fallback)
GITHUB_OWNER=your-username
GITHUB_REPO=TeenyAI

# Update Server (Optional)
UPDATE_SERVER=https://api.github.com/repos/your-username/TeenyAI/releases/latest
```

### 2. AWS S3 Setup

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://teenyai-updates
   ```

2. **Configure Bucket Policy**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::teenyai-updates/*"
       }
     ]
   }
   ```

3. **Set CORS Configuration**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

### 3. GitHub Releases Setup

1. **Create GitHub Repository** (if not exists)
2. **Generate Personal Access Token** with `repo` permissions
3. **Set Repository Secrets**:
   - `GITHUB_TOKEN`: Your personal access token

## 🏗️ Building and Publishing

### 1. Build the Application

```bash
# Build for all platforms
npm run build

# Build for specific platform
npm run build:win
npm run build:mac
npm run build:linux
```

### 2. Publish Updates

```bash
# Publish to both S3 and GitHub
npm run publish

# Publish to S3 only
npm run publish:s3

# Publish to GitHub only
npm run publish:github
```

### 3. Package Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build:win": "npm run build && electron-builder --win --publish=never",
    "build:mac": "npm run build && electron-builder --mac --publish=never",
    "build:linux": "npm run build && electron-builder --linux --publish=never",
    "publish": "npm run build && electron-builder --publish=always",
    "publish:s3": "npm run build && electron-builder --publish=always --config.publish.provider=s3",
    "publish:github": "npm run build && electron-builder --publish=always --config.publish.provider=github"
  }
}
```

## 🔄 Update Flow

### 1. Development Mode
- Auto-updater is disabled
- Manual checking available through UI
- No automatic downloads

### 2. Production Mode
- Auto-check on startup
- Auto-download available updates
- Auto-install on app restart
- User notifications for updates

## 🎯 Usage

### 1. Check for Updates
```javascript
// In your React component
const checkUpdates = async () => {
  const response = await window.electronAPI.checkForUpdates();
  if (response.success) {
    console.log('Update check completed');
  }
};
```

### 2. Download Update
```javascript
const downloadUpdate = async () => {
  const response = await window.electronAPI.downloadUpdate();
  if (response.success) {
    console.log('Update downloaded');
  }
};
```

### 3. Install Update
```javascript
const installUpdate = async () => {
  const response = await window.electronAPI.installUpdate();
  if (response.success) {
    console.log('Update will install on restart');
  }
};
```

### 4. Get Update Status
```javascript
const getStatus = async () => {
  const response = await window.electronAPI.getUpdateStatus();
  if (response.success) {
    console.log('Update status:', response.status);
  }
};
```

## 🛠️ Configuration Options

### AutoUpdaterService Configuration

```javascript
const config = {
  autoDownload: true,           // Auto-download updates
  autoInstallOnAppQuit: true,   // Auto-install on quit
  checkOnStartup: true,         // Check on app startup
  
  // S3 Configuration
  s3: {
    accessKeyId: 'your-key',
    secretAccessKey: 'your-secret',
    bucket: 'teenyai-updates',
    region: 'us-east-1',
    path: 'updates/'
  },
  
  // GitHub Configuration
  updateServer: 'https://api.github.com/repos/username/repo/releases/latest'
};
```

## 🔍 Troubleshooting

### Common Issues

1. **Updates not checking**:
   - Check environment variables
   - Verify S3 bucket permissions
   - Check GitHub repository access

2. **Download failures**:
   - Check internet connection
   - Verify S3 bucket policy
   - Check file permissions

3. **Installation failures**:
   - Check app permissions
   - Verify installer integrity
   - Check antivirus software

### Debug Mode

Enable debug logging:

```javascript
// In main process
process.env.ELECTRON_UPDATER_DEBUG = 'true';
```

## 📊 Monitoring

### Update Metrics

Track update success rates:
- Check frequency
- Download success rate
- Installation success rate
- User adoption rate

### Logs

Monitor these log messages:
- `🔄 Checking for updates...`
- `✅ Update available`
- `📥 Download progress`
- `✅ Update downloaded`
- `🚀 Installing update`

## 🔒 Security

### Best Practices

1. **Code Signing**: Sign your applications
2. **HTTPS**: Use HTTPS for update servers
3. **Verification**: Verify update integrity
4. **Permissions**: Limit S3 bucket permissions
5. **Tokens**: Use environment variables for secrets

### Code Signing

```bash
# Windows
electron-builder --win --publish=always --config.win.certificateFile=path/to/cert.p12

# macOS
electron-builder --mac --publish=always --config.mac.identity=Developer ID Application: Your Name
```

## 🎉 Benefits

- **Seamless Updates**: Users always have the latest version
- **No Manual Work**: Automatic update delivery
- **Multiple Sources**: Redundancy with S3 and GitHub
- **User Control**: Optional manual updates
- **Cross-Platform**: Works on all supported platforms

## 📝 Notes

- Updates are only checked in production builds
- Development mode disables automatic checking
- Users can manually check for updates anytime
- Updates are installed on app restart
- S3 is the primary source, GitHub is fallback
