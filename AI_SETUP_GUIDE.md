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

### Critical: AI Service Initialization Failure

If you see the "AI service is not available" message even after setting a valid API key, the core `initializeAIService()` function in the main Electron process might not be executing. This is a critical blocker.

**How to Check:**
1. **Open Electron Main Process Console:** When running `npm run dev`, open the developer tools for the main Electron window (usually `View > Toggle Developer Tools`). Look for the log `🚀 initializeAIService() called!`. If this message is absent, the function is not being invoked.
2. **Verify `app.whenReady()`:** Ensure that the call to `initializeAIService()` is correctly placed within the `app.whenReady().then(() => { ... });` block in `src/main/main.ts`. This ensures the service initializes after Electron is ready.

**Potential Fixes:**
- **Review `src/main/main.ts`:** Confirm that `initializeAIService()` is explicitly called within `app.whenReady()`. If it's commented out or missing, re-add it.
- **Debugging with Breakpoints:** Use a debugger (e.g., VS Code's Electron debugger) to set a breakpoint at the start of `initializeAIService()` to confirm if the execution flow reaches it.

### Environment Variable Loading Issues

Even if you've set your API key, the application might not be loading it correctly.

**How to Check:**
1. **Verify `.env` File Location:** The application expects the `.env` file in the project root. In `src/main/main.ts`, look for the `console.log` statement that shows `📁 .env file path: ...` and `📄 .env file exists: true/false`. Ensure it points to the correct location and reports `true`.
2. **Inspect `process.env`:** Add temporary `console.log` statements in `src/main/main.ts` (inside `initializeAIService()`) to print the values of `process.env.OPENAI_API_KEY` (or other relevant keys) *after* `require('dotenv').config()`. This will confirm if the keys are being read into the application's environment.
   ```typescript
   // Temporary debug code in src/main/main.ts
   console.log("DEBUG: OPENAI_API_KEY from process.env:", process.env.OPENAI_API_KEY ? "Loaded" : "Not Loaded");
   ```

**Potential Fixes:**
- **Correct `.env` Path:** If the `.env` file path is incorrect, adjust the `path` argument in `require('dotenv').config({ path: ... });` to point to the absolute path of your `.env` file.
- **Restart Electron:** Always ensure you fully restart the Electron application (not just the dev server) after making changes to `.env` files or system environment variables.

### AI Provider Detection

TeenyAI automatically detects the AI provider based on which API key is present (`OPENAI_API_KEY`, `CLAUDE_API_KEY`, `GEMINI_API_KEY`). If multiple are set, it prioritizes OpenAI.

**To force a specific provider:**
- Set the `AI_PROVIDER` environment variable in your `.env` file:
  ```
  AI_PROVIDER=claude
  CLAUDE_API_KEY=your_claude_key_here
  ```
  (Replace `claude` with `openai` or `gemini` as needed).

### WebView Display Issues

If the AI Assistant panel appears but its content (or any web content) is severely truncated or misaligned, this is likely a WebView rendering issue, not an API key problem. Please refer to the `MANUAL_HELP_REQUEST_WebView_Truncation.md` for detailed troubleshooting steps on WebView content truncation.

### AI Assistant Not Responding
- Check that your API key is valid and has sufficient credits
- Verify the environment variable is set correctly
- Restart the application after setting the API key
- Check the console for error messages

### Common Issues
- **"AI service is not available"**: API key not set or invalid, or `initializeAIService()` not executing
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
