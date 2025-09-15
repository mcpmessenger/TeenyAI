import React, { useState, useEffect } from 'react';
// BrowserWindow component removed - using BrowserView in main process
import { AIChatPanel } from './components/AIChatPanel';
import { HoverPreview } from './components/HoverPreview';
import { NavigationBar } from './components/NavigationBar';
import { Console } from './components/Console';
import { TroubleshootingPanel } from './components/TroubleshootingPanel';
import { useStore } from './store/browserStore';
import './App.css';

const App: React.FC = () => {
  const {
    currentUrl,
    isLoading,
    aiChatOpen,
    theme,
    navigateTo,
    setCurrentUrl,
    setLoading,
    toggleAIChat,
    setTheme
  } = useStore();

  const [hoverPreview, setHoverPreview] = useState<{
    elementId: string;
    position: { x: number; y: number };
  } | null>(null);

  const [consoleOpen, setConsoleOpen] = useState(false);
  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false);

  useEffect(() => {
    // Set up electron API listeners
    if (window.electronAPI) {
      window.electronAPI.onElementHover((elementId, position) => {
        setHoverPreview({ elementId, position });
      });

      window.electronAPI.onPageLoad((url) => {
        setCurrentUrl(url);
        setLoading(false);
      });

      // BrowserView events
      window.electronAPI.onUrlUpdated((url) => {
        console.log('🌐 URL updated from BrowserView:', url);
        setCurrentUrl(url);
        setLoading(false);
      });

      window.electronAPI.onLoadError((error) => {
        console.error('❌ Load error from BrowserView:', error);
        setLoading(false);
      });

      window.electronAPI.onLoadingStarted(() => {
        console.log('🔄 Loading started in BrowserView');
        setLoading(true);
      });

      // Temporarily commented out until preload script issue is resolved
      // window.electronAPI.onLoadingFinished(() => {
      //   console.log('✅ Loading finished in BrowserView');
      //   setLoading(false);
      // });
    }
  }, []);

  const handleNavigation = async (url: string) => {
    console.log('🧭 Navigating to:', url);
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.navigateTo(url);
        if (result.success) {
          console.log('✅ Navigation successful:', result.url);
          setCurrentUrl(result.url || url);
          // Set loading to false after a short delay to allow content to load
          setTimeout(() => setLoading(false), 1000);
        } else {
          console.error('❌ Navigation failed:', result.error);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Navigation error:', error);
        setLoading(false);
      }
    } else {
      // Fallback to store navigation
      navigateTo(url);
    }
  };

  const handleFreshCrawl = async () => {
    if (window.electronAPI && currentUrl) {
      setLoading(true);
      await window.electronAPI.requestFreshCrawl(currentUrl);
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (window.electronAPI) {
      await window.electronAPI.setTheme(newTheme);
    }
  };

  return (
    <div className={`app ${theme}`}>
      <NavigationBar
        url={currentUrl}
        isLoading={isLoading}
        onNavigate={handleNavigation}
        onFreshCrawl={handleFreshCrawl}
        onToggleTheme={handleThemeToggle}
        onToggleAIChat={() => toggleAIChat()}
        onToggleHelp={() => setTroubleshootingOpen(!troubleshootingOpen)}
        theme={theme}
      />
      
      <div className="main-content">
        {/* Fresh browser window is handled by main process */}
        <div className="browser-view-container">
          <div className="browser-status">
            <h2>🌐 TeenyAI Browser - Real Browser Mode</h2>
            <p><strong>Current URL:</strong> {currentUrl}</p>
            <p><strong>Status:</strong> {isLoading ? 'Loading...' : 'Ready'}</p>
            <p><strong>Mode:</strong> Real browser using Electron BrowserView</p>
            <p><strong>Note:</strong> Web content should display in the main area below. This is a real browser, not an iframe!</p>
            
            <div className="browser-actions">
              <button
                onClick={() => window.electronAPI?.goBack()}
                className="nav-button"
              >
                ← Back
              </button>
              <button
                onClick={() => window.electronAPI?.goForward()}
                className="nav-button"
              >
                Forward →
              </button>
              <button
                onClick={() => window.electronAPI?.reload()}
                className="nav-button"
              >
                🔄 Reload
              </button>
            </div>
          </div>
          
          {/* Debug panel - only show in development */}
          <div className="debug-panel">
            <div className="debug-actions">
              <button 
                onClick={async () => {
                  console.log('🧪 Testing direct navigation to Google');
                  if (window.electronAPI) {
                    const result = await window.electronAPI.navigateTo('https://www.google.com');
                    console.log('Navigation result:', result);
                  }
                }}
                className="debug-button"
              >
                Test Google
              </button>
              <button 
                onClick={async () => {
                  console.log('🧪 Testing direct navigation to GitHub');
                  if (window.electronAPI) {
                    const result = await window.electronAPI.navigateTo('https://www.github.com');
                    console.log('Navigation result:', result);
                  }
                }}
                className="debug-button"
              >
                Test GitHub
              </button>
              <button 
                onClick={() => {
                  console.log('🔍 Current URL:', currentUrl);
                  console.log('🔍 Loading state:', isLoading);
                }}
                className="debug-button"
              >
                Debug State
              </button>
              <button 
                onClick={async () => {
                  console.log('🔧 Testing fresh browser window');
                  if (window.electronAPI) {
                    const result = await window.electronAPI.navigateTo('https://www.example.com');
                    console.log('Example.com navigation result:', result);
                  }
                }}
                className="debug-button"
              >
                Test Example
              </button>
              <button 
                onClick={() => {
                  console.log('🔍 Checking browser window state');
                  if (window.electronAPI) {
                    window.electronAPI.getCurrentUrl().then(url => {
                      console.log('Current URL from browser window:', url);
                    });
                  }
                }}
                className="debug-button"
              >
                Check URL
              </button>
              <button 
                onClick={() => {
                  console.log('🔧 Opening fresh browser window');
                  if (window.electronAPI) {
                    window.electronAPI.navigateTo('https://www.google.com');
                  }
                }}
                className="debug-button"
                style={{ background: '#4CAF50', color: 'white' }}
              >
                Open Browser
              </button>
            </div>
          </div>
        </div>
        
        <AIChatPanel
          isOpen={aiChatOpen}
          currentUrl={currentUrl}
          onClose={() => toggleAIChat()}
        />
      </div>

      {hoverPreview && (
        <HoverPreview
          elementId={hoverPreview.elementId}
          position={hoverPreview.position}
          onClose={() => setHoverPreview(null)}
        />
      )}

      <Console 
        isOpen={consoleOpen}
        onClose={() => setConsoleOpen(false)}
      />

      <TroubleshootingPanel
        isOpen={troubleshootingOpen}
        onClose={() => setTroubleshootingOpen(false)}
      />

      <button 
        className="console-toggle"
        onClick={() => setConsoleOpen(!consoleOpen)}
        title="Toggle Console"
      >
        {consoleOpen ? 'Hide Console' : 'Show Console'}
      </button>

    </div>
  );
};

export default App;