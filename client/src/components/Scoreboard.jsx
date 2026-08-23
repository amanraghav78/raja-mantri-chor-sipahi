export default function Scoreboard({ players }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <ul className="scoreboard">
      {sorted.map((p, i) => (
        <li key={p.id} className="score-row">
          <span className="score-rank">#{i + 1}</span>
          <span className="score-name">{p.nickname}</span>
          <span className="score-value">{p.score}</span>
        </li>
      ))}
    </ul>
  );
}
