import React, { useState, useEffect } from 'react';

interface ElementInfo {
  selector: string;
  tagName: string;
  textContent?: string;
  attributes?: Record<string, string>;
  position?: { x: number; y: number };
}

interface TooltipData {
  elementInfo: ElementInfo;
  url: string;
  aiPrediction?: {
    prediction: string;
    confidence: string;
  };
  visualPreview?: {
    type: string;
    data: any;
  };
  timestamp: number;
}

interface EnhancedTooltipProps {
  elementInfo: ElementInfo;
  url: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  elementInfo,
  url,
  position,
  onClose
}) => {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Trigger entrance animation
    setShowAnimation(true);
    
    const loadTooltip = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (window.electronAPI) {
          const response = await window.electronAPI.generateTooltip(url, elementInfo);
          if (response.success) {
            setTooltipData(response.data);
          } else {
            setError(response.error || 'Failed to generate tooltip');
          }
        } else {
          setError('Electron API not available');
        }
      } catch (err) {
        console.error('Failed to load tooltip:', err);
        setError('Failed to load tooltip data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTooltip();
  }, [elementInfo, url]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
      setTimeout(onClose, 200); // Allow fade out animation
    }, 6000); // Show for 6 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x + 10, window.innerWidth - 320),
    top: Math.max(position.y - 150, 10),
    zIndex: 10000,
    pointerEvents: 'none',
    maxWidth: '300px'
  };

  const renderVisualPreview = () => {
    if (!tooltipData?.visualPreview) return null;

    const { type, data } = tooltipData.visualPreview;

    if (type === 'hover-preview' && data?.screenshots) {
      return (
        <div className="visual-preview">
          <div className="preview-images">
            <div className="preview-image-container">
              <img 
                src={`data:image/png;base64,${data.screenshots.normal}`}
                alt="Normal state"
                className="preview-image"
              />
              <div className="image-label">Normal</div>
            </div>
            <div className="preview-separator">→</div>
            <div className="preview-image-container">
              <img 
                src={`data:image/png;base64,${data.screenshots.hover}`}
                alt="Hover state"
                className="preview-image"
              />
              <div className="image-label">Hover</div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'fallback') {
      return (
        <div className="visual-preview fallback">
          <div className="preview-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Visual preview unavailable</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderAIPrediction = () => {
    if (!tooltipData?.aiPrediction) return null;

    const { prediction, confidence } = tooltipData.aiPrediction;

    return (
      <div className="ai-prediction">
        <div className="prediction-header">
          <div className="ai-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span className="prediction-title">AI Prediction</span>
          <div className={`confidence-badge ${confidence}`}>
            {confidence}
          </div>
        </div>
        <div className="prediction-text">
          {prediction}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`enhanced-tooltip ${showAnimation ? 'show' : 'hide'}`} 
      style={style}
    >
      <div className="tooltip-bubble">
        {/* Speech bubble tail */}
        <div className="bubble-tail"></div>
        
        <div className="tooltip-header">
          <div className="element-info">
            <span className="element-tag">{elementInfo.tagName}</span>
            {elementInfo.textContent && (
              <span className="element-text">"{elementInfo.textContent.substring(0, 30)}..."</span>
            )}
          </div>
          <button 
            className="close-button"
            onClick={onClose}
            style={{ pointerEvents: 'auto' }}
          >
            ✕
          </button>
        </div>

        <div className="tooltip-content">
          {isLoading ? (
            <div className="tooltip-loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Analyzing element...</span>
            </div>
          ) : error ? (
            <div className="tooltip-error">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{error}</div>
            </div>
          ) : (
            <>
              {renderAIPrediction()}
              {renderVisualPreview()}
            </>
          )}
        </div>

        {!isLoading && !error && (
          <div className="tooltip-footer">
            <div className="interaction-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5S19 1.67 19 2.5V11h1V5.5c0-.83.67-1.5 1.5-1.5S23 4.67 23 5.5z"/>
              </svg>
              <span>Click to interact</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
