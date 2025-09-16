import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/browserStore';

interface FloatingChatBubbleProps {
  isOpen: boolean;
  currentUrl: string;
  onToggle: () => void;
}

export const FloatingChatBubble: React.FC<FloatingChatBubbleProps> = ({
  isOpen,
  currentUrl,
  onToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(true);
  const [showDragHint, setShowDragHint] = useState(true);
  
  // Use global store for chat history and page analysis
  const { 
    chatHistory, 
    addChatMessage, 
    clearChatHistory, 
    pageAnalysis, 
    setPageAnalysis,
    theme
  } = useStore();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // addChatMessage is now from the store

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addChatMessage('user', userMessage);
    setIsLoading(true);

    try {
      if (window.electronAPI) {
        console.log('🤖 Sending AI query:', userMessage);
        const result = await window.electronAPI.sendAIQuery(userMessage);
        console.log('🤖 AI response:', result);
        
        if (result.error) {
          addChatMessage('assistant', `Sorry, I encountered an error: ${result.response}`);
          if (result.response.includes('AI service is not available')) {
            setAiServiceAvailable(false);
          }
        } else {
          addChatMessage('assistant', result.response);
          setAiServiceAvailable(true);
        }
      } else {
        console.error('❌ electronAPI not available');
        addChatMessage('assistant', 'Sorry, the AI service is not available. Please check the console for errors.');
      }
    } catch (error) {
      console.error('❌ Chat error:', error);
      addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  const analyzeCurrentPage = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    addChatMessage('assistant', '🔍 Analyzing this page to understand what you can do here...');
    
    try {
      if (window.electronAPI) {
        console.log('🔍 Analyzing page with URL:', currentUrl);
        const result = await window.electronAPI.analyzePage(currentUrl);
        if (result.error) {
          addChatMessage('assistant', `⚠️ Could not analyze the page: ${result.error}`);
        } else {
          setPageAnalysis(result.analysis);
          console.log('✅ Page analysis result:', result.analysis);
          addChatMessage('assistant', `✅ Page analyzed! I found ${result.analysis.keyActions?.length || 0} main actions you can take. Ask me about any of them!`);
        }
      }
    } catch (error) {
      console.error('Page analysis error:', error);
      addChatMessage('assistant', 'Sorry, I could not analyze this page. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // clearChatHistory is now from the store

  // Drag functionality - improved to be more user-friendly
  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow dragging from anywhere on the header, not just specific elements
    const target = e.target as HTMLElement;
    const isHeader = target.closest('.bubble-header') || target.classList.contains('bubble-header');
    const isDraggableElement = target.closest('.bubble-avatar') || 
                              target.closest('.bubble-text') || 
                              target.closest('.bubble-badge') ||
                              target.closest('.drag-handle') ||
                              target.classList.contains('bubble-header');
    
    if (isHeader || isDraggableElement) {
      e.preventDefault();
      setIsDragging(true);
      const rect = bubbleRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Get bubble dimensions for better bounds checking
      const bubbleWidth = isExpanded ? 320 : 200;
      const bubbleHeight = isExpanded ? 500 : 60;
      
      // Keep bubble within window bounds with proper margins
      const maxX = window.innerWidth - bubbleWidth - 10;
      const maxY = window.innerHeight - bubbleHeight - 10;
      
      setPosition({
        x: Math.max(10, Math.min(newX, maxX)),
        y: Math.max(10, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setShowDragHint(false); // Hide drag hint after first interaction
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div
      ref={bubbleRef}
      className={`floating-chat-bubble ${isExpanded ? 'expanded' : 'collapsed'} theme-${theme} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 10001 : 10000,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {!isExpanded ? (
        // Collapsed state - just a chat bubble
        <div className="bubble-header" onClick={() => setIsExpanded(true)}>
          <div className="bubble-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="bubble-text">AI Assistant</div>
          {chatHistory.length > 0 && (
            <div className="bubble-badge">{chatHistory.length}</div>
          )}
          <div className={`drag-handle ${showDragHint ? 'drag-hint' : ''}`} title="Drag to move">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="12" r="1"/>
              <circle cx="9" cy="5" r="1"/>
              <circle cx="9" cy="19" r="1"/>
              <circle cx="20" cy="12" r="1"/>
              <circle cx="20" cy="5" r="1"/>
              <circle cx="20" cy="19" r="1"/>
            </svg>
          </div>
        </div>
      ) : (
        // Expanded state - full chat interface
        <div className="chat-container">
          <div className="bubble-header">
            <div className="bubble-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
          <div className="bubble-text">
            <div>AI Assistant</div>
            <div className="bubble-url" title={currentUrl}>
              {currentUrl ? new URL(currentUrl).hostname : 'No URL'}
              {pageAnalysis && (
                <span className="analysis-indicator" title="Page analyzed - AI is aware of this page">
                  ✨
                </span>
              )}
            </div>
          </div>
          <div className="drag-handle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="12" r="1"/>
              <circle cx="9" cy="5" r="1"/>
              <circle cx="9" cy="19" r="1"/>
              <circle cx="20" cy="12" r="1"/>
              <circle cx="20" cy="5" r="1"/>
              <circle cx="20" cy="19" r="1"/>
            </svg>
          </div>
            <div className="bubble-actions">
              <button onClick={clearChatHistory} className="bubble-action-btn" title="Clear chat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
              <button onClick={() => setIsExpanded(false)} className="bubble-action-btn" title="Minimize">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <button onClick={onToggle} className="bubble-action-btn" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {chatHistory.length === 0 && (
              <div className="welcome-message">
                {!aiServiceAvailable ? (
                  <div className="setup-message">
                    <p>🤖 AI Assistant Setup Required</p>
                    <p>To use the AI assistant, you need to set up an API key:</p>
                    <ol>
                      <li>Get an API key from OpenAI, Claude, or Gemini</li>
                      <li>Set the environment variable: <code>OPENAI_API_KEY=your_key</code></li>
                      <li>Restart the application</li>
                    </ol>
                    <p>Or use the troubleshooting panel for more help!</p>
                  </div>
                ) : (
                  <>
                    <p>Hi! I'm your AI browsing assistant. I can help you navigate this page!</p>
                    <p>What would you like to know?</p>
                  </>
                )}
              </div>
            )}

            {chatHistory.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message assistant loading">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-actions">
            <button 
              onClick={analyzeCurrentPage}
              className="quick-action-button primary"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '🔍 Analyzing...' : '🔍 Analyze this page'}
            </button>
            <button 
              onClick={() => handleQuickAction("What can I do on this page?")}
              className="quick-action-button"
            >
              What can I do here?
            </button>
            <button 
              onClick={() => handleQuickAction("Guide me step-by-step")}
              className="quick-action-button"
            >
              Guide me
            </button>
            <button 
              onClick={() => handleQuickAction("Is this website safe?")}
              className="quick-action-button"
            >
              Safety check
            </button>
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about this page..."
              className="chat-input"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="send-button">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
