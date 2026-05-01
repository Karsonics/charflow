import { useState } from 'react';

export default function MessageBubble({ message, onRate }) {
  const { id, sender_type, sender_name, content, timestamp, rating } = message;
  const [showRating, setShowRating] = useState(false);
  const [currentRating, setCurrentRating] = useState(rating || 0);

  const isUser = sender_type === 'user';

  const handleRate = (score) => {
    setCurrentRating(score);
    onRate?.(id, score);
    setShowRating(false);
  };

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'character'}`}>
      <div className="message-header">
        <span className="sender-name">{sender_name}</span>
        <span className="timestamp">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="message-content">{content}</div>

      {!isUser && (
        <div className="message-actions">
          {currentRating > 0 ? (
            <div className="rating-display">
              {[1, 2, 3, 4].map(score => (
                <span key={score} className={`star ${score <= currentRating ? 'filled' : ''}`}>
                  ★
                </span>
              ))}
            </div>
          ) : showRating ? (
            <div className="rating-buttons">
              {[1, 2, 3, 4].map(score => (
                <button
                  key={score}
                  className="btn-small btn-icon"
                  onClick={() => handleRate(score)}
                  title={`Rate ${score}`}
                >
                  {score}
                </button>
              ))}
            </div>
          ) : (
            <button
              className="btn-small secondary rate-btn"
              onClick={() => setShowRating(true)}
            >
              Rate
            </button>
          )}
        </div>
      )}

      <style>{`
        .message-bubble {
          max-width: 70%;
          padding: 1rem;
          border-radius: 1rem;
          margin-bottom: 0.5rem;
        }
        .message-bubble.user {
          margin-left: auto;
          background: var(--primary);
        }
        .message-bubble.character {
          margin-right: auto;
          background: var(--bg-surface);
          border: 1px solid var(--border);
        }
        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
        }
        .sender-name {
          font-weight: 500;
          color: var(--text-secondary);
        }
        .timestamp {
          color: var(--text-muted);
        }
        .message-content {
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .message-actions {
          margin-top: 0.75rem;
          display: flex;
          gap: 0.5rem;
        }
        .rating-display {
          display: flex;
          gap: 0.25rem;
        }
        .star {
          color: var(--border);
          font-size: 1rem;
        }
        .star.filled {
          color: var(--warning);
        }
        .rate-btn {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }
      `}</style>
    </div>
  );
}