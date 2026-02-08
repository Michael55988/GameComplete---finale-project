import "./MatchLineUp.css";

const BACKEND_URL = "http://localhost:4000";

function MatchLineUp({ players, teamName }) {
  return (
    <div className="pitch-wrapper">
      <div className="team-column full">
        <h3>{teamName}</h3>
        <div className="pitch">
          {players.map((p, index) => {
            const cls = `player player-${(p.position || "st-c").toLowerCase()}`;
            const src = p.avatarUrl
              ? `${BACKEND_URL}${p.avatarUrl}`
              : "/default-avatar.png";

            return (
              <div key={index} className={cls}>
                <img src={src} alt={p.name} />
                <span>{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MatchLineUp;
