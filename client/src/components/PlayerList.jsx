import { UserPlus, Bot } from "lucide-react";

export default function PlayerList({ players, hostId, you, isHost, onKick, onAddBot }) {
  const emptySeats = Math.max(0, 4 - players.length);

  return (
    <ul className="player-list">
      {players.map((p) => (
        <li key={p.id} className="player-row">
          <div className="player-identity">
            <span className="avatar">{p.avatar}</span>
            <span className="player-name">
              {p.nickname}
              {p.id === you && " (you)"}
            </span>
          </div>
          <div className="player-actions">
            {p.isBot && (
              <span className="chip chip-bot">
                <Bot size={11} /> Bot
              </span>
            )}
            {p.id === hostId && <span className="chip chip-host">Host</span>}
            {!p.isBot && !p.connected && <span className="chip chip-off">Offline</span>}
            {isHost && p.id !== you && (p.isBot || !p.connected) && (
              <button className="chip-danger" type="button" onClick={() => onKick(p.id)}>
                Remove
              </button>
            )}
          </div>
        </li>
      ))}

      {Array.from({ length: emptySeats }).map((_, i) => (
        <li key={`seat-${i}`} className="player-row player-seat-empty">
          {isHost ? (
            <button className="seat-add" type="button" onClick={onAddBot}>
              <Bot size={16} /> Add a bot
            </button>
          ) : (
            <span className="hint" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UserPlus size={15} /> Waiting for a player
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
