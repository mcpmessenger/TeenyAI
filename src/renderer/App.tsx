import React, { useState, useEffect } from 'react';
// BrowserWindow component removed - using BrowserView in main process
import { FloatingChatBubble } from './components/FloatingChatBubble';
import './components/FloatingChatBubble.css';
import { HoverPreview } from './components/HoverPreview';
import { NavigationBar } from './components/NavigationBar';
import { TroubleshootingPanel } from './components/TroubleshootingPanel';
import { Console } from './components/Console';
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
  const [consoleOpen, setConsoleOpen] = useState(false);
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

  // WebView event handling
  useEffect(() => {
    const webview = document.getElementById('webview') as any;
    if (!webview) return;

    const handleLoadStart = () => {
      console.log('🔄 WebView load start');
      setLoading(true);
    };

    const handleLoadStop = () => {
      console.log('✅ WebView load stop');
      setLoading(false);
    };

    const handleDidNavigate = (event: any) => {
      console.log('🧭 WebView navigated to:', event.url);
      setCurrentUrl(event.url);
      setLoading(false);
    };

    const handleDidFinishLoad = () => {
      console.log('🏁 WebView finished loading');
      setLoading(false);
      // Check if WebView is visible
      const webview = document.getElementById('webview') as any;
      if (webview) {
        console.log('🔍 WebView element:', webview);
        console.log('🔍 WebView src:', webview.src);
        console.log('🔍 WebView visible:', webview.offsetWidth, 'x', webview.offsetHeight);
      }
    };

    const handleDidFailLoad = (event: any) => {
      console.error('❌ WebView failed to load:', event.errorDescription);
      console.error('❌ Error code:', event.errorCode);
      setLoading(false);
    };

    const handleDomReady = () => {
      console.log('🎯 WebView DOM ready');
      setLoading(false);
    };

    const handleDidAttach = () => {
      console.log('🔗 WebView attached');
    };

    // Add event listeners
    webview.addEventListener('loadstart', handleLoadStart);
    webview.addEventListener('loadstop', handleLoadStop);
    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-finish-load', handleDidFinishLoad);
    webview.addEventListener('did-fail-load', handleDidFailLoad);
    webview.addEventListener('dom-ready', handleDomReady);
    webview.addEventListener('did-attach', handleDidAttach);

    // Cleanup
    return () => {
      webview.removeEventListener('loadstart', handleLoadStart);
      webview.removeEventListener('loadstop', handleLoadStop);
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener('did-finish-load', handleDidFinishLoad);
      webview.removeEventListener('did-fail-load', handleDidFailLoad);
      webview.removeEventListener('dom-ready', handleDomReady);
      webview.removeEventListener('did-attach', handleDidAttach);
    };
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

  // Add refresh functionality
  const handleRefresh = async () => {
    console.log('🔄 Refreshing page');
    const webview = document.getElementById('webview') as any;
    if (webview) {
      webview.reload();
    }
  };

  // Add back/forward functionality
  const handleGoBack = async () => {
    console.log('⬅️ Going back');
    const webview = document.getElementById('webview') as any;
    if (webview && webview.canGoBack()) {
      webview.goBack();
    }
  };

  const handleGoForward = async () => {
    console.log('➡️ Going forward');
    const webview = document.getElementById('webview') as any;
    if (webview && webview.canGoForward()) {
      webview.goForward();
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

  const handleConsoleToggle = () => {
    setConsoleOpen(!consoleOpen);
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
        onToggleConsole={handleConsoleToggle}
        onRefresh={handleRefresh}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        theme={theme}
        analysisStatus={analysisStatus}
      />
      
      <div className={`main-content ${consoleOpen ? 'console-open' : ''}`}>
        {/* Web content using WebView tag for proper layering */}
        <div className="browser-view-container">
          <webview
            id="webview"
            src={currentUrl}
            className="webview"
            preload="./webview-preload.js"
            nodeintegration="false"
            websecurity="false"
            allowpopups="true"
            disablewebsecurity="true"
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none'
            }}
            partition="persist:webview"
            webpreferences="contextIsolation=true,enableRemoteModule=false,nodeIntegration=false,allowRunningInsecureContent=true,webviewTag=true"
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

      {/* Console panel - rendered outside main content to avoid WebView layering issues */}
      {consoleOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            pointerEvents: 'none', 
            zIndex: 2147483647,
            isolation: 'isolate',
            contain: 'layout style paint'
          }}
        >
          <Console
            isOpen={consoleOpen}
            onClose={() => setConsoleOpen(false)}
          />
        </div>
      )}

    
    </div>
  );
};

export default App;