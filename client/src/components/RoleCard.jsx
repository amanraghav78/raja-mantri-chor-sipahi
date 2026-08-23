import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { ROLE_CONFIG } from "../roles.js";
import { playFlip, playReveal, vibrate } from "../sound.js";

export default function RoleCard({ myRole }) {
  const [revealed, setRevealed] = useState(false);
  const cfg = ROLE_CONFIG[myRole.role] || {};
  const Icon = cfg.icon;

  // A fresh role means a fresh round — flip the card back face-down.
  useEffect(() => {
    setRevealed(false);
  }, [myRole.role, myRole.raja?.id]);

  function reveal() {
    if (revealed) return;
    playFlip();
    setRevealed(true);
    playReveal();
    vibrate(myRole.role === "Chor" ? [40, 60, 40] : 60);
  }

  return (
    <div className={`role-stage ${revealed ? "role-flip-active" : ""}`}>
      <div className="role-flip-inner">
        <button
          type="button"
          className="role-face role-face-back"
          onClick={reveal}
          aria-label="Tap to reveal your role"
        >
          <div className="role-back-crest">👑</div>
          <div className="role-back-label">Tap to reveal</div>
          <p className="hint" style={{ fontSize: "0.8rem" }}>
            Keep your screen to yourself
          </p>
        </button>

        <div className={`role-face role-face-front ${cfg.className || ""}`}>
          {Icon && (
            <div className="role-icon-ring">
              <Icon size={38} />
            </div>
          )}
          <div className="role-name">{myRole.role}</div>
          <div className="role-translation">{cfg.translation}</div>
          <div className="role-points">{myRole.points} pts</div>
          <p className="role-brief">{cfg.brief}</p>
          <div className="role-raja-line">
            <Crown size={15} style={{ color: "var(--raja)" }} />
            Raja is <strong>{myRole.raja.nickname}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
