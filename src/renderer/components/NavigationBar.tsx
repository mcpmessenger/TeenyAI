import React, { useState } from 'react';

interface NavigationBarProps {
  url: string;
  isLoading: boolean;
  onNavigate: (url: string) => void;
  onFreshCrawl: () => void;
  onToggleTheme: () => void;
  onToggleAIChat: () => void;
  onToggleHelp: () => void;
  theme: 'light' | 'dark';
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  url,
  isLoading,
  onNavigate,
  onFreshCrawl,
  onToggleTheme,
  onToggleAIChat,
  onToggleHelp,
  theme
}) => {
  const [inputUrl, setInputUrl] = useState(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedUrl = inputUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    onNavigate(formattedUrl);
  };

  return (
    <div className="navigation-bar">
      <div className="nav-controls">
        <button 
          className="nav-button"
          onClick={() => window.history.back()}
          disabled={isLoading}
        >
          ←
        </button>
        <button 
          className="nav-button"
          onClick={() => window.history.forward()}
          disabled={isLoading}
        >
          →
        </button>
        <button 
          className="nav-button refresh-button"
          onClick={onFreshCrawl}
          disabled={isLoading}
          title="Fresh Crawl - Re-analyze page with AI"
        >
          {isLoading ? '⟳' : '🔄'}
        </button>
      </div>

      <form className="url-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="url-input"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter URL or search..."
          disabled={isLoading}
        />
        <button type="submit" className="go-button" disabled={isLoading}>
          Go
        </button>
      </form>

      <div className="nav-actions">
        <button 
          className="nav-button ai-button"
          onClick={onToggleAIChat}
          title="Toggle AI Assistant"
        >
          🤖
        </button>
        <button 
          className="nav-button theme-button"
          onClick={onToggleTheme}
          title="Toggle Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button 
          className="nav-button help-button"
          onClick={onToggleHelp}
          title="Troubleshooting Guide"
        >
          🔧
        </button>
      </div>
    </div>
  );
};