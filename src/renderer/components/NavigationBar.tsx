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
  analysisStatus?: {
    hasAnalysis: boolean;
    elementCount?: number;
  };
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  url,
  isLoading,
  onNavigate,
  onFreshCrawl,
  onToggleTheme,
  onToggleAIChat,
  onToggleHelp,
  theme,
  analysisStatus
}) => {
  const [inputUrl, setInputUrl] = useState(url);

  // Sync input with current URL
  useEffect(() => {
    console.log('📝 NavigationBar received URL:', url);
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
    
    // Handle search queries vs URLs
    if (formattedUrl.includes(' ') || (!formattedUrl.includes('.') && !formattedUrl.startsWith('http'))) {
      // This looks like a search query, not a URL
      formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(formattedUrl)}`;
    } else if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    // Clean up the URL to prevent encoding issues
    try {
      const url = new URL(formattedUrl);
      formattedUrl = url.toString();
    } catch (error) {
      console.error('❌ Invalid URL format:', formattedUrl);
      // Fallback to Google search
      formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(inputUrl.trim())}`;
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
          title="Go Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <button 
          className="nav-button"
          onClick={async () => {
            if (window.electronAPI) {
              await window.electronAPI.goForward();
            }
          }}
          disabled={isLoading}
          title="Go Forward"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
        <button 
          className={`nav-button fresh-crawl-button ${analysisStatus?.hasAnalysis ? 'analyzed' : ''}`}
          onClick={onFreshCrawl}
          disabled={isLoading}
          title={analysisStatus?.hasAnalysis 
            ? `Fresh Crawl - Page analyzed (${analysisStatus.elementCount} elements found)` 
            : "Fresh Crawl - Analyze page content for AI assistance"
          }
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 1 3 3c0 1.5-3 6-3 6s-3-4.5-3-6a3 3 0 0 1 3-3z"/>
            <path d="M12 12a3 3 0 0 1 3 3c0 1.5-3 6-3 6s-3-4.5-3-6a3 3 0 0 1 3-3z"/>
            <path d="M12 2a3 3 0 0 0-3 3c0 1.5 3 6 3 6s3-4.5 3-6a3 3 0 0 0-3-3z"/>
            <path d="M12 12a3 3 0 0 0-3 3c0 1.5 3 6 3 6s3-4.5 3-6a3 3 0 0 0-3-3z"/>
            <circle cx="12" cy="12" r="2"/>
            <path d="M8 8l-2-2"/>
            <path d="M16 8l2-2"/>
            <path d="M8 16l-2 2"/>
            <path d="M16 16l2 2"/>
          </svg>
          {analysisStatus?.hasAnalysis && (
            <span className="analysis-badge">{analysisStatus.elementCount}</span>
          )}
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8"/>
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
          </svg>
        </button>
        <button 
          className="nav-button theme-button"
          onClick={onToggleTheme}
          title="Toggle Theme"
        >
          {theme === 'light' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2"/>
              <path d="M12 21v2"/>
              <path d="M4.22 4.22l1.42 1.42"/>
              <path d="M18.36 18.36l1.42 1.42"/>
              <path d="M1 12h2"/>
              <path d="M21 12h2"/>
              <path d="M4.22 19.78l1.42-1.42"/>
              <path d="M18.36 5.64l1.42-1.42"/>
            </svg>
          )}
        </button>
        <button 
          className="nav-button help-button"
          onClick={onToggleHelp}
          title="Troubleshooting Guide"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};