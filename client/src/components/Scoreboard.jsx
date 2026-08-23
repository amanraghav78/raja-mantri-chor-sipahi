import RoleCrest from "./RoleCrest.jsx";
import RollingNumber from "./RollingNumber.jsx";

export default function Scoreboard({ players, you }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const top = sorted[0]?.score ?? 0;

  return (
    <ul className="scores">
      {sorted.map((p, i) => {
        const leader = p.score === top && top > 0;
        return (
          <li key={p.id} className={`score-row ${leader ? "score-leader" : ""}`}>
            <span className="score-rank">{i + 1}</span>
            <span className="avatar avatar-sm">{p.avatar}</span>
            <span className="score-name">
              <span>
                {p.nickname}
                {p.id === you ? " (you)" : ""}
              </span>
              {leader && (
                <RoleCrest role="Raja" size={16} className="tone-Raja" aria-label="Leader" />
              )}
            </span>
            <RollingNumber value={p.score} className="score-value" />
          </li>
        );
      })}
    </ul>
  );
}
