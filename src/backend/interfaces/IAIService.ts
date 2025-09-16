/**
 * Interface for AI service implementations
 * Provides a consistent contract across different AI providers
 */
export interface IAIService {
  /**
   * Generate guidance for a user query with page context
   * @param query - The user's question or request
   * @param pageContext - Context about the current page
   * @returns Promise<string> - AI-generated guidance response
   */
  generateGuidance(query: string, pageContext: string): Promise<string>;

  /**
   * Analyze page elements and content
   * @param pageContent - The page content to analyze
   * @param url - The URL of the page
   * @returns Promise<any> - Structured analysis of the page
   */
  analyzePageElements(pageContent: string, url: string): Promise<any>;

  /**
   * Generate contextual guidance based on page analysis
   * @param query - The user's question
   * @param pageAnalysis - Previously analyzed page data
   * @param currentUrl - Current page URL
   * @returns Promise<string> - Contextual guidance response
   */
  generateContextualGuidance(query: string, pageAnalysis: any, currentUrl: string): Promise<string>;

  /**
   * Update the API key for the service
   * @param apiKey - The new API key
   */
  updateApiKey(apiKey: string): void;

  /**
   * Check if the service is properly configured
   * @returns boolean - True if service is ready to use
   */
  isConfigured(): boolean;
}
