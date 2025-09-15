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
      const systemPrompt = `You are TeenyAI, an intelligent AI assistant built into a web browser specifically designed to help non-tech-savvy users navigate websites and complete online tasks with confidence.

Your mission is to make the internet accessible and empowering for everyone, especially those who find modern websites confusing or overwhelming.

CORE GUIDELINES:
- Always use simple, clear language that anyone can understand
- Provide step-by-step instructions with specific actions to take
- Be encouraging, patient, and supportive in your tone
- Focus on what the user should click, type, or do next
- Explain WHY each step is important when helpful
- If you see forms, clearly explain what information goes where and why
- Always prioritize user safety, privacy, and security
- If something seems suspicious or unsafe, warn the user
- Use emojis sparingly but effectively to make instructions clearer
- Break down complex processes into manageable steps

CURRENT PAGE CONTEXT:
${pageContext || 'No page context available - please ask the user to describe what they see on the page'}

RESPONSE FORMAT:
- Start with a brief acknowledgment of their question
- Provide clear, numbered steps when giving instructions
- Highlight important buttons, links, or form fields in quotes
- End with encouragement and offer to help with next steps

Remember: You're not just answering questions - you're building the user's confidence and digital literacy.`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 800,
        temperature: 0.4,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'I encountered an error while processing your request. Please check your internet connection and try again.';
    }
  }

  async analyzePageElements(pageContent, url) {
    try {
      const prompt = `Analyze this webpage and provide a comprehensive summary for an AI assistant helping non-tech-savvy users.

URL: ${url}
Page Content: ${pageContent.substring(0, 3000)}...

Please provide a detailed analysis in this JSON format:
{
  "pageType": "e-commerce|banking|social|news|form|search|other",
  "mainPurpose": "What is the primary purpose of this page?",
  "keyActions": [
    {
      "element": "button/link text or description",
      "action": "what happens when clicked",
      "importance": "high|medium|low",
      "description": "simple explanation for non-tech users"
    }
  ],
  "forms": [
    {
      "name": "form name or description",
      "fields": ["field1", "field2"],
      "purpose": "what this form is for"
    }
  ],
  "safetyNotes": "any security or safety considerations",
  "userGuidance": "top 3 things a user should know about this page",
  "commonTasks": ["task1", "task2", "task3"]
}`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 600,
        temperature: 0.2,
      });

      const response = completion.choices[0]?.message?.content;
      try {
        return JSON.parse(response || '{}');
      } catch {
        return { 
          analysis: response,
          pageType: 'unknown',
          mainPurpose: 'Unable to analyze page content',
          keyActions: [],
          safetyNotes: 'Please be cautious when entering personal information',
          userGuidance: ['Take your time', 'Read carefully', 'Ask for help if unsure']
        };
      }
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
    try {
      const contextPrompt = `Based on this page analysis, provide helpful guidance for the user's question.

Page Analysis: ${JSON.stringify(pageAnalysis, null, 2)}
Current URL: ${currentUrl}
User Question: ${query}

Provide specific, actionable guidance that references the actual elements and content on this page.`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are TeenyAI, an AI assistant that helps users navigate websites. Provide clear, step-by-step guidance based on the actual page content.' },
          { role: 'user', content: contextPrompt }
        ],
        max_tokens: 600,
        temperature: 0.3,
      });

      return completion.choices[0]?.message?.content || 'I need more information about the page to help you effectively.';
    } catch (error) {
      console.error('Contextual Guidance Error:', error);
      return 'I encountered an error while analyzing the page. Please try again.';
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