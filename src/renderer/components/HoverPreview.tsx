import React, { useState, useEffect } from 'react';

interface HoverPreviewProps {
  elementId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const HoverPreview: React.FC<HoverPreviewProps> = ({
  elementId,
  position,
  onClose
}) => {
  const [previewData, setPreviewData] = useState<{
    mediaUrl: string;
    type: string;
    description?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setShowAnimation(true);
    
    const loadPreview = async () => {
      setIsLoading(true);
      try {
        if (window.electronAPI) {
          const data = await window.electronAPI.getPreview(elementId);
          setPreviewData(data);
        }
      } catch (error) {
        console.error('Failed to load preview:', error);
        setPreviewData({
          mediaUrl: '',
          type: 'text',
          description: 'What happens when you click this?'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [elementId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
      setTimeout(onClose, 200); // Allow fade out animation
    }, 4000); // Show for 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x + 10, window.innerWidth - 280),
    top: Math.max(position.y - 120, 10),
    zIndex: 10000,
    pointerEvents: 'none'
  };

  return (
    <div 
      className={`hover-preview ${showAnimation ? 'show' : 'hide'}`} 
      style={style}
    >
      <div className="preview-bubble">
        {/* Speech bubble tail */}
        <div className="bubble-tail"></div>
        
        <div className="preview-header">
          <div className="question-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </div>
          <span className="preview-title">What happens next?</span>
        </div>

        <div className="preview-content">
          {isLoading ? (
            <div className="preview-loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Analyzing...</span>
            </div>
          ) : previewData?.mediaUrl ? (
            <div className="preview-media">
              <img 
                src={previewData.mediaUrl} 
                alt="Action preview" 
                className="preview-gif"
              />
              {previewData.description && (
                <div className="preview-description">
                  {previewData.description}
                </div>
              )}
            </div>
          ) : (
            <div className="preview-fallback">
              <div className="help-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </div>
              <div className="preview-text">
                {previewData?.description || "Click to see what happens"}
              </div>
            </div>
          )}
        </div>

        {/* Pointing hand indicator */}
        <div className="hand-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5S19 1.67 19 2.5V11h1V5.5c0-.83.67-1.5 1.5-1.5S23 4.67 23 5.5z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};