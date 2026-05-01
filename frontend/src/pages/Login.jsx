import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/characters');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="text-muted">Sign in to continue</p>

        {error && <div className="error alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-muted mt-4">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 2rem;
        }
        .auth-card h1 {
          margin-bottom: 0.5rem;
          text-align: center;
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