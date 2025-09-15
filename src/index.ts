// Main export file for NPM package
export { BrowserWindow } from './components/BrowserWindow';
export { AIChatPanel } from './components/AIChatPanel';
export { HoverPreview } from './components/HoverPreview';
export { AIService } from './services/AIService';
export { InteractionSimulator } from './services/InteractionSimulator';

// Types
export type { BrowserState, PreviewData, GuidanceResponse } from './types';

// Configuration
export { createBrowserConfig } from './config/browser-config';

// Main browser initialization
export const initializeAIBrowser = async (config: BrowserConfig) => {
  // Initialize services, setup Playwright, etc.
  return new AIBrowserInstance(config);
};