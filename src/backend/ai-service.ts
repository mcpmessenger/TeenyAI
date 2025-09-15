const OpenAI = require('openai');

class AIService {
  private openai: OpenAI;
  private model: string;

  constructor(config) {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'gpt-3.5-turbo';
  }

  async generateGuidance(query, pageContext) {
    try {
      const systemPrompt = `You are a helpful AI assistant built into a web browser. Your job is to help non-tech-savvy users navigate websites and complete online tasks. 

Guidelines:
- Provide clear, step-by-step instructions
- Use simple, non-technical language
- Be encouraging and supportive
- Focus on what the user should click or do next
- If you see form fields, explain what information goes where
- Always prioritize user safety and privacy

Current page context: ${pageContext || 'No page context available'}`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'I encountered an error while processing your request. Please check your internet connection and try again.';
    }
  }

  async analyzePageElements(pageContent) {
    try {
      const prompt = `Analyze this webpage content and identify the main interactive elements (buttons, links, forms) that a user might want to interact with. Focus on the most important actions a user would typically want to take on this page.

Page content: ${pageContent.substring(0, 2000)}...

Return a JSON object with the main actions and their descriptions.`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.1,
      });

      const response = completion.choices[0]?.message?.content;
      try {
        return JSON.parse(response || '{}');
      } catch {
        return { analysis: response };
      }
    } catch (error) {
      console.error('Page Analysis Error:', error);
      return { error: 'Could not analyze page' };
    }
  }
}

// Singleton instance
let aiServiceInstance = null;

const getAIService = () => {
  if (!aiServiceInstance && process.env.OPENAI_API_KEY) {
    aiServiceInstance = new AIService({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return aiServiceInstance;
};

module.exports = { AIService, getAIService };