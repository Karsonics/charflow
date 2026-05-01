import { Link } from 'react-router-dom';

export default function CharacterCard({ character, onDelete }) {
  const { id, name, description, greeting, visibility, creator_username, created_at } = character;

  return (
    <div className="character-card">
      <div className="card-header">
        <div className="avatar">{name.charAt(0).toUpperCase()}</div>
        <div className="card-info">
          <h3>{name}</h3>
          <span className={`badge badge-${visibility}`}>{visibility}</span>
        </div>
      </div>
      
      <p className="description">{description?.slice(0, 100) || greeting?.slice(0, 100)}...</p>
      
      <div className="card-footer">
        <span className="creator text-muted text-sm">by {creator_username}</span>
        <Link to={`/chat/start/${id}`} className="btn-small">
          Chat
        </Link>
      </div>

      <style>{`
        .character-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.25rem;
          transition: border-color 0.2s, transform 0.2s;
        }
        .character-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
        }
        .card-info h3 {
          font-size: 1.125rem;
          margin-bottom: 0.25rem;
        }
        .description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
}