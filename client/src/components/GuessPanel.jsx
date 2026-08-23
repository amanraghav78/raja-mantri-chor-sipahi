import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { socket } from "../socket.js";
import { playSelect, vibrate } from "../sound.js";

export default function GuessPanel({ code, candidates, setError }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function pick(id) {
    setSelected(id);
    playSelect();
    vibrate(12);
  }

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
      <div className="locked">
        <Lock size={26} style={{ color: "var(--accent)" }} />
        <p className="hint">
          Accusation sealed<span className="dots" />
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <h2 className="section-title">Name the Chor</h2>
      <div className="suspects">
        {candidates.map((c) => {
          const on = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`suspect ${on ? "suspect-on" : ""}`}
              onClick={() => pick(c.id)}
              aria-pressed={on}
            >
              <span className="avatar avatar-lg">{c.avatar}</span>
              <span className="suspect-name">{c.nickname}</span>
              <span className="suspect-mark">{on ? <CheckCircle2 size={22} /> : null}</span>
            </button>
          );
        })}
      </div>
      <button className="btn btn-gold btn-full" disabled={!selected} onClick={confirm}>
        {selected ? "Seal the accusation" : "Choose a suspect"}
      </button>
    </div>
  );
}
