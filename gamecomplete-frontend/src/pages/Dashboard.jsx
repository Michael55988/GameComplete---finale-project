import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setError('');
        const res = await api.get('/matches');
        setMatches(res.data);
      } catch (err) {
        console.log('DASHBOARD ERROR:', err.response?.data || err.message);
        setError('Could not load matches');
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="gc-card">
      <h2>Upcoming games</h2>
      {error && <p className="gc-error">{error}</p>}

      {matches.length === 0 && <p style={{ marginTop: 10 }}>No games yet.</p>}

      <div className="gc-list">
        {matches.map((m) => (
          <div key={m.id} className="gc-match">
            <div className="gc-match-header">
              <strong>{m.title}</strong>
              <span className="gc-badge">
                {m.date} – {m.time}
              </span>
            </div>
            <div>
              {m.location} · admin: {m.admin_name}
            </div>
            <div style={{ marginTop: 6 }}>
              <Link to={`/matches/${m.id}`}>
                <button className="gc-btn-primary" type="button">
                  View match
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
