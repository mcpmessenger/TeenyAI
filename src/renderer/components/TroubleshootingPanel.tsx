import React, { useState } from 'react';

interface TroubleshootingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TroubleshootingPanel: React.FC<TroubleshootingPanelProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<string>('common');

  const troubleshootingData = {
    common: {
      title: 'Common Issues',
      items: [
        {
          issue: 'AI Assistant not responding',
          solution: 'Check your OpenAI API key in the .env file. Make sure you have internet connection.',
          code: 'OPENAI_API_KEY=your_actual_key_here'
        },
        {
          issue: 'Preload script errors',
          solution: 'These are security warnings and can be safely ignored in development mode.',
          code: null
        },
        {
          issue: 'Page not loading',
          solution: 'Check the URL format. Make sure it starts with https:// or http://',
          code: null
        },
        {
          issue: 'Console errors about webview',
          solution: 'Webview security warnings are normal. The app uses secure configurations.',
          code: null
        }
      ]
    },
    setup: {
      title: 'Setup Issues',
      items: [
        {
          issue: 'npm install fails',
          solution: 'Try clearing npm cache and reinstalling',
          code: 'npm cache clean --force\nnpm install'
        },
        {
          issue: 'Electron not starting',
          solution: 'Make sure all dependencies are installed and ports are available',
          code: 'npm run clean\nnpm install\nnpm run dev'
        },
        {
          issue: 'TypeScript errors',
          solution: 'Check your TypeScript configuration and rebuild',
          code: 'npm run build'
        }
      ]
    },
    api: {
      title: 'API Issues',
      items: [
        {
          issue: 'OpenAI API key invalid',
          solution: 'Get a valid API key from OpenAI and add it to your .env file',
          code: 'OPENAI_API_KEY=sk-...'
        },
        {
          issue: 'Rate limiting errors',
          solution: 'You may be hitting OpenAI rate limits. Wait a moment and try again.',
          code: null
        },
        {
          issue: 'Network connection errors',
          solution: 'Check your internet connection and firewall settings',
          code: null
        }
      ]
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard:', text);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="troubleshooting-panel">
      <div className="troubleshooting-header">
        <h3>🔧 Troubleshooting Guide</h3>
        <button onClick={onClose} className="close-button">✕</button>
      </div>

      <div className="troubleshooting-content">
        <div className="troubleshooting-nav">
          {Object.entries(troubleshootingData).map(([key, section]) => (
            <button
              key={key}
              className={`nav-item ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              {section.title}
            </button>
          ))}
        </div>

        <div className="troubleshooting-body">
          <h4>{troubleshootingData[activeSection as keyof typeof troubleshootingData].title}</h4>
          
          {troubleshootingData[activeSection as keyof typeof troubleshootingData].items.map((item, index) => (
            <div key={index} className="troubleshooting-item">
              <div className="issue-title">
                <strong>Issue:</strong> {item.issue}
              </div>
              <div className="issue-solution">
                <strong>Solution:</strong> {item.solution}
              </div>
              {item.code && (
                <div className="issue-code">
                  <div className="code-header">
                    <span>Code:</span>
                    <button 
                      onClick={() => copyToClipboard(item.code!)}
                      className="copy-code-button"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre><code>{item.code}</code></pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="troubleshooting-footer">
        <p>💡 <strong>Tip:</strong> Use the console (bottom right button) to see detailed error messages and copy them for debugging.</p>
      </div>
    </div>
  );
};