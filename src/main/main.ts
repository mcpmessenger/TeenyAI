const { app, BrowserWindow, BrowserView, ipcMain, Menu } = require('electron');
const { join } = require('path');
const { isDev } = require('./utils');
const { getAIService } = require('../backend/ai-service');

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
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: join(__dirname, 'preload.js'),
          webSecurity: true,
          allowRunningInsecureContent: false,
          experimentalFeatures: false,
          sandbox: false,
          additionalArguments: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3004');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Create BrowserView for real browser content
  console.log('🔧 Creating BrowserView for real browser...');
  
  webView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true
    }
  });

  console.log('🔧 BrowserView created successfully');

  // Add BrowserView to main window
  mainWindow.setBrowserView(webView);
  console.log('🔧 BrowserView added to main window');

  // Set BrowserView bounds to fill the window (accounting for navigation bar)
  const bounds = mainWindow.getBounds();
  webView.setBounds({ x: 0, y: 60, width: bounds.width, height: bounds.height - 60 });
  console.log('🔧 BrowserView bounds set:', { x: 0, y: 60, width: bounds.width, height: bounds.height - 60 });

  // Load initial page
  webView.webContents.loadURL('https://www.google.com');
  console.log('🔧 Loading initial page: https://www.google.com');
  
  // Listen for BrowserView events
  webView.webContents.on('did-finish-load', () => {
    console.log('✅ BrowserView finished loading:', webView.webContents.getURL());
    // Send URL update to renderer
    mainWindow.webContents.send('url-updated', webView.webContents.getURL());
  });

  webView.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ BrowserView failed to load:', errorDescription);
    mainWindow.webContents.send('load-error', errorDescription);
  });

  webView.webContents.on('did-start-loading', () => {
    console.log('🔄 BrowserView started loading');
    mainWindow.webContents.send('loading-started');
  });

  webView.webContents.on('page-title-updated', (event, title) => {
    console.log('📄 BrowserView page title:', title);
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
ipcMain.handle('ai-query', async (event, query: string, pageContext?: string) => {
  console.log('AI Query received:', query);
  
  const aiService = getAIService();
  if (!aiService) {
    return { 
      response: 'AI service is not available. Please check your OpenAI API key in the .env file.',
      error: true 
    };
  }

  try {
    const response = await aiService.generateGuidance(query, pageContext);
    return { response, error: false };
  } catch (error) {
    console.error('AI Query Error:', error);
    return { 
      response: 'I encountered an error while processing your request. Please try again.',
      error: true 
    };
  }
});

ipcMain.handle('fresh-crawl', async (event, url: string) => {
  // TODO: Implement Playwright crawl
  console.log('Fresh crawl requested for:', url);
  return { success: true, url };
});

ipcMain.handle('get-preview', async (event, elementId: string) => {
  // TODO: Implement preview generation
  console.log('Preview requested for element:', elementId);
  return { mediaUrl: '', type: 'gif' };
});

ipcMain.handle('navigate-to', async (event, url: string) => {
  console.log('Navigation requested to:', url);
  // The webview will handle the actual navigation
  return { success: true };
});

ipcMain.handle('set-theme', async (event, theme: 'light' | 'dark') => {
  console.log('Theme change requested:', theme);
  return { success: true };
});