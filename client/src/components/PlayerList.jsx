import { UserPlus } from "lucide-react";

export default function PlayerList({ players, hostId, you, isHost, onKick }) {
  const emptySeats = Math.max(0, 4 - players.length);

  return (
    <ul className="player-list">
      {players.map((p) => (
        <li key={p.id} className="player-row">
          <div className="player-identity">
            <div className="avatar">{p.avatar}</div>
            <span className="player-name">
              {p.nickname}
              {p.id === you && " (you)"}
            </span>
          </div>
          <div className="player-row-actions">
            {p.id === hostId && <span className="tag tag-host">Host</span>}
            {!p.connected && <span className="tag tag-warn">Offline</span>}
            {!p.connected && isHost && p.id !== you && (
              <button className="btn-remove" type="button" onClick={() => onKick(p.id)}>
                Remove
              </button>
            )}
          </div>
        </li>
      ))}

      {Array.from({ length: emptySeats }).map((_, i) => (
        <li key={`empty-${i}`} className="player-row player-row-empty">
          <UserPlus size={15} style={{ marginRight: 6 }} />
          Waiting for a player
        </li>
      ))}
    </ul>
  );
}
