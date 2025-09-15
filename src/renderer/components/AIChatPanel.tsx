import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/browserStore';

interface AIChatPanelProps {
  isOpen: boolean;
  currentUrl: string;
  onClose: () => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  isOpen,
  currentUrl,
  onClose
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatHistory, addChatMessage, clearChatHistory } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addChatMessage('user', userMessage);
    setIsLoading(true);

    try {
      if (window.electronAPI) {
        const response = await window.electronAPI.sendAIQuery(userMessage, currentUrl);
        if (response.error) {
          addChatMessage('assistant', `⚠️ ${response.response}`);
        } else {
          addChatMessage('assistant', response.response);
        }
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-panel">
      <div className="chat-header">
        <h3>AI Assistant</h3>
        <div className="chat-actions">
          <button onClick={clearChatHistory} className="clear-button">
            Clear
          </button>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {chatHistory.length === 0 && (
          <div className="welcome-message">
            <p>Hi! I'm your AI browsing assistant. I can help you:</p>
            <ul>
              <li>Navigate websites step-by-step</li>
              <li>Explain what buttons and links do</li>
              <li>Guide you through forms and processes</li>
              <li>Answer questions about the current page</li>
            </ul>
            <p>What would you like to do on this page?</p>
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
          onClick={() => handleQuickAction("How do I complete the main task on this page?")}
          className="quick-action-button"
        >
          Guide me through this page
        </button>
        <button 
          onClick={() => handleQuickAction("What will happen if I click the main button?")}
          className="quick-action-button"
        >
          Explain the buttons
        </button>
        <button 
          onClick={() => handleQuickAction("Is this website safe to use?")}
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
  );
};