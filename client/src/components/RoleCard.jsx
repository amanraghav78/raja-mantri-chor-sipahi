import { useEffect, useState } from "react";
import { ROLE_CONFIG } from "../roles.js";
import RoleCrest from "./RoleCrest.jsx";
import { Mandala } from "./Ornament.jsx";
import { playCoinFlip, playSealStamp, vibrate } from "../sound.js";

export default function RoleCard({ myRole }) {
  const [flipped, setFlipped] = useState(false);
  const cfg = ROLE_CONFIG[myRole.role] || {};

  // A new deal means a new round — put the coin back face-down.
  useEffect(() => {
    setFlipped(false);
  }, [myRole.role, myRole.raja?.id]);

  function flip() {
    if (flipped) return;
    setFlipped(true);
    playCoinFlip();
    vibrate(18);
    // The seal lands as the coin settles, not when it starts spinning.
    window.setTimeout(() => {
      playSealStamp();
      vibrate(myRole.role === "Chor" ? [40, 60, 90] : [30, 40, 70]);
    }, 880);
  }

  return (
    <div className="stack">
      <div className="coin-stage">
        <button
          type="button"
          className={`coin ${flipped ? "coin-flipped" : ""}`}
          onClick={flip}
          aria-label={flipped ? `Your role: ${myRole.role}` : "Tap the seal to reveal your role"}
        >
          <span className="coin-stamp" />

          <span className="coin-face coin-back">
            <Mandala size={216} className="coin-back-mandala" />
            <span className="coin-back-plate">
              <span className="coin-back-label">Tap to reveal</span>
              <span className="coin-back-hint">Keep the screen to yourself</span>
            </span>
          </span>

          <span className={`coin-face coin-front ${cfg.tone || ""}`}>
            <RoleCrest role={myRole.role} size={54} className="coin-crest" />
            <span className="coin-role">{myRole.role}</span>
            <span className="coin-translit">{cfg.translit}</span>
            <span className="coin-points">{myRole.points} pts</span>
          </span>
        </button>
      </div>

      {flipped && (
        <>
          <p className="role-brief">{cfg.brief}</p>
          <div className="raja-callout">
            <RoleCrest role="Raja" size={18} />
            Raja is <strong>{myRole.raja.nickname}</strong>
          </div>
        </>
      )}
    </div>
  );
}
