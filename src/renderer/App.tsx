import React, { useState, useEffect } from 'react';
import { BrowserWindow } from './components/BrowserWindow';
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
    }
  }, [setCurrentUrl, setLoading]);

  const handleNavigation = async (url: string) => {
    setLoading(true);
    if (window.electronAPI) {
      await window.electronAPI.navigateTo(url);
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
        <BrowserWindow
          url={currentUrl}
          isLoading={isLoading}
          onHover={(elementId, position) => setHoverPreview({ elementId, position })}
        />
        
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