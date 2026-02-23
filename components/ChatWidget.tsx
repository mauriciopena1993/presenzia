'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hi! I can answer questions about presenzia.ai — what we do, how audits work, or which plan might suit you. What would you like to know?',
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Sorry, something went wrong. Email us at hello@presenzia.ai.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. You can reach us at hello@presenzia.ai.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '52px',
          height: '52px',
          background: '#C9A84C',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: 1000,
          transition: 'transform 0.2s',
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '5rem',
          right: '1.5rem',
          width: 'min(380px, calc(100vw - 2rem))',
          maxHeight: '520px',
          background: '#0A0A0A',
          border: '1px solid #2a2a2a',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          zIndex: 999,
          fontFamily: 'var(--font-inter, Inter, sans-serif)',
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <div style={{ width: '8px', height: '8px', background: '#3a7d44', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.875rem', color: '#F5F0E8', fontWeight: 600 }}>
              presenzia<span style={{ color: '#C9A84C' }}>.ai</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#555', marginLeft: 'auto' }}>
              Usually answers in seconds
            </span>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '82%',
                  padding: '0.6rem 0.875rem',
                  background: msg.role === 'user' ? '#C9A84C' : '#111',
                  color: msg.role === 'user' ? '#0A0A0A' : '#CCCCCC',
                  fontSize: '0.875rem',
                  lineHeight: 1.55,
                  border: msg.role === 'assistant' ? '1px solid #1a1a1a' : 'none',
                }}>
                  {msg.content.split('hello@presenzia.ai').map((part, j, arr) => (
                    <span key={j}>
                      {part}
                      {j < arr.length - 1 && (
                        <a href="mailto:hello@presenzia.ai" style={{ color: msg.role === 'user' ? '#0A0A0A' : '#C9A84C', textDecoration: 'underline' }}>
                          hello@presenzia.ai
                        </a>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '0.6rem 0.875rem', background: '#111', border: '1px solid #1a1a1a', color: '#555', fontSize: '0.875rem' }}>
                  <span>···</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem',
            borderTop: '1px solid #1a1a1a',
            display: 'flex',
            gap: '0.5rem',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a question..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.6rem 0.75rem',
                background: '#111',
                border: '1px solid #2a2a2a',
                color: '#F5F0E8',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                padding: '0.6rem 1rem',
                background: input.trim() && !loading ? '#C9A84C' : '#1a1a1a',
                color: input.trim() && !loading ? '#0A0A0A' : '#444',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'background 0.15s',
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
