const MEDAL = ["🥇", "🥈", "🥉", "🎖️"];

export default function Podium({ players }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const order = sorted.length >= 3 ? [1, 0, 2, ...sorted.slice(3).map((_, i) => i + 3)] : sorted.map((_, i) => i);

  return (
    <div className="podium">
      {order.map((rank, i) => {
        const p = sorted[rank];
        if (!p) return null;
        const height = rank === 0 ? "podium-first" : rank === 1 ? "podium-second" : rank === 2 ? "podium-third" : "podium-other";
        return (
          <div key={p.id} className={`podium-slot ${height}`} style={{ order: i }}>
            {rank === 0 && <div className="podium-crown">👑</div>}
            <div className="podium-medal">{MEDAL[rank] || "🎮"}</div>
            <div className="podium-name">{p.nickname}</div>
            <div className="podium-score">{p.score}</div>
            <div className="podium-bar" />
          </div>
        );
      })}
    </div>
  );
}
