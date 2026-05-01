import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export default function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    username: '',
    avatar_url: ''
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ username: user.username, avatar_url: user.avatar_url || '' });
      setAvatarPreview(user.avatar_url || '');
    }
  }, [user]);

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
    setSaved(false);

    try {
      const res = await authAPI.updateProfile(form);
      login(res.data.user, localStorage.getItem('token'));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-card">
          <h1>Profile Settings</h1>
          <p className="text-muted">Update your profile picture and username</p>

          {error && <div className="error alert">{error}</div>}
          {saved && <div className="success alert">Profile updated!</div>}

          <form onSubmit={handleSubmit}>
            <div className="avatar-section">
              <div className="avatar-preview-container">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="avatar-preview-img" />
                ) : (
                  <div className="avatar-placeholder-large">{getInitial(form.username)}</div>
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
              <label className="form-label">Username *</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Your username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-disabled"
              />
              <span className="form-help">Email cannot be changed</span>
            </div>

            <div className="form-actions">
              <Link to="/settings" className="btn-small secondary">
                Back to Settings
              </Link>
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .profile-page {
          padding: 2rem 0;
        }
        .profile-card {
          max-width: 500px;
          margin: 0 auto;
          background: var(--bg-white);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .profile-card h1 {
          margin-bottom: 0.5rem;
        }
        .input-disabled {
          background: var(--bg-gray-100);
          color: var(--text-muted);
          cursor: not-allowed;
        }
        .success {
          padding: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--success);
          border-radius: 0.5rem;
          color: var(--success);
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}