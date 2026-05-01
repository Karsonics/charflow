import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { charactersAPI, chatAPI } from '../services/api';

export default function ChatStart() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    charactersAPI.getById(characterId)
      .then(res => setCharacter(res.data))
      .catch(err => {
        setError('Character not found');
      })
      .finally(() => setLoading(false));
  }, [characterId]);

  const handleStart = async () => {
    setStarting(true);
    setError('');

    try {
      const res = await chatAPI.start({ characterId: parseInt(characterId) });
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start chat');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="error-page container">
        <p>Character not found</p>
      </div>
    );
  }

  return (
    <div className="chat-start-page">
      <div className="container">
        <div className="start-card">
          <div className="character-preview">
            <div className="avatar">{character.name?.charAt(0)}</div>
            <h1>{character.name}</h1>
            <p className="description">{character.description}</p>
            <div className="greeting">
              <h3>Greeting:</h3>
              <p>"{character.greeting}"</p>
            </div>
          </div>

          {error && <div className="error alert">{error}</div>}

          <div className="start-actions">
            <button onClick={handleStart} disabled={starting} className="btn-large">
              {starting ? 'Starting...' : 'Start Chat'}
            </button>
            <button onClick={() => navigate(-1)} className="btn-large secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .chat-start-page {
          padding: 4rem 0;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .start-card {
          max-width: 500px;
          margin: 0 auto;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
        }
        .character-preview {
          margin-bottom: 2rem;
        }
        .avatar {
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
        }
        .character-preview h1 {
          margin-bottom: 0.5rem;
        }
        .description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }
        .greeting {
          background: var(--bg-elevated);
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: left;
        }
        .greeting h3 {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .greeting p {
          font-style: italic;
        }
        .start-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .alert {
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--error);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}