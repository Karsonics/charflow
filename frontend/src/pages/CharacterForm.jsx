import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { charactersAPI, chatAPI } from '../services/api';

export default function CharacterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    greeting: '',
    example_dialogues: '',
    visibility: 'private',
    avatar_url: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      charactersAPI.getById(id)
        .then(res => setForm(res.data))
        .catch(err => {
          setError('Character not found');
          navigate('/characters');
        });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await charactersAPI.update(id, form);
      } else {
        const res = await charactersAPI.create(form);
        navigate(`/chat/start/${res.data.id}`);
        return;
      }
      navigate('/characters');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="character-form-page">
      <div className="container">
        <div className="form-card">
          <h1>{isEdit ? 'Edit Character' : 'Create Character'}</h1>

          {error && <div className="error alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Sherlock Holmes"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Avatar URL (optional)</label>
              <input
                type="url"
                value={form.avatar_url || ''}
                onChange={e => setForm({ ...form, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
              <span className="form-help">Enter a URL to an image (best: square, 200x200+)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Personality</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the character's personality, traits, and behavior..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Greeting Message *</label>
              <textarea
                value={form.greeting}
                onChange={e => setForm({ ...form, greeting: e.target.value })}
                placeholder="What should the character say when the chat starts?"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Example Dialogues (optional)</label>
              <textarea
                value={form.example_dialogues}
                onChange={e => setForm({ ...form, example_dialogues: e.target.value })}
                placeholder="User: Hello!&#13;&#10;Character: Hi there! How can I help?"
                rows={4}
              />
              <span className="form-help">One example per line for few-shot learning</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Visibility</label>
                <select
                  value={form.visibility}
                  onChange={e => setForm({ ...form, visibility: e.target.value })}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  value={form.category || ''}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g., Fiction, Fantasy"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Update' : 'Create & Chat'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .character-form-page {
          padding: 2rem 0;
        }
        .form-card {
          max-width: 600px;
          margin: 0 auto;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 2rem;
        }
        .form-card h1 {
          margin-bottom: 1.5rem;
        }
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        .form-help {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
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