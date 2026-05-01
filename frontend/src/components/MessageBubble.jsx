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

  const parseContent = (text) => {
    if (!text) return [];
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.match(/^\*\*[^*]+\*\*$/)) {
        return <span key={i} className="action-text">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  const avatarSrc = isUser ? userAvatar : sender_avatar;
  const name = isUser ? (sender_name || 'You') : sender_name;

  const ratingEmojis = ['', '👎', '😐', '👍', '❤️'];

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
        {isUser && sender_name && <span className="name-prefix">{sender_name}: </span>}
        <span className="message-text">{parseContent(content)}</span>
      </div>

      {!isUser && (
        <div className="message-actions">
          {currentRating > 0 ? (
            <div className="rating-display">
              <span className="rating-emoji">{ratingEmojis[currentRating]}</span>
              <span className="rating-label">{currentRating === 1 ? 'Bad' : currentRating === 2 ? 'Ok' : currentRating === 3 ? 'Good' : 'Great'}</span>
            </div>
          ) : showRating ? (
            <div className="rating-options">
              {[1, 2, 3, 4].map(score => (
                <button 
                  key={score} 
                  className="rating-option" 
                  onClick={() => handleRate(score)}
                  title={score === 1 ? 'Bad' : score === 2 ? 'Ok' : score === 3 ? 'Good' : 'Great'}
                >
                  <span className="rating-emoji-small">{ratingEmojis[score]}</span>
                </button>
              ))}
              <button className="rating-cancel" onClick={() => setShowRating(false)}>✕</button>
            </div>
          ) : (
            <button className="rate-button" onClick={() => setShowRating(true)}>
              <span>👍</span> Rate
            </button>
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
        .action-text { font-style: italic; color: var(--secondary); font-weight: 500; }
        .message-actions { margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .rate-button { display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; background: var(--bg-gray-100); border: 1px solid var(--border); border-radius: 1rem; cursor: pointer; color: var(--text-secondary); transition: all 0.2s; }
        .rate-button:hover { background: var(--bg-gray-200); border-color: var(--primary); }
        .rating-options { display: flex; align-items: center; gap: 0.25rem; }
        .rating-option { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-white); border: 1px solid var(--border); border-radius: 50%; cursor: pointer; transition: all 0.2s; font-size: 1rem; padding: 0; }
        .rating-option:hover { transform: scale(1.2); border-color: var(--primary); background: var(--bg-gray-50); }
        .rating-emoji-small { font-size: 1.1rem; }
        .rating-cancel { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.75rem; padding: 0; }
        .rating-cancel:hover { color: var(--error); }
        .rating-display { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; background: var(--bg-gray-50); border-radius: 1rem; }
        .rating-emoji { font-size: 1rem; }
        .rating-label { font-size: 0.75rem; color: var(--text-secondary); }
      `}</style>
    </div>
  );
}