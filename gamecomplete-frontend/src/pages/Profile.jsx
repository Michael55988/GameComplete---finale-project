import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/ToastContainer';
import Spinner from '../components/Spinner';
import Breadcrumbs from '../components/Breadcrumbs';
import './Profile.css';

const BACKEND_URL = 'http://localhost:4000';

function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    position: '',
    level: '',
    location: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchData = async () => {
      try {
        setError('');
        setLoadingRatings(true);
        setLoadingStats(true);
        
        // Fetch ratings and stats separately to handle errors gracefully
        try {
          const ratingsRes = await api.get(`/users/${user.id}/ratings`);
          setRatings(ratingsRes.data || []);
        } catch (err) {
          console.log('RATINGS ERROR:', err.response?.data || err.message);
          setRatings([]);
        }
        
        try {
          const statsRes = await api.get(`/users/${user.id}/stats`);
          setStats(statsRes.data || { matches_played: 0, matches_accepted: 0, avg_rating: null, total_ratings: 0 });
        } catch (err) {
          console.log('STATS ERROR:', err.response?.data || err.message);
          setStats({ matches_played: 0, matches_accepted: 0, avg_rating: null, total_ratings: 0 });
        }
      } catch (err) {
        console.log('PROFILE ERROR:', err.response?.data || err.message);
        setError('Could not load profile data');
      } finally {
        setLoadingRatings(false);
        setLoadingStats(false);
      }
    };

    fetchData();
  }, [user?.id]); // Only depend on user.id, not the whole user object

  useEffect(() => {
    if (user && !isEditing) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        age: user.age || '',
        position: user.position || '',
        level: user.level || '',
        location: user.location || '',
      });
      setAvatarPreview(user.avatar_url ? `${BACKEND_URL}${user.avatar_url}` : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isEditing]); // Only depend on user.id and isEditing to avoid infinite loops

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          data.append(key, value);
        }
      });
      if (avatar) {
        data.append('avatar', avatar);
      }

      const res = await api.patch('/users/me', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update user without causing infinite loop
      if (setUser) {
        setUser(res.data);
      }
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('UPDATE PROFILE ERROR:', err.response?.data || err.message);
      showToast(err.response?.data?.error || 'Could not update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatar(null);
    setAvatarPreview(user.avatar_url ? `${BACKEND_URL}${user.avatar_url}` : null);
  };

  if (!user) {
    return (
      <div className="gc-card" style={{ textAlign: 'center', padding: '40px' }}>
        <Spinner size="large" />
        <p style={{ marginTop: 16 }}>Loading profile...</p>
      </div>
    );
  }

  const average =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
        ).toFixed(1)
      : null;

  const breadcrumbs = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'My Profile' },
  ];

  return (
    <div className="gc-card gc-profile-card">
      <Breadcrumbs items={breadcrumbs} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>My profile</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="gc-btn-secondary">
            Edit Profile
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="gc-profile-avatar-section">
        {avatarPreview ? (
          <img src={avatarPreview} alt={user.name} className="gc-profile-avatar" />
        ) : (
          <div className="gc-profile-avatar-placeholder">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        {isEditing && (
          <label className="gc-avatar-upload-btn">
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            Change Photo
          </label>
        )}
      </div>


      {error && <p className="gc-error">{error}</p>}

      {/* Statistics - Show even if loading */}
      {loadingStats ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spinner size="medium" />
          <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>Loading statistics...</p>
        </div>
      ) : stats && (
        <div className="gc-profile-stats">
          <div className="gc-stat-card">
            <div className="gc-stat-value">{stats.matches_played || 0}</div>
            <div className="gc-stat-label">Matches Played</div>
          </div>
          <div className="gc-stat-card">
            <div className="gc-stat-value">{stats.matches_accepted || 0}</div>
            <div className="gc-stat-label">Accepted</div>
          </div>
          <div className="gc-stat-card">
            <div className="gc-stat-value">
              {stats.avg_rating ? parseFloat(stats.avg_rating).toFixed(1) : 'N/A'}
            </div>
            <div className="gc-stat-label">Avg Rating</div>
          </div>
          <div className="gc-stat-card">
            <div className="gc-stat-value">{stats.total_ratings || 0}</div>
            <div className="gc-stat-label">Total Ratings</div>
          </div>
        </div>
      )}

      {!isEditing ? (
        <div className="gc-profile-info">
          <div className="gc-info-row">
            <span className="gc-info-label">Name:</span>
            <span className="gc-info-value">{user.name}</span>
          </div>
          <div className="gc-info-row">
            <span className="gc-info-label">Email:</span>
            <span className="gc-info-value">{user.email}</span>
          </div>
          {user.phone && (
            <div className="gc-info-row">
              <span className="gc-info-label">Phone:</span>
              <span className="gc-info-value">{user.phone}</span>
            </div>
          )}
          {user.age && (
            <div className="gc-info-row">
              <span className="gc-info-label">Age:</span>
              <span className="gc-info-value">{user.age}</span>
            </div>
          )}
          {user.position && (
            <div className="gc-info-row">
              <span className="gc-info-label">Position:</span>
              <span className="gc-info-value">{user.position}</span>
            </div>
          )}
          {user.level && (
            <div className="gc-info-row">
              <span className="gc-info-label">Level:</span>
              <span className="gc-info-value">{user.level} / 10</span>
            </div>
          )}
          {user.location && (
            <div className="gc-info-row">
              <span className="gc-info-label">Location:</span>
              <span className="gc-info-value">{user.location}</span>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="gc-profile-edit-form">
          <label>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </label>

          <label>
            Age
            <input
              type="number"
              name="age"
              min="12"
              max="60"
              value={form.age}
              onChange={handleChange}
            />
          </label>

          <label>
            Position
            <select name="position" value={form.position} onChange={handleChange}>
              <option value="">Choose...</option>
              <option value="GK">Gardien</option>
              <option value="DEF">Défenseur</option>
              <option value="MID">Milieu</option>
              <option value="ATT">Attaquant</option>
              <option value="WINGER">Ailier</option>
            </select>
          </label>

          <label>
            Level (1-10)
            <input
              type="number"
              name="level"
              min="1"
              max="10"
              value={form.level}
              onChange={handleChange}
            />
          </label>

          <label>
            Location
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </label>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit" disabled={loading}>
              {loading ? <><Spinner size="small" /> Saving...</> : 'Save Changes'}
            </button>
            <button type="button" onClick={handleCancel} className="gc-btn-secondary" disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}


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
