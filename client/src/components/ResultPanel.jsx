import { useEffect } from "react";
import { TimerOff } from "lucide-react";
import { ROLE_CONFIG, ROLE_ORDER } from "../roles.js";
import RoleCrest from "./RoleCrest.jsx";
import { playCorrect, playWrong, vibrate } from "../sound.js";

export default function ResultPanel({ result, round }) {
  const rows = Object.entries(result.roles)
    .map(([id, r]) => ({ id, ...r, points: result.roundPoints[id] }))
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

  useEffect(() => {
    if (result.correct) {
      playCorrect();
      vibrate([30, 40, 30, 40, 70]);
    } else {
      playWrong();
      vibrate(170);
    }
  }, [round, result.correct]);

  return (
    <div className="stack">
      <div className={`verdict ${result.correct ? "verdict-win" : "verdict-lose"}`}>
        <RoleCrest role={result.correct ? "Sipahi" : "Chor"} size={38} />
        <h2 className="verdict-title">{result.correct ? "Chor caught" : "Chor escaped"}</h2>
        <p className="verdict-sub">
          {result.correct ? (
            <>
              {result.sipahiNickname} caught <strong>{result.chorNickname}</strong> red-handed.
            </>
          ) : (
            <>
              {result.sipahiNickname} accused {result.guessedNickname} — the Chor was{" "}
              <strong>{result.chorNickname}</strong>.
            </>
          )}
        </p>
        {result.timedOut && (
          <p className="verdict-sub" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TimerOff size={14} /> Time ran out, so the accusation was random.
          </p>
        )}
      </div>

      <ul className="reveal-list">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className={`reveal-row ${ROLE_CONFIG[r.role].tone}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <RoleCrest role={r.role} size={22} />
            <span className="reveal-role">{r.role}</span>
            <span className="reveal-who">
              <span className="avatar avatar-sm">{r.avatar}</span>
              <span>{r.nickname}</span>
            </span>
            <span className="reveal-pts">+{r.points}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
