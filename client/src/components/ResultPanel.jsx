import { useEffect } from "react";
import { PartyPopper, XCircle, TimerOff } from "lucide-react";
import { ROLE_CONFIG, ROLE_ORDER } from "../roles.js";
import { playCorrect, playWrong, vibrate } from "../sound.js";

export default function ResultPanel({ result, round }) {
  const rows = Object.entries(result.roles)
    .map(([id, r]) => ({ id, ...r, points: result.roundPoints[id] }))
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

  useEffect(() => {
    if (result.correct) {
      playCorrect();
      vibrate([30, 40, 30, 40, 60]);
    } else {
      playWrong();
      vibrate(160);
    }
  }, [round, result.correct]);

  return (
    <div className="stack">
      <div className={`result-banner ${result.correct ? "result-correct" : "result-wrong"}`}>
        {result.correct ? <PartyPopper size={30} /> : <XCircle size={30} />}
        <h2 className="result-headline">
          {result.correct ? "The Chor is caught!" : "The Chor got away!"}
        </h2>
        <p className="result-sub">
          {result.correct ? (
            <>
              {result.sipahiNickname} caught <strong>{result.chorNickname}</strong> red-handed.
            </>
          ) : (
            <>
              {result.sipahiNickname} picked {result.guessedNickname} — the Chor was{" "}
              <strong>{result.chorNickname}</strong>.
            </>
          )}
        </p>
        {result.timedOut && (
          <p className="result-sub" style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 6 }}>
            <TimerOff size={15} /> Time ran out, so the pick was random.
          </p>
        )}
      </div>

      <ul className="reveal-list">
        {rows.map((r, i) => {
          const cfg = ROLE_CONFIG[r.role];
          const Icon = cfg.icon;
          return (
            <li
              key={r.id}
              className={`reveal-row ${cfg.className}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <Icon size={18} />
              <span className="reveal-role">{r.role}</span>
              <span className="reveal-name">
                {r.avatar} {r.nickname}
              </span>
              <span className="reveal-points">+{r.points}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
