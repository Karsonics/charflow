import { useState } from 'react';

export default function MessageBubble({ message, onRate, userAvatar }) {
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

  const avatarSrc = isUser ? userAvatar : sender_avatar;
  const name = isUser ? (sender_name || 'You') : sender_name;

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'character'}`}>
      <div className="message-header">
        {avatarSrc ? (
          <img src={avatarSrc} alt={name} className="message-avatar" />
        ) : (
          <div className="message-avatar-placeholder">{getInitial(name)}</div>
        )}
        <span className="sender-name">{name}</span>
        <span className="timestamp">{formatTime(timestamp)}</span>
      </div>
      
      <div className="message-body">
        {!isUser && sender_name && <span className="name-prefix">{sender_name}: </span>}
        <span className="message-text">{content}</span>
      </div>

      {!isUser && (
        <div className="message-actions">
          {currentRating > 0 ? (
            <div className="rating-display">
              {[1, 2, 3, 4].map(score => (
                <span key={score} className={`star ${score <= currentRating ? 'filled' : ''}`}>★</span>
              ))}
            </div>
          ) : showRating ? (
            <div className="rating-buttons">
              {[1, 2, 3, 4].map(score => (
                <button key={score} className="btn-small btn-icon" onClick={() => handleRate(score)}>{score}</button>
              ))}
            </div>
          ) : (
            <button className="btn-small secondary rate-btn" onClick={() => setShowRating(true)}>Rate</button>
          )}
        </div>
      )}

      <style>{`
        .message-bubble { max-width: 70%; padding: 1rem; border-radius: 1rem; margin-bottom: 0.5rem; }
        .message-bubble.user { margin-left: auto; background: var(--primary); }
        .message-bubble.character { margin-right: auto; background: var(--bg-white); border: 1px solid var(--border); }
        .message-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.75rem; flex-wrap: wrap; }
        .message-avatar, .message-avatar-placeholder { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; }
        .message-avatar { object-fit: cover; }
        .message-avatar-placeholder { background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: white; }
        .sender-name { font-weight: 600; color: var(--text-primary); }
        .timestamp { color: var(--text-muted); margin-left: auto; }
        .message-body { line-height: 1.6; white-space: pre-wrap; }
        .name-prefix { font-weight: 600; color: var(--primary); margin-right: 0.25rem; }
        .message-text::first-letter { text-transform: capitalize; }
        .message-actions { margin-top: 0.75rem; display: flex; gap: 0.5rem; }
        .rating-display { display: flex; gap: 0.25rem; }
        .star { color: var(--border); font-size: 1rem; }
        .star.filled { color: var(--warning); }
        .rate-btn { font-size: 0.75rem; padding: 0.25rem 0.5rem; }
      `}</style>
    </div>
  );
}