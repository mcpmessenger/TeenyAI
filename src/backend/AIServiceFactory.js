const { OpenAIService } = require('./services/OpenAIService');
const { ClaudeAIService } = require('./services/ClaudeAIService');
const { GeminiAIService } = require('./services/GeminiAIService');

/**
 * Factory function to create AI service instances based on provider
 * @param {Object} config - Configuration object with provider, apiKey, and optional model
 * @returns {Object} IAIService instance for the specified provider
 */
const createAIService = (config) => {
  const { provider, apiKey, model } = config;

  if (!apiKey) {
    throw new Error(`API key is required for ${provider} provider`);
  }

  switch (provider.toLowerCase()) {
    case 'openai':
      return new OpenAIService({ apiKey, model: model || 'gpt-3.5-turbo' });
    
    case 'claude':
      return new ClaudeAIService({ apiKey, model: model || 'claude-3-haiku-20240307' });
    
    case 'gemini':
      return new GeminiAIService({ apiKey, model: model || 'gemini-1.5-flash' });
    
    default:
      throw new Error(`Unsupported AI provider: ${provider}. Supported providers are: openai, claude, gemini`);
  }
};

/**
 * Get the default model for a given provider
 * @param {string} provider - The AI provider
 * @returns {string} Default model name for the provider
 */
const getDefaultModel = (provider) => {
  switch (provider) {
    case 'openai':
      return 'gpt-3.5-turbo';
    case 'claude':
      return 'claude-3-haiku-20240307';
    case 'gemini':
      return 'gemini-1.5-flash';
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};

/**
 * Get all supported providers
 * @returns {string[]} Array of supported provider names
 */
const getSupportedProviders = () => {
  return ['openai', 'claude', 'gemini'];
};

/**
 * Validate if a provider is supported
 * @param {string} provider - Provider name to validate
 * @returns {boolean} True if provider is supported
 */
const isProviderSupported = (provider) => {
  return getSupportedProviders().includes(provider);
};

module.exports = {
  createAIService,
  getDefaultModel,
  getSupportedProviders,
  isProviderSupported
};
