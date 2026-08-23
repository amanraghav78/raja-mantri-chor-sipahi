import { useState } from "react";
import { CheckCircle2, Search, Lock } from "lucide-react";
import { socket } from "../socket.js";
import { vibrate } from "../sound.js";

export default function GuessPanel({ code, candidates, setError }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function confirm() {
    if (!selected || submitted) return;
    setSubmitted(true);
    setError("");
    vibrate(40);
    socket.emit("round:guess", { code, targetId: selected }, (res) => {
      if (!res?.ok) {
        setSubmitted(false);
        setError(res?.error || "Could not submit your guess");
      }
    });
  }

  if (submitted) {
    return (
      <div className="locked-in">
        <Lock size={26} style={{ color: "var(--accent)" }} />
        <p className="hint">
          Locked in. Revealing<span className="dots" />
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <h2 className="section-title">
        <Search size={18} /> Who is the Chor?
      </h2>
      <div className="guess-options">
        {candidates.map((c) => {
          const isSelected = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`suspect ${isSelected ? "suspect-selected" : ""}`}
              onClick={() => setSelected(c.id)}
              aria-pressed={isSelected}
            >
              <div className="avatar avatar-lg">{c.avatar}</div>
              <span className="suspect-name">{c.nickname}</span>
              <span className="suspect-check">
                {isSelected ? <CheckCircle2 size={20} /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <button className="btn btn-primary" disabled={!selected} onClick={confirm}>
        {selected ? "Lock in my guess" : "Pick a player"}
      </button>
    </div>
  );
}
