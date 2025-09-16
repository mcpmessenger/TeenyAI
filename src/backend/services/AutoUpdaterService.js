const { autoUpdater } = require('electron-updater');
const { dialog, app } = require('electron');
const AWS = require('aws-sdk');

class AutoUpdaterService {
  constructor() {
    this.isInitialized = false;
    this.updateAvailable = false;
    this.updateDownloaded = false;
    this.s3Config = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Update available
    autoUpdater.on('update-available', (info) => {
      console.log('🔄 Update available:', info);
      this.updateAvailable = true;
      this.notifyUpdateAvailable(info);
    });

    // Update downloaded
    autoUpdater.on('update-downloaded', (info) => {
      console.log('✅ Update downloaded:', info);
      this.updateDownloaded = true;
      this.notifyUpdateDownloaded(info);
    });

    // Update error
    autoUpdater.on('error', (error) => {
      console.error('❌ Auto-updater error:', error);
      this.notifyUpdateError(error);
    });

    // Check for updates
    autoUpdater.on('checking-for-update', () => {
      console.log('🔍 Checking for updates...');
    });

    // No updates available
    autoUpdater.on('update-not-available', (info) => {
      console.log('✅ No updates available:', info);
    });

    // Download progress
    autoUpdater.on('download-progress', (progressObj) => {
      const percent = Math.round(progressObj.percent);
      console.log(`📥 Download progress: ${percent}%`);
    });
  }

  async initialize(config = {}) {
    try {
      console.log('🔧 Initializing auto-updater...');
      
      // Configure auto-updater
      autoUpdater.autoDownload = config.autoDownload || false;
      autoUpdater.autoInstallOnAppQuit = config.autoInstallOnAppQuit || true;
      
      // Set update server (S3 or GitHub Releases)
      if (config.updateServer) {
        autoUpdater.setFeedURL(config.updateServer);
      }

      // Configure AWS S3 if provided
      if (config.s3) {
        this.s3Config = config.s3;
        this.configureS3Updater();
      }

      this.isInitialized = true;
      console.log('✅ Auto-updater initialized');
      
      // Check for updates on startup
      if (config.checkOnStartup !== false) {
        await this.checkForUpdates();
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize auto-updater:', error);
    }
  }

  configureS3Updater() {
    if (!this.s3Config) return;

    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: this.s3Config.accessKeyId,
      secretAccessKey: this.s3Config.secretAccessKey,
      region: this.s3Config.region || 'us-east-1'
    });

    // Set S3 as update server
    const s3Url = `https://${this.s3Config.bucket}.s3.${this.s3Config.region || 'us-east-1'}.amazonaws.com/`;
    autoUpdater.setFeedURL({
      provider: 's3',
      bucket: this.s3Config.bucket,
      region: this.s3Config.region || 'us-east-1',
      path: this.s3Config.path || 'updates/'
    });

    console.log('☁️ Configured S3 auto-updater:', s3Url);
  }

  async checkForUpdates() {
    if (!this.isInitialized) {
      console.log('⚠️ Auto-updater not initialized');
      return;
    }

    try {
      console.log('🔍 Checking for updates...');
      const result = await autoUpdater.checkForUpdatesAndNotify();
      return result;
    } catch (error) {
      console.error('❌ Failed to check for updates:', error);
      return null;
    }
  }

  async downloadUpdate() {
    if (!this.updateAvailable) {
      console.log('⚠️ No update available to download');
      return false;
    }

    try {
      console.log('📥 Downloading update...');
      await autoUpdater.downloadUpdate();
      return true;
    } catch (error) {
      console.error('❌ Failed to download update:', error);
      return false;
    }
  }

  async installUpdate() {
    if (!this.updateDownloaded) {
      console.log('⚠️ No update downloaded to install');
      return false;
    }

    try {
      console.log('🚀 Installing update...');
      autoUpdater.quitAndInstall();
      return true;
    } catch (error) {
      console.error('❌ Failed to install update:', error);
      return false;
    }
  }

  notifyUpdateAvailable(info) {
    const response = dialog.showMessageBoxSync(null, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available!`,
      detail: 'Would you like to download and install it now?',
      buttons: ['Download Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      this.downloadUpdate();
    }
  }

  notifyUpdateDownloaded(info) {
    const response = dialog.showMessageBoxSync(null, {
      type: 'info',
      title: 'Update Ready',
      message: `Update ${info.version} has been downloaded!`,
      detail: 'The application will restart to install the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      this.installUpdate();
    }
  }

  notifyUpdateError(error) {
    dialog.showErrorBox('Update Error', `Failed to check for updates: ${error.message}`);
  }

  // Get update status
  getUpdateStatus() {
    return {
      isInitialized: this.isInitialized,
      updateAvailable: this.updateAvailable,
      updateDownloaded: this.updateDownloaded,
      currentVersion: app.getVersion()
    };
  }

  // Manual update check (for settings/help menu)
  async manualUpdateCheck() {
    console.log('🔍 Manual update check requested');
    return await this.checkForUpdates();
  }
}

module.exports = AutoUpdaterService;
