import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <Link to="/" className="logo">
          <span className="logo-icon">✨</span>
          CharFlow
        </Link>
        
        <div className="nav-links flex items-center gap-4">
          <Link to="/characters">Discover</Link>
          
          {user ? (
            <>
              <Link to="/chats">Chats</Link>
              <Link to="/characters/create">Create</Link>
              <Link to="/settings">Settings</Link>
              <div className="user-menu">
                <Link to="/profile" className="user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="avatar-img" />
                  ) : (
                    <div className="avatar-placeholder-small">{getInitial(user.username)}</div>
                  )}
                </Link>
                <button onClick={handleLogout} className="btn-small secondary">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-small">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          background: var(--bg-white);
          border-bottom: 1px solid var(--border);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--text-primary);
        }
        .logo-icon {
          font-size: 1.25rem;
        }
        .nav-links a:not(.btn-small) {
          color: var(--text-secondary);
          transition: color 0.2s;
        }
        .nav-links a:not(.btn-small):hover {
          color: var(--text-primary);
          text-decoration: none;
        }
        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-placeholder-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
        }
      `}</style>
    </nav>
  );
}