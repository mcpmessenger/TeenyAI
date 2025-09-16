# TeenyAI AI Development Instructions

This document outlines the development instructions for implementing the proposed upgrades to the TeenyAI browser extension, focusing on multi-provider AI API support and advanced tooltip functionality with visual previews.

## 1. Multi-Provider AI API Integration (Claude & Gemini)

### Objective
To enable TeenyAI to utilize AI services from OpenAI, Claude, and Gemini, allowing users to choose their preferred provider.

### Architectural Changes

1.  **Define an `IAIService` Interface:**
    Create a TypeScript interface (`IAIService`) that defines the common methods for all AI services (`generateGuidance`, `analyzePageElements`, `generateContextualGuidance`). This ensures a consistent contract across different providers.

    ```typescript
    // src/backend/interfaces/IAIService.ts
    export interface IAIService {
      generateGuidance(query: string, pageContext: string): Promise<string>;
      analyzePageElements(pageContent: string, url: string): Promise<any>;
      generateContextualGuidance(query: string, pageAnalysis: any, currentUrl: string): Promise<string>;
    }
    ```

2.  **Implement Provider-Specific Services:**
    Create concrete classes (`OpenAIService`, `ClaudeAIService`, `GeminiAIService`) that implement the `IAIService` interface. Each class will encapsulate the specific API client initialization and method calls for its respective AI provider.

    *   **`OpenAIService`**: Adapt the existing `AIService` logic in `src/backend/ai-service.ts` to implement `IAIService`.
    *   **`ClaudeAIService`**: 
        *   Install the Anthropic AI SDK: `npm install @anthropic-ai/sdk`.
        *   Implement the `IAIService` methods using the Claude API. For example, `generateGuidance` would use `anthropic.messages.create`.
        *   Handle Claude's specific message formats and response structures.
    *   **`GeminiAIService`**: 
        *   Install the Google Generative AI SDK: `npm install @google/generative-ai`.
        *   Implement the `IAIService` methods using the Gemini API. For example, `generateGuidance` would use `model.generateContent`.
        *   Handle Gemini's specific message formats and response structures.

3.  **AI Service Factory:**
    Modify `src/backend/ai-service.ts` to include a factory function (e.g., `createAIService`) that dynamically instantiates the correct service based on a `provider` string and `apiKey`.

    ```typescript
    // src/backend/ai-service.ts (simplified)
    import { IAIService } from './interfaces/IAIService';
    import { OpenAIService } from './services/OpenAIService';
    import { ClaudeAIService } from './services/ClaudeAIService';
    import { GeminiAIService } from './services/GeminiAIService';

    export const createAIService = (provider: string, apiKey: string): IAIService => {
      switch (provider.toLowerCase()) {
        case 'openai':
          return new OpenAIService(apiKey);
        case 'claude':
          return new ClaudeAIService(apiKey);
        case 'gemini':
          return new GeminiAIService(apiKey);
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    };
    ```

### Configuration and User Interface

1.  **Backend Configuration**: Update the backend to read the selected AI provider and API key from environment variables or a persistent configuration store.
2.  **Frontend Settings**: 
    *   Develop a new settings UI in `src/renderer` (e.g., a React component) where users can select their preferred AI provider (dropdown) and input their respective API keys.
    *   Store these settings securely (e.g., using Electron's `ipcRenderer` to communicate with the main process for secure storage).

## 2. Tooltip Function with Visual Previews (Phase 2)

### Objective
To provide proactive, visual guidance to users by displaying AI-predicted actions and Playwright-generated screenshots/GIFs when hovering over interactive elements.

### Implementation Steps

1.  **Element Identification and Data Extraction (Backend)**:
    *   Enhance the `analyzePageElements` method in the chosen `IAIService` implementation (or a new dedicated service) to perform more detailed scraping.
    *   Use Playwright (already integrated) to query the DOM for interactive elements (buttons, links, inputs, etc.).
    *   For each element, extract its `selector` (e.g., CSS selector, XPath), `textContent`, `aria-label`, `href` (for links), and other relevant attributes.
    *   Return a structured list of these elements as part of the page analysis.

2.  **Anticipatory AI (Predictive Hover Logic)**:
    *   When the frontend detects a hover event on an interactive element, send the element's details (selector, text, current page context) to the backend.
    *   The backend will then call the AI service (e.g., `generateContextualGuidance` or a new `predictElementAction` method) with this context.
    *   The AI's prompt should instruct it to predict the outcome of interacting with the element in a concise, user-friendly manner.

3.  **Visual Preview Generation (Backend - Playwright)**:
    *   **Dedicated Playwright Instance**: Consider running a separate, possibly headless, Playwright browser instance in the backend specifically for generating visual previews. This prevents interference with the user's active browsing session.
    *   **Screenshot/GIF Capture Logic**: 
        *   Upon receiving a request for a visual preview for a specific element, navigate the headless Playwright instance to the current page URL.
        *   Locate the element using its selector.
        *   **For Screenshots**: Take a screenshot of the element *before* interaction. Then, programmatically trigger the interaction (e.g., `element.click()`) and take another screenshot *after* the interaction. Combine these into a single image or display them sequentially.
        *   **For GIFs**: Use Playwright's video recording capabilities or a sequence of screenshots to create a short GIF of the interaction. This might require external libraries or more complex processing.
        *   **Performance**: Implement caching for generated visuals. Prioritize generating visuals for frequently interacted elements or on-demand for the first hover. Consider a 

lower frame rate or resolution for GIFs to manage file size.

4.  **Tooltip UI Integration (Frontend)**:
    *   Create a React component in `src/renderer` that acts as the tooltip.
    *   This component should appear when a user hovers over an interactive element.
    *   It will display the AI-predicted action text and the generated visual preview (screenshot or GIF).
    *   Ensure the tooltip is styled to be non-intrusive and responsive.
    *   Implement debouncing for hover events to prevent excessive API calls and visual generation requests.

## 3. Add a Button for Fresh Crawl to the Nav Bar

### Objective
To provide users with a direct and intuitive way to re-trigger the page analysis process.

### Implementation Steps

1.  **Locate Navigation Bar Component:**
    Identify the React component responsible for rendering the navigation bar in `src/renderer`. This might be in `src/renderer/components/Navbar.tsx` or similar.

2.  **Add Button Element:**
    Insert a new `<button>` element into the navigation bar. Label it clearly, e.g., "Re-analyze Page" or "Fresh Crawl."

    ```tsx
    // Example: src/renderer/components/Navbar.tsx
    <button onClick={handleFreshCrawl}>
      Re-analyze Page
    </button>
    ```

3.  **Implement Event Handler:**
    *   Create an event handler function (`handleFreshCrawl`) that will be called when the button is clicked.
    *   This function should communicate with the Electron main process (via `ipcRenderer`) to trigger the `analyzePageElements` function in the backend.
    *   During the analysis, display a loading indicator in the UI to inform the user that the process is underway.
    *   Once the analysis is complete, update the UI with the new page analysis data.

## 4. General Development Best Practices

*   **Error Handling**: Implement robust error handling for all API calls and Playwright operations. Provide user-friendly error messages.
*   **Security**: Ensure API keys are handled securely (e.g., never expose them in frontend code, use environment variables, or secure storage mechanisms).
*   **Performance Optimization**: Continuously monitor and optimize the performance of AI calls and visual generation, especially for the tooltip feature.
*   **Testing**: Write comprehensive unit and integration tests for all new features, particularly for the AI service abstraction and Playwright interactions.
*   **Documentation**: Maintain clear and up-to-date documentation for all new modules and functionalities.

## References

*   [Anthropic AI SDK Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-claude-api)
*   [Google Generative AI SDK Documentation](https://ai.google.dev/gemini-api/docs/get-started/node)
*   [Playwright Documentation](https://playwright.dev/docs/intro)
*   [Electron IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)

