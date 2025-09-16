const { getPreviewService } = require('./PlaywrightPreviewService');
const { getAIService } = require('../ai-service');

class TooltipService {
  constructor() {
    this.previewService = getPreviewService();
    this.aiService = getAIService();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async generateTooltipData(url, elementInfo) {
    const cacheKey = `${url}-${elementInfo.selector}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📋 Using cached tooltip data');
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      console.log(`🎯 Generating tooltip data for element: ${elementInfo.selector}`);
      
      // Generate AI prediction and visual preview in parallel
      const [aiPrediction, visualPreview] = await Promise.allSettled([
        this.generateAIPrediction(url, elementInfo),
        this.generateVisualPreview(url, elementInfo)
      ]);

      const tooltipData = {
        elementInfo,
        url,
        aiPrediction: aiPrediction.status === 'fulfilled' ? aiPrediction.value : null,
        visualPreview: visualPreview.status === 'fulfilled' ? visualPreview.value : null,
        timestamp: Date.now()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: tooltipData,
        timestamp: Date.now()
      });

      return tooltipData;
    } catch (error) {
      console.error('❌ Failed to generate tooltip data:', error);
      throw error;
    }
  }

  async generateAIPrediction(url, elementInfo) {
    try {
      const prompt = `Analyze this interactive element and predict what will happen when a user interacts with it.

Element Information:
- Selector: ${elementInfo.selector}
- Tag: ${elementInfo.tagName}
- Text: ${elementInfo.textContent || 'No text'}
- Attributes: ${JSON.stringify(elementInfo.attributes)}
- Current URL: ${url}

Please provide a concise prediction (2-3 sentences) of what happens when this element is clicked or interacted with. Focus on:
1. What the interaction will do
2. Where the user will be taken or what will change
3. Any important considerations (forms, downloads, external links, etc.)

Keep the response helpful for non-technical users.`;

      const prediction = await this.aiService.generateGuidance(prompt, `Element: ${elementInfo.selector} on ${url}`);
      
      return {
        prediction: prediction,
        confidence: 'high', // Could be enhanced with confidence scoring
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ AI prediction failed:', error);
      return {
        prediction: 'This element will perform an action when clicked. The exact result depends on the website.',
        confidence: 'low',
        error: error.message
      };
    }
  }

  async generateVisualPreview(url, elementInfo) {
    try {
      // Generate a simple hover preview
      const preview = await this.previewService.generateElementPreview(
        url, 
        elementInfo.selector, 
        elementInfo
      );

      return {
        type: 'hover-preview',
        data: preview,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Visual preview generation failed:', error);
      
      // Fallback: return basic element info
      return {
        type: 'fallback',
        data: {
          elementInfo,
          fallback: true,
          message: 'Visual preview unavailable'
        },
        timestamp: Date.now()
      };
    }
  }

  async generateInteractionPreview(url, elementSelector, interactionType = 'click') {
    try {
      const preview = await this.previewService.generateInteractionPreview(
        url, 
        elementSelector, 
        interactionType
      );
      
      return {
        type: 'interaction-preview',
        data: preview,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Interaction preview failed:', error);
      throw error;
    }
  }

  // Clean up old cache entries
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Tooltip cache cleared');
  }
}

// Singleton instance
let tooltipServiceInstance = null;

const getTooltipService = () => {
  if (!tooltipServiceInstance) {
    tooltipServiceInstance = new TooltipService();
  }
  return tooltipServiceInstance;
};

module.exports = { TooltipService, getTooltipService };
