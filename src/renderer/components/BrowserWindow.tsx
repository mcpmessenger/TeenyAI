import React, { useRef, useEffect, useState } from 'react';

interface BrowserWindowProps {
  url: string;
  isLoading: boolean;
  onHover: (elementId: string, position: { x: number; y: number }) => void;
  onLoadComplete?: () => void;
}

export const BrowserWindow: React.FC<BrowserWindowProps> = ({
  url,
  isLoading,
  onHover,
  onLoadComplete
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 URL changed in BrowserWindow:', url);
    setIsPageLoading(true);
    setLoadError(null);
  }, [url]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    console.log('Setting up iframe for URL:', url);

    // Set up loading state
    setIsPageLoading(true);
    setLoadError(null);

    // For regular URLs, use event listeners
    const handleLoad = () => {
      console.log('✅ Iframe load event fired for:', url);
      setIsPageLoading(false);
      setLoadError(null);
      onLoadComplete?.();
    };

    const handleError = (e: any) => {
      console.error('❌ Iframe failed to load:', e);
      setIsPageLoading(false);
      setLoadError('Failed to load page - may be blocked by X-Frame-Options');
    };

    const handleLoadStart = () => {
      console.log('🔄 Iframe started loading:', url);
      setIsPageLoading(true);
      setLoadError(null);
    };

    // Set up event listeners
    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);
    iframe.addEventListener('loadstart', handleLoadStart);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      iframe.removeEventListener('loadstart', handleLoadStart);
    };
  }, [url]);

  // Failsafe: Force clear loading state after 2 seconds
  useEffect(() => {
    const failsafe = setTimeout(() => {
      if (isPageLoading) {
        console.log('🔧 Failsafe: Force clearing loading state');
        setIsPageLoading(false);
        setLoadError(null);
      }
    }, 2000);

    return () => clearTimeout(failsafe);
  }, [isPageLoading]);

  return (
    <div className="browser-window">
      <div className="browser-content">
        <h2>🌐 TeenyAI Browser</h2>
        <p>Web content is now loaded using Electron's BrowserView (like real browsers!)</p>
        <p><strong>Current URL:</strong> {url}</p>
        <p><strong>Status:</strong> {isPageLoading ? 'Loading...' : 'Ready'}</p>
        
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

        <div className="browser-info">
          <h3>How This Works:</h3>
          <ul>
            <li>✅ Uses Electron's <strong>BrowserView</strong> (like Firefox/Chrome)</li>
            <li>✅ Bypasses X-Frame-Options restrictions</li>
            <li>✅ Full web security and CORS support</li>
            <li>✅ Real browser navigation (back/forward/reload)</li>
            <li>✅ No iframe limitations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};