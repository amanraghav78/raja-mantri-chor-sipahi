import { useState } from "react";
import { socket } from "../socket.js";

export default function GuessPanel({ code, candidates, setError }) {
  const [submitted, setSubmitted] = useState(false);

  function guess(targetId) {
    setSubmitted(true);
    setError("");
    socket.emit("round:guess", { code, targetId }, (res) => {
      if (!res?.ok) {
        setSubmitted(false);
        setError(res?.error || "Could not submit guess");
      }
    });
  }

  return (
    <div className="guess-panel">
      <h2 className="section-title">Who is the Chor?</h2>
      <div className="guess-options">
        {candidates.map((c) => (
          <button
            key={c.id}
            className="btn btn-outline guess-btn"
            disabled={submitted}
            onClick={() => guess(c.id)}
            type="button"
          >
            {c.nickname}
          </button>
        ))}
      </div>
      {submitted && <p className="hint">Guess submitted…</p>}
    </div>
  );
}
