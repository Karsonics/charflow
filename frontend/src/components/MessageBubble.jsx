import { useState } from 'react';

export default function MessageBubble({ message, onRate }) {
  const { id, sender_type, sender_name, sender_avatar, content, timestamp, rating } = message;
  const [showRating, setShowRating] = useState(false);
  const [currentRating, setCurrentRating] = useState(rating || 0);

  const isUser = sender_type === 'user';

  const handleRate = (score) => {
    setCurrentRating(score);
    onRate?.(id, score);
    setShowRating(false);
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString();
  };

  const formatContent = (text) => {
    if (!text) return [];
    
    const parts = [];
    let remaining = text;
    let key = 0;
    
    while (remaining) {
      const actionMatch = remaining.match(/^\*\*(.+?)\*\*/);
      if (actionMatch) {
        parts.push({ type: 'action', content: actionMatch[1], key: key++ });
        remaining = remaining.slice(actionMatch[0].length);
      } else {
        const nextAction = remaining.indexOf('**');
        if (nextAction === -1) {
          parts.push({ type: 'text', content: remaining, key: key++ });
          break;
        } else {
          parts.push({ type: 'text', content: remaining.slice(0, nextAction), key: key++ });
          remaining = remaining.slice(nextAction);
        }
      }
    }
    
    return parts;
  };

  const contentParts = formatContent(content);

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'character'}`}>
      <div className="message-header">
        {!isUser && (sender_avatar ? (
          <img src={sender_avatar} alt={sender_name} className="message-avatar" />
        ) : (
          <div className="message-avatar-placeholder">{getInitial(sender_name)}</div>
        ))}
        {!isUser && sender_name && (
          <span className="sender-name">({sender_name}: </span>
        )}
        <span className="sender-name-base">{sender_name}</span>
        {!isUser && sender_name && (
          <span className="sender-name">)</span>
        )}
        <span className="timestamp">
          {formatTime(timestamp)}
        </span>
      </div>
      
      <div className="message-content">
        {contentParts.map((part) => (
          part.type === 'action' ? (
            <p key={part.key} className="message-action">**{part.content}**</p>
          ) : (
            <span key={part.key}>{part.content}</span>
          )
        ))}
      </div>

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
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
        }
        .message-avatar, .message-avatar-placeholder {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .message-avatar {
          object-fit: cover;
        }
        .message-avatar-placeholder {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .sender-name {
          font-weight: 500;
          color: var(--text-secondary);
        }
        .sender-name-base {
          font-weight: 500;
          color: var(--text-primary);
        }
        .timestamp {
          color: var(--text-muted);
          margin-left: auto;
        }
        .message-content {
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .message-content span {
          margin: 0;
        }
        .message-action {
          font-style: italic;
          color: var(--secondary);
          margin: 0.25rem 0 !important;
          font-weight: 500;
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