import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function MatchDetails({ user }) {
  const { id } = useParams();
  const [data, setData] = useState(null); // { match, players }
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ratingValues, setRatingValues] = useState({}); // {userId: number}

  const isAdmin =
    user && data && Number(user.id) === Number(data.match.admin_id);

  const load = async () => {
    try {
      setError('');
      setMessage('');
      setLoading(true);
      const res = await api.get(`/matches/${id}`);
      setData(res.data);
    } catch (err) {
      console.log('MATCH DETAILS ERROR:', err.response?.data || err.message);
      setError('Could not load match');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const joinMatch = async () => {
    try {
      setMessage('');
      const res = await api.post(`/matches/${id}/join`);
      setMessage(res.data.message || 'Join request sent');
      await load();
    } catch (err) {
      console.log('JOIN ERROR:', err.response?.data || err.message);
      setMessage(err.response?.data?.error || 'Could not join match');
    }
  };

  const updateStatus = async (playerId, status) => {
    try {
      setMessage('');
      await api.patch(`/matches/${id}/players/${playerId}`, { status });
      setMessage('Status updated');
      await load();
    } catch (err) {
      console.log('STATUS ERROR:', err.response?.data || err.message);
      setMessage(err.response?.data?.error || 'Could not update status');
    }
  };

  const ratePlayer = async (playerId) => {
    const rating = ratingValues[playerId];
    if (!rating) return;

    try {
      setMessage('');
      await api.post(`/matches/${id}/rate`, {
        userId: playerId,
        rating: Number(rating),
      });
      setMessage('Rating saved');
      setRatingValues((prev) => ({ ...prev, [playerId]: '' }));
    } catch (err) {
      console.log('RATE ERROR:', err.response?.data || err.message);
      setMessage(err.response?.data?.error || 'Could not save rating');
    }
  };

  if (loading || !data) {
    return <div className="gc-card">Loading...</div>;
  }

  const { match, players } = data;

  const alreadyJoined =
    user &&
    players.some((p) => Number(p.user_id) === Number(user.id));

  return (
    <div className="gc-card">
      <h2>{match.title}</h2>

      {error && <p className="gc-error">{error}</p>}
      {message && <p style={{ marginTop: 6 }}>{message}</p>}

      <div style={{ marginTop: 10, fontSize: 14 }}>
        <p>
          <strong>Location:</strong> {match.location}
        </p>
        <p>
          <strong>Date:</strong> {match.date} {match.time}
        </p>
        <p>
          <strong>Admin:</strong> {match.admin_name}
        </p>
        <p>
          <strong>Max players:</strong> {match.max_players}
        </p>
        {match.description && (
          <p>
            <strong>Description:</strong> {match.description}
          </p>
        )}
      </div>

      {!isAdmin && user && !alreadyJoined && (
        <button style={{ marginTop: 12 }} onClick={joinMatch}>
          Join match
        </button>
      )}

      <div className="gc-players">
        <h3 style={{ marginTop: 16, marginBottom: 6 }}>Players</h3>
        {players.length === 0 && <p>No players yet.</p>}
        {players.map((p) => (
          <div key={p.id} className="gc-player-row">
            <div>
              {p.firstname} {p.lastname} · {p.position} · lvl {p.level}
              <span style={{ marginLeft: 8, opacity: 0.8 }}>
                ({p.status})
              </span>
            </div>

            {isAdmin && p.user_id !== match.admin_id && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => updateStatus(p.user_id, 'accepted')}
                  className="gc-btn-secondary"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(p.user_id, 'rejected')}
                  className="gc-btn-secondary"
                >
                  ✕
                </button>

                <input
                  style={{ width: 50 }}
                  placeholder="note"
                  type="number"
                  min="1"
                  max="10"
                  value={ratingValues[p.user_id] || ''}
                  onChange={(e) =>
                    setRatingValues((prev) => ({
                      ...prev,
                      [p.user_id]: e.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() => ratePlayer(p.user_id)}
                  className="gc-btn-secondary"
                >
                  ★
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchDetails;
