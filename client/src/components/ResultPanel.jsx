const ROLE_ORDER = ["Raja", "Mantri", "Sipahi", "Chor"];

export default function ResultPanel({ result, players }) {
  const nameById = Object.fromEntries(players.map((p) => [p.id, p.nickname]));
  const rows = Object.entries(result.roles)
    .map(([id, r]) => ({ id, ...r, points: result.roundPoints[id] }))
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

  return (
    <div className="result-panel">
      <h2 className={`result-headline ${result.correct ? "result-correct" : "result-wrong"}`}>
        {result.correct ? "Sipahi guessed right! 🎯" : "Sipahi guessed wrong! 🙈"}
      </h2>
      <p className="hint">The Chor was {result.chorNickname}.</p>
      <ul className="reveal-list">
        {rows.map((r) => (
          <li key={r.id} className="reveal-row">
            <span className="reveal-role">{r.role}</span>
            <span className="reveal-name">{nameById[r.id] || r.nickname}</span>
            <span className="reveal-points">+{r.points}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
