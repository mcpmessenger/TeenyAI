import React, { useState, useEffect } from 'react';

interface AutoUpdaterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoUpdater: React.FC<AutoUpdaterProps> = ({ isOpen, onClose }) => {
  const [updateStatus, setUpdateStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadUpdateStatus();
    }
  }, [isOpen]);

  const loadUpdateStatus = async () => {
    try {
      const response = await window.electronAPI?.getUpdateStatus();
      if (response?.success) {
        setUpdateStatus(response.status);
      }
    } catch (error) {
      console.error('Failed to load update status:', error);
    }
  };

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    try {
      const response = await window.electronAPI?.checkForUpdates();
      if (response?.success) {
        await loadUpdateStatus();
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownloadUpdate = async () => {
    setIsDownloading(true);
    try {
      const response = await window.electronAPI?.downloadUpdate();
      if (response?.success) {
        await loadUpdateStatus();
      }
    } catch (error) {
      console.error('Failed to download update:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInstallUpdate = async () => {
    try {
      const response = await window.electronAPI?.installUpdate();
      if (response?.success) {
        // App will restart automatically
      }
    } catch (error) {
      console.error('Failed to install update:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auto-updater-modal">
      <div className="auto-updater-content">
        <div className="auto-updater-header">
          <h3>🔄 Auto-Updater</h3>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="auto-updater-body">
          {updateStatus && (
            <div className="update-status">
              <div className="status-item">
                <strong>Current Version:</strong> {updateStatus.currentVersion}
              </div>
              <div className="status-item">
                <strong>Update Available:</strong> 
                <span className={`status-badge ${updateStatus.updateAvailable ? 'available' : 'none'}`}>
                  {updateStatus.updateAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="status-item">
                <strong>Update Downloaded:</strong>
                <span className={`status-badge ${updateStatus.updateDownloaded ? 'downloaded' : 'none'}`}>
                  {updateStatus.updateDownloaded ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}

          <div className="update-actions">
            <button
              onClick={handleCheckForUpdates}
              disabled={isChecking}
              className="update-button primary"
            >
              {isChecking ? 'Checking...' : 'Check for Updates'}
            </button>

            {updateStatus?.updateAvailable && !updateStatus?.updateDownloaded && (
              <button
                onClick={handleDownloadUpdate}
                disabled={isDownloading}
                className="update-button secondary"
              >
                {isDownloading ? 'Downloading...' : 'Download Update'}
              </button>
            )}

            {updateStatus?.updateDownloaded && (
              <button
                onClick={handleInstallUpdate}
                className="update-button success"
              >
                Install & Restart
              </button>
            )}
          </div>

          <div className="update-info">
            <h4>How it works:</h4>
            <ul>
              <li>Updates are checked automatically on startup (production only)</li>
              <li>Updates can be downloaded from AWS S3 or GitHub Releases</li>
              <li>You'll be notified when updates are available</li>
              <li>Updates are installed automatically on app restart</li>
            </ul>
          </div>

          <div className="update-settings">
            <h4>Update Sources:</h4>
            <div className="source-info">
              <div className="source-item">
                <strong>Primary:</strong> AWS S3 (if configured)
              </div>
              <div className="source-item">
                <strong>Fallback:</strong> GitHub Releases
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
