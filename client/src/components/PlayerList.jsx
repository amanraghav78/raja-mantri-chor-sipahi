import { UserPlus, Bot } from "lucide-react";

export default function PlayerList({ players, hostId, you, isHost, onKick, onAddBot }) {
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
            {p.isBot && (
              <span className="tag tag-bot">
                <Bot size={11} /> Bot
              </span>
            )}
            {p.id === hostId && <span className="tag tag-host">Host</span>}
            {!p.isBot && !p.connected && <span className="tag tag-warn">Offline</span>}
            {isHost && p.id !== you && (p.isBot || !p.connected) && (
              <button className="btn-remove" type="button" onClick={() => onKick(p.id)}>
                Remove
              </button>
            )}
          </div>
        </li>
      ))}

      {Array.from({ length: emptySeats }).map((_, i) =>
        isHost ? (
          <li key={`empty-${i}`} className="player-row player-row-empty">
            <button className="seat-add" type="button" onClick={onAddBot}>
              <Bot size={15} /> Add a bot
            </button>
          </li>
        ) : (
          <li key={`empty-${i}`} className="player-row player-row-empty">
            <UserPlus size={15} style={{ marginRight: 6 }} />
            Waiting for a player
          </li>
        )
      )}
    </ul>
  );
}
