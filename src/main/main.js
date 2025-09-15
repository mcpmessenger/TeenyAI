const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const { join } = require('path');
const { isDev } = require('./utils.js');
const { getAIService, updateAIServiceApiKey } = require('../backend/ai-service.js');

let mainWindow = null;

// IPC handlers for navigation - register immediately
ipcMain.handle('navigate-to', async (event, url) => {
  console.log('🧭 Navigate to:', url);
  // WebView handles navigation internally, just return success
  return { success: true, url };
});

ipcMain.handle('get-current-url', async () => {
  // WebView handles URL tracking internally
  return null;
});

ipcMain.handle('go-back', async () => {
  // WebView handles navigation internally
  return false;
});

ipcMain.handle('go-forward', async () => {
  // WebView handles navigation internally
  return false;
});

ipcMain.handle('reload', async () => {
  // WebView handles reload internally
  return false;
});

// IPC handlers for AI browser functionality
ipcMain.handle('ai-query', async (event, query, pageContext) => {
  console.log('🤖 AI Query received:', query);
  
  const aiService = getAIService();
  if (!aiService) {
    return { 
      response: 'AI service is not available. Please check your OpenAI API key in the Help panel.',
      error: true 
    };
  }

  try {
    // Get page context if not provided
    let context = pageContext;
    if (!context) {
      context = 'No page context available - please describe what you see on the page';
    }

    console.log('🔍 Using page context:', context.substring(0, 100) + '...');
    
    const response = await aiService.generateGuidance(query, context);
    console.log('✅ AI Response generated');
    
    return { 
      response: response,
      error: false 
    };
  } catch (error) {
    console.error('❌ AI Query error:', error);
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
    // For WebView, we can't easily extract page content from main process
    // The renderer will need to handle this
    const pageContent = {
      url: url,
      title: 'Page Analysis',
      text: 'Page content analysis not available in WebView mode',
      buttons: [],
      links: [],
      forms: []
    };

    const analysis = await aiService.analyzePageElements(JSON.stringify(pageContent), url);
    console.log('✅ Page analysis completed');
    
    return { 
      analysis: analysis,
      error: null 
    };
  } catch (error) {
    console.error('❌ Page analysis error:', error);
    return { 
      analysis: null,
      error: 'Failed to analyze page' 
    };
  }
});

// Handle API key updates from renderer
ipcMain.handle('update-api-key', async (event, apiKey) => {
  console.log('🔑 Updating API key from renderer');
  console.log('🔑 Received API key:', apiKey?.substring(0, 15) + '...');
  console.log('🔑 API key type:', typeof apiKey);
  console.log('🔑 API key length:', apiKey?.length);
  
  try {
    updateAIServiceApiKey(apiKey);
    console.log('✅ API key updated successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to update API key:', error);
    return { success: false, error: error.message };
  }
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
  return { success: true };
});

// IPC handler for theme changes
ipcMain.handle('set-theme', async (event, theme) => {
  console.log('Theme change requested:', theme);
  return { success: true };
});

function createWindow() {
  console.log('🔧 Creating main window...');
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: isDev ? join(__dirname, '../../build/preload.js') : join(__dirname, 'preload.js'),
      webviewTag: true, // Enable WebView tag for proper layering
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    titleBarStyle: 'default',
    show: false
  });

  console.log('🔧 Main window created');

  // Load the app
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

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Main window ready to show');
      mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    console.log('🔧 Main window closed');
    mainWindow = null;
  });

  // WebView approach - no BrowserView needed
  console.log('🔧 Using WebView tag approach for proper layering');
  
  // Send message to renderer that web content is ready
  mainWindow.webContents.once('did-finish-load', () => {
    console.log('✅ Main window finished loading, WebView ready');
    mainWindow.webContents.send('webview-ready');
  });

  // Set up context menu for copy/paste and inspect functionality
  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Cut',
        role: 'cut',
        accelerator: 'CmdOrCtrl+X'
      },
      {
        label: 'Copy',
        role: 'copy',
        accelerator: 'CmdOrCtrl+C'
      },
      {
        label: 'Paste',
        role: 'paste',
        accelerator: 'CmdOrCtrl+V'
      },
        { type: 'separator' },
      {
        label: 'Select All',
        role: 'selectall',
        accelerator: 'CmdOrCtrl+A'
      },
        { type: 'separator' },
      {
        label: 'Inspect Element',
        click: () => {
          mainWindow.webContents.inspectElement(params.x, params.y);
        }
      },
      {
        label: 'Open DevTools',
        click: () => {
          mainWindow.webContents.openDevTools();
        }
      }
    ]);
    
    menu.popup();
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('🔧 Registering IPC handlers...');
  console.log('✅ All IPC handlers registered successfully');
  
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    console.log('🚫 Blocked new window creation to:', navigationUrl);
  });
});
