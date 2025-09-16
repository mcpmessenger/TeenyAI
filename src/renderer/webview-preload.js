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

// Security: Block dangerous scripts (but allow necessary ones for rendering)
document.addEventListener('DOMContentLoaded', () => {
  // Only remove scripts that are clearly dangerous, not all non-HTTPS scripts
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    if (script.src && script.src.startsWith('javascript:') || script.src.startsWith('data:')) {
      script.remove();
    }
  });
  
  // Ensure CAPTCHA elements are properly sized
  const captchaElements = document.querySelectorAll('[data-captcha], .g-recaptcha, .recaptcha, iframe[src*="recaptcha"]');
  captchaElements.forEach(element => {
    element.style.minWidth = '300px';
    element.style.minHeight = '400px';
    element.style.width = '100%';
    element.style.height = 'auto';
  });
  
  // Handle Google reCAPTCHA specifically
  const recaptchaFrames = document.querySelectorAll('iframe[src*="recaptcha"]');
  recaptchaFrames.forEach(iframe => {
    iframe.style.width = '100%';
    iframe.style.height = '400px';
    iframe.style.minHeight = '400px';
    iframe.style.border = 'none';
  });
  
  // Remove scrollbars from the main document
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  
  // Debug: Log viewport dimensions
  console.log('🔍 WebView viewport dimensions:', {
    windowInnerHeight: window.innerHeight,
    windowInnerWidth: window.innerWidth,
    documentBodyHeight: document.body.offsetHeight,
    documentBodyWidth: document.body.offsetWidth,
    documentElementHeight: document.documentElement.offsetHeight,
    documentElementWidth: document.documentElement.offsetWidth
  });
  
  // Ensure all iframes don't have scrollbars
  const allIframes = document.querySelectorAll('iframe');
  allIframes.forEach(iframe => {
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
  });
  
  // Watch for dynamically loaded CAPTCHAs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Check if the added node is a CAPTCHA element
          const captchaElements = node.querySelectorAll ? 
            node.querySelectorAll('[data-captcha], .g-recaptcha, .recaptcha, iframe[src*="recaptcha"]') : [];
          
          // Also check if the node itself is a CAPTCHA element
          if (node.matches && node.matches('[data-captcha], .g-recaptcha, .recaptcha, iframe[src*="recaptcha"]')) {
            captchaElements.push(node);
          }
          
          captchaElements.forEach(element => {
            element.style.minWidth = '300px';
            element.style.minHeight = '400px';
            element.style.width = '100%';
            element.style.height = 'auto';
            
            if (element.tagName === 'IFRAME') {
              element.style.height = '400px';
              element.style.minHeight = '400px';
              element.style.border = 'none';
              element.style.overflow = 'hidden';
              element.scrolling = 'no';
            }
          });
          
          // Also handle any new iframes
          const newIframes = node.querySelectorAll ? node.querySelectorAll('iframe') : [];
          newIframes.forEach(iframe => {
            iframe.style.overflow = 'hidden';
            iframe.scrolling = 'no';
          });
        }
      });
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

console.log('🔒 WebView preload script loaded with security measures');
