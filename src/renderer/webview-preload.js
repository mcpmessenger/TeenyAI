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
  console.log('🔒 WebView preload script: DOMContentLoaded event fired');
  console.log('🔍 Document URL:', document.URL);
  console.log('🔍 Document title:', document.title);
  
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
    element.style.height = '400px';
    element.style.overflow = 'visible';
    element.style.position = 'relative';
    element.style.zIndex = '9999';
  });
  
  // FORCE FULL VIEWPORT - AGGRESSIVE TRUNCATION FIX
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'relative';
  document.body.style.top = '0';
  document.body.style.left = '0';
  document.body.style.height = '100vh';
  document.body.style.minHeight = '100vh';

  document.documentElement.style.margin = '0';
  document.documentElement.style.padding = '0';
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.position = 'relative';
  document.documentElement.style.top = '0';
  document.documentElement.style.left = '0';
  document.documentElement.style.height = '100vh';
  document.documentElement.style.minHeight = '100vh';

  // Add proper viewport meta tag if missing
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewportMeta);
  }
  
  // Debug: Log viewport dimensions (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 WebView viewport dimensions:', {
      windowInnerHeight: window.innerHeight,
      windowInnerWidth: window.innerWidth,
      documentBodyHeight: document.body.offsetHeight,
      documentBodyWidth: document.body.offsetWidth,
      documentElementHeight: document.documentElement.offsetHeight,
      documentElementWidth: document.documentElement.offsetWidth
    });
  }
  
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
          const captchaElements = node.querySelectorAll ? 
            node.querySelectorAll('[data-captcha], .g-recaptcha, .recaptcha, iframe[src*="recaptcha"]') : [];
          
          if (node.matches && node.matches('[data-captcha], .g-recaptcha, .recaptcha, iframe[src*="recaptcha"]')) {
            captchaElements.push(node);
          }
          
          captchaElements.forEach(element => {
            element.style.minWidth = '300px';
            element.style.minHeight = '400px';
            element.style.width = '100%';
            element.style.height = '400px';
            element.style.overflow = 'visible';
            element.style.position = 'relative';
            element.style.zIndex = '9999';
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
  
// SIMPLE EXTERNAL CONTENT FIX - Run every 2 seconds
setInterval(() => {
  try {
    // Simple viewport fix
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.height = '100%';
    document.documentElement.style.overflow = 'visible';
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.height = '100%';
    document.body.style.overflow = 'visible';
    document.body.style.transform = 'none';
    document.body.style.position = 'relative';
    document.body.style.top = '0';
    document.body.style.left = '0';
    
    console.log('🔧 Applied simple preload fix');
  } catch (e) {
    console.error('❌ Error in preload script:', e);
  }
}, 2000);
});

console.log('🔒 WebView preload script loaded with security measures');
