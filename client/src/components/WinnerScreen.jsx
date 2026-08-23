import { useEffect } from "react";
import Scoreboard from "./Scoreboard.jsx";
import { Mandala } from "./Ornament.jsx";
import { playWinner, vibrate } from "../sound.js";

// 2nd on the left, 1st centre, 3rd on the right.
const LAYOUT = [1, 0, 2];

export default function WinnerScreen({ players, you }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const tied = sorted.filter((p) => p.score === winner?.score);

  useEffect(() => {
    playWinner();
    vibrate([60, 50, 60, 50, 130]);
  }, []);

  return (
    <div className="stack-5">
      <div className="winner">
        <span className="eyebrow">{tied.length > 1 ? "A shared crown" : "Winner"}</span>
        <div className="winner-medal">
          <Mandala size={104} className="winner-medal-mandala" />
          <span className="winner-medal-emoji">{winner?.avatar}</span>
        </div>
        <div className="winner-name metal-text">
          {tied.length > 1 ? tied.map((p) => p.nickname).join(" & ") : winner?.nickname}
        </div>
        <div className="winner-score">{winner?.score} points</div>
      </div>

      <div className="podium">
        {LAYOUT.map((rank) => {
          const p = sorted[rank];
          if (!p) return null;
          return (
            <div key={p.id} className={`podium-slot podium-${rank + 1}`}>
              <span className="avatar">{p.avatar}</span>
              <span className="podium-name">{p.nickname}</span>
              <span className="podium-score">{p.score}</span>
              <div className="podium-bar" style={{ animationDelay: `${rank * 130}ms` }}>
                {rank + 1}
              </div>
            </div>
          );
        })}
      </div>

      <div className="stack">
        <h2 className="section-title">Final standings</h2>
        <Scoreboard players={players} you={you} />
      </div>
    </div>
  );
}
