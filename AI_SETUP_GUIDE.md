# 🤖 AI Assistant Setup Guide

The TeenyAI browser includes an intelligent AI assistant that can help you navigate web pages and answer questions. To use this feature, you need to set up an API key for one of the supported AI providers.

## Supported AI Providers

- **OpenAI** (GPT-3.5/GPT-4) - Recommended
- **Claude** (Anthropic)
- **Gemini** (Google)

## Quick Setup

### Option 1: Environment Variables (Recommended)

1. **Get an API Key:**
   - OpenAI: Visit [platform.openai.com](https://platform.openai.com/api-keys)
   - Claude: Visit [console.anthropic.com](https://console.anthropic.com/)
   - Gemini: Visit [makersuite.google.com](https://makersuite.google.com/app/apikey)

2. **Set the Environment Variable:**
   
   **Windows (PowerShell):**
   ```powershell
   $env:OPENAI_API_KEY="your_api_key_here"
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   set OPENAI_API_KEY=your_api_key_here
   ```
   
   **macOS/Linux:**
   ```bash
   export OPENAI_API_KEY="your_api_key_here"
   ```

3. **Restart the Application:**
   Close and reopen TeenyAI for the changes to take effect.

### Option 2: Create a .env File

1. Create a `.env` file in the TeenyAI directory
2. Add your API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Restart the application

## Verification

Once set up, you should see:
- ✅ The AI assistant responds to your questions
- ✅ The chat bubble shows "AI Assistant" instead of setup instructions
- ✅ You can ask questions about the current webpage

## Troubleshooting

### AI Assistant Not Responding
- Check that your API key is valid and has sufficient credits
- Verify the environment variable is set correctly
- Restart the application after setting the API key
- Check the console for error messages

### Common Issues
- **"AI service is not available"**: API key not set or invalid
- **"Rate limit exceeded"**: API key has reached usage limits
- **"Insufficient credits"**: Add funds to your API account

## Features

With the AI assistant enabled, you can:
- Ask questions about the current webpage
- Get guidance on how to use interactive elements
- Request explanations of complex content
- Get step-by-step instructions for tasks
- Use the "Fresh Crawl" button to analyze pages for better AI responses

## Security Note

- Never share your API keys
- Keep your API keys secure and private
- Consider using environment variables instead of hardcoding keys
- Monitor your API usage to avoid unexpected charges

## Need Help?

If you're still having issues:
1. Check the troubleshooting panel in the browser
2. Look at the console output for error messages
3. Verify your API key is active and has credits
4. Try a different AI provider if one isn't working
