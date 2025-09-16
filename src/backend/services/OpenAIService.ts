import OpenAI from 'openai';
import { IAIService } from '../interfaces/IAIService';

export class OpenAIService implements IAIService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;
  private model: string;

  constructor(config: { apiKey?: string; model?: string } = {}) {
    this.apiKey = config.apiKey || null;
    this.model = config.model || 'gpt-3.5-turbo';
    this.initializeOpenAI();
  }

  private initializeOpenAI(): void {
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key not provided');
      this.openai = null;
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
      });
      console.log('✅ OpenAI service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI service:', error);
      this.openai = null;
    }
  }

  updateApiKey(apiKey: string): void {
    console.log('🔑 Updating OpenAI API key');
    this.apiKey = apiKey;
    this.initializeOpenAI();
  }

  isConfigured(): boolean {
    return this.openai !== null && this.apiKey !== null;
  }

  async generateGuidance(query: string, pageContext: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please set your API key in the settings.');
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
    } catch (error: any) {
      console.error('OpenAI Service Error:', error);
      
      let errorMessage = 'I encountered an error while processing your request. Please check your internet connection and try again.';
      
      if (error.code === 'invalid_api_key') {
        errorMessage = 'Invalid API key. Please check your OpenAI API key in the settings.';
      } else if (error.code === 'insufficient_quota') {
        errorMessage = 'API quota exceeded. Please check your OpenAI account billing.';
      } else if (error.code === 'rate_limit_exceeded') {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error.message?.includes('API key')) {
        errorMessage = 'API key issue. Please verify your key is correct and active.';
      }
      
      throw new Error(errorMessage);
    }
  }

  async analyzePageElements(pageContent: string, url: string): Promise<any> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please set your API key in the settings.');
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

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
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
    } catch (error: any) {
      console.error('OpenAI Page Analysis Error:', error);
      throw new Error('Failed to analyze page content');
    }
  }

  async generateContextualGuidance(query: string, pageAnalysis: any, currentUrl: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please set your API key in the settings.');
    }

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
    } catch (error: any) {
      console.error('OpenAI Contextual Guidance Error:', error);
      throw new Error('Failed to generate contextual guidance');
    }
  }
}
