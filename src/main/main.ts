const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { join } = require('path');
const { isDev } = require('./utils');
const { getAIService } = require('../backend/ai-service');

let mainWindow = null;

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
      webSecurity: false,
      allowRunningInsecureContent: true,
      experimentalFeatures: true,
      sandbox: false
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');
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

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
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