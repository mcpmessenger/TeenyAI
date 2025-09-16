import Anthropic from '@anthropic-ai/sdk';
import { IAIService } from '../interfaces/IAIService';

export class ClaudeAIService implements IAIService {
  private anthropic: Anthropic | null = null;
  private apiKey: string | null = null;
  private model: string;

  constructor(config: { apiKey?: string; model?: string } = {}) {
    this.apiKey = config.apiKey || null;
    this.model = config.model || 'claude-3-haiku-20240307';
    this.initializeAnthropic();
  }

  private initializeAnthropic(): void {
    if (!this.apiKey) {
      console.warn('⚠️ Claude API key not provided');
      this.anthropic = null;
      return;
    }

    try {
      this.anthropic = new Anthropic({
        apiKey: this.apiKey,
      });
      console.log('✅ Claude service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Claude service:', error);
      this.anthropic = null;
    }
  }

  updateApiKey(apiKey: string): void {
    console.log('🔑 Updating Claude API key');
    this.apiKey = apiKey;
    this.initializeAnthropic();
  }

  isConfigured(): boolean {
    return this.anthropic !== null && this.apiKey !== null;
  }

  async generateGuidance(query: string, pageContext: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Claude API key not configured. Please set your API key in the settings.');
    }

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

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 800,
        temperature: 0.4,
        system: systemPrompt,
        messages: [
          { role: 'user', content: query }
        ]
      });

      return response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : 'I apologize, but I could not generate a response. Please try again.';
    } catch (error: any) {
      console.error('Claude Service Error:', error);
      
      let errorMessage = 'I encountered an error while processing your request. Please check your internet connection and try again.';
      
      if (error.status === 401) {
        errorMessage = 'Invalid API key. Please check your Claude API key in the settings.';
      } else if (error.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error.message?.includes('API key')) {
        errorMessage = 'API key issue. Please verify your key is correct and active.';
      }
      
      throw new Error(errorMessage);
    }
  }

  async analyzePageElements(pageContent: string, url: string): Promise<any> {
    if (!this.anthropic) {
      throw new Error('Claude API key not configured. Please set your API key in the settings.');
    }

    try {
      // Parse the page content if it's a JSON string
      let content;
      try {
        content = typeof pageContent === 'string' ? JSON.parse(pageContent) : pageContent;
      } catch {
        content = { text: pageContent, url: url };
      }

      const prompt = `Analyze this webpage and provide a comprehensive summary for an AI assistant helping non-tech-savvy users.

URL: ${content.url || url}
Page Title: ${content.title || 'Unknown'}
Page Text: ${content.text ? content.text.substring(0, 2000) : 'No text content available'}
Links Found: ${content.links ? content.links.map((l: any) => l.text + ' -> ' + l.href).join(', ') : 'None'}
Buttons Found: ${content.buttons ? content.buttons.map((b: any) => b.text).join(', ') : 'None'}
Forms Found: ${content.forms ? content.forms.length + ' form(s)' : 'None'}
Headings: ${content.headings ? content.headings.map((h: any) => h.text).join(', ') : 'None'}

IMPORTANT: Look at the actual content and context, not just the URL. For example:
- If the page shows Gmail login/interface, it's Gmail, not Google search
- If the page shows banking content, it's banking, not Google search
- If the page shows e-commerce products, it's shopping, not Google search

Please provide a detailed analysis in this JSON format:
{
  "pageType": "e-commerce|banking|social|news|form|search|email|other",
  "mainPurpose": "What is the primary purpose of this page? Be specific based on actual content.",
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

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 800,
        temperature: 0.2,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      try {
        return JSON.parse(responseText);
      } catch {
        return { 
          analysis: responseText,
          pageType: 'unknown',
          mainPurpose: 'Unable to analyze page content',
          keyActions: [],
          safetyNotes: 'Please be cautious when entering personal information',
          userGuidance: ['Take your time', 'Read carefully', 'Ask for help if unsure']
        };
      }
    } catch (error: any) {
      console.error('Claude Page Analysis Error:', error);
      throw new Error('Failed to analyze page content');
    }
  }

  async generateContextualGuidance(query: string, pageAnalysis: any, currentUrl: string): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Claude API key not configured. Please set your API key in the settings.');
    }

    try {
      const contextPrompt = `Based on this page analysis, provide helpful guidance for the user's question.

Page Analysis: ${JSON.stringify(pageAnalysis, null, 2)}
Current URL: ${currentUrl}
User Question: ${query}

Provide specific, actionable guidance that references the actual elements and content on this page.`;

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 600,
        temperature: 0.3,
        system: 'You are TeenyAI, an AI assistant that helps users navigate websites. Provide clear, step-by-step guidance based on the actual page content.',
        messages: [
          { role: 'user', content: contextPrompt }
        ]
      });

      return response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : 'I need more information about the page to help you effectively.';
    } catch (error: any) {
      console.error('Claude Contextual Guidance Error:', error);
      throw new Error('Failed to generate contextual guidance');
    }
  }
}
