import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { charactersAPI } from '../services/api';
import CharacterCard from '../components/CharacterCard';

export default function Home() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    charactersAPI.getAll({ visibility: 'public' })
      .then(res => setCharacters(res.data.slice(0, 6)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Chat with AI Characters</h1>
          <p className="hero-subtitle">
            Create, discover, and interact with AI-powered characters for roleplay, storytelling, and conversation.
          </p>
          
          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/characters" className="btn-large">Discover Characters</Link>
                <Link to="/characters/create" className="btn-large secondary">Create Character</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-large">Get Started</Link>
                <Link to="/login" className="btn-large secondary">Login</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="container">
          <h2>Popular Characters</h2>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : characters.length === 0 ? (
            <p className="text-muted text-center">No characters yet. Be the first to create one!</p>
          ) : (
            <div className="grid grid-3">
              {characters.map(char => (
                <CharacterCard key={char.id} character={char} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/characters" className="btn-small secondary">
              Browse All Characters →
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .hero {
          padding: 4rem 0;
          text-align: center;
          background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-dark) 100%);
        }
        .hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 2rem;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }
        .featured {
          padding: 4rem 0;
        }
        .featured h2 {
          text-align: center;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
}