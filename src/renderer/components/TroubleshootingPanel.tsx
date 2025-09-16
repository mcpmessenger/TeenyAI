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
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [aiConfig, setAiConfig] = useState<any>(null);

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
          issue: 'API key validation fails despite valid key',
          solution: 'This is a known issue. Try creating a .env file or restart the application after setting the key.',
          code: 'echo "OPENAI_API_KEY=your_key" > .env'
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
          issue: 'AI Provider setup',
          solution: 'Choose your preferred AI provider and enter your API key below to enable AI features',
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

  const validateApiKey = (key: string, provider: string): boolean => {
    const trimmedKey = key.trim();
    
    console.log(`🔍 Validating ${provider} API key:`, {
      key: trimmedKey.substring(0, 10) + '...',
      length: trimmedKey.length,
      startsWithSk: trimmedKey.startsWith('sk-'),
      startsWithSkProj: trimmedKey.startsWith('sk-proj-'),
      startsWithSkAnt: trimmedKey.startsWith('sk-ant-')
    });
    
    switch (provider) {
      case 'openai':
        // Support both sk- and sk-proj- prefixes for OpenAI keys
        const isValid = (trimmedKey.startsWith('sk-') || trimmedKey.startsWith('sk-proj-')) && trimmedKey.length >= 20;
        console.log(`🔍 OpenAI validation result:`, isValid);
        return isValid;
      case 'claude':
        const claudeValid = trimmedKey.startsWith('sk-ant-') && trimmedKey.length >= 30;
        console.log(`🔍 Claude validation result:`, claudeValid);
        return claudeValid;
      case 'gemini':
        const geminiValid = trimmedKey.length >= 20;
        console.log(`🔍 Gemini validation result:`, geminiValid);
        return geminiValid;
      default:
        console.log(`🔍 Unknown provider validation result:`, false);
        return false;
    }
  };

  const getApiKeyPlaceholder = (provider: string): string => {
    switch (provider) {
      case 'openai':
        return 'Enter your OpenAI API key (sk-... or sk-proj-...)';
      case 'claude':
        return 'Enter your Claude API key (sk-ant-...)';
      case 'gemini':
        return 'Enter your Gemini API key';
      default:
        return 'Enter your API key';
    }
  };

  const getApiKeyHelp = (provider: string): string => {
    switch (provider) {
      case 'openai':
        return 'https://platform.openai.com/';
      case 'claude':
        return 'https://console.anthropic.com/';
      case 'gemini':
        return 'https://aistudio.google.com/';
      default:
        return '';
    }
  };

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) return;
    
    const trimmedKey = apiKey.trim();
    
    // Validate API key based on provider
    if (!validateApiKey(trimmedKey, selectedProvider)) {
      setApiKeyStatus('error');
      console.error(`❌ Invalid ${selectedProvider} API key format`);
      return;
    }
    
    console.log(`🔑 Testing ${selectedProvider} API key:`, trimmedKey.substring(0, 10) + '...');
    
    setApiKeyStatus('testing');
    
    try {
      console.log(`🔑 Step 1: Updating ${selectedProvider} API key in main process...`);
      // Update the AI provider and API key in the main process
      const updateResponse = await window.electronAPI?.updateAIProvider(selectedProvider, trimmedKey);
      console.log('🔑 Update response:', updateResponse);
      
      if (updateResponse && updateResponse.success) {
        console.log('🔑 Step 2: Testing API key with AI query...');
        // Test the API key by making a simple request
        const response = await window.electronAPI?.sendAIQuery('Test connection', 'Testing API key');
        console.log('🔑 AI query response:', response);
        
        if (response && !response.error) {
          setApiKeyStatus('success');
          // Store the API key and provider
          localStorage.setItem('ai_api_key', trimmedKey);
          localStorage.setItem('ai_provider', selectedProvider);
          console.log('✅ API key saved and tested successfully');
          // Reload AI config to reflect changes
          await loadAIConfig();
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
    const stored = localStorage.getItem('ai_api_key');
    if (stored) {
      setApiKey(stored);
    }
  };

  const loadAIConfig = async () => {
    try {
      const response = await window.electronAPI?.getAIConfig();
      if (response?.success && response.config) {
        setAiConfig(response.config);
        setSelectedProvider(response.config.provider);
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
    }
  };

  // Load stored API key and AI config on component mount
  React.useEffect(() => {
    loadStoredApiKey();
    loadAIConfig();
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
          
          {/* AI Provider Configuration Section */}
          {activeSection === 'api' && (
            <div className="api-key-config">
              <div className="provider-selection">
                <label htmlFor="provider-select">
                  <strong>AI Provider:</strong>
                </label>
                <select
                  id="provider-select"
                  value={selectedProvider}
                  onChange={(e) => {
                    setSelectedProvider(e.target.value);
                    setApiKeyStatus('idle');
                  }}
                  className="provider-select"
                >
                  <option value="openai">OpenAI (GPT-3.5/4)</option>
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="gemini">Gemini (Google)</option>
                </select>
                {aiConfig && (
                  <div className="current-provider-info">
                    Current: <strong>{aiConfig.provider}</strong> 
                    {aiConfig.isConfigured ? ' ✅ Configured' : ' ❌ Not configured'}
                  </div>
                )}
              </div>

              <div className="api-key-form">
                <label htmlFor="api-key-input">
                  <strong>{selectedProvider.toUpperCase()} API Key:</strong>
                </label>
                <div className="api-key-input-group">
                  <input
                    id="api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={getApiKeyPlaceholder(selectedProvider)}
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
                      localStorage.removeItem('ai_api_key');
                      localStorage.removeItem('ai_provider');
                    }}
                    className="api-key-button"
                    style={{ background: '#6b7280', marginLeft: '8px' }}
                  >
                    Clear
                  </button>
                </div>
                {apiKeyStatus === 'success' && (
                  <div className="api-key-success">
                    ✅ {selectedProvider.toUpperCase()} API key saved and tested successfully! AI features are now enabled.
                  </div>
                )}
                {apiKeyStatus === 'error' && (
                  <div className="api-key-error">
                    ❌ API key validation failed. Please check:
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      {selectedProvider === 'openai' && (
                        <>
                          <li>Key starts with "sk-" (standard keys) or "sk-proj-" (project keys)</li>
                          <li>Key is complete (not truncated)</li>
                          <li>Key length is at least 20 characters</li>
                        </>
                      )}
                      {selectedProvider === 'claude' && (
                        <>
                          <li>Key starts with "sk-ant-"</li>
                          <li>Key is complete (not truncated)</li>
                        </>
                      )}
                      {selectedProvider === 'gemini' && (
                        <>
                          <li>Key is complete (not truncated)</li>
                          <li>API is enabled in Google AI Studio</li>
                        </>
                      )}
                      <li>Key is valid and active</li>
                      <li>You have internet connection</li>
                    </ul>
                    <strong>Tip:</strong> Copy the key directly from the provider platform to avoid extra characters.
                  </div>
                )}
              </div>
              
              <div className="api-key-help">
                <h5>How to get your API key:</h5>
                <ol>
                  <li>Go to <a href={getApiKeyHelp(selectedProvider)} target="_blank" rel="noopener noreferrer">
                    {selectedProvider === 'openai' ? 'OpenAI Platform' : 
                     selectedProvider === 'claude' ? 'Anthropic Console' : 
                     'Google AI Studio'}
                  </a></li>
                  <li>Sign up or log in to your account</li>
                  <li>Navigate to API Keys section</li>
                  <li>Create a new API key</li>
                  <li>Copy the key and paste it above</li>
                </ol>
                <div className="provider-info">
                  <h6>Provider Information:</h6>
                  <ul>
                    <li><strong>OpenAI:</strong> Most popular, good for general tasks</li>
                    <li><strong>Claude:</strong> Great for analysis and reasoning</li>
                    <li><strong>Gemini:</strong> Fast and cost-effective</li>
                  </ul>
                </div>
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
        <p>📋 <strong>Known Issues:</strong> Check <code>KNOWN_ISSUES.md</code> for a comprehensive list of known problems and solutions.</p>
      </div>
    </div>
  );
};