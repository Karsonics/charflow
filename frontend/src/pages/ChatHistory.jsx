import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatAPI } from '../services/api';

export default function ChatHistory() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const res = await chatAPI.getHistory();
      setChats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this chat?')) return;
    try {
      await chatAPI.delete(id);
      setChats(chats.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="chat-history-page">
      <div className="container">
        <div className="page-header">
          <h1>Your Chats</h1>
        </div>

        {chats.length === 0 ? (
          <div className="empty-state">
            <p>No chats yet.</p>
            <Link to="/characters">Start chatting!</Link>
          </div>
        ) : (
          <div className="chats-list">
            {chats.map(chat => (
              <Link
                key={chat.id}
                to={`/chat/${chat.id}`}
                className="chat-item"
              >
                <div className="chat-item-info">
                  <h3>{chat.title || `Chat ${chat.id}`}</h3>
                  <span className="characters text-sm text-muted">
                    {chat.characters || 'Chat'}
                  </span>
                </div>
                <div className="chat-item-meta">
                  <span className="last-message text-sm text-muted">
                    {chat.last_message?.slice(0, 50) || 'No messages'}
                    {chat.last_message?.length > 50 && '...'}
                  </span>
                  <span className="date text-muted">
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </span>
                  <button
                    className="btn-small secondary delete-btn"
                    onClick={(e) => handleDelete(chat.id, e)}
                  >
                    Delete
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .chat-history-page {
          padding: 2rem 0;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 0;
        }
        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        .chats-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .chat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s;
        }
        .chat-item:hover {
          border-color: var(--primary);
          text-decoration: none;
        }
        .chat-item-info h3 {
          margin: 0 0 0.25rem;
        }
        .chat-item-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .last-message {
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .date {
          font-size: 0.75rem;
        }
        .delete-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .chat-item:hover .delete-btn {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}