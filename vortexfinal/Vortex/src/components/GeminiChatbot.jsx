import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';

export default function GeminiChatbot({ profile, opportunities }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: '👋 Hey! I\'m your **Vortex AI Assistant** powered by Gemini. Ask me anything about hackathons, scholarships, career advice, or your matched opportunities!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, role: 'bot', text: 'Thinking...', typing: true }]);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            profile: profile || null,
            topOpportunities: (opportunities || []).slice(0, 5).map(o => ({
              title: o.title,
              category: o.category,
              organization: o.organization,
              deadline: o.deadline,
              matchScore: o.matchScore,
              url: o.url
            }))
          }
        })
      });

      const data = await res.json();

      // Replace typing indicator with actual response
      setMessages(prev =>
        prev.filter(m => m.id !== typingId).concat({
          id: Date.now() + 2,
          role: 'bot',
          text: data.reply || 'Sorry, I couldn\'t process that. Try again!'
        })
      );
    } catch (err) {
      setMessages(prev =>
        prev.filter(m => m.id !== typingId).concat({
          id: Date.now() + 2,
          role: 'bot',
          text: '⚠️ Connection error. Make sure the server is running on port 3001.'
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render markdown-like bold
  const renderText = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#c7d2fe' }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Gemini AI"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
              }}>
                <Bot size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vortex AI</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={10} color="#6366f1" /> Powered by Gemini
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`chat-message ${msg.role} ${msg.typing ? 'typing' : ''}`}
              >
                {msg.typing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="typing-dots">
                      <span style={{ animation: 'typingBounce 0.6s ease-in-out infinite', animationDelay: '0s' }}>●</span>
                      <span style={{ animation: 'typingBounce 0.6s ease-in-out infinite', animationDelay: '0.15s' }}>●</span>
                      <span style={{ animation: 'typingBounce 0.6s ease-in-out infinite', animationDelay: '0.3s' }}>●</span>
                    </span>
                    Thinking...
                  </span>
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{renderText(msg.text)}</span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-row">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about hackathons, career tips..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes typingBounce {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
        .typing-dots { font-size: 0.5rem; display: inline-flex; gap: 2px; color: var(--primary-glow); }
      `}</style>
    </>
  );
}
