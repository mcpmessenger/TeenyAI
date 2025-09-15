import React, { useState, useEffect } from 'react';

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

  // Sync input with current URL
  useEffect(() => {
    setInputUrl(url);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedUrl = inputUrl.trim();
    console.log('📝 Form submitted with input:', inputUrl);
    
    if (!formattedUrl) {
      console.log('⚠️ Empty URL, ignoring');
      return;
    }
    
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    console.log('🌐 Submitting URL:', formattedUrl);
    onNavigate(formattedUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('⌨️ Input changed:', e.target.value);
    setInputUrl(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('⏎ Enter key pressed, submitting form');
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  
  return (
    <div className="navigation-bar">
      <div className="nav-controls">
        <button 
          className="nav-button"
          onClick={async () => {
            if (window.electronAPI) {
              await window.electronAPI.goBack();
            }
          }}
          disabled={isLoading}
        >
          ←
        </button>
        <button 
          className="nav-button"
          onClick={async () => {
            if (window.electronAPI) {
              await window.electronAPI.goForward();
            }
          }}
          disabled={isLoading}
        >
          →
        </button>
        <button 
          className="nav-button refresh-button"
          onClick={async () => {
            if (window.electronAPI) {
              await window.electronAPI.reload();
            }
          }}
          disabled={isLoading}
          title="Reload Page"
        >
          {isLoading ? '⟳' : '🔄'}
        </button>
      </div>

      <form className="url-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="url-input"
          value={inputUrl}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter URL or search..."
          disabled={false}
        />
        <button type="submit" className="go-button" disabled={false}>
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
        <button 
          className="nav-button"
          onClick={() => {
            console.log('🧪 Test button clicked, current inputUrl:', inputUrl);
            setInputUrl('https://www.github.com');
          }}
          title="Test Input"
          style={{ fontSize: '12px', padding: '4px 8px' }}
        >
          Test
        </button>
        <button 
          className="nav-button"
          onClick={() => {
            console.log('🔧 Force clear loading state');
            // This will be handled by the parent component
            window.location.reload();
          }}
          title="Clear Loading"
          style={{ fontSize: '12px', padding: '4px 8px', background: '#ff6b6b', color: 'white' }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};