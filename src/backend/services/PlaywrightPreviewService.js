const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs').promises;

class PlaywrightPreviewService {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🎭 Initializing Playwright for preview generation...');
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
      });
      
      this.page = await this.context.newPage();
      this.isInitialized = true;
      console.log('✅ Playwright initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Playwright:', error);
      throw error;
    }
  }

  async generateElementPreview(url, elementSelector, elementInfo) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🎬 Generating preview for element: ${elementSelector}`);
      
      // Navigate to the page
      await this.page.goto(url, { waitUntil: 'networkidle' });
      
      // Try to find the element with multiple strategies
      let element = null;
      let boundingBox = null;
      
      try {
        // First try the exact selector
        await this.page.waitForSelector(elementSelector, { timeout: 3000 });
        element = await this.page.$(elementSelector);
      } catch (error) {
        console.log(`⚠️ Selector ${elementSelector} not found, trying alternative approaches...`);
        
        // Try to find by text content if it's a simple selector
        if (elementInfo && elementInfo.text) {
          try {
            element = await this.page.locator(`text="${elementInfo.text}"`).first();
            if (await element.count() > 0) {
              element = await element.elementHandle();
            } else {
              element = null;
            }
          } catch (e) {
            console.log('Text-based search failed:', e.message);
          }
        }
        
        // Try to find by tag name and class
        if (!element && elementInfo && elementInfo.tagName) {
          try {
            const tagSelector = elementInfo.className ? 
              `${elementInfo.tagName}.${elementInfo.className.split(' ')[0]}` : 
              elementInfo.tagName;
            element = await this.page.$(tagSelector);
          } catch (e) {
            console.log('Tag-based search failed:', e.message);
          }
        }
      }
      
      if (!element) {
        throw new Error(`Element not found with selector: ${elementSelector}`);
      }
      
      boundingBox = await element.boundingBox();
      
      if (!boundingBox) {
        throw new Error('Element not visible or has no bounding box');
      }

      // Take a screenshot of the element
      const elementScreenshot = await element.screenshot();
      
      // Simulate hover and take another screenshot
      await element.hover();
      await this.page.waitForTimeout(500); // Wait for hover effects
      const hoverScreenshot = await element.screenshot();
      
      // Generate a simple before/after comparison
      const previewData = {
        elementSelector,
        elementInfo,
        screenshots: {
          normal: elementScreenshot.toString('base64'),
          hover: hoverScreenshot.toString('base64')
        },
        boundingBox,
        timestamp: Date.now()
      };

      return previewData;
    } catch (error) {
      console.error('❌ Failed to generate element preview:', error);
      throw error;
    }
  }

  async generateInteractionPreview(url, elementSelector, interactionType = 'click') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🎬 Generating interaction preview: ${interactionType} on ${elementSelector}`);
      
      // Navigate to the page
      await this.page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait for the element
      await this.page.waitForSelector(elementSelector, { timeout: 5000 });
      
      const element = await this.page.$(elementSelector);
      const boundingBox = await element.boundingBox();
      
      if (!boundingBox) {
        throw new Error('Element not visible');
      }

      // Take before screenshot
      const beforeScreenshot = await element.screenshot();
      
      // Perform the interaction
      let afterScreenshot;
      switch (interactionType) {
        case 'click':
          await element.click();
          await this.page.waitForTimeout(1000);
          afterScreenshot = await element.screenshot();
          break;
        case 'hover':
          await element.hover();
          await this.page.waitForTimeout(500);
          afterScreenshot = await element.screenshot();
          break;
        default:
          afterScreenshot = beforeScreenshot;
      }

      return {
        elementSelector,
        interactionType,
        before: beforeScreenshot.toString('base64'),
        after: afterScreenshot.toString('base64'),
        boundingBox,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to generate interaction preview:', error);
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      this.isInitialized = false;
      console.log('🎭 Playwright browser closed');
    }
  }

  // Generate a simple GIF-like preview using multiple screenshots
  async generateGIFPreview(url, elementSelector, steps = 5) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForSelector(elementSelector, { timeout: 5000 });
      
      const element = await this.page.$(elementSelector);
      const screenshots = [];
      
      // Generate multiple frames
      for (let i = 0; i < steps; i++) {
        await this.page.waitForTimeout(200);
        const screenshot = await element.screenshot();
        screenshots.push(screenshot.toString('base64'));
      }

      return {
        elementSelector,
        frames: screenshots,
        frameCount: steps,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to generate GIF preview:', error);
      throw error;
    }
  }
}

// Singleton instance
let previewServiceInstance = null;

const getPreviewService = () => {
  if (!previewServiceInstance) {
    previewServiceInstance = new PlaywrightPreviewService();
  }
  return previewServiceInstance;
};

module.exports = { PlaywrightPreviewService, getPreviewService };
