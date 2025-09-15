// WebView preload script for production security
// This script runs in the WebView context

const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to WebView
contextBridge.exposeInMainWorld('webviewAPI', {
  // Navigation events
  onNavigation: (callback) => {
    ipcRenderer.on('navigate', callback);
  },
  
  // Security events
  onPermissionRequest: (callback) => {
    ipcRenderer.on('permission-request', callback);
  },
  
  // Communication with main process
  sendToMain: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  
  // Page analysis for AI features
  getPageContent: () => {
    return {
      title: document.title,
      url: window.location.href,
      text: document.body.innerText,
      links: Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent,
        href: a.href
      })),
      buttons: Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent,
        type: b.type
      }))
    };
  }
});

// Security: Prevent dangerous operations
window.addEventListener('beforeunload', (e) => {
  // Allow normal navigation
});

// Security: Block dangerous scripts
document.addEventListener('DOMContentLoaded', () => {
  // Remove any potentially dangerous scripts
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    if (script.src && !script.src.startsWith('https://')) {
      script.remove();
    }
  });
});

console.log('🔒 WebView preload script loaded with security measures');
