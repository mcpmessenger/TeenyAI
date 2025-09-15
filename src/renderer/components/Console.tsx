import React, { useState, useRef, useEffect } from 'react';

interface ConsoleMessage {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
  stack?: string;
}

interface ConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Console: React.FC<ConsoleProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Capture console messages
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    const addMessage = (type: ConsoleMessage['type'], args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      const newMessage: ConsoleMessage = {
        id: Date.now() + Math.random().toString(),
        type,
        message,
        timestamp: new Date(),
        stack: type === 'error' && args[0]?.stack ? args[0].stack : undefined
      };

      setMessages(prev => [...prev.slice(-99), newMessage]); // Keep last 100 messages
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addMessage('log', args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addMessage('warn', args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addMessage('error', args);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addMessage('info', args);
    };

    return () => {
      // Restore original console methods
      Object.assign(console, originalConsole);
    };
  }, []);

  const copyMessage = (message: string) => {
    navigator.clipboard.writeText(message).then(() => {
      console.info('Message copied to clipboard');
    });
  };

  const copyAllMessages = () => {
    const allText = filteredMessages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.type.toUpperCase()}: ${msg.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(allText).then(() => {
      console.info('All messages copied to clipboard');
    });
  };

  const clearConsole = () => {
    setMessages([]);
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.type === filter;
  });

  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="console-panel">
      <div className="console-header">
        <h3>Console</h3>
        <div className="console-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="console-filter"
          >
            <option value="all">All</option>
            <option value="log">Logs</option>
            <option value="info">Info</option>
            <option value="warn">Warnings</option>
            <option value="error">Errors</option>
          </select>
          <button onClick={copyAllMessages} className="console-button" title="Copy All">
            📋
          </button>
          <button onClick={clearConsole} className="console-button" title="Clear">
            🗑️
          </button>
          <button onClick={onClose} className="console-button" title="Close">
            ✕
          </button>
        </div>
      </div>

      <div className="console-messages">
        {filteredMessages.length === 0 ? (
          <div className="console-empty">
            No messages to display
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg.id} className={`console-message console-${msg.type}`}>
              <div className="message-header">
                <span className="message-icon">{getMessageIcon(msg.type)}</span>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
                <span className="message-type">{msg.type.toUpperCase()}</span>
                <button 
                  onClick={() => copyMessage(msg.message)}
                  className="copy-button"
                  title="Copy message"
                >
                  📋
                </button>
              </div>
              <div className="message-content">
                <pre>{msg.message}</pre>
                {msg.stack && (
                  <details className="message-stack">
                    <summary>Stack trace</summary>
                    <pre>{msg.stack}</pre>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};