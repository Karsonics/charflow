import { useState, useRef } from 'react';

export default function ChatInput({ onSend, onRegenerate, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  };

  return (
    <div className="chat-input-container">
      <div className="input-row">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={disabled}
          rows={1}
        />
        <div className="input-actions">
          <button
            onClick={onRegenerate}
            className="btn-small secondary"
            disabled={disabled}
            title="Regenerate response"
          >
            ↻
          </button>
          <button
            onClick={handleSend}
            className="send-btn"
            disabled={disabled || !message.trim()}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        .chat-input-container {
          padding: 1rem;
          background: var(--bg-surface);
          border-top: 1px solid var(--border);
        }
        .input-row {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }
        .chat-input-container textarea {
          flex: 1;
          resize: none;
          min-height: 44px;
          max-height: 150px;
        }
        .input-actions {
          display: flex;
          gap: 0.5rem;
        }
        .send-btn {
          padding: 0.75rem 1.25rem;
        }
      `}</style>
    </div>
  );
}