import { useEffect, useRef, useState } from "react";
import { playTick } from "../sound.js";

const TOTAL_MS = 30000;

export default function GuessTimer({ deadline }) {
  const [remaining, setRemaining] = useState(null);
  const lastTickRef = useRef(null);

  useEffect(() => {
    if (!deadline) {
      setRemaining(null);
      return;
    }
    const tick = () => {
      const ms = Math.max(0, deadline - Date.now());
      const secs = Math.ceil(ms / 1000);
      if (secs <= 5 && secs > 0 && lastTickRef.current !== secs) {
        lastTickRef.current = secs;
        playTick();
      }
      setRemaining(ms);
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [deadline]);

  if (remaining === null) return null;

  const secs = Math.ceil(remaining / 1000);
  const urgent = secs <= 5;
  const pct = Math.max(0, Math.min(100, (remaining / TOTAL_MS) * 100));

  return (
    <div className={`timer ${urgent ? "timer-urgent" : ""}`}>
      <div className="timer-head">{secs > 0 ? `${secs}s to decide` : "Time's up"}</div>
      <div className="timer-track">
        <div className="timer-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
