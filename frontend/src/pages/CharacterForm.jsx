import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { charactersAPI } from '../services/api';

export default function CharacterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    greeting: '',
    example_dialogues: '',
    visibility: 'private',
    avatar_url: '',
    category: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      charactersAPI.getById(id)
        .then(res => {
          setForm(res.data);
          if (res.data.avatar_url) {
            setAvatarPreview(res.data.avatar_url);
          }
        })
        .catch(err => {
          setError('Character not found');
          navigate('/characters');
        });
    }
  }, [id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setForm(prev => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    setForm(prev => ({ ...prev, avatar_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
            <div className="avatar-section">
              <div className="avatar-preview-container">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="avatar-preview-img" />
                ) : (
                  <div className="avatar-placeholder">?</div>
                )}
                {avatarPreview && (
                  <button type="button" className="avatar-remove" onClick={removeAvatar}>×</button>
                )}
              </div>
              <div className="avatar-upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-input"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="avatar-label">
                  {avatarPreview ? 'Change Photo' : 'Add Photo'}
                </label>
                <span className="form-help">Square image, min 200x200</span>
              </div>
            </div>

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
        .avatar-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .avatar-preview-container {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }
        .avatar-preview-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border);
        }
        .avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
        }
        .avatar-remove {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--error);
          color: white;
          border: none;
          font-size: 1rem;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .avatar-upload {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .avatar-input {
          display: none;
        }
        .avatar-label {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        .avatar-label:hover {
          background: var(--border);
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