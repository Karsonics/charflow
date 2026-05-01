import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { charactersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CharacterCard from '../components/CharacterCard';

export default function Characters() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('public');

  useEffect(() => {
    loadCharacters();
  }, [filter]);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const res = await charactersAPI.getAll({ visibility: filter, search });
      setCharacters(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCharacters();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this character?')) return;
    try {
      await charactersAPI.delete(id);
      setCharacters(characters.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="characters-page">
      <div className="container">
        <div className="page-header">
          <h1>Discover Characters</h1>
          <Link to="/characters/create" className="btn-small">
            Create Character
          </Link>
        </div>

        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search characters..."
          />
          <button type="submit" className="btn-small">Search</button>
        </form>

        <div className="filters">
          <button
            className={`btn-small ${filter === 'public' ? '' : 'secondary'}`}
            onClick={() => setFilter('public')}
          >
            Public
          </button>
          <button
            className={`btn-small ${filter === 'private' ? '' : 'secondary'}`}
            onClick={() => setFilter('private')}
          >
            My Characters
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : characters.length === 0 ? (
          <div className="empty-state">
            <p>No characters found.</p>
            <Link to="/characters/create">Create the first one!</Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {characters.map(char => (
              <div key={char.id} className="character-item">
                <CharacterCard character={char} onDelete={handleDelete} />
                {user?.id === char.creator_id && (
                  <div className="character-actions">
                    <Link
                      to={`/characters/${char.id}/edit`}
                      className="btn-small secondary"
                    >
                      Edit
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .characters-page {
          padding: 2rem 0;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .page-header h1 {
          margin: 0;
        }
        .search-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .search-bar input {
          flex: 1;
        }
        .filters {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 0;
        }
        .empty-state p {
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }
        .character-item {
          position: relative;
        }
        .character-actions {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}