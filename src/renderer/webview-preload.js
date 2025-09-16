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
    try {
      // Extract comprehensive page content
      const content = {
        title: document.title || 'Untitled Page',
        url: window.location.href,
        text: document.body ? document.body.innerText : '',
        links: [],
        buttons: [],
        forms: [],
        headings: [],
        images: []
      };

      // Extract links
      try {
        content.links = Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.textContent?.trim() || '',
          href: a.href || '',
          title: a.title || ''
        })).filter(link => link.text && link.href);
      } catch (e) {
        console.warn('Error extracting links:', e);
      }

      // Extract buttons
      try {
        content.buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]')).map(b => ({
          text: b.textContent?.trim() || b.value || '',
          type: b.type || 'button',
          id: b.id || '',
          className: b.className || ''
        })).filter(button => button.text);
      } catch (e) {
        console.warn('Error extracting buttons:', e);
      }

      // Extract forms
      try {
        content.forms = Array.from(document.querySelectorAll('form')).map(form => ({
          action: form.action || '',
          method: form.method || 'get',
          fields: Array.from(form.querySelectorAll('input, select, textarea')).map(field => ({
            type: field.type || field.tagName.toLowerCase(),
            name: field.name || '',
            placeholder: field.placeholder || '',
            required: field.required || false
          }))
        }));
      } catch (e) {
        console.warn('Error extracting forms:', e);
      }

      // Extract headings
      try {
        content.headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
          level: parseInt(h.tagName.charAt(1)),
          text: h.textContent?.trim() || ''
        })).filter(h => h.text);
      } catch (e) {
        console.warn('Error extracting headings:', e);
      }

      // Extract images
      try {
        content.images = Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src || '',
          alt: img.alt || '',
          title: img.title || ''
        })).filter(img => img.src);
      } catch (e) {
        console.warn('Error extracting images:', e);
      }

      return content;
    } catch (error) {
      console.error('Error in getPageContent:', error);
      return {
        title: 'Error extracting content',
        url: window.location.href,
        text: 'Failed to extract page content',
        links: [],
        buttons: [],
        forms: [],
        headings: [],
        images: []
      };
    }
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
