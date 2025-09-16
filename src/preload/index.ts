import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // AI Chat functionality
  sendAIQuery: (query: string, pageContext?: string) => ipcRenderer.invoke('ai-query', query, pageContext),
  
  // Page analysis functionality
  analyzePage: (url: string) => ipcRenderer.invoke('analyze-page', url),
  debugPageContent: (url: string) => ipcRenderer.invoke('debug-page-content', url),
  
  // Fresh crawl functionality
  requestFreshCrawl: (url: string) => ipcRenderer.invoke('fresh-crawl', url),
  
  // Predictive hover functionality
  getPreview: (elementId: string) => ipcRenderer.invoke('get-preview', elementId),
  
  // Page analysis functionality
  getPageAnalysis: () => ipcRenderer.invoke('get-page-analysis'),
  
  // Theme management
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.invoke('set-theme', theme),
  
  // AI Chat panel management
  toggleAIChat: (isOpen: boolean) => ipcRenderer.invoke('toggle-ai-chat', isOpen),
  
  // External browser functionality
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  updateApiKey: (apiKey: string) => ipcRenderer.invoke('update-api-key', apiKey),
  
  // AI Provider management
  updateAIProvider: (provider: string, apiKey: string) => ipcRenderer.invoke('update-ai-provider', provider, apiKey),
  getAIConfig: () => ipcRenderer.invoke('get-ai-config'),
  
  // Enhanced tooltip functionality
  generateTooltip: (url: string, elementInfo: any) => ipcRenderer.invoke('generate-tooltip', url, elementInfo),
  
  // Auto-updater functionality
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  
  // Navigation
  navigateTo: (url: string) => ipcRenderer.invoke('navigate-to', url),
  getCurrentUrl: () => ipcRenderer.invoke('get-current-url'),
  goBack: () => ipcRenderer.invoke('go-back'),
  goForward: () => ipcRenderer.invoke('go-forward'),
  reload: () => ipcRenderer.invoke('reload'),
  
  // Event listeners
  onElementHover: (callback: (elementId: string, position: { x: number, y: number }) => void) => {
    ipcRenderer.on('element-hover', (event, elementId, position) => callback(elementId, position));
  },
  
  onPageLoad: (callback: (url: string) => void) => {
    ipcRenderer.on('page-load', (event, url) => callback(url));
  },
  
  // BrowserView events
  onUrlUpdated: (callback: (url: string) => void) => {
    ipcRenderer.on('url-updated', (event, url) => callback(url));
  },
  
  onLoadError: (callback: (error: string) => void) => {
    ipcRenderer.on('load-error', (event, error) => callback(error));
  },
  
  onLoadingStarted: (callback: () => void) => {
    ipcRenderer.on('loading-started', () => callback());
  },
  
  onLoadingFinished: (callback: () => void) => {
    ipcRenderer.on('loading-finished', () => callback());
  }
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      sendAIQuery: (query: string, pageContext?: string) => Promise<{ response: string; error?: boolean }>;
      analyzePage: (url: string) => Promise<{ analysis: any; error?: string }>;
      debugPageContent: (url: string) => Promise<{ success: boolean; content?: any; error?: string }>;
      requestFreshCrawl: (url: string) => Promise<{ success: boolean; url: string; elementCount?: number; analysis?: any; error?: string }>;
      getPreview: (elementId: string) => Promise<{ mediaUrl: string; type: string; description?: string }>;
      getPageAnalysis: () => Promise<{ success: boolean; analysis?: any; message?: string }>;
      setTheme: (theme: 'light' | 'dark') => Promise<void>;
      toggleAIChat: (isOpen: boolean) => Promise<{ success: boolean }>;
      navigateTo: (url: string) => Promise<{ success: boolean; url?: string; error?: string }>;
      getCurrentUrl: () => Promise<string | null>;
      goBack: () => Promise<boolean>;
      goForward: () => Promise<boolean>;
      reload: () => Promise<boolean>;
      onElementHover: (callback: (elementId: string, position: { x: number, y: number }) => void) => void;
      onPageLoad: (callback: (url: string) => void) => void;
      onUrlUpdated: (callback: (url: string) => void) => void;
      onLoadError: (callback: (error: string) => void) => void;
      onLoadingStarted: (callback: () => void) => void;
      onLoadingFinished: (callback: () => void) => void;
      openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
      updateApiKey: (apiKey: string) => Promise<{ success: boolean; error?: string }>;
      updateAIProvider: (provider: string, apiKey: string) => Promise<{ success: boolean; error?: string }>;
      getAIConfig: () => Promise<{ success: boolean; config?: { provider: string; supportedProviders: string[]; isConfigured: boolean }; error?: string }>;
      generateTooltip: (url: string, elementInfo: any) => Promise<{ success: boolean; data?: any; error?: string }>;
      checkForUpdates: () => Promise<{ success: boolean; result?: any; error?: string }>;
      downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
      installUpdate: () => Promise<{ success: boolean; error?: string }>;
      getUpdateStatus: () => Promise<{ success: boolean; status?: { isInitialized: boolean; updateAvailable: boolean; updateDownloaded: boolean; currentVersion: string }; error?: string }>;
    };
  }
}