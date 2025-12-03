import { useEffect, useState } from 'react';
import api from '../api';

function Profile({ user }) {
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchRatings = async () => {
      try {
        setError('');
        setLoadingRatings(true);
        const res = await api.get(`/users/${user.id}/ratings`);
        setRatings(res.data);
      } catch (err) {
        console.log('PROFILE RATINGS ERROR:', err.response?.data || err.message);
        setError('Could not load ratings');
      } finally {
        setLoadingRatings(false);
      }
    };

    fetchRatings();
  }, [user]);

  if (!user) {
    return <div className="gc-card">Loading profile...</div>;
  }

  const average =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
        ).toFixed(1)
      : null;

  return (
    <div className="gc-card">
      <h2>My profile</h2>

      <div style={{ marginTop: 12, marginBottom: 16, fontSize: 14 }}>
        <p>
          <strong>Name:</strong> {user.firstname} {user.lastname}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        {user.age && (
          <p>
            <strong>Age:</strong> {user.age}
          </p>
        )}
        {user.position && (
          <p>
            <strong>Position:</strong> {user.position}
          </p>
        )}
        {user.level && (
          <p>
            <strong>Level:</strong> {user.level} / 10
          </p>
        )}
        {user.location && (
          <p>
            <strong>Location:</strong> {user.location}
          </p>
        )}
      </div>

      <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

      <h3 style={{ fontSize: 16, marginBottom: 8 }}>Ratings</h3>

      {average && (
        <p style={{ fontSize: 14, marginBottom: 8 }}>
          <strong>Average rating:</strong> {average} / 10 ({ratings.length}{' '}
          rating{ratings.length > 1 ? 's' : ''})
        </p>
      )}

      {!average && !loadingRatings && (
        <p style={{ fontSize: 14, marginBottom: 8 }}>
          You haven&apos;t received any rating yet.
        </p>
      )}

      {error && <p className="gc-error">{error}</p>}
      {loadingRatings && <p>Loading ratings...</p>}

      {!loadingRatings && ratings.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {ratings.map((r, index) => (
            <div
              key={index}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                fontSize: 13,
              }}
            >
              <div>
                <strong>{r.match_title || 'Match'}</strong>
              </div>
              <div>
                Rating: <strong>{r.rating}/10</strong>
                {r.comment && <> — “{r.comment}”</>}
              </div>
              {r.created_at && (
                <div style={{ opacity: 0.6, marginTop: 2 }}>{r.created_at}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
