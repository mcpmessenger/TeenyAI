import React, { useRef, useEffect, useState } from 'react';

interface BrowserWindowProps {
  url: string;
  isLoading: boolean;
  onHover: (elementId: string, position: { x: number; y: number }) => void;
}

export const BrowserWindow: React.FC<BrowserWindowProps> = ({
  url,
  isLoading,
  onHover
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentUrl, setCurrentUrl] = useState(url || 'https://www.google.com');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUrl(url || 'https://www.google.com');
    setIsPageLoading(true);
    setLoadError(null);
  }, [url]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    console.log('Setting up iframe for URL:', currentUrl);

    const handleLoad = () => {
      console.log('✅ Iframe loaded successfully for:', currentUrl);
      // Add a small delay to ensure content is rendered
      setTimeout(() => {
        setIsPageLoading(false);
        setLoadError(null);
      }, 100);
    };

    const handleError = (e: any) => {
      console.error('❌ Iframe failed to load:', e);
      setIsPageLoading(false);
      setLoadError('Failed to load page');
    };

    const handleLoadStart = () => {
      console.log('🔄 Iframe started loading:', currentUrl);
      setIsPageLoading(true);
      setLoadError(null);
    };

    // Set up event listeners
    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);
    iframe.addEventListener('loadstart', handleLoadStart);

    // Also check if iframe is already loaded
    if (iframe.contentDocument?.readyState === 'complete') {
      console.log('Iframe already loaded');
      handleLoad();
    }

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      iframe.removeEventListener('loadstart', handleLoadStart);
    };
  }, [currentUrl]);

  return (
    <div className="browser-window">
      {(isLoading || isPageLoading) && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            {loadError ? `Error: ${loadError}` : 'Loading...'}
          </div>
        </div>
      )}
      
      <div className="debug-info">
        <p><strong>Debug Info:</strong></p>
        <p>URL: {currentUrl}</p>
        <p>Loading: {isPageLoading ? 'Yes' : 'No'}</p>
        <p>Error: {loadError || 'None'}</p>
      </div>

      <iframe
        ref={iframeRef}
        src={currentUrl}
        className="webview"
        title="Browser Content"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none',
          background: 'white'
        }}
      />
    </div>
  );
};