import React, { useState, useEffect } from 'react';
// BrowserWindow component removed - using BrowserView in main process
import { FloatingChatBubble } from './components/FloatingChatBubble';
import './components/FloatingChatBubble.css';
import { HoverPreview } from './components/HoverPreview';
import { NavigationBar } from './components/NavigationBar';
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
    setTheme,
    setPageAnalysis
  } = useStore();

  const [hoverPreview, setHoverPreview] = useState<{
    elementId: string;
    position: { x: number; y: number };
  } | null>(null);

  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<{
    hasAnalysis: boolean;
    elementCount?: number;
  }>({ hasAnalysis: false });

  useEffect(() => {
    // Set up electron API listeners
    if (window.electronAPI) {
      window.electronAPI.onElementHover((elementId, position) => {
        setHoverPreview({ elementId, position });
      });

      window.electronAPI.onPageLoad((url) => {
        console.log('📄 Page loaded:', url);
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
    }

    // Periodic URL check to ensure we always have the current URL
    const urlCheckInterval = setInterval(() => {
      const webview = document.getElementById('webview') as any;
      if (webview && webview.src && webview.src !== currentUrl) {
        console.log('🔍 URL check: WebView src changed from', currentUrl, 'to', webview.src);
        setCurrentUrl(webview.src);
      }
    }, 1000);

    return () => clearInterval(urlCheckInterval);
  }, [currentUrl]);

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
      console.log('🕷️ Fresh crawl requested for:', currentUrl);
      setLoading(true);
      
      try {
        // Use the new Playwright-powered fresh crawl
        const result = await window.electronAPI.requestFreshCrawl(currentUrl);
        
        if (result.success) {
          console.log(`✅ Fresh crawl completed! Found ${result.elementCount} interactive elements`);
          // Update the global page analysis so the chat bubble gets the new data
          if (result.analysis) {
            setPageAnalysis(result.analysis);
            setAnalysisStatus({
              hasAnalysis: true,
              elementCount: result.elementCount
            });
          }
        } else {
          console.error('❌ Fresh crawl failed:', result.error);
        }
      } catch (error) {
        console.error('❌ Fresh crawl error:', error);
      } finally {
        setLoading(false);
      }
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
        analysisStatus={analysisStatus}
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
            onLoadStart={(e) => {
              console.log('🔄 WebView load start:', e.target.src);
              setLoading(true);
            }}
            onLoadStop={(e) => {
              console.log('✅ WebView load stop:', e.target.src);
              setLoading(false);
            }}
            onDidNavigate={(e) => {
              console.log('🧭 WebView navigated to:', e.url);
              setCurrentUrl(e.url);
              setLoading(false);
            }}
            onDidNavigateInPage={(e) => {
              console.log('🧭 WebView navigated in page to:', e.url);
              setCurrentUrl(e.url);
            }}
            onDidFinishLoad={(e) => {
              console.log('🏁 WebView finished loading:', e.target.src);
              setCurrentUrl(e.target.src);
              setLoading(false);
            }}
            onDidFailLoad={(e) => {
              console.error('❌ WebView failed to load:', e.errorDescription);
              setLoading(false);
            }}
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
        
        
        
        <FloatingChatBubble
          isOpen={aiChatOpen}
          currentUrl={currentUrl}
          onToggle={handleAIChatToggle}
        />
      </div>

      {hoverPreview && (
        <HoverPreview
          elementId={hoverPreview.elementId}
          position={hoverPreview.position}
          onClose={() => setHoverPreview(null)}
        />
      )}


      <TroubleshootingPanel
        isOpen={troubleshootingOpen}
        onClose={() => setTroubleshootingOpen(false)}
      />


    </div>
  );
};

export default App;