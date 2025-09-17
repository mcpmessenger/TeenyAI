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
      
      // Debug WebView state after navigation
      const webview = document.getElementById('webview') as any;
      if (webview) {
        console.log('🔍 WebView after navigation:');
        console.log('- WebView src:', webview.src);
        console.log('- WebView dimensions:', webview.offsetWidth, 'x', webview.offsetHeight);
        console.log('- WebView visible:', webview.offsetWidth > 0 && webview.offsetHeight > 0);
      }
    };

    const handleDidFinishLoad = () => {
      console.log('🏁 WebView finished loading');
      setLoading(false);

      // Extensive debugging
      const webview = document.getElementById('webview') as any;
      const container = document.querySelector('.browser-view-container') as HTMLElement;
      const mainContent = document.querySelector('.main-content') as HTMLElement;

      if (webview) {
        console.log('🔍 === WEBVIEW DEBUG INFORMATION ===');
        console.log('WebView element:', webview);
        console.log('WebView src:', webview.src);
        console.log('WebView dimensions:', webview.offsetWidth, 'x', webview.offsetHeight);
        console.log('WebView computed style:', window.getComputedStyle(webview));
        console.log('WebView getBoundingClientRect:', webview.getBoundingClientRect());

        if (container) {
          console.log('🔍 Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
          console.log('Container getBoundingClientRect:', container.getBoundingClientRect());
        }

        if (mainContent) {
          console.log('🔍 Main content dimensions:', mainContent.offsetWidth, 'x', mainContent.offsetHeight);
          console.log('Main content getBoundingClientRect:', mainContent.getBoundingClientRect());
        }

        console.log('🔍 Window dimensions:', window.innerWidth, 'x', window.innerHeight);
        console.log('🔍 === END DEBUG INFORMATION ===');
        
        // Check if WebView is actually loading content
        setTimeout(() => {
          try {
            if (webview.executeJavaScript) {
              webview.executeJavaScript(`
                console.log('🔍 WebView content check:');
                console.log('- Document title:', document.title);
                console.log('- Body children count:', document.body ? document.body.children.length : 'No body');
                console.log('- Document ready state:', document.readyState);
                console.log('- Window location:', window.location.href);
                console.log('- Document URL:', document.URL);
                console.log('- Window inner dimensions:', window.innerWidth, 'x', window.innerHeight);
                console.log('- Document dimensions:', document.documentElement.clientWidth, 'x', document.documentElement.clientHeight);
                console.log('- Body dimensions:', document.body.offsetWidth, 'x', document.body.offsetHeight);
              `);
            }
          } catch (error) {
            console.log('⚠️ Could not check WebView content:', error);
          }
        }, 500);
        
        // Additional container height debugging
        setTimeout(() => {
          const container = document.querySelector('.browser-view-container') as HTMLElement;
          const mainContent = document.querySelector('.main-content') as HTMLElement;
          
          if (container) {
            console.log('🔍 Container height debugging:');
            console.log('- Container offsetHeight:', container.offsetHeight);
            console.log('- Container clientHeight:', container.clientHeight);
            console.log('- Container scrollHeight:', container.scrollHeight);
            console.log('- Container computed height:', window.getComputedStyle(container).height);
          }
          
          if (mainContent) {
            console.log('- Main content offsetHeight:', mainContent.offsetHeight);
            console.log('- Main content clientHeight:', mainContent.clientHeight);
            console.log('- Main content computed height:', window.getComputedStyle(mainContent).height);
          }
        }, 1000);

        // SYSTEMATIC external content override fix - Apply multiple times
        const applyFix = () => {
          try {
            if (webview.executeJavaScript) {
              console.log('🔍 Attempting to execute JavaScript in WebView...');
              webview.executeJavaScript(`
                try {
                  console.log('🔍 BEFORE FIX - WebView internal viewport:', document.documentElement.clientWidth, 'x', document.documentElement.clientHeight);
                  console.log('🔍 BEFORE FIX - Body computed styles:', window.getComputedStyle(document.body).height, window.getComputedStyle(document.body).overflow);
                  
                  // METHOD 1: Direct style property setting (most reliable)
                  document.documentElement.style.setProperty('margin', '0', 'important');
                  document.documentElement.style.setProperty('padding', '0', 'important');
                  document.documentElement.style.setProperty('height', '100vh', 'important');
                  document.documentElement.style.setProperty('min-height', '100vh', 'important');
                  document.documentElement.style.setProperty('overflow', 'visible', 'important');
                  
                  document.body.style.setProperty('margin', '0', 'important');
                  document.body.style.setProperty('padding', '0', 'important');
                  document.body.style.setProperty('height', '100vh', 'important');
                  document.body.style.setProperty('min-height', '100vh', 'important');
                  document.body.style.setProperty('overflow', 'visible', 'important');
                  document.body.style.setProperty('transform', 'none', 'important');
                  document.body.style.setProperty('position', 'relative', 'important');
                  document.body.style.setProperty('top', '0', 'important');
                  document.body.style.setProperty('left', '0', 'important');
                  
                  // METHOD 2: Inject CSS with higher specificity
                  const style = document.createElement('style');
                  style.textContent = \`
                    html, body {
                      margin: 0 !important;
                      padding: 0 !important;
                      height: 100vh !important;
                      min-height: 100vh !important;
                      overflow: visible !important;
                      position: relative !important;
                      top: 0 !important;
                      left: 0 !important;
                    }
                    * {
                      box-sizing: border-box !important;
                    }
                  \`;
                  document.head.appendChild(style);
                  
                  // METHOD 3: Force all containers to full height
                  const allDivs = document.querySelectorAll('div');
                  allDivs.forEach(div => {
                    if (div.offsetHeight < window.innerHeight * 0.5) {
                      div.style.setProperty('height', '100vh', 'important');
                      div.style.setProperty('min-height', '100vh', 'important');
                      div.style.setProperty('overflow', 'visible', 'important');
                    }
                  });
                  
                  console.log('🔍 AFTER FIX - WebView internal viewport:', document.documentElement.clientWidth, 'x', document.documentElement.clientHeight);
                  console.log('🔍 AFTER FIX - Body computed styles:', window.getComputedStyle(document.body).height, window.getComputedStyle(document.body).overflow);
                  console.log('✅ Applied systematic external content fix');
                } catch (e) {
                  console.error('❌ Error in WebView script:', e);
                }
              `).then(() => {
                console.log('✅ JavaScript executed successfully in WebView');
              }).catch((error) => {
                console.error('❌ Failed to execute JavaScript in WebView:', error);
              });
            } else {
              console.log('❌ WebView executeJavaScript method not available');
            }
          } catch (error) {
            console.error('❌ Error in applyFix:', error);
          }
        };

        // Apply fix immediately and then every 2 seconds
        applyFix();
        setTimeout(applyFix, 2000);
        setTimeout(applyFix, 5000);
        setTimeout(applyFix, 10000);

            // Also try setting WebView zoom and size directly
            webview.setZoomFactor(1.0);
            if (webview.setSize) {
              const rect = webview.getBoundingClientRect();
              webview.setSize({ width: rect.width, height: rect.height });
            }
          } catch (error) {
            console.log('⚠️ Could not execute JavaScript in WebView:', error);
          }
        }, 1000);
        
        // Additional gentle fix after 3 seconds
        setTimeout(() => {
          try {
            if (webview.executeJavaScript) {
              webview.executeJavaScript(`
                // SECOND PASS - Gentle viewport check
                console.log('🔍 SECOND PASS - WebView viewport:', document.documentElement.clientWidth, 'x', document.documentElement.clientHeight);
                console.log('🔍 Content loaded:', document.body.children.length, 'elements');
              `);
            }
          } catch (error) {
            console.log('⚠️ Second pass fix failed:', error);
          }
        }, 3000);
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
      
      // Debug WebView state after attachment
      const webview = document.getElementById('webview') as any;
      if (webview) {
        console.log('🔍 WebView after attachment:');
        console.log('- WebView src:', webview.src);
        console.log('- WebView dimensions:', webview.offsetWidth, 'x', webview.offsetHeight);
        console.log('- WebView isAttached:', webview.isAttached ? webview.isAttached() : 'unknown');
      }
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
      console.log('🔍 WebView before navigation:');
      console.log('- WebView element exists:', !!webview);
      console.log('- WebView src before:', webview.src);
      console.log('- WebView dimensions before:', webview.offsetWidth, 'x', webview.offsetHeight);
      
      webview.src = url;
      
      // Check WebView state after setting src
      setTimeout(() => {
        console.log('🔍 WebView after setting src:');
        console.log('- WebView src after:', webview.src);
        console.log('- WebView dimensions after:', webview.offsetWidth, 'x', webview.offsetHeight);
        console.log('- WebView isAttached:', webview.isAttached ? webview.isAttached() : 'unknown');
      }, 100);
    } else {
      console.error('❌ WebView element not found!');
    }
  };

  // Add refresh functionality
  const handleRefresh = async () => {
    console.log('🔄 Refreshing page');
    const webview = document.getElementById('webview') as any;
    if (webview) {
      console.log('🔍 WebView found for refresh:', webview);
      console.log('🔍 WebView src before refresh:', webview.src);
      console.log('🔍 WebView reload method exists:', typeof webview.reload);
      
      try {
        webview.reload();
        console.log('✅ WebView reload called successfully');
      } catch (error) {
        console.error('❌ WebView reload failed:', error);
      }
    } else {
      console.error('❌ WebView element not found for refresh!');
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
    
    // Debug preload script status
    console.log('🔍 Debugging preload script status:');
    console.log('- window.electronAPI exists:', !!window.electronAPI);
    console.log('- window.electronAPI type:', typeof window.electronAPI);
    console.log('- window keys:', Object.keys(window).filter(key => key.includes('electron')));
    
    // Notify main process to resize BrowserView
    if (window.electronAPI) {
      console.log('📡 Sending toggle-ai-chat IPC message');
      const result = await window.electronAPI.toggleAIChat(newAIChatOpen);
      console.log('📡 IPC result:', result);
    } else {
      console.log('❌ electronAPI not available - preload script may not be loading');
      console.log('🔧 This explains why WebView fixes are not working!');
    }
  };

  const handleConsoleToggle = () => {
    setConsoleOpen(!consoleOpen);
  };

  // Manual fix trigger for debugging
  const handleManualFix = async () => {
    console.log('🔧 Manual fix triggered');
    const webview = document.getElementById('webview') as any;
    if (webview && webview.executeJavaScript) {
      try {
        await webview.executeJavaScript(`
          console.log('🔧 MANUAL FIX - Overriding all CSS');
          document.documentElement.style.cssText = 'margin: 0 !important; padding: 0 !important; position: relative !important; top: 0 !important; left: 0 !important; height: 100vh !important; min-height: 100vh !important; overflow: visible !important;';
          document.body.style.cssText = 'margin: 0 !important; padding: 0 !important; position: relative !important; top: 0 !important; left: 0 !important; height: 100vh !important; min-height: 100vh !important; overflow: visible !important; transform: none !important;';
          console.log('✅ Manual fix applied');
        `);
        console.log('✅ Manual fix executed successfully');
      } catch (error) {
        console.error('❌ Manual fix failed:', error);
      }
    } else {
      console.error('❌ WebView not available for manual fix');
    }
  };

  // Debug preload script on every render
  console.log('🔍 Preload script status check:');
  console.log('- window.electronAPI exists:', !!window.electronAPI);
  console.log('- window.electronAPI type:', typeof window.electronAPI);

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
            webpreferences="contextIsolation=true,enableRemoteModule=false,nodeIntegration=false,allowRunningInsecureContent=true,webviewTag=true,zoomFactor=1.0"
            autosize="true"
            minwidth="800"
            minheight="600"
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