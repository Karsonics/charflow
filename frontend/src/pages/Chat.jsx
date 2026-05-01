import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { chatAPI } from '../services/api';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChat();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    setLoading(true);
    try {
      const res = await chatAPI.getChat(id);
      setChat(res.data.chat);
      setMessages(res.data.messages || []);
    } catch (err) {
      setError('Failed to load chat');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (content) => {
    if (sending) return;
    
    const tempId = Date.now();
    const tempUserMessage = {
      id: tempId,
      sender_type: 'user',
      sender_name: 'You',
      content: content,
      timestamp: new Date().toISOString()
    };
    
    setSending(true);
    setError('');
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const res = await chatAPI.sendMessage({ chatId: parseInt(id), content });
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempId);
        return [...filtered, res.data.userMessage, res.data.aiMessage];
      });
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleRegenerate = async () => {
    setSending(true);
    setError('');

    try {
      const res = await chatAPI.sendMessage({ chatId: parseInt(id), content: '', regenerate: true });
      setMessages(prev => {
        const withoutLastAi = prev.filter(
          m => !(m.sender_type === 'character' && m.id === res.data.aiMessage.id)
        );
        return [...withoutLastAi, res.data.aiMessage];
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to regenerate');
    } finally {
      setSending(false);
    }
  };

  const handleRate = async (messageId, score) => {
    try {
      await chatAPI.rate({ messageId, score });
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, rating: score } : m))
      );
    } catch (err) {
      console.error('Failed to rate:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="chat-error">
        <p>Chat not found</p>
        <Link to="/chats">Go to Chats</Link>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="container flex items-center justify-between">
          <div className="chat-info">
            <h2>{chat.character?.name || 'Chat'}</h2>
            <span className="text-muted text-sm">
              {messages.length} messages
            </span>
          </div>
          <Link to="/chats" className="btn-small secondary">
            Back to Chats
          </Link>
        </div>
      </div>

<div className="chat-messages">
          <div className="container">
            {error && <div className="error-banner">{error}</div>}
            
            {messages.length === 0 ? (
              <p className="text-muted text-center">Start the conversation!</p>
            ) : (
              messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRate={handleRate}
                />
              ))
            )}
            
            {sending && (
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

      <ChatInput
        onSend={handleSend}
        onRegenerate={handleRegenerate}
        disabled={sending}
      />

      <style>{`
        .chat-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          padding: 1rem 0;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
        }
        .chat-info h2 {
          margin: 0;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0;
        }
        .chat-messages .container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .error-banner {
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--error);
          border-radius: 0.5rem;
          color: var(--error);
        }
        .chat-error {
          padding: 2rem;
          text-align: center;
        }
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          background: var(--text-muted);
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}