const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { join } = require('path');
const { isDev } = require('./utils');
const { createAIService, getSupportedProviders } = require('./backend/AIServiceFactory');
const AutoUpdaterService = require('./backend/services/AutoUpdaterService');

// Load environment variables from .env file
require('dotenv').config({ path: join(app.getAppPath(), '.env') });

let mainWindow = null;
let aiService = null; // Global AI service instance
let autoUpdater = null; // Global auto-updater instance

// Initialize AI service with default configuration
const initializeAIService = () => {
  console.log('🚀 initializeAIService() called!');
  try {
    console.log('🔧 Loading environment variables...');
    console.log(`📁 .env file path: ${join(__dirname, '../../.env')}`);
    
    // Check if .env file exists
    const fs = require('fs');
    const envPath = join(__dirname, '../../.env');
    const envExists = fs.existsSync(envPath);
    console.log(`📄 .env file exists: ${envExists}`);
    
    // Determine which API key is available and set the appropriate provider
    let apiKey = null;
    let provider = 'openai';
    
    console.log(`🔑 OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`🔑 CLAUDE_API_KEY: ${process.env.CLAUDE_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`🔑 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`🔧 AI_PROVIDER: ${process.env.AI_PROVIDER || 'Not set (defaults to openai)'}`);
    
    // Debug: Show actual API key value (first 20 chars for security)
    if (process.env.OPENAI_API_KEY) {
      console.log(`🔍 OPENAI_API_KEY value: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`);
    } else {
      console.log('❌ OPENAI_API_KEY is not set in process.env');
      console.log('🔍 All env vars:', Object.keys(process.env).filter(key => key.includes('API')));
    }
    
    if (process.env.OPENAI_API_KEY) {
      apiKey = process.env.OPENAI_API_KEY;
      provider = 'openai';
      console.log(`✅ Using OpenAI API key from environment: ${apiKey.substring(0, 20)}...`);
    } else if (process.env.CLAUDE_API_KEY) {
      apiKey = process.env.CLAUDE_API_KEY;
      provider = 'claude';
      console.log(`✅ Using Claude API key from environment: ${apiKey.substring(0, 20)}...`);
    } else if (process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY;
      provider = 'gemini';
      console.log(`✅ Using Gemini API key from environment: ${apiKey.substring(0, 20)}...`);
    }
    
    // Override with explicit provider setting if provided
    if (process.env.AI_PROVIDER) {
      provider = process.env.AI_PROVIDER;
      console.log(`🔄 Overriding provider to: ${provider}`);
      // Get the corresponding API key
      if (provider === 'openai' && process.env.OPENAI_API_KEY) {
        apiKey = process.env.OPENAI_API_KEY;
      } else if (provider === 'claude' && process.env.CLAUDE_API_KEY) {
        apiKey = process.env.CLAUDE_API_KEY;
      } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
        apiKey = process.env.GEMINI_API_KEY;
      }
    }
    
    // Fallback: Set a default API key for testing if none found
    if (!apiKey) {
      console.log('⚠️ No API key found in environment variables.');
      console.log('💡 AI service will not be available without a valid API key.');
    }
    
    // Use the API key found in environment variables
    
    if (apiKey) {
      aiService = createAIService({ provider, apiKey });
      console.log(`✅ AI service initialized with ${provider} provider`);
      console.log(`🎯 AI service ready: ${aiService ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Failed to initialize AI service - no API key available');
    }
  } catch (error) {
    console.error('❌ Failed to initialize AI service:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
};

// Initialize auto-updater
const initializeAutoUpdater = () => {
  try {
    console.log('🔄 Initializing auto-updater...');
    autoUpdater = new AutoUpdaterService();
    
    // Configure auto-updater based on environment
    const config = {
      autoDownload: !isDev, // Only auto-download in production
      autoInstallOnAppQuit: true,
      checkOnStartup: !isDev, // Only check on startup in production
      
      // S3 configuration (if environment variables are set)
      s3: process.env.AWS_ACCESS_KEY_ID ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucket: process.env.AWS_S3_BUCKET || 'teenyai-updates',
        region: process.env.AWS_REGION || 'us-east-1',
        path: 'updates/'
      } : null,
      
      // GitHub Releases fallback
      updateServer: process.env.UPDATE_SERVER || 'https://api.github.com/repos/your-username/TeenyAI/releases/latest'
    };
    
    autoUpdater.initialize(config);
    console.log('✅ Auto-updater initialized');
  } catch (error) {
    console.error('❌ Failed to initialize auto-updater:', error);
  }
};

// Initialize services on startup
initializeAIService();
initializeAutoUpdater();

// IPC handlers for navigation - register immediately
console.log('🔧 Registering IPC handlers...');

ipcMain.handle('navigate-to', async (event, url) => {
  console.log('🧭 Navigating to:', url);
  // Navigation is handled by WebView tag in renderer process
  return { success: true, url };
});

ipcMain.handle('get-current-url', async () => {
  // URL is managed by WebView tag in renderer process
  return null;
});

ipcMain.handle('update-api-key', async (event, { provider, apiKey }) => {
  try {
    console.log(`🔄 Updating API key for provider: ${provider}`);
    
    // Validate the API key format
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key provided');
    }
    
    // Reinitialize the AI service with the new key
    aiService = createAIService({ provider, apiKey });
    
    if (aiService) {
      console.log(`✅ API key updated successfully for ${provider}`);
      return { success: true, message: 'API key updated successfully' };
    } else {
      throw new Error('Failed to initialize AI service with new key');
    }
  } catch (error) {
    console.error('❌ Failed to update API key:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('go-back', async () => {
  // Navigation is handled by WebView tag in renderer process
  return false;
});

ipcMain.handle('go-forward', async () => {
  // Navigation is handled by WebView tag in renderer process
  return false;
});

ipcMain.handle('reload', async () => {
  // Navigation is handled by WebView tag in renderer process
  return false;
});

console.log('✅ All IPC handlers registered successfully');

const createWindow = () => {
  const preloadPath = isDev ? join(__dirname, './preload.js') : join(__dirname, 'preload.js');
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
          webviewTag: true,
          enableRemoteModule: false
        },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
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

  // WebView tag is handled in the renderer process
  console.log('🔧 Using WebView tag in renderer process for web content');

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// App event handlers
app.whenReady().then(() => {
  // Initialize services on startup
  initializeAIService();
  initializeAutoUpdater();
  
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
  console.log('🤖 AI Query received:', query);
  console.log('🔍 AI Service status:', aiService ? 'Available' : 'Not available');
  console.log('🔍 AI Service type:', aiService ? aiService.constructor.name : 'null');
  
  if (!aiService) {
    console.log('❌ AI service is null, returning error message');
    return { 
      response: 'AI service is not available. Please set an API key (OPENAI_API_KEY, CLAUDE_API_KEY, or GEMINI_API_KEY) and restart the application.',
      error: true 
    };
  }

  try {
    // Enhanced context with page analysis
    const pageAnalysis = global.pageAnalysis;
    let enhancedContext = pageContext || '';
    
    if (pageAnalysis) {
      enhancedContext += `
Current Page Analysis:
- URL: ${pageAnalysis.url}
- Interactive Elements Found: ${pageAnalysis.interactiveElements.length}
- Elements: ${pageAnalysis.interactiveElements.map(el => `${el.tagName}: "${el.text}"`).join(', ')}

Available Interactive Elements:
${pageAnalysis.interactiveElements.map((el, index) => 
  `${index + 1}. ${el.tagName.toUpperCase()} - "${el.text || 'No text'}" (${el.className || 'No class'})`
).join('\n')}
`;
    }
    
    const response = await aiService.generateGuidance(query, enhancedContext);
    return { response, error: false };
  } catch (error) {
    console.error('❌ AI Query Error:', error);
    return { 
      response: 'I encountered an error while processing your request. Please try again.',
      error: true 
    };
  }
});

ipcMain.handle('fresh-crawl', async (event, url: string) => {
  try {
    console.log('🕷️ Starting fresh crawl for:', url);
    
    // Import Playwright service
    const { getPreviewService } = require('./backend/services/PlaywrightPreviewService');
    const previewService = getPreviewService();
    
    // Initialize if needed
    await previewService.initialize();
    
    // Navigate to the page and analyze it
    await previewService.page.goto(url, { waitUntil: 'networkidle' });
    
    // Get page content and analyze interactive elements
    const pageContent = await previewService.page.content();
    const interactiveElements = await previewService.page.$$eval('button, a, input, select, textarea, [onclick], [role="button"]', elements => 
      elements.map((el, index) => ({
        id: el.id || `element-${index}`,
        tagName: el.tagName.toLowerCase(),
        text: el.textContent?.trim().substring(0, 50) || '',
        className: el.className,
        selector: el.id ? `#${el.id}` : `.${el.className.split(' ')[0]}` || el.tagName.toLowerCase(),
        boundingRect: el.getBoundingClientRect()
      }))
    );
    
    console.log(`✅ Found ${interactiveElements.length} interactive elements`);
    
    // Store page analysis in a simple cache (in production, use proper storage)
    global.pageAnalysis = {
      url,
      content: pageContent,
      interactiveElements,
      timestamp: Date.now()
    };
    
    return { 
      success: true, 
      url,
      elementCount: interactiveElements.length,
      analysis: global.pageAnalysis
    };
  } catch (error) {
    console.error('❌ Fresh crawl failed:', error);
    return { 
      success: false, 
      url,
      error: error.message 
    };
  }
});

ipcMain.handle('get-preview', async (event, elementId: string) => {
  try {
    console.log('🎬 Generating preview for element:', elementId);
    
    // Get the current page analysis
    const pageAnalysis = global.pageAnalysis;
    if (!pageAnalysis) {
      return { 
        mediaUrl: '', 
        type: 'text',
        description: 'Page not analyzed yet. Click "Fresh Crawl" first.' 
      };
    }
    
    // Find the element in our analysis
    const element = pageAnalysis.interactiveElements.find(el => el.id === elementId);
    if (!element) {
      return { 
        mediaUrl: '', 
        type: 'text',
        description: 'Element not found in analysis.' 
      };
    }
    
    // Import Playwright service
    const { getPreviewService } = require('./backend/services/PlaywrightPreviewService');
    const previewService = getPreviewService();
    
    // Generate preview for the element
    const previewData = await previewService.generateElementPreview(
      pageAnalysis.url,
      element.selector,
      element
    );
    
    // Convert base64 screenshot to data URL
    const dataUrl = `data:image/png;base64,${previewData.screenshots.hover}`;
    
    return {
      mediaUrl: dataUrl,
      type: 'image',
      description: `Clicking this ${element.tagName} will: ${element.text || 'Perform an action'}`
    };
  } catch (error) {
    console.error('❌ Preview generation failed:', error);
    return { 
      mediaUrl: '', 
      type: 'text',
      description: 'Preview generation failed. Try refreshing the page.' 
    };
  }
});


ipcMain.handle('set-theme', async (event, theme: 'light' | 'dark') => {
  console.log('Theme change requested:', theme);
  return { success: true };
});

ipcMain.handle('get-page-analysis', async (event) => {
  const pageAnalysis = global.pageAnalysis;
  if (!pageAnalysis) {
    return { 
      success: false, 
      message: 'No page analysis available. Click "Fresh Crawl" first.' 
    };
  }
  
  return { 
    success: true, 
    analysis: pageAnalysis 
  };
});

ipcMain.handle('update-ai-provider', async (event, provider: string, apiKey: string) => {
  try {
    console.log(`🔄 Updating AI provider to: ${provider}`);
    aiService = createAIService({ provider, apiKey });
    return { success: true, provider };
  } catch (error) {
    console.error('❌ Failed to update AI provider:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-ai-config', async (event) => {
  return {
    hasService: !!aiService,
    supportedProviders: getSupportedProviders()
  };
});

// Auto-updater IPC handlers
ipcMain.handle('check-for-updates', async () => {
  try {
    if (!autoUpdater) {
      return { success: false, error: 'Auto-updater not initialized' };
    }
    
    const result = await autoUpdater.manualUpdateCheck();
    return { success: true, result };
  } catch (error) {
    console.error('❌ Failed to check for updates:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    if (!autoUpdater) {
      return { success: false, error: 'Auto-updater not initialized' };
    }
    
    const result = await autoUpdater.downloadUpdate();
    return { success: result, error: result ? null : 'Failed to download update' };
  } catch (error) {
    console.error('❌ Failed to download update:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-update', async () => {
  try {
    if (!autoUpdater) {
      return { success: false, error: 'Auto-updater not initialized' };
    }
    
    const result = await autoUpdater.installUpdate();
    return { success: result, error: result ? null : 'Failed to install update' };
  } catch (error) {
    console.error('❌ Failed to install update:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-update-status', async () => {
  try {
    if (!autoUpdater) {
      return { success: false, error: 'Auto-updater not initialized' };
    }
    
    const status = autoUpdater.getUpdateStatus();
    return { success: true, status };
  } catch (error) {
    console.error('❌ Failed to get update status:', error);
    return { success: false, error: error.message };
  }
});