import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // AI Chat functionality
  sendAIQuery: (query: string, pageContext?: string) => ipcRenderer.invoke('ai-query', query, pageContext),
  
  // Fresh crawl functionality
  requestFreshCrawl: (url: string) => ipcRenderer.invoke('fresh-crawl', url),
  
  // Predictive hover functionality
  getPreview: (elementId: string) => ipcRenderer.invoke('get-preview', elementId),
  
  // Theme management
  setTheme: (theme: 'light' | 'dark') => ipcRenderer.invoke('set-theme', theme),
  
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
      requestFreshCrawl: (url: string) => Promise<{ success: boolean; url: string }>;
      getPreview: (elementId: string) => Promise<{ mediaUrl: string; type: string }>;
      setTheme: (theme: 'light' | 'dark') => Promise<void>;
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
    };
  }
}