const { app, BrowserWindow, BrowserView, ipcMain, Menu } = require('electron');
const { join } = require('path');
const { isDev } = require('./utils.js');
const { getAIService } = require('../backend/ai-service.js');

let mainWindow = null;
let webView = null; // BrowserView for real browser

// IPC handlers for navigation - register immediately
console.log('🔧 Registering IPC handlers...');

ipcMain.handle('navigate-to', async (event, url) => {
  console.log('🧭 Navigating to:', url);
  if (webView) {
    try {
      await webView.webContents.loadURL(url);
      return { success: true, url };
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'BrowserView not available' };
});

ipcMain.handle('get-current-url', async () => {
  if (webView) {
    return webView.webContents.getURL();
  }
  return null;
});

ipcMain.handle('go-back', async () => {
  if (webView && webView.webContents.canGoBack()) {
    webView.webContents.goBack();
    return true;
  }
  return false;
});

ipcMain.handle('go-forward', async () => {
  if (webView && webView.webContents.canGoForward()) {
    webView.webContents.goForward();
    return true;
  }
  return false;
});

ipcMain.handle('reload', async () => {
  if (webView) {
    webView.webContents.reload();
    return true;
  }
  return false;
});

console.log('✅ All IPC handlers registered successfully');

const createWindow = () => {
  const preloadPath = isDev ? join(__dirname, '../../build/preload.js') : join(__dirname, 'preload.js');
  console.log('🔧 Preload path:', preloadPath);
  console.log('🔧 __dirname:', __dirname);
  console.log('🔧 isDev:', isDev);
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: preloadPath,
          webSecurity: true,
          allowRunningInsecureContent: false,
          experimentalFeatures: false,
          sandbox: false,
          webviewTag: true // Enable WebView tag for proper layering
        },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    // Try to find the correct Vite port
    const findVitePort = async () => {
      const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007];
      for (const port of ports) {
        try {
          const response = await fetch(`http://localhost:${port}`);
          if (response.ok) {
            console.log(`✅ Found Vite on port ${port}`);
            mainWindow.loadURL(`http://localhost:${port}`);
            return;
          }
        } catch (e) {
          // Port not ready, try next
        }
      }
      console.log('❌ No Vite server found, retrying...');
      setTimeout(findVitePort, 1000);
    };
    
    // Start with a delay to let Vite start up
    setTimeout(findVitePort, 2000);
    // DevTools removed for cleaner experience
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      console.log('✅ Main window ready to show');
      mainWindow.show();
    }
  });

  // Handle load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('❌ Main window failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Handle when page loads
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Main window finished loading');
    console.log('🔍 Main window URL:', mainWindow.webContents.getURL());
    console.log('🔍 Main window title:', mainWindow.webContents.getTitle());
  });

  // WebView approach - no BrowserView needed
  console.log('🔧 Using WebView tag approach for proper layering');
  
  // Send message to renderer that web content is ready
  mainWindow.webContents.once('did-finish-load', () => {
    console.log('✅ Main window finished loading, WebView ready');
    mainWindow.webContents.send('webview-ready');
  });
  
  // Listen for BrowserView events
  let loadingTimeout = null;
  const LOADING_TIMEOUT_MS = 10000; // 10 seconds timeout

  webView.webContents.on('did-finish-load', () => {
    console.log('✅ BrowserView finished loading:', webView.webContents.getURL());
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    // Send URL update to renderer
    mainWindow.webContents.send('url-updated', webView.webContents.getURL());
    mainWindow.webContents.send('loading-finished');
  });

  webView.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ BrowserView failed to load:', errorDescription, 'Error Code:', errorCode, 'URL:', validatedURL);
    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    
    // Provide more specific error messages based on error codes
    let userFriendlyMessage = errorDescription;
    if (errorCode === -3) {
      userFriendlyMessage = 'This page cannot be displayed due to security restrictions (X-Frame-Options or CSP)';
    } else if (errorCode === -2) {
      userFriendlyMessage = 'Network error - please check your internet connection';
    } else if (errorCode === -1) {
      userFriendlyMessage = 'Invalid URL or page not found';
    }
    
    mainWindow.webContents.send('load-error', {
      errorCode,
      errorDescription: userFriendlyMessage,
      url: validatedURL
    });
  });

  webView.webContents.on('did-start-loading', () => {
    console.log('🔄 BrowserView started loading');
    mainWindow.webContents.send('loading-started');
    
    // Set a timeout to handle cases where loading never completes
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout reached');
      mainWindow.webContents.send('load-error', {
        errorCode: -999,
        errorDescription: 'Page loading timed out. The site may be slow or unresponsive.',
        url: webView.webContents.getURL()
      });
    }, LOADING_TIMEOUT_MS);
  });

  webView.webContents.on('page-title-updated', (event, title) => {
    console.log('📄 BrowserView page title:', title);
    mainWindow.webContents.send('title-updated', title);
  });

  // Handle navigation events
  webView.webContents.on('will-navigate', (event, navigationUrl) => {
    console.log('🧭 BrowserView will navigate to:', navigationUrl);
    mainWindow.webContents.send('navigation-started', navigationUrl);
  });

  webView.webContents.on('did-navigate', (event, navigationUrl) => {
    console.log('🧭 BrowserView navigated to:', navigationUrl);
    mainWindow.webContents.send('navigation-completed', navigationUrl);
  });

  // Check if BrowserView is working
  setTimeout(() => {
    if (webView) {
      console.log('🔍 BrowserView status check:');
      console.log('- BrowserView exists:', !!webView);
      console.log('- BrowserView URL:', webView.webContents.getURL());
      console.log('- BrowserView loading:', webView.webContents.isLoading());
    } else {
      console.log('❌ BrowserView is null');
    }
  }, 2000);

  // Handle window closed
  mainWindow.on('closed', () => {
    // Clean up loading timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    mainWindow = null;
    webView = null;
  });
};

// App event handlers
app.whenReady().then(() => {
  createWindow();
  
  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for AI browser functionality
ipcMain.handle('ai-query', async (event, query, pageContext) => {
  console.log('🤖 AI Query received:', query);
  
  const aiService = getAIService();
  if (!aiService) {
    return { 
      response: 'AI service is not available. Please check your OpenAI API key in the .env file.',
      error: true 
    };
  }

  try {
    // Get current page context if not provided
    let context = pageContext;
    if (!context && webView) {
      try {
        const currentUrl = webView.webContents.getURL();
        console.log('🔍 Extracting page context from:', currentUrl);
        
        // Get page title and basic info
        const title = webView.webContents.getTitle();
        context = `Page: ${title}\nURL: ${currentUrl}`;
        
        // Try to get page content for analysis
        try {
          const pageContent = await webView.webContents.executeJavaScript(`
            (() => {
              const body = document.body;
              if (!body) return 'Page content not available';
              
              // Extract text content and key elements
              const textContent = body.innerText || body.textContent || '';
              const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'))
                .map(el => el.textContent || el.value || 'Button').join(', ');
              const links = Array.from(document.querySelectorAll('a'))
                .map(el => el.textContent || el.href).slice(0, 10).join(', ');
              const forms = Array.from(document.querySelectorAll('form'))
                .map(el => el.action || 'Form').join(', ');
              
              return {
                title: document.title,
                text: textContent.substring(0, 2000),
                buttons: buttons,
                links: links,
                forms: forms,
                url: window.location.href
              };
            })()
          `);
          
          if (pageContent && typeof pageContent === 'object') {
            context = `Page: ${pageContent.title}
URL: ${pageContent.url}
Content: ${pageContent.text}
Buttons: ${pageContent.buttons}
Links: ${pageContent.links}
Forms: ${pageContent.forms}`;
          }
        } catch (jsError) {
          console.log('⚠️ Could not extract detailed page content:', jsError.message);
        }
      } catch (error) {
        console.log('⚠️ Could not get page context:', error.message);
      }
    }

    console.log('🧠 Processing AI query with context...');
    const response = await aiService.generateGuidance(query, context);
    console.log('✅ AI response generated');
    return { response, error: false };
  } catch (error) {
    console.error('❌ AI Query Error:', error);
    return { 
      response: 'I encountered an error while processing your request. Please try again.',
      error: true 
    };
  }
});

ipcMain.handle('analyze-page', async (event, url) => {
  console.log('🔍 Page analysis requested for:', url);
  
  const aiService = getAIService();
  if (!aiService) {
    return { 
      analysis: null,
      error: 'AI service not available' 
    };
  }

  try {
    if (webView) {
      const currentUrl = webView.webContents.getURL();
      console.log('📄 Analyzing page:', currentUrl);
      
      // Extract page content for analysis
      const pageContent = await webView.webContents.executeJavaScript(`
        (() => {
          const body = document.body;
          if (!body) return 'Page content not available';
          
          return {
            title: document.title,
            text: body.innerText || body.textContent || '',
            url: window.location.href,
            buttons: Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'))
              .map(el => ({ text: el.textContent || el.value, id: el.id, className: el.className })),
            links: Array.from(document.querySelectorAll('a'))
              .map(el => ({ text: el.textContent, href: el.href })).slice(0, 20),
            forms: Array.from(document.querySelectorAll('form'))
              .map(el => ({ action: el.action, method: el.method, inputs: Array.from(el.querySelectorAll('input')).map(input => input.type) }))
          };
        })()
      `);
      
      const analysis = await aiService.analyzePageElements(JSON.stringify(pageContent), currentUrl);
      console.log('✅ Page analysis complete');
      return { analysis, error: false };
    }
    
    return { analysis: null, error: 'No page loaded' };
  } catch (error) {
    console.error('❌ Page analysis error:', error);
    return { analysis: null, error: error.message };
  }
});

ipcMain.handle('fresh-crawl', async (event, url) => {
  // TODO: Implement Playwright crawl
  console.log('Fresh crawl requested for:', url);
  return { success: true, url };
});

ipcMain.handle('get-preview', async (event, elementId) => {
  // TODO: Implement preview generation
  console.log('Preview requested for element:', elementId);
  return { mediaUrl: '', type: 'gif' };
});


ipcMain.handle('set-theme', async (event, theme) => {
  console.log('Theme change requested:', theme);
  return { success: true };
});

// IPC handler for opening external URLs
ipcMain.handle('open-external', async (event, url) => {
  console.log('🌐 Opening external URL:', url);
  try {
    const { shell } = require('electron');
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to open external URL:', error);
    return { success: false, error: error.message };
  }
});

// IPC handler for AI chat panel toggle
ipcMain.handle('toggle-ai-chat', async (event, isOpen) => {
  console.log(`🤖 AI Chat panel toggled: ${isOpen ? 'open' : 'closed'}`);
  
  if (webView && mainWindow) {
    const windowBounds = mainWindow.getBounds();
    const chatPanelWidth = 350; // Width of the AI chat panel
    
    if (isOpen) {
      // Shrink main window to make room for AI chat panel
      console.log(`📏 Shrinking main window to make room for AI chat panel`);
      const newWidth = windowBounds.width - chatPanelWidth;
      mainWindow.setBounds({
        x: windowBounds.x,
        y: windowBounds.y,
        width: newWidth,
        height: windowBounds.height
      });
      
      // Update BrowserView bounds to fit the smaller window
      webView.setBounds({
        x: 0,
        y: 60, // Below navigation bar
        width: newWidth,
        height: windowBounds.height - 60
      });
      console.log(`✅ Main window resized to width: ${newWidth}`);
    } else {
      // Restore full window size when AI chat is closed
      console.log(`📏 Restoring full window size`);
      const originalWidth = windowBounds.width + chatPanelWidth;
      mainWindow.setBounds({
        x: windowBounds.x,
        y: windowBounds.y,
        width: originalWidth,
        height: windowBounds.height
      });
      
      // Update BrowserView bounds to fit the full window
      webView.setBounds({
        x: 0,
        y: 60, // Below navigation bar
        width: originalWidth,
        height: windowBounds.height - 60
      });
      console.log(`✅ Main window restored to width: ${originalWidth}`);
    }
  }
  
  return { success: true };
});