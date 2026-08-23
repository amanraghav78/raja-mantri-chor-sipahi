import { useEffect } from "react";
import Scoreboard from "./Scoreboard.jsx";
import { playWinner, vibrate } from "../sound.js";

// Visual podium order puts 2nd on the left, 1st in the middle, 3rd on the right.
const PODIUM_LAYOUT = [1, 0, 2];

export default function WinnerScreen({ players, you }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const tied = sorted.filter((p) => p.score === winner?.score);

  useEffect(() => {
    playWinner();
    vibrate([60, 50, 60, 50, 120]);
  }, []);

  return (
    <div className="stack">
      <div className="winner">
        <span className="winner-label">{tied.length > 1 ? "It's a tie" : "Winner"}</span>
        <div className="winner-crown">👑</div>
        <div className="winner-name">
          {tied.length > 1 ? tied.map((p) => p.nickname).join(" & ") : winner?.nickname}
        </div>
        <div className="winner-score">{winner?.score} points</div>
      </div>

      <div className="podium">
        {PODIUM_LAYOUT.map((rank) => {
          const p = sorted[rank];
          if (!p) return null;
          return (
            <div key={p.id} className={`podium-slot podium-${rank + 1}`}>
              <div className="avatar">{p.avatar}</div>
              <div className="podium-name">{p.nickname}</div>
              <div className="podium-score">{p.score}</div>
              <div className="podium-bar" style={{ animationDelay: `${rank * 120}ms` }}>
                {rank + 1}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Final scores</h2>
      <Scoreboard players={players} you={you} />
    </div>
  );
}
