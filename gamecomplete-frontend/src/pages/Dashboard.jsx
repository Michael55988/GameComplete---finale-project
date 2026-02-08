import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Spinner from '../components/Spinner';

function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'players', 'title'

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await api.get('/matches');
        setMatches(res.data);
      } catch (err) {
        console.log('DASHBOARD ERROR:', err.response?.data || err.message);
        setError('Could not load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Get unique locations for filter
  const locations = useMemo(() => {
    const locs = matches
      .map((m) => m.location)
      .filter((loc, index, self) => loc && self.indexOf(loc) === index)
      .sort();
    return locs;
  }, [matches]);

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let filtered = [...matches];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title?.toLowerCase().includes(term) ||
          m.location?.toLowerCase().includes(term) ||
          m.admin_name?.toLowerCase().includes(term)
      );
    }

    // Location filter
    if (filterLocation) {
      filtered = filtered.filter((m) => m.location === filterLocation);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
        case 'players':
          return (b.player_count || 0) - (a.player_count || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [matches, searchTerm, filterLocation, sortBy]);

  const getMatchStatus = (match) => {
    const playerCount = match.player_count || 0;
    const maxPlayers = match.max_players;
    
    if (!maxPlayers) return { label: 'Open', class: 'status-open' };
    if (playerCount >= maxPlayers) return { label: 'Full', class: 'status-full' };
    if (playerCount >= maxPlayers * 0.8) return { label: 'Almost full', class: 'status-warning' };
    return { label: 'Open', class: 'status-open' };
  };

  if (loading) {
    return (
      <div className="gc-card" style={{ textAlign: 'center', padding: '40px' }}>
        <Spinner size="large" />
        <p style={{ marginTop: 16 }}>Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="gc-card">
      <h2>Upcoming games</h2>
      {error && <p className="gc-error">{error}</p>}

      {/* Search and Filters */}
      <div className="gc-dashboard-controls">
        <div className="gc-search-box">
          <input
            type="text"
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="gc-search-input"
          />
        </div>

        <div className="gc-filters">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="gc-filter-select"
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="gc-filter-select"
          >
            <option value="date">Sort by date</option>
            <option value="players">Sort by players</option>
            <option value="title">Sort by title</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8, marginBottom: 12 }}>
        {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''} found
      </p>

      {filteredMatches.length === 0 && (
        <p style={{ marginTop: 10, textAlign: 'center', opacity: 0.7 }}>
          {searchTerm || filterLocation ? 'No matches match your filters.' : 'No games yet.'}
        </p>
      )}

      <div className="gc-list">
        {filteredMatches.map((m) => {
          const status = getMatchStatus(m);
          const playerCount = m.player_count || 0;
          const maxPlayers = m.max_players;

          return (
            <div key={m.id} className="gc-match">
              <div className="gc-match-header">
                <div>
                  <strong>{m.title}</strong>
                  <span className={`gc-status-badge ${status.class}`}>
                    {status.label}
                  </span>
                </div>
                <span className="gc-badge">
                  {m.date} – {m.time}
                </span>
              </div>
              <div style={{ marginTop: 4 }}>
                📍 {m.location} · 👤 {m.admin_name}
              </div>
              {maxPlayers && (
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  👥 {playerCount}/{maxPlayers} players
                  <div className="gc-progress-bar">
                    <div
                      className="gc-progress-fill"
                      style={{
                        width: `${Math.min((playerCount / maxPlayers) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <div style={{ marginTop: 10 }}>
                <Link to={`/matches/${m.id}`}>
                  <button className="gc-btn-primary" type="button">
                    View match
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
