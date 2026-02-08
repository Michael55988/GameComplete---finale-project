import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import MatchLineUp from "../components/MatchLineUp";
import Breadcrumbs from "../components/Breadcrumbs";
import Spinner from "../components/Spinner";

function MatchLineupPage() {
  const { id } = useParams();
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("A");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/matches/${id}/lineup`);
        setPlayers(res.data.players || []);
      } catch (err) {
        console.log("LINEUP ERROR:", err.response?.data || err.message);
        setError("Could not load lineup");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const teamPlayers = players.filter((p) => p.team === selectedTeam);

  const breadcrumbs = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: `/matches/${id}`, label: `Match #${id}` },
    { path: `/matches/${id}/lineup`, label: 'Lineup' },
  ];

  if (loading) {
    return (
      <div className="gc-card" style={{ textAlign: 'center', padding: '40px' }}>
        <Spinner size="large" />
        <p style={{ marginTop: 16 }}>Loading lineup...</p>
      </div>
    );
  }

  return (
    <div className="gc-card" style={{ maxWidth: 900 }}>
      <Breadcrumbs items={breadcrumbs} />
      <h2>Lineup – Match #{id}</h2>
      {error && <p className="gc-error">{error}</p>}

      {!loading && players.length === 0 && (
        <p style={{ marginTop: 10 }}>
          Pas encore de composition. Demande à l&apos;admin de générer les équipes.
        </p>
      )}

      {players.length > 0 && (
        <>
          <div style={{ margin: "10px 0 16px", display: "flex", gap: 8 }}>
            <button
              type="button"
              className="gc-btn-secondary"
              style={{
                borderColor: selectedTeam === "A" ? "#33ff99" : undefined,
              }}
              onClick={() => setSelectedTeam("A")}
            >
              Team A
            </button>
            <button
              type="button"
              className="gc-btn-secondary"
              style={{
                borderColor: selectedTeam === "B" ? "#33ff99" : undefined,
              }}
              onClick={() => setSelectedTeam("B")}
            >
              Team B
            </button>
          </div>

          <MatchLineUp
            players={teamPlayers}
            teamName={selectedTeam === "A" ? "Team A" : "Team B"}
          />
        </>
      )}
    </div>
  );
}

export default MatchLineupPage;
