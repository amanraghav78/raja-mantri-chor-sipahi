import { useEffect, useState } from "react";
import { playTick } from "../sound.js";

export default function GuessTimer({ deadline }) {
  const [remaining, setRemaining] = useState(() =>
    deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) : null
  );

  useEffect(() => {
    if (!deadline) {
      setRemaining(null);
      return;
    }
    const tick = () => {
      const secs = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining((prev) => {
        if (secs <= 5 && secs > 0 && secs !== prev) playTick();
        return secs;
      });
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [deadline]);

  if (remaining === null) return null;

  return (
    <div className={`guess-timer ${remaining <= 5 ? "guess-timer-urgent" : ""}`}>
      {remaining > 0 ? `${remaining}s left` : "Time's up…"}
    </div>
  );
}
