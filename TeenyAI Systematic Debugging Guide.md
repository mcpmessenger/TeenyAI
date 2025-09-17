# TeenyAI Systematic Debugging Guide

This guide provides a systematic approach to debugging common issues encountered in the TeenyAI application, focusing on the critical problems identified: the non-functional AI Assistant and the WebView content truncation.

## 1. AI Assistant Not Working: Root Cause Analysis and Debugging Steps

### 1.1 Problem Description

The AI Chat Assistant in TeenyAI is reported as non-functional. The primary symptom is that the `initializeAIService()` function, responsible for setting up the AI service, is not being called during application startup. This leads to the AI service remaining `null` and the display of an "AI service is not available" error message. Additionally, API key detection issues have been noted, where valid API keys are not being recognized.

### 1.2 Identified Root Causes

Based on the `README.md` and `KNOWN_ISSUES.md` files, several potential root causes contribute to the AI Assistant's malfunction:

*   **`initializeAIService()` not being called:** The most critical observation is that the `initializeAIService()` function, despite being present in `src/main/main.ts`, does not appear to execute during the application's startup sequence. This prevents the AI service from ever being instantiated.
*   **Environment Variable Persistence:** API keys set as environment variables (e.g., in PowerShell) might not persist across Electron application restarts or might not be correctly loaded by the `dotenv` configuration.
*   **Key Format Issues:** Although less likely given the `README.md` states fixes for `sk-proj-` prefixes, incorrect formatting (e.g., extra whitespace) when copying API keys could still lead to validation failures.
*   **Service Initialization Timing:** There's a possibility that the AI service attempts to initialize before environment variables are fully loaded or before the Electron `app.whenReady()` event has fired, leading to `null` API keys.
*   **Provider Detection Logic:** The logic within `initializeAIService()` to detect and select the correct AI provider (OpenAI, Claude, Gemini) based on available API keys might have flaws or edge cases that prevent it from correctly identifying and using a provided key.

### 1.3 Debugging Steps for AI Assistant

To systematically debug the AI Assistant issue, follow these steps:

#### Step 1: Verify `initializeAIService()` Execution

1.  **Add Console Logs:** Ensure that the `console.log` statements within `initializeAIService()` in `src/main/main.ts` are actually appearing in the Electron main process console. If they are not, it confirms the function is not being called.
    ```typescript
    // src/main/main.ts
    const initializeAIService = () => {
      console.log("🚀 initializeAIService() called!"); // Add this line
      // ... rest of the function
    };
    
    // ... later in the file
    app.whenReady().then(() => {
      initializeAIService(); // Ensure this call is present and reached
      // ...
    });
    ```
2.  **Check Call Stack:** If the logs don't appear, use a debugger (e.g., VS Code's Electron debugger) to set a breakpoint at the start of `initializeAIService()` and observe if it's hit. Examine the call stack to understand how the function is (or isn't) being invoked.

#### Step 2: Environment Variable Loading and API Key Detection

1.  **Verify `.env` File Path:** The `main.ts` uses `require('dotenv').config({ path: join(app.getAppPath(), '.env') });`. Verify that `app.getAppPath()` correctly points to the project root where your `.env` file is located. Add a `console.log(app.getAppPath())` to confirm.
2.  **Check `fs.existsSync`:** The code already includes a check for `.env` file existence. Ensure `console.log("📄 .env file exists: ${envExists}")` reports `true`.
3.  **Inspect `process.env`:** After `dotenv.config()`, log the entire `process.env` object (or at least the relevant API keys) to confirm that `OPENAI_API_KEY`, `CLAUDE_API_KEY`, or `GEMINI_API_KEY` are correctly loaded.
    ```typescript
    // src/main/main.ts, inside initializeAIService()
    console.log("All process.env keys:", Object.keys(process.env));
    console.log("OPENAI_API_KEY from process.env:", process.env.OPENAI_API_KEY);
    // ... and for other providers
    ```
4.  **Test with Hardcoded Key (Temporary):** To rule out environment variable issues, temporarily hardcode an API key directly within `initializeAIService()` to see if the AI service initializes. **Remember to remove this before committing!**
    ```typescript
    // src/main/main.ts, inside initializeAIService()
    let apiKey = "sk-YOUR_HARDCODED_OPENAI_KEY"; // TEMPORARY!
    let provider = "openai"; // TEMPORARY!
    // ... then proceed with createAIService({ provider, apiKey });
    ```
5.  **Validate Key Format:** Double-check that the API key in your `.env` file or environment variables is correctly formatted and does not contain any leading/trailing whitespace or invalid characters.

#### Step 3: `createAIService` and `AIServiceFactory`

1.  **Inspect `createAIService`:** Ensure that the `createAIService` function (from `AIServiceFactory.ts`) is correctly receiving the `provider` and `apiKey` arguments. Add logs within `createAIService` to verify.
2.  **Check `AIServiceFactory` Logic:** Review `src/main/backend/AIServiceFactory.ts` to ensure that it correctly instantiates the appropriate AI service (e.g., `OpenAIService`) based on the `provider` string and that the instantiated service correctly uses the `apiKey`.

#### Step 4: Renderer Process Communication

1.  **`ai-query` IPC Handler:** The `ipcMain.handle('ai-query', ...)` function is where the renderer process communicates with the main process for AI queries. Ensure that `aiService` is not `null` within this handler. If it is, the problem lies in the main process initialization.
2.  **Renderer Side Check:** In the renderer process (e.g., `src/renderer/App.tsx`), verify that the `window.electronAPI.aiQuery()` call is being made and that it correctly handles the response, especially the `error: true` case.

## 2. WebView Content Truncation Issue: Root Cause Analysis and Debugging Steps

### 2.1 Problem Description

External web content displayed within the Electron WebView is severely truncated, showing only the top 20% of the content with a large white space below. This occurs despite `electronAPI` functioning, JavaScript injection executing successfully, and the WebView reporting correct dimensions. The blue splash page, however, displays perfectly, suggesting the container CSS is generally correct.

### 2.2 Identified Root Causes

Based on `MANUAL_HELP_REQUEST_WebView_Truncation.md`, the following are potential root causes:

*   **Electron WebView Limitations/Bugs:** Electron's `<webview>` tag might have inherent rendering or layout issues, especially with complex external web pages that use their own aggressive styling or JavaScript to manage layout.
*   **CSS Specificity Conflicts:** External websites often have very specific and `!important` CSS rules that could override the styles injected or applied by TeenyAI, leading to incorrect layout calculations within the WebView's document.
*   **Timing Issues:** The CSS or JavaScript fixes might be applied too early or too late in the page loading lifecycle of the external content, before the page's own layout engine has settled or after it has already rendered incorrectly.
*   **Viewport Meta Tag Conflicts:** External pages might define conflicting viewport meta tags that interfere with how the WebView calculates its renderable area.
*   **WebView Sandbox/Security Restrictions:** Security features of the WebView might prevent certain CSS or JavaScript manipulations from taking full effect, especially if they are seen as interfering with the loaded page's integrity.
*   **BrowserView vs. WebView Tag:** The `README.md` mentions that the critical layering issue was resolved by moving from `BrowserView` to `WebView` tag, but the `MANUAL_HELP_REQUEST_WebView_Truncation.md` suggests switching *back* to `BrowserView` as a potential solution. This indicates a complex interplay of rendering contexts.

### 2.3 Debugging Steps for WebView Truncation

To systematically debug the WebView truncation issue, follow these steps:

#### Step 1: In-depth CSS Inspection

1.  **Open WebView DevTools:** The most crucial step is to open the Developer Tools for the *WebView itself*. This can usually be done by right-clicking on the WebView content (if interactive) or by using `mainWindow.webContents.openDevTools()` and then selecting the WebView's `WebContents` from the DevTools dropdown.
2.  **Inspect Elements:** Examine the `html` and `body` elements, as well as the main content containers of the truncated external page. Look for:
    *   `height` and `min-height` properties: Are they correctly set to `100%` or `100vh`?
    *   `overflow` properties: Is `overflow: hidden` or `overflow: auto` being applied unexpectedly?
    *   `position` properties: Are elements positioned absolutely or relatively in a way that constrains their height?
    *   `transform` properties: Are any CSS transforms affecting the layout or scaling?
3.  **Computed Styles:** Check the "Computed" tab in DevTools to see the final, applied styles for the `html` and `body` elements. This will reveal any conflicting styles or overrides.
4.  **CSS `!important` Usage:** Experiment with adding `!important` to critical CSS properties (e.g., `height`, `min-height`, `overflow`) within the injected CSS to see if it forces the desired layout. Be cautious, as excessive `!important` can lead to maintenance issues.

#### Step 2: Timing and Event Listeners

1.  **Inject JavaScript at Different Stages:** Experiment with injecting the CSS/JavaScript fixes at different points in the WebView's lifecycle:
    *   **`dom-ready` event:** Inject when the DOM is ready.
    *   **`did-finish-load` event:** Inject after the page has fully loaded.
    *   **`did-frame-finish-load` event:** For specific frames.
    *   **`setInterval` / `MutationObserver`:** As already attempted, but re-evaluate the conditions and targets.
2.  **Monitor Layout Changes:** Use `MutationObserver` to detect changes to the `html` or `body` elements' styles or attributes that might be causing the truncation. Log these changes to the WebView's console.

#### Step 3: WebView Configuration and Alternatives

1.  **Review `webpreferences`:** Carefully re-examine the `webpreferences` settings for the WebView in `src/main/main.ts` and `src/renderer/App.tsx` (if configured there). Specifically, look at:
    *   `webSecurity`: Try temporarily disabling it (`webSecurity: false`) **for debugging purposes only** to see if it's blocking any injected scripts/styles. **Re-enable for production!**
    *   `allowRunningInsecureContent`: Ensure this is not causing unexpected behavior.
    *   `sandbox`: If `true`, it might restrict DOM manipulation. The current setting is `false`, which is good.
2.  **Try `BrowserView` (Main Process):** The `MANUAL_HELP_REQUEST_WebView_Truncation.md` suggests trying `BrowserView`. This is a more powerful, main-process-controlled component that might bypass some of the rendering limitations of the `<webview>` tag. This would require a significant architectural change, moving web content rendering logic from the renderer process to the main process.
    *   **Pros:** More control, potentially avoids renderer process conflicts.
    *   **Cons:** More complex to implement, requires IPC for all interactions.
3.  **Try `iframe` (Renderer Process):** While simpler, `iframe`s have their own set of security and styling challenges, especially with cross-origin content. It's generally less preferred in Electron for full browser functionality than `BrowserView` or `webview`.
4.  **Viewport Meta Tag Injection:** Injecting a standard viewport meta tag (`<meta name="viewport" content="width=device-width, initial-scale=1.0">`) into the WebView's `head` might help standardize how the page perceives its own dimensions.

#### Step 4: Isolate and Test

1.  **Minimal Reproducible Example:** Create a minimal HTML file with just a WebView and try to reproduce the truncation with a simple external page (e.g., `google.com`). This helps isolate the problem from other TeenyAI components.
2.  **Test Specific Websites:** Test with various websites to see if the truncation is universal or specific to certain complex sites (e.g., Google services). This can indicate if the issue is related to specific site's defensive coding.

## 3. General Debugging Best Practices for TeenyAI

*   **Use Electron DevTools:** Always have the main process and renderer process DevTools open. Look for errors, warnings, and console logs.
*   **Isolate Components:** When debugging, try to isolate the problematic component. For example, if the AI assistant isn't working, temporarily disable other features to focus solely on the AI service initialization.
*   **Version Control:** Make small, incremental changes and commit frequently. This allows you to easily revert if a change introduces new issues.
*   **Read Electron Documentation:** Consult the official Electron documentation for `BrowserWindow`, `ipcMain`, `ipcRenderer`, `webview` tag, and `BrowserView` for up-to-date best practices and known issues.
*   **Community Forums/GitHub Issues:** Search Electron's GitHub issues and community forums for similar problems. It's likely someone else has encountered and potentially solved these issues.
*   **Logging:** Implement comprehensive logging throughout the application, especially in critical paths like service initialization and IPC communication. Use different log levels (e.g., `debug`, `info`, `error`).

---

*This guide was generated by Manus AI based on the provided TeenyAI GitHub repository information. Last updated: September 17, 2025.*

