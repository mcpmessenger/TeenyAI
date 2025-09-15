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
  
  // Event listeners
  onElementHover: (callback: (elementId: string, position: { x: number, y: number }) => void) => {
    ipcRenderer.on('element-hover', (event, elementId, position) => callback(elementId, position));
  },
  
  onPageLoad: (callback: (url: string) => void) => {
    ipcRenderer.on('page-load', (event, url) => callback(url));
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
      navigateTo: (url: string) => Promise<void>;
      onElementHover: (callback: (elementId: string, position: { x: number, y: number }) => void) => void;
      onPageLoad: (callback: (url: string) => void) => void;
    };
  }
}