export default function PlayerList({ players, hostId, you, isHost, onKick }) {
  return (
    <ul className="player-list">
      {players.map((p) => (
        <li key={p.id} className="player-row">
          <span className="player-name">
            {p.nickname}
            {p.id === you && <span className="tag">you</span>}
            {p.id === hostId && <span className="tag tag-host">host</span>}
          </span>
          <span className="player-row-actions">
            {!p.connected && <span className="tag tag-warn">offline</span>}
            {!p.connected && isHost && p.id !== hostId && (
              <button className="btn-remove" type="button" onClick={() => onKick(p.id)}>
                Remove
              </button>
            )}
          </span>
        </li>
      ))}
      {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
        <li key={`empty-${i}`} className="player-row player-row-empty">
          Waiting for player…
        </li>
      ))}
    </ul>
  );
}
