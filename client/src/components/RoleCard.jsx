import { useEffect, useState } from "react";
import { playReveal, vibrate } from "../sound.js";

const ROLE_META = {
  Raja: { emoji: "👑", color: "role-raja" },
  Mantri: { emoji: "🧠", color: "role-mantri" },
  Sipahi: { emoji: "🛡️", color: "role-sipahi" },
  Chor: { emoji: "🥷", color: "role-chor" },
};

export default function RoleCard({ myRole }) {
  const [flipped, setFlipped] = useState(false);
  const meta = ROLE_META[myRole.role] || {};

  useEffect(() => {
    setFlipped(false);
    playReveal();
    vibrate(myRole.role === "Chor" ? [40, 60, 40] : 60);
    const t = setTimeout(() => setFlipped(true), 120);
    return () => clearTimeout(t);
  }, [myRole.role]);

  return (
    <div className={`role-flip ${flipped ? "role-flip-active" : ""}`}>
      <div className="role-flip-inner">
        <div className="role-card role-card-back">
          <div className="role-back-mark">?</div>
        </div>
        <div className={`role-card role-card-front ${meta.color || ""}`}>
          <div className="role-emoji">{meta.emoji}</div>
          <div className="role-name">{myRole.role}</div>
          <div className="role-points">{myRole.points} pts</div>
          <div className="role-raja-line">
            👑 Raja is <strong>{myRole.raja.nickname}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
