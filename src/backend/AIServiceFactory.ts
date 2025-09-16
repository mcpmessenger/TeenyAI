import { IAIService } from './interfaces/IAIService';
import { OpenAIService } from './services/OpenAIService';
import { ClaudeAIService } from './services/ClaudeAIService';
import { GeminiAIService } from './services/GeminiAIService';

export type AIProvider = 'openai' | 'claude' | 'gemini';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

/**
 * Factory function to create AI service instances based on provider
 * @param config - Configuration object with provider, apiKey, and optional model
 * @returns IAIService instance for the specified provider
 */
export const createAIService = (config: AIServiceConfig): IAIService => {
  const { provider, apiKey, model } = config;

  if (!apiKey) {
    throw new Error(`API key is required for ${provider} provider`);
  }

  switch (provider.toLowerCase() as AIProvider) {
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
 * @param provider - The AI provider
 * @returns Default model name for the provider
 */
export const getDefaultModel = (provider: AIProvider): string => {
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
 * @returns Array of supported provider names
 */
export const getSupportedProviders = (): AIProvider[] => {
  return ['openai', 'claude', 'gemini'];
};

/**
 * Validate if a provider is supported
 * @param provider - Provider name to validate
 * @returns True if provider is supported
 */
export const isProviderSupported = (provider: string): provider is AIProvider => {
  return getSupportedProviders().includes(provider as AIProvider);
};
