import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { useToast } from "../components/ToastContainer";
import Spinner from "../components/Spinner";
import Breadcrumbs from "../components/Breadcrumbs";

const BACKEND_URL = "http://localhost:4000";

function MatchDetails({ user }) {
  const { id } = useParams();
  const { showToast } = useToast();

  const [data, setData] = useState(null); // { match, players }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingValues, setRatingValues] = useState({}); // {userId: number}
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin =
    user && data && Number(user.id) === Number(data.match.admin_id);

  const load = async () => {
    if (!id) {
      setError("Invalid match ID");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);
      setData(null); // Reset data before loading
      
      const res = await api.get(`/matches/${id}`);
      
      if (res.data && res.data.match) {
        // Ensure players is always an array
        setData({
          match: res.data.match,
          players: Array.isArray(res.data.players) ? res.data.players : []
        });
      } else {
        console.error("Invalid match data structure:", res.data);
        setError("Match not found or data is invalid");
      }
    } catch (err) {
      console.error("MATCH DETAILS ERROR:", err);
      const errorMessage = err.response?.data?.error || err.message || "Could not load match";
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      load();
    }
    // Only reload when id changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const joinMatch = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/matches/${id}/join`);
      showToast(res.data.message || "Join request sent", "success");
      await load();
    } catch (err) {
      console.log("JOIN ERROR:", err.response?.data || err.message);
      showToast(err.response?.data?.error || "Could not join match", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (playerId, status) => {
    try {
      await api.patch(`/matches/${id}/players/${playerId}`, { status });
      showToast("Status updated", "success");
      await load();
    } catch (err) {
      console.log("STATUS ERROR:", err.response?.data || err.message);
      showToast(err.response?.data?.error || "Could not update status", "error");
    }
  };

  const ratePlayer = async (playerId) => {
    const rating = ratingValues[playerId];
    if (!rating) return;

    try {
      await api.post(`/matches/${id}/rate`, {
        userId: playerId,
        rating: Number(rating),
      });
      showToast("Rating saved", "success");
      setRatingValues((prev) => ({ ...prev, [playerId]: "" }));
    } catch (err) {
      console.log("RATE ERROR:", err.response?.data || err.message);
      showToast(err.response?.data?.error || "Could not save rating", "error");
    }
  };

  const generateLineup = async () => {
    try {
      setActionLoading(true);
      await api.post(`/matches/${id}/auto-lineup`);
      showToast("Teams generated!", "success");
      // Small delay before reloading to avoid race conditions
      setTimeout(() => {
        load();
      }, 500);
    } catch (err) {
      console.log("AUTO LINEUP ERROR:", err.response?.data || err.message);
      showToast(err.response?.data?.error || "Could not generate teams", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="gc-card" style={{ textAlign: 'center', padding: '40px' }}>
        <Spinner size="large" />
        <p style={{ marginTop: 16 }}>Loading match details...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="gc-card">
        <Breadcrumbs items={[{ path: '/dashboard', label: 'Dashboard' }]} />
        <h2>Error</h2>
        <p className="gc-error">{error}</p>
        <Link to="/dashboard" style={{ marginTop: 16, display: 'inline-block' }}>
          <button className="gc-btn-primary">Back to Dashboard</button>
        </Link>
      </div>
    );
  }

  if (!data || !data.match) {
    return (
      <div className="gc-card">
        <Breadcrumbs items={[{ path: '/dashboard', label: 'Dashboard' }]} />
        <h2>Match not found</h2>
        <p className="gc-error">The match you're looking for doesn't exist.</p>
        <Link to="/dashboard" style={{ marginTop: 16, display: 'inline-block' }}>
          <button className="gc-btn-primary">Back to Dashboard</button>
        </Link>
      </div>
    );
  }

  const { match, players = [] } = data;

  const alreadyJoined =
    user && players.some((p) => Number(p.user_id) === Number(user.id));

  const acceptedPlayers = players.filter((p) => p.status === "accepted");
  const playerCount = acceptedPlayers.length;
  const maxPlayers = match.max_players;
  
  const getStatusInfo = () => {
    if (!maxPlayers) return { label: "Open", class: "status-open", spots: "Unlimited" };
    if (playerCount >= maxPlayers) return { label: "Full", class: "status-full", spots: "0 spots left" };
    const spotsLeft = maxPlayers - playerCount;
    if (spotsLeft <= 2) return { label: "Almost full", class: "status-warning", spots: `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left` };
    return { label: "Open", class: "status-open", spots: `${spotsLeft} spots left` };
  };

  const statusInfo = getStatusInfo();

  const breadcrumbs = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: `/matches/${id}`, label: match.title },
  ];

  return (
    <div className="gc-card">
      <Breadcrumbs items={breadcrumbs} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{match.title}</h2>
        <span className={`gc-status-badge ${statusInfo.class}`}>
          {statusInfo.label}
        </span>
      </div>

      {error && <p className="gc-error">{error}</p>}

      <div style={{ marginTop: 10, fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span>📍</span>
          <strong>Location:</strong> {match.location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span>📅</span>
          <strong>Date:</strong> {match.date} {match.time}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span>👤</span>
          <strong>Admin:</strong> {match.admin_name}
        </div>
        {maxPlayers && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span>👥</span>
              <strong>Players:</strong> {playerCount}/{maxPlayers} ({statusInfo.spots})
            </div>
            <div className="gc-progress-bar" style={{ marginLeft: 24, marginTop: 4 }}>
              <div
                className="gc-progress-fill"
                style={{
                  width: `${Math.min((playerCount / maxPlayers) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
        {match.description && (
          <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
            <strong>Description:</strong>
            <p style={{ marginTop: 4, marginBottom: 0, opacity: 0.9 }}>{match.description}</p>
          </div>
        )}
      </div>

      {/* Boutons pour lineup */}
      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: 'wrap' }}>
        {isAdmin && (
          <button 
            type="button" 
            onClick={generateLineup}
            disabled={actionLoading || playerCount < 2}
            style={{ opacity: (actionLoading || playerCount < 2) ? 0.5 : 1 }}
          >
            {actionLoading ? <><Spinner size="small" /> Generating...</> : "Generate teams"}
          </button>
        )}

        {playerCount >= 2 && (
          <Link to={`/matches/${id}/lineup`}>
            <button type="button" className="gc-btn-secondary">
              View lineup
            </button>
          </Link>
        )}
      </div>

      {/* Bouton pour rejoindre */}
      {!isAdmin && user && !alreadyJoined && maxPlayers && playerCount < maxPlayers && (
        <button 
          style={{ marginTop: 12 }} 
          onClick={joinMatch}
          disabled={actionLoading}
        >
          {actionLoading ? <><Spinner size="small" /> Joining...</> : "Join match"}
        </button>
      )}
      
      {!isAdmin && user && !alreadyJoined && !maxPlayers && (
        <button 
          style={{ marginTop: 12 }} 
          onClick={joinMatch}
          disabled={actionLoading}
        >
          {actionLoading ? <><Spinner size="small" /> Joining...</> : "Join match"}
        </button>
      )}

      {!isAdmin && user && alreadyJoined && (
        <div style={{ marginTop: 12, padding: 8, background: 'rgba(51, 255, 153, 0.1)', borderRadius: 8, border: '1px solid rgba(51, 255, 153, 0.3)' }}>
          ✓ You're already in this match
        </div>
      )}

      {maxPlayers && playerCount >= maxPlayers && !alreadyJoined && (
        <div style={{ marginTop: 12, padding: 8, background: 'rgba(255, 107, 107, 0.1)', borderRadius: 8, border: '1px solid rgba(255, 107, 107, 0.3)' }}>
          This match is full
        </div>
      )}

      {/* Liste des joueurs */}
      <div className="gc-players">
        <h3 style={{ marginTop: 20, marginBottom: 12 }}>
          Players ({acceptedPlayers.length} accepted{players.length > acceptedPlayers.length ? `, ${players.length - acceptedPlayers.length} pending` : ''})
        </h3>
        {players.length === 0 && <p>No players yet.</p>}

        {players.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((p) => {
              const avatarUrl = p.avatar_url 
                ? `${BACKEND_URL}${p.avatar_url}` 
                : null;
              
              return (
                <div key={p.id} className="gc-player-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {avatarUrl && (
                      <img 
                        src={avatarUrl} 
                        alt={p.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(255,255,255,0.2)'
                        }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {p.name}
                        {p.user_id === match.admin_id && (
                          <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>(Admin)</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                        {p.real_position && <span>{p.real_position}</span>}
                        {p.real_position && p.level && <span> · </span>}
                        {p.level && <span>Level {p.level}/10</span>}
                      </div>
                    </div>
                    <span 
                      className={`gc-status-badge gc-status-${p.status}`}
                      style={{ marginLeft: 'auto' }}
                    >
                      {p.status}
                    </span>
                  </div>

                  {isAdmin && p.user_id !== match.admin_id && (
                    <div style={{ display: "flex", gap: 4, alignItems: 'center', marginTop: 8 }}>
                      {p.status !== 'accepted' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(p.user_id, "accepted")}
                          className="gc-btn-secondary"
                          title="Accept"
                        >
                          ✓ Accept
                        </button>
                      )}
                      {p.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(p.user_id, "rejected")}
                          className="gc-btn-secondary"
                          title="Reject"
                        >
                          ✕ Reject
                        </button>
                      )}

                      <input
                        style={{ width: 50, padding: '4px 6px' }}
                        placeholder="Rating"
                        type="number"
                        min="1"
                        max="10"
                        value={ratingValues[p.user_id] || ""}
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
                        disabled={!ratingValues[p.user_id]}
                        title="Rate player"
                      >
                        ★ Rate
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchDetails;
