const { createAIService, getSupportedProviders } = require('./AIServiceFactory');

class AIServiceManager {
  constructor() {
    this.currentService = null;
    this.config = {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo'
    };
    this.initializeService();
  }

  initializeService() {
    console.log('🔧 Initializing AI service with provider:', this.config.provider);
    console.log('🔑 API key available:', !!this.config.apiKey);
    
    if (!this.config.apiKey) {
      console.warn('⚠️ API key not found for provider:', this.config.provider);
      this.currentService = null;
      return;
    }

    try {
      this.currentService = createAIService(this.config);
      console.log('✅ AI service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error);
      this.currentService = null;
    }
  }

  updateConfig(newConfig) {
    console.log('🔧 Updating AI service config:', newConfig);
    this.config = { ...this.config, ...newConfig };
    this.initializeService();
  }

  updateApiKey(apiKey) {
    console.log('🔑 Updating API key for provider:', this.config.provider);
    this.config.apiKey = apiKey;
    this.initializeService();
  }

  updateProvider(provider, apiKey) {
    console.log('🔄 Switching AI provider to:', provider);
    this.config.provider = provider;
    this.config.apiKey = apiKey;
    this.initializeService();
  }

  async generateGuidance(query, pageContext) {
    if (!this.currentService) {
      throw new Error(`${this.config.provider} API key not configured. Please set your API key in the settings.`);
    }

    try {
      console.log('🤖 generateGuidance called with query:', query);
      console.log('🤖 Using provider:', this.config.provider);
      
      return await this.currentService.generateGuidance(query, pageContext);
    } catch (error) {
      console.error('AI Service Error:', error);
      return error.message || 'I encountered an error while processing your request. Please try again.';
    }
  }

  async analyzePageElements(pageContent, url) {
    if (!this.currentService) {
      throw new Error(`${this.config.provider} API key not configured. Please set your API key in the settings.`);
    }

    try {
      return await this.currentService.analyzePageElements(pageContent, url);
    } catch (error) {
      console.error('Page Analysis Error:', error);
      return { 
        error: 'Could not analyze page',
        pageType: 'unknown',
        mainPurpose: 'Unable to analyze page content',
        keyActions: [],
        safetyNotes: 'Please be cautious when entering personal information'
      };
    }
  }

  async generateContextualGuidance(query, pageAnalysis, currentUrl) {
    if (!this.currentService) {
      throw new Error(`${this.config.provider} API key not configured. Please set your API key in the settings.`);
    }

    try {
      return await this.currentService.generateContextualGuidance(query, pageAnalysis, currentUrl);
    } catch (error) {
      console.error('Contextual Guidance Error:', error);
      return 'I encountered an error while analyzing the page. Please try again.';
    }
  }

  getCurrentProvider() {
    return this.config.provider;
  }

  getSupportedProviders() {
    return getSupportedProviders();
  }

  isConfigured() {
    return this.currentService !== null;
  }
}

// Singleton instance
let aiServiceManager = null;

const getAIService = () => {
  if (!aiServiceManager) {
    aiServiceManager = new AIServiceManager();
  }
  return aiServiceManager;
};

const updateAIServiceApiKey = (newApiKey) => {
  console.log('🔑 updateAIServiceApiKey called with:', newApiKey?.substring(0, 15) + '...');
  const manager = getAIService();
  manager.updateApiKey(newApiKey);
};

const updateAIServiceProvider = (provider, apiKey) => {
  console.log('🔄 updateAIServiceProvider called with:', provider);
  const manager = getAIService();
  manager.updateProvider(provider, apiKey);
};

const getAIServiceConfig = () => {
  const manager = getAIService();
  return {
    provider: manager.getCurrentProvider(),
    supportedProviders: manager.getSupportedProviders(),
    isConfigured: manager.isConfigured()
  };
};

module.exports = { 
  AIServiceManager, 
  getAIService, 
  updateAIServiceApiKey, 
  updateAIServiceProvider,
  getAIServiceConfig
};

