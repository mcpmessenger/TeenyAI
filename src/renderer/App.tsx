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
    setLoading(true);
    setCurrentUrl(url);
    
    // Update WebView src directly
    const webview = document.getElementById('webview') as any;
    if (webview) {
      webview.src = url;
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

  const handleAIChatToggle = async () => {
    const newAIChatOpen = !aiChatOpen;
    console.log(`🤖 Toggling AI chat panel: ${newAIChatOpen ? 'open' : 'closed'}`);
    toggleAIChat();
    
    // Notify main process to resize BrowserView
    if (window.electronAPI) {
      console.log('📡 Sending toggle-ai-chat IPC message');
      const result = await window.electronAPI.toggleAIChat(newAIChatOpen);
      console.log('📡 IPC result:', result);
    } else {
      console.log('❌ electronAPI not available');
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
        onToggleAIChat={handleAIChatToggle}
        onToggleHelp={() => setTroubleshootingOpen(!troubleshootingOpen)}
        theme={theme}
      />
      
      <div className="main-content">
        {/* Web content using WebView tag for proper layering */}
        <div className="browser-view-container">
          <webview
            id="webview"
            src={currentUrl}
            className="webview"
            preload="./webview-preload.js"
            nodeintegration="false"
            websecurity="true"
            allowpopups="false"
            disablewebsecurity="false"
            onLoadStart={() => setLoading(true)}
            onLoadStop={() => setLoading(false)}
            onNewWindow={(e) => {
              // Handle new window requests - open in external browser
              e.preventDefault();
              if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(e.url);
              }
            }}
            onPermissionRequest={(e) => {
              // Deny all permission requests for security
              e.preventDefault();
              console.log('Permission denied:', e.permission);
            }}
          />
        </div>
        
        
        
        <AIChatPanel
          isOpen={aiChatOpen}
          currentUrl={currentUrl}
          onClose={handleAIChatToggle}
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