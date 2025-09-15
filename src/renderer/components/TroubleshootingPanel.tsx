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
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyStatus, setApiKeyStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

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
      title: 'API Configuration',
      items: [
        {
          issue: 'OpenAI API key setup',
          solution: 'Enter your OpenAI API key below to enable AI features',
          code: null
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

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) return;
    
    // Basic validation
    const trimmedKey = apiKey.trim();
    if (!trimmedKey.startsWith('sk-')) {
      setApiKeyStatus('error');
      console.error('❌ API key must start with "sk-" or "sk-proj-"');
      return;
    }
    
    // Log the key for debugging (first 10 chars only)
    console.log('🔑 Testing API key:', trimmedKey.substring(0, 10) + '...');
    
    if (trimmedKey.length < 20) {
      setApiKeyStatus('error');
      console.error('❌ API key appears to be too short');
      return;
    }
    
    setApiKeyStatus('testing');
    
    try {
      console.log('🔑 Step 1: Updating API key in main process...');
      // Update the API key in the main process
      const updateResponse = await window.electronAPI?.updateApiKey(trimmedKey);
      console.log('🔑 Update response:', updateResponse);
      
      if (updateResponse && updateResponse.success) {
        console.log('🔑 Step 2: Testing API key with AI query...');
        // Test the API key by making a simple request
        const response = await window.electronAPI?.sendAIQuery('Test connection', 'Testing API key');
        console.log('🔑 AI query response:', response);
        
        if (response && !response.error) {
          setApiKeyStatus('success');
          // Store the API key (in a real app, you'd want to encrypt this)
          localStorage.setItem('openai_api_key', trimmedKey);
          console.log('✅ API key saved and tested successfully');
        } else {
          setApiKeyStatus('error');
          console.error('❌ API key test failed:', response?.response);
        }
      } else {
        setApiKeyStatus('error');
        console.error('❌ Failed to update API key:', updateResponse?.error);
      }
    } catch (error) {
      setApiKeyStatus('error');
      console.error('❌ API key test error:', error);
    }
  };

  const loadStoredApiKey = () => {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) {
      setApiKey(stored);
    }
  };

  // Load stored API key on component mount
  React.useEffect(() => {
    loadStoredApiKey();
  }, []);

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
          
          {/* API Key Configuration Section */}
          {activeSection === 'api' && (
            <div className="api-key-config">
              <div className="api-key-form">
                <label htmlFor="api-key-input">
                  <strong>OpenAI API Key:</strong>
                </label>
                <div className="api-key-input-group">
                  <input
                    id="api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your OpenAI API key (sk-...)"
                    className="api-key-input"
                  />
                  <button
                    onClick={handleApiKeySubmit}
                    disabled={!apiKey.trim() || apiKeyStatus === 'testing'}
                    className={`api-key-button ${apiKeyStatus}`}
                  >
                    {apiKeyStatus === 'testing' ? 'Testing...' : 
                     apiKeyStatus === 'success' ? '✅ Saved' :
                     apiKeyStatus === 'error' ? '❌ Error' : 'Save & Test'}
                  </button>
                  <button
                    onClick={() => {
                      setApiKey('');
                      setApiKeyStatus('idle');
                      localStorage.removeItem('openai_api_key');
                    }}
                    className="api-key-button"
                    style={{ background: '#6b7280', marginLeft: '8px' }}
                  >
                    Clear
                  </button>
                </div>
                {apiKeyStatus === 'success' && (
                  <div className="api-key-success">
                    ✅ API key saved and tested successfully! AI features are now enabled.
                  </div>
                )}
                {apiKeyStatus === 'error' && (
                  <div className="api-key-error">
                    ❌ API key validation failed. Please check:
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>Key starts with "sk-" (standard keys) or "sk-proj-" (project keys)</li>
                      <li>Key is complete (not truncated)</li>
                      <li>Key is valid and active</li>
                      <li>You have internet connection</li>
                      <li>For project keys: Make sure the project is active</li>
                    </ul>
                    <strong>Tip:</strong> Copy the key directly from OpenAI platform to avoid extra characters.
                    <br />
                    <strong>Note:</strong> Project keys (sk-proj-) may have different permissions than standard keys.
                  </div>
                )}
              </div>
              
              <div className="api-key-help">
                <h5>How to get your API key:</h5>
                <ol>
                  <li>Go to <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer">OpenAI Platform</a></li>
                  <li>Sign up or log in to your account</li>
                  <li>Navigate to API Keys section</li>
                  <li>Create a new API key</li>
                  <li>Copy the key (starts with sk-) and paste it above</li>
                </ol>
              </div>
            </div>
          )}
          
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
        <p>💡 <strong>Tip:</strong> Right-click and select "Inspect" to open developer tools and view console messages for debugging.</p>
      </div>
    </div>
  );
};