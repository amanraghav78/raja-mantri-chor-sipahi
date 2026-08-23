import { Crown } from "lucide-react";

export default function Scoreboard({ players, you }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const top = sorted[0]?.score ?? 0;

  return (
    <ul className="scoreboard">
      {sorted.map((p, i) => {
        const isLeader = p.score === top && top > 0;
        return (
          <li key={p.id} className={`score-row ${isLeader ? "score-leader" : ""}`}>
            <span className="score-rank">{i + 1}</span>
            <div className="avatar" style={{ width: 30, height: 30, fontSize: "0.95rem" }}>
              {p.avatar}
            </div>
            <span className="score-name">
              <span>
                {p.nickname}
                {p.id === you ? " (you)" : ""}
              </span>
              {isLeader && <Crown size={15} className="score-crown" />}
            </span>
            <span className="score-value">{p.score}</span>
          </li>
        );
      })}
    </ul>
  );
}
